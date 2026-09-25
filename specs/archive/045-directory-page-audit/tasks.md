# Tasks: Directory Page — Audit Fix

**Input**: Design documents from `specs/045-directory-page-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-layer.md, quickstart.md

**Tests**: Not requested. All changes verified via manual "Independent Test" procedures, `npm run build`, and `npm run lint`.

**Organization**: Tasks are grouped by user story in priority order (P1 → P2 → P3). Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- All modified files are existing — no new files need creation.

---

## Phase 1: Setup (Shared Infrastructure)

**Not needed** — project already exists. All work modifies or deletes existing files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Not needed** — no blocking infrastructure. Each user story can be implemented independently.

---

## Phase 3: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Three runtime bugs that degrade user experience — Enter key fires filters during typing, pagination shows wrong count on waiting tab, and edit flow runs 3 sequential API calls instead of parallel.

**Independent Test**: Open filter panel, type in instructor name field, press Enter — filters should NOT apply. Navigate to waiting tab — pagination should show waiting count, not parent count.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Add Enter key filter guard in `src/components/directory/AdvancedSearchPanel.tsx` — skip `onApply` when event target is INPUT/TEXTAREA/SELECT
- [ ] T002 [P] [US1] Fix waiting list pagination count in `src/pages/DirectoryPage.tsx` — derive `totalPages` and `totalRecords` from waiting list query separately from parent/student tab
- [ ] T003 [P] [US1] Parallelize edit saves in `src/components/directory/hooks/useStudentActions.ts` — replace sequential `await` calls with `Promise.allSettled`, map results to per-call success/error toasts

**Checkpoint**: Enter key no longer fires filters while typing. Waiting tab shows correct pagination. Edit saves run in parallel with per-call toasts.

---

## Phase 4: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Remove 4 dead code artifacts — 2 unused components, 1 duplicate API module, 1 unused query key.

**Independent Test**: Search `src/` for `StudentList` (component) and `ParentList` — zero results.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Delete dead component `src/components/crm/StudentList.tsx`
- [ ] T005 [P] [US2] Delete dead component `src/components/crm/ParentList.tsx`
- [ ] T006 [P] [US2] Delete duplicate API module `src/api/crm/students/finance.ts` and redirect any consumers to `src/api/finance/balance.ts`
- [ ] T007 [P] [US2] Remove `StudentList` and `ParentList` from barrel export in `src/components/crm/index.ts`
- [ ] T008 [P] [US2] Remove unused `all` query key from `src/hooks/useStudentsGrouped.ts`

**Checkpoint**: Zero dead code artifacts remain. No residual imports of deleted files.

---

## Phase 5: User Story 3 — Fix TypeScript Safety Violations (Priority: P2)

**Goal**: Replace 5 unsafe type casts with proper guards — eliminate `as unknown as` double assertions and unvalidated `as StudentListItem` casts.

**Independent Test**: Search for `as unknown as` and `as StudentListItem` in `DirectoryPage.tsx` — verify all are replaced with proper guards.

### Implementation for User Story 3

- [ ] T009 [P] [US3] Create `isStudentListItem(item: StudentListItem | StudentFilterItem): item is StudentListItem` type guard utility
- [ ] T010 [P] [US3] Create `toStudentListItem(filter: StudentFilterItem): StudentListItem` mapping function for converting filter items to list items
- [ ] T011 [US3] Replace unsafe casts in `src/pages/DirectoryPage.tsx` — use `isStudentListItem` guard and `toStudentListItem` mapper instead of `as unknown as StudentListItem` and `as StudentListItem`
- [ ] T012 [P] [US3] Validate `status` prop against `StudentStatus` union in `src/components/crm/StudentMobileCard.tsx` — add guard before using as index key
- [ ] T013 [P] [US3] Remove unnecessary `as Error | null` assertion in `src/hooks/useWaitingList.ts`

**Checkpoint**: Zero `as unknown as` or unsafe `as StudentListItem` casts remain. String-to-union status values are validated.

---

## Phase 6: User Story 4 — Fix Data Fetching & Cache Patterns (Priority: P2)

**Goal**: Centralize query keys, add enabled guard to waiting list, fix staleTime mismatch — eliminate stale cache data.

**Independent Test**: Create a student, enroll them, then navigate to the directory — the new student should appear without a manual refresh.

### Implementation for User Story 4

- [ ] T014 [P] [US4] Add `directory.waitingList` factory entries in `src/hooks/queryKeys.ts` — `waitingList.all` and `waitingList.list(params?)`
- [ ] T015 [US4] Refactor `src/hooks/useWaitingList.ts` — use centralized `queryKeys` factory, add `enabled` parameter, remove inline query key arrays
- [ ] T016 [US4] Replace inline `['directory', 'parents']` with `queryKeys.directory.parents.all` in `src/pages/DirectoryPage.tsx` create-parent mutation invalidation
- [ ] T017 [P] [US4] Fix `staleTime` in `src/hooks/useStudentsGrouped.ts` — change from 5 minutes to 3 minutes (3 * 60 * 1000)

**Checkpoint**: All directory query keys use centralized factory. Waiting list accepts `enabled` param. StaleTime is 3 min.

---

## Phase 7: User Story 5 — Fix Accessibility Gaps (Priority: P3)

**Goal**: 9 accessibility fixes — missing ARIA labels, keyboard navigation, and `aria-hidden` on icons.

**Independent Test**: Navigate the directory page tabs and group tabs using only the keyboard — all interactive controls should be reachable and operable.

### Implementation for User Story 5

- [ ] T018 [P] [US5] Add `aria-label="Search waiting list"` to search input and `aria-hidden="true"` to decorative Lucide icons in `src/components/crm/WaitingListPanel.tsx`
- [ ] T019 [P] [US5] Add `aria-hidden="true"` to decorative Lucide icons in `src/components/crm/WaitingStudentCard.tsx`
- [ ] T020 [P] [US5] Add `aria-hidden="true"` to decorative icons in `src/components/crm/StudentMobileCard.tsx`
- [ ] T021 [P] [US5] Add `aria-hidden="true"` to decorative Material Symbol icons in `src/components/crm/ParentMobileCard.tsx`
- [ ] T022 [US5] Add `role="tabpanel"` with `aria-labelledby` and implement keyboard tab navigation (ArrowLeft/ArrowRight/Home/End) for group tabs in `src/pages/DirectoryPage.tsx`

**Checkpoint**: All decorative icons hide from screen readers. Tab panels have correct ARIA roles. Keyboard navigation works for tabs.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify the entire feature works end-to-end and passes all build gates.

- [ ] T023 Run `npm run lint` and fix any feature-related errors
- [ ] T024 Run `npm run build` (`tsc -b && vite build`) and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 3)**: No dependencies — can start immediately
- **US2 (Phase 4)**: No dependencies — independent file operations
- **US3 (Phase 5)**: T011 (DirectoryPage.tsx) depends on T009 and T010 being complete; T012 and T013 are independent
- **US4 (Phase 6)**: T015 (useWaitingList.ts) and T016 (DirectoryPage.tsx) depend on T014 (queryKeys.ts) being added; T017 (useStudentsGrouped.ts) is independent
- **US5 (Phase 7)**: T022 (DirectoryPage.tsx) depends on US1 having not introduced conflicts in the same file area; other tasks are independent
- **Polish (Phase 8)**: Depends on all prior phases being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — can be done first
- **US2 (P2)**: No dependencies — independent from all other stories
- **US3 (P2)**: No story-level dependencies — but T011 modifies DirectoryPage.tsx which is also modified by T002 (US1) and T016 (US4) and T022 (US5); best done after US1
- **US4 (P2)**: No story-level dependencies — but T016 modifies DirectoryPage.tsx (same conflict noted above)
- **US5 (P3)**: No story-level dependencies — but T022 modifies DirectoryPage.tsx (same conflict)

### File Conflict Note

`src/pages/DirectoryPage.tsx` is modified by T002 (US1), T011 (US3), T016 (US4), and T022 (US5). To avoid merge conflicts, implement stories in priority order (US1 → US3 → US4 → US5) and apply changes to DirectoryPage.tsx sequentially within the same file.

### Within Each User Story

- Tasks marked [P] can run in parallel (different files, no dependencies)
- Tasks without [P] should be done sequentially
- Story complete before moving to next priority

### Parallel Opportunities

- **US1**: T001 (AdvancedSearchPanel), T002 (DirectoryPage), T003 (useStudentActions) — all different files, fully parallel
- **US2**: T004–T008 — all different file deletions, fully parallel
- **US3**: T009 (guard utility), T010 (mapper utility), T012 (StudentMobileCard), T013 (useWaitingList) — all different files, parallel; T011 (DirectoryPage) depends on T009+T010
- **US4**: T014 (queryKeys), T017 (useStudentsGrouped) — different files, parallel; T015 and T016 depend on T014
- **US5**: T018–T021 — all different components, fully parallel; T022 (DirectoryPage) is independent of those

---

## Parallel Example: User Story 1

```bash
# Launch all three tasks for US1 together:
Task: "Add Enter key guard in src/components/directory/AdvancedSearchPanel.tsx"
Task: "Fix waiting list pagination count in src/pages/DirectoryPage.tsx"
Task: "Parallelize edit saves in src/components/directory/hooks/useStudentActions.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (Runtime Bugs — P1)
2. **STOP and VALIDATE**: Test US1 independently — Enter key guard, pagination count, parallel saves
3. Run `npm run build` and `npm run lint`
4. Deploy/demo if ready

### Incremental Delivery

1. Add US1 (P1) → Test independently → Deploy/Demo (MVP!)
2. Add US2 (P2) → Test independently → Deploy/Demo
3. Add US3 (P2) → Test independently → Deploy/Demo
4. Add US4 (P2) → Test independently → Deploy/Demo
5. Add US5 (P3) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Single Implementer Strategy (LLM)

1. Implement US1 fully (all 3 tasks, can be done in parallel since files differ)
2. Implement US2 fully (all 5 tasks, parallel)
3. Implement US3: T009+T010 first, then apply T011 to DirectoryPage.tsx, then T012+T013
4. Implement US4: T014 first, then T015+T016+T017 (T017 is independent)
5. Implement US5: T018–T021 (parallel), then T022 (DirectoryPage.tsx — last edit to this file)
6. Run `npm run build` and `npm run lint`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests required — rely on manual verification + build gates
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- `src/pages/DirectoryPage.tsx` has edits from 4 different stories — apply changes sequentially, not in parallel
