# CareCircle project handoff

Snapshot based on `origin/test` at `0d983f5`. This is the starting point for a new Codex chat. Use the current source and migration files when older slice reports disagree with this handoff.

## What it is

CareCircle is a mobile web usability-test app for families coordinating care in an invite-code circle. The implemented family flow covers onboarding, inviting members, creating and editing tasks, choosing care recipients, and assigning a caregiver. **Care recipients** are the people receiving care. The **assignee** is the one caregiver responsible for the task.

## Stack and local development

- React 19, TypeScript 6, Vite 8, React Router 7, Tailwind CSS 4, and ESLint. UI tokens live in [src/index.css](../src/index.css). English UI copy lives in [src/i18n/en.ts](../src/i18n/en.ts).
- Supabase JS with anonymous auth, Postgres, and Realtime. The browser client reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from the local Vite environment. Use the anon key in the browser and keep service-role credentials out of frontend code.
- Vercel SPA routing is configured in [vercel.json](../vercel.json). Keep credentials out of Git.
- Node **22.13.1** was used for validation. The installed Vite engine range is `^20.19.0 || >=22.12.0`.

```sh
npm ci
npm run dev
npm run lint
npm run build
node --test tests/*.test.mjs
```

Tests live in [tests/](../tests/) and use Node's test runner. The current suite has **27 tests**. There is no `npm test` script. The suite covers task validation, dates, feed merging, member ordering, recommendation ranking, conditional assignment/linking, picker buttons, and multi-recipient round-tripping. The build succeeds with a Vite warning for a minified JavaScript chunk over 500 kB.

## Decisions

### Tasks and care recipients

- **Name and date are required** on Create and Edit. Dates use the device's local calendar and must be today or later. If both times are set, the end must follow the start. Location, description, note, and times are optional. Readers tolerate older rows with a missing date.
- **Task drafts are memory-only** and scoped to the circle. Create clears the draft after saving. Edit has a task-scoped draft that survives opening the saved-task caregiver picker. Refresh discards unsaved task changes. The separate onboarding draft uses local storage.
- **Who needs care** is a multi-select in Create and Edit. Older adults stay at the top when **Choose someone else** expands the other members. A sole real older adult is preselected on a fresh Create draft. If a real older adult exists, at least one recipient is required, and any selectable member satisfies the requirement. With no real older adult, the recipient list can be empty. The current selector also accepts mock member rows from the circle feed.
- The original **Needs older adult** pill and card action were removed. **Task details** shows the neutral, non-interactive **No care recipient selected** pill when the list is empty. **Edit task → Who needs care** is where users change the recipients from Task details. Edit displays the selector itself. Linked cards and details display recipient pills.
- The **Home joined banner** still provides a separate older-adult shortcut. When real older adults and tasks without any recipient coexist, the banner names the newest real older adult by `joined_at` and opens the oldest unlinked task by `created_at`. The picker saves one real older adult, returns to Home, and the banner advances while tasks remain.

### Caregiver assignment

- **Assign to Myself** on Create selects the caregiver in the draft. The draft picker uses **Confirm**, which returns to the form with the assignee pill. Both paths wait for **Save task** before inserting. Saving an assigned draft opens Task details. Saving an unassigned draft opens Tasks.
- On a saved task, **Send request**, **Request {name}** (for example, **Request Fay**), and **Assign to Myself** assign immediately. Regular assignment writes only `assignee_id`, scoped by task ID, circle ID, and `assignee_id IS NULL`. The picker entered from Edit can replace an assignment only while the stored value matches the assignee captured on entry. The application has no pending acceptance step.
- Suggested assignment uses fixture-style member data, including `is_mock`, `match_label`, `distance_km`, `availability`, and `match_reasons`. The quick suggestion uses a best-tier mock family member if one exists. The picker ranks family-role members, including the signed-in member, by best/good/alternative tier and then distance. It shows one recommendation per available tier and expands remaining candidates under **Other family members**. The current member is labeled **You**.
- **Fay, Ploy, and Mikky** are the intended mock caregiver names from the supplied design handoff. The app reads member rows from Supabase and does not seed these names in the repository. See **Unverified** for live contents.
- The Home avatar opens **Profile → Log out**. Logout uses Supabase's local session scope, removes the onboarding draft, and reloads at the landing page. The flow issues no delete to the circle, members, or tasks.

### Accepted design deviations

- Family screens target **18 px minimum text** and **56 px minimum tap targets**. Initial avatars replace photos. Existing UI tokens and local assets are reused.
- Task details has no map or **Direction** action. The task calendar uses Gregorian years by default (`USE_BUDDHIST_YEAR = false`). Native date/time picker rendering varies by device.
- Use the user's attached Figma screenshots for visual references when the connector quota is exhausted. The original Slice 1 audit recorded that limit.

## Database

[The TypeScript row contracts](../src/types/index.ts) and write calls describe what the app consumes. The repo has no complete base schema or RLS definition. Treat the column list below as the app contract rather than an independently audited live database schema.

