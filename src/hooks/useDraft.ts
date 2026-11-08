import { useContext } from 'react'
import { DraftContext } from '../lib/draft-context'

export function useDraft() {
  const context = useContext(DraftContext)
  if (!context) throw new Error('useDraft must be used inside DraftProvider')
  return context
}
