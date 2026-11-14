import { normalizeEmail } from './email-auth'

export const studyCode = '123456'
export type StudyContactMethod = 'email' | 'mobile'

export function isStudyContactValid(value: string, method: StudyContactMethod): boolean {
  if (method === 'email') return normalizeEmail(value) !== null
  return /^\+?\d{8,15}$/.test(value.trim().replace(/[\s()-]/g, ''))
}
