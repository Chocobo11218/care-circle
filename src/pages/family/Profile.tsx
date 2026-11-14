import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useSession } from '../../hooks/useSession'
import { studyMode } from '../../lib/study-mode'
import { t } from '../../i18n/index'

export default function Profile() {
  const { resetDevice, isAnonymous } = useSession()
  const navigate = useNavigate()
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  useScreenEvent('profile')

  async function logOut() {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError(false)
    try {
      await resetDevice()
    } catch {
      setError(true)
      setBusy(false)
      pending.current = false
    }
  }

  return <>
    <TopBar title={t.profile.title} onBack={() => { if (!pending.current) navigate('/family', { replace: true }) }} />
    {isAnonymous && !studyMode && <Link to="/create-account" className="mb-3 flex min-h-14 items-center justify-center underline">{t.emailAuth.addEmail}</Link>}
    <Button type="button" variant="secondary" className="family-pill" disabled={busy} onClick={() => void logOut()}>
      {busy ? t.profile.loggingOut : t.profile.logOut}
    </Button>
    {error && <p role="alert" className="mt-3 text-error">{t.profile.error}</p>}
  </>
}
