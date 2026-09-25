# Tasks: Groups Audit & Fix

**Input**: Design documents from `/specs/042-groups-audit/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested. No test tasks.

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
  - Pages: `src/pages/`
  - Types: `src/api/{domain}/types/`
  - Tests: `src/tests/`

---

## Phase 1: Foundational — Dead Code Removal (US2)

**Purpose**: Delete unused files before modifying any remaining code. Avoids wasting effort on files that will be deleted.

**Independent Test**: Run `git diff --stat` — 4 files listed as deleted. `npm run build` passes. No remaining references to deleted exports.

- [ ] T001 [P] [US2] Delete `src/components/groups/detail/LevelStudentsPanel.tsx` — never imported anywhere
- [ ] T002 [P] [US2] Delete `src/components/groups/detail/TransferDialog.tsx` — only imported by dead LevelStudentsPanel
- [ ] T003 [P] [US2] Delete `src/components/groups/TabNavigation.tsx` — never imported; GroupDetailPage uses inline tabs
- [ ] T004 [P] [US2] Delete `src/hooks/useGroupEnrollments.ts` — only imported by dead LevelStudentsPanel
- [ ] T005 [P] [US2] Remove dead `invalidateGroupsExtended` function in `src/hooks/useGroupMutations.ts` — never called; `invalidateGroups` already covers all needed keys
- [ ] T006 [P] [US2] Remove dead barrel export entries in `src/components/groups/detail/index.ts` — remove exports for LevelStudentsPanel and TransferDialog
- [ ] T007 [P] [US2] Remove dead barrel export entries in `src/components/groups/index.ts` — remove export for TabNavigation
- [ ] T008 [P] [US2] Remove dead barrel export in `src/hooks/index.ts` or `src/hooks/useGroupEnrollments.ts` import lines — clean up any remaining references

**Checkpoint**: Foundation ready — dead code cleaned up. No build errors. All remaining files have real consumers.

---

## Phase 2: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix the `useUpdateGroup` DTO mismatch (capacity/schedule edits silently fail) and add `'archived'` to the Group status type.

**Independent Test**: 
1. Edit a group's capacity from GroupsPage list view — verify the API receives `max_capacity` (not `capacity`) and `default_day`/`default_time_start`/`default_time_end` (not nested `schedule`).
2. Build typecheck passes with `'archived'` in Group.status union.

- [ ] T009 [US1] Fix `Group.status` type in `src/api/academics/types/groups/models.ts` — add `'archived'` to the union: `status: 'active' | 'inactive' | 'archived' | 'completed'`
- [ ] T010 [US1] Fix `EnrichedGroupPublic.status` type in `src/api/academics/types/groups/models.ts` — add `'archived'` to the union
- [ ] T011 [US1] Remove standalone `useUpdateGroup` mutation from `src/hooks/useGroupQueries.ts` — delete `useUpdateGroup`, `useCreateGroup`, `useDeleteGroup`, and `useGroupInvalidator` functions; keep only query functions
- [ ] T012 [US1] Update `src/pages/GroupsPage.tsx` to import and use `useGroupMutations` instead of `useCreateGroup`/`useUpdateGroup`/`useDeleteGroup` from `useGroupQueries` — wrap `useGroupMutations` with groupId or adjust calls to pass groupId as parameter

**Checkpoint**: Group edits from the list page correctly send DTO fields. Status type includes `'archived'`. `npm run build` passes.

---

## Phase 3: User Story 3 — Fix TypeScript & Code Quality (Priority: P2)

**Goal**: Fix shadowed `formatDate`, exposed error queries, missing return types, non-null assertion, and type assertion issues.

**Independent Test**: `npm run build` passes with zero type errors. All hooks have explicit return types.

- [ ] T013 [P] [US3] Remove shadowed local `formatDate` in `src/components/groups/LevelsTab.tsx` — delete local `const formatDate = ...` function; replace its usages with the imported `formatDate` from `src/utils/formatting.ts` with null-safe calls (`formatDate(value) ?? 'N/A'`)
- [ ] T014 [P] [US3] Surface error from levels query in `src/hooks/useGroupDetail.ts` — add `error: levelsError` to the levels `useQuery` destructuring on line 43
- [ ] T015 [P] [US3] Surface error from sessions query in `src/hooks/useGroupDetail.ts` — add `error: sessionsError` to the sessions `useQuery` destructuring on line 50
- [ ] T016 [US3] Combine errors in `src/hooks/useGroupDetail.ts` line 62 — change `const error = groupError instanceof Error ? groupError.message : null` to aggregate all three errors: `[groupError, levelsError, sessionsError].find(e => e instanceof Error)?.message ?? null`
- [ ] T017 [P] [US3] Add explicit return type to `useGroupHistory` in `src/hooks/useGroupHistory.ts` — define and export `UseGroupHistoryReturn` interface, annotate the function return type
- [ ] T018 [P] [US3] Add explicit return type to `useRecentGroups` in `src/hooks/useRecentGroups.ts` — annotate return type as `{ recentGroupIds: number[]; addRecentGroup: (groupId: number) => void }`
- [ ] T019 [P] [US3] Add explicit return type to `useGroupAttendance` in `src/hooks/useGroupAttendance.ts` — define `UseGroupAttendanceReturn` interface, annotate the function return type
- [ ] T020 [US3] Replace non-null assertion `groupBy!` in `src/hooks/useGroups.ts` line 62 — use type narrowing or `as` cast: `groupBy as Exclude<GroupByField, null | undefined>`
- [ ] T021 [US3] Fix type assertion in `src/components/groups/detail/EditGroupDialog.tsx` line 220 — add `'archived'` to the union: `s as 'active' | 'inactive' | 'archived' | 'completed'`

**Checkpoint**: All TypeScript violations resolved. `npm run build` passes cleanly.

---

## Phase 4: User Story 4 — Fix Data Fetching & Cache Patterns (Priority: P3)

**Goal**: Consolidate duplicate mutation logic, add `enabled` guard, fix cache key sentinel.

**Independent Test**: `useGroupMutations.ts` no longer has duplicate invalidation logic. `useProgressLevelForm` queries don't fire when dialog is closed. `useGroupAttendance` cache key uses `-1` sentinel for null levelNumber.

- [ ] T022 [US4] Consolidate mutation hooks — delete the standalone `useCreateGroup`/`useUpdateGroup`/`useDeleteGroup` exports from `src/hooks/useGroupQueries.ts` (already done in T011); verify `src/pages/GroupsPage.tsx` correctly delegates to `useGroupMutations` after T012
- [ ] T023 [US4] Add `enabled` guard to courses/employees queries in `src/hooks/useProgressLevelForm.ts` — accept an `enabled` parameter and pass it to the `useQuery` calls' `enabled` option
- [ ] T024 [US4] Fix cache key sentinel in `src/hooks/useGroupAttendance.ts` line 21 — change `levelNumber ?? 0` to `levelNumber ?? -1` to avoid cache collision with a valid level 0

**Checkpoint**: No duplicate mutation implementations. Queries with conditional dependencies are properly guarded. Cache keys don't collide.

---

## Phase 5: User Story 5 — Fix Accessibility & UX Polish (Priority: P4)

**Goal**: Add `aria-hidden` to decorative icons, `role="status"` to empty states.

**Independent Test**: Screen reader does not announce decorative icons. Empty states are announced as live regions.

- [ ] T025 [P] [US5] Add `aria-hidden="true"` to the `add` Material Symbol in `src/components/groups/detail/LevelSelector.tsx` line 59
- [ ] T026 [P] [US5] Add `aria-hidden="true"` to the `school` Material Symbol in `src/components/groups/HistoryTab.tsx` line 176
- [ ] T027 [P] [US5] Add `aria-hidden="true"` to the decorative status dot in `src/components/groups/GroupColumns.tsx` line 70
- [ ] T028 [P] [US5] Add `role="status"` to the empty state `div` in `src/components/groups/GroupCardGrid.tsx` line 35
- [ ] T029 [P] [US5] Add `role="status"` to the empty state `div` in `src/pages/GroupsPage.tsx` line 347

**Checkpoint**: All icons have `aria-hidden`, all empty states have `role="status"`.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T030 Run `npm run build` (`tsc -b && vite build`) — verify zero errors from all changes
- [ ] T031 Run `npm run lint` — verify zero ESLint errors in modified files
- [ ] T032 Final review of all modified files for any remaining issues (import cleanups, unused variables)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — DELETE dead code first
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion — fixes runtime bugs
- **User Story 3 (Phase 3)**: Depends on Phase 1 completion — TypeScript fixes on remaining files
- **User Story 4 (Phase 4)**: Depends on Phase 2 completion — mutation consolidation depends on DTO fix
- **User Story 5 (Phase 5)**: Depends on Phase 1 completion — a11y fixes on remaining files
- **Polish (Phase 6)**: Depends on all phases

### User Story Dependencies

- **Phase 2 (US1 - P1)**: Can start after Phase 1 — DTO fix, status type
- **Phase 3 (US3 - P2)**: Can start after Phase 1 — no dependency on US1
- **Phase 4 (US4 - P3)**: Depends on US1 (T011/T012 — mutation consolidation needs useGroupQueries cleanup)
- **Phase 5 (US5 - P4)**: Can start after Phase 1 — no dependency on US1/US3/US4

### Within Each Phase

- Tasks marked [P] within a phase can run in parallel
- Tasks without [P] are sequential (depend on prior task in same phase)

### Parallel Opportunities

- T001-T008: All dead code deletions can run in parallel (Phase 1)
- T009-T010: Type fixes can run in parallel (Phase 2)
- T013-T015, T017-T019: Can run in parallel (Phase 3)
- T025-T029: All a11y fixes can run in parallel (Phase 5)

---

## Parallel Example: Phase 1 (Dead Code Deletion)

```bash
# Delete all 4 dead components simultaneously:
Task: "Delete src/components/groups/detail/LevelStudentsPanel.tsx"
Task: "Delete src/components/groups/detail/TransferDialog.tsx"
Task: "Delete src/components/groups/TabNavigation.tsx"
Task: "Delete src/hooks/useGroupEnrollments.ts"
```

## Parallel Example: Phase 5 (Accessibility)

```bash
# All a11y fixes are independent:
Task: "Add aria-hidden to LevelSelector.tsx icon"
Task: "Add aria-hidden to HistoryTab.tsx icon"
Task: "Add aria-hidden to GroupColumns.tsx status dot"
Task: "Add role=status to GroupCardGrid.tsx empty state"
Task: "Add role=status to GroupsPage.tsx empty state"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Dead code removal (all 8 tasks)
2. Complete Phase 2: US1 — Fix runtime bugs (DTO + status type)
3. **STOP and VALIDATE**: `npm run build`, verify group edits work correctly
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 → Foundation: dead code cleaned
2. + Phase 2 → MVP: runtime bugs fixed
3. + Phase 3 → TypeScript quality improved
4. + Phase 4 → Data fetching patterns aligned
5. + Phase 5 → Accessibility improved
6. Each phase adds value without breaking previous work

### Parallel Team Strategy

With multiple developers:
1. Complete Phase 1 together
2. Developer A: Phase 2 (US1) + Phase 4 (US4 — depends on US1)
3. Developer B: Phase 3 (US3 — independent of US1)
4. Developer C: Phase 5 (US5 — independent of other phases)
5. PHPase 6 together at the end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Stop at any checkpoint to validate story independently
- All tasks are frontend-only — no backend changes
