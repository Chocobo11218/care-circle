import { useRef, useState } from 'react'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import { useSession } from '../../hooks/useSession'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function FamilyAddMember() {
  const { circle } = useSession()
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  useScreenEvent('/family/add-member')
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
  if (!circle) return null
  return <>
    <TopBar title={t.familyAddMember.title} />
    <section className="family-invite-section">
      <h2>{t.familyAddMember.heading}</h2>
      <p>{t.familyAddMember.description(circle.name)}</p>
      <p aria-label={t.familyAddMember.code} className="family-invite-code">{circle.invite_code}</p>
      <Button variant="secondary" className="family-pill" disabled={busy} onClick={() => void share()}>{t.familyAddMember.share}</Button>
      {copied && <p role="status" className="text-center">{t.familyAddMember.copied}</p>}
      {error && <p role="alert" className="text-error">{t.familyAddMember.error}</p>}
    </section>
  </>
}
