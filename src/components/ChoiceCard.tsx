import type { ReactNode } from 'react'

export default function ChoiceCard({ title, description, icon, onClick }: {
  title: string; description: string; icon: ReactNode; onClick: () => void
}) {
  return <button type="button" onClick={onClick} className="choice-card">
    <span aria-hidden="true" className="choice-icon">{icon}</span>
    <span className="flex min-w-0 flex-1 flex-col gap-2">
      <span className="text-body-large font-medium">{title}</span>
      <span className="text-body">{description}</span>
    </span>
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6" /></svg>
  </button>
}
