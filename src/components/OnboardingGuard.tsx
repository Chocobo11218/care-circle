import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDraft } from '../hooks/useDraft'
import { useSession } from '../hooks/useSession'
import { homePath, missingStep } from '../lib/onboarding'
import type { Role } from '../types'

export default function OnboardingGuard({ step, role, children }: {
  step?: 'name' | 'birthday' | 'circle' | 'membership'
  role?: Role
  children: ReactNode
}) {
  const { loading, userId, me, circle } = useSession()
  const { draft } = useDraft()
  if (loading) return null
  if (role && !userId) return <Navigate to="/" replace />
  if (role && me && me.role !== role) return <Navigate to={homePath(me.role)} replace />
  const target = step === 'membership' ? (!me || !circle ? '/get-started' : null)
    : step ? missingStep(draft, step) : null
  return target ? <Navigate to={target} replace /> : children
}
