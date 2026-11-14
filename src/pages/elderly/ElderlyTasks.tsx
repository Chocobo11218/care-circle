import TopBar from '../../components/TopBar'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useElderTasks } from '../../hooks/useElderTasks'
import { useLocalClock } from '../../hooks/useLocalClock'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/index'
import { ElderTaskCard } from './ElderTaskContent'

export default function ElderlyTasks() {
  const { upcoming, loading, error } = useElderTasks(useLocalClock())
  useScreenEvent('elder_tasks')

  return <>
    <TopBar title={t.familyTasks.title} showBack={false} />
    <TaskFeedStatus />
    <section className="elder-section">
      {(!loading && (!error || upcoming.length > 0)) && <h3>{t.elderly.upcoming(upcoming.length)}</h3>}
      {upcoming.map(task => <ElderTaskCard key={task.id} task={task} from="tasks" />)}
      {!loading && !error && !upcoming.length && <ActivityEmptyState elderly />}
    </section>
  </>
}
