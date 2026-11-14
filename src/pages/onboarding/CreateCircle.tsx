import { useState } from 'react'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useCircleSubmit } from '../../hooks/useCircleSubmit'
import { t } from '../../i18n/index'

export default function CreateCircle() {
  const [value, setValue] = useState('')
  const { busy, error, submit } = useCircleSubmit('create')
  return <OnboardingLayout title={t.createCircle.title}>
    <form className="form-stack mx-[8%] mt-8" onSubmit={event => { event.preventDefault(); void submit(value) }}>
      <Input label={t.createCircle.label} placeholder={t.createCircle.placeholder} value={value} disabled={busy}
        onChange={event => setValue(event.target.value)}  />
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button variant="secondary" type="submit" className="mt-5 rounded-full" disabled={!value.trim() || busy}>{busy ? t.common.working : t.common.submit}</Button>
    </form>
  </OnboardingLayout>
}
