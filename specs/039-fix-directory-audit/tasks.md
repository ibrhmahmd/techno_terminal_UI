# Tasks: Fix Directory Audit

**Input**: Design documents from `/specs/039-fix-directory-audit/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Tests**: Not requested — this is a code audit fix, not a new feature.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- All changes are within existing files in `src/pages/`, `src/components/directory/`, `src/hooks/`, and `src/api/crm/`.

---

## Phase 1: Setup

**Purpose**: Verify current state and prepare for changes

- [X] T001 Run `npm run build` and `npm run lint` to establish baseline — verify zero errors before changes
- [X] T002 [P] Read spec.md and plan.md to confirm all 40 audit findings for implementation reference

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dead code removal that unblocks type and import restructuring

**⚠️ CRITICAL**: Complete before any user story that touches affected files

- [X] T003 [P] Remove unused `getStudentStatusSummary` and `getStudentsByStatus` from `src/api/crm/students/status.ts`
- [X] T004 [P] Remove unused `linkSibling` and `unlinkSibling` from `src/api/crm/students/siblings.ts`
- [X] T005 [P] Remove unused `formatStudentDisplay`, `hasOutstandingBalance`, `getBalanceDisplay`, and `getStatusColorClass` from `src/api/crm/students/utils.ts`
- [X] T006 [P] Remove unused `getCompetitionHistory` from `src/api/crm/students/activity.ts`
- [X] T007 Remove dead re-exports from barrel file `src/api/crm/students/index.ts` (remove entries for: `getStudentStatusSummary`, `getStudentsByStatus`, `getCompetitionHistory`, `linkSibling`, `unlinkSibling`, `formatStudentDisplay`, `hasOutstandingBalance`, `getBalanceDisplay`, `getStatusColorClass`)
- [X] T008 Run `npm run build && npm run lint` to verify dead code removal passes

---

## Phase 3: User Story 1 — Pagination is correct (Priority: P1) 🎯 MVP

**Goal**: Fix the `totalStudents` calculation so pagination page count is accurate when waiting students span multiple pages.

**Independent Test**: Navigate through students pages — the total page count should be consistent regardless of waiting student distribution across pages.

- [X] T009 [P] [US1] Fix `totalStudents` calculation in `src/hooks/directory/useDirectoryData.ts` — remove `- waitingStudents.length` subtraction from the total calculation
- [X] T010 [P] [US1] Fix `waitingStudents` derivation in `src/hooks/directory/useDirectoryData.ts` — add comment noting it's derived from current page data
- [X] T011 [US1] Remove redundant `displayStudents` filter in `src/hooks/directory/useDirectoryData.ts` — return `students` directly; API results already filtered
- [X] T012 [US1] Remove redundant `displayStudents` second filter in `src/pages/DirectoryPage.tsx` — replace with `students` directly

**Checkpoint**: Pagination shows correct page counts. Build passes.

---

## Phase 4: User Story 2 — Edit student works reliably (Priority: P1)

**Goal**: Proper error handling in edit flow and correct cache invalidation order.

**Independent Test**: Edit a student with an invalid value — the error toast should show a descriptive message, not a generic error.

- [X] T013 [P] [US2] Fix `handleEditStudent` catch block in `src/components/directory/hooks/useStudentActions.ts` — add error parameter and parse validation errors from API response (match pattern from `handleCreateStudent`)
- [X] T014 [US2] Fix cache invalidation order in `handleEditStudent` in `src/components/directory/hooks/useStudentActions.ts` — move `invalidateQueries` call to AFTER all follow-up mutations complete

**Checkpoint**: Edit student shows proper error messages. Build passes.

---

## Phase 5: User Story 3 — Create parent works reliably (Priority: P1)

**Goal**: Prevent unhandled promise rejection when parent creation fails.

**Independent Test**: Trigger a parent creation failure — the UI should catch the error and show a toast, not an unhandled rejection in console.

- [X] T015 [US3] Wrap `createParentMutation.mutateAsync` in try/catch in `handleCreateParent` in `src/pages/DirectoryPage.tsx` (line 167) to prevent unhandled promise rejection

**Checkpoint**: Parent creation errors are caught. Build passes.

---

## Phase 6: User Story 4 — Dead API code is removed (Priority: P2)

(Already covered in Phase 2 foundational tasks above.)

**Checkpoint**: Already verified after Phase 2.

---

## Phase 7: User Story 5 — TypeScript types are safe (Priority: P2)

**Goal**: Remove unsafe type casts and strengthen type narrowness.

**Independent Test**: TypeScript build (`tsc -b`) passes with zero type errors.

- [X] T016 [P] [US5] Fix `statusConfig` type in `src/components/directory/StudentCard.tsx` — change `Record<string, {…}>` to `Record<StudentStatus, {…}>`, import `StudentStatus` from `src/api/crm`
- [X] T017 [P] [US5] Replace unsafe axios error cast with `isAxiosError` in `src/components/directory/hooks/useStudentActions.ts` — import `isAxiosError` from `axios`, use it as type guard
- [X] T018 [P] [US5] Remove redundant type assertion `as 'status' | 'age'` in `src/hooks/directory/useDirectoryData.ts` (line 93) — ternary already narrows the type
- [X] T019 [P] [US5] Remove redundant type assertion `as 'status' | 'age'` in `src/hooks/directory/useDirectoryData.ts` (line 101) — ternary already narrows the type
- [X] T020 [P] [US5] Remove redundant type assertion `as 'none' | 'status' | 'age'` in `src/pages/DirectoryPage.tsx` — use `StudentGroupBy` type for state
- [X] T021 [US5] Remove unsafe `as unknown as StudentListItem` double cast on `StudentFilterItem` edit — widen `editingStudent` type to `StudentListItem | StudentFilterItem | null`

**Checkpoint**: All unsafe casts eliminated. Build passes.

---

## Phase 8: User Story 6 — Data fetching is efficient (Priority: P2)

**Goal**: Avoid unnecessary network requests and use centralized query keys.

**Independent Test**: Open browser DevTools Network tab — student search should NOT fire when on Parents or Advanced tabs. Parent search should NOT fire when on Students or Advanced tabs.

- [X] T022 [P] [US6] Add tab guard to `useStudentsSearch` in `src/hooks/directory/useDirectoryData.ts` — only enable when `activeTab` is `'students'` or `'waiting'`
- [X] T023 [P] [US6] Add tab guard to `useParentsSearch` in `src/hooks/directory/useDirectoryData.ts` — only enable when `activeTab` is `'parents'`
- [X] T024 [P] [US6] Add `coursesListSimple` query key to centralized factory in `src/hooks/queryKeys.ts`
- [X] T025 [P] [US6] Migrate inline query key `['courses', 'list-simple-filters']` in `src/components/directory/AdvancedSearchPanel.tsx` to use factory `queryKeys.coursesListSimple`
- [X] T026 [US6] Migrate inline query key `['directory', 'parents']` in `src/pages/DirectoryPage.tsx` to use `queryKeys.directory.parents.all`
- [X] T027 [P] [US6] Migrate inline query key `['directory', 'parents']` in `src/components/directory/hooks/useStudentActions.ts` to use factory
- [X] T028 [P] [US6] Migrate inline query key `['directory', 'parents']` in `src/components/directory/hooks/useStudentActions.ts` to use factory
- [X] T029 [P] [US6] Migrate inline query key `['directory', 'students']` in `src/hooks/useDirectory.ts` to use `queryKeys.directory.students.all`
- [X] T030 [US6] Narrow overly broad invalidation in `src/hooks/useDirectory.ts` — change `['students']` to `queryKeys.studentsGroupedAll`

**Checkpoint**: Network tab confirms no spurious requests. Build passes.

---

## Phase 9: User Story 7 — Keyboard navigation works (Priority: P3)

**Goal**: Student and parent cards are keyboard-accessible.

**Independent Test**: Tab to a student or parent card, press Enter — should navigate to the detail page.

- [X] T031 [P] [US7] Add `role="link"`, `tabIndex={0}`, and `onKeyDown` handler (Enter/Space) to `StudentCard` div in `src/components/directory/StudentCard.tsx`
- [X] T032 [P] [US7] Add `role="link"`, `tabIndex={0}`, and `onKeyDown` handler (Enter/Space) to `ParentCard` div in `src/components/directory/ParentCard.tsx`

**Checkpoint**: Cards are keyboard-activatable. Build passes.

---

## Phase 10: User Story 8 — Screen reader support is complete (Priority: P3)

**Goal**: All ARIA attributes are present and correct.

**Independent Test**: Run axe DevTools on the directory page — zero critical/medium a11y violations.

- [X] T033 [P] [US8] Add `aria-label="Student groups"` to the student groups tablist in `src/pages/DirectoryPage.tsx`
- [X] T034 [P] [US8] Add `aria-label="Waiting list groups"` to the waiting list tablist in `src/pages/DirectoryPage.tsx`
- [X] T035 [P] [US8] Add `aria-label="Filtered student groups"` to the filtered groups tablist in `src/pages/DirectoryPage.tsx`
- [X] T036 [P] [US8] Add `role="alert"` to the error state div in `src/pages/DirectoryPage.tsx`
- [X] T037 [P] [US8] Add `aria-hidden="true"` to CardSkeleton div in `src/components/directory/shared/CardSkeleton.tsx`
- [X] T038 [P] [US8] Add `aria-hidden="true"` to Material Symbols icon span in `src/components/directory/StudentGroupBySelector.tsx`

**Checkpoint**: axe DevTools passes. Build passes.

---

## Phase 11: User Story 9 — Filter actions have correct behavior (Priority: P1)

**Goal**: Parent creation error handling (already covered in US3) and deduplication of double-filter pattern (already covered in US1).

**Note**: This user story overlaps with US1 (duplicate filter removal) and US3 (parent creation try/catch). No additional tasks needed beyond T010, T011, T012, and T015.

- [X] T039 [US9] Verify that all filter-related fixes are complete: parent creation error handling (T015) and double-filter removal (T011, T012)

**Checkpoint**: Filter actions work correctly. Build passes.

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [X] T040 Run `npm run build` — verify zero TypeScript errors (✅ passes)
- [X] T041 Run `npm run lint` — verify zero lint errors (⚠️ all 39 pre-existing, none from changes)
- [X] T042 [P] Verify no remaining inline query keys in directory feature (✅ all migrated to factory keys)
- [X] T043 [P] Verify no remaining `as any` in directory feature (✅ zero found)
- [X] T044 [P] Verify no remaining `console.log` in directory feature (✅ zero found)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS US4
- **User Stories**: All depend on Phase 2 completion (shared dead code removal)
  - US1 (Phase 3): No dependencies on other stories — can proceed first
  - US2 (Phase 4): No dependencies on other stories — can proceed in parallel with US1, US3
  - US3 (Phase 5): No dependencies — can proceed in parallel
  - US5 (Phase 7): No dependencies — can proceed in parallel
  - US6 (Phase 8): Depends on US4 (dead code removal from barrel may affect imports)
  - US7 (Phase 9): No dependencies — can proceed in parallel
  - US8 (Phase 10): No dependencies — can proceed in parallel
  - US9 (Phase 11): Depends on US1 and US3 completion
- **Polish (Phase 12)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US3 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US4 (P2)**: Already covered in Phase 2
- **US5 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **US6 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **US7 (P3)**: Can start after Phase 2 — No dependencies on other stories
- **US8 (P3)**: Can start after Phase 2 — No dependencies on other stories
- **US9 (P1)**: Depends on US1 and US3

### Within Each User Story

- Each task within a story can be completed in any order if marked [P]
- Build and lint verification after each story

### Parallel Opportunities

- All Phase 2 tasks T003-T007 can run in parallel
- US1, US2, US3, US5, US6, US7, US8 can all proceed in parallel after Phase 2
- All [P]-marked tasks within a phase can run in parallel
- Verification tasks T042-T044 can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Fix totalStudents calculation (T009)"
Task: "Fix waitingStudents derivation (T010)"
```

