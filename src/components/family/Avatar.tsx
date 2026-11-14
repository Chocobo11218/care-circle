import { avatarTone, memberInitial } from '../../lib/family'
import { t } from '../../i18n/index'

export default function Avatar({ name, small = false }: { name: string; small?: boolean }) {
  return <span role="img" aria-label={t.familyCommon.avatar(name)} className={`family-avatar avatar-${avatarTone(name)} ${small ? 'family-avatar-small' : ''}`}>
    {memberInitial(name)}
  </span>
}
