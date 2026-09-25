# Techno Terminal UI — Agent Instructions

## 1. Commands
```bash
npm run dev                    # Vite dev (proxy /api → remote fastapicloud backend; localhost:8000 target is commented out in vite.config.ts)
npm run build                  # tsc -b && vite build — must pass before commits
npm run lint                   # ESLint (flat config at eslint.config.js)
npm run test                   # Vitest
npm run test -- src/tests/Foo.test.tsx  # single file
```
No formatter configured — lint only.

**Build caveat**: `tsc -b` uses `tsconfig.app.json` which **excludes** `src/tests/` and `*.test.*` — test files not typechecked during build.

---

## 2. Arabic Localization & RTL

### Content voice
- **`ar` translations are Egyptian colloquial Arabic (masri), NOT Modern Standard Arabic** (`"مفيش"`, `"جرّب تاني"`, `"اتنهى"`, `"مش نشط"`). Write casual Egyptian dialect; formal Fusha will look wrong next to the existing strings.
- `ar` files contain known defects — untranslated leftovers (`comingSoon.title` = `"soon"`), duplicated text (`auth.loginSuccess`), stray CJK chars (`combobox.no_results_student`), mixed-language (`certificates.info_row_revoked_at` = `"ات revoke يوم"`). Read the existing value before editing. Only 7/25 pages are audited — see `docs/i18n-audit-tracker.md`.

