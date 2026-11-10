import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { draftStorageKey } from './draft-context'
import { SessionContext } from './session-context'
import type { Circle, Member } from '../types'

export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [me, setMe] = useState<Member | null>(null)
  const [circle, setCircle] = useState<Circle | null>(null)

  const loadMembership = useCallback(async (uid: string) => {
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('*')
      .eq('user_id', uid)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (memberError) throw memberError
    if (!member) {
      setMe(null)
      setCircle(null)
      return null
    }
    const { data: c, error: circleError } = await supabase
      .from('circles')
      .select('*')
      .eq('id', member.circle_id)
      .single()
    if (circleError) throw circleError
    setMe(member as Member)
    setCircle((c as Circle) ?? null)
    return member as Member
  }, [])

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    const user = data.session?.user
    setUserId(user?.id ?? null)
    setIsAnonymous(user?.is_anonymous === true)
    setMe(null)
    setCircle(null)
    return user ? loadMembership(user.id) : null
  }, [loadMembership])

  useEffect(() => {
    void Promise.resolve().then(refresh).catch(() => {}).finally(() => setLoading(false))
  }, [refresh])

  const ensureSignedIn = useCallback(async () => {
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (data.session) return data.session.user.id
    const { data: anon, error } = await supabase.auth.signInAnonymously()
    if (error || !anon.user) throw error ?? new Error('Sign-in failed')
    setUserId(anon.user.id)
    setIsAnonymous(true)
    return anon.user.id
  }, [])

  const resetDevice = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) throw error
    try {
      localStorage.removeItem(draftStorageKey)
    } catch { /* Storage can be unavailable on this device. */ }
    window.location.replace('/')
  }, [])

  return (
    <SessionContext.Provider
      value={{ loading, userId, isAnonymous, me, circle, ensureSignedIn, refresh, resetDevice }}
    >
      {children}
    </SessionContext.Provider>
  )
}