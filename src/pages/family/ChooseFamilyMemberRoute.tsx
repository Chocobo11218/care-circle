import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ChooseFamilyMemberPage from './ChooseFamilyMemberPage'
import TopBar from '../../components/TopBar'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useAssignTask } from '../../hooks/useAssignTask'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useSession } from '../../hooks/useSession'
import { useTaskDraft } from '../../hooks/useTaskDraft'
import { assignmentCandidates, splitMembers } from '../../lib/members'
import { selectedCareRecipients, taskInsert } from '../../lib/tasks'
import { t } from '../../i18n/index'

export default function ChooseFamilyMemberRoute() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { me, circle } = useSession()
  const { draft, update } = useTaskDraft()
  const memberFeed = useFamilyMembers()
  const taskFeed = useFamilyTasks()
  const assignment = useAssignTask()
  const [selection, setSelection] = useState<string | null>(null)
  useScreenEvent('choose_member')
  const canReassign = !!id && state && 'expectedAssignee' in state && state.from === `/family/tasks/${id}/edit`
  const fallback = id ? `/family/tasks/${id}` : '/family/tasks/new'
  const back = () => {
    if (state?.from) navigate(-1)
    else navigate(fallback, { replace: true })
  }
  const members = memberFeed.members
  const candidates = assignmentCandidates(me && !members.some(member => member.id === me.id) ? [...members, me] : members)
  const selected = candidates.find(member => member.id === (id ? selection : draft.assigneeId))
  const elders = splitMembers(memberFeed.members).realElders
  const recipientIds = selectedCareRecipients(draft, members, elders)
  const elderId = recipientIds.find(id => members.some(member => member.id === id && member.role === 'elderly')) ?? null
  const task = id ? taskFeed.tasks.find(task => task.id === id)
    : me && circle ? { ...taskInsert({ ...draft, recipientIds }, circle.id, me.id, elderId, null), id: '', created_at: '' } : undefined
  const busy = assignment.busy
  if (!id && (!draft.title.trim() || !draft.date)) return <Navigate to={fallback} replace />
  if (memberFeed.loading || (memberFeed.error && !memberFeed.members.length) || (id && (taskFeed.loading || (taskFeed.error && !task)))) {
    return <>
      <TopBar title={t.chooseMember.title} onBack={back} />
      <MemberFeedStatus loading={memberFeed.loading} error={memberFeed.error && !memberFeed.members.length} retry={memberFeed.refetch} />
      {id && <TaskFeedStatus />}
    </>
  }
  if (!task) return <>
    <TopBar title={t.chooseMember.title} onBack={back} />
    <p role="status">{t.taskDetails.missing}</p>
    <Link className="task-invite-link" to="/family/tasks">{t.taskDetails.back}</Link>
  </>

  async function send(memberId: string) {
    if (!task || busy || !candidates.some(member => member.id === memberId)) return
    if (id) {
      if (await assignment.assign(task, memberId, canReassign ? state.expectedAssignee : null)) back()
      return
    }
    update({ assigneeId: memberId })
    back()
  }

  return <ChooseFamilyMemberPage task={task} candidates={candidates} selected={selected} busy={busy}
    currentMemberId={me?.id} isDraft={!id} assigned={!!id && task.assignee_id !== (canReassign ? state.expectedAssignee : null)}
    error={assignment.error ? t.taskList.assignError : undefined}
    onSelect={id ? setSelection : assigneeId => update({ assigneeId })}
    onBack={() => { if (!busy) back() }} onSend={memberId => void send(memberId)} />
}
