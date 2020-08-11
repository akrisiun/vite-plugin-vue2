'use strict'

Object.defineProperty(exports, '__esModule', { value: true })

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

var componentCompilerUtils = require('@vue/component-compiler-utils')
var fs = require('fs-extra')
var hash_sum = _interopDefault(require('hash-sum'))
var path = _interopDefault(require('path'))
var chalk = _interopDefault(require('chalk'))
var esbuild = require('esbuild')
var serverPluginModuleRewrite = require('vite/dist/node/server/serverPluginModuleRewrite')
var utils = require('vite/dist/node/utils')
var serverPluginHmr = require('vite/dist/node/server/serverPluginHmr')
var serverPluginVue = require('vite/dist/node/server/serverPluginVue')
var serverPluginClient = require('vite/dist/node/server/serverPluginClient')
var serverPluginSourceMap = require('vite/dist/node/server/serverPluginSourceMap')
var compilerSfc = require('@vue/compiler-sfc')

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function () {
  __assign =
    Object.assign ||
    function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i]
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p]
      }
      return t
    }
  return __assign.apply(this, arguments)
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P
      ? value
      : new P(function (resolve) {
          resolve(value)
        })
  }
  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value))
      } catch (e) {
        reject(e)
      }
    }
    function rejected(value) {
      try {
        step(generator['throw'](value))
      } catch (e) {
        reject(e)
      }
    }
    function step(result) {
      result.done
        ? resolve(result.value)
        : adopt(result.value).then(fulfilled, rejected)
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next())
  })
}

function __generator(thisArg, body) {
  var _ = {
      label: 0,
      sent: function () {
        if (t[0] & 1) throw t[1]
        return t[1]
      },
      trys: [],
      ops: [],
    },
    f,
    y,
    t,
    g
  return (
    (g = { next: verb(0), throw: verb(1), return: verb(2) }),
    typeof Symbol === 'function' &&
      (g[Symbol.iterator] = function () {
        return this
      }),
    g
  )
  function verb(n) {
    return function (v) {
      return step([n, v])
    }
  }
  function step(op) {
    if (f) throw new TypeError('Generator is already executing.')
    while (_)
      try {
        if (
          ((f = 1),
          y &&
            (t =
              op[0] & 2
                ? y['return']
                : op[0]
                ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                : y.next) &&
            !(t = t.call(y, op[1])).done)
        )
          return t
        if (((y = 0), t)) op = [op[0] & 2, t.value]
        switch (op[0]) {
          case 0:
          case 1:
            t = op
            break
          case 4:
            _.label++
            return { value: op[1], done: false }
          case 5:
            _.label++
            y = op[1]
            op = [0]
            continue
          case 7:
            op = _.ops.pop()
            _.trys.pop()
            continue
          default:
            if (
              !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
              (op[0] === 6 || op[0] === 2)
            ) {
              _ = 0
              continue
            }
            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
              _.label = op[1]
              break
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1]
              t = op
              break
            }
            if (t && _.label < t[2]) {
              _.label = t[2]
              _.ops.push(op)
              break
            }
            if (t[2]) _.ops.pop()
            _.trys.pop()
            continue
        }
        op = body.call(thisArg, _)
      } catch (e) {
        op = [6, e]
        y = 0
      } finally {
        f = t = 0
      }
    if (op[0] & 5) throw op[1]
    return { value: op[0] ? op[1] : void 0, done: true }
  }
}

var resolver = {
  alias: function (id) {
    if (id === 'vue') {
      return 'vue/dist/vue.runtime.esm.js'
    }
  },
}

