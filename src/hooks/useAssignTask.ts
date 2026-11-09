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
  async function assign(task: Task, assigneeId = me?.id, expectedAssignee: string | null = null) {
    if (pending.current || !me || me.role !== 'family' || !circle || !assigneeId || task.circle_id !== circle.id || task.assignee_id !== expectedAssignee) return false
    pending.current = true; setBusy(true); setError(false)
    try {
      const query = supabase.from('tasks').update({ assignee_id: assigneeId })
        .eq('id', task.id).eq('circle_id', circle.id)
      const result = await (expectedAssignee === null ? query.is('assignee_id', null) : query.eq('assignee_id', expectedAssignee))
        .select('*').maybeSingle()
      if (result.error || !result.data) throw result.error ?? new Error('Task assignment changed')
      acceptTask(result.data as Task)
      return true
    } catch { setError(true); refetch(); return false }
    finally { pending.current = false; setBusy(false) }
  }
  return { assign, busy, error }
}
