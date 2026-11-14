import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useDraft } from '../../hooks/useDraft'
import { formatBirthday, isValidBirthday } from '../../lib/date'
import { t } from '../../i18n/index'

export default function Birthday() {
  const { draft, update } = useDraft()
  const navigate = useNavigate()
  const valid = isValidBirthday(draft.birthday)
  return <OnboardingLayout title={t.birthday.title}>
    <form className="form-stack mt-8" onSubmit={event => { event.preventDefault(); if (valid) navigate('/get-started') }}>
      <Input label={t.birthday.label} placeholder={t.birthday.placeholder} inputMode="numeric" maxLength={10} autoComplete="off" value={draft.birthday}
        onChange={event => update({ birthday: formatBirthday(event.target.value) })}
        error={draft.birthday.length === 10 && !valid ? t.birthday.error : undefined} />
      <Button variant="secondary" type="submit" className="mt-8 rounded-full" disabled={!valid}>{t.common.continue}</Button>
    </form>
  </OnboardingLayout>
}
