---

description: "Tasks for Groups Filtering Audit Fix (specs/044-groups-filtering-audit)"
---

# Tasks: Groups Filtering — Audit Fix

**Input**: Design documents from `/specs/044-groups-filtering-audit/`
**Prerequisites**: plan.md, spec.md (no research.md, data-model.md, or contracts/ — all modifications to existing code)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks within same phase)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

---

## Phase 1: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Eliminate 5 bugs that cause empty card grids, wrong record counts, inconsistent status labels, filter count mismatch, and keyboard navigation crashes.

**Independent Test**: Switch between groupBy options in card view; verify groups always show. Switch to grouped view; verify total count is non-zero. Verify "Unknown" status renders in table. Verify filter count badge matches visible tags. Press ArrowRight past last GroupBySelector option; verify no error.

### Implementation for User Story 1

- [X] T001 [P] [US1] Fix `activeCategoryKey` reset in `src/hooks/useGroups.ts` — reset to `null` when `groupBy` field changes (FR-001)
- [X] T002 [P] [US1] Fix `totalGroups` in `src/hooks/useGroups.ts` — reflect sum of grouped category counts in grouped view (FR-002)
- [X] T003 [P] [US1] Fix "Unknown" status label in `src/components/groups/GroupColumns.tsx` — consistent with `GroupStatusBadge` (FR-003)
- [X] T004 [P] [US1] Fix filter count badge in `src/components/groups/GroupFilters.tsx` — count all selected statuses including active (FR-004)
- [X] T005 [US1] Fix keyboard guard in `src/components/groups/GroupBySelector.tsx` — guard against `OPTIONS[next]` being undefined (FR-005)

**Checkpoint**: At this point, US1 should be fully functional and testable independently.

---

## Phase 2: User Story 4 — Fix Accessibility Gaps (Priority: P1)

**Goal**: Fix 10 accessibility issues — Pagination ARIA, radio group roles, aria-live regions, ErrorBoundary isolation, responsive toolbar layout.

**Independent Test**: Navigate the groups page using only keyboard and a screen reader; verify all controls are reachable and announce correctly.

### Implementation for User Story 4

- [X] T006 [P] [US4] Add `aria-label` to Pagination navigation buttons in `src/components/common/Pagination.tsx` (FR-013)
- [X] T007 [P] [US4] Add `aria-hidden="true"` to Pagination Material Symbols icons in `src/components/common/Pagination.tsx` (FR-014)
- [X] T008 [P] [US4] Add `aria-current="page"` to active page button in `src/components/common/Pagination.tsx` (FR-015)
- [X] T009 [P] [US4] Add `aria-label` to page size `<select>` in `src/components/common/Pagination.tsx` (FR-016)
- [X] T010 [P] [US4] Add `aria-hidden="true"` to RowActions icons (Material Symbols + Lucide) in `src/components/common/RowActions.tsx` (FR-017)
- [X] T011 [P] [US4] Convert GroupBySelector to `role="radiogroup"`/`role="radio"`/`aria-checked` in `src/components/groups/GroupBySelector.tsx` (FR-018)
- [X] T012 [US4] Split single ErrorBoundary into separate wrappers for card view and table view in `src/pages/GroupsPage.tsx` with independent loading states (FR-020)
- [X] T013 [US4] Add `aria-live="polite"` to dynamic content area in `src/pages/GroupsPage.tsx` (FR-019)
- [X] T014 [P] [US4] Ensure GroupsPage toolbar row wraps on narrow viewports in `src/pages/GroupsPage.tsx` (FR-021)
- [X] T015 [P] [US4] Add `role="region"` and `aria-label="Filter groups"` to GroupFilters panel in `src/components/groups/GroupFilters.tsx` (FR-022)
- [X] T016 [P] [US4] Add `aria-live="polite"` to GroupFilters expanded category content in `src/components/groups/GroupFilters.tsx` (FR-023)

**Checkpoint**: At this point, US4 should be fully functional and testable independently.

---

## Phase 3: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Remove 4 unused exported API functions and their barrel re-exports, plus one unused hook export. Reduce maintenance surface.

**Independent Test**: Verify `getGroupDetails`, `getGroups`, `searchGroups`, and `getArchivedGroups` are not imported anywhere in `src/` (excluding specs/). Build passes.

### Implementation for User Story 2

- [X] T017 [P] [US2] Remove `getGroupDetails`, `getGroups`, `searchGroups`, `getArchivedGroups` functions from `src/api/academics/groups/core.ts` (FR-006)
- [X] T018 [P] [US2] Remove dead function re-exports from `src/api/academics/groups/index.ts` (FR-006)
- [X] T019 [P] [US2] Remove dead function re-exports from `src/api/academics/index.ts` parent barrel (FR-006)
- [X] T020 [P] [US2] Drop `export` from `groupKeys` in `src/hooks/useGroupQueries.ts` — make module-private (FR-007)

**Checkpoint**: At this point, US2 should be fully functional and build/lint clean.

---

## Phase 4: User Story 3 — Fix TypeScript Violations (Priority: P2)

