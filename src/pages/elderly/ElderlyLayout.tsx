import { useLayoutEffect } from 'react'
import { Outlet, useLocation, useMatch } from 'react-router-dom'
import PageShell from '../../components/PageShell'
import FamilyBottomNav from '../../components/family/FamilyBottomNav'
import { useMembers } from '../../hooks/useMembers'
import { useTasks } from '../../hooks/useTasks'

export default function ElderlyLayout() {
  const members = useMembers()
  const tasks = useTasks()
  const { pathname, state } = useLocation()
  const detail = useMatch('/elderly/tasks/:id')
  const origin = state?.from === 'tasks' ? 'tasks' : 'home'
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return <PageShell>
    <div className="family-page family-with-nav elder-page">
      <Outlet context={{ ...members, tasks }} />
    </div>
    <FamilyBottomNav base="/elderly" detailTab={detail ? origin : undefined} />
  </PageShell>
}
