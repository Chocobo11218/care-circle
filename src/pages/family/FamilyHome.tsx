import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Avatar from '../../components/family/Avatar'
import PlusIcon from '../../components/family/PlusIcon'
import TaskSections from '../../components/tasks/TaskSections'
import TaskFeedStatus from '../../components/tasks/TaskFeedStatus'
import { useFamilyTasks } from '../../hooks/useFamilyTasks'
import ActivityEmptyState from '../../components/family/ActivityEmptyState'
import MemberFeedStatus from '../../components/family/MemberFeedStatus'
import { useSession } from '../../hooks/useSession'
import { useFamilyMembers } from '../../hooks/useFamilyMembers'
import { useScreenEvent } from '../../hooks/useScreenEvent'
import { useLocalClock } from '../../hooks/useLocalClock'
import { localDate, localGreeting } from '../../lib/family'
import { careRecipientIds } from '../../lib/tasks'
import { splitMembers } from '../../lib/members'
import { t } from '../../i18n/index'
import familyIllustration from '../../assets/family-hug.svg'

export default function FamilyHome() {
  const { me } = useSession()
  const { members, loading, error, refetch } = useFamilyMembers()
  const taskFeed = useFamilyTasks()
  const now = useLocalClock()
  const navigate = useNavigate()
  useScreenEvent('/family')
  if (!me) return null
  const { realElders, realFamily } = splitMembers(members)
  const latestElder = realElders.reduce<typeof realElders[number] | undefined>((latest, elder) =>
    !latest || Date.parse(elder.joined_at) > Date.parse(latest.joined_at) ? elder : latest, undefined)
  const firstUnlinked = taskFeed.tasks.reduce<typeof taskFeed.tasks[number] | undefined>((first, task) =>
    careRecipientIds(task).length === 0 && (!first || Date.parse(task.created_at) < Date.parse(first.created_at)) ? task : first, undefined)
  const hasOthers = [...realElders, ...realFamily].some(member => member.id !== me.id)
  return <>
    <header className="family-home-header">
      <div className="min-w-0"><p>{localDate(now)}</p><h1>{localGreeting(me.first_name, now)}</h1></div>
      <Link to="/family/profile" className="flex min-h-14 min-w-14 items-center justify-center rounded-full" aria-label={t.profile.title}>
        <Avatar name={me.first_name} small />
      </Link>
    </header>
    <MemberFeedStatus loading={loading} error={error && !members.length} retry={refetch} />
    {!loading && taskFeed.loading && <TaskFeedStatus />}
    {!loading && !taskFeed.loading && taskFeed.error && !taskFeed.tasks.length && <TaskFeedStatus />}
    {!loading && !taskFeed.loading && !(taskFeed.error && !taskFeed.tasks.length) && !(error && !members.length) && (hasOthers || taskFeed.tasks.length > 0 ? <>
      {realElders.length > 0 && <section className="family-summary" aria-label={t.familyHome.atHome(realElders.map(member => member.first_name))}>
        <div className="family-avatar-stack">{realElders.map(member => <Avatar key={member.id} name={member.first_name} />)}</div>
        <div className="min-w-0"><h2>{t.familyHome.atHome(realElders.map(member => member.first_name))}</h2><p>{t.familyHome.noJourney}</p></div>
      </section>}
      {latestElder && firstUnlinked && <Link className="task-joined-banner" to={`/family/tasks/${firstUnlinked.id}/choose-elder`} state={{ fromHome: true }}>
        <span>{t.chooseElder.joined(latestElder.first_name)}</span><span aria-hidden="true">›</span>
      </Link>}
      <TaskFeedStatus />
      {!taskFeed.loading && !taskFeed.error && (taskFeed.tasks.length ? <TaskSections /> : <ActivityEmptyState />)}
      {!taskFeed.loading && taskFeed.tasks.length > 0 && <Button className="family-pill family-action-button mt-5" onClick={() => navigate('/family/tasks/new')}><PlusIcon />{t.familyTasks.add}</Button>}
    </> : <section className="family-empty-state family-circle-empty">
      <div className="family-illustration-slot"><img src={familyIllustration} alt={t.familyHome.illustration} className="family-illustration" /></div>
      <h2>{t.familyHome.emptyTitle}</h2>
      <p>{t.familyHome.emptyDescription}</p>
      <Button className="family-pill family-action-button" onClick={() => navigate('/family/add-member')}><PlusIcon />{t.familyHome.invite}</Button>
    </section>)}
  </>
}
