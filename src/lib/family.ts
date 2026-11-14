import { t } from '../i18n/index'
import { formatHomeDate, formatJoinedTime } from './date'

export function memberInitial(name: string) {
  return Array.from(name.trim())[0]?.toLocaleUpperCase() || t.familyCommon.unknownInitial
}

export function avatarTone(name: string): 'lavender' | 'mint' | 'pink' {
  const normalized = name.trim().toLocaleLowerCase()
  if (normalized === 'fay') return 'lavender'
  if (normalized === 'gunn') return 'mint'
  if (normalized === 'mikky') return 'pink'
  const hash = Array.from(normalized).reduce((total, letter) => total + letter.codePointAt(0)!, 0)
  return (['lavender', 'mint', 'pink'] as const)[hash % 3]
}

export function localGreeting(name: string, now: Date) {
  const hour = now.getHours()
  return hour < 12 ? t.familyHome.morning(name) : hour < 18 ? t.familyHome.afternoon(name) : t.familyHome.evening(name)
}

export function localDate(now: Date) { return formatHomeDate(now) }

export function joinedTime(value: string) { return formatJoinedTime(value) }