| Task column | App contract |
|---|---|
| `id`, `circle_id`, `created_at` | Task identity, circle scope, and creation timestamp. |
| `created_by` | Creator's **member ID**. Set on insert and excluded from edit payloads. |
| `assignee_id` | Nullable caregiver **member ID**. Single assignee. |
| `elder_id` | Nullable legacy single recipient. New writes keep the first selected elderly-role member here when one exists. |
| `care_recipient_ids` | Nullable `uuid[]` of selected **member IDs**, including non-elders. Added by [202611090001_add_task_care_recipients.sql](../supabase/migrations/202611090001_add_task_care_recipients.sql). |
| `title`, `task_date` | Task name and date. Both required by the form. The read type still permits a null date. |
| `location`, `start_time`, `end_time`, `description`, `note` | Optional task details. Empty optional strings are written as null. |

- `careRecipientIds(task)` uses the array whenever present, including an empty array. If the array is null or absent, it falls back to `[elder_id]` when the legacy ID is set. New writes use null when no recipient is selected. The migration adds a nullable column and does not backfill existing rows. An ordinary edit only writes recipient fields if the selection changes.
- **Needs Attention** is derived, with no task status column in the app contract. `assignee_id === null` is sufficient for Needs Attention. An assigned task with zero care recipients also stays there. **Upcoming** requires a caregiver, at least one recipient, and a date today or later. Lists sort by date and start time, with missing values last.
- `tasksForElder(tasks, memberId)` matches the requested member ID in the effective recipient list, including legacy rows. This is a client helper for the future elderly UI. Database authorization is a separate concern.
- Other database entry points are `circles`, `members`, `session_events`, and the `create_circle` / `join_circle` RPCs. Screen events insert `circle_id`, `member_id`, and `screen`. Creator, recipient, assignee, and event actor fields use member IDs. `members.user_id` links membership to the auth identity.
- **Live migration application is unverified.** Apply the migration to the intended Supabase environment before validating new task writes if it is absent. A Git merge or Vercel deployment does not establish the database migration state.

## Code structure

### Family routes and screen events

All actual family screens are under the membership and family-role guard in [App.tsx](../src/App.tsx). Only the three main tabs show bottom navigation. Events below are exact emitted strings, including the older route-style names.

| Route | Screen and behavior | Event |
|---|---|---|
| `/family` | Home greeting, circle summary/empty states, joined banner, tasks, and Profile entry | `/family` |
| `/family/tasks` | Task sections, empty state, and Add task | `/family/tasks` |
| `/family/members` | My Family member count/list and invite entry | `/family/members` |
| `/family/add-member` | Circle code and Share invite. Native share uses circle name and code. Fallback copies only the code | `/family/add-member` |
| `/family/profile` | Profile and device-local Log out | `profile` |
| `/family/tasks/new` | Create a new task | `create_task` |
| `/family/tasks/new/choose-member` | Draft caregiver picker. Confirm returns to Create. Empty draft redirects back | `choose_member` |
| `/family/tasks/:id` | Task details, caregiver controls, and Edit task | `task_details` |
| `/family/tasks/:id/edit` | Shared form prefilled from the saved task | `edit_task` |
| `/family/tasks/:id/choose-member` | Saved-task caregiver picker. Send request writes immediately | `choose_member` |
| `/family/tasks/:id/choose-elder` | Single real older-adult picker, primarily reached from the Home joined banner | `choose_older_adult` |
| `/family/home` | Redirect to `/family` | Home logs after redirect |

### Where to work

| Area | Files and responsibilities |
|---|---|
| Realtime feeds | [FamilyLayout.tsx](../src/components/family/FamilyLayout.tsx) mounts [useMembers](../src/hooks/useMembers.ts) and [useTasks](../src/hooks/useTasks.ts) once for the family layout. Descendants read the feeds via `useFamilyMembers` and `useFamilyTasks`. Channels are `members:<circleId>` and `tasks:<circleId>`. The hooks scope reads/events to the circle, handle primary-key-only deletes against the current list, buffer changes during fetches, refetch on visibility/subscription changes, and clean up on unmount. |
| Task mutations | [useCreateTask](../src/hooks/useCreateTask.ts), [useUpdateTask](../src/hooks/useUpdateTask.ts), and [useAssignTask](../src/hooks/useAssignTask.ts) contain inserts and conditional updates. Successful writes update the local feed. |
| Analytics and session | [useScreenEvent](../src/hooks/useScreenEvent.ts) logs once per circle/member/screen key per mounted hook instance, tolerating failures. [session.tsx](../src/lib/session.tsx) handles anonymous auth and membership. |
| Drafts and forms | [task-draft.tsx](../src/lib/task-draft.tsx), `task-draft-context.ts`, and `useTaskDraft` hold the task draft. [SavedTaskDraft.tsx](../src/pages/family/SavedTaskDraft.tsx) scopes edit drafts across Edit and its picker. [CreateTask.tsx](../src/pages/family/CreateTask.tsx) renders the shared form. Keep contexts, providers, and hooks in their existing files. |
| Pure helpers | [date.ts](../src/lib/date.ts) formats local dates and controls Buddhist-year display. [tasks.ts](../src/lib/tasks.ts) contains validation, task grouping, payload builders, Realtime merging, and `tasksForElder`. [members.ts](../src/lib/members.ts) contains role grouping, recommendation ranking, and member merging. |
| Shared UI | `Button`, `Input`, `TopBar`, and `PageShell` are under [components/](../src/components/). `FamilyBottomNav`, `Avatar`, and feed states support the family UI. `TaskCard`, `TaskFacts`, `TaskSections`, `TaskAssignment`, `CareRecipientOptions`, and `ElderOptions` are under [components/tasks/](../src/components/tasks/). |

