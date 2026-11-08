import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Avatar from '../../components/family/Avatar'
import PlusIcon from '../../components/family/PlusIcon'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import { useSession } from '../../hooks/useSession'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useLocalClock } from '../../hooks/useLocalClock'
import { localDate, localGreeting } from '../../lib/family'
import { splitMembers } from '../../lib/members'
import { t } from '../../i18n/en'
import familyIllustration from '../../assets/family-hug.svg'

export default function FamilyHome() {
  const { me } = useSession()
  const { members, loading, error, refetch } = useFamilyMembers()
  const now = useLocalClock()
  const navigate = useNavigate()
  useScreenEvent('/family')
  if (!me) return null
  const { realElders, realFamily } = splitMembers(members)
  const hasOthers = [...realElders, ...realFamily].some(member => member.id !== me.id)
  return <>
    <header className="family-home-header">
      <div className="min-w-0"><p>{localDate(now)}</p><h1>{localGreeting(me.first_name, now)}</h1></div>
      <Avatar name={me.first_name} small />
    </header>
    <MemberFeedStatus loading={loading} error={error && !members.length} retry={refetch} />
    {!loading && !(error && !members.length) && (hasOthers ? <>
      {realElders.length > 0 && <section className="family-summary" aria-label={t.familyHome.atHome(realElders.map(member => member.first_name))}>
        <div className="family-avatar-stack">{realElders.map(member => <Avatar key={member.id} name={member.first_name} />)}</div>
        <div className="min-w-0"><h2>{t.familyHome.atHome(realElders.map(member => member.first_name))}</h2><p>{t.familyHome.noJourney}</p></div>
      </section>}
      <ActivityEmptyState />
    </> : <section className="family-empty-state family-circle-empty">
      <div className="family-illustration-slot"><img src={familyIllustration} alt={t.familyHome.illustration} className="family-illustration" /></div>
      <h2>{t.familyHome.emptyTitle}</h2>
      <p>{t.familyHome.emptyDescription}</p>
      <Button className="family-pill family-action-button" onClick={() => navigate('/family/add-member')}><PlusIcon />{t.familyHome.invite}</Button>
    </section>)}
  </>
}
