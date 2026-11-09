import ShareInviteButton from '../../components/family/ShareInviteButton'
import TopBar from '../../components/TopBar'
import { useSession } from '../../hooks/useSession'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { t } from '../../i18n/en'

export default function FamilyAddMember() {
  const { circle } = useSession()
  useScreenEvent('/family/add-member')
  if (!circle) return null
  return <>
    <TopBar title={t.familyAddMember.title} />
    <section className="family-invite-section">
      <h2>{t.familyAddMember.heading}</h2>
      <p>{t.familyAddMember.description(circle.name)}</p>
      <p aria-label={t.familyAddMember.code} className="family-invite-code">{circle.invite_code}</p>
      <ShareInviteButton />
    </section>
  </>
}
