# Quickstart: Finance Page Audit & Fix

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Navigate to `/finance` in the app.

## Verification

After implementing changes, run:

```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero errors
```

### Grep Checks

```bash
# Verify no remaining manual fetch patterns
rg 'useState.*isLoading|useState.*error' src/hooks/finance/

# Verify no inline query keys
rg "queryKey: \['" src/hooks/finance/

# Verify no inline time formatting
rg 'toLocaleTimeString|toLocaleDateString|toLocaleString' src/components/finance/

# Verify no unsafe type casts
rg 'as any' src/components/finance/ src/hooks/finance/

# Verify all icons have aria-hidden
rg 'material-symbols-outlined' src/components/finance/ | grep -v aria-hidden

# Verify all headings have font-headline
rg '<h[1-6]' src/components/finance/ | grep -v font-headline

# Verify no text-slate-400 on white
rg 'text-slate-400' src/components/finance/
```

## File Structure

```
src/hooks/finance/
├── index.ts                    # Barrel export (trimmed)
├── useBalance.ts               # Trimmed to useUnpaidEnrollments only
├── useDailyMetrics.ts          # staleTime fix
├── useDailyReceipts.ts         # staleTime fix
├── useReceipts.ts              # Split into focused hooks
├── useStudentBalance.ts        # NEW: useQuery for student balance
├── useUnpaidEnrollments.ts     # NEW: useQuery for unpaid enrollments
├── useAdjustBalance.ts         # NEW: useMutation for adjustments
├── useReceiptSearch.ts         # NEW: useQuery for receipt search
├── useReceiptDetail.ts         # NEW: useQuery for receipt detail
├── useCreateReceipt.ts         # NEW: useMutation for creation
├── useMarkAsSent.ts            # NEW: useMutation for marking sent
├── useBatchGenerate.ts         # NEW: useMutation for batch generation
├── useIssueRefund.ts           # NEW: useMutation for refunds
└── useRefundRiskPreview.ts     # NEW: useMutation for risk preview

src/components/finance/
├── financeConstants.ts         # NEW: shared constants (METHOD_LABELS)
├── CreateReceiptPanel.tsx      # Accessibility + perf fixes
├── ReceiptDetailPanel.tsx      # Accessibility + contrast fixes
├── SlideToConfirm.tsx          # Keyboard accessibility
├── ReceiptLineItemRow.tsx      # Semantic HTML fix
├── EnrollmentSelection.tsx     # Accessibility + contrast fixes
├── TodayReceiptsList.tsx       # formatTime + contrast fixes
├── TodayReceiptsFilters.tsx    # Focus indicator fixes
├── UnpaidEnrollmentsPanel.tsx  # React Query migration
├── UnpaidEnrollmentsFilters.tsx # Import path fix
├── UnpaidEnrollmentCard.tsx    # Typography + contrast fixes
├── PaymentMethodPills.tsx      # Hoisted styles + motion fix
└── ComingSoonPlaceholder.tsx   # Naming convention fix
```

## Implementation Order

1. **US-6**: Remove dead code first (reduces scope for subsequent changes)
2. **US-1**: Migrate hooks to React Query (biggest impact, constitution-aligned)
3. **US-7**: Fix TypeScript quality (clean up types after hook migration)
4. **US-8**: Fix React performance (code splitting, hoisting)
5. **US-10**: Fix bug anti-patterns (time formatting, effect patterns)
6. **US-9**: Fix architecture compliance (naming, imports)
7. **US-2**: Fix confirmation modal accessibility
8. **US-3**: Fix WCAG contrast and focus indicators
9. **US-4**: Add reduced motion support
10. **US-5**: Fix animation timing and typography
