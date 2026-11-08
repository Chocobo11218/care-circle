import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'
import { useFamilyTasks } from './useFamilyTasks'
import type { Task } from '../types'

export function useAssignTask() {
  const { me, circle } = useSession()
  const { acceptTask, refetch } = useFamilyTasks()
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  async function assign(task: Task) {
    if (pending.current || !me || me.role !== 'family' || !circle || task.assignee_id !== null) return
    pending.current = true; setBusy(true); setError(false)
    try {
      const result = await supabase.from('tasks').update({ assignee_id: me.id })
        .eq('id', task.id).eq('circle_id', circle.id).is('assignee_id', null).select('*').maybeSingle()
      if (result.error || !result.data) throw result.error ?? new Error('Task no longer unassigned')
      acceptTask(result.data as Task)
    } catch { setError(true); refetch() }
    finally { pending.current = false; setBusy(false) }
  }
  return { assign, busy, error }
}
