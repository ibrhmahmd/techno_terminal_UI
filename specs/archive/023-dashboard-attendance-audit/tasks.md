---

description: "Task list for Dashboard Cache & Attendance Grid Audit Fix"
---

# Tasks: Dashboard Cache & Attendance Grid Audit Fix

**Input**: Design documents from `specs/023-dashboard-attendance-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested in feature spec — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No project initialization needed (feature is an audit fix on existing code). All tasks operate directly on existing files.

*No setup tasks required.*

---

## Phase 2: Foundational — Dead Code Removal

**Purpose**: Remove unused code first to eliminate noise and reduce risk of merge conflicts in subsequent phases. These are pure deletions with zero behavior change.

**⚠️ Blocking**: Completing this phase simplifies all subsequent work.

### Implementation

- [x] T001 [P] [US3] Remove unused `groupHistory`, `groupStudents`, `groupsArchived`, `groupsByCourse`, `groupsByType`, `groupSearch` keys from `src/hooks/queryKeys.ts`
- [x] T002 [P] [US3] Remove unused `students`, `student`, `studentBalance`, `studentSiblings` keys from `src/hooks/queryKeys.ts`
- [x] T003 [P] [US3] Remove unused `course` key from `src/hooks/queryKeys.ts`
- [x] T004 [P] [US3] Remove unused `teamPayments` key from `src/hooks/queryKeys.ts`
- [x] T005 [P] [US3] Remove unused `receipts`, `refunds` keys from `src/hooks/queryKeys.ts`
- [x] T006 [P] [US3] Remove unused `dashboard`, `stats`, `attendance`, `dashboardOverview` keys from `src/hooks/queryKeys.ts`
- [x] T007 [P] [US3] Remove unused `reports.all`, `reports.enrollmentTrends`, `reports.instructorPerformance`, `reports.dailyReport.pdf` keys from `src/hooks/queryKeys.ts`
- [x] T008 [P] [US3] Remove unused `auth.user` key from `src/hooks/queryKeys.ts`
- [x] T009 [P] [US3] Remove dead `getSessionAttendance` function from `src/api/attendance/attendance.ts` and its barrel export in `src/api/attendance/index.ts`
- [x] T010 [P] [US3] Remove dead `SessionAttendanceRowDTO` type from `src/api/attendance/types.ts` and its barrel export
- [x] T011 [P] [US3] Remove dead `AttendanceUpdate` interface from `src/api/attendance/types.ts` (keeping `AttendanceEntry` as the active alias)
- [x] T012 [P] [US3] Un-export `MarkAttendanceRequest` from `src/api/attendance/types.ts` (only used internally by `attendance.ts`)
- [x] T013 [US3] Remove dead `useMarkAttendance`, `useCancelSession`, `useAddExtraSession` hooks from `src/hooks/dashboard/useAttendance.ts` and update barrel export in `src/hooks/dashboard/index.ts`
- [x] T014 [US3] Remove dead `DashboardHeader` component from `src/components/dashboard/DashboardHeader.tsx` and its barrel export in `src/components/dashboard/index.ts`
- [x] T015 [P] [US3] Remove unused exports (`attendanceStatusColors`, `departmentColors`) from `src/utils/colors.ts`

**Checkpoint**: Dead code eliminated — all removals verified by `npm run build && npm run lint`.

---

## Phase 3: User Story 4 — Type-Safe Data Handling (Priority: P2)

**Goal**: Eliminate all unsafe type assertions and type-only import violations in attendance-related source files.

**Independent Test**: Run `rg 'as any' src/components/attendance/ src/api/attendance/` — must return zero matches.

### Implementation

- [x] T016 [US4] Replace `(session as any).date` with typed field access (`session.date ?? session.session_date`) in `src/components/attendance/EditSessionPopup.tsx:47`
- [x] T017 [P] [US4] Replace `(session as any).time_start` with typed field access (`session.time_start ?? session.start_time`) in `src/components/attendance/EditSessionPopup.tsx:48`
- [x] T018 [P] [US4] Replace `(session as any).time_end` with typed field access (`session.time_end ?? session.end_time`) in `src/components/attendance/EditSessionPopup.tsx:49`
- [x] T019 [US4] Remove redundant `(session as SessionWithAttendanceDTO)` cast in `src/components/attendance/EditSessionPopup.tsx:71`
- [x] T020 [US4] Fix `import { type UpdateSessionDTO }` to `import type { UpdateSessionDTO }` in `src/components/attendance/EditSessionPopup.tsx:5`
- [x] T021 [US4] Replace unsafe `as 'present' | 'absent' | 'cancelled'` cast with proper type guard predicate on filter in `src/api/attendance/attendance.ts:18`

**Checkpoint**: `rg 'as any' src/components/attendance/ src/api/attendance/` returns zero. `npm run build` passes.

---

## Phase 4: User Story 2 — Error-Free Attendance Management (Priority: P1)

**Goal**: Fix runtime bugs in attendance grid — level-0 rejection, native confirm(), UTC date off-by-one, dirty notes lost on refetch, production console.log, hardcoded GMT+2.

**Independent Test**: Verify attendance grid loads for groups with level 0. Cancel a session — see one (not two) confirm dialogs. Edit notes, let data refetch — notes preserved.

### Implementation

- [x] T022 [US2] Fix `!levelNumber` to `levelNumber === null || levelNumber === undefined` in `src/hooks/useGroupAttendance.ts:23`
- [x] T023 [US2] Fix `!!levelNumber` to `levelNumber !== null && levelNumber !== undefined` in enabled guard in `src/hooks/useGroupAttendance.ts:26`
- [x] T024 [US2] Replace native `confirm()` with state-driven ConfirmDialog for session cancellation in `src/components/attendance/AttendanceGrid.tsx:175`
- [x] T025 [P] [US2] Fix `getTodayISO` to use local timezone instead of UTC in `src/utils/formatting.ts:83`
- [x] T026 [US2] Gate `console.log` behind `import.meta.env.DEV` in `src/hooks/dashboard/useDashboard.ts:24`
- [x] T027 [P] [US2] Remove debug `console.log` stubs from `src/components/attendance/AttendanceFooter.tsx:25`
- [x] T028 [US2] Prevent dirty session notes from being discarded on refetch by checking `dirtyNotes.size === 0` before resetting in `src/components/attendance/AttendanceGrid.tsx:82`

**Checkpoint**: `rg 'console\.(log|error|warn)' src/components/attendance/ src/hooks/dashboard/` returns zero. Level-0 groups load correctly. Single confirm shown on cancel.

---

## Phase 5: User Story 1 — Accurate Dashboard After Attendance Changes (Priority: P1) 🎯 MVP

**Goal**: Ensure dashboard overview and group attendance views refresh immediately after any attendance mutation.

**Independent Test**: Mark attendance from dashboard → navigate to group detail page → see updated attendance. Cancel session → dashboard session count updates without page reload.

### Implementation

- [x] T029 [US1] Add `queryKeys.groupAttendance(groupId, level)` invalidation after save in `src/components/attendance/AttendanceGrid.tsx:344`
- [x] T030 [US1] Add `dashboardKeys.overview(selectedDate)` invalidation to `cancelSession` handler in `src/components/attendance/AttendanceGrid.tsx:174`
- [x] T031 [US1] Add `dashboardKeys.overview(selectedDate)` invalidation to `handleSaveEditedSession` handler in `src/components/attendance/AttendanceGrid.tsx:189`
- [x] T032 [US1] Refactor derived `students` state from `useState + useEffect` to `useMemo` in `src/components/attendance/AttendanceGrid.tsx:52`
- [x] T033 [US1] Replace `useEffect + fetch` for employees with `useQuery` (staleTime: 10 min) in `src/components/attendance/EditSessionPopup.tsx:29`

**Checkpoint**: After any attendance save/cancel/edit, dashboard overview and group attendance caches are invalidated. `npm run build` passes.

---

## Phase 6: User Story 5 — Accessible Attendance Management (Priority: P2)

**Goal**: Add ARIA attributes and semantic HTML patterns to all interactive controls in dashboard and attendance grid.

**Independent Test**: Run axe-core audit on DashboardPage and attendance grid — zero critical/high violations.

### Implementation

- [x] T034 [P] [US5] Add `aria-hidden="true"` to Material Symbols icons in `src/components/dashboard/StatWidget.tsx`
- [x] T035 [P] [US5] Add `aria-hidden="true"` to Material Symbols icons in `src/components/dashboard/QuickActionWidget.tsx`
- [x] T036 [P] [US5] Add `aria-label` to close button in `src/components/common/Modal.tsx:93`
- [x] T037 [US5] Add `role="alertdialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby` and focus trap to `src/components/common/ConfirmDialog.tsx:69`
- [x] T038 [US5] Add `role="tablist"`/`role="tab"`/`aria-selected"` to day selector in `src/components/dashboard/DaySelectorBar.tsx:44`
- [x] T039 [US5] Add `role="tablist"`/`role="tab"`/`aria-selected"` to instructor selector in `src/components/dashboard/InstructorSelectorBar.tsx:23`
- [x] T040 [US5] Add `aria-label="View group details"` to info button in `src/components/attendance/AttendanceGrid.tsx:469`
- [x] T041 [P] [US5] Add `aria-hidden="true"` to status icons in `src/components/attendance/AttendanceCell.tsx:11`
- [x] T042 [P] [US5] Add `aria-hidden="true"` to icons in `src/components/attendance/AttendanceFooter.tsx:56`
- [x] T043 [US5] Add `aria-hidden="true"` to icons and `aria-label` to edit/cancel buttons in `src/components/attendance/SessionActionsRow.tsx:66`
- [x] T044 [US5] Add `aria-label` to session notes textarea in `src/components/attendance/SessionNotesRow.tsx:32`
- [x] T045 [US5] Add `role="alert"` to error banner in `src/components/attendance/AttendanceGrid.tsx:448`

