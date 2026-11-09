import { t } from '../i18n/en'

export function formatBirthday(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join('/')
}

export function parseBirthday(value: string, today = new Date()): Date | null {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return null
  const [day, month, year] = value.split('/').map(Number)
  if (year < 1900) return null
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return date <= end ? date : null
}

export function isValidBirthday(value: string): boolean {
  return parseBirthday(value) !== null
}

export function birthdayToISO(value: string): string {
  if (!isValidBirthday(value)) throw new Error('Invalid birthday')
  const [day, month, year] = value.split('/')
  return `${year}-${month}-${day}`
}


export const USE_BUDDHIST_YEAR = false

export function localISODate(now = new Date()): string {
  return `${String(now.getFullYear()).padStart(4, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function parseTaskDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function formatShortDate(value: string): string {
  const date = parseTaskDate(value)
  return date ? new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(date).replace(/^(\S+) /, '$1, ') : ''
}

export function formatTaskDateLabel(value: string | null, now = new Date(), buddhistYear = USE_BUDDHIST_YEAR): string {
  const date = value ? parseTaskDate(value) : null
  if (!date) return t.taskDates.noDate
  const text = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' }).format(date)
  return date.getFullYear() === now.getFullYear() ? text : `${text} ${date.getFullYear() + (buddhistYear ? 543 : 0)}`
}

export function formatTaskRow(task: { task_date: string | null; start_time: string | null; end_time: string | null }, now = new Date()): string {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  const date = task.task_date ? formatShortDate(task.task_date) : ''
  const relative = task.task_date === localISODate(now) ? t.taskDates.today : task.task_date === localISODate(tomorrow) ? t.taskDates.tomorrow : ''
  const start = task.start_time?.slice(0, 5) || ''
  const end = task.end_time?.slice(0, 5) || ''
  const time = start && end ? t.taskDates.range(start, end) : start ? t.taskDates.startsAt(start) : end ? t.taskDates.endsAt(end) : ''
  return t.taskDates.row(relative, date, time) || t.taskDates.unscheduled
}

export function formatHomeDate(now: Date): string {
  return formatShortDate(localISODate(now))
}

export function formatJoinedTime(value: string): string | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
}

export function formatElderTaskDate(value: string | null): string {
  const date = value ? parseTaskDate(value) : null
  if (!date) return t.elderly.unavailable
  return new Intl.DateTimeFormat(USE_BUDDHIST_YEAR ? 'en-GB-u-ca-buddhist' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date)
}

export function formatTaskTime(startTime: string | null, endTime: string | null): string {
  const start = startTime?.slice(0, 5)
  const end = endTime?.slice(0, 5)
  return start && end ? t.taskDates.range(start, end)
    : start ? t.taskDates.startsAt(start)
    : end ? t.taskDates.endsAt(end) : t.elderly.unavailable
}
