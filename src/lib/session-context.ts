import { createContext } from 'react'
import type { Circle, Member } from '../types'

export interface SessionValue {
  loading: boolean
  userId: string | null
  me: Member | null
  circle: Circle | null
  refresh: () => Promise<Member | null>
  resetDevice: () => Promise<void>
}

export const SessionContext = createContext<SessionValue | null>(null)