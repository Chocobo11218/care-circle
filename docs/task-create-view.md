# Slice 2: task creation and viewing

Branch: `feat/task-create-view`, created from the up-to-date `test` branch.

## Updated requirement

The user clarified that **every new task requires a date**, including when there is no real elder. This supersedes the original optional-date and name-only acceptance examples. Without an elder, the minimum valid task has a name and a current/future date; its `elder_id` is null.

## Implemented

- Shared `useTasks` feed scoped to the session circle, with INSERT/UPDATE/DELETE merging, buffered events during fetch, reconnection and visibility refetch, cleanup, and loading/error states.
- In-memory, circle-scoped TaskDraftProvider. Navigation away and back preserves values; successful saves clear them. Full page refresh intentionally clears this draft. No task draft is written to localStorage.
- `/family/tasks/new`: real-elder radio cards, single-elder preselection, no-elder invitation link, native date/time controls, optional location/description/notes, and two save actions. Date and name are required. Past dates and invalid time ordering show inline errors and focus the first invalid field. All optional empty strings become null.
- Save task inserts an unassigned task and returns to Tasks. Assign to Myself inserts with `assignee_id = me.id` and opens details. Pending controls and a synchronous guard prevent repeated submission; failed saves retain the draft.
- Task cards and derived Needs Attention/Upcoming sections on Home and Tasks. Assigned tasks never appear under Needs Attention. Upcoming includes assigned tasks dated today or later; past/legacy-undated assigned tasks are not in that section. Sorting places missing dates/times last.
- Quick assignment on cards/details uses the member id and a conditional update of an unassigned task. It does not overwrite an assignment made concurrently by another participant.
- `/family/tasks/:id`: task facts, creator, description, optional Note box, assignee state/action, and a deleted/missing-task message with a back link.
- Family route changes begin at the top. Live updates on the same route do not reset scroll position.

No recommendation/Choose family member flow, request actions, older-adult badge/banner, editing, maps, or directions were added.

## Dates and design

All app date formatting is in `src/lib/date.ts`, including the existing family header and joined-time wrappers. Today/Tomorrow use the actual device-local date; the clock refreshes the display each minute. `USE_BUDDHIST_YEAR` defaults to false. The alternate-year formatter converts displayed years when enabled; dates stored in Supabase remain Gregorian ISO dates. Native date/time inputs use `en-GB` and one-minute time precision.

The supplied screenshots guided layout, cards, mint elder pills, blue notes, and field spacing. Body text stays at least 18 px and fields/buttons at least 56 px. Initial avatars replace elder photos as requested. Existing tokens and artwork are reused. Original screenshot Buddhist years are Gregorian until the display flag is enabled. The narrower phone layout may be taller than the reference because of the accessibility sizes.

## Data boundaries

`created_by`, `elder_id`, and `assignee_id` are member ids. Inserts include the current circle id, and assignment updates filter both task id and circle id. Status remains derived from `assignee_id`; no status field or SQL changes were added. The existing Supabase client and providers are unchanged.

DELETE handling follows the existing members-feed approach: filtered change events plus a primary-key DELETE listener that only removes locally known ids. RLS and the Realtime publication must already permit the intended tasks access/events.

## Checks

With the existing Node 22.13.1 installation:

```sh
npm run lint
npm run build
node --test tests/*.test.mjs
```

All pass: 20 tests total. Vite reports its non-blocking main-chunk size warning.

Isolated local browser checks covered both insert paths, required/past dates, reversed times, first-invalid-field focus, one/multiple/no real elders, retained drafts, cleared drafts after success, failed insert recovery, quick assignment, optional detail blocks, live deletion/missing-task state, refresh recovery, and member-id payloads. Two local family views received task INSERT/UPDATE/DELETE events without refresh; a simulated creation reached the second view in about 0.5 seconds. This is not a measurement of live Supabase latency.

Checked 360 px creation/details and 430 px task lists. Inspected controls were at least 56 px high, text at least 18 px, and no horizontal overflow was observed. No bottom nav is shown on create/details. Screenshots are included in the chat's output report.

Real-device two-phone Supabase synchronization and mobile operating-system date/time picker behavior remain unverified. Local checks used a substitute outside the repository, not real database records. The shipped application uses the real unchanged Supabase client.
