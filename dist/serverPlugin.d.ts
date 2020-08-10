import { ServerPlugin } from 'vite'
import { TemplateCompileOptions } from '@vue/component-compiler-utils/lib/compileTemplate'
export declare const vueComponentNormalizer = '/vite/vueComponentNormalizer'
export declare const vueHotReload = '/vite/vueHotReload'
export declare function setVueCompilerOptions(
  opts: TemplateCompileOptions
): void
export declare const vuePlugin: ServerPlugin
