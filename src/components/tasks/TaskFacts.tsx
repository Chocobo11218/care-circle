import type { ReactNode } from 'react'
import Avatar from '../family/Avatar'
import TaskIcon from './TaskIcon'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useSession } from '../../hooks/useSession'
import { careRecipientIds } from '../../lib/tasks'
import { formatTaskRow } from '../../lib/date'
import { t } from '../../i18n/en'
import type { Task } from '../../types'

export default function TaskFacts({ task, now, creator = false, hideEmpty = false, emptyRecipient }: { task: Task; now: Date; creator?: boolean; hideEmpty?: boolean; emptyRecipient?: ReactNode }) {
  const { members } = useFamilyMembers()
  const { me } = useSession()
  const recipients = careRecipientIds(task)
  const creatorName = members.find(member => member.id === task.created_by)?.first_name
    ?? (me?.id === task.created_by ? me.first_name : t.taskList.familyMember)
  return <>
    {recipients.length ? <div className="grid gap-2">{recipients.map(id => {
      const name = members.find(member => member.id === id)?.first_name ?? t.taskList.familyMember
      return <div className="task-elder-pill" key={id}><Avatar name={name} small /><span>{name}</span></div>
    })}</div> : emptyRecipient}
    {(!hideEmpty || task.task_date || task.start_time || task.end_time || task.location || creator) && <div className="task-facts">
      {(!hideEmpty || task.task_date || task.start_time || task.end_time) && <p><TaskIcon kind="calendar" /><span>{formatTaskRow(task, now)}</span></p>}
      {task.location && <p><TaskIcon kind="location" /><span>{task.location}</span></p>}
      {creator && <p><TaskIcon kind="person" /><span>{t.taskList.creator(creatorName)}</span></p>}
    </div>}
  </>
}
