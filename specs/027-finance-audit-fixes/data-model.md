# Data Model: Finance Audit Fixes

**Date**: 2026-06-02

## Summary

No new entities. Changes are limited to existing interface extensions, new query key factory entries, and corrected type unions.

## Changes

### 1. `PillOption.color` — Narrowed Type

**File**: `src/components/finance/PaymentMethodPills.tsx`

**Before**:
```typescript
export interface PillOption {
  value: string
  label: string
  color?: string
  icon?: string
}
```

**After**:
```typescript
export interface PillOption {
  value: string
  label: string
  color?: 'emerald' | 'red' | 'purple' | 'slate'
  icon?: string
}
```

### 2. `QueryKeys` — New Finance Key Factory

**File**: `src/hooks/queryKeys.ts`

**Add**:
```typescript
finance: {
  // ... existing keys
  studentEnrollments: (studentId: number) => ['finance', 'student-enrollments', studentId] as const,
}
```

### 3. `Payment Method Union` — Already Updated

**File**: `src/api/finance/types/receipts.ts`

The `payment_method` union type `'cash' | 'e_wallet' | 'instapay' | 'other'` was already updated in the 026-finance-ui-tweaks feature. Verify consistency across:
- `ReceiptHeader.payment_method`
- `CreateReceiptRequest.method?`
- `Receipt.payment_method`

### 4. `METHOD_LABELS` and `METHOD_COLORS` — Update 3 Components

**Files**:
- `src/components/finance/TodayReceiptsList.tsx`
- `src/components/finance/ReceiptDetailPanel.tsx`
- `src/components/finance/SearchReceiptsPanel.tsx` (remove with dead code instead)

**Change**: Replace `card`/`transfer` entries with `e_wallet`/`instapay` entries.

**Before**:
```typescript
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  transfer: 'Transfer',
  other: 'Other',
}
```

**After** (applied to TodayReceiptsList and ReceiptDetailPanel):
```typescript
const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  e_wallet: 'E-Wallet',
  instapay: 'instaPay',
  other: 'Other',
}
```

### 5. `useStudentEnrollments` — Migration from useState to useQuery

**File**: `src/hooks/finance/useStudentEnrollments.ts`

**Return type**: Maintain backward compatibility — the hook signature `UseStudentEnrollmentsReturn` stays the same but implementation uses `useQuery` internally.

### 6. No New Interfaces or Types

All other changes (accessibility attributes, type assertion guards, ErrorBoundary wrappers) involve no data model changes — only presentational and behavioral modifications.
