import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDraft } from '../hooks/useDraft'
import { useSession } from '../hooks/useSession'
import { homePath, missingStep } from '../lib/onboarding'
import { hasStudySignupVerification, studyMode } from '../lib/study-mode'
import type { Role } from '../types'

export default function OnboardingGuard({ step, role, children }: {
  step?: 'role' | 'name' | 'birthday' | 'circle' | 'membership'
  role?: Role
  children: ReactNode
}) {
  const { loading, userId, isAnonymous, me, circle } = useSession()
  const { draft } = useDraft()
  if (loading) return null
  if (role && !userId) return <Navigate to="/" replace />
  if (role && me && me.role !== role) return <Navigate to={homePath(me.role)} replace />
  if (step && step !== 'membership' && !me) {
    const needsSignup = studyMode
      ? !hasStudySignupVerification(userId)
      : step !== 'role' && draft.role === 'family' && (!userId || isAnonymous)
    if (needsSignup) return <Navigate to="/create-account" replace />
  }
  const target = step === 'membership' ? (!me || !circle ? '/get-started' : null)
    : step && step !== 'role' ? missingStep(draft, step) : null
  return target ? <Navigate to={target} replace /> : children
}
