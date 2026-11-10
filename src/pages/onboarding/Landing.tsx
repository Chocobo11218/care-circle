import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import PageShell from '../../components/PageShell'
import { useSession } from '../../hooks/useSession'
import { homePath, readLocal } from '../../lib/onboarding'
import { t } from '../../i18n/en'
import familyIllustration from '../../assets/family-hug.svg'

export default function Landing() {
  const { loading, me, circle } = useSession()
  const navigate = useNavigate()
  if (loading) return null
  if (readLocal('carecircle_onboarded') === 'true' && me && circle) return <Navigate to={homePath(me.role)} replace />
  return <PageShell><div className="onboarding-page landing-page">
    <h1 className="onboarding-title">{t.appName}</h1>
    <div className="flex flex-1 items-center justify-center py-10">
      <img src={familyIllustration} alt={t.landing.illustration} className="landing-illustration max-w-full" />
    </div>
    <footer className="bottom-actions">
      <Button className="rounded-full" onClick={() => navigate('/select-role')}>{t.landing.getStarted}</Button>
      <p className="flex flex-wrap items-center justify-center gap-x-1 text-center">
        {t.landing.alreadyHaveAccount}
        <Link to="/log-in" className="inline-flex min-h-14 min-w-14 items-center justify-center underline">{t.landing.signIn}</Link>
      </p>
    </footer>
  </div></PageShell>
}
