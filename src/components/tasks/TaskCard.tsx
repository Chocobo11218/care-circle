import { Link } from 'react-router-dom'
import TaskFacts from './TaskFacts'
import TaskAssignment from './TaskAssignment'
import { needsAttention } from '../../lib/tasks'
import { formatTaskDateLabel } from '../../lib/date'
import { t } from '../../i18n/en'
import type { Task } from '../../types'

export default function TaskCard({ task, now }: { task: Task; now: Date }) {
  return <article className={`task-card ${needsAttention(task) ? 'task-needs-attention' : ''}`}>
    <Link to={`/family/tasks/${task.id}`} className="task-card-body" aria-label={t.taskList.open(task.title)}>
      <p className="task-date-label">{formatTaskDateLabel(task.task_date, now)}</p>
      <h3>{task.title}</h3>
      <div className="task-divider" />
      <TaskFacts task={task} now={now} />
    </Link>
    <div className="task-card-action">{task.elder_id === null && <Link className="task-pill-link" to={`/family/tasks/${task.id}/choose-elder`}>{t.chooseElder.title}</Link>}
      <TaskAssignment task={task} /></div>
  </article>
}
