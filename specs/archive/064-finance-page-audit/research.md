# Research: Finance Page Audit & Fix

## Decisions

### D1: React Query Migration Strategy

**Decision**: Migrate hooks incrementally — one hook at a time, keeping the same external API surface where possible.

**Rationale**: The 3 hooks (useBalance, useReceipts, useRefunds) are consumed by multiple components. A big-bang rewrite risks breaking all consumers simultaneously. Incremental migration allows verifying each hook works before moving to the next.

**Alternatives considered**:
- Big-bang rewrite of all hooks at once — rejected due to risk of cascading failures
- Leaving hooks as-is and wrapping with React Query — rejected because it adds unnecessary complexity

### D2: useBalance Hook Decomposition

**Decision**: Split useBalance into 3 focused hooks:
1. `useStudentBalance(studentId)` — useQuery for single student balance
2. `useUnpaidEnrollments(params)` — useQuery for paginated unpaid enrollments list
3. `useAdjustBalance()` — useMutation for balance adjustments

**Rationale**: The current hook exposes 14+ properties but only 4 are consumed (fetchUnpaidEnrollments, unpaidEnrollments, isLoadingUnpaidEnrollments, unpaidEnrollmentsError). Splitting follows single-responsibility and matches React Query's idiomatic pattern.

**Alternatives considered**:
- Keep as single hook with internal React Query — rejected because it couples unrelated data fetching

### D3: useReceipts Hook Decomposition

**Decision**: Split useReceipts into focused hooks:
1. `useReceiptSearch(params)` — useQuery for searching receipts
2. `useReceiptDetail(id)` — useQuery for single receipt details
3. `useCreateReceipt()` — useMutation for creating receipts
4. `useMarkAsSent()` — useMutation for marking receipts as sent
5. `useBatchGenerate()` — useMutation for batch generation
6. `useDownloadReceiptPdf()` — callback (not a hook, just a function)

**Rationale**: Each action has different cache invalidation needs and different consumers. Splitting allows granular cache control.

### D4: useRefunds Hook Decomposition

**Decision**: Split into 2 mutation hooks:
1. `useIssueRefund()` — useMutation
2. `useRefundRiskPreview()` — useMutation

**Rationale**: Both are write operations with no query caching needed. The hook is currently dead code (zero consumers), but we keep the API functions for future use.

### D5: Dead Code Removal Strategy

**Decision**: Remove useRefunds hook and refunds API module entirely. Trim useBalance to only exposed properties. Clean barrel exports.

**Rationale**: useRefunds has zero consumers. The API functions in refunds.ts are only called by useRefunds. Removing dead code reduces bundle size and cognitive load. The refunds types can be re-added when refund UI is actually implemented.

**Alternatives considered**:
- Keep useRefunds with `@deprecated` tag — rejected because dead code should be removed, not marked

### D6: SlideToConfirm Accessibility Pattern

**Decision**: Implement as a custom slider with role="slider", keyboard support (ArrowRight to advance, Enter to confirm), and ARIA attributes.

**Rationale**: The slide-to-confirm is the sole payment confirmation mechanism. Making it keyboard-accessible is critical for WCAG compliance. Using the native slider role provides screen reader semantics.

**Alternatives considered**:
- Replace with a button + confirmation dialog — rejected because it changes the UX flow
- Use a checkbox — rejected because it doesn't match the slide interaction pattern

### D7: Focus Management Strategy

**Decision**: Use React refs for focus trap in modals. Add Escape key handlers via useEffect. Use CSS focus-visible for focus indicators.

**Rationale**: React doesn't have built-in focus management. Using refs + useEffect is the standard pattern. CSS focus-visible avoids showing focus rings on mouse clicks.

**Alternatives considered**:
- Use a focus management library — rejected because it adds a dependency for simple cases
- Use native dialog element — rejected because it has inconsistent browser support

### D8: Animation Timing Standardization

**Decision**: Use Tailwind's standard timing values: duration-100, duration-150, duration-200, duration-300 with ease-out timing.

**Rationale**: The design system specifies 100-300ms durations. Standard Tailwind values ensure consistency across the app.

### D9: Glassmorphism Consistency

**Decision**: Apply bg-white/70 + backdrop-blur-xl + border pattern to modal overlays and sticky headers.

**Rationale**: The app uses glassmorphism for overlays. Consistency with existing patterns (e.g., BottomNav, MobileNavSheet) is important.

**Alternatives considered**:
- Use opaque backgrounds — rejected because it breaks visual consistency

### D10: Code Splitting Strategy

**Decision**: Use React.lazy() for the 3 finance panels in FinancePage (CreateReceiptPanel, UnpaidEnrollmentsPanel, TodayReceiptsList) since only one renders at a time.

**Rationale**: These are heavy components (~200+ lines each). Code splitting reduces initial bundle size. The panels are mutually exclusive (controlled by activePanel state), so lazy loading is safe.

### D11: Barrel Import Cleanup

**Decision**: Import directly from specific files (e.g., `../../hooks/finance/useReceipts`) instead of barrel (`../../hooks/finance`).

**Rationale**: Barrel imports pull all exports into the bundle. Direct imports ensure tree-shaking works correctly and reduce bundle size.

### D12: METHOD_LABELS Shared Constant

**Decision**: Extract METHOD_LABELS to a new file `src/components/finance/financeConstants.ts`.

**Rationale**: The constant is duplicated in TodayReceiptsList and ReceiptDetailPanel. A shared constants file follows the existing pattern (e.g., `src/config/`).

## Open Questions

None — all technical decisions resolved.
