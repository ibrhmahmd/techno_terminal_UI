# Feature Audit Report: Finance Page

Generated: 2026-07-11 | Phases: bug, dead-code, ts-quality, data-fetch, a11y-ux, react-perf, arch-compliance, ui-polish | Mode: standard

## Severity Heatmap

Critical: 7 | High: 36 | Medium: 65 | Low: 34 | **Total: 142**

## Breakdown by Phase

| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 0 | 1 | 5 | 1 | 7 |
| Dead Code | 0 | 4 | 7 | 7 | 18 |
| TS Quality | 0 | 0 | 7 | 4 | 11 |
| Data Fetch | 3 | 5 | 5 | 2 | 15 |
| A11y/UX | 2 | 13 | 10 | 1 | 26 |
| React Perf | 0 | 1 | 7 | 5 | 13 |
| Arch Compliance | 0 | 0 | 6 | 6 | 12 |
| UI Polish | 2 | 12 | 18 | 8 | 40 |
| **Total** | **7** | **36** | **65** | **34** | **142** |

## Top Findings (Critical & High)

### Data Fetch: useBalance.ts:48
**Rule**: manual-useEffect-fetch | **Risk**: breaking
**Before**: Entire hook uses manual useState for data, loading, error states across 4 async actions
**After**: Split into useQuery hooks for reads and useMutation for writes
**Context**: Lines 48-171: fetchBalance, fetchEnrollmentBalance, fetchUnpaidEnrollments, adjustBalance all repeat try/catch/finally/setLoading

### Data Fetch: useReceipts.ts:67
**Rule**: manual-useEffect-fetch | **Risk**: breaking
**Before**: 8 async actions with 8 loading states, 8 error states, 6 data states managed manually
**After**: Split into individual useQuery/useMutation hooks
**Context**: Lines 67-291: 225 lines of manual state management React Query handles out of the box

### Data Fetch: useRefunds.ts:34
**Rule**: manual-useEffect-fetch | **Risk**: breaking
**Before**: Refund issuance and risk preview managed with manual useState
**After**: Split into useIssueRefund and useRefundRiskPreview mutations
**Context**: Lines 34-114: Manual state management for 2 mutations

### A11y: SlideToConfirm.tsx:90
**Rule**: focus-management | **Risk**: breaking
**Before**: Drag handle only supports mouse/touch events, no keyboard fallback
**After**: Add role="slider", tabIndex={0}, onKeyDown handler for ArrowRight, aria-valuemin/max/now
**Context**: Lines 89-106: The sole confirmation mechanism for payment is keyboard-inaccessible

### A11y: CreateReceiptPanel.tsx:592
**Rule**: focus-management | **Risk**: breaking
**Before**: No role='dialog', no aria-modal, no aria-labelledby, no focus trap, no Escape handler
**After**: Add role="dialog", aria-modal="true", aria-labelledby, focus trap ref, Escape key handler, backdrop click dismiss
**Context**: Lines 592-677: Confirmation modal has zero ARIA semantics

### UI Polish: TodayReceiptsFilters.tsx:192
**Rule**: focus-visible | **Risk**: breaking
**Before**: Search inputs have no focus indicator (no focus:ring, no focus:outline)
**After**: Add focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-shadow
**Context**: Lines 186-225: All four search inputs share missing focus styles

### UI Polish: ReceiptLineItemRow.tsx:45
**Rule**: semantic-html | **Risk**: breaking
**Before**: `<div onClick={() => onFocus()}>` used as interactive card selector
**After**: Add role="button", tabIndex={0}, onKeyDown for Enter/Space
**Context**: Lines 44-48: Entire card wrapper is a non-semantic clickable div

### Bug: CreateReceiptPanel.tsx:189
**Rule**: effect-anti-pattern | **Risk**: moderate
**Before**: setActiveLineItemId called inside setLineItems state updater
**After**: Call setActiveLineItemId after setLineItems completes, using current lineItems state
**Context**: Lines 186-193: Side effect inside React state updater violates rules of React

### Data Fetch: useBalance.ts:121
**Rule**: inline-query-key | **Risk**: moderate
**Before**: `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })`
**After**: Use queryKeys.finance.metrics(date) from centralized factory
**Context**: Line 119-121: Missing date segment causes over-invalidation

### Data Fetch: useReceipts.ts:134
**Rule**: inline-query-key | **Risk**: moderate
**Before**: Two inline query keys bypass centralized factory
**After**: Use queryKeys.finance.metrics(date) and queryKeys.finance.dailyReceipts(date)
**Context**: Lines 134-135: Missing date segments cause over-invalidation

