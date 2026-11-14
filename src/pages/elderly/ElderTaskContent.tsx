import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Member, Task } from '../../types'
import { useTaskCompanion } from '../../hooks/useTaskCompanion'
import { formatElderTaskDate, formatTaskTime } from '../../lib/date'
import { t } from '../../i18n/index'
import Button from '../../components/Button'
import Avatar from '../../components/family/Avatar'
import FamilyNavIcon from '../../components/family/FamilyNavIcon'

export function ElderTaskFacts({ task }: { task: Task }) {
  return <dl className="elder-facts">
    <dt>{t.elderly.date}</dt><dd>{formatElderTaskDate(task.task_date)}</dd>
    <dt>{t.elderly.time}</dt><dd>{formatTaskTime(task.start_time, task.end_time)}</dd>
    <dt>{t.elderly.location}</dt><dd>{task.location || t.elderly.unavailable}</dd>
  </dl>
}

export function CompanionPill({ companion }: { companion?: Member }) {
  return <div className="elder-companion">
    {companion ? <Avatar name={companion.first_name} small /> : <FamilyNavIcon kind="family" />}
    <span>{companion ? t.elderly.companion(companion.first_name) : t.elderly.pending}</span>
  </div>
}

export function PlaceholderButton({ label, variant }: {
  label: string
  variant: 'primary' | 'secondary' | 'outline'
}) {
  const [visible, setVisible] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function showMessage() {
    window.clearTimeout(timer.current)
    setVisible(true)
    timer.current = window.setTimeout(() => setVisible(false), 3000)
  }

  return <div className="min-w-0">
    <Button variant={variant} className="elder-button" onClick={showMessage}>{label}</Button>
    <div role="status">{visible && t.elderly.placeholder}</div>
  </div>
}

export function ElderContactCard({ companion }: { companion: Member }) {
  return <div className="elder-card">
    <h3 className="flex items-center gap-3 text-body-large font-medium"><Avatar name={companion.first_name} />{companion.first_name}</h3>
    <PlaceholderButton label={t.elderly.call} variant="outline" />
    <PlaceholderButton label={t.elderly.messages} variant="outline" />
  </div>
}

export function ElderTaskCard({ task, from }: { task: Task; from: 'home' | 'tasks' }) {
  const companion = useTaskCompanion(task)
  return <article className="elder-card">
    <header>
      <p className="task-date-label">{formatElderTaskDate(task.task_date)}</p>
      <h2 className="elder-card-title">{task.title}</h2>
    </header>
    <ElderTaskFacts task={task} />
    <CompanionPill companion={companion} />
    <div className="grid grid-cols-2 items-start gap-3">
      <PlaceholderButton label={t.elderly.listen} variant="secondary" />
      <Link className="elder-link" to={`/elderly/tasks/${task.id}`} state={{ from }}>
        {t.elderly.details}<span aria-hidden="true">→</span>
      </Link>
    </div>
  </article>
}
