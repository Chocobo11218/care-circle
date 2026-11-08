import { NavLink } from 'react-router-dom'
import FamilyNavIcon from './FamilyNavIcon'
import { t } from '../../i18n/en'

export default function FamilyBottomNav() {
  return <nav className="family-nav" aria-label={t.familyNav.label}>
    <NavLink to="/family" end><FamilyNavIcon kind="home" /><span>{t.familyNav.home}</span></NavLink>
    <NavLink to="/family/tasks"><FamilyNavIcon kind="tasks" /><span>{t.familyNav.tasks}</span></NavLink>
    <NavLink to="/family/members"><FamilyNavIcon kind="family" /><span>{t.familyNav.family}</span></NavLink>
  </nav>
}
