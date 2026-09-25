# Tasks: Groups Feature Audit & Fix

**Input**: Design documents from `/specs/015-groups-audit-fix/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Test tasks included for FR-026 (GroupsTable.test.tsx) and FR-027 (useGroups.test.ts) as these are explicitly identified in the spec.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Types: `src/types/`
  - Tests: `src/tests/`
  - Utils: `src/utils/`
- Path examples assume this pattern; adjust domain folder as needed.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup needed — existing project structure is used.

_No tasks required._

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type and utility fixes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 [P] Add `ScheduleInput` interface to `src/api/academics/types/groups/models.ts` with `day`, `time_start`, `time_end` fields
- [x] T002 [P] Export `ScheduleInput` from `src/api/academics/types/groups/index.ts`
- [x] T003 [P] Update `ScheduleGroupInput.schedule` and `UpdateGroupDTO.schedule` to use `ScheduleInput` in `src/api/academics/types/groups/inputs.ts`
- [x] T004 [P] Update `formToSchedule` to return `ScheduleInput` in `src/utils/scheduleTransform.ts`
- [x] T005 Add `RawEnrichedGroupPublic` type extending `EnrichedGroupPublic` with legacy fields (`group_name`, `max_capacity`, `default_day`, `default_time_start`, `default_time_end`) in `src/api/academics/types/groups/models.ts`
- [x] T006 Fix `normalizeEnrichedGroup` to use `RawEnrichedGroupPublic` instead of `as any` casts in `src/api/academics/groups/core.ts`
- [x] T007 Add fallback `current_student_count ?? 0` in `normalizeEnrichedGroup` in `src/api/academics/groups/core.ts` (FR-028)

**Checkpoint**: Foundation ready — type system and API layer aligned. User story implementation can now begin.

---

## Phase 3: User Story 1 — Fix Critical Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix 6 runtime bugs affecting status display, cache invalidation, form sync, validation, and data freshness.

**Independent Test**: Navigate to Groups list, Group detail, Students tab, and Attendance tab. Verify archived status displays correctly, enrollment deletion refreshes immediately, edit form syncs between groups, and time validation prevents empty submissions.

### Implementation for User Story 1

- [x] T008 [US1] Add `'archived'` status to `statusConfig` mapping in `src/components/groups/GroupColumns.tsx` with amber color scheme (FR-001)
- [x] T009 [US1] Add `queryClient.invalidateQueries({ queryKey: queryKeys.groupEnrollments(groupId) })` after `deleteEnrollment` in `src/components/groups/StudentsTab.tsx` (FR-002)
- [x] T010 [US1] Add `useEffect` to sync `selectedLevelId` with `activeLevelId` prop changes in `src/components/groups/StudentsTab.tsx` (FR-003)
- [x] T011 [US1] Replace hardcoded `gender: 'male'` with `r.gender ?? 'unknown'` in `transformRoster` in `src/components/groups/AttendanceTab.tsx` (FR-004)
- [x] T012 [US1] Pass `group.price_override ?? null` instead of `undefined` to `ProgressLevelDialog` in `src/pages/GroupDetailPage.tsx` (FR-005)
- [x] T013 [US1] Validate time fields before submission — omit `schedule` when times are empty in `src/components/groups/detail/EditGroupDialog.tsx` (FR-006)
- [x] T014 [US1] Add default "Select an instructor..." option to instructor select in `src/components/groups/detail/EditGroupDialog.tsx` (FR-007)
- [x] T015 [US1] Add `useEffect` to sync schedule fields when `initialData` changes in `src/components/groups/GroupForm.tsx` (FR-008)

**Checkpoint**: All 6 runtime bugs fixed. Groups feature displays correct data, forms validate properly, and cache invalidates after mutations.

---

## Phase 4: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Remove 6 dead components, 8 dead API functions, 4 dead types, 1 dead hook, 1 empty utility file, and 1 dead test file.

**Independent Test**: Run `npm run build` and `npm run lint` — both pass with zero errors. Verify no import errors remain.

### Implementation for User Story 2

- [x] T016 [US2] Delete `src/tests/GroupsTable.test.tsx` (references non-existent component) (FR-009)
- [x] T017 [US2] Delete `src/components/groups/GroupHeader.tsx` (zero consumers) (FR-009)
- [x] T018 [US2] Delete `src/components/groups/history/CoursesHistoryTable.tsx` (zero consumers) (FR-009)
- [x] T019 [US2] Delete `src/components/groups/history/HistoryStats.tsx` (zero consumers) (FR-009)
- [x] T020 [US2] Delete `src/components/groups/history/EnrollmentHistoryTable.tsx` (zero consumers) (FR-009)
- [x] T021 [US2] Delete `src/components/groups/history/InstructorHistoryTable.tsx` (zero consumers) (FR-009)
- [x] T022 [US2] Update barrel file `src/components/groups/history/index.ts` to remove deleted exports (FR-009)
- [x] T023 [US2] Delete `src/api/academics/groups/utils.ts` (empty file) (FR-009)
- [x] T024 [US2] Remove unused `getGroupDetails`, `getGroups`, `getGroupsPaginated` from `src/api/academics/groups/core.ts` and barrel `src/api/academics/groups/index.ts` (FR-009)
- [x] T025 [US2] Remove unused `getGroupEnrollmentHistory`, `getGroupInstructorHistory`, `getGroupLevel`, `completeGroupLevel`, `cancelGroupLevel`, `getGroupEnrollmentAnalytics` from `src/api/academics/groups/lifecycle.ts` and barrel (FR-009)
- [x] T026 [US2] Remove unused `deleteGroupLevel` from `src/api/academics/groups/newEndpoints.ts` and barrel (FR-009)
- [x] T027 [US2] Remove unused `useGroupsByType` from `src/hooks/useGroupQueries.ts` and its queryKey factory (FR-009)
- [x] T028 [US2] Remove unused types `GroupListItem`, `ProgressLevel` from `src/api/academics/types/groups/models.ts` and barrel (FR-009)
- [x] T029 [US2] Remove unused type `CancelLevelInput` from `src/api/academics/types/groups/inputs.ts` and barrel (FR-009)
- [x] T030 [US2] Remove unused type `CreateNewLevelInput` from `src/api/academics/types/groups/lifecycle.ts` and barrel (FR-009)
- [x] T031 [US2] Remove unused `scheduleToForm` function from `src/utils/scheduleTransform.ts` (FR-025)
- [x] T032 [US2] Remove unused `groupId` prop from `LevelsTabProps` interface and component in `src/components/groups/LevelsTab.tsx` (FR-009)
- [x] T033 [US2] Remove unused `groupId` prop from `PaymentsTabProps` interface in `src/components/groups/PaymentsTab.tsx` (FR-009)

**Checkpoint**: Dead code removed. Build and lint pass cleanly.

---

## Phase 5: User Story 3 — Fix TypeScript Quality Issues (Priority: P2)

**Goal**: Eliminate all `as any` casts and unsafe type assertions in the groups feature.

**Independent Test**: Run `tsc --noEmit` and `npm run lint` — zero `@typescript-eslint/no-explicit-any` warnings.

### Implementation for User Story 3

- [x] T034 [US3] Replace `as any` with proper union type `'active' | 'inactive' | 'completed' | undefined` for search status param in `src/hooks/useGroupQueries.ts` (FR-010)
- [x] T035 [US3] Replace `selectedGroup as any` with proper type transformation from `EnrichedGroupPublic` to `GroupForm` initial data shape in `src/pages/GroupsPage.tsx` (FR-010)
- [x] T036 [US3] Create `getErrorMessage` type guard function and replace `as Error` casts in `src/hooks/useGroupMutations.ts` (FR-011)
- [x] T037 [US3] Fix unsafe `as Schedule` cast in `GroupForm.tsx` by using proper type narrowing for schedule field initialization (FR-010)

**Checkpoint**: All `as any` casts eliminated. TypeScript strict mode fully enforced.

---

## Phase 6: User Story 4 — Fix Data Fetching & Cache Patterns (Priority: P3)

**Goal**: Reduce initial page load requests from 8+ to 4, and ensure complete cache invalidation after mutations.

**Independent Test**: Monitor network requests in browser dev tools on GroupDetailPage load. Verify only 4 requests fire. Switch tabs and verify deferred requests fire. Mutate data and verify all related caches invalidate.

### Implementation for User Story 4

- [x] T038 [US4] Add `enabled` parameter to `useGroupEnrollments` hook in `src/hooks/useGroupEnrollments.ts` with default `true` (FR-012)
- [x] T039 [US4] Add `enabled` parameter to `useGroupPayments` hook in `src/hooks/useGroupPayments.ts` with default `true` (FR-012)
- [x] T040 [US4] Pass `enabled: activeTab === 'students'` to `useGroupEnrollments` in `src/pages/GroupDetailPage.tsx` (FR-012)
- [x] T041 [US4] Pass `enabled: activeTab === 'payments'` to `useGroupPayments` in `src/pages/GroupDetailPage.tsx` (FR-012)
- [x] T042 [US4] Expand `invalidateGroups` to include `groupLevels`, `groupSessions`, `groupEnrollments`, `groupPayments` in `src/hooks/useGroupMutations.ts` (FR-013)
- [x] T043 [US4] Migrate `generateSessions` from plain async to `useMutation` with `onSuccess` invalidating `groupSessions` and `groupLevels` in `src/hooks/useGroupDetail.ts` (FR-014)

**Checkpoint**: GroupDetailPage loads with 4 requests. All mutations invalidate complete cache set.

---

## Phase 7: User Story 5 — Improve Accessibility (Priority: P3)

**Goal**: Add focus traps, keyboard navigation, ARIA labels, and proper label-input associations across all groups feature components.

**Independent Test**: Navigate entire groups feature using only keyboard (Tab, Enter, Space, Arrow keys). Verify screen reader announces all interactive elements correctly. Verify focus cannot escape dialogs.

### Implementation for User Story 5

- [ ] T044 [US5] Add focus trap `useEffect` with Tab key cycling to `EditGroupDialog` in `src/components/groups/detail/EditGroupDialog.tsx` (FR-015)
- [ ] T045 [US5] Add focus return to trigger element on close in `EditGroupDialog` using `useRef` (FR-016)
- [ ] T046 [US5] Add focus trap `useEffect` with Tab key cycling to `ProgressLevelDialog` in `src/components/groups/detail/ProgressLevelDialog.tsx` (FR-015)
- [ ] T047 [US5] Add focus return to trigger element on close in `ProgressLevelDialog` using `useRef` (FR-016)
- [ ] T048 [US5] Add `aria-label="Close dialog"` to close button in `EditGroupDialog` (FR-021)
- [ ] T049 [US5] Add `aria-label="Close dialog"` to close button in `ProgressLevelDialog` (FR-021)
- [ ] T050 [US5] Add `htmlFor`/`id` associations to all form inputs in `EditGroupDialog` (FR-021)
- [ ] T051 [US5] Add `htmlFor`/`id` associations to all form inputs in `ProgressLevelDialog` (FR-021)
- [ ] T052 [US5] Add `handleKeyDown` with ArrowLeft/Right/Home/End to `TabNavigation` in `src/components/groups/TabNavigation.tsx` (FR-017)
- [ ] T053 [US5] Add `id` and `aria-controls` to tab buttons in `TabNavigation` (FR-021)
- [ ] T054 [US5] Add `handleKeyDown` with ArrowLeft/Right/Home/End to `GroupCategoryTabs` in `src/components/groups/GroupCategoryTabs.tsx` (FR-017)
- [ ] T055 [US5] Add `id` and `aria-controls` to tab buttons in `GroupCategoryTabs` (FR-021)
- [ ] T056 [US5] Add `handleKeyDown` with ArrowLeft/Right/Home/End to `GroupBySelector` in `src/components/groups/GroupBySelector.tsx` (FR-017)
- [ ] T057 [US5] Add `role="button"`, `tabIndex={0}`, and `onKeyDown` (Enter/Space) to `GroupCard` in `src/components/groups/GroupCard.tsx` (FR-018)
- [ ] T058 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/groups/GroupCard.tsx` (FR-019)
- [ ] T059 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/groups/GroupCardGrid.tsx` (FR-019)
- [ ] T060 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/groups/GroupColumns.tsx` (FR-019)
- [ ] T061 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/groups/GroupForm.tsx` (FR-019)
- [ ] T062 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/groups/GroupHeader.tsx` (if not deleted) (FR-019)
- [ ] T063 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/GroupsPage.tsx` (FR-019)
- [ ] T064 [P] [US5] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/GroupDetailPage.tsx` (FR-019)
- [ ] T065 [P] [US5] Add `aria-label` to time selects (hour, minute, period × 2) in `src/components/groups/GroupForm.tsx` (FR-020)
- [ ] T066 [US5] Add `aria-label` and `aria-expanded` to expand/collapse button in `src/components/groups/PaymentsTab.tsx` (FR-020)
- [ ] T067 [US5] Convert div with onClick to `<button>` with `aria-expanded` in `src/components/groups/PaymentsTab.tsx` (FR-018)
- [ ] T068 [US5] Convert div with onClick to `<button>` with `aria-expanded` in `src/components/groups/LevelsTab.tsx` (FR-018)
- [ ] T069 [US5] Add `htmlFor`/`id` to textarea label in `src/components/groups/detail/GroupInfoCard.tsx` (FR-021)
- [ ] T070 [US5] Add `aria-hidden="true"` to status dot in `src/components/groups/shared/GroupStatusBadge.tsx` (FR-019)

