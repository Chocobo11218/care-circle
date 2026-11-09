import { useContext } from 'react'
import { TaskDraftContext } from '../lib/task-draft-context'
export function useTaskDraft() {
  const context = useContext(TaskDraftContext)
  if (!context) throw new Error('useTaskDraft must be used inside TaskDraftProvider')
  return context
}