// lazy start the service
var _service
var ensureService = function () {
  return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!!_service) return [3 /*break*/, 2]
          return [4 /*yield*/, esbuild.startService()]
        case 1:
          _service = _a.sent()
          _a.label = 2
        case 2:
          return [2 /*return*/, _service]
      }
    })
  })
}
var queryRE = /\?.*$/
var hashRE = /#.*$/
var cleanUrl = function (url) {
  return url.replace(hashRE, '').replace(queryRE, '')
}
var sourceMapRE = /\/\/# sourceMappingURL.*/
// transform used in server plugins with a more friendly API
var transform = function (src, request, options) {
  if (options === void 0) {
    options = {}
  }
  return __awaiter(void 0, void 0, void 0, function () {
    var service, file, result, code, e_1
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, ensureService()]
        case 1:
          service = _a.sent()
          file = cleanUrl(request)
          options = __assign(__assign({}, options), {
            loader: options.loader || path.extname(file).slice(1),
            sourcemap: true,
            sourcefile: request,
            target: 'es2019',
          })
          _a.label = 2
        case 2:
          _a.trys.push([2, 4, , 5])
          return [4 /*yield*/, service.transform(src, options)]
        case 3:
          result = _a.sent()
          if (result.warnings.length) {
            console.error(
              '[vite] warnings while transforming ' + file + ' with esbuild:'
            )
            result.warnings.forEach(function (m) {
              return printMessage(m, src)
            })
          }
          code = (result.js || '').replace(sourceMapRE, '')
          return [
            2 /*return*/,
            {
              code: code,
              map: result.jsSourceMap,
            },
          ]
        case 4:
          e_1 = _a.sent()
          console.error(
            chalk.red(
              '[vite] error while transforming ' + file + ' with esbuild:'
            )
          )
          if (e_1.errors) {
            e_1.errors.forEach(function (m) {
              return printMessage(m, src)
            })
          } else {
            console.error(e_1)
          }
          return [
            2 /*return*/,
            {
              code: '',
              map: undefined,
            },
          ]
        case 5:
          return [2 /*return*/]
      }
    })
  })
}
function printMessage(m, code) {
  console.error(chalk.yellow(m.text))
  if (m.location) {
    var lines = code.split(/\r?\n/g)
    var line = Number(m.location.line)
    var column = Number(m.location.column)
    var offset =
      lines
        .slice(0, line - 1)
        .map(function (l) {
          return l.length
        })
        .reduce(function (total, l) {
          return total + l + 1
        }, 0) + column
    console.error(generateCodeFrame(code, offset, offset + 1))
  }
}
var range = 2
function generateCodeFrame(source, start, end) {
  if (start === void 0) {
    start = 0
  }
  if (end === void 0) {
    end = source.length
  }
  var lines = source.split(/\r?\n/)
  var count = 0
  var res = []
  for (var i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (var j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        var line = j + 1
        res.push(
          '' + line + ' '.repeat(3 - String(line).length) + '|  ' + lines[j]
        )
        var lineLength = lines[j].length
        if (j === i) {
          // push underline
          var pad = start - (count - lineLength) + 1
          var length = Math.max(1, end > count ? lineLength - pad : end - start)
          res.push('   |  ' + ' '.repeat(pad) + '^'.repeat(length))
        } else if (j > i) {
          if (end > count) {
            var length = Math.max(Math.min(end - count, lineLength), 1)
            res.push('   |  ' + '^'.repeat(length))
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}

/* globals __VUE_SSR_CONTEXT__ */
// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.
var normalizeComponentCode =
  "\nexport default function normalizeComponent (\n    scriptExports,\n    render,\n    staticRenderFns,\n    functionalTemplate,\n    injectStyles,\n    scopeId,\n    moduleIdentifier, /* server only */\n    shadowMode /* vue-cli only */\n) {\n  // Vue.extend constructor export interop\n  var options = typeof scriptExports === 'function'\n      ? scriptExports.options\n      : scriptExports\n\n  // render functions\n  if (render) {\n    options.render = render\n    options.staticRenderFns = staticRenderFns\n    options._compiled = true\n  }\n\n  // functional template\n  if (functionalTemplate) {\n    options.functional = true\n  }\n\n  // scopedId\n  if (scopeId) {\n    options._scopeId = 'data-v-' + scopeId\n  }\n\n  var hook\n  if (moduleIdentifier) { // server build\n    hook = function (context) {\n      // 2.3 injection\n      context =\n          context || // cached call\n          (this.$vnode && this.$vnode.ssrContext) || // stateful\n          (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional\n      // 2.2 with runInNewContext: true\n      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {\n        context = __VUE_SSR_CONTEXT__\n      }\n      // inject component styles\n      if (injectStyles) {\n        injectStyles.call(this, context)\n      }\n      // register component module identifier for async chunk inferrence\n      if (context && context._registeredComponents) {\n        context._registeredComponents.add(moduleIdentifier)\n      }\n    }\n    // used by ssr in case component is cached and beforeCreate\n    // never gets called\n    options._ssrRegister = hook\n  } else if (injectStyles) {\n    hook = shadowMode\n        ? function () {\n          injectStyles.call(\n              this,\n              (options.functional ? this.parent : this).$root.$options.shadowRoot\n          )\n        }\n        : injectStyles\n  }\n\n  if (hook) {\n    if (options.functional) {\n      // for template-only hot-reload because in that case the render fn doesn't\n      // go through the normalizer\n      options._injectStyles = hook\n      // register for functional component in vue file\n      var originalRender = options.render\n      options.render = function renderWithStyleInjection (h, context) {\n        hook.call(context)\n        return originalRender(h, context)\n      }\n    } else {\n      // inject component registration as beforeCreate hook\n      var existing = options.beforeCreate\n      options.beforeCreate = existing\n          ? [].concat(existing, hook)\n          : [hook]\n    }\n  }\n\n  return {\n    exports: scriptExports,\n    options: options\n  }\n}"

var vueHotReloadCode =
  "\nvar Vue // late bind\nvar version\nvar __VUE_HMR_RUNTIME__ = Object.create(null)\nvar map = Object.create(null)\nif (typeof window !== 'undefined') {\n\twindow.__VUE_HMR_RUNTIME__ = __VUE_HMR_RUNTIME__\n}\nvar installed = false\nvar isBrowserify = false\nvar initHookName = 'beforeCreate'\n\n__VUE_HMR_RUNTIME__.install = function (vue, browserify) {\n\tif (installed) { return }\n\tinstalled = true\n\n\tVue = vue.__esModule ? vue.default : vue\n\tversion = Vue.version.split('.').map(Number)\n\tisBrowserify = browserify\n\n\t// compat with < 2.0.0-alpha.7\n\tif (Vue.config._lifecycleHooks.indexOf('init') > -1) {\n\t\tinitHookName = 'init'\n\t}\n\n\t__VUE_HMR_RUNTIME__.compatible = version[0] >= 2\n\tif (!__VUE_HMR_RUNTIME__.compatible) {\n\t\tconsole.warn(\n\t\t\t'[HMR] You are using a version of vue-hot-reload-api that is ' +\n\t\t\t'only compatible with Vue.js core ^2.0.0.'\n\t\t)\n\t\treturn\n\t}\n}\n\n/**\n * Create a record for a hot module, which keeps track of its constructor\n * and instances\n *\n * @param {String} id\n * @param {Object} options\n */\n\n__VUE_HMR_RUNTIME__.createRecord = function (id, options) {\n\tif(map[id]) { return }\n\n\tvar Ctor = null\n\tif (typeof options === 'function') {\n\t\tCtor = options\n\t\toptions = Ctor.options\n\t}\n\tmakeOptionsHot(id, options)\n\tmap[id] = {\n\t\tCtor: Ctor,\n\t\toptions: options,\n\t\tinstances: []\n\t}\n}\n\n/**\n * Check if module is recorded\n *\n * @param {String} id\n */\n\n__VUE_HMR_RUNTIME__.isRecorded = function (id) {\n\treturn typeof map[id] !== 'undefined'\n}\n\n/**\n * Make a Component options object hot.\n *\n * @param {String} id\n * @param {Object} options\n */\n\nfunction makeOptionsHot(id, options) {\n\tif (options.functional) {\n\t\tvar render = options.render\n\t\toptions.render = function (h, ctx) {\n\t\t\tvar instances = map[id].instances\n\t\t\tif (ctx && instances.indexOf(ctx.parent) < 0) {\n\t\t\t\tinstances.push(ctx.parent)\n\t\t\t}\n\t\t\treturn render(h, ctx)\n\t\t}\n\t} else {\n\t\tinjectHook(options, initHookName, function() {\n\t\t\tvar record = map[id]\n\t\t\tif (!record.Ctor) {\n\t\t\t\trecord.Ctor = this.constructor\n\t\t\t}\n\t\t\trecord.instances.push(this)\n\t\t})\n\t\tinjectHook(options, 'beforeDestroy', function() {\n\t\t\tvar instances = map[id].instances\n\t\t\tinstances.splice(instances.indexOf(this), 1)\n\t\t})\n\t}\n}\n\n/**\n * Inject a hook to a hot reloadable component so that\n * we can keep track of it.\n *\n * @param {Object} options\n * @param {String} name\n * @param {Function} hook\n */\n\nfunction injectHook(options, name, hook) {\n\tvar existing = options[name]\n\toptions[name] = existing\n\t\t? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]\n\t\t: [hook]\n}\n\nfunction tryWrap(fn) {\n\treturn function (id, arg) {\n\t\ttry {\n\t\t\tfn(id, arg)\n\t\t} catch (e) {\n\t\t\tconsole.error(e)\n\t\t\tconsole.warn(\n\t\t\t\t'Something went wrong during Vue component hot-reload. Full reload required.'\n\t\t\t)\n\t\t}\n\t}\n}\n\nfunction updateOptions (oldOptions, newOptions) {\n\tfor (var key in oldOptions) {\n\t\tif (!(key in newOptions)) {\n\t\t\tdelete oldOptions[key]\n\t\t}\n\t}\n\tfor (var key$1 in newOptions) {\n\t\toldOptions[key$1] = newOptions[key$1]\n\t}\n}\n\n__VUE_HMR_RUNTIME__.rerender = tryWrap(function (id, options) {\n\tvar record = map[id]\n\tif (!options) {\n\t\trecord.instances.slice().forEach(function (instance) {\n\t\t\tinstance.$forceUpdate()\n\t\t})\n\t\treturn\n\t}\t\n\tif (typeof options === 'function') {\n\t\toptions = options.options\n\t}\n\tif(record.functional){\n\t\trecord.render = options.render\n\t\trecord.staticRenderFns = options.staticRenderFns\n\t\t__VUE_HMR_RUNTIME__.reload(id, record)\n\t\treturn\n\t}\n\tif (record.Ctor) {\n\t\trecord.Ctor.options.render = options.render\n\t\trecord.Ctor.options.staticRenderFns = options.staticRenderFns\n\t\trecord.instances.slice().forEach(function (instance) {\n\t\t\tinstance.$options.render = options.render\n\t\t\tinstance.$options.staticRenderFns = options.staticRenderFns\n\t\t\t// reset static trees\n\t\t\t// pre 2.5, all static trees are cached together on the instance\n\t\t\tif (instance._staticTrees) {\n\t\t\t\tinstance._staticTrees = []\n\t\t\t}\n\t\t\t// 2.5.0\n\t\t\tif (Array.isArray(record.Ctor.options.cached)) {\n\t\t\t\trecord.Ctor.options.cached = []\n\t\t\t}\n\t\t\t// 2.5.3\n\t\t\tif (Array.isArray(instance.$options.cached)) {\n\t\t\t\tinstance.$options.cached = []\n\t\t\t}\n\n\t\t\t// post 2.5.4: v-once trees are cached on instance._staticTrees.\n\t\t\t// Pure static trees are cached on the staticRenderFns array\n\t\t\t// (both already reset above)\n\n\t\t\t// 2.6: temporarily mark rendered scoped slots as unstable so that\n\t\t\t// child components can be forced to update\n\t\t\tvar restore = patchScopedSlots(instance)\n\t\t\tinstance.$forceUpdate()\n\t\t\tinstance.$nextTick(restore)\n\t\t})\n\t} else {\n\t\t// functional or no instance created yet\n\t\trecord.options.render = options.render\n\t\trecord.options.staticRenderFns = options.staticRenderFns\n\n\t\t// handle functional component re-render\n\t\tif (record.options.functional) {\n\t\t\t// rerender with full options\n\t\t\tif (Object.keys(options).length > 2) {\n\t\t\t\tupdateOptions(record.options, options)\n\t\t\t} else {\n\t\t\t\t// template-only rerender.\n\t\t\t\t// need to inject the style injection code for CSS modules\n\t\t\t\t// to work properly.\n\t\t\t\tvar injectStyles = record.options._injectStyles\n\t\t\t\tif (injectStyles) {\n\t\t\t\t\tvar render = options.render\n\t\t\t\t\trecord.options.render = function (h, ctx) {\n\t\t\t\t\t\tinjectStyles.call(ctx)\n\t\t\t\t\t\treturn render(h, ctx)\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t\trecord.options._Ctor = null\n\t\t\t// 2.5.3\n\t\t\tif (Array.isArray(record.options.cached)) {\n\t\t\t\trecord.options.cached = []\n\t\t\t}\n\t\t\trecord.instances.slice().forEach(function (instance) {\n\t\t\t\tinstance.$forceUpdate()\n\t\t\t})\n\t\t}\n\t}\n})\n\n__VUE_HMR_RUNTIME__.reload = tryWrap(function (id, options) {\n\tvar record = map[id]\n\tif (options) {\n\t\tif (typeof options === 'function') {\n\t\t\toptions = options.options\n\t\t}\n\t\tmakeOptionsHot(id, options)\n\t\tif (record.Ctor) {\n\t\t\tif (version[1] < 2) {\n\t\t\t\t// preserve pre 2.2 behavior for global mixin handling\n\t\t\t\trecord.Ctor.extendOptions = options\n\t\t\t}\n\t\t\tvar newCtor = record.Ctor.super.extend(options)\n\t\t\t// prevent record.options._Ctor from being overwritten accidentally\n\t\t\tnewCtor.options._Ctor = record.options._Ctor\n\t\t\trecord.Ctor.options = newCtor.options\n\t\t\trecord.Ctor.cid = newCtor.cid\n\t\t\trecord.Ctor.prototype = newCtor.prototype\n\t\t\tif (newCtor.release) {\n\t\t\t\t// temporary global mixin strategy used in < 2.0.0-alpha.6\n\t\t\t\tnewCtor.release()\n\t\t\t}\n\t\t} else {\n\t\t\tupdateOptions(record.options, options)\n\t\t}\n\t}\n\trecord.instances.slice().forEach(function (instance) {\n\t\tif (instance.$vnode && instance.$vnode.context) {\n\t\t\tinstance.$vnode.context.$forceUpdate()\n\t\t} else {\n\t\t\tconsole.warn(\n\t\t\t\t'Root or manually mounted instance modified. Full reload required.'\n\t\t\t)\n\t\t}\n\t})\n})\n\n// 2.6 optimizes template-compiled scoped slots and skips updates if child\n// only uses scoped slots. We need to patch the scoped slots resolving helper\n// to temporarily mark all scoped slots as unstable in order to force child\n// updates.\nfunction patchScopedSlots (instance) {\n\tif (!instance._u) { return }\n\t// https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js\n\tvar original = instance._u\n\tinstance._u = function (slots) {\n\t\ttry {\n\t\t\t// 2.6.4 ~ 2.6.6\n\t\t\treturn original(slots, true)\n\t\t} catch (e) {\n\t\t\t// 2.5 / >= 2.6.7\n\t\t\treturn original(slots, null, true)\n\t\t}\n\t}\n\treturn function () {\n\t\tinstance._u = original\n\t}\n}\nexport default __VUE_HMR_RUNTIME__\n"

var vueTemplateCompiler = require('vue-template-compiler')
var vueComponentNormalizer = '/vite/vueComponentNormalizer'
var vueHotReload = '/vite/vueHotReload'
var vueCompilerOptions = null
function setVueCompilerOptions(opts) {
  vueCompilerOptions = opts
}
var vuePlugin = function (_a) {
  var root = _a.root,
    app = _a.app,
    resolver = _a.resolver,
    watcher = _a.watcher,
    config = _a.config
  app.use(function (ctx, next) {
    return __awaiter(void 0, void 0, void 0, function () {
      var query, publicPath, filePath, source, descriptor, _a, templateBlock
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            if (!(ctx.path === serverPluginClient.clientPublicPath))
              return [3 /*break*/, 2]
            return [4 /*yield*/, next()]
          case 1:
            _b.sent()
            ctx.type = 'js'
            ctx.body = ctx.body.replace(
              /__VUE_HMR_RUNTIME__\.rerender\(path, (.+)\)/g,
              '__VUE_HMR_RUNTIME__.rerender(path, m)'
            )
            return [2 /*return*/]
          case 2:
            if (ctx.path === vueHotReload) {
              ctx.type = 'js'
              ctx.body = vueHotReloadCode
              return [2 /*return*/]
            }
            if (ctx.path === vueComponentNormalizer) {
              ctx.type = 'js'
              ctx.body = normalizeComponentCode
              return [2 /*return*/]
            }
            if (!ctx.path.endsWith('.vue') && !ctx.vue) {
              return [2 /*return*/, next()]
            }
            query = ctx.query
            publicPath = ctx.path
            filePath = resolver.requestToFile(publicPath)
            source = readFile(filePath)
            descriptor = componentCompilerUtils.parse({
              source: source,
              compiler: vueTemplateCompiler,
              filename: filePath,
              sourceRoot: root,
              needMap: true,
            })
            if (!descriptor) {
              return [2 /*return*/]
            }
            if (!!query.type) return [3 /*break*/, 5]
            // rely on vite internal sfc parse....
            return [4 /*yield*/, next()]
          case 3:
            // rely on vite internal sfc parse....
            _b.sent()
            ctx.type = 'js'
            _a = ctx
            return [
              4 /*yield*/,
              parseSFC(root, filePath, publicPath, descriptor, resolver),
            ]
          case 4:
            _a.body = _b.sent()
            if (descriptor.script) {
              ctx.map = descriptor.script.map
            }
            return [2 /*return*/]
          case 5:
            if (!(query.type === 'template')) return [3 /*break*/, 8]
            templateBlock = descriptor.template
            if (!(templateBlock && templateBlock.src)) return [3 /*break*/, 7]
            return [
              4 /*yield*/,
              resolveSrcImport(root, templateBlock, ctx, resolver),
            ]
          case 6:
            filePath = _b.sent()
            _b.label = 7
          case 7:
            ctx.type = 'js'
            ctx.body = compileSFCTemplate(templateBlock, filePath, publicPath)
            return [2 /*return*/]
          case 8:
            if (query.type === 'style') {
              return [2 /*return*/, next()]
            }
            return [2 /*return*/]
        }
      })
    })
  })
}
function readFile(filePath) {
  return fs.readFileSync(filePath).toString()
}
function parseSFC(root, filePath, publicPath, descriptor, resolver) {
  return __awaiter(this, void 0, Promise, function () {
    var hasFunctional,
      id,
      templateImport,
      scriptImport,
      scriptBlock,
      code_1,
      srcPath,
      res,
      stylesCode,
      hasScoped,
      code
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          hasFunctional =
            descriptor.template && descriptor.template.attrs.functional
          id = hash_sum(publicPath)
          templateImport = 'var render, staticRenderFns'
          if (descriptor.template) {
            templateImport =
              'import { render, staticRenderFns } from "' +
              publicPath +
              '?type=template"'
          }
          scriptImport = 'var script = {}'
          if (!descriptor.script) return [3 /*break*/, 3]
          scriptBlock = descriptor.script
          code_1 = scriptBlock.content
          if (scriptBlock && scriptBlock.src) {
            srcPath = serverPluginModuleRewrite.resolveImport(
              root,
              publicPath,
              scriptBlock.src,
              resolver
            )
            code_1 = readFile(resolver.requestToFile(srcPath))
          }
          if (!(scriptBlock.lang === 'ts')) return [3 /*break*/, 2]
          return [
            4 /*yield*/,
            transform(code_1, publicPath, {
              loader: 'ts',
            }),
          ]
        case 1:
          res = _a.sent()
          code_1 = res.code
          scriptBlock.map = serverPluginSourceMap.mergeSourceMap(
            scriptBlock.map,
            JSON.parse(res.map)
          )
          _a.label = 2
        case 2:
          // rewrite export default.
          scriptImport = compilerSfc.rewriteDefault(code_1, 'script')
          _a.label = 3
        case 3:
          stylesCode = ''
          if (descriptor.styles.length) {
            descriptor.styles.forEach(function (s, i) {
              var styleRequest = publicPath + ('?type=style&index=' + i)
              if (s.scoped) hasScoped = true
              if (s.module) {
                var styleVar = '__style' + i
                var moduleName =
                  typeof s.module === 'string' ? s.module : '$style'
                stylesCode +=
                  '\nimport ' +
                  styleVar +
                  ' from ' +
                  JSON.stringify(styleRequest + '&module')
                stylesCode +=
                  '\n__cssModules[' +
                  JSON.stringify(moduleName) +
                  '] = ' +
                  styleVar
              } else {
                stylesCode += '\nimport ' + JSON.stringify(styleRequest)
              }
            })
          }
          code =
            (
              '\n' +
              templateImport +
              '\n' +
              scriptImport +
              '\nconst __cssModules = {}\n' +
              stylesCode +
              '\n/* normalize component */\nimport normalizer from "' +
              vueComponentNormalizer +
              '"\nvar component = normalizer(\n  script,\n  render,\n  staticRenderFns,\n  ' +
              (hasFunctional ? 'true' : 'false') +
              ',\n  injectStyles,\n  ' +
              (hasScoped ? JSON.stringify(id) : 'null') +
              ',\n  null,\n  null\n)\n  '
            ).trim() + '\n'
          code +=
            '\nfunction injectStyles (context) {\n  for(let o in __cssModules){\n    this[o] = __cssModules[o]\n  }\n}  \n  '
          // TODO custom block
          // if (needsHotReload) {
          // 	code += `\n` + genHotReloadCode(id, hasFunctional, templateRequest)
          // }
          // // Expose filename. This is used by the devtools and Vue runtime warnings.
          // if (process.env.NODE_ENV === 'production') {
          // 	// Expose the file's full path in development, so that it can be opened
          // 	// from the devtools.
          // 	code += `\ncomponent.options.__file = ${JSON.stringify(rawShortFilePath.replace(/\\/g, '/'))}`
          // } else if (options.exposeFilename) {
          // 	// Libraries can opt-in to expose their components' filenames in production builds.
          // 	// For security reasons, only expose the file's basename in production.
          // 	code += `\ncomponent.options.__file = ${JSON.stringify(filename)}`
          // }
          code +=
            '\n/* hot reload */\nimport __VUE_HMR_RUNTIME__ from "' +
            vueHotReload +
            '"\nimport vue from "vue"\nif (import.meta.hot) {\n\t__VUE_HMR_RUNTIME__.install(vue)\n\tif(__VUE_HMR_RUNTIME__.compatible){\n\t\t if (!__VUE_HMR_RUNTIME__.isRecorded(\'' +
            publicPath +
            "')) {\n\t\t\t __VUE_HMR_RUNTIME__.createRecord('" +
            publicPath +
            '\', component.options)\n\t\t }\n\t} else {\n\t\t\tconsole.log("The hmr is not compatible.")\n\t}\n}'
          code += '\nexport default component.exports'
          return [2 /*return*/, code]
      }
    })
  })
}
function compileSFCTemplate(block, filePath, publicPath) {
  var _a = componentCompilerUtils.compileTemplate(
      __assign(
        {
          source: block.content,
          filename: filePath,
          compiler: vueTemplateCompiler,
          transformAssetUrls: true,
          transformAssetUrlsOptions: {
            base: path.posix.dirname(publicPath),
          },
          isProduction: process.env.NODE_ENV === 'production',
          isFunctional: !!block.attrs.functional,
          optimizeSSR: false,
          prettify: false,
        },
        vueCompilerOptions
      )
    ),
    tips = _a.tips,
    errors = _a.errors,
    code = _a.code
  if (tips) {
    tips.forEach(console.warn)
  }
  if (errors) {
    errors.forEach(console.error)
  }
  return code + '\nexport { render, staticRenderFns }'
}
function resolveSrcImport(root, block, ctx, resolver) {
  return __awaiter(this, void 0, void 0, function () {
    var importer, importee, filePath, _a
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          importer = ctx.path
          importee = utils.cleanUrl(
            serverPluginModuleRewrite.resolveImport(
              root,
              importer,
              block.src,
              resolver
            )
          )
          filePath = resolver.requestToFile(importee)
          _a = block
          return [4 /*yield*/, ctx.read(filePath)]
        case 1:
          _a.content = _b.sent().toString()
          serverPluginHmr
            .ensureMapEntry(serverPluginHmr.importerMap, importee)
            .add(ctx.path)
          serverPluginVue.srcImportMap.set(filePath, ctx.url)
          return [2 /*return*/, filePath]
      }
    })
  })
}

function createVuePlugin(options) {
  if (options === void 0) {
    options = {}
  }
  var vueTemplateOptions = options.vueTemplateOptions,
    rollupPluginVueOptions = options.rollupPluginVueOptions
  if (vueTemplateOptions) {
    setVueCompilerOptions(vueTemplateOptions)
  }
  return {
    resolvers: [resolver],
    configureServer: vuePlugin,
    enableRollupPluginVue: false,
    rollupInputOptions: {
      plugins: [
        require('rollup-plugin-vue')(
          __assign(__assign({}, rollupPluginVueOptions), {
            compiler: vueTemplateOptions && vueTemplateOptions.compiler,
          })
        ),
      ],
    },
  }
}

exports.createVuePlugin = createVuePlugin
