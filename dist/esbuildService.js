'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
exports.generateCodeFrame = exports.transform = exports.cleanUrl = exports.hashRE = exports.queryRE = exports.stopService = void 0
const path_1 = __importDefault(require('path'))
const chalk_1 = __importDefault(require('chalk'))
const esbuild_1 = require('esbuild')
let _service
const ensureService = async () => {
  if (!_service) {
    _service = await esbuild_1.startService()
  }
  return _service
}
exports.stopService = () => {
  _service && _service.stop()
  _service = undefined
}
exports.queryRE = /\?.*$/
exports.hashRE = /#.*$/
exports.cleanUrl = (url) =>
  url.replace(exports.hashRE, '').replace(exports.queryRE, '')
const sourceMapRE = /\/\/# sourceMappingURL.*/
exports.transform = async (src, request, options = {}) => {
  const service = await ensureService()
  const file = exports.cleanUrl(request)
  options = {
    ...options,
    loader: options.loader || path_1.default.extname(file).slice(1),
    sourcemap: true,
    sourcefile: request,
    target: 'es2019',
  }
  try {
    const result = await service.transform(src, options)
    if (result.warnings.length) {
      console.error(`[vite] warnings while transforming ${file} with esbuild:`)
      result.warnings.forEach((m) => printMessage(m, src))
    }
    let code = (result.js || '').replace(sourceMapRE, '')
    return {
      code,
      map: result.jsSourceMap,
    }
  } catch (e) {
    console.error(
      chalk_1.default.red(
        `[vite] error while transforming ${file} with esbuild:`
      )
    )
    if (e.errors) {
      e.errors.forEach((m) => printMessage(m, src))
    } else {
      console.error(e)
    }
    return {
      code: '',
      map: undefined,
    }
  }
}
function printMessage(m, code) {
  console.error(chalk_1.default.yellow(m.text))
  if (m.location) {
    const lines = code.split(/\r?\n/g)
    const line = Number(m.location.line)
    const column = Number(m.location.column)
    const offset =
      lines
        .slice(0, line - 1)
        .map((l) => l.length)
        .reduce((total, l) => total + l + 1, 0) + column
    console.error(generateCodeFrame(code, offset, offset + 1))
  }
}
const range = 2
function generateCodeFrame(source, start = 0, end = source.length) {
  const lines = source.split(/\r?\n/)
  let count = 0
  const res = []
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) continue
        const line = j + 1
        res.push(`${line}${' '.repeat(3 - String(line).length)}|  ${lines[j]}`)
        const lineLength = lines[j].length
        if (j === i) {
          const pad = start - (count - lineLength) + 1
          const length = Math.max(
            1,
            end > count ? lineLength - pad : end - start
          )
          res.push(`   |  ` + ' '.repeat(pad) + '^'.repeat(length))
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1)
            res.push(`   |  ` + '^'.repeat(length))
          }
          count += lineLength + 1
        }
      }
      break
    }
  }
  return res.join('\n')
}
exports.generateCodeFrame = generateCodeFrame
//# sourceMappingURL=esbuildService.js.map
