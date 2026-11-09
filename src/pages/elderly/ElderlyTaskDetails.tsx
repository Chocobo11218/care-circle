import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useElderTasks } from '../../hooks/useElderTasks'
import { useLocalClock } from '../../hooks/useLocalClock'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useTaskCompanion } from '../../hooks/useTaskCompanion'
import { t } from '../../i18n/en'
import { CompanionPill, ElderContactCard, ElderTaskFacts, PlaceholderButton } from './ElderTaskContent'

export default function ElderlyTaskDetails() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const back = state?.from === 'tasks' ? '/elderly/tasks' : '/elderly'
  const { tasks, loading, error } = useElderTasks(useLocalClock())
  const task = tasks.find(task => task.id === id)
  const companion = useTaskCompanion(task)
  useScreenEvent('elder_task_details')

  return <>
    <TopBar title={t.taskDetails.title} onBack={() => navigate(back)} />
    <TaskFeedStatus />
    {task ? <section className="elder-section" key={task.id}>
      <article className="elder-card">
        <h2 className="elder-card-title">{task.title}</h2>
        <ElderTaskFacts task={task} />
        {companion && <CompanionPill companion={companion} />}
        <div className="task-description-block border-t border-stroke pt-3">
          <h3>{t.taskDetails.description}</h3>
          <p>{task.description || t.taskDetails.noDescription}</p>
        </div>
        {task.note?.trim() && <div className="task-note-box rounded-2xl">
          <h3>{t.taskDetails.note}</h3><p>{task.note}</p>
        </div>}
        <PlaceholderButton label={t.elderly.listenDetails} variant="primary" />
      </article>
      {companion && <ElderContactCard companion={companion} />}
    </section> : !loading && !error && <section className="elder-section">
      <p>{t.taskDetails.missing}</p>
      <Link className="elder-link" to={back}>{back === '/elderly' ? t.elderly.backHome : t.taskDetails.back}</Link>
    </section>}
  </>
}
