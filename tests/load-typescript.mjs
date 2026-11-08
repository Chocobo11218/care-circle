import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const cache = new Map()
export async function moduleURL(url) {
  if (cache.has(url.href)) return cache.get(url.href)
  let code = ts.transpileModule(await readFile(url, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const imports = [...code.matchAll(/from\s+(['"])(\.[^'"]+)\1/g)]
  for (const match of imports) {
    const target = new URL(match[2].endsWith('.ts') ? match[2] : `${match[2]}.ts`, url)
    code = code.replace(match[0], `from ${JSON.stringify(await moduleURL(target))}`)
  }
  const result = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  cache.set(url.href, result)
  return result
}
export async function loadTypeScript(url) { return import(await moduleURL(url)) }
