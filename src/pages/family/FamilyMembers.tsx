import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import TopBar from '../../components/TopBar'
import Avatar from '../../components/family/Avatar'
import PlusIcon from '../../components/family/PlusIcon'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { orderedMembers } from '../../lib/members'
import { joinedTime } from '../../lib/family'
import { t } from '../../i18n/en'

export default function FamilyMembers() {
  const { members, loading, error, refetch } = useFamilyMembers()
  const navigate = useNavigate()
  useScreenEvent('/family/members')
  return <>
    <TopBar title={t.familyMembers.title} showBack={false} />
    <MemberFeedStatus loading={loading} error={error && !members.length} retry={refetch} />
    {!loading && !(error && !members.length) && <section className="family-members-section">
      <h2 aria-live="polite">{t.familyMembers.count(members.length)}</h2>
      <ul className="family-member-list">{orderedMembers(members).map(member => {
        const time = joinedTime(member.joined_at)
        return <li key={member.id} className="family-member-card">
          <Avatar name={member.first_name} />
          <div className="min-w-0"><h3>{member.first_name}</h3>
            {member.availability && <p>{member.availability}</p>}
            {time && <p>{t.familyMembers.since(time)}</p>}
          </div>
        </li>
      })}</ul>
    </section>}
    <div className="family-floating-action"><Button variant="outline" className="family-pill family-action-button" onClick={() => navigate('/family/add-member')}><PlusIcon />{t.familyMembers.add}</Button></div>
  </>
}
