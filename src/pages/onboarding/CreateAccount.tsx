import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useSession } from '../../hooks/useSession'
import { t } from '../../i18n/en'
import googleLogo from '../../assets/google.svg'

export default function CreateAccount() {
  const { ensureSignedIn } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const pending = useRef(false)
  async function signIn() {
    if (pending.current) return
    pending.current = true
    setBusy(true); setError('')
    try { await ensureSignedIn(); setEmail(''); setPassword(''); navigate('/select-role') }
    catch { setError(t.createAccount.error) }
    finally { pending.current = false; setBusy(false) }
  }
  return <OnboardingLayout title={t.createAccount.title}>
    <div className="mb-5 border-b-4 border-btn-primary py-3 text-center font-medium">{t.createAccount.email}</div>
    <form className="form-stack" noValidate onSubmit={event => { event.preventDefault(); if (email.trim() && password) void signIn() }}>
      <Input label={t.createAccount.email} placeholder={t.createAccount.email} type="email" autoComplete="off" value={email} onChange={event => setEmail(event.target.value)} />
      <Input label={t.createAccount.password} placeholder={t.createAccount.password} type="password" autoComplete="off" value={password} onChange={event => setPassword(event.target.value)} />
      <Button type="submit" variant="secondary" className="rounded-full" disabled={!email.trim() || !password || busy}>{busy ? t.common.working : t.common.continue}</Button>
    </form>
    <p className="my-5 text-center text-muted">{t.createAccount.or}</p>
    <Button type="button" variant="outline" disabled={busy} onClick={() => void signIn()} className="flex items-center justify-center gap-3 rounded-full">
      <img src={googleLogo} alt="" />{t.createAccount.google}
    </Button>
    {error && <p role="alert" className="form-error">{error}</p>}
  </OnboardingLayout>
}