**Checkpoint**: All Material Symbols have `aria-hidden="true"`. All icon-only buttons have `aria-label`. Tab-like controls have proper roles. `npm run build && npm run lint` passes.

---

## Phase 7: User Story 6 — Clear Loading and Error States (Priority: P3)

**Goal**: Provide accessible loading and error state feedback, fix semantic HTML structure.

**Independent Test**: Screen reader announces loading state when dashboard is fetching. Error banner is announced. Page has `<main>` landmark.

### Implementation

- [x] T046 [US6] Add `role="status"` with `aria-live="polite"` to loading spinner wrapper in `src/pages/DashboardPage.tsx:70`
- [x] T047 [US6] Add `role="status"` to `src/components/common/LoadingSpinner.tsx:19`
- [x] T048 [US6] Replace `<div>` with `<main>` landmark in `src/pages/DashboardPage.tsx:57`
- [x] T049 [US6] Fix heading hierarchy (add h2 sections) in `src/pages/DashboardPage.tsx:56`
- [x] T050 [US6] Add `aria-label="Quick actions"` to `<section>` in `src/components/dashboard/QuickActionsGrid.tsx:51`

**Checkpoint**: `rg '<div className="min-h-screen' src/pages/DashboardPage.tsx` confirms `<main>` used. Heading levels don't skip.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all stories.

