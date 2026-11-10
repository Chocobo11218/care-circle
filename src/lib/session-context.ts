import { createContext } from 'react'
import type { Circle, Member } from '../types'

export interface SessionValue {
  loading: boolean
  userId: string | null
  me: Member | null
  circle: Circle | null
  ensureSignedIn: () => Promise<string>
  refresh: () => Promise<void>
  resetDevice: () => Promise<void>
}

export const SessionContext = createContext<SessionValue | null>(null)