import type { ReactNode } from 'react'

export default function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-dvh w-full max-w-md p-6">{children}</main>
}