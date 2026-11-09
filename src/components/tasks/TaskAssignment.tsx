import Button from '../Button'
import Avatar from '../family/Avatar'
import { useSession } from '../../hooks/useSession'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useAssignTask } from '../../hooks/useAssignTask'
import { t } from '../../i18n/en'
import type { Task } from '../../types'

export default function TaskAssignment({ task }: { task: Task }) {
  const { members } = useFamilyMembers()
  const { me } = useSession()
  const { assign, busy, error } = useAssignTask()
  const name = members.find(member => member.id === task.assignee_id)?.first_name
    ?? (me?.id === task.assignee_id ? me.first_name : t.taskList.familyMember)
  if (task.assignee_id !== null) return <div className="task-assignee"><Avatar name={name} small /><p>{t.taskList.assigned(name)}</p></div>
  return <div className="task-assignment">
    <Button variant="outline" className="family-pill" disabled={busy} onClick={() => void assign(task)}>{busy ? t.taskList.assigning : t.taskList.assign}</Button>
    {error && <p role="alert" className="mt-3 text-error">{t.taskList.assignError}</p>}
  </div>
}
