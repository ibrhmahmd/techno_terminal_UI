# Quickstart: Reports Page Redesign

## Prerequisites

```bash
cd techno_terminal_UI
npm install
```

## Verification Commands

```bash
npm run lint        # zero new errors expected
npm run build       # tsc -b && vite build must pass
```

## Implementation Order

### Phase 1: Tab Navigation + Page Layout
1. Rewrite `TabNavigation.tsx` — dark premium style, uncomment all tabs
2. Rewrite `ReportsPage.tsx` — PageHeader, per-tab rendering, remove all data hooks

### Phase 2: Move Hooks Into Tabs
3. `OverviewTab.tsx` — add own `useReportsSummary` + `useRevenueData`
4. `EnrollmentTab.tsx` — add own `useEnrollmentTrends`
5. `RevenueTab.tsx` — add own `useRevenueData`
6. `InstructorsTab.tsx` — add own `useInstructorPerformance`
7. `ProgressTab.tsx` — add own `useStudentProgress`
8. `CollectionsTab.tsx` — add own `useDailyCollections`

### Phase 3: System Components
9. Replace all inline error states with `ErrorState`
10. Replace all inline loading states with `LoadingState`
11. Replace all inline empty states with `EmptyState`
12. Replace `MetricCard`/`ReportCard` with `MetricSummaryCard` in all tabs

### Phase 4: Chart Recoloring
13. `RevenueChart.tsx` — teal gradient + stroke
14. `StudentProgressChart.tsx` — teal primary
15. `EnrollmentTrendsChart.tsx` — teal bar

### Phase 5: Cleanup
16. Delete `ReportCard.tsx`, `MetricCard.tsx`, `SummaryCards.tsx`
17. Run lint + build

## Key Risk Areas

- **Import cycles**: Moving hooks into tab components must not create circular deps
- **MetricSummaryCard API**: Verify it accepts all props needed (title, value, subtitle, color, isLoading)
