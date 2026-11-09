import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import ElderOptions from '../../components/tasks/ElderOptions'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useUpdateTask } from '../../hooks/useUpdateTask'
import { splitMembers } from '../../lib/members'
import { t } from '../../i18n/en'

export default function ChooseOlderAdult() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const tasks = useFamilyTasks()
  const members = useFamilyMembers()
  const { updateTask, busy, error } = useUpdateTask()
  const [selected, setSelected] = useState<string | null>(null)
  useScreenEvent('choose_older_adult')
  const task = tasks.tasks.find(item => item.id === id)
  const elders = splitMembers(members.members).realElders
  const canSave = task?.elder_id === null && elders.some(elder => elder.id === selected)
  const destination = state?.fromHome ? '/family' : `/family/tasks/${id}`

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!canSave || !task || !selected || busy) return
    if (await updateTask(task, { elder_id: selected })) navigate(destination, { replace: true })
  }

  return <>
    <TopBar title={t.chooseElder.title} onBack={() => { if (!busy) navigate(destination, { replace: true }) }} />
    <TaskFeedStatus />
    <MemberFeedStatus loading={members.loading} error={members.error && !members.members.length} retry={members.refetch} />
    {!tasks.loading && !tasks.error && !task && <p role="status">{t.taskDetails.missing}</p>}
    {task && task.elder_id !== null && <Link className="task-pill-link" to={destination} replace>{t.chooseElder.alreadyLinked}</Link>}
    {task?.elder_id === null && !members.loading && !(members.error && !members.members.length) &&
      <form className="form-stack" onSubmit={save}>
        <h2>{t.chooseElder.question}</h2>
        {elders.length ? <>
          <ElderOptions elders={elders} selected={selected} onSelect={setSelected} label={t.chooseElder.question} disabled={busy} />
          <Button type="submit" variant="secondary" className="family-pill" disabled={!canSave || busy}>{busy ? t.chooseElder.saving : t.chooseElder.save}</Button>
        </> : <><p>{t.taskCreate.noElder}</p><Link className="task-invite-link" to="/family/add-member">{t.taskCreate.invite}</Link></>}
      </form>}
    {error && <p role="alert" className="text-error">{t.chooseElder.error}</p>}
  </>
}
