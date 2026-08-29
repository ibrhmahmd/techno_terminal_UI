---
description: "Task list for attendance cache/update/refresh audit fix"
---

# Tasks: Attendance Grid — Cache, Update & Refresh Audit Fix

**Input**: Design documents from `/specs/074-attendance-cache-refresh-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included only where they verify the audit's core correctness contract (cache invalidation coverage, toggle cycle). Kept minimal — this is a bug-fix/refactor feature, not greenfield.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/`
  - Utils: `src/utils/`
  - Types: `src/types/` + domain types under `src/api/{domain}/types.ts`
  - Tests: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify clean workspace before implementation begins

- [X] T001 Confirm current git branch is `074-attendance-cache-refresh-audit` and working tree state is understood

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared cache-invalidation + status-cycle infrastructure that US1 and US2 both depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Create `src/utils/attendanceStatus.ts` exporting `ATTENDANCE_STATUSES` const (`['not_taken','present','absent']`) and `getNextStatus(current: AttendanceStatus): AttendanceStatus` implementing `not_taken → present → absent → not_taken`
- [X] T003 [P] Create `src/utils/attendanceInvalidation.ts` exporting `invalidateSessionCaches(qc: QueryClient, opts: { groupId: number; level?: number | null; selectedDate?: string }): Promise<unknown>` that awaits `queryKeys.groupLevels(groupId)` always, `queryKeys.groupAttendance(groupId, level)` when `level != null`, and `queryKeys.dashboard.overview(selectedDate)` when `selectedDate` set — via `Promise.all`
- [X] T004 [P] Create `src/hooks/useAttendanceCaches.ts` exporting `useAttendanceInvalidation(groupId: number)` returning `{ invalidate(opts?: { level?; selectedDate? }): Promise<unknown> }` wrapping T003 with the bound `queryClient` — **DEV: hook deleted as dead code** — grid + mobile sheet use standalone `invalidateSessionCaches(qc, ...)` directly, so `useAttendanceInvalidation` had zero consumers; removed to avoid an unused export (dead-code audit principle)

**Checkpoint**: Foundation ready — US1 and US2 can now be implemented

---

## Phase 3: User Story 1 - Grid stays current after session actions (Priority: P1) 🎯 MVP

**Goal**: Session lifecycle mutations (cancel/delete/reactivate/complete/edit) invalidate `queryKeys.groupAttendance(groupId, level)` so the group-detail grid updates immediately.

**Independent Test**: On the group-detail page (no `selectedDate`), cancel a session → its row disappears without a manual refresh; repeat for delete/reactivate/complete/edit.

### Tests for User Story 1

> **NOTE: Write this test FIRST, ensure it FAILS before implementation**

- [X] T005 [P] [US1] Create unit test `src/tests/attendance/attendanceInvalidation.test.ts` asserting that `invalidateSessionCaches` invalidates `groupAttendance(groupId, level)`, `groupLevels(groupId)`, and (when `selectedDate` set) `dashboard.overview(selectedDate)` via mock QueryClient

### Implementation for User Story 1

- [X] T006 [P] [US1] Replace the 5 lifecycle handlers' inline invalidation in `src/components/attendance/AttendanceGrid.tsx` (`handleCancelSession`, `handleDeleteSession`, `handleReactivateSession`, `handleCompleteSession`, `handleSaveEditedSession`, ~lines 137-220) with `await invalidateSessionCaches(qc, { groupId, level, selectedDate })` — removing the stale-only-`overview`+`groupLevels` pattern
- [X] T007 [US1] Replace `handleSaveAll`'s sequential invalidations (`src/components/attendance/AttendanceGrid.tsx` ~lines 364-368) with `await invalidateSessionCaches(qc, { groupId, level, selectedDate })`, preserving the Fix-1 ordering (clear `dirtyNotes` only AFTER invalidation+refetch resolve)
- [X] T008 [US1] Reuse `invalidateSessionCaches` in `handleRetrySession` (`src/components/attendance/AttendanceGrid.tsx` ~lines 447-452) in place of its inline `Promise.all`
- [X] T009 [P] [US1] Consolidate grid toggle state into a `useReducer` in `src/components/attendance/AttendanceGrid.tsx` (slices: `localOverrides`, `pendingChanges`, `dirtySessions`, `sessionSaveStatus`; action `{ type:'toggle', studentId, sessionId, baseline }` deriving next status via `getNextStatus` from `src/utils/attendanceStatus.ts`) so `handleToggle = useCallback(..., [sessions])` no longer depends on the derived `students` array, restoring `AttendanceCell.memo` effectiveness — **DEV: used stable-callback via `useRef` instead of `useReducer`** — same acceptance criterion met (`handleToggle = useCallback(..., [sessions])`, no `[students]` dep) with far lower regression risk to the Fix-1-ordering-sensitive `handleSaveAll`/`handleRetrySession`, which rely on useState functional updaters + queueMicrotask reads
- [X] T010 [US1] Pre-index session attendance into a `Map<student_id, status>` once inside the `students` memo (`src/components/attendance/AttendanceGrid.tsx` ~lines 79-89) instead of `.find` per student per session
- [X] T011 [P] [US1] Index roster lookups in `transformSessions` via `rosterById = new Map(roster.map(r => [r.student_id, r]))` in `src/utils/attendanceTransforms.ts` (~line 67), replacing `roster.find(r => r.student_id === Number(studentId))` with `rosterById.get(Number(studentId))`
- [X] T012 [P] [US1] Wrap `transformRoster`/`transformSessions` calls in `LevelAttendancePanel` with `useMemo` in `src/components/groups/LevelsTab.tsx` (~lines 560-561), deps `[roster]` and `[sessions, roster, groupId, levelNumber]`
- [X] T013 [P] [US1] Rename `src/components/attendance/EditSessionPopup.tsx` → `EditSessionModal.tsx` and update the export name + import in `src/components/attendance/AttendanceGrid.tsx` (line 16)

