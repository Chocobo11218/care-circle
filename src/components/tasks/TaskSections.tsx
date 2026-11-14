import TaskCard from './TaskCard'
import { taskSections } from '../../lib/tasks'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { useLocalClock } from '../../hooks/useLocalClock'
import { t } from '../../i18n/index'

export default function TaskSections() {
  const { tasks } = useFamilyTasks()
  const now = useLocalClock()
  const { attention, upcoming } = taskSections(tasks, now)
  return <div className="task-sections">
    {attention.length > 0 && <section><h3>{t.taskList.attention}</h3><div className="task-card-list">{attention.map(task => <TaskCard key={task.id} task={task} now={now} />)}</div></section>}
    {upcoming.length > 0 && <section><h3>{t.taskList.upcoming}</h3><div className="task-card-list">{upcoming.map(task => <TaskCard key={task.id} task={task} now={now} />)}</div></section>}
    {!attention.length && !upcoming.length && <p className="family-feed-status">{t.taskList.noUpcoming}</p>}
  </div>
}
