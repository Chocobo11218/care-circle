import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mergeMemberChange } from '../lib/members'
import type { MemberChange } from '../lib/members'
import type { Member } from '../types'
import { useSession } from './useSession'

interface MembersState {
  circleId: string | null
  members: Member[]
  loading: boolean
  error: boolean
}

export function useMembers() {
  const { circle } = useSession()
  const circleId = circle?.id ?? null
  const [state, setState] = useState<MembersState>({ circleId: null, members: [], loading: true, error: false })
  const reload = useRef<(() => Promise<void>) | null>(null)

  useEffect(() => {
    if (!circleId) return
    let active = true
    let fetching = false
    let refetchQueued = false
    let changes: MemberChange[] = []

    async function fetchMembers() {
      if (!active) return
      if (fetching) { refetchQueued = true; return }
      fetching = true
      changes = []
      try {
        const { data, error } = await supabase.from('members').select('*').eq('circle_id', circleId).order('joined_at', { ascending: true })
        if (!active) return
        if (error) throw error
        const snapshot = changes.reduce((members, change) => mergeMemberChange(members, change, circleId!), (data ?? []) as Member[])
        setState({ circleId, members: snapshot, loading: false, error: false })
      } catch {
        if (active) setState(previous => ({ circleId, members: previous.circleId === circleId ? previous.members : [], loading: false, error: true }))
      } finally {
        fetching = false
        if (active && refetchQueued) { refetchQueued = false; void fetchMembers() }
      }
    }

    function receive(change: MemberChange) {
      if (!active) return
      if (fetching) changes.push(change)
      setState(previous => ({
        circleId, members: mergeMemberChange(previous.circleId === circleId ? previous.members : [], change, circleId!),
        loading: previous.circleId !== circleId || previous.loading, error: previous.circleId === circleId && previous.error,
      }))
    }

    // Start the initial snapshot after the subscription is ready, buffering events during the fetch.
    // The fallback keeps the member list usable when Realtime cannot connect.
    const startupTimer = window.setTimeout(() => { void fetchMembers() }, 1000)
    const channel = supabase.channel(`members:${circleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `circle_id=eq.${circleId}` }, receive)
      // DELETE payloads may contain only the primary key with RLS. Ignore ids outside the current list.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'members' }, receive)
      .subscribe(status => {
        if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          window.clearTimeout(startupTimer)
          void fetchMembers()
        }
      })
    reload.current = fetchMembers
    const onVisible = () => { if (document.visibilityState === 'visible') void fetchMembers() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      active = false
      window.clearTimeout(startupTimer)
      reload.current = null
      document.removeEventListener('visibilitychange', onVisible)
      void supabase.removeChannel(channel)
    }
  }, [circleId])

  const refetch = useCallback(() => { void reload.current?.() }, [])
  const current = state.circleId === circleId ? state : { members: [], loading: true, error: false }
  return { members: current.members, loading: current.loading, error: current.error, refetch }
}
