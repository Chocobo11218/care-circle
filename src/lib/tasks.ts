import type { Task } from '../types'
import type { TaskDraft } from './task-draft-context'
import { localISODate, parseTaskDate } from './date'
import { t } from '../i18n/en'

export interface TaskChange { eventType: 'INSERT' | 'UPDATE' | 'DELETE'; new: Partial<Task>; old: Partial<Task> }
export function needsAttention(task: Task) { return task.assignee_id === null }
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.task_date !== b.task_date) return a.task_date === null ? 1 : b.task_date === null ? -1 : a.task_date.localeCompare(b.task_date)
    if (a.start_time !== b.start_time) return a.start_time === null ? 1 : b.start_time === null ? -1 : a.start_time.localeCompare(b.start_time)
    return 0
  })
}
export function taskSections(tasks: Task[], now = new Date()) {
  return { attention: sortTasks(tasks.filter(needsAttention)), upcoming: sortTasks(tasks.filter(task => !needsAttention(task) && task.task_date !== null && task.task_date >= localISODate(now))) }
}
export function mergeTaskChange(tasks: Task[], change: TaskChange, circleId: string): Task[] {
  const id = change.eventType === 'DELETE' ? change.old.id : change.new.id
  if (!id) return tasks
  if (change.eventType === 'DELETE') return tasks.filter(task => task.id !== id)
  if (change.new.circle_id !== circleId) return change.eventType === 'UPDATE' && change.new.circle_id ? tasks.filter(task => task.id !== id) : tasks
  return tasks.some(task => task.id === id) ? tasks.map(task => task.id === id ? { ...task, ...change.new } : task) : [...tasks, change.new as Task]
}
export type TaskErrors = Partial<Record<'elderId' | 'title' | 'date' | 'endTime', string>>
export function validateTaskDraft(draft: TaskDraft, elderIds: string[], selectedElderId: string | null, now = new Date()): TaskErrors {
  const errors: TaskErrors = {}
  if (elderIds.length && (!selectedElderId || !elderIds.includes(selectedElderId))) errors.elderId = t.taskCreate.elderRequired
  if (!draft.title.trim()) errors.title = t.taskCreate.nameRequired
  if (!draft.date) errors.date = t.taskCreate.dateRequired
  else if (!parseTaskDate(draft.date) || draft.date < localISODate(now)) errors.date = t.taskCreate.dateInvalid
  if (draft.startTime && draft.endTime && draft.endTime <= draft.startTime) errors.endTime = t.taskCreate.endInvalid
  return errors
}
export function taskInsert(draft: TaskDraft, circleId: string, memberId: string, elderId: string | null, assigneeId: string | null) {
  return { circle_id: circleId, created_by: memberId, elder_id: elderId, assignee_id: assigneeId,
    title: draft.title.trim(), location: draft.location.trim() || null, task_date: draft.date,
    start_time: draft.startTime || null, end_time: draft.endTime || null,
    description: draft.description.trim() || null, note: draft.note.trim() || null }
}