- [x] T051 Run `npm run lint` and fix all errors — zero errors in feature files; 3 pre-existing warnings remain (react-hooks/exhaustive-deps)
- [x] T052 Run `npm run build` (`tsc -b && vite build`) and verify zero errors — passes with zero TS errors
- [x] T053 Verify zero `as any` in attendance files — confirmed zero matches
- [x] T054 Verify zero production `console.log` in dashboard/attendance — all remaining console.* calls are gated behind `import.meta.env.DEV` or are `console.debug`/`console.error`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks needed
- **Foundational — Dead Code Removal (Phase 2)**: No dependencies — can start immediately
- **User Story 4 — TypeScript (Phase 3)**: Independent of all other phases — can run in parallel with Phases 4–7
- **User Story 2 — Runtime Bugs (Phase 4)**: Independent — can run in parallel with Phases 3, 5, 6, 7
- **User Story 1 — Cache (Phase 5)**: Independent — can run in parallel with Phases 3, 4, 6, 7
- **User Story 5 — A11Y (Phase 6)**: Independent — can run in parallel with Phases 3, 4, 5, 7
- **User Story 6 — Loading/Error States (Phase 7)**: Independent — can run in parallel with Phases 3, 4, 5, 6
- **Polish (Phase 8)**: Depends on all desired phases being complete

