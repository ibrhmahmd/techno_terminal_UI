# Data Model: Finance UI Tweaks

**Date**: 2026-06-02

## Summary

No new entities. The only data structure change is an extension to the existing `PillOption` interface.

## Changes

### Existing: `PillOption` (in `src/components/finance/PaymentMethodPills.tsx`)

```typescript
interface PillOption {
  value: string
  label: string
}
```

### Updated: `PillOption`

```typescript
interface PillOption {
  value: string
  label: string
  color: string    // Tailwind color class for the pill's unique color
  icon: string     // Material Symbols icon name
}
```

### Payment Method Config Map

```typescript
const PAYMENT_METHODS: PillOption[] = [
  { value: 'cash',     label: 'Cash',     color: 'emerald', icon: 'payments' },
  { value: 'e_wallet', label: 'E-Wallet', color: 'red',     icon: 'account_balance_wallet' },
  { value: 'instapay', label: 'instaPay', color: 'purple',  icon: 'bolt' },
  { value: 'other',    label: 'Other',    color: 'slate',   icon: 'more_horiz' },
]
```