## Status

Verified against fetched `origin/test` and local/remote branch ancestry at the snapshot above.

| Work | Branch | PRs merged into `test` |
|---|---|---|
| Onboarding | `feat/onboarding` | #3 |
| Slice 1 — Family foundation | Historical `feature/family-foundation`; use `feat/` going forward | #4. Earlier PR #2 merged into `main` |
| Slice 2 — Create/view tasks | `feat/task-create-view` | #5 |
| Slice 3 — Suggested assignment and refinements | `feat/task-suggested-assign` | #6, #7, #8 |
| Slice 4 — Older-adult linking, Edit, and multi-recipient tasks | `feat/task-elder-gap-edit` | #9, #11 (Task details pill), #12 (older adults first in the expanded list) |
| Profile and device logout | `feat/profile` | #10 |

- Slice 4 follow-ups `4111452` (Task details) and `f19957c` (recipient ordering), and Profile commit `8eebfbe`, are already in `test`. No existing local or fetched remote `feat/*` branch had commits outside `origin/test`. The handoff branch is the documentation-only follow-up.
- By Git ancestry, `feat/family-foundation`, `feat/onboarding`, `feat/task-create-view`, `feat/task-suggested-assign`, `feat/task-elder-gap-edit`, and `feat/profile` are deletion candidates on both local and remote. Confirm nobody still relies on their Vercel branch previews before deleting. The historical remote `feature/family-foundation` was absent after pruning. Keep `main` and `test`.

## Roadmap

- **Phase 5:** Build the older-adult view-only experience: Home, Tasks, Task details, Family, Listen, and the empty state with a large **Share invite code** button. Currently only `/elderly/home` exists, rendering `HomeSummary`. Before implementing read access, verify recipient isolation against live database policies as well as testing the client filter.
- **Phase 6:** Facilitator panel. There is no facilitator route or panel in the checked-in app.
- **Phases 7 and 8:** No corresponding implementation identified. Confirm the intended scope before starting either phase.
- **Thai translation:** The repo has an English dictionary only. Thai UI copy and language switching are pending.

## Not yet decided

- Exact Phase 7/8 requirements, facilitator permissions and actions, and translation workflow.
- Whether to migrate legacy route-style event labels to plain names. Any event rename should be coordinated with whoever reads the logs.
- Follow-up scope for bundle splitting and whether to retain branch preview deployments after feature branch cleanup.

## Unverified

- Live Supabase migration history, full schema, publication configuration, RLS policies, and seeded mock member names/tiers. Code and migrations establish intended behavior, not the state of live rows or permissions.
- Live multi-recipient saves and edits, including caregiver/recipient updates arriving on a second physical phone. Earlier browser audits used synthetic Supabase data. Physical-device native share/date/time behavior and joining a different family after Profile logout also remain unverified.
- Prior slice reports document 360/393/430 px checks on earlier screens, but the **final** picker with Other family members, final multi-recipient Create/Edit layouts, revised Task details pill, and Profile were not recorded as checked at all three widths. Slice 2's original report specifically sampled Create/details at 360 px and lists at 430 px. This documentation change does not run a new visual audit.

## Working conventions

- Fetch `test` before starting. Create one `feat/<slice-or-feature>` branch from the latest `origin/test` and open a PR into `test`. Use `chore/` for documentation work. Avoid reviving the historical `feature/` prefix.
- Keep the work scoped to the current slice. Use the current code, attached screenshots, and user corrections when an older handoff differs. The Figma connector has hit its plan limit before, so use attached screenshots if design access is unavailable.
- Report in English with **Implemented**, **numbered yes/no checks with evidence**, **Validation** (lint, build, test count, diff check), **Assumptions**, **Commits**, **Files**, and **Screenshots at 393 px**. Distinguish live tests from fixtures and earlier screenshots from current UI. When asked to push, report the branch/commit and verified preview URL if available.
- Historical repo notes: [Slice 1](family-foundation.md) and [Slice 2](task-create-view.md). Use their verification as historical evidence rather than a current behavior spec.
