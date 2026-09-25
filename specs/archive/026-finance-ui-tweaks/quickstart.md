# Quickstart: Finance UI Tweaks

## What Changed

1. **Navigation**: Metrics strip cards → labeled tab bar (Today's Receipts, Create Receipt, Unpaid, Refunds)
2. **Payment Pills**: Updated with 4 options (Cash, E-Wallet, instaPay, Other) each with unique color and icon
3. **Layout**: Line item rows use two-column layout (Student/Enrollment left, Amount/Discount/Payment Type right)
4. **Validation**: Payment method is now required on receipt creation

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/FinancePage.tsx` | Remove `<MetricsStripCards>`, add tab label navigation |
| `src/components/finance/PaymentMethodPills.tsx` | Add `color` and `icon` to `PillOption`, update rendering |
| `src/components/finance/CreateReceiptPanel.tsx` | Use new payment config, add payment method validation |
| `src/components/finance/ReceiptLineItemRow.tsx` | Two-column layout |

## Files to Create

None — all modifications to existing files.

## Verification

- `npm run lint && npm run build` must pass
- Navigate to Finance page → no metrics cards, tab labels visible
- Click each tab → panel content switches
- Create Receipt → 4 colored payment pills render, submit without selecting shows error
- Line item row → Student left, Amount/Discount/Payment Type right
