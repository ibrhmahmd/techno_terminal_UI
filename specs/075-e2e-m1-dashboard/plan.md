# 075 — E2E M1: harness + dashboard

Issue: #32. Related: #33 (dropped toasts), #34 (instructor dashboard), backend techno-terminal#218 (purge), #219 (FK bug), #220 (instructor 403).

## 1. Files

| Path | Change |
|---|---|
| `package.json` | add `@playwright/test` (devDep, pin exact), scripts `e2e`, `e2e:sweep` |
| `playwright.config.ts` | projects, webServer, globalSetup |
| `vite.e2e.config.ts` | `mergeConfig(base, …)` overriding only the `/api` proxy target to `process.env.E2E_API_TARGET` |
| `e2e/tsconfig.json` | own TS config (not in `tsc -b`) |
| `e2e/global-setup.ts` | load `.env.e2e`, prod guard, run id |
| `e2e/auth.setup.ts` | UI login per role → `e2e/.auth/<role>.json` |
| `e2e/fixtures/*.ts` | `test` extended with `role`, `run`, `scenario` fixtures + UI page helpers |
| `e2e/specs/dashboard/*.spec.ts` | scenarios (§6) |
| `e2e/sweep.ts` | UI clean-up of leftover `e2e-` data |
| `.env.e2e.example` | variable names only |
| `.gitignore` | `e2e/.auth/`, `playwright-report/`, `test-results/` |
| `eslint.config.js` | ignore `e2e/`, `playwright.config.ts`, `vite.e2e.config.ts` (or give them a node config) |
| `src/**` | accessible handles (§5) |
| `AGENTS.md` | short E2E section (commands, prod guard, never point at prod) |

`vite.config.ts` stays untouched. Vitest's `src/**` include already excludes `e2e/`.

## 2. Safety

- `.env.e2e` (gitignored by `.env*`): `E2E_API_TARGET`, and `E2E_<ROLE>_EMAIL` / `E2E_<ROLE>_PASSWORD` for `ADMIN`, `SYSTEM_ADMIN`, `INSTRUCTOR_A`, `INSTRUCTOR_B`. Loaded with Node's built-in `process.loadEnvFile` (Node 24, no `dotenv`).
- **Prod guard** in `playwright.config.ts` *and* `global-setup.ts`: `new URL(E2E_API_TARGET).host` must equal `techno-terminal-staging.fastapicloud.dev`, otherwise throw before the dev server starts. Missing/empty → throw.
- `webServer`: `vite --config vite.e2e.config.ts --port 5179 --strictPort`, `reuseExistingServer: false`, so a normal `npm run dev` (which proxies to prod) can never be reused by the suite.
- Certificates proxy unchanged (not used by M1).

## 3. Projects and roles

- `setup` → logs in all 4 roles via the login form, saves storage state.
- `desktop` (Desktop Chrome) and `mobile` (Pixel 7, < 1024px), both depend on `setup`.
- Role is a fixture option. Admin specs run once per `role ∈ {admin, system_admin}` via `for (const role of …) test.describe(…)`; instructor specs use `instructor_a` / `instructor_b`.
- Workers: `fullyParallel: true`, `workers: 3` to start (staging load), `retries: 1`, `trace: 'retain-on-failure'`, screenshot + video on failure.

## 4. Data

**Naming:** `e2e-<runid>-w<worker>-<thing>`; `runid` = UTC timestamp. The backend renames groups to `"<Course> - <Day> <h:mm AM>"`, so the **course name carries the prefix** and groups are found through it.

**Worker-scoped `scenario` fixture** (created via UI as admin, owned by one worker, nobody else touches it):
1. Course `e2e-…-course` (sessions per level ≥ 4).
2. Group A: instructor A, **Day = today's weekday** (Cairo time), worker-unique time slot inside 11:00–21:00. Group creation auto-generates Level 1 sessions starting today.
3. Group B: same, instructor B.
4. 3 students per group, registered via `/directory` → "Add Student", enrolled via `/enrollments` → Create.

**Test-scoped data:** any test that mutates a session (cancel/delete/complete/reactivate/edit/notes) first adds its **own extra session** via "Add Session" and only touches that column. Attendance toggles use the test's own session too, so tests sharing a worker group never collide.

