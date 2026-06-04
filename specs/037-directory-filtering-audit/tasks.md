# Tasks: Directory Page Student Filtering Audit

## Phase 1: Setup

- [ ] T001 Disable `eslint-disable @typescript-eslint/no-explicit-any` in `src/pages/DirectoryPage.tsx` (temporarily re-enable during fix to keep build green, remove at end of US-06)

---

## Phase 2: Foundational (Cache & Query Key Infrastructure)

- [ ] T002 [US4] Move `directoryKeys` from `src/hooks/useDirectory.ts` into centralized `src/hooks/queryKeys.ts` under `queryKeys.directory` namespace
- [ ] T003 [US4] Update `useDirectory.ts` to import from centralized `queryKeys.directory` instead of local `directoryKeys`
- [ ] T004 [US4] Update `useStudentsGrouped.ts` to use `queryKeys.studentsGroupedByParams` that shares the `['students']` prefix with the directory keys
- [ ] T005 [US4] Update mutation invalidator in `useDirectory.ts` to invalidate `['students']` prefix (covers both directory list and grouped keys)
- [ ] T006 [US4] Add parent cache invalidation after `linkParentToStudent` in `src/components/directory/hooks/useStudentActions.ts`
- [ ] T007 [P] [US1] Add `filterParams` support to `getStudentsGrouped` API function in `src/api/crm/students/search.ts` — accept optional `StudentFilterParams` and forward as query params to `/crm/students/grouped`
- [ ] T008 [P] [US4] Update `useStudentsGrouped` hook in `src/hooks/useStudentsGrouped.ts` to accept optional `filterParams?: StudentFilterParams` and pass to API call

---

## Phase 3: US-01 — Advanced Search Grouped View Returns Filtered Data (P1)

- [ ] T009 [US1] Update `useDirectoryData.ts` to pass advanced filter params (`filterParams`, `filterGroupBy`, `filterPage`, `filterPageSize`) to the `useStudentsGrouped` call for the filtered grouped result
- [ ] T010 [US1] Update the `enabled` condition for filtered grouped query to include `filterParams` dependency
- [ ] T011 [US1] Fix `filteredGroupedData` transformation in `useDirectoryData.ts` to correctly type-cast response items (use proper mapping instead of `as StudentFilterItem[]`)

### Independent test criteria
- Open Advanced tab, apply filters (e.g., status=Active), click Apply (shows filtered list), switch group-by from None to Status → grouped cards match the same filtered count

---

## Phase 4: US-02 + US-03 — Group Key Reset & Fallback (P2)

- [ ] T012 [US2] Reset `activeStudentGroup` to `''` when `studentGroupBy` changes in `DirectoryPage.tsx` line ~285
- [ ] T013 [US2] Reset `activeFilterGroup` to `''` when `filterGroupBy` changes in `DirectoryPage.tsx` line ~694
- [ ] T014 [US2] Reset `activeStudentGroup` and `activeFilterGroup` in `handleTabChange` in `DirectoryPage.tsx`
- [ ] T015 [US3] Add key-existence validation in students grouped view (line ~384): if activeStudentGroup key not found in studentsGroupedData, fall back to first group
- [ ] T016 [US3] Add key-existence validation in waiting grouped view (line ~490): same pattern
- [ ] T017 [US3] Add key-existence validation in filtered grouped view (line ~767): same pattern

### Independent test criteria
- Switch group-by from Status to Age → active group shown is from the first age bucket, not empty
- Tab switch resets view to ungrouped/flat first group

---

## Phase 5: US-06 — Eliminate `as any` Type Violations (P3)

- [ ] T018 [US6] Add `grade?: string` and `has_unpaid_balance?: boolean` to `StudentListItem` type in `src/api/crm/students/types/models.ts`
- [ ] T019 [US6] Add `student_count?: number` to `ParentListItem` type; verify `phone_primary` exists (remove `phone_number` as any cast)
- [ ] T020 [US6] Fix `getParentsPaginated` return type in `src/api/crm/parents.ts` to match actual response (`PaginationResult<ParentListItem>` or add missing fields to Parent)
- [ ] T021 [US6] Replace all `(s as any).grade` with `s.grade` in `DirectoryPage.tsx` (6 occurrences)
- [ ] T022 [US6] Replace all `(s as any).has_unpaid_balance` with `s.has_unpaid_balance` in `DirectoryPage.tsx` (6 occurrences)
- [ ] T023 [US6] Replace `(p as any).phone_number` with `p.phone_primary` in `DirectoryPage.tsx`
- [ ] T024 [US6] Replace `(p as any).student_count` with `p.student_count` in `DirectoryPage.tsx`
- [ ] T025 [US6] Fix double `as unknown as StudentListItem` casts (2 occurrences in grouped views) — use typed union or add mapping function
- [ ] T026 [US6] Fix `s as StudentListItem` cast on `StudentFilterItem` in advanced filter grouped section — widen `setEditingStudent` param type to `StudentListItem | StudentFilterItem`
- [ ] T027 [US6] Remove the `eslint-disable @typescript-eslint/no-explicit-any` directive from line 1 of `DirectoryPage.tsx`

### Independent test criteria
- `npm run build` passes with zero TS errors
- No `as any` casts remain in `DirectoryPage.tsx`

---

## Phase 6: US-05 — Dead Code Removal (P4)

