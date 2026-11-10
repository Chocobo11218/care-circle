export const resendCooldownMs = 60_000

export function normalizeEmail(value: string): string | null {
  const email = value.trim().toLowerCase()
  return email.length <= 254 && /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email) ? email : null
}

export function sanitizeOtp(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function resendSeconds(deadline: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}