### Data Fetch: useRefunds.ts:53
**Rule**: inline-query-key | **Risk**: moderate
**Before**: `queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })`
**After**: Use queryKeys or parent finance key
**Context**: Line 51-53: Bypasses centralized factory

### Data Fetch: useReceipts.ts:162
**Rule**: missing-invalidate | **Risk**: moderate
**Before**: markAsSent performs write but never invalidates any query cache
**After**: Invalidate receipts.detail and dailyReceipts after mutation
**Context**: Lines 162-174: Receipt lists remain stale after marking as sent

### Data Fetch: useReceipts.ts:146
**Rule**: missing-invalidate | **Risk**: moderate
**Before**: batchGenerate performs write but never invalidates any query cache
**After**: Invalidate finance queries after batch generation
**Context**: Lines 146-160: Receipt lists and daily metrics remain stale

### A11y: ReceiptDetailPanel.tsx:27
**Rule**: focus-management | **Risk**: moderate
**Before**: Has role='dialog' and aria-modal but lacks focus trap, Escape handler, initial focus
**After**: Add focus trap ref, Escape key handler, initial focus on open, focus restoration on close
**Context**: Lines 27-34: Dialog has correct role but missing keyboard management

### A11y: CreateReceiptPanel.tsx:359,369
**Rule**: missing-input-label | **Risk**: moderate
**Before**: Visual labels exist but no htmlFor/id association
**After**: Add id attributes to inputs and htmlFor to labels
**Context**: Lines 357-375: Payer Name and General Notes inputs inaccessible to screen readers

### A11y: CreateReceiptPanel.tsx (8 instances)
**Rule**: missing-aria-icon | **Risk**: moderate
**Before**: Material Symbols icons missing aria-hidden="true"
**After**: Add aria-hidden="true" to all decorative icons
**Context**: Lines 445, 452, 459, 486, 538, 551, 597, 610: Screen readers announce raw glyph text

### A11y: EnrollmentSelection.tsx (6 instances)
**Rule**: missing-aria-icon | **Risk**: moderate
**Before**: Material Symbols icons missing aria-hidden="true"
**After**: Add aria-hidden="true" to all decorative icons
**Context**: Lines 53, 65, 142, 180, 201, 224: Error, warning, link, edit, radio, info icons

### React Perf: CreateReceiptPanel.tsx:163
**Rule**: rerender-derived-state | **Risk**: moderate
**Before**: useEffect syncs searchResults into lineItems state
**After**: Apply search results directly via callback or ref, not useEffect
**Context**: Lines 162-173: Derived state in effect causes extra render cycle

### React Perf: FinancePage.tsx:3-6
**Rule**: bundle-dynamic | **Risk**: moderate
**Before**: CreateReceiptPanel, UnpaidEnrollmentsPanel, TodayReceiptsList statically imported
**After**: Use React.lazy() for code splitting (only one renders at a time)
**Context**: src/pages/FinancePage.tsx:3-6: Heavy components in single chunk

### UI Polish: CreateReceiptPanel.tsx:392,485
**Rule**: contrast-ratio | **Risk**: moderate
**Before**: text-slate-400 on white (~3.9:1 contrast ratio)
**After**: Use text-slate-500 for WCAG AA compliance (4.5:1+)
**Context**: Lines 391-488: Suggestions label and empty state text

### UI Polish: TodayReceiptsList.tsx:60,310
**Rule**: contrast-ratio | **Risk**: moderate
**Before**: text-slate-400 on white for time display and column headers
**After**: Use text-slate-500 for readable contrast
**Context**: Lines 60-62, 310-317: Time and header text fail WCAG AA

### UI Polish: CreateReceiptPanel.tsx:593
**Rule**: reduced-motion | **Risk**: moderate
**Before**: animate-fadeIn and animate-scaleIn without motion preference check
**After**: Add motion-reduce:duration-0 or motion-safe: prefix
**Context**: Lines 593-594: Modal animations affect users with vestibular disorders

### UI Polish: SlideToConfirm.tsx:79,103
**Rule**: reduced-motion | **Risk**: moderate
**Before**: animate-pulse on label and handle icon without fallback
**After**: Add motion-reduce:animate-none
**Context**: Lines 79, 103: Pulsing motion can trigger vestibular issues

### UI Polish: SlideToConfirm.tsx:85
**Rule**: animation-timing | **Risk**: moderate
**Before**: duration-75 (75ms) below 100ms minimum
**After**: Use duration-100 for perceptible smooth transition
**Context**: Lines 84-87: Slide fill effect too fast to perceive

