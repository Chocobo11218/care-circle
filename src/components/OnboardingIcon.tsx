import family from '../assets/family.svg'
import elderly from '../assets/elderly.svg'
import create from '../assets/create.svg'
import join from '../assets/join.svg'

export default function OnboardingIcon({ kind }: { kind: 'family' | 'elderly' | 'create' | 'join' | 'location' | 'notifications' }) {
  if (kind === 'family') return <img src={family} alt="" />
  if (kind === 'elderly') return <img src={elderly} alt="" />
  if (kind === 'create') return <img src={create} alt="" />
  if (kind === 'join') return <img src={join} alt="" />
  return <svg aria-hidden="true" width="32" height="32" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'location' ? <><path d="M31 16c0 9-11 19-11 19S9 25 9 16a11 11 0 0 1 22 0Z"/><circle cx="20" cy="16" r="4"/></>
    : <><path d="M9 28h22l-3-5v-8a8 8 0 0 0-16 0v8l-3 5Z"/><path d="M17 33a3 3 0 0 0 6 0"/></>}
  </svg>
}
