import { useState, type ReactNode } from 'react'
import { TaskDraftContext, emptyTaskDraft, type TaskDraft } from './task-draft-context'
import { useSession } from '../hooks/useSession'

export function TaskDraftProvider({ children, initialDraft = emptyTaskDraft }: { children: ReactNode; initialDraft?: TaskDraft }) {
  const { circle } = useSession()
  const circleId = circle?.id ?? null
  const [state, setState] = useState<{ circleId: string | null; draft: TaskDraft }>({ circleId, draft: initialDraft })
  const draft = state.circleId === circleId ? state.draft : emptyTaskDraft
  return <TaskDraftContext.Provider value={{ draft,
    update: patch => setState(previous => ({ circleId, draft: { ...(previous.circleId === circleId ? previous.draft : emptyTaskDraft), ...patch } })),
    clear: () => setState({ circleId, draft: emptyTaskDraft }),
  }}>{children}</TaskDraftContext.Provider>
}