### UI Polish: SlideToConfirm.tsx:95
**Rule**: animation-timing | **Risk**: moderate
**Before**: Custom cubic-bezier(0.25, 0.46, 0.45, 0.94)
**After**: Use standard ease-out timing function
**Context**: Lines 94-96: Non-standard timing function

### UI Polish: UnpaidEnrollmentCard.tsx:26
**Rule**: typography-token | **Risk**: moderate
**Before**: h4 heading missing font-headline class
**After**: Add font-headline for Space Grotesk
**Context**: Lines 25-28: Student name heading uses wrong font

### UI Polish: ReceiptDetailPanel.tsx:110
**Rule**: typography-token | **Risk**: moderate
**Before**: h4 'Line Items' heading missing font-headline
**After**: Add font-headline class
**Context**: Lines 109-111: Section heading uses wrong font

## File-by-File Summary

| File | Bugs | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|------|----------|----|-------|------|------|------|----|-------|
| CreateReceiptPanel.tsx | 2 | 0 | 4 | 0 | 10 | 3 | 0 | 10 | 30 |
| useReceipts.ts | 0 | 2 | 2 | 5 | 0 | 0 | 0 | 0 | 9 |
| EnrollmentSelection.tsx | 1 | 0 | 0 | 0 | 6 | 0 | 0 | 3 | 10 |
| ReceiptDetailPanel.tsx | 1 | 0 | 1 | 0 | 1 | 1 | 0 | 4 | 8 |
| useBalance.ts | 0 | 2 | 1 | 3 | 0 | 0 | 0 | 0 | 6 |
| SlideToConfirm.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 4 | 6 |
| TodayReceiptsList.tsx | 1 | 1 | 0 | 0 | 1 | 2 | 0 | 2 | 7 |
| UnpaidEnrollmentsPanel.tsx | 1 | 0 | 1 | 0 | 1 | 2 | 0 | 1 | 6 |
| useRefunds.ts | 0 | 1 | 1 | 2 | 0 | 0 | 0 | 0 | 4 |
| TodayReceiptsFilters.tsx | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 |
| FinancePage.tsx | 0 | 0 | 0 | 0 | 0 | 2 | 0 | 2 | 4 |
| UnpaidEnrollmentsFilters.tsx | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 |
| ReceiptLineItemRow.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 1 | 2 | 4 |
| PaymentMethodPills.tsx | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 2 | 4 |
| UnpaidEnrollmentCard.tsx | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| useDailyMetrics.ts | 0 | 0 | 0 | 2 | 0 | 0 | 0 | 0 | 2 |
| useDailyReceipts.ts | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 1 |
| useStudentEnrollments.ts | 0 | 0 | 1 | 1 | 0 | 0 | 0 | 0 | 2 |
| ComingSoonPlaceholder.tsx | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 1 |

Score legend:
- 0-2 findings — Clean
- 3-5 findings — Needs attention
- 6-10 findings — Needs significant work
- 10+ findings — Needs rewrite

## Dead Code Summary

| Item | Severity | File | Details |
|------|----------|------|---------|
| useRefunds hook | high | useBalance.ts | Exported, zero consumers |
| useBalance oversized | high | useBalance.ts | 14+ properties, only 4 consumed |
| Refunds API module | high | refunds.ts | 3 functions orphaned |
| batchGenerateReceipts, markReceiptAsSent, generateReceiptText | medium | receipts.ts | Zero active callers |
| METHOD_LABELS duplicate | medium | TodayReceiptsList.tsx | Identical in ReceiptDetailPanel |
| queryKeys.finance.receipts.search | medium | queryKeys.ts | Defined, never referenced |
| 4 hook type exports in barrel | medium | index.ts | Zero external consumers |
| CreditInfoPublic, CreditInfo types | low | balance.ts | Not exported from barrel |
| BalanceSummaryPublic interface | low | balance.ts | Zero consumers |
| Legacy type exports | low | types/index.ts | ReceiptItem, Receipt, CreateReceiptResponse |

## Data Fetch Anti-Patterns

| Issue | Files Affected | Severity |
|-------|---------------|----------|
| Manual useState instead of React Query | useBalance, useReceipts, useRefunds | critical |
| Inline query keys (bypass factory) | useBalance, useReceipts, useRefunds | high |
| Missing cache invalidation | useReceipts (markAsSent, batchGenerate) | high |
| Wrong staleTime (2min vs 5min) | useDailyMetrics, useDailyReceipts, useStudentEnrollments | medium |
| useEffect for data fetching | UnpaidEnrollmentsPanel | high |
| Duplicate fetch logic | useBalance, useReceipts | low |
