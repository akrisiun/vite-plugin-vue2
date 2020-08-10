import { TemplateCompileOptions } from '@vue/component-compiler-utils/lib/compileTemplate'
import { VuePluginOptions } from 'rollup-plugin-vue'
export interface VueViteOptions {
  vueTemplateOptions?: TemplateCompileOptions
  rollupPluginVueOptions?: VuePluginOptions
}
export declare function createVuePlugin(
  options?: VueViteOptions
): {
  resolvers: import('vite').Resolver[]
  configureServer: import('vite').ServerPlugin
  enableRollupPluginVue: boolean
  rollupInputOptions: {
    plugins: any[]
  }
}
