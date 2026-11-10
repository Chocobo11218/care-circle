import assert from 'node:assert/strict'
import test from 'node:test'
import { loadTypeScript } from './load-typescript.mjs'

const { normalizeEmail, sanitizeOtp, resendSeconds, resendCooldownMs } = await loadTypeScript(new URL('../src/lib/email-auth.ts', import.meta.url))

test('normalizes email addresses and rejects incomplete or malformed addresses', () => {
  assert.equal(normalizeEmail('  Person+test@Example.COM '), 'person+test@example.com')
  for (const value of ['', 'person', 'person@example', 'person@ex ample.com', 'person@@example.com', 'person@.com']) {
    assert.equal(normalizeEmail(value), null)
  }
})

test('code entry strips non-digits, preserves leading zeros, and caps pasted digits', () => {
  assert.equal(sanitizeOtp('012345'), '012345')
  assert.equal(sanitizeOtp(' 01-23 45 678 '), '012345')
  assert.equal(sanitizeOtp('letters only'), '')
})

test('resend cooldown rounds up and becomes available at the deadline', () => {
  const start = 1234
  const deadline = start + resendCooldownMs
  assert.equal(resendSeconds(deadline, start), 60)
  assert.equal(resendSeconds(deadline, deadline - 1), 1)
  assert.equal(resendSeconds(deadline, deadline), 0)
  assert.equal(resendSeconds(deadline, deadline + 10), 0)
})
