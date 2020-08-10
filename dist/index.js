'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.createVuePlugin = void 0
const resolver_1 = require('./resolver')
const serverPlugin_1 = require('./serverPlugin')
function createVuePlugin(options = {}) {
  const { vueTemplateOptions, rollupPluginVueOptions } = options
  if (vueTemplateOptions) {
    serverPlugin_1.setVueCompilerOptions(vueTemplateOptions)
  }
  return {
    resolvers: [resolver_1.resolver],
    configureServer: serverPlugin_1.vuePlugin,
    enableRollupPluginVue: false,
    rollupInputOptions: {
      plugins: [
        require('rollup-plugin-vue')({
          ...rollupPluginVueOptions,
          compiler: vueTemplateOptions && vueTemplateOptions.compiler,
        }),
      ],
    },
  }
}
exports.createVuePlugin = createVuePlugin
//# sourceMappingURL=index.js.map
