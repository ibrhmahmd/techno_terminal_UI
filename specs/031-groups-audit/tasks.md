# Tasks: Groups Page Audit & Fix

## US1 — Runtime Bug Fixes

| # | Task | File | Lines |
|---|------|------|-------|
| T001 | Add "Unknown" fallback to GroupStatusBadge for unrecognized status values | `shared/GroupStatusBadge.tsx` | 35 |
| T002 | Change `completed` status dot color from amber to blue | `shared/GroupStatusBadge.tsx` | 41 |
| T003 | Send `instructor_ids[]` and `level_numbers[]` arrays instead of singular first-value truncation | `hooks/useGroups.ts` | 52-53 |
| T004 | Add `instructor_ids` and `level_numbers` array fields to `GroupFilterOptions` | `api/academics/groups/core.ts` | 122 |
| T005 | Skip `instructor_id` in PATCH payload when no instructor selected (never send `0`) | `detail/EditGroupDialog.tsx` | 86 |
| T006 | Validate `day` is non-empty before building schedule data in EditGroupDialog | `detail/EditGroupDialog.tsx` | 81 |
| T007 | Strip `status` from PATCH payload since `UpdateGroupDTO` has no `status` field | `detail/EditGroupDialog.tsx` | 84 |
| T008 | Fix GroupBySelector "All" button not appearing selected when `groupBy` is `undefined` | `pages/GroupsPage.tsx` | 213 |
| T009 | Bump grouped view limit from 50 to 200 | `hooks/useGroupQueries.ts` | 42 |

## US2 — Dead Code Removal

| # | Task | File | Lines |
|---|------|------|-------|
| T010 | Remove `processedGroups` from `useGroups()` return object | `hooks/useGroups.ts` | 141 |
| T011 | Remove `GroupCardProps` from groups barrel export | `components/groups/index.ts` | — |
| T012 | Change `GroupBySelectorValue` from `export` to internal-only | `components/groups/GroupBySelector.tsx` | 4 |
| T013 | Remove `UseGroupAttendanceOptions` type export | `hooks/useGroupAttendance.ts` | — |
| T014 | Remove unused detail barrel exports (LevelSelector, EditGroupDialog) | `components/groups/detail/index.ts` | — |

## US3 — TypeScript & Code Quality Cleanup

| # | Task | File | Lines |
|---|------|------|-------|
| T015 | Replace `as any` mode cast with properly typed union | `common/combobox/GroupCombobox.tsx` | 125 |
| T016 | Replace unsafe `as GroupByField` pre-check cast with validated parsing | `hooks/useGroups.ts` | 39 |
| T017 | Replace `as Exclude<GroupByField, null>` with non-null assertion | `hooks/useGroups.ts` | 65 |
| T018 | Replace `Record<string, any>` with `Record<string, unknown>` in params | `api/academics/groups/core.ts` | 137 |
| T019 | Extract duplicate schedule parsing logic into shared helper | `components/groups/GroupForm.tsx` | 43, 74 |
| T020 | Remove unnecessary `as Course[]` cast | `components/groups/GroupForm.tsx` | 60 |
| T021 | Remove unnecessary `as React.ReactNode` cast | `common/combobox/GroupCombobox.tsx` | 145 |
| T022 | Fix double `as SortField` cast | `hooks/useGroups.ts` | 108 |
| T023 | Remove redundant `as UpdateGroupDTO` cast | `pages/GroupDetailPage.tsx` | 160 |
| T024 | Add proper `Schedule | ScheduleInput` union type to `GroupForm` `initialData` | `components/groups/GroupForm.tsx` | — |

## US4 — Data Fetching & Cache Hygiene

| # | Task | File | Lines |
|---|------|------|-------|
| T025 | Replace `useEffect` + `useState` + `getCourses()` with `useCourses()` | `components/groups/GroupForm.tsx` | 56 |
| T026 | Consolidate `groupKeys` into `queryKeys.ts` (deprecate local, re-export) | `hooks/useGroupQueries.ts`, `hooks/queryKeys.ts` | 18 |
| T027 | Move `studentsGroupedKeys` into centralized `queryKeys.ts` | `hooks/useStudentsGrouped.ts`, `hooks/queryKeys.ts` | 6 |
| T028 | Move `['employees', 'all']` inline key into centralized `queryKeys.ts` | `hooks/useProgressLevelForm.ts`, `hooks/queryKeys.ts` | 61 |
| T029 | Remove redundant `refresh()` after mutations in GroupsPage | `pages/GroupsPage.tsx` | 144 |
| T030 | Remove redundant `refetch()` after mutations in GroupDetailPage | `pages/GroupDetailPage.tsx` | 96 |
| T031 | Replace fragile ref-based error toast guard with direct pattern | `pages/GroupDetailPage.tsx` | 67 |
| T032 | Fix stale `mutationError` — read error from catch clause directly | `pages/GroupDetailPage.tsx` | 93 |

## US5 — Accessibility & UX Polish

| # | Task | File | Lines |
|---|------|------|-------|
| T033 | Add `aria-label="Close filters"` to GroupFilters close button | `components/groups/GroupFilters.tsx` | 87 |
| T034 | Replace `title` with `aria-label` + `aria-hidden="true"` on icon-only buttons in GroupInfoCard | `detail/GroupInfoCard.tsx` | 97,103,110 |
| T035 | Add `aria-label` to clickable GroupCard | `components/groups/GroupCard.tsx` | 46 |
| T036 | Fix `aria-selected` on search pill when visually active | `components/groups/GroupBySelector.tsx` | 50 |
| T037 | Add `aria-pressed` to all toggle filter pills in GroupFilters | `components/groups/GroupFilters.tsx` | — |
| T038 | Wrap Status radio group in `<fieldset>` + `<legend>` | `detail/EditGroupDialog.tsx` | 190 |
| T039 | Add `aria-hidden="true"` to decorative Lucide icons in GroupInfoCard | `detail/GroupInfoCard.tsx` | 122 |
| T040 | Add `aria-hidden="true"` to Material Symbol icons in GroupCombobox | `common/combobox/GroupCombobox.tsx` | — |
| T041 | Wrap tab panels with `role="tabpanel"` + `aria-labelledby` | `components/groups/GroupCategoryTabs.tsx`, `TabNavigation.tsx` | — |
| T042 | Add `role="alert"` to error banners across Groups feature | Multiple files | — |
| T043 | Add `role="status"` + `aria-label` to loading skeleton in PaymentsTab | `detail/PaymentsTab.tsx` | 28 |
| T044 | Improve "Change" button `aria-label` in GroupCombobox | `common/combobox/GroupCombobox.tsx` | 104 |
| T045 | Fix nested button-in-button in PaymentsTab | `detail/PaymentsTab.tsx` | 114 |
| T046 | Add `role="region"` + `aria-labelledby` to accordion panels in LevelsTab | `detail/LevelsTab.tsx` | ✓ |
