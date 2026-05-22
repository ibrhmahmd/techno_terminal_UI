---

description: "Task list for Auth Audit Fix feature implementation"

---

# Tasks: Auth Audit Fix

**Input**: Design documents from `specs/019-auth-audit/`
**Prerequisites**: plan.md (required), spec.md (required), research.md

**Tests**: Not requested in the feature specification. Manual verification per acceptance scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- All tasks modify existing files. No new file creation needed.
- Run `npm run build` and `npm run lint` after each phase.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no setup needed. All changes modify existing files.

**No tasks required.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No blocking prerequisites — all user stories are independent edits to existing files.

**No tasks required — user stories can proceed directly.**

---

## Phase 3: User Story 1 — Critical Bug & Runtime Fixes (Priority: P1) 🎯 MVP

**Goal**: Fix the RegisterPage token fabrication bug, replace `<a href>` with `<Link>` for client-side routing, guard `console.warn` behind DEV check, and fix `getCurrentUser` queryFn side effects.

**Independent Test**: Register with valid invite token → redirected to `/login` (no 401). Click "Back to Dashboard" on access denied page → no full page reload. Click "Notifications" on Settings → no full page reload.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Fix RegisterPage token fabrication in `src/pages/RegisterPage.tsx` — replace `login(user.id.toString(), '', user)` with redirect to `/login` after successful registration; keep success message with `navigate('/login')` instead of auto-login
- [ ] T002 [P] [US1] Replace `<a href>` with React Router `<Link>` in `src/components/common/RoleBasedRoute.tsx` — import `Link` from `react-router-dom`, replace `<a href="/dashboard">` with `<Link to="/dashboard">`
- [ ] T003 [P] [US1] Replace `<a href>` with React Router `<Link>` in `src/pages/SettingsPage.tsx` — import `Link` from `react-router-dom`, replace `<a href="/notifications">` with `<Link to="/notifications">`
- [ ] T004 [P] [US1] Guard `console.warn` in `src/store/authStore.ts` — wrap the `console.warn('Logout API call failed:', err)` with `if (import.meta.env.DEV) { ... }`
- [ ] T005 [US1] Fix `getCurrentUser` queryFn side effects in `src/api/auth/auth.ts` — move deactivation check (logout API call + `window.location.replace`) out of the queryFn into a response interceptor or component-level effect; let the query throw a clean error instead

**Checkpoint**: US1 complete — registration works without 401 errors, all internal navigation uses client-side routing, no side effects in queryFn.

---

## Phase 4: User Story 2 — Dead Code Removal (Priority: P2)

**Goal**: Remove unused exports: `AccessDenied`, `useMfaStatus`, `useUser`, `enrollMfa`, `AuditUserFilter`. Remove unnecessary `export` from local-only interfaces. Extract `EVENT_LABELS` to shared location.

**Independent Test**: Grep for removed exports across `src/` (excluding test files) — zero imports found. `EVENT_LABELS` exists in one shared location only.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Remove unused `AccessDenied` export from `src/components/common/RoleBasedRoute.tsx` — keep the function as private (remove `export` keyword) since it's only used internally
- [ ] T007 [P] [US2] Remove unused `useMfaStatus` and `useUser` hooks from `src/hooks/useAuthQueries.ts` — remove the hook functions and their associated query keys (`authKeys.mfa`, `authKeys.user(id)`)
- [ ] T008 [P] [US2] Remove unused `enrollMfa` function from `src/api/auth/auth.ts` — remove the function and its export from `src/api/auth/index.ts` re-exports
- [ ] T009 [P] [US2] Remove unused `AuditUserFilter` component and `AuditUserFilterProps` interface from `src/components/settings/AuditLogTable.tsx`
- [ ] T010 [P] [US2] Remove `export` keyword from local-only interfaces in `src/api/auth/auth.ts` — `LoginResponse` and `RefreshRequest` are only used within the file
- [ ] T011 [P] [US2] Remove `export` keyword from `InviteResponse` in `src/api/auth/admin.ts` — only used within the file
- [ ] T012 [US2] Extract shared `EVENT_LABELS` constant — create `src/constants/auditLabels.ts` with the constant; import in both `src/components/settings/ActivityTab.tsx` and `AuditLogTable.tsx`; remove the inline definitions

**Checkpoint**: US2 complete — all dead exports removed, `EVENT_LABELS` deduplicated, build passes.

---

## Phase 5: User Story 3 — TypeScript & Code Quality (Priority: P2)

**Goal**: Replace unsafe `as` assertion with `isAxiosError` guard in LoginPage. Add runtime validation to `<select>` onChange casts. Change `export default client` to named export.

