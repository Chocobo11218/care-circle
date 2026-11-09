import { useState } from 'react'
import Avatar from '../family/Avatar'
import Button from '../Button'
import { t } from '../../i18n/en'
import type { Member } from '../../types'

export default function CareRecipientOptions({ members, selected, onChange, error, disabled }: {
  members: Member[]
  selected: string[]
  onChange: (ids: string[]) => void
  error?: string
  disabled: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const elders = members.filter(member => member.role === 'elderly')
  const others = members.filter(member => member.role !== 'elderly')
  const showOthers = expanded || elders.length === 0
  const visible = [...elders, ...others.filter(member => showOthers || selected.includes(member.id))]

  return <fieldset className="task-elder-options" aria-label={t.taskCreate.who}
    aria-invalid={!!error} aria-describedby={error ? 'task-elder-error' : undefined} tabIndex={-1}>
    {visible.map(member => {
      const checked = selected.includes(member.id)
      return <label key={member.id} className={`task-elder-option ${checked ? 'task-selected-elder' : ''}`}>
        <input type="checkbox" checked={checked} disabled={disabled}
          onChange={() => onChange(checked ? selected.filter(id => id !== member.id) : [...selected, member.id])} />
        <Avatar name={member.first_name} small />
        <span className="min-w-0 flex-1 break-words">{member.first_name}</span>
        {member.role === 'elderly' && <span className="task-elder-badge">{t.taskCreate.elderly}</span>}
      </label>
    })}
    {!showOthers && others.some(member => !selected.includes(member.id)) &&
      <Button type="button" variant="outline" className="family-pill" disabled={disabled}
        onClick={() => setExpanded(true)}>{t.chooseMember.someoneElse}</Button>}
  </fieldset>
}
