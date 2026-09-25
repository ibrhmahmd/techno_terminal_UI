# Quickstart: Finance Page UI/UX Modifications

## Key Files

| File | Action |
|------|--------|
| `src/pages/FinancePage.tsx` | Rewrite — metrics-as-nav, no tab bar, panel switching with animation |
| `src/components/common/MetricsStripCards.tsx` | Modify — add `isActive` prop for highlighted card |
| `src/components/finance/PaymentMethodPills.tsx` | NEW — reusable pill selector |
| `src/components/finance/CreateReceiptPanel.tsx` | Modify — pills for method + type, compact layout, draft auto-save |
| `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` | Modify — payment type pills, reduced options, compact row |
| `src/components/finance/TodayReceiptsList.tsx` | Modify — add advanced search section, wire receipt detail |
| `src/components/finance/ReceiptDetailPanel.tsx` | NEW — receipt detail modal/panel with PDF download |
| `src/components/finance/index.ts` | Update barrel exports |

## Build & Test

```bash
npm run build          # tsc -b && vite build
npm run lint           # ESLint
npm run test           # Vitest
npm run dev            # Vite dev server
```

## Key Decisions (from clarifications)

1. **No tab bar** — metrics strip IS the navigation. Four cards → four panels.
2. **Default panel** — Today's Receipts opens on page load.
3. **Payment type pills** — same styling + validation as payment method pills.
4. **Session 2026-06-01** clarifications in spec.md.
