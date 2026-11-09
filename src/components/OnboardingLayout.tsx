import type { ReactNode } from 'react'
import PageShell from './PageShell'
import TopBar from './TopBar'

export default function OnboardingLayout({ title, children, back = true, onBack }: {
  title: string; children: ReactNode; back?: boolean; onBack?: () => void
}) {
  return <PageShell><div className="onboarding-page">
    <TopBar showBack={back} onBack={onBack} />
    <h1 className="onboarding-title">{title}</h1>
    {children}
  </div></PageShell>
}
