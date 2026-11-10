import { Link } from 'react-router-dom'
import Avatar from '../../components/family/Avatar'
import FamilyNavIcon from '../../components/family/FamilyNavIcon'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import ShareInviteButton from '../../components/family/ShareInviteButton'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useElderTasks } from '../../hooks/useElderTasks'
import { useLocalClock } from '../../hooks/useLocalClock'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useSession } from '../../hooks/useSession'
import { useTaskCompanion } from '../../hooks/useTaskCompanion'
import { formatHomeDate } from '../../lib/date'
import { t } from '../../i18n/en'
import { ElderContactCard, ElderTaskCard } from './ElderTaskContent'

export default function ElderlyHome() {
  const { me, circle, userId } = useSession()
  const now = useLocalClock()
  const { upcoming, loading, error } = useElderTasks(now)
  const members = useFamilyMembers()
  const next = upcoming[0]
  const companion = useTaskCompanion(next)
  useScreenEvent('elder_home')
  if (!me || !circle) return null

  if (circle.created_by === userId) {
    if (members.loading || members.error) {
      return <MemberFeedStatus loading={members.loading} error={members.error} retry={members.refetch} />
    }
    if (!members.members.some(member => member.role === 'family' && !member.is_mock)) {
      return <section className="family-empty-state">
        <h1 className="text-2xl font-semibold">{t.elderly.inviteTitle}</h1>
        <ShareInviteButton label={t.elderly.share} primary />
      </section>
    }
  }

  const hour = now.getHours()
  const greeting = hour < 12 ? t.elderly.morning : hour < 18 ? t.elderly.afternoon : t.elderly.evening
  return <>
    <header className="family-home-header">
      <div><p>{formatHomeDate(now)}</p><h1>{greeting(me.first_name)}</h1></div>
      <Avatar name={me.first_name} />
    </header>
    <section className="elder-section">
      <h2>{t.elderly.menu}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link className="elder-menu-tile bg-support-3" to="/elderly/members">
          <strong>{t.elderly.family}</strong><span>{t.elderly.familyHint}</span><FamilyNavIcon kind="family" />
        </Link>
        <Link className="elder-menu-tile bg-support-1" to="/elderly/tasks">
          <strong>{t.elderly.tasks}</strong><span>{t.elderly.tasksHint}</span><FamilyNavIcon kind="tasks" />
        </Link>
      </div>
    </section>
    <section className="elder-section">
      <h2>{t.elderly.next}</h2>
      <TaskFeedStatus />
      {next ? <ElderTaskCard task={next} from="home" /> : !loading && !error && <ActivityEmptyState elderly />}
    </section>
    {companion && <section className="elder-section">
      <h2>{t.elderly.quickCall}</h2>
      <ElderContactCard companion={companion} />
    </section>}
  </>
}
