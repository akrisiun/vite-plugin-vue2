'use strict'
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k]
          },
        })
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k
        o[k2] = m[k]
      })
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v })
      }
    : function (o, v) {
        o['default'] = v
      })
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k)
    __setModuleDefault(result, mod)
    return result
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.vuePlugin = exports.setVueCompilerOptions = exports.vueHotReload = exports.vueComponentNormalizer = void 0
const component_compiler_utils_1 = require('@vue/component-compiler-utils')
const fs = __importStar(require('fs-extra'))
const hash_sum_1 = __importDefault(require('hash-sum'))
const esbuildService_1 = require('./esbuildService')
const componentNormalizer_1 = require('./componentNormalizer')
const vueHotReload_1 = require('./vueHotReload')
const path_1 = __importDefault(require('path'))
const serverPluginModuleRewrite_1 = require('vite/dist/node/server/serverPluginModuleRewrite')
const utils_1 = require('vite/dist/node/utils')
const serverPluginHmr_1 = require('vite/dist/node/server/serverPluginHmr')
const serverPluginVue_1 = require('vite/dist/node/server/serverPluginVue')
const serverPluginClient_1 = require('vite/dist/node/server/serverPluginClient')
const serverPluginSourceMap_1 = require('vite/dist/node/server/serverPluginSourceMap')
const compiler_sfc_1 = require('@vue/compiler-sfc')
const vueTemplateCompiler = require('vue-template-compiler')
exports.vueComponentNormalizer = '/vite/vueComponentNormalizer'
exports.vueHotReload = '/vite/vueHotReload'
let vueCompilerOptions = null
function setVueCompilerOptions(opts) {
  vueCompilerOptions = opts
}
exports.setVueCompilerOptions = setVueCompilerOptions
exports.vuePlugin = ({ root, app, resolver, watcher, config }) => {
  app.use(async (ctx, next) => {
    if (ctx.path === serverPluginClient_1.clientPublicPath) {
      await next()
      ctx.type = 'js'
      ctx.body = ctx.body.replace(
        /__VUE_HMR_RUNTIME__\.rerender\(path, (.+)\)/g,
        '__VUE_HMR_RUNTIME__.rerender(path, m)'
      )
      return
    }
    if (ctx.path === exports.vueHotReload) {
      ctx.type = 'js'
      ctx.body = vueHotReload_1.vueHotReloadCode
      return
    }
    if (ctx.path === exports.vueComponentNormalizer) {
      ctx.type = 'js'
      ctx.body = componentNormalizer_1.normalizeComponentCode
      return
    }
    if (!ctx.path.endsWith('.vue') && !ctx.vue) {
      return next()
    }
    const query = ctx.query
    const publicPath = ctx.path
    let filePath = resolver.requestToFile(publicPath)
    const source = readFile(filePath)
    const descriptor = component_compiler_utils_1.parse({
      source,
      compiler: vueTemplateCompiler,
      filename: filePath,
      sourceRoot: root,
      needMap: true,
    })
    if (!descriptor) {
      return
    }
    if (!query.type) {
      await next()
      ctx.type = 'js'
      ctx.body = await parseSFC(
        root,
        filePath,
        publicPath,
        descriptor,
        resolver
      )
      if (descriptor.script) {
        ctx.map = descriptor.script.map
      }
      return
    }
    if (query.type === 'template') {
      const templateBlock = descriptor.template
      if (templateBlock && templateBlock.src) {
        filePath = await resolveSrcImport(root, templateBlock, ctx, resolver)
      }
      ctx.type = 'js'
      ctx.body = compileSFCTemplate(templateBlock, filePath, publicPath)
      return
    }
    if (query.type === 'style') {
      return next()
    }
  })
}
function readFile(filePath) {
  return fs.readFileSync(filePath).toString()
}
async function parseSFC(root, filePath, publicPath, descriptor, resolver) {
  const hasFunctional =
    descriptor.template && descriptor.template.attrs.functional
  const id = hash_sum_1.default(publicPath)
  let templateImport = `var render, staticRenderFns`
  if (descriptor.template) {
    templateImport = `import { render, staticRenderFns } from "${publicPath}?type=template"`
  }
  let scriptImport = `var script = {}`
  if (descriptor.script) {
    const scriptBlock = descriptor.script
    let code = scriptBlock.content
    if (scriptBlock && scriptBlock.src) {
      const srcPath = serverPluginModuleRewrite_1.resolveImport(
        root,
        publicPath,
        scriptBlock.src,
        resolver
      )
      code = readFile(resolver.requestToFile(srcPath))
    }
    if (scriptBlock.lang === 'ts') {
      const res = await esbuildService_1.transform(code, publicPath, {
        loader: 'ts',
      })
      code = res.code
      scriptBlock.map = serverPluginSourceMap_1.mergeSourceMap(
        scriptBlock.map,
        JSON.parse(res.map)
      )
    }
    scriptImport = compiler_sfc_1.rewriteDefault(code, 'script')
  }
  let stylesCode = ``
  let hasScoped
  if (descriptor.styles.length) {
    descriptor.styles.forEach((s, i) => {
      const styleRequest = publicPath + `?type=style&index=${i}`
      if (s.scoped) hasScoped = true
      if (s.module) {
        const styleVar = `__style${i}`
        const moduleName = typeof s.module === 'string' ? s.module : '$style'
        stylesCode += `\nimport ${styleVar} from ${JSON.stringify(
          styleRequest + '&module'
        )}`
        stylesCode += `\n__cssModules[${JSON.stringify(
          moduleName
        )}] = ${styleVar}`
      } else {
        stylesCode += `\nimport ${JSON.stringify(styleRequest)}`
      }
    })
  }
  let code =
    `
${templateImport}
${scriptImport}
const __cssModules = {}
${stylesCode}
/* normalize component */
import normalizer from "${exports.vueComponentNormalizer}"
var component = normalizer(
  script,
  render,
  staticRenderFns,
  ${hasFunctional ? `true` : `false`},
  injectStyles,
  ${hasScoped ? JSON.stringify(id) : `null`},
  null,
  null
)
  `.trim() + `\n`
  code += `
function injectStyles (context) {
  for(let o in __cssModules){
    this[o] = __cssModules[o]
  }
}  
  `
  code += `
/* hot reload */
import __VUE_HMR_RUNTIME__ from "${exports.vueHotReload}"
import vue from "vue"
if (import.meta.hot) {
	__VUE_HMR_RUNTIME__.install(vue)
	if(__VUE_HMR_RUNTIME__.compatible){
		 if (!__VUE_HMR_RUNTIME__.isRecorded('${publicPath}')) {
			 __VUE_HMR_RUNTIME__.createRecord('${publicPath}', component.options)
		 }
	} else {
			console.log("The hmr is not compatible.")
	}
}`
  code += `\nexport default component.exports`
  return code
}
function compileSFCTemplate(block, filePath, publicPath) {
  const { tips, errors, code } = component_compiler_utils_1.compileTemplate({
    source: block.content,
    filename: filePath,
    compiler: vueTemplateCompiler,
    transformAssetUrls: true,
    transformAssetUrlsOptions: {
      base: path_1.default.posix.dirname(publicPath),
    },
    isProduction: process.env.NODE_ENV === 'production',
    isFunctional: !!block.attrs.functional,
    optimizeSSR: false,
    prettify: false,
    ...vueCompilerOptions,
  })
  if (tips) {
    tips.forEach(console.warn)
  }
  if (errors) {
    errors.forEach(console.error)
  }
  return code + `\nexport { render, staticRenderFns }`
}
async function resolveSrcImport(root, block, ctx, resolver) {
  const importer = ctx.path
  const importee = utils_1.cleanUrl(
    serverPluginModuleRewrite_1.resolveImport(
      root,
      importer,
      block.src,
      resolver
    )
  )
  const filePath = resolver.requestToFile(importee)
  block.content = (await ctx.read(filePath)).toString()
  serverPluginHmr_1
    .ensureMapEntry(serverPluginHmr_1.importerMap, importee)
    .add(ctx.path)
  serverPluginVue_1.srcImportMap.set(filePath, ctx.url)
  return filePath
}
//# sourceMappingURL=serverPlugin.js.map