- [ ] T028 [P] [US5] Delete `src/hooks/useDirectorySearch.ts` (entire file, zero consumers)
- [ ] T029 [US5] Remove `searchStudentsAdvanced` function from `src/api/crm/students/search.ts` and its barrel re-export
- [ ] T030 [US5] Remove `StudentSearchFilters` interface from `src/api/crm/students/search.ts` and its barrel re-export
- [ ] T031 [US5] Remove `getParentById` function from `src/api/crm/students/core.ts` and its barrel re-export
- [ ] T032 [US5] Remove `STUDENT_GROUP_OPTIONS` and `WAITING_GROUP_OPTIONS` exports from `src/config/studentGrouping.ts`
- [ ] T033 [US5] Remove `getAgeBucket` and `formatAgeBucketLabel` exports from `src/config/studentGrouping.ts`
- [ ] T034 [US5] Remove `useCreateParent` hook from `src/hooks/useDirectory.ts`
- [ ] T035 [P] [US5] Remove `updateBucket` and `setAgeBuckets` methods from `src/store/groupingSettingsStore.ts`
- [ ] T036 [US5] Delete `src/components/directory/index.ts` (barrel file, zero consumers)
- [ ] T037 [US5] Remove `export default useSearch` from `src/hooks/useSearch.ts`
- [ ] T038 [US5] Migrate `handleCreateParent` in `DirectoryPage.tsx` to use React Query mutation (`useMutation` with `createParent` + cache invalidation) instead of raw API call

### Independent test criteria
- `npm run build` passes
- `npm run lint` passes
- No regressions in directory page CRUD

---

## Phase 7: US-07 — ARIA & Error States (P5)

- [ ] T039 [P] [US7] Add `role="tablist"` to tab container and `role="tab"` + `aria-selected` to tab buttons in `DirectoryTabs.tsx`
- [ ] T040 [P] [US7] Add `role="tablist"` and `role="tab"` + `aria-selected` to grouped view toggle groups in `DirectoryPage.tsx` (3 locations: students, waiting, filtered)
- [ ] T041 [US7] Add `aria-pressed` to status/gender/day toggle buttons in `AdvancedSearchPanel.tsx`
- [ ] T042 [US7] Add `aria-label` to instructor name input in `AdvancedSearchPanel.tsx`
- [ ] T043 [US7] Add `aria-label` to enrollment date-from and date-to inputs in `AdvancedSearchPanel.tsx`
- [ ] T044 [US7] Add `aria-label` to activity date-from, date-to, and search inputs in `AdvancedSearchPanel.tsx`
- [ ] T045 [US7] Add `aria-label` to min/max inputs in `DualNumberInput.tsx`
- [ ] T046 [US7] Add `aria-label` to search input in `SearchBar.tsx`
- [ ] T047 [US7] Add `aria-label` to clear button in `SearchBar.tsx`
- [ ] T048 [P] [US7] Add `aria-hidden="true"` to all decorative Material Symbols icons across directory components (~25 instances)
- [ ] T049 [US7] Expose `isError` and `error` from `useDirectoryData` hook return type
- [ ] T050 [US7] Handle `isError` state in `DirectoryPage.tsx` — render `<ErrorState>` with retry button when any query fails

### Independent test criteria
- Tab buttons announced correctly by screen readers
- All inputs have accessible labels
- Decorative icons hidden from screen readers
- API failure shows error UI (not infinite loading skeleton)

---

## Phase 8: Polish & Cross-Cutting

- [ ] T051 [P] Remove redundant `totalStudents` overcount in `useDirectoryData.ts` — subtract waiting count from total
- [ ] T052 [P] Stabilize keyboard event listener in `AdvancedSearchPanel.tsx` — wrap `onApply` in ref to avoid re-subscribe on every filter change
- [ ] T053 Remove unused `CreateStudentInput = CreateStudentDTO` type alias on `DirectoryPage.tsx` line 17
- [ ] T054 Update `AGENTS.md` SPECKIT markers to point to this feature's plan

---

## Dependencies

```
Phase 2 (Foundational)
  │
  ├──► Phase 3 (US-01: Grouped filter fix)
  │
  ├──► Phase 4 (US-02 + US-03: Group key reset)
  │
  ├──► Phase 5 (US-06: Type fixes) — independent
  │
  ├──► Phase 6 (US-05: Dead code) — independent
  │
  └──► Phase 7 (US-07: A11y) — independent
```

Phases 5, 6, and 7 are fully independent and can run in parallel.

## Parallel Execution Examples

```text
// Independent batch 1 (Phase 2 + Phase 5 + Phase 6):
  T002-T008  (cache & query key infra)
  T028-T038  (dead code cleanup)
  T018-T027  (type safety fixes)

// Independent batch 2 (Phase 3 + Phase 4 + Phase 7):
  T009-T011  (grouped filter fix)
  T012-T017  (group key reset)
  T039-T050  (a11y + error states)
```

## Implementation Strategy (MVP)

**MVP** = US-01 + US-04 (critical bugs) + US-02/US-03 (high bugs):
- T001 → T002 → T003 → T004 → T005 → T006 (cache infra)
- T007 → T008 (API support)
- T009 → T010 → T011 (grouped filter)
- T012 → T013 → T014 → T015 → T016 → T017 (group key fix)

Delivery increments:
1. **Increment 1**: Cache consolidation (Phase 2) — foundation for everything
2. **Increment 2**: Grouped filter fix (Phase 3) — critical bug resolved
3. **Increment 3**: Group key reset (Phase 4) — empty content fixed
4. **Increment 4**: Type safety + dead code (Phases 5+6)
5. **Increment 5**: A11y + polish (Phase 7+8)

## Summary

| Section | Task Count |
|---------|-----------|
| Phase 1: Setup | 1 |
| Phase 2: Foundational | 7 |
| Phase 3: US-01 | 3 |
| Phase 4: US-02+03 | 6 |
| Phase 5: US-06 | 10 |
| Phase 6: US-05 | 11 |
| Phase 7: US-07 | 12 |
| Phase 8: Polish | 4 |
| **Total** | **54** |
