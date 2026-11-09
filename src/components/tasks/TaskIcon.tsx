export default function TaskIcon({ kind }: { kind: 'calendar' | 'location' | 'person' | 'search' | 'edit' }) {
  return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'calendar' ? <><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M7 3v4m10-4v4M7 14h1m3 0h1m3 0h1M7 17h1m3 0h1m3 0h1"/></>
    : kind === 'location' ? <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>
    : kind === 'person' ? <><circle cx="12" cy="6" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3H4Z"/></>
    : kind === 'edit' ? <path d="M12 5H4v15h15v-8M8 16l1-4L19 2l3 3-10 10-4 1Z"/>
    : <><circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/></>}
  </svg>
}