### Wiring
- `src/i18n/index.ts` **statically imports** all 14 namespaces × en/ar — no lazy loading. A new namespace requires editing that file's imports + `resources` + `ns` arrays.
- New keys must be added to BOTH `src/locales/en/<ns>.json` and `src/locales/ar/<ns>.json`; missing keys render as the raw key string (no missing-key handler).
- `defaultNS` is `common` — `useTranslation()` without arguments reads `common`; otherwise `useTranslation('<ns>')` must match the resource name.
- **No i18next pluralization in use**: no `_one`/`_other`/`_few` suffix keys anywhere (Arabic has real plural rules, but this codebase doesn't use them). `{{count}}` without a suffix key never pluralizes — follow the existing "second(s)" style or rephrase.
- Interpolation vars must match `en` EXACTLY in `ar` (`{{seconds}}`, `{{error}}`, `<strong>{{name}}</strong>` rendered via `<Trans>`). Placeholder drift is a common breakage.
- Key style: snake_case preferred (some legacy camelCase in `common.json`, e.g. `networkError`).

### Locale machinery
- `settingsStore` (persist key `settings-storage`) is the single source of truth for `locale`/`direction`. `setLocale()` calls `i18n.changeLanguage`, sets `document.documentElement.dir`/`lang`, and cross-tab syncs via a module-level `storage` listener.
- i18next also runs `LanguageDetector` (`order: ['localStorage', 'navigator']`) **independently** of the store, which defaults to `en`/`ltr`. On first load these can disagree (Arabic-browser navigator → i18n says `ar` while direction stays `ltr`). Read direction from the store, not `i18n.language`.

### RTL styling
- Use Tailwind logical utilities for RTL-safe layout: `ms-*`/`me-*`, `ps-*`/`pe-*`, `start-*`/`end-*`, `text-start`/`text-end`.
- Directional icons (arrows/chevrons, Material Symbols) need the `icon-flip-rtl` class (defined in `src/index.css` → `scaleX(-1)`). There is **no auto-flip** — the `html[dir="rtl"]` icon rule in `index.css` is an empty placeholder.
- **Arabic fonts** (`tailwind.config.js` `fontFamily`): Arabic glyphs come from the second entry in each stack — `font-body` is `Inter` → **`Noto Sans Arabic`**, `font-headline` is `Space Grotesk` → **`Noto Kufi Arabic`** (geometric Kufi keeps the "Precision Engine" aesthetic from `docs/design/DESIGN.md`). A new font stack needs an Arabic-capable fallback, otherwise Arabic text in it renders in the browser default serif.
- `formatTime`/`formatDate` in `src/utils/formatting.ts` hardcode `'en-US'` — dates/times do NOT localize under AR. Numbers stay in Latin digits (`1,2,3`), not Arabic-Indic.

### Audit tooling
- `docs/i18n-audit-tracker.md` tracks page-by-page progress (7/25 done). Prior specs (in `specs/archive/`): `070-arabic-i18n-rtl`, `071-i18n-complete-translations`, `072-dashboard-i18n-audit`.
- `.agents/skills/i18n-page-audit/SKILL.md` documents the canonical audit workflow (hardcoded strings, missing keys, interpolation, logical-vs-physical classes, icon flips). Its scanner lives inside the skill, not at repo-root `scripts/`: run `node .agents/skills/i18n-page-audit/scripts/audit-page.mjs --page src/pages/<Page>.tsx`.

---

## 3. TS & Toolchain Quirks
- `verbatimModuleSyntax` → must `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, namespaces, parameter properties; use const objects or union types
- `noUncheckedSideEffectImports: true` in both tsconfigs
- **Tailwind**: v3 config (`tailwind.config.js`, `postcss.config.js` uses the `tailwindcss` v3 plugin) — don't use v4 syntax
- **Fonts**: Space Grotesk + Noto Kufi Arabic (`font-headline`) headings, Inter + Noto Sans Arabic (`font-body`) body — Google Fonts loaded in `index.html`. Adding a font family requires editing BOTH `tailwind.config.js` `fontFamily` AND the Google Fonts `<link>` in `index.html`. See §2 Arabic fonts.
- **Border radius**: Non-standard values in `tailwind.config.js` — `rounded` = `0.125rem`, `rounded-full` = `0.75rem` (not `9999px`). Don't use Tailwind defaults mentally.
- **Icons**: Lucide React components + Google Material Symbols (CSS class `material-symbols-outlined`)
- **Time formatting**: Use `formatTime` from `src/utils/formatting.ts` (12h), not inline formatting
- **Charts**: recharts in `src/components/reports/` for `StudentProgressChart` and `RevenueChart`
- **`@vercel/speed-insights`**: wired in `src/App.tsx`

---

## 4. Architecture

### Entrypoint & Routing
- `src/lib/queryClient.ts` → `src/main.tsx` (StrictMode + QueryClientProvider) → `src/App.tsx`
- `src/App.tsx`: BrowserRouter, 25 lazy-loaded pages (named exports from `src/pages/`), Suspense + ErrorBoundary
- Route guards: `ProtectedRoute` (auth), `PublicRoute` (unauthenticated + branded skeleton during hydration), `InstructorBlockedRoute` (blocks instructor role), `RoleBasedRoute allowedRoles` (admin-only)
- Wildcard (`*`) → `/login` (not dashboard) to avoid redirect loops
- `/attendance` is a placeholder `<div>` route — real attendance UI lives on dashboard/group detail

### Two Backends
- **Main API**: everything under `src/api/*` except certificates → shared Axios `client` (`/api/v1`), Bearer injection, 401 refresh queue.
- **Certificates API**: separate backend (`techno-future-certs.fastapicloud.dev`) via its own `certsClient` in `src/api/certificates/certificates.ts`. DEV: `/certs-api/api/v1` (Vite proxy strips prefix); PROD: direct URL constant in that file. **No auth interceptor** — no Bearer injection, no refresh queue.

### API & State
- `src/api/client.ts`: Axios, base `/api/v1`, Bearer token injection, 401 refresh queue with request queuing → logout on failure. Dynamic import of `./auth` in interceptor to break circular dependency.
- 15 API domain modules under `src/api/` (academics, analytics, attendance, auth, certificates, competitions, crm, dashboard, enrollments, finance, hr, notifications, reports, tasks, teams) + `client.ts`
- `src/hooks/queryKeys.ts`: centralized React Query key factories — use these, never inline arrays
- `src/store/authStore.ts`: Zustand, persist key `auth-storage`, cross-tab sync via `storage` event
- React Query defaults: `staleTime: 5min`, `gcTime: 30min`, `retry: 1`, `refetchOnWindowFocus: false`; mutations `retry: 0`
- API envelopes: `ApiResponse<T>` / `PaginatedApiResponse<T>` in `src/types/api.ts`

### Route Protection
- `ProtectedRoute` — unauthenticated → `/login`. Waits for Zustand persist rehydration.
- `PublicRoute` — authenticated → `/dashboard`. Shows branded skeleton during hydration.
- `InstructorBlockedRoute` — instructors → `/dashboard`. Blocks `/directory`, `/enrollments`, `/finance`, `/reports`, `/staff`, `/tasks`, `/settings`.
- `RoleBasedRoute allowedRoles={['admin','system_admin']}` — non-admins → `/dashboard`. Used for `/notifications`.

---

## 5. Mobile Layout

**Breakpoint**: `lg` = 1024px. `useIsMobile` hook matches `(max-width: 1023px)`.

- **Sidebar**: `hidden lg:flex`, fixed left `w-64`. Hidden on mobile.
- **`<main>`**: `lg:ml-64`, `pb-16 lg:pb-0` (BottomNav clearance auto-in `AppLayout`). Pages outside `AppLayout` must add their own `pb-16`.
- **BottomNav**: `lg:hidden`, fixed bottom, `z-50`. 4 primary tabs + "More" → `MobileNavSheet`.
- **Top bar**: `MobileTopBar` (sticky `top-0 z-30 lg:hidden`) on some pages; `TopNavbar` (desktop only) in `src/components/dashboard/`.
- **Bottom sheets**: feature sheets (`AttendanceMobileSheet`, `CreateTaskModal`) use `z-[60]` (above BottomNav `z-50`) with backdrop `fixed inset-0 bg-black/60 z-[60]`; dismiss on backdrop click / Escape / close button. `MobileNavSheet` is its own exception — backdrop + panel at `z-50`. It auto-closes on `location.pathname` change via `useEffect`.

---

## 6. Testing (Vitest)
- Environment: `happy-dom`. Setup: `src/test/setup.ts` (`@testing-library/jest-dom`)
- Globals enabled: `describe`, `it`, `expect`, `vi` — no import needed
- Convention: `src/tests/*.{test,spec}.{ts,tsx}` (vitest config: `src/**/*.{test,spec}.{ts,tsx}`)

---

## 7. Common Pitfalls

- **Query `enabled` guard blocking initial load**: Setting `enabled: term.length >= 2` on a hook that serves both listing and search prevents unfiltered load. Use `enabled: term.length === 0 || term.length >= 2` for dual-purpose hooks (see `useEmployees` in `useStaff.ts`). Purely search hooks (`useStudentsSearch`, `useParentsSearch`) are safe because a separate list query handles initial load.
- **Two parallel employee cache families**: staff page uses `staffKeys` (`['staff', 'employees', ...]`) defined in `useStaff.ts`; group dialogs (`AddSessionDialog`, `EditGroupLevelDialog`, `useProgressLevelForm`) and `useEmployees.ts` use `queryKeys.employees.*` (`['employees', ...]`). Invalidating one does NOT refresh the other — invalidate both after employee mutations that affect both surfaces.
- **Bottom sheet z-index**: sheets need `z-[60]` (above BottomNav `z-50`); backdrop must use same layer.
- **Route-sheet double-close**: `MobileNavSheet` watches `location.pathname` and auto-closes on navigation — don't add redundant `onClose` calls.
- **API debug**: `localStorage.setItem('api_debug', 'true')` logs all requests; auto-enabled in DEV.

---

## 8. Deploy & Config
- **Vercel**: `vercel.json` rewrites `/api/*` → FastAPI backend, all other routes → `/index.html`. Certificates API is NOT rewritten — prod `certsClient` hits its URL directly.
- **No `.env` files** (gitignored), no CI (`.github/`), no pre-commit hooks
- **No `opencode.json`** — this file (`AGENTS.md`) is the primary instruction source
- **Docs**: `docs/api/README.md` (endpoint reference by page), `docs/api/certificates-api.md` (certificates backend), `ARCHITECTURE.md`, `docs/design/DESIGN.md`. Superseded plans/reports live in `docs/archive/`.
- **Specs**: `specs/<NNN>-<name>/plan.md` for the active feature plan; completed specs move to `specs/archive/` (ESLint ignores `specs/`)
- **Gitignored**: `.opencode/*`, `.specify/*`
- **Audit artifact**: `docs/audit-findings.json`

---

## 9. Attendance Grid Implementation

### Component Architecture
The attendance grid is a complex feature spanning multiple components:

```
src/components/attendance/
├── AttendanceGrid.tsx          # Main container (desktop) — orchestrates all state
├── AttendanceHeader.tsx        # Session column headers (date, time, instructor, session number)
├── AttendanceTableBody.tsx     # Student rows × session columns grid
├── AttendanceCell.tsx          # Single cell — click cycles: not_taken → present → absent → not_taken
├── AttendanceFooter.tsx        # Save/Cancel bar with per-session retry buttons
├── AttendanceMobileSheet.tsx   # Mobile bottom sheet (session picker → student list)
├── SessionActionsRow.tsx       # Edit/Cancel/Delete/Reactivate/Complete buttons per session
├── SessionNotesRow.tsx         # Textarea row for per-session notes
├── EditSessionModal.tsx        # Edit session (date, time, instructor, status)
├── StudentInfo.tsx             # Student name + billing badge (PAID/DUE)
└── PaymentSummaryStrip.tsx     # Paid/Due counts + remaining balance

src/hooks/useGroupAttendance.ts          # React Query hook → getAttendanceForLevel
src/utils/attendanceStatus.ts            # ATTENDANCE_STATUSES + getNextStatus()
src/utils/attendanceInvalidation.ts      # invalidateSessionCaches()
src/utils/attendanceTransforms.ts        # New API DTOs → dashboard DTOs
src/api/attendance/attendance.ts         # markAttendance() — POST /attendance/session/{id}/mark
src/components/groups/detail/AddSessionDialog.tsx # Shared add-session dialog
```

### Data Flow — Two Sources
1. **Dashboard view**: `useDashboard` provides `ScheduledGroupDTO` attendance data with `roster`, `sessions`, and embedded `attendance[]` per session. Used on the main dashboard page.
2. **Group-specific view**: `useGroupAttendance` calls `GET /academics/groups/{id}/attendance?level_number=N`. Returns `AttendanceLevelResponse` with `roster` and `sessions` (attendance as a `Record<studentId, status>` map, not an array).

`attendanceTransforms.ts` bridges the two through `transformRoster()`, `transformSessions()`, and `mapStatus()`.

### Key Type: `SessionWithAttendanceDTO`
Defined in `src/api/dashboard/types/models.ts`. Aliases support backward compatibility (`session_id`/`id`, `date`/`session_date`, `time_start`/`start_time`); attendance is `AttendanceRecordDTO[] | null`.

### Status Toggle Cycle
```
not_taken → present → absent → not_taken
```
Defined once by `getNextStatus` in `src/utils/attendanceStatus.ts`; unknown values fall back to `not_taken`. `AttendanceGrid` and `AttendanceMobileSheet` both use it.

### Save Model — Batch, Not Auto-Save
- Student rows derive via `useMemo` from `roster` + `sessions` props + `localOverrides`; there is no mirrored fetch state, and `refetchData()` only clears overrides.
- Toggles update `localOverrides` optimistically and queue `pendingChanges`; no API call occurs until save.
- `AttendanceFooter`'s "Save Changes" button calls `handleSaveAll`, which saves attendance per session in parallel via `markAttendance()`.
- Notes save separately via `updateSession(sessionId, { notes })`; an empty string becomes `null`.
- `sessionSaveStatus` tracks per-session save/retry state; failed attendance sessions show footer retry buttons.
- After save, `handleSaveAll` goes through `invalidateSessionCaches` before `refetchData()`.
- "Add Session" opens the shared `AddSessionDialog`; `AttendanceGrid` wires its `onSuccess` to the same invalidation path.

### Cache Invalidation Pattern
Use this pattern for every session/attendance mutation:
```ts
await invalidateSessionCaches(qc, { groupId, level, selectedDate })
await refetchData()
```
`invalidateSessionCaches` always invalidates `queryKeys.groupLevels(groupId)`, adds `queryKeys.groupAttendance(groupId, level)` when `level != null`, and adds `queryKeys.dashboard.overview(selectedDate)` when `selectedDate` is set. It backs cancel/delete/reactivate/complete/edit-save, `handleSaveAll`, `handleRetrySession`, and mobile save (with `level: selectedSession.level_number ?? -1`); `AttendanceGrid` also wires `AddSessionDialog.onSuccess` to it. `onClose` only closes the dialog, so cancelling invalidates nothing. Never inline attendance query keys.

### Mobile Attendance (`AttendanceMobileSheet`)
- Two-step flow: session picker → student list
- Uses a `z-[60]` bottom sheet (same pattern as other sheets)
- Saves immediately on "Save" (not batch)
- Auto-resets state on open/close via `useEffect`

### Query Key
```ts
queryKeys.groupAttendance(groupId, levelNumber) // ['groups', id, 'attendance', levelNumber]
```
`useGroupAttendance` uses `staleTime: 60s`, `gcTime: 5min` (shorter than defaults — attendance changes frequently).

### Gotchas
- **Hardcoded gender**: `transformRoster` always sets `gender: "male"`; the new API does not return gender.
- **`markAttendance` filtering**: entries with `status: 'not_taken'` are omitted from the payload. It also re-parses `student_id` via `parseInt`; string IDs must be numeric.
- **Missing attendance**: missing, `null`, or `cancelled` attendance renders as `not_taken` everywhere — `AttendanceGrid` row building and toggle baseline, `AttendanceTableBody` (`?? 'not_taken'`), and `AttendanceMobileSheet` initial map + lookup (`?? 'not_taken'`). Keep them in sync.
- **Status/billing collapse**: `mapStatus` collapses `excused`/`late` → `present`; `transformRoster` coerces `billing_status: "partial"` → `"due"`.
- **Table min-width**: `AttendanceGrid` uses `Math.max(700, 200 + sessions.length * 160)`.
- **Session notes preserve dirty state**: `AttendanceGrid` initializes notes from `sessions` only when `dirtyNotes.size === 0`; `handleSaveAll` clears them only after invalidation + refetch resolve, or the textarea can revert to stale server data.
- **Grid reads props, not its own fetch**: student rows derive via `useMemo`; `refetchData()` only clears `localOverrides`. Fresh attendance comes through `invalidateSessionCaches`.
- **i18n**: attendance components use `useTranslation('attendance')`; add new keys to BOTH `src/locales/en/attendance.json` and `src/locales/ar/attendance.json`. Namespaces are static-imported in `src/i18n/index.ts` (no lazy loading).
- **Consumers**: the grid renders from `GroupSessionCard` in `src/components/dashboard/GroupSessionCard.tsx` and `LevelAttendancePanel` in `src/components/groups/LevelsTab.tsx` (which feeds `transformRoster`/`transformSessions`). Shared render changes affect both surfaces.

### Tests
Attendance regression tests live in `src/tests/attendance/`:
- `attendanceInvalidation.test.ts` — invalidation helper
- `AttendanceGridInvalidation.test.tsx` — every grid action × group-detail/dashboard contexts
- `AddSessionRefresh.test.tsx` — add-session success/cancel refresh contract
- `attendanceStatus.test.ts` — shared toggle cycle
- `missingAttendance.test.tsx` — missing-status behavior across surfaces

Changes to grid refresh or missing-status behavior must keep these tests green.

<!-- SPECKIT START -->
Active plan: none (spec 074 closed; see specs/archive/074-attendance-cache-refresh-audit/)
<!-- SPECKIT END -->