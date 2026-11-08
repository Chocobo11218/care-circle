import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDraft } from '../hooks/useDraft'
import { useSession } from '../hooks/useSession'
import { missingStep } from '../lib/onboarding'

export default function OnboardingGuard({ step, children }: {
  step?: 'name' | 'birthday' | 'circle' | 'membership'
  children: ReactNode
}) {
  const { loading, me, circle } = useSession()
  const { draft } = useDraft()
  if (loading) return null
  const target = step === 'membership' ? (!me || !circle ? '/get-started' : null)
    : step ? missingStep(draft, step) : null
  return target ? <Navigate to={target} replace /> : children
}
