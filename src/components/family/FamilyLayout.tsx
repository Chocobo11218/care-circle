import { Outlet, useLocation } from 'react-router-dom'
import { useTasks } from '../../hooks/useTasks'
import { useMembers } from '../../hooks/useMembers'
import PageShell from '../PageShell'
import FamilyBottomNav from './FamilyBottomNav'

export default function FamilyLayout() {
  const members = useMembers()
  const tasks = useTasks()
  const { pathname } = useLocation()
  const hasNav = ['/family', '/family/', '/family/tasks', '/family/members'].includes(pathname.replace(/\/$/, '') || pathname)
  return <PageShell><div className={`family-page ${hasNav ? 'family-with-nav' : ''}`}>
    <Outlet context={{ ...members, tasks }} />
  </div>{hasNav && <FamilyBottomNav />}</PageShell>
}
