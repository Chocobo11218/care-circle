import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'
import { useFamilyTasks } from './useFamilyTasks'
import type { Task } from '../types'

type Fields = Partial<Pick<Task, 'title' | 'location' | 'task_date' | 'start_time' | 'end_time' | 'description' | 'note' | 'elder_id'>>

export function useUpdateTask() {
  const { me, circle } = useSession()
  const { acceptTask, refetch } = useFamilyTasks()
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  async function updateTask(task: Task, fields: Fields) {
    if (pending.current || me?.role !== 'family' || !circle || task.circle_id !== circle.id) return false
    pending.current = true
    setBusy(true)
    setError(false)
    try {
      let query = supabase.from('tasks').update(fields).eq('id', task.id).eq('circle_id', circle.id)
      if ('elder_id' in fields) {
        query = task.elder_id === null ? query.is('elder_id', null) : query.eq('elder_id', task.elder_id)
      }
      const { data, error } = await query.select('*').maybeSingle()
      if (error || !data) throw error ?? new Error('Task update returned no row')
      acceptTask(data as Task)
      return true
    } catch {
      setError(true)
      refetch()
      return false
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return { updateTask, busy, error }
}
