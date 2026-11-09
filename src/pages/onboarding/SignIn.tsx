import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useSession } from '../../hooks/useSession'
import { homePath } from '../../lib/onboarding'
import { normalizePhone } from '../../lib/phone'
import { supabase } from '../../lib/supabase'
import { t } from '../../i18n/en'

export default function SignIn() {
  const { me, circle, refresh } = useSession()
  const navigate = useNavigate()
  const pending = useRef(false)
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (me && circle) return <Navigate to={homePath(me.role)} replace />

  async function signIn() {
    if (pending.current) return
    const value = identifier.trim()
    const phone = normalizePhone(value)
    const credentials = phone ? { phone, password } : { email: value, password }
    pending.current = true
    setBusy(true)
    setError('')
    let signedIn = false
    try {
      const result = await supabase.auth.signInWithPassword(credentials)
      if (result.error) throw result.error
      signedIn = true
      const member = await refresh()
      navigate(member ? homePath(member.role) : '/select-role', { replace: true })
    } catch {
      setError(signedIn ? t.signIn.membershipError : t.signIn.error)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return <OnboardingLayout title={t.landing.signIn}>
    <form className="form-stack" onSubmit={event => { event.preventDefault(); void signIn() }}>
      <Input label={t.signIn.identifier} autoComplete="username" value={identifier}
        onChange={event => setIdentifier(event.target.value)} required disabled={busy} />
      <Input label={t.createAccount.password} type="password" autoComplete="current-password" value={password}
        onChange={event => setPassword(event.target.value)} required disabled={busy} />
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button type="submit" disabled={busy || !identifier.trim() || !password}>
        {busy ? t.common.working : t.landing.signIn}
      </Button>
    </form>
  </OnboardingLayout>
}