**Independent Test**: Login with invalid credentials → catch clause uses `isAxiosError` narrowing (no blind type assertion). Select dropdown values are validated before type cast.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Replace type assertion in `src/pages/LoginPage.tsx` — import `isAxiosError` from `axios`; replace `err as { response?: { status?: number; headers?: Record<string, string> } }` with `isAxiosError(err)` narrowing in the catch clause
- [ ] T014 [P] [US3] Add runtime validation for `<select>` onChange in `src/components/settings/UsersTab.tsx` — for the role edit dropdown (line ~202), validate value against `['instructor', 'admin', 'system_admin']` before setting state; same for the create-user role dropdown (line ~437)
- [ ] T015 [US3] Change `export default client` to named export in `src/api/client.ts` — change to `export const client = createApiClient()`; update all imports across the codebase from `import client` to `import { client }`

**Checkpoint**: US3 complete — all type assertions replaced with proper narrowing, select values validated, named export in client.ts.

---

## Phase 6: User Story 4 — React Query & Cache Patterns (Priority: P3)

**Goal**: Migrate manual API calls to React Query mutations. Move auth keys to centralized `queryKeys.ts`. Broaden cache invalidation. Remove redundant `useEffect` sync.

**Independent Test**: Admin creates user → user list updates immediately without manual refresh. Admin updates user role → list and detail caches invalidated.

### Implementation for User Story 4

- [ ] T016 [P] [US4] Migrate `createUser` manual call in `src/components/settings/UsersTab.tsx` — add `useCreateUser` mutation to `src/hooks/useAuthQueries.ts` with `onSuccess` invalidation of `authKeys.users`; replace `useState` loading + manual `createUser()` call with the mutation in UsersTab
- [ ] T017 [P] [US4] Migrate `resetPassword` manual call in `src/components/settings/UsersTab.tsx` — add `useResetPassword` mutation to `src/hooks/useAuthQueries.ts`; replace `useState` loading + manual `resetPassword()` call with the mutation in UsersTab
- [ ] T018 [US4] Move auth query keys from local `authKeys` factory in `src/hooks/useAuthQueries.ts` to centralized `src/hooks/queryKeys.ts` — add `queryKeys.auth.*` sub-keys; update all references in `useAuthQueries.ts` to use `queryKeys.auth.*`
- [ ] T019 [P] [US4] Broaden invalidation in `useUpdateUser` at `src/hooks/useAuthQueries.ts` — add invalidation of `authKeys.user(id)` and `authKeys.all` on success
- [ ] T020 [P] [US4] Broaden invalidation in `useDeactivateUser` at `src/hooks/useAuthQueries.ts` — add invalidation of `authKeys.all` on success
- [ ] T021 [US4] Remove redundant `useEffect` sync from `src/components/settings/ProfileTab.tsx` — remove the `useEffect` that syncs `useCurrentUser()` data to Zustand store (the store is already updated by `useUpdateProfile.onSuccess` and initial login)

**Checkpoint**: US4 complete — all API calls use React Query mutations with proper cache invalidation, auth keys in centralized factory, no redundant store sync.

---

## Phase 7: User Story 5 — Accessibility & UX Polish (Priority: P3)

**Goal**: Add `aria-hidden="true"` to all Material Symbol icons. Add `aria-label` to inputs/selects. Add ARIA dialog/focus-trap to modals. Add ARIA tab semantics to Settings tabs. Replace raw error messages with user-friendly text. Replace generic "Loading..." with LoadingSpinner.

**Independent Test**: Screen reader detects correct tab roles (`tablist`/`tab`/`tabpanel`) on Settings page. Screen reader detects `dialog`/`modal` role on all modals. Focus is trapped inside modals (Tab/Shift+Tab cycle, Escape closes). Error messages are generic (no server text leaked).

### Implementation for User Story 5

