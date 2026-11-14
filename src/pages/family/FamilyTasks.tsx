import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PlusIcon from '../../components/family/PlusIcon'
import TaskSections from '../../components/tasks/TaskSections'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import TopBar from '../../components/TopBar'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/index'

export default function FamilyTasks() {
  useScreenEvent('/family/tasks')
  const { tasks, loading, error } = useFamilyTasks()
  const navigate = useNavigate()
  return <><TopBar title={t.familyTasks.title} showBack={false} /><TaskFeedStatus />
    {!loading && !error && (tasks.length ? <TaskSections /> : <ActivityEmptyState />)}
    {!loading && tasks.length > 0 && <div className="task-floating-add"><Button variant="outline" className="family-pill family-action-button" onClick={() => navigate('/family/tasks/new')}><PlusIcon />{t.familyTasks.add}</Button></div>}
  </>
}
