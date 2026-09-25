# Tasks: Dashboard Audit Fix

**Input**: Design documents from `specs/041-fix-dashboard-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/
**Tests**: Not requested in the feature spec — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- All changes are edits to existing files — no new files need to be created.

---

## Phase 1: Setup

**Purpose**: No project initialization needed — all changes are edits to existing files.

- [X] T001 Verify `npm run build` and `npm run lint` pass before making changes

---

## Phase 2: Foundational

**Purpose**: No shared infra changes needed. Each user story modifies independent files with minimal overlap. Proceed directly to user story phases.

---

## Phase 3: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix 3 production bugs — 24h time format instead of 12h, null crash on `current_level`, and redundant `getGroupInfo` calls.

**Independent Test**: Dashboard displays all session times in "9:00 AM" format (not "09:00"). Level numbers never crash with null data. `getGroupInfo` is called once per render, not 4+ times.

**Implementation for User Story 1**

- [X] T002 [US1] Replace inline `.slice(0,5)` with `formatTime()` for time display in `src/components/dashboard/MobileGroupCard.tsx`
- [X] T003 [US1] Add optional chaining on `current_level` in `src/pages/DashboardPage.tsx` to prevent null crash
- [X] T004 [US1] Extract `getGroupInfo(openGroupId)` to a local variable in `src/pages/DashboardPage.tsx` to fix 4× call redundancy

**Checkpoint**: All session times show consistent 12-hour format. No null crashes. Build passes.

---

## Phase 4: User Story 2 — Remove Dead Code (Priority: P1)

**Goal**: Delete placeholder files, remove unused exports and props, clean up barrel files.

**Independent Test**: Build passes with zero errors. No remaining imports reference the removed files or exports.

**Implementation for User Story 2**

- [X] T005 [P] [US2] Delete dead placeholder `src/components/dashboard/DashboardHeader.tsx`
- [X] T006 [P] [US2] Delete dead placeholder `src/hooks/dashboard/useAttendance.ts`
- [X] T007 [P] [US2] Remove unused `todaySessionCount` prop from `MobileDashboardFABProps` interface and its callers in `src/pages/DashboardPage.tsx`
- [X] T008 [P] [US2] Remove dev-only `console.log` block (lines 24-38) from `src/hooks/dashboard/useDashboard.ts`
- [X] T009 [P] [US2] Remove unused `GetDashboardOverviewParams` type export from `src/api/dashboard/dashboard.ts`
- [X] T010 [P] [US2] Remove unused `schedule` and `sessions` query key entries from `dashboardKeys` in `src/hooks/dashboard/useDashboard.ts`

**Checkpoint**: No dead placeholders remain. Build passes with zero errors.

---

## Phase 5: User Story 3 — Fix TypeScript Code Quality (Priority: P2)

**Goal**: Remove unsafe `as number` type assertion; replace with proper typing.

**Independent Test**: TypeScript build (`tsc -b`) passes with zero type errors. No `as number` assertions on `instructor_id` remain.

**Note**: Two findings from the audit (redundant `getGroupInfo` calls, dev `console.log`) are already covered by US1 and US2 tasks.

**Implementation for User Story 3**

- [X] T011 [US3] Replace `as number` assertion on `instructor_id` in the edit session panel of `src/pages/DashboardPage.tsx` with safe type narrowing or `Number()` guard

**Checkpoint**: No unsafe type assertions remain in the dashboard. Build passes.

---

## Phase 6: User Story 4 — Centralize Dashboard Query Keys (Priority: P2)

**Goal**: Migrate local `dashboardKeys` from `useDashboard.ts` to centralized `queryKeys.ts` factory.

**Independent Test**: All dashboard query keys are defined in `src/hooks/queryKeys.ts` and consumed via the centralized factory. No inline `['dashboard', ...]` keys exist outside `queryKeys.ts`.

**Implementation for User Story 4**

- [X] T012 [P] [US4] Add `dashboard` section to `src/hooks/queryKeys.ts` with `overview`, `schedule`, and `sessions` factory functions (key values identical to current `dashboardKeys`)
- [X] T013 [P] [US4] Update `src/hooks/dashboard/useDashboard.ts` to import `queryKeys` from `../queryKeys` and use `queryKeys.dashboard.overview(date)` instead of local `dashboardKeys`
- [X] T014 [P] [US4] Update `src/hooks/useGroupQueries.ts` to import `queryKeys` from `./queryKeys` instead of importing `dashboardKeys` from `./dashboard/useDashboard`
- [X] T015 [P] [US4] Update `src/components/attendance/AttendanceGrid.tsx` to import `queryKeys` from `../../hooks/queryKeys` instead of importing `dashboardKeys` from `../../hooks/dashboard/useDashboard`
- [X] T016 [P] [US4] Update `src/components/attendance/AttendanceMobileSheet.tsx` to import `queryKeys` from `../../hooks/queryKeys` instead of importing `dashboardKeys` from `../../hooks/dashboard`
- [X] T017 [US4] Remove `dashboardKeys` export from `src/hooks/dashboard/useDashboard.ts` and `src/hooks/dashboard/index.ts` (deleting now-unused re-exports)

**Checkpoint**: All dashboard query keys centralized in `queryKeys.ts`. Build passes.

---

## Phase 7: User Story 5 — Fix Keyboard Accessibility (Priority: P3)

**Goal**: Hidden FAB buttons are not keyboard-tabbable, FAB closes on Escape, tablists support arrow key navigation.

**Independent Test**: Tab through the dashboard with keyboard only. Hidden FAB buttons are NOT focusable. FAB closes on Escape. Tablists support ArrowLeft/ArrowRight navigation.

**Implementation for User Story 5**

- [X] T018 [US5] Add `invisible` class alongside `opacity-0 pointer-events-none` on hidden FAB action buttons in `src/components/dashboard/MobileDashboardFAB.tsx` to prevent keyboard focus; add Escape key handler (`onKeyDown`) to close the FAB menu
- [X] T019 [P] [US5] Add arrow key navigation (ArrowLeft/ArrowRight handlers, roving tabindex) to tablist in `src/components/dashboard/DaySelectorBar.tsx`
- [X] T020 [P] [US5] Add arrow key navigation (ArrowLeft/ArrowRight handlers, roving tabindex) to tablist in `src/components/dashboard/InstructorSelectorBar.tsx`

**Checkpoint**: All tablists support keyboard navigation. Hidden elements are not focusable. Build passes.

---

## Phase 8: User Story 6 — Add Screen Reader ARIA Attributes (Priority: P3)

**Goal**: Error banners use `role="alert"`, decorative icon spans use `aria-hidden="true"`.

**Independent Test**: Error banners are announced by screen readers. All `material-symbols-outlined` decorative spans have `aria-hidden="true"`.

**Implementation for User Story 6**

- [X] T021 [US6] Add `role="alert"` to the error banner in `src/pages/DashboardPage.tsx`
- [X] T022 [P] [US6] Add `aria-hidden="true"` to Material Symbols icon spans in `src/components/dashboard/MobileGroupCard.tsx`
- [X] T023 [P] [US6] Add `aria-hidden="true"` to Material Symbols icon spans in `src/components/dashboard/InstructorSelectorBar.tsx`
- [X] T024 [P] [US6] Add `aria-hidden="true"` to Material Symbols icon spans in `src/components/dashboard/GroupSessionCard.tsx` (no icon spans found — trivially done)
- [X] T025 [P] [US6] Add `aria-hidden="true"` to Material Symbols icon spans in `src/components/dashboard/DaySelectorBar.tsx` (no icon spans found — trivially done)

**Checkpoint**: All dashboards icons hidden from screen readers. Error banner announced. Build passes.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification — build, lint, and grep checks.

- [X] T026 Run `npm run build` (`tsc -b && vite build`) and fix any TS errors
- [X] T027 Run `npm run lint` and fix any errors
- [X] T028 Run grep to confirm no remaining 24h inline `.slice(0,5)` patterns in dashboard files
- [X] T029 Run grep to confirm no remaining `dashboardKeys` references outside `queryKeys.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — just verify pre-existing build passes
- **User Stories (Phase 3+)**: All stories are independent — they modify different files:
  - US1 touches: `MobileGroupCard.tsx`, `DashboardPage.tsx`
  - US2 touches: `DashboardHeader.tsx`, `useAttendance.ts`, `DashboardPage.tsx`, `useDashboard.ts`, `dashboard.ts`
  - US3 touches: `DashboardPage.tsx`
  - US4 touches: `queryKeys.ts`, `useDashboard.ts`, `useGroupQueries.ts`, `AttendanceGrid.tsx`, `AttendanceMobileSheet.tsx`, `hooks/dashboard/index.ts`
  - US5 touches: `MobileDashboardFAB.tsx`, `DaySelectorBar.tsx`, `InstructorSelectorBar.tsx`
  - US6 touches: `DashboardPage.tsx`, `MobileGroupCard.tsx`, `InstructorSelectorBar.tsx`, `GroupSessionCard.tsx`, `DaySelectorBar.tsx`

