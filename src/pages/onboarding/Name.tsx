import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useDraft } from '../../hooks/useDraft'
import { t } from '../../i18n/en'

export default function Name() {
  const { draft, update } = useDraft()
  const navigate = useNavigate()
  const valid = !!draft.firstName.trim() && !!draft.lastName.trim()
  return <OnboardingLayout title={t.name.title}>
    <form className="form-stack mt-6" onSubmit={event => { event.preventDefault(); if (valid) navigate('/birthday') }}>
      <Input label={t.name.firstName} placeholder={t.name.firstName} autoComplete="given-name" value={draft.firstName} onChange={event => update({ firstName: event.target.value })} />
      <Input label={t.name.lastName} placeholder={t.name.lastName} autoComplete="family-name" value={draft.lastName} onChange={event => update({ lastName: event.target.value })} />
      <Button variant="secondary" type="submit" className="mt-3 rounded-full" disabled={!valid}>{t.common.continue}</Button>
    </form>
  </OnboardingLayout>
}
