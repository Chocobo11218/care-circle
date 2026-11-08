import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useSession } from './useSession'

export function useScreenEvent(screen: string) {
  const { me, circle } = useSession()
  const lastEvent = useRef('')
  const circleId = circle?.id
  const memberId = me?.id
  useEffect(() => {
    if (!circleId || !memberId) return
    const key = `${circleId}:${memberId}:${screen}`
    if (lastEvent.current === key) return
    lastEvent.current = key
    try {
      void Promise.resolve(supabase.from('session_events').insert({ circle_id: circleId, member_id: memberId, screen })).catch(() => {})
    } catch { /* Analytics must never interrupt the participant's flow. */ }
  }, [circleId, memberId, screen])
}
