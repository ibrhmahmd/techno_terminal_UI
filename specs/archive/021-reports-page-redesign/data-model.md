# Data Model: Reports Page Redesign

## Component Mapping (Old → New)

### Deleted Components

| Old Component | File | Replaced By |
|---------------|------|-------------|
| `ReportCard` | `atoms/ReportCard.tsx` | `MetricSummaryCard` from `common/cards/MetricSummaryCard.tsx` |
| `MetricCard` | `atoms/MetricCard.tsx` | `MetricSummaryCard` from `common/cards/MetricSummaryCard.tsx` |
| `SummaryCards` | `molecules/SummaryCards.tsx` | Inline `MetricSummaryCard` usage in OverviewTab |

### Refactored Components

| Component | Changes |
|-----------|---------|
| `ReportsPage.tsx` | Remove all 6 data hooks. Replace header with `<PageHeader>`. Render active tab only (`{activeTab === 'x' && <XTab />}`). |
| `TabNavigation.tsx` | Dark premium styling. Uncomment enrollment/instructors tabs. Match GroupedTable pattern. |
| `OverviewTab.tsx` | Import own `useReportsSummary` + `useRevenueData`. Use `MetricSummaryCard` + `LoadingState` + `ErrorState`. |
| `EnrollmentTab.tsx` | Import own `useEnrollmentTrends`. Use `LoadingState` + `ErrorState` + `EmptyState`. |
| `RevenueTab.tsx` | Import own `useRevenueData`. Use `MetricSummaryCard` + `LoadingState` + `ErrorState`. |
| `InstructorsTab.tsx` | Import own `useInstructorPerformance`. Use `LoadingState` + `ErrorState` + `EmptyState`. |
| `ProgressTab.tsx` | Import own `useStudentProgress`. Use `LoadingState` + `ErrorState` + `EmptyState`. |
| `CollectionsTab.tsx` | Import own `useDailyCollections`. Use `MetricSummaryCard` + `LoadingState` + `ErrorState` + `EmptyState`. |
| `DailyReportTab.tsx` | Already owns its hook. Use `LoadingState` + `ErrorState` + `EmptyState`. |
| `RevenueChart.tsx` | Teal gradient/line colors. |
| `StudentProgressChart.tsx` | Teal primary color. |
| `EnrollmentTrendsChart.tsx` | Teal bar color. |
| `ReportSummaryCards.tsx` | Use `MetricSummaryCard` instead of custom cards. |
| `ReportDatePicker.tsx` | System focus ring styling. |

### Unchanged Components

- `ReportSessionDetails.tsx`
- `ReportPaymentDetails.tsx`
- `ReportEmailSender.tsx`

## Data Flow

### Before (Current)
```
ReportsPage
├── useReportsSummary()     ← fetched on mount
├── useRevenueData()        ← fetched on mount
├── useInstructorPerformance()  ← fetched on mount
├── useStudentProgress()    ← fetched on mount
├── useEnrollmentTrends()   ← fetched on mount
├── useDailyCollections()   ← fetched on mount
├── TabNavigation
└── {switch:activeTab}
    ├── OverviewTab(summary, revenue, ...)
    ├── EnrollmentTab(trends, ...)
    └── ...
```

### After (New)
```
ReportsPage
├── PageHeader
├── TabNavigation
└── {activeTab === 'x' && <XTab />}
    ├── OverviewTab
    │   └── useReportsSummary() + useRevenueData()  ← fetched on tab switch
    ├── EnrollmentTab
    │   └── useEnrollmentTrends()                    ← fetched on tab switch
    ├── RevenueTab
    │   └── useRevenueData()                         ← fetched on tab switch
    ├── InstructorsTab
    │   └── useInstructorPerformance()               ← fetched on tab switch
    ├── ProgressTab
    │   └── useStudentProgress()                     ← fetched on tab switch
    ├── CollectionsTab
    │   └── useDailyCollections()                    ← fetched on tab switch
    └── DailyReportTab
        └── useDailyReportData()                     ← already self-owned
```

## State Transitions

Tab switching is local `useState<TabId>` in ReportsPage. When `activeTab` changes:
1. Previous tab unmounts (React Query cache preserves data per `gcTime: 30min`)
2. Next tab mounts and triggers its `useQuery` (data may come from cache if visited before)
3. No global state or URL params involved
