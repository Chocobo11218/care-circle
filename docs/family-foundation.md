# Family foundation

Routes: `/family`, `/family/tasks`, `/family/members`, `/family/add-member`, and the task-creation placeholder `/family/tasks/new`. The previous `/family/home` address redirects to `/family`.

The existing onboarding guard protects family routes. Signed-out devices return to onboarding, and elderly members return to their existing elderly Home route.

## Member data

`useMembers` belongs to the shared family layout, so switching tabs does not create a new subscription. It loads the current circle, listens for member changes, buffers events during a pending fetch, and revalidates on visibility and reconnection. It removes its channel and listeners on unmount. A one-second fallback fetch keeps the list usable when Realtime cannot connect. Loading and failed reads do not display a false empty circle.

The filtered subscription handles circle INSERT/UPDATE events. A separate DELETE listener removes only primary keys already present in the local list, because delete payloads with RLS may contain only the primary key. See [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes). Database publication and policies must already permit the intended events; this slice makes no SQL changes.

`splitMembers` keeps real elderly members, real family, and mock candidates separate. Only another real member changes Home out of its empty-circle state. The Family list includes all three groups, in that order. The summary includes real elderly members only. No task queries or task mutations are added.

`useScreenEvent` writes `circle_id`, **member** `id`, and route to `session_events`. Failures are ignored. The hook avoids duplicate development Strict Mode effects.

## Design and sharing

Strings, including names/count templates and accessible labels, live in `src/i18n/en.ts`. Avatar colors match the supplied screenshots: lavender `#E9D5FF`, mint `#CCFBF1`, and pink `#FBCFE8`. Other colors reuse existing tokens. Navigation uses black for the active item and the existing contrast-safe muted color for inactive items.

The existing family SVG and calendar PNG match the supplied illustrations. The SVG is displayed at its intrinsic size inside a wrapper that crops unrelated export edges outside the artwork. The calendar keeps its transparent background. Both are local assets. Inline navbar SVGs reproduce the supplied house-with-heart, clipboard, and people shapes; original vector exports were unavailable because the Figma connector reached its plan limit.

The brief's 18 px text and 56 px minimum controls make some content taller than the reference frames. The existing PageShell retains its 24 px padding and centered 448 px maximum width. All avatars use initials as requested.

The invite action first tries the native share sheet. If unavailable or rejected, it copies only the invite code. A copy failure shows an inline error. It does not request device permissions.

## Validation

Use Node 22.13.1 or a compatible newer version for the installed Vite release:

```sh
npm run lint
npm run build
node --test tests/*.test.mjs
```

Local browser checks covered 360, 393, and 430 px phone widths and a centered desktop column. Text measured at least 18 px, controls at least 56 px, and the bottom nav 80 px before any additional safe-area padding. Inspected layouts had no horizontal overflow.

An isolated local Supabase substitute exercised joins, updates, primary-key-only deletes, member order/count changes, mock exclusion on Home, fetch failure/recovery, visibility refetch, role redirects, screen-event member ids, sharing fallback, clipboard failure, and the task placeholder. The observed simulated join update was about 0.36 seconds. This is not a measurement of production Supabase latency.

The two-physical-phone acceptance check against live Supabase and the native iOS Safari/Android Chrome share sheet checks remain to be run in the deployed environment. No real accounts or database test records were created during local browser verification.