### File Conflict Map

Tasks touching the SAME file must be sequential:

| File | Tasks (in order) |
|------|-----------------|
| `DashboardPage.tsx` | T003, T004, T007, T011, T021 (sequential) |
| `MobileGroupCard.tsx` | T002 → T022 (T002 then T022) |
| `useDashboard.ts` | T008, T010 → T013 → T017 (T008+T010 first, then T013, then T017) |
| `DaySelectorBar.tsx` | T019 → T025 |
| `InstructorSelectorBar.tsx` | T020 → T023 |

All other files are modified by exactly one task.

### Within Each User Story

- Single-file edits within a story should be done in task order
- [P] tasks can be done in any order (they touch different files)
- Any consumer update (US4 T014-T016) can happen before or after T013

### Parallel Opportunities

- US1, US2, US3, and US5 tasks can all start simultaneously (they touch different files from each other)
- US4 is largely independent but touches `queryKeys.ts` — add the keys first (T012) before updating consumers (T013-T016)
- US6 icons tasks (T022-T025) are fully parallel across files
- All [P]-marked tasks within each story run in parallel

---

## Parallel Example: User Story 1

```bash
# T002 and T003 are in different files — parallel:
Task: "Edit MobileGroupCard.tsx line 14 — replace .slice(0,5) with formatTime()"
Task: "Edit DashboardPage.tsx line 178 — add optional chaining on current_level"

# T004 same file as T003 — sequential after T003
```

