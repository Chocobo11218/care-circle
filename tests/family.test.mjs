import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript } from './load-typescript.mjs'
const { localGreeting, localDate, joinedTime, avatarTone, memberInitial } = await loadTypeScript(new URL('../src/lib/family.ts', import.meta.url))

test('greetings change at noon and 18:00 on the local clock', () => {
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 11, 59)), 'สวัสดีตอนเช้า Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 12)), 'สวัสดีตอนบ่าย Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 17, 59)), 'สวัสดีตอนบ่าย Gunn')
  assert.equal(localGreeting('Gunn', new Date(2026, 9, 12, 18)), 'สวัสดีตอนเย็น Gunn')
})
test('dates use the requested punctuation and member timestamps omit seconds', () => {
  assert.equal(localDate(new Date(2026, 9, 12, 9)), 'จ. 12 ต.ค.')
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
