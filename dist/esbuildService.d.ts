import { TransformOptions } from 'esbuild'
export declare const stopService: () => void
export declare const queryRE: RegExp
export declare const hashRE: RegExp
export declare const cleanUrl: (url: string) => string
export declare const transform: (
  src: string,
  request: string,
  options?: TransformOptions
) => Promise<
  | {
      code: string
      map: string
    }
  | {
      code: string
      map: undefined
    }
>
export declare function generateCodeFrame(
  source: string,
  start?: number,
  end?: number
): string