**Checkpoint**: Full keyboard navigation, focus traps, and screen reader support across all groups components.

---

## Phase 8: User Story 6 — Polish UX & Code Quality (Priority: P4)

**Goal**: Fix status icons, add per-tab ErrorBoundaries, optimize rendering, and fix test assertions.

**Independent Test**: Visual inspection of status icons. Crash individual tabs to verify ErrorBoundary isolation. Run test suite to verify all tests pass.

### Tests for User Story 6

- [ ] T071 [US6] Fix `useGroups.test.ts` — replace invalid `'max_capacity'` sort field with `'name'` in `src/tests/useGroups.test.ts` (FR-027)

### Implementation for User Story 6

- [ ] T072 [US6] Replace `AlertCircle` with `CheckCircle` for 'active' status in `src/components/groups/LevelsTab.tsx` (FR-023)
- [ ] T073 [US6] Wrap each tab content in its own `ErrorBoundary` in `src/pages/GroupDetailPage.tsx` (FR-022)
- [ ] T074 [US6] Hoist `findIndex` computation outside `.map()` in `src/components/groups/detail/LevelSelector.tsx` (FR-024)
- [ ] T075 [US6] Move `formatDate` function after imports in `src/components/groups/history/EnrollmentHistoryTable.tsx` (if not deleted) (FR-009)
- [ ] T076 [US6] Move `StudentWithEnrollment` type to module scope in `src/components/groups/StudentsTab.tsx` (FR-009)
- [ ] T077 [US6] Remove excessive `as const` assertions on inline action objects in `src/components/groups/GroupCard.tsx` (FR-009)
- [ ] T078 [US6] Remove unused `Session` import from `src/components/groups/AttendanceTab.tsx` (FR-009)

