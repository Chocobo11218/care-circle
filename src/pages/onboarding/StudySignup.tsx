import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useSession } from '../../hooks/useSession'
import { sanitizeOtp } from '../../lib/email-auth'
import { homePath } from '../../lib/onboarding'
import { markStudySignupVerified } from '../../lib/study-mode'
import { isStudyContactValid, studyCode, type StudyContactMethod } from '../../lib/study-signup'
import { t } from '../../i18n/index'

export default function StudySignup() {
  const { me, ensureSignedIn } = useSession()
  const navigate = useNavigate()
  const pending = useRef(false)
  const [method, setMethod] = useState<StudyContactMethod>('email')
  const [contact, setContact] = useState('')
  const [checkingCode, setCheckingCode] = useState(false)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const copy = t.studySignup

  if (me) return <Navigate to={homePath(me.role)} replace />

  function chooseMethod(next: StudyContactMethod) {
    if (method === next) return
    setMethod(next)
    setContact('')
    setError('')
  }

  function continueToCode() {
    if (!isStudyContactValid(contact, method)) {
      setError(method === 'email' ? copy.emailError : copy.mobileError)
      return
    }
    setError('')
    setCheckingCode(true)
  }

  function changeContact() {
    if (pending.current) return
    setCode('')
    setError('')
    setCheckingCode(false)
  }

  async function verify() {
    if (pending.current) return
    if (code !== studyCode) {
      setError(copy.codeError)
      return
    }

    pending.current = true
    setBusy(true)
    setError('')
    try {
      const userId = await ensureSignedIn()
      markStudySignupVerified(userId)
      setContact('')
      navigate('/select-role', { replace: true })
    } catch {
      setError(copy.sessionError)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  if (checkingCode) return <OnboardingLayout title={copy.codeTitle} back={false}>
    <form className="form-stack mt-6" onSubmit={event => { event.preventDefault(); void verify() }}>
      <p id="study-code-hint">{copy.codeHint(studyCode)}</p>
      <Input label={t.emailAuth.code} inputMode="numeric" autoComplete="off" maxLength={6}
        aria-describedby="study-code-hint" value={code} disabled={busy}
        onChange={event => setCode(sanitizeOtp(event.target.value))}
        onPaste={event => { event.preventDefault(); setCode(sanitizeOtp(event.clipboardData.getData('text'))) }} />
      {error && <p role="alert" className="text-error">{error}</p>}
      <Button type="submit" variant="secondary" className="rounded-full" disabled={busy || code.length !== 6}>
        {busy ? t.common.working : t.emailAuth.verify}
      </Button>
      <button type="button" className="min-h-14 underline" disabled={busy} onClick={changeContact}>
        {method === 'email' ? t.emailAuth.changeEmail : copy.changeMobile}
      </button>
    </form>
  </OnboardingLayout>

  return <OnboardingLayout title={copy.title}>
    <div className="mt-6 grid grid-cols-2 gap-3" role="group" aria-label={copy.methodLabel}>
      {(['email', 'mobile'] as const).map(option => <button key={option} type="button"
        aria-pressed={method === option} onClick={() => chooseMethod(option)}
        className={`min-h-14 border-b-4 font-medium ${method === option ? 'border-btn-primary text-ink' : 'border-transparent text-muted'}`}>
        {copy[option]}
      </button>)}
    </div>
    <form className="form-stack mt-6" noValidate onSubmit={event => { event.preventDefault(); continueToCode() }}>
      <p id="study-contact-hint">{method === 'email' ? copy.emailHint : copy.mobileHint}</p>
      <Input label={copy[method]} type={method === 'email' ? 'email' : 'tel'} autoComplete="off"
        aria-describedby="study-contact-hint" value={contact} error={error}
        onChange={event => { setContact(event.target.value); setError('') }} />
      <Button type="submit" variant="secondary" className="rounded-full" disabled={!contact.trim()}>
        {t.common.continue}
      </Button>
    </form>
  </OnboardingLayout>
}