**Checkpoint**: US1 — grid refresh correctness restored; toggling one cell no longer re-renders the whole grid

---

## Phase 4: User Story 2 - Missing attendance renders consistently on mobile & desktop (Priority: P2)

**Goal**: A student with no attendance record renders "Not Taken" on both the mobile sheet and the desktop grid; mobile reuses the shared toggle + invalidation logic.

**Independent Test**: Open a session where a roster student has no attendance record → mobile shows gray "Not Taken", matching desktop.

### Implementation for User Story 2

- [X] T014 [P] [US2] Change the missing-status default in `src/components/attendance/AttendanceMobileSheet.tsx` line 276 from `?? 'absent'` to `?? 'not_taken'`, and normalize the lookup key with `Number(student.student_id)`
- [X] T015 [US2] Replace the inline toggle if/else in `AttendanceMobileSheet.handleStudentTap` (`src/components/attendance/AttendanceMobileSheet.tsx` ~lines 110-115) with the shared `getNextStatus` from `src/utils/attendanceStatus.ts`
- [X] T016 [US2] Replace the inline `Promise.all([...])` cache invalidation in `AttendanceMobileSheet.handleSave` (`src/components/attendance/AttendanceMobileSheet.tsx` ~lines 142-145) with `invalidateSessionCaches(qc, { groupId, level: selectedSession.level_number ?? -1, selectedDate })` (or `useAttendanceInvalidation(groupId)`), preserving the immediate-save UX
- [X] T017 [P] [US2] Change the missing-status default in `src/components/attendance/AttendanceTableBody.tsx` line 35 from `?? 'absent'` to `?? 'not_taken'` to match the canonical grid default

**Checkpoint**: US2 — mobile and desktop agree on missing-status semantics; toggle + save logic deduplicated

---

## Phase 5: User Story 3 - Attendance data model has one source of truth (Priority: P3)

**Goal**: `getAttendanceForLevel` and the DTOs exist in exactly one place (academics); `api/attendance` re-exports them; the `scheduled|completed|cancelled` union is a single shared type.

**Independent Test**: `rg "interface AttendanceRosterDTO" src` → exactly 1 hit; `rg "getAttendanceForLevel" src/api` → 1 implementation + re-exports only.

### Implementation for User Story 3

- [X] T018 [P] [US3] Add a shared `export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'` in `src/api/academics/types/sessions/models.ts` (or `src/types/api.ts`) and update the ~6 inline union sites (`SessionWithAttendanceDTO`, `TodaySessionDTO`, `AttendanceSessionDTO`, `UpdateSessionDTO`, `LevelSessionDTO`, and the DTO in `newEndpoints.ts`) to import it
- [X] T019 [P] [US3] Convert `src/api/attendance/types.ts` to re-export `AttendanceRosterDTO`, `AttendanceSessionDTO`, `AttendanceLevelResponse` from `../academics` and delete the duplicated interface definitions (keep local `AttendanceStatus` + `AttendanceEntry` view-model types)
- [X] T020 [P] [US3] Convert `src/api/attendance/attendance.ts` to re-export `getAttendanceForLevel` from `../academics/groups`, delete the duplicate implementation, and keep only `markAttendance` (preserving its `not_taken`-filter + `parseInt(student_id)` behavior)
- [X] T021 [US3] Verify all consumers still resolve: `src/hooks/useGroupAttendance.ts` (imports `../api/attendance`) and `src/utils/attendanceTransforms.ts` (imports `../api/academics`) now point to the same implementation

**Checkpoint**: US3 — single source of truth for attendance types + endpoint; no silent divergence risk

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification, formatting, and final quality gates

