import { Outlet, useOutletContext, useParams } from 'react-router-dom'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { TaskDraftProvider } from '../../lib/task-draft'
import { draftFromTask } from '../../lib/tasks'

export default function SavedTaskDraft() {
  const family = useOutletContext()
  const { id } = useParams()
  const { tasks } = useFamilyTasks()
  const task = tasks.find(item => item.id === id)
  if (!task) return <Outlet context={family} />
  return <TaskDraftProvider key={task.id} initialDraft={draftFromTask(task)}><Outlet context={family} /></TaskDraftProvider>
}
