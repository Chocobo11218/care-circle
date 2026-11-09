import { createContext } from 'react'

export interface TaskDraft {
  assigneeId: string | null
  recipientIds: string[] | null
  title: string
  location: string
  date: string
  startTime: string
  endTime: string
  description: string
  note: string
}

export const emptyTaskDraft: TaskDraft = { assigneeId: null, recipientIds: null, title: '', location: '', date: '', startTime: '', endTime: '', description: '', note: '' }
export interface TaskDraftValue { draft: TaskDraft; update: (patch: Partial<TaskDraft>) => void; clear: () => void }
export const TaskDraftContext = createContext<TaskDraftValue | null>(null)
