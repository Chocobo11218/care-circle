import OnboardingIcon from './OnboardingIcon'

export default function PermissionSwitch({ title, description, checked, onChange, kind }: {
  title: string; description: string; checked: boolean; onChange: () => void
  kind: 'location' | 'notifications'
}) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={onChange} className="choice-card permission-card">
    <span className="text-muted"><OnboardingIcon kind={kind} /></span>
    <span className="flex min-w-0 flex-1 flex-col gap-2"><span className="text-body-large font-medium">{title}</span><span className="text-body">{description}</span></span>
    <span aria-hidden="true" className={`switch-track ${checked ? 'bg-btn-primary' : 'bg-btn-secondary'}`}>
      <span className={`switch-thumb ${checked ? 'translate-x-5' : ''}`} />
    </span>
  </button>
}
