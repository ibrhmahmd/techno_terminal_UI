# Research: Reports Domain Audit Fix

## Resolved Unknowns

### Unknown 1: Commented-out tabs in DEFAULT_TABS

**Decision**: Keep commented-out tabs as-is. The `EnrollmentTab` and `InstructorsTab` components are wired in `ReportsPage.tsx:58-93` and functional. The commented lines in `TabNavigation.tsx:19-22` serve as a toggle — uncomment to restore those tabs. This is intentional dormant UI, not dead code.

### Unknown 2: EnrollmentTrendsChart.tsx

**Decision**: Keep. `EnrollmentTrendsChart.tsx:17` is imported by `EnrollmentTab.tsx:1` and rendered at `EnrollmentTab.tsx:48`. The audit missed it because it's a file-level component (not in a subdirectory), but it has a live consumer. Not dead code.

### Unknown 3: refetch(months) param in useRevenueData

**Decision**: Fix the hook to actually pass months through. `getRevenueMetrics(months?)` in `src/api/analytics/financial.ts:70` accepts an optional `months` parameter. The current comment "New analytics API doesn't take months parameter" is wrong. The new React Query hook should use `months` as a query parameter with appropriate `staleTime`.

## Additional Discoveries

### getRevenueMetrics accepts months — fix useRevenueData
- API: `getRevenueMetrics(months?: number)` — param exists
- Current hook: ignores the param, comment is stale
- In React Query migration, include `months` in the query key

### DataTable `isLoading` is actually used by the DataTable component
- The `InstructorsTab.tsx:69` passes `isLoading` to `DataTable`. The DataTable component may use it internally for skeleton loading. **Double-check** before removing.

### getEnrollmentTrends expects cutoff date string
- API: `getEnrollmentTrends(cutoff?: string)` — takes ISO date string
- Current hook: transforms `months` to cutoff date — this logic is correct
- React Query hook should keep the same transformation but include `months` in key

### InstructorPerformanceChart tooltip shows Attendance Rate but renders totalStudents
- Bar dataKey: `totalStudents` → renders student count
- Tooltip formatter: `['${value}%', 'Attendance Rate']` — labels it as percentage
- **Fix**: Either change the tooltip label to "Active Students" (and remove `%`), or keep the label. Since the bar shows count (not percentage), the label should be "Active Students".

### Dead code confirmed
- `InstructorPerformanceChart.tsx`: zero imports. Safe to delete. `InstructorsTab.tsx` uses `DataTable` instead.
- `InstructorDataTable.tsx`: zero imports. Safe to delete.
- `DEFAULT_TABS` export: never imported elsewhere. Can remove `export`.

### `isUsingMockData` fields
- Found in 4 hooks: `useEnrollmentTrends`, `useInstructorPerformance`, `useRevenueData`, `useStudentProgress`
- All return `isUsingMockData: false` — never consumed by any component
- Safe to remove from return types and interfaces
