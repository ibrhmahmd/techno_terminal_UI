# Tasks: Attendance Grid Audit Fix

**Input**: Design documents from `/specs/058-attendance-grid-audit-fix/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not requested — spec explicitly states test file creation is out of scope.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Types: `src/types/`
  - Utils: `src/utils/`
- Path examples assume this pattern; adjust domain folder as needed.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add centralized query key factory entries and create the `useEmployees` hook that multiple stories depend on.

- [ ] T001 [P] Add `employees` key factory to `src/hooks/queryKeys.ts` — `employees: { list: () => ['employees', 'list'] as const }`
- [ ] T002 [P] Create `useEmployees` hook in `src/hooks/useEmployees.ts` using React Query and `queryKeys.employees.list()`, replacing the inline `getEmployees` call pattern
- [ ] T003 [P] Move `getAttendanceForLevel` from `src/api/academics/academics.ts` to `src/api/attendance/attendance.ts`; update the import in `src/hooks/useGroupAttendance.ts` to use `api/attendance/`

**Checkpoint**: Foundation ready — `queryKeys` extended, `useEmployees` hook available, `getAttendanceForLevel` in correct domain.

---

## Phase 2: Foundational — Critical Bug Fixes (FR-1, FR-2) 🎯 BLOCKS ALL STORIES

**Purpose**: Fix stale closures and missing cache invalidation. ALL user story work depends on correct save/retry behavior.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Implementation

- [ ] T004 [US1] Fix stale closure in `handleSaveAll` at `src/components/attendance/AttendanceGrid.tsx:400` — compute `hasChanges` from the results array (count failed saves) instead of reading stale `dirtyNotes.size` / `pendingChanges.size` from the closure
- [ ] T005 [US1] Fix stale closure in `handleRetrySession` at `src/components/attendance/AttendanceGrid.tsx:453` — use functional updater `setPendingChanges(prev => { const next = new Map(prev); next.delete(sessionId); return next; })` then compute `hasChanges` from new state via `useEffect` watching `pendingChanges`
- [ ] T006 [US3] Add cache invalidation to `handleRetrySession` at `src/components/attendance/AttendanceGrid.tsx:430` — after successful retry, call `qc.invalidateQueries` for both `queryKeys.dashboard.overview(selectedDate)` and `queryKeys.groupAttendance(groupId, levelNumber)` using `Promise.all`
- [ ] T007 [US2] Add missing `groupAttendance` cache invalidation to mobile save at `src/components/attendance/AttendanceMobileSheet.tsx:100` — invalidate `queryKeys.groupAttendance(groupId, levelNumber)` alongside existing `dashboard.overview` invalidation, parallelized with `Promise.all`

**Checkpoint**: Save/retry behavior is correct. Footer hides after successful save. Caches update across both desktop and mobile views.

---

## Phase 3: User Story 1 — Mark Attendance on Desktop (FR-6, FR-7, FR-8, FR-11, FR-12)

**Goal**: Instructor marks attendance on the desktop grid — cells toggle correctly, performance is smooth (300+ cells), no stale closures, no dead code, no type errors.

**Independent Test**: Open a group's attendance tab, toggle cells, add notes, save → footer hides. React DevTools shows only toggled cell re-renders. `npm run build` passes.

### Implementation

- [ ] T008 [P] [US1] Wrap `AttendanceCell` in `React.memo` at `src/components/attendance/AttendanceCell.tsx:28` — prevents re-render when sibling cells' props unchanged
- [ ] T009 [P] [US1] Wrap `StudentInfo` in `React.memo` at `src/components/attendance/StudentInfo.tsx:29` — prevents re-render on grid state changes
- [ ] T010 [US1] Refactor `handleToggle` in `src/components/attendance/AttendanceGrid.tsx:264` to use functional state updates `setStudents(prev => prev.map(...))` — removes `[students]` dependency, stabilizes callback identity
- [ ] T011 [US1] Update `AttendanceCellProps` in `src/components/attendance/AttendanceCell.tsx` — add `studentId: number`, `sessionId: number`, `disabled?: boolean` props; change `onToggle` signature from `() => void` to `(studentId: number, sessionId: number) => void`
- [ ] T012 [US1] Update `AttendanceTableBody` at `src/components/attendance/AttendanceTableBody.tsx:54` — pass `studentId` and `sessionId` directly to `AttendanceCell` instead of wrapping in inline `onToggle` closure; eliminate 300+ arrow functions per render
- [ ] T013 [US1] Remove dead code from `src/components/attendance/AttendanceGrid.tsx` — remove unused `isLoading` prop from `AttendanceGridProps`, remove `attendanceTimeoutRef` and its cleanup `useEffect`, remove `fetchCycleRef` and all `console.debug` calls
- [ ] T014 [US1] Remove dead code from `src/components/attendance/AttendanceFooter.tsx` — remove unused `hasError` prop from `AttendanceFooterProps`, remove trivial `handleSaveClick`/`handleCancelClick` wrapper functions
- [ ] T015 [US1] Remove trivial `handleClick` wrapper from `src/components/attendance/AttendanceCell.tsx` — call `onToggle` directly
- [ ] T016 [US1] Fix TypeScript issues in `src/components/attendance/AttendanceGrid.tsx` — replace `as` type assertion on PillSelector onChange with runtime validation, add `dirtyNotes.size` to `useEffect` dependency array, replace `|| 0` with `?? 0` for instructor ID, remove redundant `|| []` fallback on `roster` prop
- [ ] T017 [US1] Replace `NEXT_STATE` string-keyed Record with typed Map at `src/components/attendance/AttendanceGrid.tsx:22`
- [ ] T018 [US1] Remove premature `hasChanges(true)` from `handleEditSession` in `src/components/attendance/AttendanceGrid.tsx` — only set on actual save via `handleSaveEditedSession`
- [ ] T019 [US1] Replace `useEffect` + `setSessionNotes` with `useMemo` for `sessionNotes` initialization in `src/components/attendance/AttendanceGrid.tsx`
- [ ] T020 [US1] Replace `refetchData` with `useMemo` that transforms props into `StudentRowData[]` in `src/components/attendance/AttendanceGrid.tsx`
- [ ] T021 [US1] Deduplicate `StudentRowData` interface — extract to `src/types/attendance.ts` or reuse existing `StudentRow` type in `src/components/attendance/AttendanceGrid.tsx`

**Checkpoint**: Desktop attendance grid is fully functional. Performance optimized (React.memo, stable callbacks). Dead code removed. TypeScript strict mode passes. Build succeeds.

---

## Phase 4: User Story 2 — Mark Attendance on Mobile (FR-3 partial, FR-4 partial, FR-5 partial, FR-10 partial)

**Goal**: Mobile attendance sheet is accessible — screen readers announce all controls, keyboard-only users can navigate, animations respect reduced motion, contrast meets WCAG AA.

**Independent Test**: Open mobile sheet → screen reader announces all buttons. Tab through controls → focus visible only on keyboard. Enable reduced motion → animations disabled. Save works and caches update (from Phase 2).

### Implementation

- [ ] T022 [US2] Add `aria-hidden="true"` to all decorative Material Symbols icons in `src/components/attendance/AttendanceMobileSheet.tsx` (~20+ instances across all attendance components)
- [ ] T023 [P] [US2] Add `aria-label="Back to sessions"` to back button at `src/components/attendance/AttendanceMobileSheet.tsx:136`
- [ ] T024 [P] [US2] Add `aria-label="Close attendance sheet"` to close button at `src/components/attendance/AttendanceMobileSheet.tsx:154`
- [ ] T025 [US2] Add Escape key handler to bottom sheet in `src/components/attendance/AttendanceMobileSheet.tsx` — `useEffect` with `keydown` listener for Escape key to dismiss sheet
- [ ] T026 [US2] Add focus trap to bottom sheet in `src/components/attendance/AttendanceMobileSheet.tsx` — Tab cycles within sheet when open, initial focus on sheet open via `requestAnimationFrame` + `focus()`
- [ ] T027 [US2] Initialize `localAttendance` in session selection handler instead of separate `useEffect` in `src/components/attendance/AttendanceMobileSheet.tsx`
- [ ] T028 [US2] Add `aria-live="polite"` to loading/empty state containers across attendance components
- [ ] T029 [US2] Add `aria-label="Student attendance"` or `<caption>` to data table in `src/components/attendance/AttendanceGrid.tsx`; add `scope="col"` to header cells in `src/components/attendance/AttendanceHeader.tsx`
- [ ] T030 [US2] Add `htmlFor`/`id` pairs to all form inputs in `src/components/attendance/SessionNotesRow.tsx` and `src/components/attendance/EditSessionPopup.tsx` for programmatic label association
- [ ] T031 [US2] Add `motion-reduce:animate-none` to all `animate-*` utilities, `motion-reduce:transition-none` to all `transition-*` utilities, and `motion-reduce:blur-none` to cancelled session blur across all attendance components
- [ ] T032 [US2] Replace `focus:ring-*` with `focus-visible:ring-2 focus-visible:ring-secondary/50` in `src/components/attendance/AttendanceCell.tsx:36` and all form inputs across attendance components
- [ ] T033 [US2] Replace `text-outline-variant` with `text-on-surface-variant` for loading/empty state text across attendance components
- [ ] T034 [US2] Replace `text-slate-300` with `text-slate-400` on chevron icon for WCAG AA contrast in attendance components
- [ ] T035 [US2] Replace `bg-slate-900/60` backdrop with `bg-black/60` per convention in `src/components/attendance/AttendanceMobileSheet.tsx`
- [ ] T036 [US2] Replace `border-2 border-slate-400` table borders with `border-outline-variant/20` in `src/components/attendance/AttendanceGrid.tsx`

**Checkpoint**: Mobile sheet is fully accessible. All icons hidden from screen readers. Buttons labeled. Keyboard navigation works. Reduced motion respected. Contrast meets WCAG AA.

---

## Phase 5: User Story 3 — Retry Failed Saves (FR-2 partial, FR-3 partial)

**Goal**: Per-session retry buttons work correctly — caches invalidate across views, retry buttons are accessible, loading states announced to screen readers.

**Independent Test**: Simulate failed save → retry button appears → click retry → caches update on both dashboard and group detail. Screen reader announces retry status.

### Implementation

- [ ] T037 [US3] Add `aria-label` to retry buttons in `src/components/attendance/AttendanceFooter.tsx` — e.g., `aria-label="Retry save for session {date}"`
- [ ] T038 [US3] Add `aria-live="polite"` to per-session save status indicators in `src/components/attendance/AttendanceFooter.tsx` — announce saving/success/error to screen readers
- [ ] T039 [US3] Add `aria-hidden="true"` to decorative icons in `src/components/attendance/AttendanceFooter.tsx`
- [ ] T040 [US3] Add `aria-hidden="true"` to decorative icons and `aria-label` to action buttons in `src/components/attendance/SessionActionsRow.tsx`

**Checkpoint**: Retry flow is fully functional and accessible. All retry buttons labeled. Status changes announced to screen readers.

---

## Phase 6: User Story 4 — Session Management (FR-9, FR-11)

**Goal**: Edit session modal is architecturally clean — no cross-feature API imports, centralized query keys, extracted `TimeGridSelector` component, toggle switch has ARIA semantics.

**Independent Test**: Open edit session modal → edit and save → no cross-feature imports. Toggle switch announced as "switch" by screen reader. `TimeGridSelector` renders correctly. `npm run build` passes.

### Implementation

- [ ] T041 [US4] Replace inline `getEmployees` call in `src/components/attendance/EditSessionPopup.tsx:6` with the `useEmployees` hook created in Phase 1
- [ ] T042 [US4] Replace inline query key `['employees', 'list']` in `src/components/attendance/EditSessionPopup.tsx:30` with `queryKeys.employees.list()`
- [ ] T043 [US4] Extract `renderTimeGrid` as standalone `TimeGridSelector` component in new file `src/components/attendance/TimeGridSelector.tsx` — pass `value`, `onChange`, `label` as props; replace usage in `src/components/attendance/EditSessionPopup.tsx:123`
- [ ] T044 [US4] Add `role="switch"`, `aria-checked={isSubstitute}`, and `aria-label="Substitute Instructor"` to toggle button at `src/components/attendance/EditSessionPopup.tsx:310`
- [ ] T045 [US4] Remove dead code from `src/components/attendance/attendanceTransforms.ts` — remove `mapStatus` export (internal only), remove `AttendanceMobileSheetProps` export, remove redundant `as` cast on `Object.entries()`

**Checkpoint**: Edit session modal is clean. No cross-feature imports. Toggle accessible. `TimeGridSelector` extracted. Dead code removed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification across all user stories.

- [ ] T046 Replace raw Tailwind colors (`bg-blue-100`, `bg-teal-100`) with design system tokens in `src/components/attendance/PaymentSummaryStrip.tsx` and other attendance components where available
- [ ] T047 Run `npm run build` and verify zero errors — `tsc -b && vite build` must pass
- [ ] T048 Run `npm run lint` and verify zero warnings for attendance files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T003 for query key and API changes) — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational (Phase 2) — no dependencies on other stories
- **US2 (Phase 4)**: Depends on Foundational (Phase 2) — may share some icon a11y work with US1 but is independently testable
- **US3 (Phase 5)**: Depends on Foundational (Phase 2) — retry cache invalidation was fixed in Phase 2 (T006-T007)
- **US4 (Phase 6)**: Depends on Setup (T001-T002 for `useEmployees` hook and `queryKeys.employees`)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Desktop)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (Mobile)**: Can start after Phase 2 — may share a11y patterns with US1 but independently testable
- **US3 (Retry)**: Can start after Phase 2 — retry fixes are small and isolated
- **US4 (Session Mgmt)**: Can start after Phase 1 — depends on `useEmployees` hook (T002) and `queryKeys` (T001)

### Within Each User Story

- Bug fixes before performance work (stale closures must be fixed before memoization makes sense)
- Dead code removal after bug fixes (don't remove code that's being fixed)
- TypeScript quality after structural changes (types need to match new signatures)
- A11y work is independent and can happen any time after Phase 2

### Parallel Opportunities

- All Setup tasks (T001-T003) marked [P] can run in parallel
- T008 + T009 (React.memo wraps) can run in parallel
- T023 + T024 (aria-labels on buttons) can run in parallel
- US1, US2, US3, US4 can all start in parallel after Phase 2 completes (different files, minimal overlap)
- US4 can start after Phase 1 (no dependency on Phase 2 bug fixes)

---

## Parallel Example: User Story 1

```bash
# Launch memoization tasks together (different files):
Task: "T008 [P] [US1] Wrap AttendanceCell in React.memo at src/components/attendance/AttendanceCell.tsx"
Task: "T009 [P] [US1] Wrap StudentInfo in React.memo at src/components/attendance/StudentInfo.tsx"

