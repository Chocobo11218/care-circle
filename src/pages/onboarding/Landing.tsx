import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageShell from '../../components/PageShell'
import { useSession } from '../../hooks/useSession'
import { homePath, readLocal } from '../../lib/onboarding'
import { studyMode } from '../../lib/study-mode'
import { t } from '../../i18n/index'
import familyIllustration from '../../assets/family-hug.svg'

export default function Landing() {
  const { loading, me, circle } = useSession()
  const navigate = useNavigate()
  const [showSignInStatus, setShowSignInStatus] = useState(false)
  if (loading) return null
  if (readLocal('carecircle_onboarded') === 'true' && me && circle) return <Navigate to={homePath(me.role)} replace />
  return <PageShell><div className="onboarding-page landing-page">
    <h1 className="onboarding-title">{t.appName}</h1>
    <div className="flex flex-1 items-center justify-center py-10">
      <img src={familyIllustration} alt={t.landing.illustration} className="landing-illustration max-w-full" />
    </div>
    <footer className="bottom-actions">
      <Button className="rounded-full" onClick={() => navigate(studyMode ? '/create-account' : '/select-role')}>{t.landing.getStarted}</Button>
      <p className="flex flex-wrap items-center justify-center gap-x-1 text-center">
        {t.landing.alreadyHaveAccount}
        <Link to={studyMode ? "/" : "/log-in"} onClick={studyMode ? event => { event.preventDefault(); setShowSignInStatus(true) } : undefined} className="inline-flex min-h-14 min-w-14 items-center justify-center underline">{t.landing.signIn}</Link>
      </p>
      {showSignInStatus && <p role="status" className="text-center">{t.landing.signInUnavailable}</p>}
    </footer>
  </div></PageShell>
}
