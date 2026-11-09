import type { Draft } from './draft-context'
import type { Role } from '../types'
import { isValidBirthday } from './date'

export function missingStep(draft: Draft, step: 'name' | 'birthday' | 'circle') {
  if (draft.role !== 'family' && draft.role !== 'elderly') return '/select-role'
  if (step !== 'name' && (!draft.firstName.trim() || !draft.lastName.trim())) return '/name'
  if (step === 'circle' && !isValidBirthday(draft.birthday)) return '/birthday'
  return null
}

export function homePath(role: Role) {
  return role === 'elderly' ? '/elderly' : '/family'
}

export function readLocal(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}

export function writeLocal(key: string, value: string) {
  localStorage.setItem(key, value)
}

export function readPermission(key: string): boolean {
  return readLocal(key) !== 'false'
}
