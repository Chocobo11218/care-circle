import Avatar from '../family/Avatar'
import { t } from '../../i18n/index'
import type { Member } from '../../types'

export default function ElderOptions({ elders, selected, onSelect, label, error, disabled }: {
  elders: Member[]
  selected: string | null
  onSelect: (id: string) => void
  label: string
  error?: string
  disabled: boolean
}) {
  return <fieldset className="task-elder-options" role="radiogroup" aria-required="true" aria-label={label}
    aria-invalid={!!error} aria-describedby={error ? 'task-elder-error' : undefined} tabIndex={-1}>
    {elders.map(elder => <label key={elder.id} className={`task-elder-option ${selected === elder.id ? 'task-selected-elder' : ''}`}>
      <input type="radio" name="elder" value={elder.id} checked={selected === elder.id} disabled={disabled} onChange={() => onSelect(elder.id)} />
      <Avatar name={elder.first_name} small /><span className="min-w-0 flex-1 break-words">{elder.first_name}</span><span className="task-elder-badge">{t.taskCreate.elderly}</span>
    </label>)}
  </fieldset>
}
