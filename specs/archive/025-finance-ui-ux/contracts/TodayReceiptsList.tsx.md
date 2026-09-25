# Contract: TodayReceiptsList

**File**: `src/components/finance/TodayReceiptsList.tsx` (modify)

## Props

```typescript
interface TodayReceiptsListProps {
  onDownloadPdf?: (receiptId: number) => void
  onNavigateToCreate?: () => void
}
```

## Behavior

- Shows `ReportDaySelectorBar` at top (date selector)
- Below: summary bar with receipt count + "Create Receipt" CTA + total amount
- Below: paginated receipt list with columns: receipt_number, payer_name, amount, payment_method (badge), time
- "Advanced Search" expandable section: date range (from/to), payer name input, sort dropdown
- Clicking a receipt row opens `ReceiptDetailPanel` (modal or slide-over)
