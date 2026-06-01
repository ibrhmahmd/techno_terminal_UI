# Contract: ReceiptDetailPanel

**File**: `src/components/finance/ReceiptDetailPanel.tsx` (new)

## Props

```typescript
interface ReceiptDetailPanelProps {
  receiptId: number
  onClose: () => void
  onDownloadPdf: (receiptId: number) => void
}
```

## Behavior

- Opens as a modal or slide-over panel
- Loads receipt details via `getReceiptDetails(receiptId)` from `api/finance/receipts`
- Shows: receipt number, payer name, payment method, issued date/time, line items table (student, amount, type), total
- "Download PDF" button calls `onDownloadPdf(receiptId)`
- Loading: skeleton
- Error: error message with retry
