import { t } from '../i18n/en'

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

export function localDate(now: Date) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(now).replace(/^(\S+) /, '$1, ')
}

export function joinedTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}