- [ ] T022 [P] [US5] Add `aria-hidden="true"` to all Material Symbol icons across all auth files — check `src/components/common/RoleBasedRoute.tsx`, `src/components/settings/ProfileTab.tsx`, `src/components/settings/SessionsTab.tsx`, `src/components/settings/UsersTab.tsx`, `src/components/settings/AuditLogTable.tsx`, `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/ForgotPasswordPage.tsx`, `src/pages/SettingsPage.tsx`; add `aria-hidden="true"` to every `<span className="material-symbols-outlined">`
- [ ] T023 [P] [US5] Replace generic "Loading..." text with `LoadingSpinner` component in `src/components/settings/ProfileTab.tsx` (line ~39) and `src/components/settings/AuditLogTable.tsx` (line ~30)
- [ ] T024 [P] [US5] Add `aria-label` to form inputs and filter selects in `src/components/settings/UsersTab.tsx` — search input (`aria-label="Search by username"`), role filter select (`aria-label="Filter by role"`), status filter select (`aria-label="Filter by status"`)
- [ ] T025 [US5] Add ARIA dialog roles and focus trapping to all modals in `src/components/settings/SessionsTab.tsx` and `src/components/settings/UsersTab.tsx` — add `role="dialog"`, `aria-modal="true"`, `aria-label` to overlay divs; implement focus trapping: on mount, focus first focusable element; on Tab/Shift+Tab, cycle through focusable elements; on Escape, close modal; on unmount, return focus to trigger button
- [ ] T026 [P] [US5] Add ARIA tab semantics to Settings page in `src/pages/SettingsPage.tsx` — add `role="tablist"` and `aria-orientation="horizontal"` to the tab container; add `role="tab"` and `aria-selected={activeTab === tab.id}` to each tab button; add `role="tabpanel"` and `aria-labelledby={"tab-"+activeTab}` to the content section; add unique `id={"tab-"+tab.id}` to each tab button
- [ ] T027 [P] [US5] Replace raw error messages with user-friendly text in `src/components/settings/ProfileTab.tsx` (line ~80), `src/components/settings/UsersTab.tsx` (lines ~167, ~283, ~301), `src/pages/RegisterPage.tsx` (line ~62) — replace `err instanceof Error ? err.message : ...` patterns with static friendly messages like "Failed to update profile. Please try again."

**Checkpoint**: US5 complete — all icons have `aria-hidden`, inputs have labels, modals have dialog ARIA + focus trapping, tabs have ARIA roles, error messages are user-friendly.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification — lint, build, and validation sweeps.

- [ ] T028 Run `npm run lint` and fix all errors in modified files
- [ ] T029 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T030 Run verification grep commands — check no remaining `: any` in modified files, no `console.warn` without DEV guard in auth files, no `export default` in client.ts, no `useEffect.*get` pattern in auth hooks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — no tasks
- **Foundational (Phase 2)**: No dependencies — no tasks
- **User Story 1 (Phase 3)**: No dependencies — can start immediately (critical P1)
- **User Story 2 (Phase 4)**: No dependencies — can run after or in parallel with US1
- **User Story 3 (Phase 5)**: No dependencies — can run after or in parallel with US1
- **User Story 4 (Phase 6)**: Should run before US5 (both modify UsersTab.tsx, ProfileTab.tsx) — US4 migrates API calls first, US5 adds a11y on top
- **User Story 5 (Phase 7)**: Should run after US4 (to avoid conflicts on UsersTab.tsx) and after US2 (AuditUserFilter removal avoids conflict on AuditLogTable)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — first priority, block only
- **US2 (P2)**: No dependencies — independent deletions
- **US3 (P2)**: No dependencies — independent type fixes
- **US4 (P3)**: Should be sequenced before US5 (same files)
- **US5 (P3)**: Should be sequenced after US4 and US2 (same files)

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Non-[P] tasks must run sequentially (same file or sequential logic)

### Parallel Opportunities

- US1, US2, and US3 can all run in parallel (different files)
- Within each story, all [P] tasks can run in parallel
- US4 and US5 should be sequential (US4 → US5) to avoid file conflicts

---

## Parallel Example: User Story 1

```bash
# Launch all [P] tasks for US1 together:
Task: "Fix RegisterPage token fabrication in src/pages/RegisterPage.tsx"
Task: "Replace <a href> with <Link> in RoleBasedRoute.tsx"
Task: "Replace <a href> with <Link> in SettingsPage.tsx"
Task: "Guard console.warn in authStore.ts"

# Then run the non-[P] sequential task:
Task: "Fix getCurrentUser queryFn side effects in auth.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (T001–T005) → critical bug fixed, routing fixed
2. **STOP and VALIDATE**: Verify registration works, navigation is client-side
3. Deploy/demo if ready

### Incremental Delivery

1. US1 (Critical Bug Fixes) → immediate deploy
2. US2 (Dead Code) + US3 (TypeScript) → can be done in parallel
3. US4 (React Query) → then US5 (Accessibility) on top
4. Phase 8 (Polish) → final build verification

### Parallel Team Strategy

With multiple developers:
- Developer A: US1 (Critical P1) + US4 (React Query)
- Developer B: US2 (Dead Code) + US3 (TypeScript)
- Developer C: US5 (Accessibility)
- All merge after Phase 8 verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new files needed — all changes are edits to existing files
- US4 and US5 both modify `UsersTab.tsx` — sequence US4 → US5 to avoid merge conflicts
- US5 adds `aria-hidden` to many files — this is safe to batch across all files in one task
- After each phase: run `npm run lint && npm run build` to catch TS errors early
