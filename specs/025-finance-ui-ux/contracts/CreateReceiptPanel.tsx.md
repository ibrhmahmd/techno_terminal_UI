# Contract: CreateReceiptPanel

**File**: `src/components/finance/CreateReceiptPanel.tsx` (modify)

## Props (unchanged)

```typescript
interface CreateReceiptPanelProps {
  isLoading: boolean
  onSuccess: (message: string, receiptId?: number) => void
  onError: (message: string) => void
  initialData?: UnpaidEnrollment | null
  onClearInitialData?: () => void
  onNavigateToUnpaid?: () => void
}
```

## Changes Required

### 1. Payment Method → Pill Selector
- Replace `<select>` dropdown with `<PaymentMethodPills>` component
- Props: `options`, `selected`, `onChange`, `error`
- Options: `[{ value: 'cash', label: 'Cash' }, { value: 'card', label: 'Card' }, { value: 'transfer', label: 'Bank Transfer' }, { value: 'other', label: 'Other' }]`
- No default selection
- On submit without selection → inline red warning + shake animation on pill group

### 2. Payment Type → Pill Selector (in line items)
- In `ReceiptLineItemRow.tsx`, replace the payment type `<select>` with `<PaymentMethodPills>` (reused component)
- Options: `[{ value: 'course_level', label: 'Course Level' }, { value: 'competition', label: 'Competition' }, { value: 'other', label: 'Other' }]`
- No default selection
- On submit without selection per line item → inline red warning

### 3. Compact Line Item Layout
- Desktop: `flex flex-row gap-2 items-start` — fields flow horizontally
- Mobile: `flex flex-col` — fields stack vertically

### 4. Draft Auto-Save
- Every 10s: serialize `{ payerName, paymentMethod, notes, lineItems }` to `sessionStorage` key `'receipt-draft'`
- On mount: check for draft → if found, populate form + show toast "Draft restored"
- On successful create: clear draft from sessionStorage
