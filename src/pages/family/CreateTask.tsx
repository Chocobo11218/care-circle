import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import TopBar from '../../components/TopBar'
import Avatar from '../../components/family/Avatar'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import TaskIcon from '../../components/tasks/TaskIcon'
import { useSession } from '../../hooks/useSession'
import { useTaskDraft } from '../../hooks/useTaskDraft'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useLocalClock } from '../../hooks/useLocalClock'
import { splitMembers } from '../../lib/members'
import { localISODate } from '../../lib/date'
import { taskInsert, validateTaskDraft, type TaskErrors } from '../../lib/tasks'
import { supabase } from '../../lib/supabase'
import { t } from '../../i18n/en'
import type { Task } from '../../types'

export default function CreateTask() {
  const { me, circle } = useSession()
  const { draft, update, clear } = useTaskDraft()
  const { members, loading, error: memberError, refetch } = useFamilyMembers()
  const { acceptTask } = useFamilyTasks()
  const now = useLocalClock()
  const navigate = useNavigate()
  const [errors, setErrors] = useState<TaskErrors>({})
  const [saveError, setSaveError] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  useScreenEvent('/family/tasks/new')
  const elders = splitMembers(members).realElders
  const selectedElderId = elders.find(elder => elder.id === draft.elderId)?.id ?? (elders.length === 1 ? elders[0].id : null)
  const elderError = elders.length > 0 && !selectedElderId ? errors.elderId : undefined
  const blocked = loading || (memberError && !members.length) || busy
  async function save(selfAssign: boolean) {
    if (pending.current || blocked || !me || !circle) return
    const nextErrors = validateTaskDraft(draft, elders.map(elder => elder.id), selectedElderId)
    setErrors(nextErrors); setSaveError(false)
    if (Object.keys(nextErrors).length) {
      requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    pending.current = true; setBusy(true)
    try {
      const { data, error } = await supabase.from('tasks').insert(taskInsert(draft, circle.id, me.id, selectedElderId, selfAssign)).select('*').single()
      if (error || !data) throw error ?? new Error('Task insert returned no row')
      acceptTask(data as Task); clear()
      navigate(selfAssign ? `/family/tasks/${data.id}` : '/family/tasks', { replace: true })
    } catch { setSaveError(true) }
    finally { pending.current = false; setBusy(false) }
  }
  function submit(event: FormEvent) { event.preventDefault(); void save(false) }
  return <>
    <TopBar title={t.taskCreate.title} />
    <form ref={formRef} className="task-create-form" noValidate onSubmit={submit}>
      <section><h2>{t.taskCreate.who}</h2>
        <MemberFeedStatus loading={loading} error={memberError && !members.length} retry={refetch} />
        {!loading && !(memberError && !members.length) && (elders.length ? <fieldset className="task-elder-options" role="radiogroup" aria-required="true" aria-label={t.taskCreate.who} aria-invalid={!!elderError} aria-describedby={elderError ? 'task-elder-error' : undefined} tabIndex={-1}>
          {elders.map(elder => <label key={elder.id} className={`task-elder-option ${selectedElderId === elder.id ? 'task-selected-elder' : ''}`}>
            <input type="radio" name="elder" value={elder.id} checked={selectedElderId === elder.id} disabled={busy} onChange={() => update({ elderId: elder.id })} />
            <Avatar name={elder.first_name} small /><span className="min-w-0 flex-1 break-words">{elder.first_name}</span><span className="task-elder-badge">{t.taskCreate.elderly}</span>
          </label>)}
        </fieldset> : <><Input label={t.taskCreate.who} value={t.taskCreate.noElder} disabled /><Link className="task-invite-link" to="/family/add-member">{t.taskCreate.invite}</Link></>)}
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
      <section><h2>{t.taskCreate.responsibility}</h2><div className="task-responsibility"><Button type="button" variant="outline" className="family-pill" disabled={blocked} onClick={() => void save(true)}>{busy ? t.taskCreate.saving : t.taskCreate.assign}</Button></div></section>
      {saveError && <p role="alert" className="text-error">{t.taskCreate.saveError}</p>}
      <Button type="submit" variant="secondary" className="family-pill" disabled={blocked}>{busy ? t.taskCreate.saving : t.taskCreate.save}</Button>
    </form>
  </>
}
