import { useRef } from 'react'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import Avatar from '../../components/family/Avatar'
import AssignmentIcon from '../../components/tasks/AssignmentIcon'
import TaskFacts from '../../components/tasks/TaskFacts'
import TaskIcon from '../../components/tasks/TaskIcon'
import { useLocalClock } from '../../hooks/useLocalClock'
import { splitAssignmentCandidates } from '../../lib/members'
import { t } from '../../i18n/en'
import type { Member, Task } from '../../types'

interface Props {
  task: Task
  candidates: Member[]
  currentMemberId?: string
  selected: Member | undefined
  onSelect: (id: string | null) => void
  onBack: () => void
  onSend: (id: string) => void
  busy: boolean
  error: string | undefined
  isDraft: boolean
  assigned: boolean
}

export default function ChooseFamilyMemberPage({ task, candidates, currentMemberId, selected, onSelect, onBack, onSend, busy, error, isDraft, assigned }: Props) {
  const now = useLocalClock()
  const info = useRef<HTMLDialogElement>(null)
  const strings = t.chooseMember
  const { recommended, others } = splitAssignmentCandidates(candidates)
  const displayName = (member: Member) => member.id === currentMemberId ? strings.you(member.first_name) : member.first_name
  function selectButton(member: Member) {
    const isSelected = member.id === selected?.id
    const name = displayName(member)
    return <Button type="button" variant={isSelected ? 'primary' : 'outline'} className="family-pill family-action-button"
      aria-pressed={isSelected} aria-label={isSelected ? strings.selectedName(name) : strings.selectName(name)}
      disabled={busy || assigned} onClick={() => onSelect(isSelected ? null : member.id)}>
      {isSelected && <AssignmentIcon kind="check" />}{isSelected ? strings.selected : strings.select}
    </Button>
  }
  return <>
    <TopBar title={strings.title} onBack={onBack} />
    <article className="task-detail-card">
      <h2>{task.title}</h2>
      <div className="task-divider" />
      <TaskFacts task={task} now={now} hideEmpty />
      {task.description && <>
        <div className="task-divider" />
        <section className="task-description-block"><h3>{strings.description}</h3><p>{task.description}</p></section>
      </>}
      {task.note && <section className="task-note-box"><h3>{t.taskDetails.note}</h3><p>{task.note}</p></section>}
    </article>
    <section className="assignment-list">
      <div className="assignment-heading">
        <AssignmentIcon kind="sparkles" />
        <h2>{strings.who}</h2>
        <button type="button" className="assignment-info" aria-label={strings.info} onClick={() => info.current?.showModal()}><AssignmentIcon kind="info" /></button>
      </div>
      <dialog ref={info} className="assignment-sheet" aria-labelledby="assignment-info-text">
        <p id="assignment-info-text">{strings.explanation}</p>
        <form method="dialog"><Button variant="secondary" className="family-pill">{strings.close}</Button></form>
      </dialog>
      {!candidates.length && <p>{strings.empty}</p>}
      {recommended.map((member, index) => {
        const isSelected = member.id === selected?.id
        const label = member.match_label
        return <article key={member.id} className={`assignment-candidate ${isSelected ? 'assignment-selected' : ''}`}>
          <div className="assignment-person">
            <Avatar name={member.first_name} small />
            <h3>{displayName(member)}</h3>
            {label && <span className={`assignment-badge assignment-badge-${label}`}><AssignmentIcon kind={label} />{strings.labels[label]}</span>}
          </div>
          <div className="assignment-meta">
            {member.availability && <span><AssignmentIcon kind="check" />{member.availability}</span>}
            {member.distance_km != null && <span><TaskIcon kind="location" />{strings.distance(member.distance_km)}</span>}
          </div>
          {!!member.match_reasons?.length && <details open={index === 0}>
            <summary>{strings.why}</summary>
            <blockquote>{member.match_reasons.map((reason, index) => <p key={index}>{reason}</p>)}</blockquote>
          </details>}
          {selectButton(member)}
        </article>
      })}
      {!!others.length && <details className="assignment-others" open={others.some(member => member.id === selected?.id)}>
        <summary>{strings.chooseOther}</summary>
        <section className="assignment-candidate assignment-other-list">
          <h3>{strings.otherMembers}</h3>
          {others.map(member => <div key={member.id} className="assignment-other-row">
            <Avatar name={member.first_name} small />
            <p>{displayName(member)}</p>
            {selectButton(member)}
          </div>)}
        </section>
      </details>}
      {selected && <section className="assignment-list">
        <div className="assignment-heading"><AssignmentIcon kind="people" /><h2>{strings.selectedMembers}</h2></div>
        <div className="assignment-candidate assignment-person"><Avatar name={selected.first_name} small /><p>{displayName(selected)}</p></div>
      </section>}
    </section>
    <footer className="assignment-footer">
      {(error || assigned) && <p role="alert" className="text-error">{error ?? strings.alreadyAssigned}</p>}
      <Button type="button" variant="secondary" className="family-pill" disabled={!selected || busy || assigned} onClick={() => { if (selected) onSend(selected.id) }}>
        {busy ? strings.sending : isDraft ? strings.confirm : strings.send}
      </Button>
    </footer>
  </>
}
