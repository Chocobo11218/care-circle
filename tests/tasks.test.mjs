import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript } from './load-typescript.mjs'
const tasks = await loadTypeScript(new URL('../src/lib/tasks.ts', import.meta.url))
const dates = await loadTypeScript(new URL('../src/lib/date.ts', import.meta.url))
const now = new Date(2026, 9, 14, 23, 50)
const draft = { elderId: null, title: 'Appointment', date: '2026-10-14', location: '', startTime: '', endTime: '', description: '', note: '' }
const task = (id, date = '2026-10-14', start = null, assignee = null) => ({ id, circle_id:'circle-a', title:id, task_date:date, start_time:start, end_time:null, assignee_id:assignee, elder_id:null, created_by:'member-a', location:null, description:null, note:null, created_at:'2026-10-14T00:00:00Z' })

test('date is required even without an elder; name and date suffice with no elder', () => {
  assert.deepEqual(tasks.validateTaskDraft(draft, [], null, now), {})
  assert.ok(tasks.validateTaskDraft({ ...draft, date:'' }, [], null, now).date)
  assert.ok(tasks.validateTaskDraft({ ...draft, title:' ' }, [], null, now).title)
})
test('past and impossible dates, equal and reversed times block both save modes', () => {
  for (const date of ['2026-10-13','2026-02-30','not-a-date']) assert.ok(tasks.validateTaskDraft({ ...draft, date }, [], null, now).date)
  for (const [startTime,endTime] of [['10:00','10:00'],['14:00','10:00']]) assert.ok(tasks.validateTaskDraft({ ...draft,startTime,endTime }, [], null, now).endTime)
  assert.deepEqual(tasks.validateTaskDraft({ ...draft,startTime:'10:00',endTime:'14:00' }, [], null, now),{})
  assert.deepEqual(tasks.validateTaskDraft({ ...draft,startTime:'10:00' }, [], null, now),{})
  assert.deepEqual(tasks.validateTaskDraft({ ...draft,endTime:'14:00' }, [], null, now),{})
})
test('requires a current real elder when elders exist; stale ids do not validate', () => {
  assert.ok(tasks.validateTaskDraft(draft,['elder-a'],null,now).elderId)
  assert.ok(tasks.validateTaskDraft(draft,['elder-a'],'deleted-id',now).elderId)
  assert.deepEqual(tasks.validateTaskDraft(draft,['elder-a'],'elder-a',now),{})
})
test('task payload uses member ids and null optional values, with no status column', () => {
  const unassigned=tasks.taskInsert({...draft,title:'  Appointment  '},'circle-a','member-a',null,false)
  assert.equal(unassigned.created_by,'member-a');assert.equal(unassigned.assignee_id,null);assert.equal(unassigned.elder_id,null)
  for(const key of ['location','start_time','end_time','description','note'])assert.equal(unassigned[key],null)
  assert.equal(unassigned.title,'Appointment');assert.equal('status' in unassigned,false)
  const self=tasks.taskInsert(draft,'circle-a','member-a','elder-a',true)
  assert.equal(self.assignee_id,'member-a');assert.equal(self.elder_id,'elder-a')
})
test('sorts dates then times, with missing dates and times last, without mutation', () => {
  const input=[task('undated',null),task('later','2026-10-15','09:00'),task('no-time'),task('afternoon','2026-10-14','14:00'),task('morning','2026-10-14','09:00')]
  assert.deepEqual(tasks.sortTasks(input).map(t=>t.id),['morning','afternoon','no-time','later','undated'])
  assert.equal(input[0].id,'undated')
})
test('derived sections never put assigned tasks under Needs Attention', () => {
  const input=[task('unassigned-past','2026-10-13'),task('assigned-today','2026-10-14',null,'member-a'),task('assigned-future','2026-10-15',null,'member-a'),task('assigned-past','2026-10-13',null,'member-a'),task('legacy-undated',null,null,'member-a')]
  const sections=tasks.taskSections(input,now)
  assert.deepEqual(sections.attention.map(t=>t.id),['unassigned-past'])
  assert.deepEqual(sections.upcoming.map(t=>t.id),['assigned-today','assigned-future'])
})
test('realtime merge deduplicates, updates, ignores other circles, and handles primary-key deletes', () => {
  const a=task('a');const insert={eventType:'INSERT',new:a,old:{}}
  let state=tasks.mergeTaskChange([],insert,'circle-a')
  state=tasks.mergeTaskChange(state,insert,'circle-a');assert.equal(state.length,1)
  state=tasks.mergeTaskChange(state,{eventType:'UPDATE',new:{id:'a',circle_id:'circle-a',assignee_id:'member-a'},old:{}},'circle-a')
  assert.equal(state[0].assignee_id,'member-a');assert.equal(state[0].title,'a')
  assert.deepEqual(tasks.mergeTaskChange(state,{eventType:'INSERT',new:{...task('outside'),circle_id:'circle-b'},old:{}},'circle-a'),state)
  const deleted={eventType:'DELETE',new:{},old:{id:'a'}}
  assert.deepEqual(tasks.mergeTaskChange(state,deleted,'circle-a'),[])
  assert.deepEqual(tasks.mergeTaskChange([],deleted,'circle-a'),[])
})
test('dates compute today/tomorrow from local calendar including month/year transitions', () => {
  const row = (task_date,start_time=null,end_time=null) => ({task_date,start_time,end_time})
  assert.equal(dates.formatTaskRow(row('2026-10-14','10:00:00','14:00:00'),now),'Today · Wed, 14 Oct · 10:00 – 14:00')
  assert.equal(dates.formatTaskRow(row('2026-10-15'),now),'Tomorrow · Thu, 15 Oct')
  assert.equal(dates.formatTaskRow(row('2027-01-01'),new Date(2026,11,31,23,59)),'Tomorrow · Fri, 1 Jan')
  assert.equal(dates.formatTaskRow(row(null)), 'Date and time not set')
})
test('same-year labels omit year; other-year labels honor Buddhist-year setting', () => {
  assert.equal(dates.formatTaskDateLabel('2026-10-14',now),'14 October')
  assert.equal(dates.formatTaskDateLabel('2027-10-14',now),'14 October 2027')
  assert.equal(dates.formatTaskDateLabel('2027-10-14',now,true),'14 October 2570')
  assert.equal(dates.USE_BUDDHIST_YEAR,false)
  assert.ok(dates.parseTaskDate('2028-02-29'));assert.equal(dates.parseTaskDate('2027-02-29'),null)
})
