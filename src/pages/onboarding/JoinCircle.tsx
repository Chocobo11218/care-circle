import { useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useCircleSubmit } from '../../hooks/useCircleSubmit'
import { t } from '../../i18n/en'

export default function JoinCircle() {
  const [value, setValue] = useState('')
  const { busy, error, submit } = useCircleSubmit('join')
  return <OnboardingLayout title={t.joinCircle.title}>
    <form className="form-stack mx-[8%] mt-8" onSubmit={event => { event.preventDefault(); void submit(value) }}>
      <Input label={t.joinCircle.label} placeholder={t.joinCircle.placeholder} value={value} disabled={busy}
        onChange={event => setValue(event.target.value.toUpperCase().trim())} autoCapitalize="characters" autoComplete="off" spellCheck={false} />
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button variant="secondary" type="submit" className="mt-5 rounded-full" disabled={!value.trim() || busy}>{busy ? t.common.working : t.common.submit}</Button>
    </form>
  </OnboardingLayout>
}
