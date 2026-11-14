import { memberCopy } from '../../i18n/member-copy'
import { Link, useLocation } from 'react-router-dom'
import AssignmentIcon from './AssignmentIcon'
import Button from '../Button'
import Avatar from '../family/Avatar'
import { useSession } from '../../hooks/useSession'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useAssignTask } from '../../hooks/useAssignTask'
import { t } from '../../i18n/index'
import type { Task } from '../../types'

export default function TaskAssignment({ task }: { task: Task }) {
  const { members } = useFamilyMembers()
  const { me } = useSession()
  const { pathname } = useLocation()
  const suggested = members.find(member => member.is_mock && member.role === 'family' && member.match_label === 'best' && member.id !== me?.id)
  const { assign, busy, error } = useAssignTask()
  const name = members.find(member => member.id === task.assignee_id)?.first_name
    ?? (me?.id === task.assignee_id ? me.first_name : t.taskList.familyMember)
  if (task.assignee_id !== null) return <div className="task-assignee"><Avatar name={name} small /><p>{t.taskList.assigned(name)}</p></div>
  return <div className="task-assignment">
    <Button variant="outline" className="family-pill" disabled={busy} onClick={() => void assign(task)}>{busy ? t.taskList.assigning : t.taskList.assign}</Button>
    {suggested && <>
      <p className="assignment-or">{t.chooseMember.or}</p>
      <div className="assignment-suggestion">
        <div className="assignment-person">
          <Avatar name={suggested.first_name} small />
          <div className="min-w-0"><p className="text-body-large font-medium">{suggested.first_name}</p>{suggested.availability && <p className="wrap-anywhere" title={memberCopy(suggested.availability, suggested.is_mock)}>{memberCopy(suggested.availability, suggested.is_mock)}</p>}</div>
          <span className="assignment-badge assignment-badge-suggested"><AssignmentIcon kind="sparkles" />{t.chooseMember.suggested}</span>
        </div>
        <Button type="button" variant="secondary" className="family-pill" disabled={busy} onClick={() => void assign(task, suggested.id)}>{t.chooseMember.request(suggested.first_name)}</Button>
        <Link className="assignment-text-action" to={`/family/tasks/${task.id}/choose-member`} state={{ from: pathname }}>{t.chooseMember.someoneElse}</Link>
      </div>
    </>}
    {error && <p role="alert" className="mt-3 text-error">{t.taskList.assignError}</p>}
  </div>
}