### User Story Dependencies

- **US-1 (Cache)**: No dependencies on other stories
- **US-2 (Bugs)**: No dependencies on other stories
- **US-3 (Dead Code)**: No dependencies — foundational phase runs first by convention
- **US-4 (TypeScript)**: No dependencies on other stories
- **US-5 (A11Y)**: No dependencies on other stories
- **US-6 (Loading/Error)**: No dependencies on other stories

### Within Each User Story

- Tasks within a phase are independent ([P]) where noted
- [P] tasks can be executed in any order
- Non-[P] tasks should follow the order listed

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel (23 parallel deletions)
- All of Phases 3, 4, 5, 6, 7 can run in parallel with each other (no cross-story dependencies)
- Within each phase, [P]-marked tasks can run in parallel
- Total potential parallelism: up to 10 concurrent edits across different files

---

## Parallel Example: Phase 2 (Dead Code Removal)

```bash
# All 15 dead-code tasks can run in parallel (different files):
Task: "T001 Remove groupHistory etc. from src/hooks/queryKeys.ts"
Task: "T009 Remove getSessionAttendance from src/api/attendance/attendance.ts"
Task: "T013 Remove hooks from src/hooks/dashboard/useAttendance.ts"
Task: "T014 Remove DashboardHeader from src/components/dashboard/DashboardHeader.tsx"
```

## Parallel Example: All User Stories

```bash
# All 5 user story phases can run simultaneously (no cross-dependencies):
Task: "Phase 3 — TypeScript fixes in EditSessionPopup.tsx, attendance.ts"
Task: "Phase 4 — Runtime bugs in useGroupAttendance.ts, AttendanceGrid.tsx"
Task: "Phase 5 — Cache invalidation in AttendanceGrid.tsx, EditSessionPopup.tsx"
Task: "Phase 6 — A11Y in DaySelectorBar.tsx, StatWidget.tsx, Modal.tsx, etc."
Task: "Phase 7 — Loading/error states in DashboardPage.tsx, LoadingSpinner.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 — Core Fixes)

1. Complete Phase 2: Dead Code Removal
2. Complete Phase 3: TypeScript fixes
3. Complete Phase 4: Runtime bug fixes (US-2)
4. Complete Phase 5: Cache invalidation (US-1)
5. **STOP and VALIDATE**: Verify `npm run build`, `npm run lint`, and all success criteria
6. Deploy/test MVP

### Incremental Delivery

1. Dead Code Removal + TypeScript → Foundation
2. Add US-2 (Bug Fixes) + US-1 (Cache) → Test independently → **MVP**
3. Add US-5 (A11Y) → Test independently
4. Add US-6 (Loading/Error) → Test independently
5. Each phase adds value without breaking previous work

### Parallel Team Strategy

With multiple developers:
- Developer A: Phase 3 (TypeScript) + Phase 4 (Bugs)
- Developer B: Phase 5 (Cache) + Phase 6 (A11Y)
- Developer C: Phase 2 (Dead Code) + Phase 7 (Loading/Error)
- All converge on Phase 8 (Polish) together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test tasks generated — feature spec did not request tests
- Commit after each logical task group
- Stop at any checkpoint to validate independently
