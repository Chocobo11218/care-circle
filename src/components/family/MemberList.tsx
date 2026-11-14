import { memberCopy } from '../../i18n/member-copy'
import Avatar from './Avatar'
import MemberFeedStatus from './MemberFeedStatus'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { orderedMembers } from '../../lib/members'
import { joinedTime } from '../../lib/family'
import { t } from '../../i18n/index'

export default function MemberList() {
  const { members, loading, error, refetch } = useFamilyMembers()
  return <>
    <MemberFeedStatus loading={loading} error={error && !members.length} retry={refetch} />
    {!loading && !(error && !members.length) && <section className="family-members-section">
      <h2 aria-live="polite">{t.familyMembers.count(members.length)}</h2>
      <ul className="family-member-list">{orderedMembers(members).map(member => {
        const time = joinedTime(member.joined_at)
        return <li key={member.id} className="family-member-card">
          <Avatar name={member.first_name} />
          <div className="min-w-0"><h3>{member.first_name}</h3>
            {member.availability && <p>{memberCopy(member.availability, member.is_mock)}</p>}
            {time && <p>{t.familyMembers.since(time)}</p>}
          </div>
        </li>
      })}</ul>
    </section>}
  </>
}