- [X] T022 [P] Run `npx eslint src/utils/attendanceStatus.ts src/utils/attendanceInvalidation.ts src/hooks/useAttendanceCaches.ts src/components/attendance/ src/components/groups/LevelsTab.tsx src/api/attendance/` and fix all errors
- [X] T023 Run `npm run lint` and confirm zero errors
- [X] T024 [P] Run `npm run test` and confirm all tests pass (including new `attendanceInvalidation.test.ts`)
- [X] T025 Run `npm run build` (`tsc -b && vite build`) and confirm zero errors
- [X] T026 Confirm no `: any` / raw axios / inline query keys introduced: search `src/components/attendance/`, `src/utils/attendanceStatus.ts`, `src/utils/attendanceInvalidation.ts`, `src/api/attendance/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US1 and US2
- **US1 (Phase 3)**: Depends on Foundational (T002-T004)
- **US2 (Phase 4)**: Depends on Foundational (T002-T004 only — independent of US1)
- **US3 (Phase 5)**: No blocking dependencies on Foundational, but share files with US1/US2 (edit `attendance/*`) — sequence after US1/US2 to avoid same-file conflicts when staffed 1 dev
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)** ✅ MVP: Needs `invalidateSessionCaches` (T003). Can be delivered and tested alone.
- **US2 (P2)**: Needs `getNextStatus` (T002) + `invalidateSessionCaches` (T003). Independent of US1.
- **US3 (P3)**: Pure refactor of `api/attendance/*` + type union. Overlaps files (attendance module) with US1/US2 only in that they all touch `api/attendance` — run after US1/US2 to minimize merge churn.

### Within Each User Story

- US1: test (T005) first and fail → invalidation wiring (T006-T008) → reducer (T009) → perf (T010-T012) → rename (T013)
- US2: sheet fix (T014) → shared toggle/save (T015, T016) → table body (T017)
- US3: SessionStatus (T018) → type re-export (T019) → endpoint re-export (T020) → verification (T021)

### Parallel Opportunities

- T002, T003, T004 are independent file creates → parallel.
- US1 internals: T006 (grid) is the only file claim on `AttendanceGrid.tsx` with T007-T010 — T007/T008 must follow T006 (same file). T011 (transforms), T012 (LevelsTab), T013 (rename) are `[P]` and can run alongside T006-T010.
- US2: all of T014-T017 are `[P]` (different concerns in the same file but independent edits).
- US3: T018, T019, T020 `[P]` (different files) — T021 verification after.

---

## Parallel Example: Foundational + US1

```bash
# Launch the three foundational utils in parallel:
Task: "T002 Create src/utils/attendanceStatus.ts (getNextStatus)"
Task: "T003 Create src/utils/attendanceInvalidation.ts (invalidateSessionCaches)"
Task: "T004 Create src/hooks/useAttendanceCaches.ts (useAttendanceInvalidation)"

# After T003 lands, launch US1 wiring:
Task: "T005 [US1] Write failing invalidateSessionCaches test"
Task: "T006 [US1] Rewire 5 lifecycle handlers in AttendanceGrid.tsx"
Task: "T013 [US1] Rename EditSessionPopup to EditSessionModal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004) — CRITICAL, blocks US1
3. Complete Phase 3: User Story 1 (T005-T013)
4. **STOP and VALIDATE**: Test US1 independently (cancel/delete/reactivate/complete/edit refresh the group grid)
5. Deploy/demo if ready — this alone fixes the critical stale-cache bug

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add US1 → fix critical cache/refresh bug → validate → deploy (MVP)
3. Add US2 → mobile/desktop status consistency → validate → deploy
4. Add US3 → type dedup → validate → deploy
5. Polish (lint/build/test) before final commit

### Parallel Team Strategy

With multiple developers:
- Team completes Foundational together (T002-T004)
- Developer A: US1; Developer B: US2 (both only need Foundational)
- Developer C: US3 after US1/US2 to avoid `api/attendance` file conflicts
- Polish (T022-T026) by whoever finishes last

---

## Notes

- **[P]** tasks = different files / independent edits; no dependencies
- **[Story]** label maps task to user story for traceability
- The audit found the batch-save path (`handleSaveAll`) was correct; the fix preserves its ordering (Fix-1) while extending it through the shared invalidator
- **Do NOT** change `useGroupAttendance` staleTime (60s) — intentional (AGENTS.md §8)
- **Do NOT** alter `markAttendance`'s `not_taken`-filter / `parseInt(student_id)` behavior (AGENTS.md §8)
- Any new i18n keys must be added to BOTH `src/locales/en/attendance.json` and `src/locales/ar/attendance.json`
- Commit after each task or logical group; gate every commit on `npm run lint` + `npm run build`