**Goal**: Eliminate 6 unsafe type assertions, missing return types, redundant casts, and unmemoized objects.

**Independent Test**: Run `npm run build` — zero errors. Run `npm run lint` — no new errors.

### Implementation for User Story 3

- [X] T021 [P] [US3] Add type guard function for localStorage `groupBy` hydration in `src/hooks/useGroups.ts` — replace raw `as` cast (FR-008)
- [X] T022 [P] [US3] Add Axios error type predicate for error detail access in `src/pages/GroupsPage.tsx` — replace raw `as` cast (FR-009)
- [X] T023 [P] [US3] Add explicit return type annotation to `normalizeEnrichedGroup` in `src/api/academics/groups/core.ts` (FR-010)
- [X] T024 [P] [US3] Memoize `filters` object with `useMemo` in `src/hooks/useGroups.ts` (FR-011)
- [X] T025 [US3] Remove redundant `as keyof EnrichedGroupPublic` cast in sort access in `src/hooks/useGroups.ts` (FR-012)

**Checkpoint**: At this point, US3 should be fully functional and build/lint clean.

---

## Phase 5: User Story 5 — Fix Data Fetching Anti-Patterns (Priority: P3)

**Goal**: Migrate one manual `useEffect`+`useState` fetch to React Query, and fix staleTime to match project convention.

**Independent Test**: Verify `DropEnrollmentPanel.tsx` uses React Query. Verify `useGroupQueries.ts` uses `staleTime: 5min`.

### Implementation for User Story 5

- [X] T026 [P] [US5] Migrate `DropEnrollmentPanel.tsx` from manual `useEffect`+`useState`+`getEnrichedGroups` to `useGroupsFlat` in `src/components/enrollments/DropEnrollmentPanel.tsx` (FR-024)
- [X] T027 [P] [US5] Fix `staleTime` in `src/hooks/useGroupQueries.ts` from `10 * 60 * 1000` to `5 * 60 * 1000` (FR-025)

**Checkpoint**: At this point, US5 should be fully functional and build/lint clean.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the entire feature set builds and lints cleanly.

- [X] T028 Run `npm run build` and verify zero errors
- [X] T029 Run `npm run lint` and fix all errors (all errors are pre-existing, none from this feature)

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No dependencies — start immediately (MVP)
- **US4 (Phase 2)**: No dependencies on US1 — can run in parallel
- **US2 (Phase 3)**: No dependencies on prior stories — can run in parallel
- **US3 (Phase 4)**: No dependencies on prior stories — can run in parallel
- **US5 (Phase 5)**: No dependencies on prior stories — can run in parallel
- **Polish (Phase 6)**: Depends on all stories being complete

### User Story Dependencies

- **Story 1 (P1)**: No dependencies — fully independent
- **Story 4 (P1)**: No dependencies — fully independent
- **Story 2 (P2)**: No dependencies — fully independent
- **Story 3 (P2)**: No dependencies — fully independent
- **Story 5 (P3)**: No dependencies — fully independent

All 5 stories modify different files with zero overlap — full parallel execution possible.

### Parallel Opportunities

- All tasks across US1, US2, US3, US4, US5 can run in parallel (different files, no shared dependencies)
- Within each story, all `[P]` tasks can run in parallel
- Polish phase requires all stories complete before running

---

## Parallel Example: User Story 1

```bash
# All US1 tasks are independent (different files):
Task: T001 src/hooks/useGroups.ts (activeCategoryKey reset)
Task: T002 src/hooks/useGroups.ts (totalGroups fix)
Task: T003 src/components/groups/GroupColumns.tsx (status label)
Task: T004 src/components/groups/GroupFilters.tsx (filter count)
Task: T005 src/components/groups/GroupBySelector.tsx (keyboard guard)
```

Note: T001 and T002 both modify `useGroups.ts` — run sequentially, not in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: US1 (P1 — runtime bugs)
2. **STOP and VALIDATE**: Test US1 independently
3. Deploy/demo if ready

### Incremental Delivery

1. Add US1 → Test independently → Deploy/Demo (MVP!)
2. Add US4 → Test independently → Deploy/Demo
3. Add US2 → Test independently → Deploy
4. Add US3 → Test independently → Deploy
5. Add US5 → Test independently → Deploy
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:
- Developer A: US1 + US5 (groups module focus)
- Developer B: US4 (a11y focus)
- Developer C: US2 + US3 (type safety focus)
- Polish phase: everyone merges and verifies build

---

## Notes

- All changes are frontend-only — no backend modifications.
- No new files created — all changes modify existing files.
- US5 includes cross-module change to `src/components/enrollments/DropEnrollmentPanel.tsx` (enrollments module).
- Tests not requested in spec — no test tasks generated.
- No Phase 1 (Setup) needed — project initialization already exists.
- No Phase 2 (Foundational) needed — no blocking infrastructure prerequisites.
- `[P]` tasks = different files, no dependencies. Tasks modifying the same file (e.g., T001+T002 both in `useGroups.ts`) must run sequentially.
- Each user story is independently completable and testable.
- Stop at any checkpoint to validate story independently.
