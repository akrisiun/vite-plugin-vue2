// ./node_modules/.bin/rollup -c
// yarn add rollup rollup-plugin-typescript -D
import typescript from 'rollup-plugin-typescript'

export default [
  // ESM build to be used with webpack/rollup.
  {
    input: 'src/index.ts',
    output: {
      format: 'cjs',
      file: 'build/index.js',
    },
    plugins: [
      typescript({
        tsconfig: false,
        experimentalDecorators: true,
        module: 'es2015',
      }),
    ],
  },
]
