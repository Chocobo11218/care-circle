import Avatar from '../family/Avatar'
import TaskIcon from './TaskIcon'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useSession } from '../../hooks/useSession'
import { formatTaskRow } from '../../lib/date'
import { t } from '../../i18n/en'
import type { Task } from '../../types'

export default function TaskFacts({ task, now, creator = false, hideEmpty = false }: { task: Task; now: Date; creator?: boolean; hideEmpty?: boolean }) {
  const { members } = useFamilyMembers()
  const { me } = useSession()
  const elder = members.find(member => member.id === task.elder_id)
  const creatorName = members.find(member => member.id === task.created_by)?.first_name
    ?? (me?.id === task.created_by ? me.first_name : t.taskList.familyMember)
  return <>
    {task.elder_id && <div className="task-elder-pill"><Avatar name={elder?.first_name ?? t.taskList.olderAdult} small /><span>{elder?.first_name ?? t.taskList.olderAdult}</span></div>}
    {(!hideEmpty || task.task_date || task.start_time || task.end_time || task.location || creator) && <div className="task-facts">
      {(!hideEmpty || task.task_date || task.start_time || task.end_time) && <p><TaskIcon kind="calendar" /><span>{formatTaskRow(task, now)}</span></p>}
      {task.location && <p><TaskIcon kind="location" /><span>{task.location}</span></p>}
      {creator && <p><TaskIcon kind="person" /><span>{t.taskList.creator(creatorName)}</span></p>}
    </div>}
  </>
}
