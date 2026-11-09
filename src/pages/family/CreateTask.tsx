import { useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import TopBar from '../../components/TopBar'
import Avatar from '../../components/family/Avatar'
import CareRecipientOptions from '../../components/tasks/CareRecipientOptions'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import TaskIcon from '../../components/tasks/TaskIcon'
import { useSession } from '../../hooks/useSession'
import { useTaskDraft } from '../../hooks/useTaskDraft'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useUpdateTask } from '../../hooks/useUpdateTask'
import { useCreateTask } from '../../hooks/useCreateTask'
import AssignmentIcon from '../../components/tasks/AssignmentIcon'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useLocalClock } from '../../hooks/useLocalClock'
import { splitMembers } from '../../lib/members'
import { localISODate } from '../../lib/date'
import { careRecipientIds, selectedCareRecipients, taskFields, validateTaskDraft, type TaskErrors } from '../../lib/tasks'
import type { Task } from '../../types'
import { t } from '../../i18n/en'

export default function CreateTask({ editing }: { editing?: Task }) {
  const { me } = useSession()
  const { draft, update, clear } = useTaskDraft()
  const { members, loading, error: memberError, refetch } = useFamilyMembers()
  const creation = useCreateTask()
  const edit = useUpdateTask()
  const busy = creation.busy || edit.busy
  const saveError = editing ? edit.error : creation.error
  const detailsPath = editing ? `/family/tasks/${editing.id}` : undefined
  const now = useLocalClock()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [errors, setErrors] = useState<TaskErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  useScreenEvent(editing ? 'edit_task' : 'create_task')
  const elders = splitMembers(members).realElders
  const recipientIds = selectedCareRecipients(draft, members, elders)
  const elderId = recipientIds.find(id => members.some(member => member.id === id && member.role === 'elderly')) ?? null
  const elderError = errors.elderId
  const blocked = loading || (memberError && !members.length) || busy
  const assigneeId = editing ? editing.assignee_id : draft.assigneeId
  const chosen = me?.id === assigneeId ? me : members.find(member => member.role === 'family' && member.id === assigneeId)

  function validate() {
    if (blocked || !me) return false
    const nextErrors = validateTaskDraft(draft, elders.length > 0, recipientIds)
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) return true
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
    return false
  }

  function openPicker() {
    if (!validate()) return
    update({ recipientIds })
    navigate('/family/tasks/new/choose-member', { state: { from: '/family/tasks/new' } })
  }

  function backToDetails() {
    if (state?.fromDetails) navigate(-1)
    else if (detailsPath) navigate(detailsPath, { replace: true })
  }

  async function save() {
    if (!validate() || !me) return
    if (editing) {
      const { elder_id, care_recipient_ids, ...fields } = taskFields({ ...draft, recipientIds }, elderId)
      const existing = careRecipientIds(editing)
      const changed = existing.length !== recipientIds.length || recipientIds.some(id => !existing.includes(id))
      if (await edit.updateTask(editing, changed ? { ...fields, elder_id, care_recipient_ids } : fields)) {
        backToDetails()
      }
      return
    }
    const task = await creation.create({ ...draft, recipientIds }, elderId, chosen?.id ?? null)
    if (!task) return
    clear()
    navigate(task.assignee_id ? `/family/tasks/${task.id}` : '/family/tasks', { replace: true })
  }
  function submit(event: FormEvent) { event.preventDefault(); void save() }
  return <>
    <TopBar title={editing ? t.taskEdit.title : t.taskCreate.title}
      onBack={detailsPath ? () => { if (!busy) backToDetails() } : undefined} />
    <form ref={formRef} className="task-create-form" noValidate onSubmit={submit}>
      <section><h2>{t.taskCreate.who}</h2>
        <MemberFeedStatus loading={loading} error={memberError && !members.length} retry={refetch} />
        {!loading && !(memberError && !members.length) && (members.length ? <CareRecipientOptions members={members} selected={recipientIds} onChange={recipientIds => update({ recipientIds })}
          error={elderError} disabled={busy} /> : <><Input label={t.taskCreate.who} value={t.taskCreate.noElder} disabled /><Link className="task-invite-link" to="/family/add-member">{t.taskCreate.invite}</Link></>)}
        {elderError && <p role="alert" id="task-elder-error" className="task-field-error">{elderError}</p>}
      </section>
      <section className="form-stack"><h2>{t.taskCreate.details}</h2>
        <Input id="task-title" required label={t.taskCreate.name} placeholder={t.taskCreate.namePlaceholder} value={draft.title} error={errors.title} disabled={busy} onChange={event => update({ title: event.target.value })} />
        <div className="task-location-input"><Input id="task-location" label={t.taskCreate.location} placeholder={t.taskCreate.locationPlaceholder} value={draft.location} disabled={busy} onChange={event => update({ location: event.target.value })} /><span aria-hidden="true"><TaskIcon kind="search" /></span></div>
        <Input id="task-date" required label={t.taskCreate.date} type="date" lang="en-GB" min={localISODate(now)} value={draft.date} error={errors.date} disabled={busy} onChange={event => update({ date: event.target.value })} />
        <div className="task-time-fields"><Input id="task-start" label={t.taskCreate.start} type="time" lang="en-GB" step={60} value={draft.startTime} disabled={busy} onChange={event => update({ startTime: event.target.value })} />
          <Input id="task-end" label={t.taskCreate.end} type="time" lang="en-GB" step={60} value={draft.endTime} error={errors.endTime} disabled={busy} onChange={event => update({ endTime: event.target.value })} /></div>
      </section>
      <section><label htmlFor="task-description" className="task-section-label">{t.taskCreate.description}</label><textarea id="task-description" className="task-textarea" placeholder={t.taskCreate.descriptionPlaceholder} value={draft.description} disabled={busy} onChange={event => update({ description: event.target.value })} /></section>
      <section><label htmlFor="task-note" className="task-section-label">{t.taskCreate.notes}</label><textarea id="task-note" className="task-textarea task-note-input" placeholder={t.taskCreate.notesPlaceholder} value={draft.note} disabled={busy} onChange={event => update({ note: event.target.value })} /></section>
      <section>
        <h2>{t.taskCreate.responsibility}</h2>
        <div className="task-responsibility">
          {editing ? <>
            {assigneeId ? <div className="task-assignee"><Avatar name={chosen?.first_name ?? t.taskList.familyMember} small />
              <p>{t.taskList.assigned(chosen?.first_name ?? t.taskList.familyMember)}</p></div> : <p>{t.taskEdit.unassigned}</p>}
            <Link className="task-pill-link" to={`${detailsPath}/choose-member`} state={{ from: `${detailsPath}/edit`, expectedAssignee: editing.assignee_id }}>{t.chooseMember.someoneElse}</Link>
          </> : chosen ? <>
            <div className="task-assignee"><Avatar name={chosen.first_name} small /><p>{t.taskList.assigned(chosen.first_name)}</p></div>
            <Button type="button" variant="outline" className="family-pill" disabled={blocked} onClick={openPicker}>{t.chooseMember.someoneElse}</Button>
          </> : <>
            <Button type="button" variant="outline" className="family-pill" disabled={blocked} onClick={() => { if (me) update({ assigneeId: me.id }) }}>{t.taskCreate.assign}</Button>
            <Button type="button" className="family-pill family-action-button" disabled={blocked} onClick={openPicker}>
              <AssignmentIcon kind="sparkles" />{t.chooseMember.find}
            </Button>
          </>}
        </div>
      </section>
      {saveError && <p role="alert" className="text-error">{editing ? t.taskEdit.error : t.taskCreate.saveError}</p>}
      <Button type="submit" variant="secondary" className="family-pill" disabled={blocked}>{busy ? t.taskCreate.saving : editing ? t.taskEdit.save : t.taskCreate.save}</Button>
    </form>
  </>
}
