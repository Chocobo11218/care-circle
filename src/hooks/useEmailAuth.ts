import { useEffect, useRef, useState } from 'react'
import { useSession } from './useSession'
import { normalizeEmail, resendCooldownMs, resendSeconds, sanitizeOtp } from '../lib/email-auth'
import { supabase } from '../lib/supabase'
import { t } from '../i18n/en'
import type { Member } from '../types'

export type EmailAuthMode = 'signup' | 'login'
const copy = t.emailAuth

function errorMessage(error: unknown, mode: EmailAuthMode, action: 'send' | 'verify') {
  const issue = error as { code?: string; status?: number; name?: string }
  if (issue.status === 429 || issue.code?.includes('rate_limit')) return copy.rateLimit
  if (error instanceof TypeError || issue.name === 'AuthRetryableFetchError') return copy.network
  if (mode === 'signup' && ['email_exists', 'user_already_exists'].includes(issue.code ?? '')) return copy.existing
  if (issue.code === 'otp_expired') return copy.expired
  if (action === 'verify' && [400, 403, 422].includes(issue.status ?? 0)) return copy.wrongCode
  if (action === 'verify') return copy.verifyError
  if (mode === 'login' && [400, 403, 422].includes(issue.status ?? 0)) return copy.loginUnavailable
  return copy.sendError
}

export function useEmailAuth(mode: EmailAuthMode, onSuccess: (member: Member | null) => void) {
  const { ensureSignedIn, refresh } = useSession()
  const pending = useRef(false)
  const upgradeId = useRef<string | null>(null)
  const verified = useRef(false)
  const deadline = useRef(0)
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [needsReload, setNeedsReload] = useState(false)

  useEffect(() => {
    if (!sentTo) return
    const timer = window.setInterval(() => setSeconds(resendSeconds(deadline.current)), 250)
    return () => window.clearInterval(timer)
  }, [sentTo])

  async function send(resend = false) {
    if (pending.current || (resend && resendSeconds(deadline.current))) return
    const address = normalizeEmail(resend ? sentTo : email)
    if (!address) {
      setError(copy.emailError)
      return
    }
    pending.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (mode === 'signup') {
        const id = await ensureSignedIn()
        if (resend && upgradeId.current !== id) throw new Error('Session changed')
        const result = resend
          ? await supabase.auth.resend({ type: 'email_change', email: address })
          : await supabase.auth.updateUser({ email: address })
        if (result.error) throw result.error
        upgradeId.current = id
      } else {
        const result = await supabase.auth.signInWithOtp({ email: address, options: { shouldCreateUser: false } })
        if (result.error) throw result.error
      }
      deadline.current = Date.now() + resendCooldownMs
      setSeconds(resendSeconds(deadline.current))
      setSentTo(address)
      setCode('')
      if (resend) setNotice(copy.resent)
    } catch (issue) {
      setError(errorMessage(issue, mode, 'send'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  async function verify() {
    if (pending.current || (!verified.current && (code.length !== 6 || !sentTo))) return
    pending.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      if (!verified.current) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          if (!upgradeId.current || data.session?.user.id !== upgradeId.current) throw new Error('Session changed')
        }
        const result = await supabase.auth.verifyOtp({
          email: sentTo, token: code, type: mode === 'signup' ? 'email_change' : 'email',
        })
        if (result.error) throw result.error
        if (!result.data.session || (mode === 'signup' && result.data.user?.id !== upgradeId.current)) {
          throw new Error('Verification did not return the expected session')
        }
        verified.current = true
      }
      onSuccess(await refresh())
    } catch (issue) {
      setNeedsReload(verified.current)
      setError(verified.current ? copy.membershipError : errorMessage(issue, mode, 'verify'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function changeEmail() {
    if (pending.current) return
    setSentTo('')
    setCode('')
    setError('')
    setNotice('')
  }

  return {
    email, setEmail, sentTo, code, setCode: (value: string) => setCode(sanitizeOtp(value)),
    busy, seconds, error, notice, needsReload, send, verify, changeEmail,
  }
}
