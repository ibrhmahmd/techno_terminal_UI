# Quickstart — Reports Audit Fixes

## Implementation Order

### Phase 1: Bug Fixes (US1) — safest, highest value
Do these first — they're small, isolated, and each independently testable.

| Order | Task | File | Risk |
|-------|------|------|------|
| 1 | US1-T005 Remove dead `formattedAmount` | `RevenueChart.tsx` | safe |
| 2 | US1-T004 Add null fallback in select | `useDailyReport.ts` | safe |
| 3 | US1-T003 Fix error coalescing | `RevenueAndCollectionsTab.tsx` | safe |
| 4 | US1-T002 Fix 404 detection | `DailyReportTab.tsx` | safe |
| 5 | US1-T001 Fix progress status labels | `ProgressTab.tsx`, `StudentProgressChart.tsx` | moderate — chart labels visible to users |
| 6 | US1-T006 Document attendance_rate contract | `ReportSummaryCards.tsx` | safe |

### Phase 2: TypeScript Fixes (US2) — small but need build verification
| Order | Task | File | Risk |
|-------|------|------|------|
| 7 | US2-T001 Replace `as string` with `date!` | `useDailyReport.ts` | safe |
| 8 | US2-T002 Refactor Legend cast | `StudentProgressChart.tsx` | safe |

### Phase 3: Data Fetching Fixes (US3) — requires understanding key structure
| Order | Task | File | Risk |
|-------|------|------|------|
| 9 | US3-T001 Add `dailyReceipts` factory | `queryKeys.ts`, `useDailyCollections.ts` | moderate — check `queryKeys.ts` exports |
| 10 | US3-T002 Fix error merging | `useDailyCollections.ts` | safe |
| 11 | US3-T003 Return Promise | `useRevenueData.ts` | safe |

### Phase 4: Accessibility Fixes (US4) — purely additive
| Order | Task | File | Risk |
|-------|------|------|------|
| 12 | US4-T001 Add ErrorBoundary wrappers | `ReportsPage.tsx` | safe |
| 13 | US4-T002 Add aria-label to AreaChart | `RevenueChart.tsx` | safe |
| 14 | US4-T003 Add aria-label to PieChart | `StudentProgressChart.tsx` | safe |
| 15 | US4-T004 Add scope="col" to receipts table | `RevenueAndCollectionsTab.tsx` | safe |
| 16 | US4-T005 Add scope="col" to session table | `ReportSessionDetails.tsx` | safe |
| 17 | US4-T006 Add scope="col" to payment table | `ReportPaymentDetails.tsx` | safe |

## Verification (after each phase)

```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero new errors
```

## Risk Areas

1. **US1-T001 (ProgressTab labels)**: The `StudentProgressChart` receives 3 props (`completed`, `inProgress`, `notStarted`). Renaming these to `onTrack`, `atRisk`, `behind` changes the public interface of the chart component. Ensure the Legend formatter in StudentProgressChart is also updated — it generates labels from the data array's `name` field (lines 17-21).
2. **US3-T001 (query keys)**: Must verify the `dailyReceipts` factory signature matches `dailyCollections` (same date param pattern). Also check that the old key `['reports', 'daily-collections', '${date}-receipts']` is not cached anywhere unexpected — since this is a new key, old cache entries will be garbage-collected by `gcTime` (30 min default). No manual invalidation needed.
3. **US4-T001 (ErrorBoundary)**: Ensure `ErrorBoundary` is already exported from `src/components/common/index.ts`. No import issues expected.
