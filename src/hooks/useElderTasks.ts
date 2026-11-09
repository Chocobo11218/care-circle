import { useFamilyTasks } from './useFamilyTasks'
import { useSession } from './useSession'
import { localISODate } from '../lib/date'
import { sortTasks, tasksForElder } from '../lib/tasks'

export function useElderTasks(now: Date) {
  const { me } = useSession()
  const feed = useFamilyTasks()
  const tasks = me ? tasksForElder(feed.tasks, me.id) : []
  const today = localISODate(now)
  const upcoming = sortTasks(tasks.filter(task => task.task_date && task.task_date >= today))
  return { ...feed, tasks, upcoming }
}
