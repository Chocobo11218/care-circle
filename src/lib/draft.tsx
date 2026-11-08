import { useEffect, useState, type ReactNode } from 'react'
import { DraftContext, emptyDraft, type Draft } from './draft-context'

const KEY = 'carecircle_draft'

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(() => {
    try {
      const saved = localStorage.getItem(KEY)
      return saved ? { ...emptyDraft, ...JSON.parse(saved) } : emptyDraft
    } catch {
      return emptyDraft
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(draft))
    } catch {
      /* storage unavailable: the draft just won't survive a refresh */
    }
  }, [draft])

  return (
    <DraftContext.Provider
      value={{
        draft,
        update: (patch) => setDraft((d) => ({ ...d, ...patch })),
        clear: () => setDraft(emptyDraft),
      }}
    >
      {children}
    </DraftContext.Provider>
  )
}