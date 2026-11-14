import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript } from './load-typescript.mjs'
const { en } = await loadTypeScript(new URL('../src/i18n/en.ts', import.meta.url))
const { t, locale } = await loadTypeScript(new URL('../src/i18n/index.ts', import.meta.url))
const dates = await loadTypeScript(new URL('../src/lib/date.ts', import.meta.url))
const { memberCopy } = await loadTypeScript(new URL('../src/i18n/member-copy.ts', import.meta.url))

test('Thai catalog covers every English entry and is the default', () => {
  function compare(english, thai, path = '') {
    assert.deepEqual(Object.keys(thai).sort(), Object.keys(english).sort(), path)
    for (const key of Object.keys(english)) {
      assert.equal(typeof thai[key], typeof english[key], `${path}.${key}`)
      if (typeof english[key] === 'object') compare(english[key], thai[key], `${path}.${key}`)
      else if (typeof thai[key] === 'string') assert.ok(thai[key].length > 0)
    }
  }
  compare(en, t)
  assert.equal(locale, 'th-TH')
  assert.equal(t.familyNav.home, 'หน้าหลัก')
  assert.equal(t.familyAddMember.shareMessage('สุขใจ', 'ABC123'), 'เข้าร่วมกลุ่มดูแล สุขใจ ด้วยรหัสเชิญ: ABC123')
  assert.match(t.familyHome.atHome(['คุณแม่', 'คุณพ่อ']), /คุณแม่และคุณพ่อ อยู่บ้าน/)
})

test('birthdays accept Buddhist and Gregorian years and store Gregorian ISO dates', () => {
  const today = new Date(2026, 10, 14)
  for (const value of ['29/02/2543', '29/02/2000']) {
    assert.equal(dates.parseBirthday(value, today)?.getFullYear(), 2000)
    assert.equal(dates.birthdayToISO(value), '2000-02-29')
  }
  for (const value of ['29/02/2544', '31/04/2543', '01/01/2442', '15/11/2569', '15/11/2026']) {
    assert.equal(dates.parseBirthday(value, today), null, value)
  }
  assert.equal(dates.birthdayToISO('01/01/2443'), '1900-01-01')
  assert.equal(dates.formatBirthday('29022543'), '29/02/2543')
})

test('Thai display uses Buddhist years without changing task storage or local dates', () => {
  assert.equal(dates.formatElderTaskDate('2026-11-14'), '14 พฤศจิกายน 2569')
  assert.equal(dates.localISODate(new Date(2026, 10, 14)), '2026-11-14')
  assert.equal(dates.parseTaskDate('2026-11-14')?.getFullYear(), 2026)
  assert.equal(dates.formatTaskTime('09:00:00', null), 'เริ่ม 09:00 น.')
  assert.equal(dates.formatElderTaskDate(null), '—')
})

test('known mock suggestions are translated without altering user-provided text', () => {
  assert.equal(memberCopy('Can travel by car', true), 'เดินทางด้วยรถยนต์ได้')
  assert.equal(memberCopy('Can travel by car', false), 'Can travel by car')
  assert.equal(memberCopy('Custom availability', true), 'Custom availability')
})
