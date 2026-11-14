import { useRef, useState } from 'react'
import Button from '../Button'
import { useSession } from '../../hooks/useSession'
import { t } from '../../i18n/index'

export default function ShareInviteButton({ label = t.familyAddMember.share, primary = false }: {
  label?: string
  primary?: boolean
}) {
  const { circle } = useSession()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  async function share() {
    if (!circle || pending.current) return
    pending.current = true; setBusy(true); setError(false); setCopied(false)
    try {
      if (navigator.share) {
        try { await navigator.share({ title: circle.name, text: t.familyAddMember.shareMessage(circle.name, circle.invite_code) }); return }
        catch { /* Share cancellation or failure falls back to copying the code. */ }
      }
      await navigator.clipboard.writeText(circle.invite_code)
      setCopied(true)
    } catch { setError(true) }
    finally { pending.current = false; setBusy(false) }
  }
  return <>
    <Button variant={primary ? 'primary' : 'secondary'} className="family-pill" disabled={busy} onClick={() => void share()}>{label}</Button>
    {copied && <p role="status" className="text-center">{t.familyAddMember.copied}</p>}
    {error && <p role="alert" className="text-error">{t.familyAddMember.error}</p>}
  </>
}
