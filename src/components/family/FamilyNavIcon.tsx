export default function FamilyNavIcon({ kind }: { kind: 'home' | 'tasks' | 'family' }) {
  return <svg aria-hidden="true" width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'home' ? <><path d="m3 12 11-10 11 10M5 10v15h18V10"/><path fill="currentColor" stroke="none" d="M14 20s-6-3.6-6-6.6a3.2 3.2 0 0 1 6-1.3 3.2 3.2 0 0 1 6 1.3C20 16.4 14 20 14 20Z"/></>
    : kind === 'tasks' ? <><rect x="4" y="4" width="20" height="22" rx="1"/><path d="M9 3h10v3H9z" fill="currentColor"/></>
    : <><circle cx="10" cy="8" r="5"/><circle cx="22" cy="9" r="3"/><path d="M2 22c0-4 3-5 8-5s8 1 8 5-3 4-8 4-8 0-8-4Zm19-5c4 0 5 1 5 4s-1 4-5 4"/></>}
  </svg>
}
