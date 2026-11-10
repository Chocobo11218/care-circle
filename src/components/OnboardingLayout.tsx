import type { ReactNode } from 'react'
import PageShell from './PageShell'
import TopBar from './TopBar'

export default function OnboardingLayout({ title, children, back = true }: {
  title: string; children: ReactNode; back?: boolean
}) {
  return <PageShell><div className="onboarding-page">
    <TopBar showBack={back} />
    <h1 className="onboarding-title">{title}</h1>
    {children}
  </div></PageShell>
}
