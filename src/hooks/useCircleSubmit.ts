import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDraft } from './useDraft'
import { useSession } from './useSession'
import { supabase } from '../lib/supabase'
import { birthdayToISO } from '../lib/date'
import { missingStep } from '../lib/onboarding'
import { t } from '../i18n/en'

export function useCircleSubmit(mode: 'create' | 'join') {
  const { draft } = useDraft()
  const { userId, refresh } = useSession()
  const navigate = useNavigate()
  const pending = useRef(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(value: string) {
    if (pending.current || !userId || !value.trim() || missingStep(draft, 'circle')) return
    pending.current = true
    setBusy(true); setError('')
    try {
      const profile = { p_role: draft.role, p_first_name: draft.firstName.trim(),
        p_last_name: draft.lastName.trim(), p_birthday: birthdayToISO(draft.birthday) }
      const result = mode === 'create'
        ? await supabase.rpc('create_circle', { ...profile, p_name: value.trim() })
        : await supabase.rpc('join_circle', { ...profile, p_code: value.trim().toUpperCase() })
      if (result.error) {
        setError(mode === 'join' && result.error.message.includes('invalid_invite_code')
          ? t.joinCircle.invalidCode : mode === 'create' ? t.createCircle.error : t.joinCircle.error)
        return
      }
      await refresh()
      navigate(mode === 'create' ? '/share-invite' : '/permission', { replace: true })
    } catch { setError(mode === 'create' ? t.createCircle.error : t.joinCircle.error) }
    finally { pending.current = false; setBusy(false) }
  }
  return { busy, error, submit }
}