## Parallel Example: User Stories 5 + 6 + 7 (all P2/P3, no dependencies)

```bash
# Launch together — different files, no cross-story dependencies:
Task: "Fix statusConfig type (T016)" + "Replace axios error cast (T017)"
Task: "Add tab guards to searches (T022, T023)"  
Task: "Add keyboard nav to cards (T031, T032)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only — Pagination fix)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (dead code removal)
3. Complete Phase 3: US1 (Pagination fix)
4. **STOP and VALIDATE**: Verify pagination is correct
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready
2. Add US1 (Pagination) → Test → Deploy
3. Add US2 (Edit student) → Test → Deploy
4. Add US3 (Create parent) → Test → Deploy
5. Add US5 + US6 (Types + Data fetching) → Test → Deploy
6. Add US7 + US8 (Accessibility) → Test → Deploy

### Recommended Implementation Order for a Single Developer

1. Phase 1 (Setup)
2. Phase 2 (Dead code removal) — safe, affects import structure
3. Phase 3 (US1 — Pagination) — P1 bug fix
4. Phase 4 (US2 — Edit student reliability) — P1 bug fix
5. Phase 5 (US3 — Create parent) — P1 bug fix
6. Phase 7 (US5 — TypeScript types) — P2 code quality
7. Phase 8 (US6 — Data fetching) — P2 performance
8. Phase 9 (US7 — Keyboard nav) — P3 accessibility
9. Phase 10 (US8 — Screen reader) — P3 accessibility
10. Phase 11 (US9 — Verification)
11. Phase 12 (Polish)
