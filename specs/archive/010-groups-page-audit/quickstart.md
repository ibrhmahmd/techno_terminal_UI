# Quickstart: Groups Page Audit & Fixes

## Prerequisites

- Working dev environment (`npm run dev`)
- Current branch: `010-groups-page-audit`
- Existing Groups page is functional (both table and card views)

## Execution Order

This audit is organized into 5 user stories. Execute in order for maximum safety:

### Phase 1: Fix Runtime Bugs (US1 — P1)

1. Fix `GroupsTable.tsx` status mapping: `inactive` → "Inactive" (not "Archived")
2. Fix `GroupInfoCard.tsx` bitwise OR: `\| 0` → `?? 0`
3. Fix `GroupDetailPage.tsx` navigation: `window.location.href` → `navigate()`
4. Fix `StudentsTab.tsx`: replace `confirm()` with `ConfirmDialog`, implement drop action
5. Fix time format consistency: all views use `--:--` for missing times
6. Fix `GroupDetailPage.tsx` ID validation: reject `id: 0` before fetch

**Verify**: Load Groups page and Group Detail page — check status labels, student counts, navigation

### Phase 2: Remove Dead Code (US2 — P2)

1. Delete unused component files:
   - `src/components/groups/RosterTab.tsx`
   - `src/components/groups/RosterPlaceholder.tsx`
   - `src/components/groups/HistoryPlaceholder.tsx`
   - `src/components/groups/ProgressSection.tsx`
   - `src/components/groups/AddSessionModal.tsx`
   - `src/components/groups/SessionsList.tsx`
   - `src/components/groups/GroupsTable.tsx`
   - `src/components/groups/detail/GroupPricingCard.tsx`
2. Delete unused hook files:
   - `src/hooks/useGroupLevels.ts`
   - `src/hooks/useRecentGroups.ts`
   - `src/hooks/useStudentsGrouped.ts`
3. Clean up barrel exports (`index.ts` files) that reference deleted files

**Verify**: `npm run build` passes, no import errors

### Phase 3: Enforce TypeScript & Code Quality (US3 — P2)

1. Replace all `any` types with proper types (see data-model.md)
2. Remove all `console.log`/`console.error` statements (see research.md Decision 7)
3. Remove redundant `export default` from all group components
4. Remove unused props (`groupId` in `GroupHeader`, `enrollmentCount` in `TabNavigation`, `_groupId` in `LevelsTab`)
5. Fix `handleSort` type in `useGroups.ts` — validate `SortField` instead of casting
6. Remove deprecated `setGroups: () => {}` from `useGroups.ts`

**Verify**: `npm run lint` passes, `npm run build` passes

### Phase 4: Standardize Data Fetching (US4 — P3)

1. Migrate `useGroupDetail` to React Query
2. Migrate `useGroupPayments` to React Query
3. Migrate `useGroupEnrollments` to React Query
4. Migrate `useGroupCompetitions` to React Query
5. Fix `useGroupAttendance` query key to use `queryKeys` factory
6. Add new query keys to `queryKeys.ts`
7. Fix N+1 competitions fetch with `Promise.all`
8. Extract shared `useAllEmployees` hook for `GroupForm` and `EditGroupDialog`

**Verify**: All group hooks use `useQuery`/`useMutation`, no `useEffect` fetches remain

### Phase 5: Accessibility & UX Polish (US5 — P3)

1. Add ARIA attributes to all interactive controls (see contracts/aria-attributes.md)
2. Add `aria-hidden="true"` to all Material Symbols icons
3. Add `aria-label` to search input in `GroupsHeader`
4. Create `useDebounce` hook and apply to `GroupInfoCard` notes field
5. Create shared `formatTimeInput` utility for time normalization
6. Fix `EditGroupDialog` time format to use shared utility
7. Fix `useEffect` toast in `GroupDetailPage` to use ref (prevent re-fire on remount)

**Verify**: Keyboard navigation works, screen reader announces controls correctly

## Verification Commands

```bash
# Build must pass
npm run build    # tsc -b && vite build

# Lint must pass
npm run lint

# Check for remaining any types (should return nothing)
rg ': any' src/components/groups/ src/pages/GroupsPage.tsx src/pages/GroupDetailPage.tsx src/hooks/useGroup*.ts

# Check for remaining console statements (should return nothing)
rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts

# Check for remaining export default (should return nothing)
rg 'export default' src/components/groups/

# Check for remaining useEffect fetches (should return nothing)
rg 'useEffect.*get' src/hooks/useGroup*.ts
```

## Key Files Modified

| File | Changes |
|------|---------|
| `src/pages/GroupsPage.tsx` | Fix `any` types, inline function memoization |
| `src/pages/GroupDetailPage.tsx` | Fix navigation, toast re-fire, ID validation |
| `src/components/groups/GroupInfoCard.tsx` | Fix bitwise OR, debounce notes |
| `src/components/groups/GroupForm.tsx` | Fix `any`, console.*, share employee fetch |
| `src/components/groups/StudentsTab.tsx` | Fix confirm(), stubs, console.*, export default |
| `src/components/groups/AttendanceTab.tsx` | Fix hardcoded values, console.*, export default |
| `src/components/groups/LevelsTab.tsx` | Fix unused prop, console.*, export default |
| `src/components/groups/PaymentsTab.tsx` | Fix export default |
| `src/components/groups/TabNavigation.tsx` | Remove unused prop, add ARIA |
| `src/components/groups/GroupBySelector.tsx` | Add ARIA |
| `src/components/groups/ViewToggle.tsx` | Add ARIA |
| `src/components/groups/GroupCategoryTabs.tsx` | Add ARIA |
| `src/components/groups/GroupsHeader.tsx` | Add aria-label |
| `src/components/groups/GroupColumns.tsx` | Fix time format |
| `src/components/groups/GroupCard.tsx` | Fix time format |
| `src/components/groups/GroupHeader.tsx` | Remove unused prop |
| `src/components/groups/detail/EditGroupDialog.tsx` | Fix time format, share employee fetch |
| `src/components/groups/detail/LevelSelector.tsx` | Add ARIA |
| `src/components/groups/history/*.tsx` | Fix export default, import order, array keys |
| `src/hooks/useGroups.ts` | Fix handleSort type, remove deprecated setGroups |
| `src/hooks/useGroupQueries.ts` | Fix `any` types |
| `src/hooks/useGroupDetail.ts` | Migrate to React Query |
| `src/hooks/useGroupPayments.ts` | Migrate to React Query |
| `src/hooks/useGroupEnrollments.ts` | Migrate to React Query |
| `src/hooks/useGroupCompetitions.ts` | Migrate to React Query, fix N+1 |
| `src/hooks/useGroupAttendance.ts` | Fix query key, remove console.* |
| `src/hooks/useGroupMutations.ts` | Fix `any` types |
| `src/hooks/queryKeys.ts` | Add group detail keys |
| `src/hooks/useDebounce.ts` | NEW: debounce utility |
| `src/api/academics/groups/utils.ts` | Fix N+1 pattern |
