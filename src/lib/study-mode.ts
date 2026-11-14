export const studyMode = import.meta.env.VITE_STUDY_SIGNUP === 'true'

const verificationKey = 'carecircle_study_verified_user'
let verifiedUser: string | null = null

export function markStudySignupVerified(userId: string) {
  verifiedUser = userId
  try { sessionStorage.setItem(verificationKey, userId) } catch { /* In-memory fallback. */ }
}

export function hasStudySignupVerification(userId: string | null): boolean {
  if (!userId) return false
  if (verifiedUser === userId) return true
  try { return sessionStorage.getItem(verificationKey) === userId } catch { return false }
}
