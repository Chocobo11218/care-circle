import { Navigate } from 'react-router-dom'
import OnboardingLayout from './OnboardingLayout'
import { useSession } from '../hooks/useSession'
import { homePath } from '../lib/onboarding'
import { t } from '../i18n/en'
import type { Role } from '../types'

export default function HomeSummary({ role }: { role: Role }) {
  const { me, circle } = useSession()
  if (!me || !circle) return null
  if (me.role !== role) return <Navigate to={homePath(me.role)} replace />
  return <OnboardingLayout title={role === 'family' ? t.home.family : t.home.elderly} back={false}>
    <dl className="mt-8 space-y-5 rounded-xl border border-stroke bg-surface p-5">
      <div><dt className="text-muted">{t.home.firstName}</dt><dd className="font-semibold break-words">{me.first_name}</dd></div>
      <div><dt className="text-muted">{t.home.circle}</dt><dd className="font-semibold break-words">{circle.name}</dd></div>
    </dl>
  </OnboardingLayout>
}