**Checkpoint**: All polish items complete. Visual consistency, error isolation, and test correctness verified.

---

## Phase 9: Verification & Build Gates

**Purpose**: Final validation that all 68 audit findings are resolved and build gates pass.

- [ ] T079 Run `npx tsc --noEmit --project tsconfig.app.json` and verify zero errors
- [ ] T080 Run `npm run lint` and verify zero feature-related errors
- [ ] T081 Run `npm run build` and verify `tsc -b && vite build` succeeds
- [ ] T082 Run `npm run test` and verify all tests pass
- [ ] T083 Verify zero `as any` casts remain: `rg ': any' src/components/groups/ src/hooks/useGroup*.ts`
- [ ] T084 Verify zero dead code remains: `rg 'GroupHeader|CoursesHistoryTable|HistoryStats|EnrollmentHistoryTable|InstructorHistoryTable' src/`
- [ ] T085 Verify zero `console.log` statements remain: `rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion.
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion. No dependency on US1.
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion. No dependency on US1/US2.
- **User Story 4 (Phase 6)**: Depends on Foundational (Phase 2) completion. No dependency on US1/US2/US3.
- **User Story 5 (Phase 7)**: Depends on Foundational (Phase 2) completion. No dependency on other stories.
- **User Story 6 (Phase 8)**: Depends on Foundational (Phase 2) completion. Some tasks depend on US2 (deleted files).
- **Verification (Phase 9)**: Depends on all user story phases being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P2)**: Can start after Phase 2 — Independent of US1
- **US3 (P2)**: Can start after Phase 2 — Independent of US1/US2
- **US4 (P3)**: Can start after Phase 2 — Independent of US1/US2/US3
- **US5 (P3)**: Can start after Phase 2 — Independent of other stories
- **US6 (P4)**: Can start after Phase 2 — T075 depends on US2 file deletions

### Within Each User Story

- Type/utility fixes before component fixes
- Component fixes before page assembly
- Accessibility fixes can run in parallel within a story
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks (T001–T007) can run in parallel
- All US2 dead code deletions (T016–T033) can run in parallel<think>
- All US5 `aria-hidden` additions (T058–T064) can run in parallel
- US1, US2, US3, US4, US5 can all start in parallel after Phase 2
- US6 can start in parallel except T075 which waits for US2

---

## Parallel Example: Foundational Phase

```bash
# Launch all foundational tasks together:
Task: "Add ScheduleInput interface to src/api/academics/types/groups/models.ts"
Task: "Export ScheduleInput from src/api/academics/types/groups/index.ts"
Task: "Update ScheduleGroupInput.schedule to use ScheduleInput in src/api/academics/types/groups/inputs.ts"
Task: "Update formToSchedule to return ScheduleInput in src/utils/scheduleTransform.ts"
Task: "Add RawEnrichedGroupPublic type in src/api/academics/types/groups/models.ts"
Task: "Fix normalizeEnrichedGroup in src/api/academics/groups/core.ts"
Task: "Add fallback current_student_count in src/api/academics/groups/core.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 3: User Story 1 (runtime bug fixes)
3. **STOP and VALIDATE**: Verify all 6 runtime bugs are fixed
4. Run `npm run build` and `npm run lint` to ensure no regressions

### Incremental Delivery

1. Complete Foundational → Type system aligned
2. Add User Story 1 → Runtime bugs fixed → Test independently
3. Add User Story 2 → Dead code removed → Build passes cleanly
4. Add User Story 3 → TypeScript quality fixed → Zero `as any` casts
5. Add User Story 4 → Data fetching optimized → 4 requests on load
6. Add User Story 5 → Accessibility complete → Keyboard navigation works
7. Add User Story 6 → Polish complete → Visual consistency verified
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (runtime bugs)
   - Developer B: User Story 2 (dead code)
   - Developer C: User Story 3 (TypeScript quality)
   - Developer D: User Story 4 (data fetching)
   - Developer E: User Story 5 (accessibility)
   - Developer F: User Story 6 (polish)
3. Stories complete and integrate independently
4. Phase 9: Verification — all developers run build gates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US2 deletions should be verified with `npm run build` before proceeding to dependent tasks
- US5 accessibility tasks should be tested with keyboard-only navigation after each batch
