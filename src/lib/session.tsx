import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { SessionContext } from './session-context'
import type { Circle, Member } from '../types'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [me, setMe] = useState<Member | null>(null)
  const [circle, setCircle] = useState<Circle | null>(null)

  const loadMembership = useCallback(async (uid: string) => {
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', uid)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!member) {
      setMe(null)
      setCircle(null)
      return
    }
    const { data: c } = await supabase
      .from('circles')
      .select('*')
      .eq('id', member.circle_id)
      .single()
    setMe(member as Member)
    setCircle((c as Circle) ?? null)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null
      setUserId(uid)
      if (uid) await loadMembership(uid)
      setLoading(false)
    })
  }, [loadMembership])

  const ensureSignedIn = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) return data.session.user.id
    const { data: anon, error } = await supabase.auth.signInAnonymously()
    if (error || !anon.user) throw error ?? new Error('Sign-in failed')
    setUserId(anon.user.id)
    return anon.user.id
  }, [])

  const refresh = useCallback(async () => {
    if (userId) await loadMembership(userId)
    else {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setUserId(data.session.user.id)
        await loadMembership(data.session.user.id)
      }
    }
  }, [userId, loadMembership])

  const resetDevice = useCallback(async () => {
    await supabase.auth.signOut()
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }, [])

  return (
    <SessionContext.Provider
      value={{ loading, userId, me, circle, ensureSignedIn, refresh, resetDevice }}
    >
      {children}
    </SessionContext.Provider>
  )
}