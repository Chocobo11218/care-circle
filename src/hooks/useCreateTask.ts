import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { taskInsert } from '../lib/tasks'
import type { TaskDraft } from '../lib/task-draft-context'
import type { Task } from '../types'
import { useFamilyTasks } from './useFamilyTasks'
import { useSession } from './useSession'

export function useCreateTask() {
  const { me, circle } = useSession()
  const { acceptTask } = useFamilyTasks()
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function create(draft: TaskDraft, elderId: string | null, assigneeId: string | null) {
    if (pending.current || !circle || me?.role !== 'family') return null
    pending.current = true
    setBusy(true)
    setError(false)
    try {
      const { data, error } = await supabase.from('tasks')
        .insert(taskInsert(draft, circle.id, me.id, elderId, assigneeId)).select('*').single()
      if (error || !data) throw error ?? new Error('Task insert returned no row')
      const task = data as Task
      acceptTask(task)
      return task
    } catch {
      setError(true)
      return null
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return { create, busy, error }
}