## Parallel Example: User Story 4

```bash
# T012 (queryKeys.ts) must come first
# Then all consumer updates (T013-T016) can run in parallel:
Task: "Update useDashboard.ts to import from queryKeys"
Task: "Update useGroupQueries.ts to import from queryKeys"
Task: "Update AttendanceGrid.tsx to import from queryKeys"
Task: "Update AttendanceMobileSheet.tsx to import from queryKeys"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (runtime bugs — T002, T003, T004)
2. **STOP and VALIDATE**: Verify dashboard times show 12h format, no null crashes, single `getGroupInfo` call
3. Deploy/demo if ready

### Incremental Delivery

1. US1 → Fix production runtime bugs (P1) → Deploy/Demo
2. US2 → Clean up dead code (P1) → Deploy/Demo
3. US3 → Fix TS quality (P2) → Deploy/Demo
4. US4 → Centralize query keys (P2) → Deploy/Demo
5. US5 → Fix keyboard a11y (P3) → Deploy/Demo
6. US6 → Add screen reader ARIA (P3) → Deploy/Demo
7. Polish → Verify build/lint → Done

Each story adds value without breaking previous stories. Stories can be reordered within priority bands.

### Parallel Team Strategy

With multiple developers — given zero new code, best suited for a single developer:

1. Developer completes US1 first (runtime bugs — highest impact)
2. Then tackles US2 + US3 (both P1/P2, share DashboardPage.tsx)
3. Then US4 (query key migration — can batch all consumer updates)
4. Then US5 + US6 (all a11y, fully parallel across files)
5. Final: build verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: same file modifications in parallel, out-of-order file edits
- Build rules: `npm run build` must pass after all changes; `tsc -b` uses `tsconfig.app.json` which excludes test files
