import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

// Use the project's existing TypeScript compiler; no test dependency is needed.
const source = await readFile(new URL('../src/lib/members.ts', import.meta.url), 'utf8')
const javascript = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText
const { splitMembers, orderedMembers, mergeMemberChange } = await import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`)
const member = (id, role, is_mock = false, circle_id = 'circle-a') => ({
  id, circle_id, role, is_mock, user_id: `user-${id}`, first_name: id, last_name: null,
  birthday: null, joined_at: '2026-01-01T00:00:00Z', availability: null,
})
const family = member('family', 'family')
const elder = member('elder', 'elderly')
const mockElder = member('mock-elder', 'elderly', true)
const mockFamily = member('mock-family', 'family', true)
const event = (eventType, row) => ({ eventType, new: eventType === 'DELETE' ? {} : row, old: eventType === 'DELETE' ? { id: row.id } : {} })

test('splits real roles and keeps mock elders in the candidate group', () => {
  const groups = splitMembers([mockElder, family, mockFamily, elder])
  assert.deepEqual(groups.realElders, [elder])
  assert.deepEqual(groups.realFamily, [family])
  assert.deepEqual(groups.mockCandidates, [mockElder, mockFamily])
})

test('orders real elders, real family, and then mock candidates without mutating input', () => {
  const members = [mockElder, family, mockFamily, elder]
  assert.deepEqual(orderedMembers(members), [elder, family, mockElder, mockFamily])
  assert.deepEqual(members, [mockElder, family, mockFamily, elder])
})

test('inserts a new member once and deduplicates repeated INSERT events', () => {
  const inserted = mergeMemberChange([family], event('INSERT', elder), 'circle-a')
  const duplicate = mergeMemberChange(inserted, event('INSERT', elder), 'circle-a')
  assert.deepEqual(duplicate, [family, elder])
})

test('updates by MEMBER id, preserves other fields, and leaves the old state untouched', () => {
  const changed = mergeMemberChange([family, elder], event('UPDATE', { id: elder.id, circle_id: 'circle-a', availability: 'Available' }), 'circle-a')
  assert.equal(changed[1].availability, 'Available')
  assert.equal(changed[1].first_name, elder.first_name)
  assert.equal(elder.availability, null)
  assert.equal(changed[0], family)
})

test('handles DELETE payloads containing only a primary key and duplicate deletes', () => {
  const removed = mergeMemberChange([family, elder], event('DELETE', elder), 'circle-a')
  assert.deepEqual(removed, [family])
  assert.deepEqual(mergeMemberChange(removed, event('DELETE', elder), 'circle-a'), [family])
})

test('ignores events from another circle, unknown deletes, and missing ids', () => {
  const members = [family, elder]
  assert.deepEqual(mergeMemberChange(members, event('INSERT', member('outsider', 'elderly', false, 'circle-b')), 'circle-a'), members)
  assert.deepEqual(mergeMemberChange(members, event('DELETE', { id: 'outside-id' }), 'circle-a'), members)
  assert.equal(mergeMemberChange(members, event('UPDATE', {}), 'circle-a'), members)
})

test('removes a member moved to another circle', () => {
  assert.deepEqual(mergeMemberChange([family, elder], event('UPDATE', { ...elder, circle_id: 'circle-b' }), 'circle-a'), [family])
})

test('replays changes received during an older fetch without resurrecting a deleted row', () => {
  const staleSnapshot = [family, elder]
  const changes = [event('DELETE', elder), event('INSERT', mockFamily), event('UPDATE', { ...family, first_name: 'Updated' })]
  const current = changes.reduce((members, change) => mergeMemberChange(members, change, 'circle-a'), staleSnapshot)
  assert.deepEqual(current.map(row => row.id), [family.id, mockFamily.id])
  assert.equal(current[0].first_name, 'Updated')
})
