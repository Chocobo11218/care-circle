import { Link, useParams } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import TaskIcon from '../../components/tasks/TaskIcon'
import TaskFacts from '../../components/tasks/TaskFacts'
import TaskAssignment from '../../components/tasks/TaskAssignment'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useLocalClock } from '../../hooks/useLocalClock'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function TaskDetails() {
  const { id } = useParams()
  const { tasks, loading, error } = useFamilyTasks()
  const members = useFamilyMembers()
  const now = useLocalClock()
  useScreenEvent('task_details')
  const task = tasks.find(task => task.id === id)
  return <>
    <TopBar title={t.taskDetails.title} />
    <TaskFeedStatus />
    <MemberFeedStatus loading={members.loading} error={members.error && !members.members.length} retry={members.refetch} />
    {!loading && !error && !task && <div className="family-feed-status"><p role="status">{t.taskDetails.missing}</p><Link className="task-invite-link" to="/family/tasks">{t.taskDetails.back}</Link></div>}
    {!loading && !members.loading && task && <><article className="task-detail-card">
      <h2>{task.title}</h2><div className="task-divider" />
      <TaskFacts task={task} now={now} creator emptyRecipient={
        <p className="task-elder-pill task-elder-pill-empty">{t.taskDetails.noRecipient}</p>
      } />
      <div className="task-divider" />
      <section className="task-description-block"><h3>{t.taskDetails.description}</h3><p>{task.description || t.taskDetails.noDescription}</p></section>
      {task.note && <section className="task-note-box"><h3>{t.taskDetails.note}</h3><p>{task.note}</p></section>}
      <TaskAssignment task={task} />
    </article>
    <div className="task-edit-action"><Link className="task-pill-link" to={`/family/tasks/${task.id}/edit`} state={{ fromDetails: true }}><TaskIcon kind="edit" />{t.taskEdit.title}</Link></div></>}
  </>
}
