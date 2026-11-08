import { createContext } from 'react'
import type { Role } from '../types'

export interface Draft {
  role: Role | null
  firstName: string
  lastName: string
  birthday: string // as typed, DD/MM/YYYY; converted to YYYY-MM-DD on submit
}

export const emptyDraft: Draft = { role: null, firstName: '', lastName: '', birthday: '' }

export interface DraftValue {
  draft: Draft
  update: (patch: Partial<Draft>) => void
  clear: () => void
}

export const DraftContext = createContext<DraftValue | null>(null)