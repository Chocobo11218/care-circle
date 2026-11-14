import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import OnboardingLayout from '../../components/OnboardingLayout'
import PermissionSwitch from '../../components/PermissionSwitch'
import { useDraft } from '../../hooks/useDraft'
import { useSession } from '../../hooks/useSession'
import { homePath, readPermission, writeLocal } from '../../lib/onboarding'
import { t } from '../../i18n/index'

export default function Permission() {
  const { me } = useSession()
  const { clear } = useDraft()
  const navigate = useNavigate()
  const [location, setLocation] = useState(() => readPermission('carecircle_location'))
  const [notifications, setNotifications] = useState(() => readPermission('carecircle_notifications'))
  const [error, setError] = useState('')
  function toggle(kind: 'location' | 'notifications') {
    const next = !(kind === 'location' ? location : notifications)
    try {
      writeLocal(`carecircle_${kind}`, String(next))
      if (kind === 'location') setLocation(next); else setNotifications(next)
      setError('')
    } catch { setError(t.permission.error) }
  }
  function finish() {
    if (!me) return
    try {
      writeLocal('carecircle_location', String(location))
      writeLocal('carecircle_notifications', String(notifications))
      writeLocal('carecircle_onboarded', 'true')
      clear(); navigate(homePath(me.role), { replace: true })
    } catch { setError(t.permission.error) }
  }
  return <OnboardingLayout title={t.permission.title} back={false}>
    <div className="choice-stack">
      <PermissionSwitch title={t.permission.location} description={t.permission.locationDescription} checked={location} onChange={() => toggle('location')} kind="location" />
      <PermissionSwitch title={t.permission.notifications} description={t.permission.notificationsDescription} checked={notifications} onChange={() => toggle('notifications')} kind="notifications" />
    </div>
    <div className="bottom-actions mt-auto pt-10">
      {error && <p role="alert" className="form-error">{error}</p>}
      <Button variant="secondary" className="rounded-full" onClick={finish}>{t.permission.continue}</Button>
    </div>
  </OnboardingLayout>
}
