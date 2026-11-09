import { Link, useParams } from 'react-router-dom'
import CreateTask from './CreateTask'
import TopBar from '../../components/TopBar'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { t } from '../../i18n/en'

export default function EditTask() {
  const { id } = useParams()
  const { tasks, loading, error } = useFamilyTasks()
  const task = tasks.find(item => item.id === id)
  if (task) return <CreateTask editing={task} />
  return <>
    <TopBar title={t.taskEdit.title} />
    <TaskFeedStatus />
    {!loading && !error && <div className="family-feed-status">
      <p role="status">{t.taskDetails.missing}</p>
      <Link className="task-invite-link" to="/family/tasks">{t.taskDetails.back}</Link>
    </div>}
  </>
}
