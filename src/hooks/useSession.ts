import { useContext } from 'react'
import { SessionContext } from '../lib/session-context'

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}