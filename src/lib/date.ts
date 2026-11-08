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
