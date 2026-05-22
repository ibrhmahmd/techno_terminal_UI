# Quickstart: Reports Domain Audit Fix

## Prerequisites

```bash
cd techno_terminal_UI
npm install
```

## Verification Commands

After making changes, run:

```bash
npm run lint        # zero errors expected
npm run build       # tsc -b && vite build must pass
npm run test        # existing tests must still pass
```

## Implementation Order

The 35 audit findings are ordered by risk to minimize regressions:

1. **Phase 1 — Bugs** (3 fixes): RevenueChart tooltip, ReportsPage error message, InstructorPerformanceChart tooltip label
2. **Phase 2 — Data Fetching** (7 migrations): Migrate 5 hooks to React Query + 2 query key centralizations
3. **Phase 3 — Dead Code** (5 deletions): Delete 2 components, remove 1 export, remove 4 unused fields
4. **Phase 4 — TypeScript** (4 fixes): Remove `any`, remove `!`, fix `?.` vs `!` inconsistency
5. **Phase 5 — Accessibility** (14 fixes): ARIA roles, keyboard nav, labels, aria-expanded, ErrorBoundary, semantic HTML

## Key Files Changed

| File | Change |
|------|--------|
| `src/hooks/queryKeys.ts` | Add `reports` section to factory |
| `src/components/reports/hooks/useDailyCollections.ts` | Full rewrite to useQuery |
| `src/components/reports/hooks/useEnrollmentTrends.ts` | Full rewrite to useQuery |
| `src/components/reports/hooks/useInstructorPerformance.ts` | Full rewrite to useQuery |
| `src/components/reports/hooks/useRevenueData.ts` | Full rewrite to useQuery + fix months param |
| `src/components/reports/hooks/useStudentProgress.ts` | Full rewrite to useQuery |
| `src/components/reports/hooks/useDailyReport.ts` | Remove `date!`, use controlled enabled |
| `src/components/reports/hooks/useReportsSummary.ts` | Use centralized query keys |
| `src/components/reports/RevenueChart.tsx` | Fix tooltip formatter |
| `src/components/reports/StudentProgressChart.tsx` | Remove explicit `any` |
| `src/components/reports/InstructorPerformanceChart.tsx` | DELETE |
| `src/components/reports/molecules/InstructorDataTable.tsx` | DELETE |
| `src/components/reports/molecules/TabNavigation.tsx` | ARIA roles, keyboard nav, remove export |
| `src/components/reports/molecules/ReportDatePicker.tsx` | htmlFor/id on label |
| `src/components/reports/molecules/ReportEmailSender.tsx` | aria-label on input |
| `src/components/reports/atoms/ReportPaymentDetails.tsx` | aria-expanded, aria-controls |
| `src/components/reports/atoms/ReportSummaryCards.tsx` | aria-hidden on icons |
| `src/components/reports/atoms/ReportSessionDetails.tsx` | aria-hidden on icons |
| `src/components/reports/organisms/DailyReportTab.tsx` | Wrap in ErrorBoundary |
| `src/components/reports/organisms/InstructorsTab.tsx` | Remove duplicate isLoading |
| `src/components/reports/organisms/ProgressTab.tsx` | Use `<ol>` for ranking |
| `src/components/reports/organisms/OverviewTab.tsx` | aria-hidden on icons |
| `src/components/reports/organisms/CollectionsTab.tsx` | htmlFor/id + aria-hidden |
| `src/components/reports/organisms/RevenueTab.tsx` | aria-hidden on icons |
| `src/components/reports/organisms/EnrollmentTab.tsx` | aria-hidden on icons |
| `src/pages/ReportsPage.tsx` | Remove fallback message |
