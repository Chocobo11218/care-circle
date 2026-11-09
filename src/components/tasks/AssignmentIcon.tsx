type Kind = 'sparkles' | 'info' | 'check' | 'best' | 'good' | 'alternative' | 'people'

const paths: Record<Kind, string> = {
  sparkles: 'M9 2l2.2 5.8L17 10l-5.8 2.2L9 18l-2.2-5.8L1 10l5.8-2.2L9 2ZM19 13l1.3 3.7L24 18l-3.7 1.3L19 23l-1.3-3.7L14 18l3.7-1.3L19 13Z',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-11v6m0-10h.01',
  check: 'm4 12 5 5L20 6',
  best: 'm12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z',
  good: 'm4 12 5 5L20 6',
  alternative: 'M3 8h17m-4-4 4 4-4 4M21 16H4m4-4-4 4 4 4',
  people: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-6 6c0-4 12-4 12 0s-12 4-12 0Zm16-7a3 3 0 1 0 0-6m-1 10c7-1 8 6 0 6',
}

export default function AssignmentIcon({ kind }: { kind: Kind }) {
  return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind]} /></svg>
}
