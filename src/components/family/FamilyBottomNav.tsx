import { Link, NavLink } from 'react-router-dom'
import FamilyNavIcon from './FamilyNavIcon'
import { t } from '../../i18n/en'

export default function FamilyBottomNav({ base = '/family', detailTab }: {
  base?: '/family' | '/elderly'
  detailTab?: 'home' | 'tasks'
}) {
  const items = [
    { kind: 'home', path: base, end: true },
    { kind: 'tasks', path: base + '/tasks', end: base === '/elderly' },
    { kind: 'family', path: base + '/members', end: false },
  ] as const
  return <nav className="family-nav" aria-label={t.familyNav.label}>
    {items.map(({ kind, path, end }) => {
      const label = <><FamilyNavIcon kind={kind} /><span>{t.familyNav[kind]}</span></>
      return detailTab
        ? <Link key={kind} to={path} aria-current={kind === detailTab ? 'page' : undefined}>{label}</Link>
        : <NavLink key={kind} to={path} end={end}>{label}</NavLink>
    })}
  </nav>
}
