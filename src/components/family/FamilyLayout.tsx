import { Outlet, useLocation } from 'react-router-dom'
import { useMembers } from '../../hooks/useMembers'
import PageShell from '../PageShell'
import FamilyBottomNav from './FamilyBottomNav'

export default function FamilyLayout() {
  const members = useMembers()
  const { pathname } = useLocation()
  const hasNav = ['/family', '/family/', '/family/tasks', '/family/members'].includes(pathname.replace(/\/$/, '') || pathname)
  return <PageShell><div className={`family-page ${hasNav ? 'family-with-nav' : ''}`}>
    <Outlet context={members} />
  </div>{hasNav && <FamilyBottomNav />}</PageShell>
}
