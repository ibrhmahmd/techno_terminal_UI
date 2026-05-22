# Data Model: Reports Domain Audit Fix

## Entity Map

No new entities introduced. This spec modifies existing data-fetching patterns and components.

### Existing API Data Types

| DTO | Source | Used By | Cache Strategy |
|-----|--------|---------|----------------|
| `DashboardDailyOverviewDTO` | `api/dashboard` | `useReportsSummary` → `OverviewTab` | staleTime: 5min (unchanged) |
| `RevenueMetricsDTO` | `api/analytics/financial` | `useRevenueData` → `RevenueTab`, `OverviewTab` | staleTime: 5min (NEW — currently uncached) |
| `RevenueByDateDTO` | `api/analytics` | `RevenueChart` | (sub-object of RevenueMetricsDTO) |
| `EnrollmentTrendDTO[]` | `api/analytics/bi` | `useEnrollmentTrends` → `EnrollmentTab` | staleTime: 5min (NEW — currently uncached) |
| `InstructorPerformanceDTO[]` | `api/analytics/bi` | `useInstructorPerformance` → `InstructorsTab` | staleTime: 5min (NEW — currently uncached) |
| `StudentProgressDTO[]` | `api/analytics/academic` | `useStudentProgress` → `ProgressTab` | staleTime: 5min (NEW — currently uncached) |
| `DailyCollectionItem[]` | `api/finance/reporting` | `useDailyCollections` → `CollectionsTab` | staleTime: 1min (NEW — currently uncached) |
| `DailyReceiptItem[]` | `api/finance/reporting` | `useDailyCollections` → `CollectionsTab` | staleTime: 1min (NEW — currently uncached) |
| `DailyReportData` | `api/reports/daily` | `useDailyReport` → `DailyReportTab` | staleTime: 0 (unchanged) |
| `DashboardSummaryPublic` | (transformed) | `OverviewTab` | (derived from DashboardDailyOverviewDTO) |

## Query Key Design

### New centralized keys in `src/hooks/queryKeys.ts`

```typescript
export const queryKeys = {
  // ... existing keys ...
  reports: {
    all: ['reports'] as const,
    summary: (today: string) => ['reports', 'summary', today] as const,
    revenue: (months?: number) => ['reports', 'revenue', months] as const,
    enrollmentTrends: (months: number) => ['reports', 'enrollment-trends', months] as const,
    instructorPerformance: ['reports', 'instructor-performance'] as const,
    studentProgress: ['reports', 'student-progress'] as const,
    dailyCollections: (date: string) => ['reports', 'daily-collections', date] as const,
    dailyReport: {
      data: (date: string) => ['reports', 'daily-report', 'data', date] as const,
      pdf: (date: string) => ['reports', 'daily-report', 'pdf', date] as const,
    },
  },
}
```

### staleTime Overrides

| Key Pattern | staleTime | Rationale |
|-------------|-----------|-----------|
| `reports.summary` | 5 min | Daily dashboard data, stable within a day |
| `reports.revenue` | 5 min | Revenue metrics, stable within a day |
| `reports.enrollmentTrends` | 5 min | Trend data changes slowly |
| `reports.instructorPerformance` | 5 min | Instructor data, stable |
| `reports.studentProgress` | 5 min | Progress data, stable |
| `reports.dailyCollections` | 1 min | Collections/receipts may update during the day |
| `reports.dailyReport.data` | 0 | Date-snapshot, always fresh |
| `reports.dailyReport.pdf` | Infinity | PDF content should not be re-fetched |

## Cross-Domain Invalidation

No cross-domain invalidation needed for reports data — reports are read-only views. Collections data (`reports.dailyCollections`) uses the finance API but is cached separately under the `reports` key namespace.

## State Transitions

No state machine changes. Tab switching is local `useState<TabId>` managed by `ReportsPage.tsx`. The existing tab switching behavior is preserved.