> Plan decision for review: course/groups/students per **worker** rather than per test. Building the whole chain through the UI for every test would take minutes per test; per-worker keeps isolation (no worker touches another's data) while mutable state stays per test.

**Teardown** (worker fixture teardown, UI, admin):
1. Each student: Delete → soft-deleted → "Delete Permanently" (removes enrollments, attendance, payments).
2. Extra sessions without attendance: "Delete session".
3. Groups: `/groups/:id` → "Archive Group".
4. Course: "Delete" (archive). If the backend refuses because of groups, untick "Active Course".

**Sweep** (`npm run e2e:sweep`, also run at the start of global setup): finds students and courses named `e2e-` from earlier runs and applies the same teardown. Residue accepted until #218: archived groups/courses, orphan receipts.

## 5. Accessible handles (source changes)

Prefer real accessible names; `data-testid` only where no user-facing name makes sense.

| Where | Change |
|---|---|
| `AttendanceCell.tsx:40` | aria-label → "Attendance for {student} on {date}: {status}" (needs student + date props) |
| `AttendanceMobileSheet.tsx:227,315` | session buttons and status buttons named with date / student |
| `AttendanceFooter.tsx:176` | retry button aria-label "Retry session {date}" |
| `SessionActionsRow.tsx` | include session date in each button's aria-label ("Cancel session {date}") |
| `SearchablePillSelector.tsx:101,144` | connect label (`aria-labelledby`), options as `role="option"`, clear button aria-label |
| `AddSessionDialog.tsx:215-290` / `EditSessionModal.tsx` | time grids grouped (`role="group"` + label "Start time" / "End time") |
| `EnrollPanel.tsx:224-250` | connect "Course Fee" / "Discount" labels |

New aria-label strings go into **both** `en` and `ar` locale files (AGENTS.md §2). Existing unit tests touching these components must stay green.

## 6. Dashboard scenarios (`e2e/specs/dashboard/`)

Admin + system_admin, desktop unless noted:

| Spec | Scenarios |
|---|---|
| `day-and-filter.spec.ts` | today's tab selected by default; worker groups visible; switching day hides them and resets the instructor filter; filter "instructor A" shows group A not B, "All" shows both |
| `quick-actions.spec.ts` | session count ≥ worker's groups; Quick Register creates a student (then torn down); Create Payment → `/finance`; Quick Reports → `/reports` |
| `attendance.spec.ts` | toggle cycle not_taken → present → absent → not_taken; batch save then reload shows saved state; unsaved change discarded by Cancel |
| `attendance-retry.spec.ts` | one session's save fails (route intercepted to 500 for that session only) → "Failed to save" + retry → success |
| `notes.spec.ts` | type note, save, reload, note persists; dirty note survives the refetch |
| `session-actions.spec.ts` | on own extra session: edit date/time; cancel → reactivate; complete; delete |
| `add-session.spec.ts` | add session for today with substitute instructor B → column appears with substitute badge; group stays under instructor A's filter |
| `states.spec.ts` | error state (daily-overview intercepted to 500); empty state for a day with no sessions (intercepted to an empty payload — staging always has other groups) |
| `mobile.spec.ts` (mobile project) | group card visible; Mark Attendance → pick session → set statuses → "Save Attendance (n)" → reopen shows saved; FAB actions navigate |

Instructor A / B (`instructor.spec.ts`), **`test.fail()`** linking #34 / techno-terminal#220:
- sees own group, not the other's; marks attendance on own session.
- `/finance`, `/reports`, `/directory` redirect back to `/dashboard` — this part passes today and is **not** marked fail.

> Plan decision for review: the error/empty/retry scenarios use `page.route` to fake one failure. Everything else hits staging for real. Without interception these states can't be produced reliably on shared staging.

## 7. Done when

- `npm run e2e` green on staging for both projects (instructor expected-fails reported as expected).
- Teardown leaves no live `e2e-` students or active groups; a deliberately killed run is cleaned by `e2e:sweep`.
- Prod guard proven: run with the prod host in `E2E_API_TARGET` → fails before any request.
- `npm run build`, `npm run lint`, `npm run test` still pass.

## 8. Risks and open points

- **Timezone:** "today" must be computed in Africa/Cairo (backend `next_weekday(today, …)`); a run near midnight on the test machine could pick the wrong tab.
- **Course delete** with groups may be refused — fallback in §4.
- **Staging drift:** staging deploys on every push to backend `staging`; a mid-run deploy can fail a run.
- **Toasts (#33):** tests assert outcomes (rows, navigation, persisted state), never toasts from the affected modules.
- **Owner action before running:** create the 4 staging accounts; link both instructor logins to employee records; fill `.env.e2e`.

## 9. Implementation notes (deviations from the plan above)

- **Sweep** works from a per-worker ledger (`e2e/.ledger/<tag>.json`) of created ids instead of searching lists for `e2e-` names; it runs as the `sweep` project before every run and via `npm run e2e:sweep`. Teardown is idempotent: ids are dropped from the ledger as they are cleaned.
- **Extra sessions are not deleted in teardown** (only the delete test removes its own). Once students are hard-deleted the grid no longer renders session actions, and archiving the group leaves its sessions anyway; they are part of the accepted residue.
- **Instructor names** come from `E2E_INSTRUCTOR_A_NAME` / `_B_NAME` (needed to pick them in the group form and filter tabs).
- **EnrollPanel labels** were not changed: M1 never edits fee/discount. The retry button already has a name (`Session <id>`).
- Extra accessible names beyond §5: each grid card is a `region` named `<group> attendance`; session notes textareas end with `(<date>)`.
