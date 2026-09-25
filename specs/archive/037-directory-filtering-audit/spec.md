# Audit and Fix: Directory Page Student Filtering

Audit and fix of the directory page student filtering feature across 7 user stories:

## User Stories

### US-01: Advanced Search Grouped View Returns Correctly Filtered Data
Fixing a critical bug where switching to the grouped view in the advanced search (Filter Students) tab returns ALL students instead of only those matching the active filters. The `useStudentsGrouped` hook is called without forwarding filter parameters.

**Files**: `src/hooks/directory/useDirectoryData.ts`, `src/hooks/useStudentsGrouped.ts`, `src/api/crm/students/search.ts`

### US-02: Group Key Resets When Group-By Mode Changes
Fixing a bug where `activeStudentGroup` and `activeFilterGroup` state persists across group-by mode switches (e.g., switching from "Status" to "Age"), causing the active group key to not match any current group, resulting in empty card display. State must reset when the grouping mode changes.

**Files**: `src/pages/DirectoryPage.tsx`

### US-03: Fallback When Active Key Doesn't Exist in Grouped Data
Adding validation in all three grouped-data view locations (students grouped, waiting grouped, filtered grouped) to check whether the active key exists in the current group data. When it doesn't, fall back to the first available group.

**Files**: `src/pages/DirectoryPage.tsx`

### US-04: Fix Cache Invalidation Between Mutation and Grouped Queries
Fixing a cache key prefix mismatch where CRUD operations (create, update, delete, restore students) invalidate `['directory', 'students', ...]` keys but the grouped data uses `['students', 'grouped', ...]` keys. After any mutation, the grouped view shows stale data until the 5-minute staleTime expires.

**Files**: `src/hooks/useDirectory.ts`, `src/hooks/useStudentsGrouped.ts`, `src/hooks/queryKeys.ts`

### US-05: Remove 15 Dead Code Items
Cleaning up unused exports and files:
- Delete entire `src/hooks/useDirectorySearch.ts` file (zero consumers)
- Remove `searchStudentsAdvanced()` and `StudentSearchFilters` interface (no consumers)
- Remove `STUDENT_GROUP_OPTIONS` / `WAITING_GROUP_OPTIONS` / `getAgeBucket()` / `formatAgeBucketLabel()` from `src/config/studentGrouping.ts` (unused — StudentGroupBySelector duplicates inline)
- Remove `useCreateParent()` hook (raw API call used instead)
- Remove `getParentById()` from barrel exports
- Remove barrel file `src/components/directory/index.ts` (zero consumers)
- Remove unused `updateBucket`/`setAgeBuckets` from `src/store/groupingSettingsStore.ts`
- Remove redundant `export default useSearch`

**Files**: Various across `src/hooks/`, `src/api/crm/`, `src/config/`, `src/store/`, `src/components/directory/`

### US-06: Eliminate All `as any` Type Violations (20 occurrences)
Fixing the blanket `eslint-disable @typescript-eslint/no-explicit-any` at the top of `DirectoryPage.tsx` and removing all `(s as any)`, `(p as any)`, and `as unknown as` casts by:
- Adding missing `grade` and `has_unpaid_balance` fields to `StudentListItem` / `StudentFilterItem` types
- Adding `student_count` and fixing `phone_primary` to `ParentListItem` type
- Replacing double `as unknown as StudentListItem` casts with proper union types
- Fixing the `getParentsPaginated` return type mismatch
- Removing `eslint-disable` directive

**Files**: `src/pages/DirectoryPage.tsx`, `src/api/crm/students/types/models.ts`, `src/api/crm/parents.ts`, `src/hooks/directory/useDirectoryData.ts`

### US-07: Add ARIA Attributes and Error States Across All Filter Controls
Adding accessibility attributes to 25+ interactive filter controls and propagating error states:
- Add `aria-label` to 6 inputs (instructor name, 4x date inputs, activity search)
- Add `aria-pressed` to toggle button groups (status, gender, days, date filter)
- Add `role="tablist"` / `role="tab"` / `aria-selected` to tab controls (DirectoryTabs, 3x grouped view tabs)
- Add `aria-hidden="true"` to ~25 decorative Material Symbols icons
- Add `aria-label` to icon-only SearchBar clear button
- Expose `isError` from `useDirectoryData` and render `<ErrorState>` on API failure

**Files**: `src/pages/DirectoryPage.tsx`, `src/components/directory/AdvancedSearchPanel.tsx`, `src/components/directory/DirectoryTabs.tsx`, `src/components/directory/StudentCard.tsx`, `src/components/directory/StudentGroupBySelector.tsx`, `src/components/directory/shared/CardSkeleton.tsx`, `src/components/crm/StudentMobileCard.tsx`, `src/components/common/SearchBar.tsx`, `src/components/common/DualNumberInput.tsx`, `src/components/common/RowActions.tsx`, `src/components/common/ActionButton.tsx`, `src/components/common/ErrorMessage.tsx`, `src/components/directory/WaitingListPanel.tsx`, `src/hooks/directory/useDirectoryData.ts`

## Technical Notes
- All changes are frontend-only
- Type changes (`StudentListItem`, `StudentFilterItem`, `ParentListItem`) must remain backwards-compatible with API response shape
- Query key consolidation must not break existing cache or cause refetch storms
- `aria-hidden="true"` additions must not affect visual layout
