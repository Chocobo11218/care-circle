import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useSession } from '../../hooks/useSession'
import { homePath } from '../../lib/onboarding'
import { normalizePhone } from '../../lib/phone'
import { supabase } from '../../lib/supabase'
import { t } from '../../i18n/en'

const testCode = '123456'

export default function CreateAccount() {
  const { me, circle, refresh } = useSession()
  const navigate = useNavigate()
  const pending = useRef(false)
  const [step, setStep] = useState<'credentials' | 'phone' | 'code' | 'confirmEmail'>('credentials')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const copy = t.createAccount
  const verification = t.phoneVerification
  if (me && circle) return <Navigate to={homePath(me.role)} replace />

  function changeStep(next: typeof step) {
    setError('')
    setCode('')
    setStep(next)
  }

  async function createAccount() {
    if (pending.current) return
    const number = normalizePhone(phone)
    if (!number) {
      changeStep('phone')
      return
    }
    if (code !== testCode) {
      setError(verification.error)
      return
    }
    pending.current = true
    setBusy(true)
    setError('')
    try {
      const credentials = method === 'email' ? { email: email.trim(), password } : { phone: number, password }
      const { data, error } = await supabase.auth.signUp({
        ...credentials,
        options: { data: { contact_phone: number } },
      })
      if (error) throw error
      if (!data.session) {
        if (method === 'phone') {
          setError(copy.phoneAuthError)
          return
        }
        setPassword('')
        changeStep('confirmEmail')
        return
      }
      const member = await refresh()
      navigate(member ? homePath(member.role) : '/select-role', { replace: true })
    } catch {
      setError(copy.error)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  if (step === 'confirmEmail') return <OnboardingLayout title={copy.title}>
    <p role="status">{copy.confirmEmail}</p>
    <Link to="/sign-in" className="inline-flex min-h-14 items-center underline">{t.landing.signIn}</Link>
  </OnboardingLayout>

  if (step === 'phone') return <OnboardingLayout title={verification.phoneTitle} onBack={() => changeStep('credentials')}>
    <form className="form-stack" onSubmit={event => {
      event.preventDefault()
      if (normalizePhone(phone)) changeStep('code')
      else setError(verification.phoneError)
    }}>
      <p id="phone-hint">{verification.phoneHint}</p>
      <Input label={copy.phone} type="tel" autoComplete="tel" value={phone} error={error}
        aria-describedby="phone-hint" onChange={event => setPhone(event.target.value)} required />
      <Button type="submit">{t.common.continue}</Button>
    </form>
  </OnboardingLayout>

  if (step === 'code') return <OnboardingLayout title={verification.codeTitle} onBack={() => {
    if (!pending.current) changeStep('phone')
  }}>
    <form className="form-stack" onSubmit={event => { event.preventDefault(); void createAccount() }}>
      <p id="test-code-hint">{verification.hint(testCode)}</p>
      <Input label={verification.codeLabel} inputMode="numeric" maxLength={6} value={code}
        aria-describedby="test-code-hint" onChange={event => setCode(event.target.value.replace(/\D/g, ''))}
        disabled={busy} required />
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button type="submit" disabled={busy || code.length !== 6}>
        {busy ? t.common.working : verification.verify}
      </Button>
    </form>
  </OnboardingLayout>

  return <OnboardingLayout title={copy.title}>
    <div className="mb-5 grid grid-cols-2 gap-3">
      <Button type="button" variant={method === 'email' ? 'primary' : 'outline'}
        aria-pressed={method === 'email'} onClick={() => setMethod('email')}>{copy.useEmail}</Button>
      <Button type="button" variant={method === 'phone' ? 'primary' : 'outline'}
        aria-pressed={method === 'phone'} onClick={() => setMethod('phone')}>{copy.usePhone}</Button>
    </div>
    <form className="form-stack" onSubmit={event => { event.preventDefault(); changeStep('phone') }}>
      {method === 'email' && <Input label={copy.email} type="email" autoComplete="email" value={email}
        onChange={event => setEmail(event.target.value)} required />}
      <Input label={copy.password} type="password" autoComplete="new-password" value={password}
        aria-describedby="password-hint" minLength={6} onChange={event => setPassword(event.target.value)} required />
      <p id="password-hint">{copy.passwordHint}</p>
      <Button type="submit">{t.common.continue}</Button>
    </form>
  </OnboardingLayout>
}
