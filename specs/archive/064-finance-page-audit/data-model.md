# Data Model: Finance Page Audit & Fix

## Overview

This audit refactors existing data flow patterns. No new entities are introduced — the data model reflects the current API contracts and React Query cache structure.

## React Query Cache Structure

### Finance Query Key Tree

```
['finance']
├── ['finance', 'balance', studentId]          → StudentBalance
├── ['finance', 'unpaid-enrollments', params]  → PaginatedEnrollments
├── ['finance', 'metrics', date]               → DailyMetrics
├── ['finance', 'daily-receipts', date]        → ReceiptListItem[]
├── ['finance', 'receipts', 'search', params]  → ReceiptListItem[]  (to be removed)
├── ['finance', 'receipts', 'detail', id]      → ReceiptDetail
├── ['finance', 'student-enrollments', studentId] → EnrollmentInfo
├── ['finance', 'adjust-balance']              → (mutation, no cache)
├── ['finance', 'create-receipt']              → (mutation, invalidates receipts)
├── ['finance', 'mark-sent']                   → (mutation, invalidates receipts)
├── ['finance', 'batch-generate']              → (mutation, invalidates receipts)
└── ['finance', 'issue-refund']                → (mutation, invalidates metrics)
```

### Cache Invalidation Rules

| Mutation | Invalidates |
|----------|-------------|
| useAdjustBalance | finance (prefix) |
| useCreateReceipt | finance (prefix) |
| useMarkAsSent | finance.receipts.detail(id), finance.dailyReceipts(date) |
| useBatchGenerate | finance (prefix) |
| useIssueRefund | finance (prefix) |

## Hook Decomposition

### Current → New Mapping

| Current Hook | New Hook(s) | Type |
|-------------|-------------|------|
| useBalance | useStudentBalance(studentId) | useQuery |
| useBalance | useUnpaidEnrollments(params) | useQuery |
| useBalance | useAdjustBalance() | useMutation |
| useReceipts | useReceiptSearch(params) | useQuery |
| useReceipts | useReceiptDetail(id) | useQuery |
| useReceipts | useCreateReceipt() | useMutation |
| useReceipts | useMarkAsSent() | useMutation |
| useReceipts | useBatchGenerate() | useMutation |
| useRefunds | useIssueRefund() | useMutation |
| useRefunds | useRefundRiskPreview() | useMutation |

### staleTime Configuration

| Hook | staleTime | gcTime | Notes |
|------|-----------|--------|-------|
| useStudentBalance | 300000 (5min) | 1800000 (30min) | Per project default |
| useUnpaidEnrollments | 300000 (5min) | 1800000 (30min) | Per project default |
| useReceiptSearch | 300000 (5min) | 1800000 (30min) | Per project default |
| useReceiptDetail | 300000 (5min) | 1800000 (30min) | Per project default |
| useDailyMetrics | 300000 (5min) | 1800000 (30min) | Fix: was 120000 |
| useDailyReceipts | 300000 (5min) | 1800000 (30min) | Fix: was 120000 |
| useStudentEnrollments | 300000 (5min) | 1800000 (30min) | Fix: was 120000 |

## Dead Code Removal

### Files to Delete
- `src/hooks/finance/useRefunds.ts` — zero consumers
- `src/api/finance/refunds.ts` — only consumed by useRefunds (dead)

### Files to Trim
- `src/hooks/finance/useBalance.ts` — remove fetchBalance, fetchEnrollmentBalance, adjustBalance, balance, enrollmentBalance, adjustmentResult and related loading/error states
- `src/hooks/finance/index.ts` — remove useRefunds, UseRefundsResult, UseBalanceResult, UseDailyMetricsResult, UseDailyReceiptsResult, UseStudentEnrollmentsReturn exports
- `src/api/finance/index.ts` — remove batchGenerateReceipts, markReceiptAsSent, generateReceiptText, issueRefund, previewOverpaymentRisk, previewRefundRisk exports
- `src/api/finance/types/index.ts` — remove BalanceSummary, BalanceAdjustmentRequest, RefundRequest, RefundResult, RiskAssessment, OverpaymentRisk exports
- `src/api/finance/types/balance.ts` — remove CreditInfoPublic, CreditInfo, BalanceSummaryPublic
- `src/hooks/queryKeys.ts` — remove queryKeys.finance.receipts.search

## Type Changes

### ReceiptLinePublic (src/api/finance/types/receipts.ts)
**Before**: `transaction_type: 'charge' | 'credit' | 'refund' | string`
**After**: `transaction_type: 'charge' | 'credit' | 'refund'`

### UseStudentEnrollmentsReturn (src/hooks/finance/useStudentEnrollments.ts)
**Before**: `studentBalance: StudentBalance | null`
**After**: Remove field (always returns null, dead)

## Shared Constants

### New File: src/components/finance/financeConstants.ts
```typescript
export const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  e_wallet: 'E-Wallet',
  instapay: 'instaPay',
  other: 'Other',
}
```
