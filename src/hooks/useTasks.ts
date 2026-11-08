import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mergeTaskChange } from '../lib/tasks'
import type { TaskChange } from '../lib/tasks'
import type { Task } from '../types'
import { useSession } from './useSession'

interface TasksState {
  circleId: string | null
  tasks: Task[]
  loading: boolean
  error: boolean
}

export function useTasks() {
  const { circle } = useSession()
  const circleId = circle?.id ?? null
  const [state, setState] = useState<TasksState>({ circleId: null, tasks: [], loading: true, error: false })
  const reload = useRef<(() => Promise<void>) | null>(null)
  const receiveRef = useRef<((change: TaskChange) => void) | null>(null)

  useEffect(() => {
    if (!circleId) return
    let active = true
    let fetching = false
    let refetchQueued = false
    let changes: TaskChange[] = []

    async function fetchTasks() {
      if (!active) return
      if (fetching) { refetchQueued = true; return }
      fetching = true
      changes = []
      try {
        const { data, error } = await supabase.from('tasks').select('*').eq('circle_id', circleId).order('created_at', { ascending: true })
        if (!active) return
        if (error) throw error
        const snapshot = changes.reduce((tasks, change) => mergeTaskChange(tasks, change, circleId!), (data ?? []) as Task[])
        setState({ circleId, tasks: snapshot, loading: false, error: false })
      } catch {
        if (active) setState(previous => ({ circleId, tasks: previous.circleId === circleId ? previous.tasks : [], loading: false, error: true }))
      } finally {
        fetching = false
        if (active && refetchQueued) { refetchQueued = false; void fetchTasks() }
      }
    }

    function receive(change: TaskChange) {
      if (!active) return
      if (fetching) changes.push(change)
      setState(previous => ({
        circleId, tasks: mergeTaskChange(previous.circleId === circleId ? previous.tasks : [], change, circleId!),
        loading: previous.circleId !== circleId || previous.loading, error: previous.circleId === circleId && previous.error,
      }))
    }

    // Start the initial snapshot after the subscription is ready, buffering events during the fetch.
    // The fallback keeps the member list usable when Realtime cannot connect.
    const startupTimer = window.setTimeout(() => { void fetchTasks() }, 1000)
    const channel = supabase.channel(`tasks:${circleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `circle_id=eq.${circleId}` }, receive)
      // DELETE payloads may contain only the primary key with RLS. Ignore ids outside the current list.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, receive)
      .subscribe(status => {
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          window.clearTimeout(startupTimer)
          void fetchTasks()
        }
      })
    receiveRef.current = receive
    reload.current = fetchTasks
    const onVisible = () => { if (document.visibilityState === 'visible') void fetchTasks() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      window.clearTimeout(startupTimer)
      receiveRef.current = null
      reload.current = null
      document.removeEventListener('visibilitychange', onVisible)
      void supabase.removeChannel(channel)
    }
  }, [circleId])

  const refetch = useCallback(() => { void reload.current?.() }, [])
  const acceptTask = useCallback((task: Task) => receiveRef.current?.({ eventType: 'UPDATE', new: task, old: {} }), [])
  const current = state.circleId === circleId ? state : { tasks: [], loading: true, error: false }
  return { tasks: current.tasks, loading: current.loading, error: current.error, refetch, acceptTask }
}
