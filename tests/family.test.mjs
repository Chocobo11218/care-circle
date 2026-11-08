import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
const dataUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const stringsUrl = dataUrl(compile(await readFile(new URL('../src/i18n/en.ts', import.meta.url), 'utf8')))
const source = compile(await readFile(new URL('../src/lib/family.ts', import.meta.url), 'utf8')).replace("'../i18n/en'", JSON.stringify(stringsUrl))
const { localGreeting, localDate, joinedTime, avatarTone, memberInitial } = await import(dataUrl(source))

test('greetings change at noon and 18:00 on the local clock', () => {
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 11, 59)), 'Good morning, Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 12)), 'Good afternoon, Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 17, 59)), 'Good afternoon, Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 18)), 'Good evening, Gunn')
})
test('dates use the requested punctuation and member timestamps omit seconds', () => {
  assert.equal(localDate(new Date(2026, 9, 12, 9)), 'Mon, 12 Oct')
  const time = new Date(2026, 9, 12, 9, 10).toISOString()
  assert.equal(joinedTime(time), '09:10')
  assert.equal(joinedTime('invalid'), null)
})
test('named avatar colors match the reference and initials handle whitespace and Unicode', () => {
  assert.equal(avatarTone('Fay'), 'lavender')
  assert.equal(avatarTone('Gunn'), 'mint')
  assert.equal(avatarTone('Mikky'), 'pink')
  assert.equal(avatarTone('Someone Else'), avatarTone('Someone Else'))
  assert.equal(memberInitial('  Gunn '), 'G')
  assert.equal(memberInitial('𐐀name'), '𐐀')
  assert.equal(memberInitial('   '), '?')
})
