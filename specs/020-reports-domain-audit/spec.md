# Feature Specification: Reports Domain Audit Fix

**Feature Branch**: `020-reports-domain-audit`
**Created**: 2026-05-22
**Status**: Draft
**Input**: Feature audit of `src/components/reports/`, `src/pages/ReportsPage.tsx`, `src/hooks/queryKeys.ts`

## Clarifications

- Q: Should we migrate all 6 useEffect+useState hooks to React Query in one pass? → A: Yes — constitution requires it, and partial migration leaves inconsistency.
- Q: Delete InstructorPerformanceChart.tsx and InstructorDataTable.tsx — are they referenced anywhere? → A: Zero imports outside self-definition. Safe to delete.
- Q: Should we add centralized query keys for reports in queryKeys.ts? → A: Yes — all inline query keys must move to the factory.
- Q: Is TabNavigation keyboard navigation in scope? → A: Yes — accessibility is a hard requirement.

## Findings Summary

35 findings across 5 phases of the feature audit:

### Phase 1 — Runtime Bugs (3 findings)
- **F-001** (`RevenueChart.tsx:62`): Tooltip accesses `entry?.payload?.value` but `RevenueByDateDTO` has `day`/`net_revenue` — shows "0.0%" always.
- **F-002** (`InstructorPerformanceChart.tsx:60`): Tooltip shows "Attendance Rate %" but bar renders `totalStudents`, not attendance data.
- **F-003** (`ReportsPage.tsx:35`): Error message claims "Using fallback data" but no fallback mechanism exists.

### Phase 2 — Dead Code (5 findings)
- **F-004** (`InstructorPerformanceChart.tsx`): Entire component — zero references outside self-definition. DELETE.
- **F-005** (`InstructorDataTable.tsx`): Entire component — zero references outside self-definition. DELETE.
- **F-006** (`TabNavigation.tsx:57`): `DEFAULT_TABS` exported but never imported. Remove export or delete.
- **F-007**–**F-010** (4 hooks): `isUsingMockData: false` returned but never consumed. Remove field.

### Phase 3 — TypeScript Quality (2 findings)
- **F-011** (`RevenueChart.tsx:62`): Explicit `any` on recharts Tooltip callback.
- **F-012** (`StudentProgressChart.tsx:66`): Explicit `any` on recharts Legend callback.
- **F-013** (`useDailyReport.ts:7`): Non-null assertion `date!` — replace with controlled `enabled`.
- **F-014** (`useReportsSummary.ts:28`): Inconsistent `?.` vs `!` on same expression.

### Phase 4 — Data Fetching Violations (7 findings)
- **F-015**–**F-020** (6 hooks): `useEffect`+`useState` instead of `useQuery`:
  - `useDailyCollections.ts`
  - `useEnrollmentTrends.ts`
  - `useInstructorPerformance.ts`
  - `useReportsSummary.ts`
  - `useRevenueData.ts`
  - `useStudentProgress.ts`
- **F-021**–**F-022**: Inline query keys instead of centralized `queryKeys` factory.
- **F-023**: `refetch` param ignored in `useRevenueData.ts`.

### Phase 5 — Accessibility (19 findings)
- **F-024**–**F-025**: `TabNavigation` missing `role="tablist"`, `role="tab"`, `aria-selected`.
- **F-026**: No keyboard arrow navigation for tabs.
- **F-027**: No focus management on tab activation.
- **F-028**–**F-029**: `ReportEmailSender` / `ReportDatePicker` / `CollectionsTab` inputs missing `aria-label` / `htmlFor` associations.
- **F-030**–**F-031**: `ReportPaymentDetails` accordion missing `aria-expanded` / `aria-controls`.
- **F-032**: 12+ Material Symbols icon spans missing `aria-hidden="true"`.
- **F-033**: `DailyReportTab` lacks its own ErrorBoundary.
- **F-034**: `InstructorsTab` passes duplicate `isLoading` prop.
- **F-035**: `ProgressTab` rank numbering has no semantic structure.

## User Scenarios & Testing

### User Story 1 — Bug-Free Reports (Priority: P1)
Admin views reports and sees correct revenue/chart data without 0.0% display.

**Independent Test**: Navigate to Reports page, verify Revenue chart shows correct percentages.

### User Story 2 — Accessible Tab Navigation (Priority: P1)
Screen reader user navigates tabs via keyboard arrows with proper aria roles.

**Independent Test**: Use keyboard to tab to report tabs, use arrow keys to switch between tabs, verify screen reader announces tab state.

### User Story 3 — Consistent Data Fetching (Priority: P1)
All report data loads via React Query with centralized cache keys.

**Independent Test**: Navigate between report tabs and verify all data goes through React Query (no manual fetch/useEffect).

## Requirements

### Functional Requirements
- **FR-001**: Revenue chart MUST display correct net_revenue values
- **FR-002**: All 6 report hooks MUST use React Query instead of useEffect+useState
- **FR-003**: Centralized query keys MUST be used for all reports queries

### Dead Code Cleanup
- **FR-004**: InstructorPerformanceChart.tsx MUST be deleted
- **FR-005**: InstructorDataTable.tsx MUST be deleted
- **FR-006**: DEFAULT_TABS unused export MUST be removed
- **FR-007**: isUsingMockData fields MUST be removed from 4 hooks

### TypeScript Quality
- **FR-008**: All `any` types in chart tooltips MUST be properly typed
- **FR-009**: Non-null assertions MUST be replaced with controlled patterns

### Accessibility Requirements
- **FR-010**: TabNavigation MUST have proper ARIA roles and keyboard navigation
- **FR-011**: All form inputs MUST have associated labels
- **FR-012**: Accordion components MUST have aria-expanded and aria-controls
- **FR-013**: All Material Symbols MUST have aria-hidden="true"
- **FR-014**: DailyReportTab MUST have its own ErrorBoundary
- **FR-015**: ProgressTab rank numbering MUST use semantic HTML

## Success Criteria
- Build passes (`tsc -b && vite build`) with zero errors
- Lint passes with zero errors
- All 35 findings resolved
- No regressions in existing report tabs