# Launch dead code cleanup tasks together (different files):
Task: "T013 [US1] Remove dead code from src/components/attendance/AttendanceGrid.tsx"
Task: "T014 [US1] Remove dead code from src/components/attendance/AttendanceFooter.tsx"
Task: "T015 [US1] Remove trivial handleClick wrapper from src/components/attendance/AttendanceCell.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch aria-label tasks together (different buttons):
Task: "T023 [P] [US2] Add aria-label='Back to sessions' to back button"
Task: "T024 [P] [US2] Add aria-label='Close attendance sheet' to close button"

# Launch contrast fix tasks together (different files):
Task: "T033 [US2] Replace text-outline-variant with text-on-surface-variant"
Task: "T034 [US2] Replace text-slate-300 with text-slate-400 on chevron"
Task: "T035 [US2] Replace bg-slate-900/60 with bg-black/60 backdrop"
Task: "T036 [US2] Replace border-2 border-slate-400 with border-outline-variant/20"
```

---

## Implementation Strategy

### MVP First (US1 Desktop Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational bug fixes (T004-T007) — CRITICAL
3. Complete Phase 3: US1 Desktop attendance (T008-T021)
4. **STOP and VALIDATE**: Test desktop attendance grid independently
5. Deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready, bugs fixed
2. Add US1 Desktop → Test independently → Deploy (MVP!)
3. Add US2 Mobile → Test independently → Deploy
4. Add US3 Retry → Test independently → Deploy
5. Add US4 Session Mgmt → Test independently → Deploy
6. Polish → Final verification → Deploy

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Phase 2 is done:
   - Developer A: US1 Desktop (Phase 3)
   - Developer B: US2 Mobile (Phase 4)
   - Developer C: US4 Session Mgmt (Phase 6, can start after Phase 1)
3. US3 (Phase 5) is small — can be picked up by any developer after Phase 2

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- This is an audit fix — no new features, no backend changes, no test files
- Total tasks: 48 (including 3 setup + 4 foundational + 14 US1 + 15 US2 + 4 US3 + 5 US4 + 3 polish)
