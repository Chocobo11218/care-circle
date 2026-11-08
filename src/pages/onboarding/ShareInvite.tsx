import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import OnboardingLayout from '../../components/OnboardingLayout'
import { useSession } from '../../hooks/useSession'
import { t } from '../../i18n/en'

export default function ShareInvite() {
  const { circle } = useSession()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function share() {
    if (!circle || pending.current) return
    pending.current = true; setBusy(true); setStatus(''); setError('')
    const text = `${circle.name}\n${circle.invite_code}\n${window.location.origin}`
    try {
      if (navigator.share) await navigator.share({ title: circle.name, text })
      else { await navigator.clipboard.writeText(text); setStatus(t.shareInvite.copied) }
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) setError(t.shareInvite.error)
    } finally { pending.current = false; setBusy(false) }
  }
  if (!circle) return null
  return <OnboardingLayout title={t.shareInvite.title} back={false}>
    <p className="mt-6 text-center font-medium break-words">{circle.name}</p>
    <p aria-label={t.shareInvite.code} className="invite-code">{circle.invite_code}</p>
    <div className="bottom-actions mt-auto pt-10">
      {status && <p role="status" className="text-center">{status}</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button variant="secondary" className="rounded-full" disabled={busy} onClick={() => void share()}>{t.shareInvite.share}</Button>
      <button className="min-h-14 text-muted underline" type="button" onClick={() => navigate('/permission')}>{t.shareInvite.done}</button>
    </div>
  </OnboardingLayout>
}
