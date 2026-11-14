import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useDraft } from '../../hooks/useDraft'
import { useEmailAuth, type EmailAuthMode } from '../../hooks/useEmailAuth'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useSession } from '../../hooks/useSession'
import { homePath } from '../../lib/onboarding'
import { t } from '../../i18n/index'

export default function EmailAuth({ mode }: { mode: EmailAuthMode }) {
  const { me, isAnonymous, userId } = useSession()
  const { draft, clear } = useDraft()
  const navigate = useNavigate()
  const signup = mode === 'signup'
  const auth = useEmailAuth(mode, member => {
    if (!signup) clear()
    const destination = member ? homePath(member.role) : signup ? '/name' : '/select-role'
    navigate(destination, { replace: true })
  })
  useScreenEvent(`email_${mode}_${auth.sentTo ? 'code' : 'address'}`)
  const copy = t.emailAuth
  const linkClass = 'inline-flex min-h-14 min-w-14 items-center justify-center underline'

  if (signup && !auth.sentTo) {
    if (me?.role === 'elderly') return <Navigate to={homePath(me.role)} replace />
    if (me && !isAnonymous) return <Navigate to={homePath(me.role)} replace />
    if (!me && draft.role !== 'family') return <Navigate to="/select-role" replace />
    if (!me && userId && !isAnonymous) return <Navigate to="/name" replace />
  }

  if (auth.sentTo) return <OnboardingLayout title={copy.codeTitle} back={false}>
    <form className="form-stack mt-6" onSubmit={event => { event.preventDefault(); void auth.verify() }}>
      <p id="email-code-hint" className="wrap-anywhere">{copy.sent(auth.sentTo)}</p>
      {!auth.needsReload && <Input label={copy.code} inputMode="numeric" autoComplete="one-time-code"
        maxLength={6} value={auth.code} onChange={event => auth.setCode(event.target.value)}
        onPaste={event => { event.preventDefault(); auth.setCode(event.clipboardData.getData('text')) }}
        aria-describedby="email-code-hint" disabled={auth.busy} />}
      {auth.error && <p role="alert" className="text-error">{auth.error}</p>}
      {auth.notice && <p role="status">{auth.notice}</p>}
      {auth.error === copy.existing && <Link to="/log-in" className={linkClass}>{copy.logInInstead}</Link>}
      <Button type="submit" disabled={auth.busy || (!auth.needsReload && auth.code.length !== 6)}>
        {auth.busy ? t.common.working : auth.needsReload ? copy.retry : copy.verify}
      </Button>
      {!auth.needsReload && <>
        <Button type="button" variant="outline" disabled={auth.busy || auth.seconds > 0} onClick={() => void auth.send(true)}>
          {auth.seconds > 0 ? copy.resendIn(auth.seconds) : copy.resend}
        </Button>
        <button type="button" className={linkClass} disabled={auth.busy} onClick={auth.changeEmail}>{copy.changeEmail}</button>
      </>}
    </form>
  </OnboardingLayout>

  return <OnboardingLayout title={signup ? copy.signUp : t.landing.signIn}>
    <form className="form-stack mt-6" noValidate onSubmit={event => { event.preventDefault(); void auth.send() }}>
      {!signup && me && isAnonymous && <p>{copy.switchAccount}</p>}
      <Input label={copy.email} type="email" autoComplete="email" value={auth.email}
        onChange={event => auth.setEmail(event.target.value)} disabled={auth.busy} />
      {auth.error && <p role="alert" className="text-error">{auth.error}</p>}
      <Button type="submit" disabled={auth.busy || !auth.email.trim()}>
        {auth.busy ? t.common.working : copy.send}
      </Button>
      {auth.error === copy.existing && <Link to="/log-in" className={linkClass}>{copy.logInInstead}</Link>}
      {!signup && <Link to="/select-role" className={linkClass}>{copy.signUp}</Link>}
    </form>
  </OnboardingLayout>
}
