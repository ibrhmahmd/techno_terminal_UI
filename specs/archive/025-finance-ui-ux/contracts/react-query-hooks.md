# React Query Hook Contracts: Finance Page

## useDailyMetrics

```typescript
interface DailyMetricsData {
  todayCollections: number
  outstandingBalance: number
  todayReceiptCount: number
}

function useDailyMetrics(date: string): {
  data: DailyMetricsData | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

**Internal calls**:
- `getDailyCollections(date)` → sum `total_amount` for collections, sum `receipt_count` for count
- `getUnpaidEnrollments()` → sum `remaining_balance` for outstanding balance

**Query key**: `queryKeys.finance.metrics(date)` — new key group to add to `queryKeys.ts`

**staleTime**: 2 minutes (financial data refreshes moderately often)

---

## useDailyReceipts

```typescript
function useDailyReceipts(date: string): {
  data: DailyReceiptItem[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

**Internal calls**: `getDailyReceipts(date)`

**Query key**: `queryKeys.finance.dailyReceipts(date)` — new key group

**staleTime**: 2 minutes

---

## queryKeys.ts additions

```typescript
// In src/hooks/queryKeys.ts, add:
export const queryKeys = {
  // ... existing keys ...
  finance: {
    metrics: (date: string) => ['finance', 'metrics', date] as const,
    dailyReceipts: (date: string) => ['finance', 'daily-receipts', date] as const,
    receipts: {
      search: (params: ReceiptSearchParams) => ['finance', 'receipts', 'search', params] as const,
      detail: (id: number) => ['finance', 'receipts', id] as const,
    },
  },
}
```
