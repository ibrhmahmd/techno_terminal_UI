# Data Model — Reports Audit Fixes

This feature is a bugfix/cleanup pass — no new entities, no new APIs, no new data flows. Below documents the **before/after** changes to existing data flows.

## 1. ProgressTab — Status Labels

### Before
```
StudentProgressDTO.progress_status: 'on_track' | 'at_risk' | 'behind'
  └─ ProgressTab.tsx maps:
       on_track  → "Completed"      ← WRONG
       at_risk   → "In Progress"    ← correct
       behind    → "Not Started"    ← WRONG
```

### After
```
StudentProgressDTO.progress_status: 'on_track' | 'at_risk' | 'behind'
  └─ ProgressTab.tsx maps:
       on_track  → "On Track"
       at_risk   → "At Risk"
       behind    → "Behind"
  └─ StudentProgressChart.tsx:
       labels renamed accordingly
       Legend formatter refactored (remove double `as unknown` cast)
```

## 2. Error Handling Flows

### DailyReportTab 404 detection
```
Before: error.message.includes('404')     ← fragile string match
After:  (error as any)?.response?.status === 404  ← stable status code check
```

### RevenueAndCollectionsTab error coalescing
```
Before: revError?.message || colError?.message  ← masks second error
After:  revError?.message ?? colError?.message ?? null  ← preserves both
```

## 3. Query Key Flow

### Before
```
useDailyCollections:
  queryKey: queryKeys.reports.dailyCollections(`${date}-receipts`)
  → resolves to key ['reports', 'daily-collections', '2024-01-01-receipts']
  → semantically wrong (misrepresents resource as dailyCollections not dailyReceipts)
```

### After
```
queryKeys.reports.dailyReceipts(date)      ← new factory in queryKeys.ts
useDailyCollections:
  queryKey: queryKeys.reports.dailyReceipts(date)
  → resolves to key ['reports', 'daily-receipts', '2024-01-01']
  → semantically correct
```

## 4. RevenueData Refetch Promise

```
Before: refetch: (n?) => { if (n) setMonths(n); else refetch() }   ← void return
After:  refetch: async (n?) => { if (n) setMonths(n); else await refetch() }  ← Promise
```

## 5. Accessibility Metadata

| Component | Change |
|-----------|--------|
| RevenueChart AreaChart | Add `aria-label="Monthly revenue trend chart"` |
| StudentProgressChart PieChart | Add `aria-label="Student progress distribution"` |
| RevenueAndCollectionsTab receipts table | Add `scope="col"` to all `<th>` |
| ReportSessionDetails table | Add `scope="col"` to all `<th>` |
| ReportPaymentDetails inner table | Add `scope="col"` to all `<th>` |
| ReportsPage tabs | Wrap RevenueAndCollectionsTab + ProgressTab in `<ErrorBoundary>` |

## State Transitions

No state transitions changed — all fixes are:
- Label/display corrections
- Error handling robustness
- Cache key correction
- ARIA metadata additions
