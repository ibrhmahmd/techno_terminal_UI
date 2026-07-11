# Finance Page Audit & Fix

## Overview

Audit and fix of the finance page feature across 142 findings in 8 audit phases. The finance page is the primary POS (Point of Sale) interface for creating receipts, managing unpaid enrollments, and viewing daily receipt history.

## Problem Statement

The finance page has accumulated significant technical debt across multiple dimensions:
- **3 core hooks** (useBalance, useReceipts, useRefunds) bypass React Query entirely, using manual useState for all data fetching, loading, and error states
- **Critical accessibility gaps** make the slide-to-confirm and confirmation modal completely keyboard-inaccessible
- **40+ UI polish issues** including failed WCAG contrast ratios, missing focus indicators, and broken animations for reduced-motion users
- **18 dead code items** including an entirely unused refunds module and oversized hooks

## User Stories

### US-1: Migrate Finance Hooks to React Query

**As a** developer maintaining the finance feature,
**I want** all finance data fetching hooks to use React Query with centralized query keys,
**So that** we get caching, deduplication, stale-while-revalidate, and consistent error handling for free.

**Acceptance Criteria:**
- useBalance.ts split into focused hooks: useStudentBalance (useQuery), useUnpaidEnrollments (useQuery), useAdjustBalance (useMutation)
- useReceipts.ts split into: useReceiptSearch (useQuery), useReceiptDetail (useQuery), useCreateReceipt (useMutation), useMarkAsSent (useMutation), useBatchGenerate (useMutation)
- useRefunds.ts split into: useIssueRefund (useMutation), useRefundRiskPreview (useMutation)
- All hooks use queryKeys.finance.* from centralized factory (no inline keys)
- All mutations call queryClient.invalidateQueries on success
- staleTime set to 5 minutes (300000) per project convention
- UnpaidEnrollmentsPanel migrated from useEffect fetching to useQuery

**Files:**
- src/hooks/finance/useBalance.ts
- src/hooks/finance/useReceipts.ts
- src/hooks/finance/useRefunds.ts
- src/hooks/finance/useDailyMetrics.ts
- src/hooks/finance/useDailyReceipts.ts
- src/hooks/finance/useStudentEnrollments.ts
- src/components/finance/UnpaidEnrollmentsPanel.tsx

---

### US-2: Fix Confirmation Modal Accessibility

**As a** user relying on keyboard navigation or screen reader,
**I want** the receipt confirmation modal and slide-to-confirm to be fully accessible,
**So that** I can complete payment flows without a mouse.

**Acceptance Criteria:**
- SlideToConfirm: Add role="slider", tabIndex={0}, onKeyDown (ArrowRight to advance, Enter to confirm), aria-valuemin/max/now
- Confirmation modal: Add role="dialog", aria-modal="true", aria-labelledby, focus trap, Escape key handler, backdrop click dismiss
- All Material Symbols icons have aria-hidden="true"
- Payer Name and General Notes inputs have htmlFor/id label association
- ReceiptDetailPanel dialog gets Escape handler and focus management
- Delete button uses aria-label instead of title attribute

**Files:**
- src/components/finance/CreateReceipt/SlideToConfirm.tsx
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx
- src/components/finance/CreateReceipt/EnrollmentSelection.tsx

---

### US-3: Fix WCAG Contrast and Focus Indicators

**As a** user with low vision or using keyboard navigation,
**I want** all text to meet WCAG AA contrast ratios and all interactive elements to have visible focus indicators,
**So that** I can read content and navigate without guessing where focus is.

**Acceptance Criteria:**
- All text-slate-400 on white backgrounds changed to text-slate-500 (4.5:1+ contrast)
- All search inputs in TodayReceiptsFilters get focus:ring-2 focus:ring-secondary/20
- Close button in ReceiptDetailPanel gets focus-visible styles
- EGP currency suffix uses text-slate-500
- Arrow separators use text-slate-400 instead of text-slate-300

**Files:**
- src/components/finance/TodayReceiptsFilters.tsx
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/TodayReceiptsList.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/components/finance/ReceiptLineItemRow.tsx
- src/components/finance/EnrollmentSelection.tsx
- src/components/finance/UnpaidEnrollmentsFilters.tsx
- src/components/finance/UnpaidEnrollmentCard.tsx
- src/components/finance/SlideToConfirm.tsx

---

### US-4: Add Reduced Motion Support

**As a** user with vestibular disorders or motion sensitivity,
**I want** all animations to respect my prefers-reduced-motion setting,
**So that** I can use the interface without discomfort.

**Acceptance Criteria:**
- Confirmation modal: animate-fadeIn and animate-scaleIn get motion-reduce:duration-0
- Draft restored badge: animate-pulse gets motion-reduce:animate-none
- SlideToConfirm: animate-pulse on label and handle gets motion-reduce:animate-none
- PaymentMethodPills: animate-shake gets motion-reduce:animate-none
- EnrollmentSelection: animate-bounce gets motion-reduce:animate-none
- FinancePage panel content: animate-fadeIn gets motion-reduce:animate-none

**Files:**
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/CreateReceipt/SlideToConfirm.tsx
- src/components/finance/PaymentMethodPills.tsx
- src/components/finance/CreateReceipt/EnrollmentSelection.tsx
- src/pages/FinancePage.tsx

---

### US-5: Fix Animation Timing and Typography

**As a** user,
**I want** animations to feel smooth and consistent, and headings to use the correct design system font,
**So that** the interface feels polished and professional.

**Acceptance Criteria:**
- SlideToConfirm: duration-75 changed to duration-100
- SlideToConfirm: custom cubic-bezier changed to ease-out
- All h3/h4 headings in finance components get font-headline class
- Spacing values aligned to 4px grid (py-2.5 -> py-2, gap-1.5 -> gap-2, gap-3.5 -> gap-3, space-y-3.5 -> space-y-3)
- ReceiptDetailPanel modal backdrop uses bg-black/60 backdrop-blur-sm (glassmorphism)
- FinancePage sticky header uses bg-white/80 backdrop-blur-xl

**Files:**
- src/components/finance/CreateReceipt/SlideToConfirm.tsx
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/components/finance/UnpaidEnrollmentCard.tsx
- src/components/finance/EnrollmentSelection.tsx
- src/components/finance/PaymentMethodPills.tsx
- src/pages/FinancePage.tsx

---

### US-6: Remove Dead Code and Fix Barrel Exports

**As a** developer,
**I want** dead code removed and barrel files cleaned up,
**So that** the codebase is maintainable and bundle size is minimal.

**Acceptance Criteria:**
- useRefunds hook and refunds API module removed (zero consumers)
- useBalance trimmed to only expose used properties (fetchUnpaidEnrollments, unpaidEnrollments, isLoadingUnpaidEnrollments, unpaidEnrollmentsError)
- Unused barrel exports removed: UseRefundsResult, UseBalanceResult, UseDailyMetricsResult, UseDailyReceiptsResult, UseStudentEnrollmentsReturn
- Unused API barrel exports removed: batchGenerateReceipts, markReceiptAsSent, generateReceiptText, issueRefund, previewOverpaymentRisk, previewRefundRisk
- Unused type barrel exports removed: BalanceSummary, BalanceAdjustmentRequest, RefundRequest, RefundResult, RiskAssessment, OverpaymentRisk
- queryKeys.finance.receipts.search removed
- CreditInfoPublic, CreditInfo, BalanceSummaryPublic types removed from balance.ts
- Legacy type exports (ReceiptItem, Receipt, CreateReceiptResponse) removed
- METHOD_LABELS extracted to shared constants file (used by TodayReceiptsList and ReceiptDetailPanel)
- Duplicate import statements in TodayReceiptsList merged

**Files:**
- src/hooks/finance/useRefunds.ts (delete)
- src/hooks/finance/useBalance.ts
- src/hooks/finance/index.ts
- src/api/finance/refunds.ts (delete)
- src/api/finance/index.ts
- src/api/finance/balance.ts
- src/api/finance/types/index.ts
- src/api/finance/types/balance.ts
- src/hooks/queryKeys.ts
- src/components/finance/TodayReceiptsList.tsx

---

### US-7: Fix TypeScript Quality Issues

**As a** developer,
**I want** unsafe type casts replaced with proper type guards and inline query keys eliminated,
**So that** the codebase is type-safe and follows project conventions.

**Acceptance Criteria:**
- Session storage deserialization uses unknown + structural validation (not `as Record<string, unknown>`)
- Payment method validation uses type guard function (not `as` cast)
- UnpaidEnrollmentsPanel groupBy options use `as const`
- All inline query keys replaced with queryKeys.finance.* factory
- ReceiptLinePublic transaction_type union removes `| string` fallback
- UseStudentEnrollmentsReturn interface removes dead studentBalance field
- ReceiptDetailPanel removes redundant `enabled: true`

**Files:**
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/UnpaidEnrollmentsPanel.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/hooks/finance/useBalance.ts
- src/hooks/finance/useReceipts.ts
- src/hooks/finance/useRefunds.ts
- src/hooks/finance/useStudentEnrollments.ts
- src/api/finance/types/receipts.ts

---

### US-8: Fix React Performance Issues

**As a** user,
**I want** the finance page to load quickly and respond smoothly,
**So that** I can process receipts without lag.

**Acceptance Criteria:**
- FinancePage: CreateReceiptPanel, UnpaidEnrollmentsPanel, TodayReceiptsList use React.lazy() for code splitting
- UnpaidEnrollmentsPanel: Pagination import from direct path instead of barrel
- TodayReceiptsList: Finance hooks imported from direct paths instead of barrel
- FinancePage: Finance hooks imported from direct paths instead of barrel
- CreateReceiptPanel: search results applied via callback/ref, not useEffect
- ReceiptDetailPanel: RegExp hoisted to module scope
- PaymentMethodPills: COLOR_STYLES object hoisted to module scope
- CreateReceiptPanel: getSessionDraft parsed once, not 6 times
- TodayReceiptsList: selectedReceiptId checked with !== null instead of &&
- FinancePage: setTimeout in handleSuccess gets ref + cleanup on unmount
- ReceiptLineItemRow: setActiveLineItemId called outside setLineItems updater

**Files:**
- src/pages/FinancePage.tsx
- src/components/finance/UnpaidEnrollmentsPanel.tsx
- src/components/finance/TodayReceiptsList.tsx
- src/components/finance/CreateReceiptPanel.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/components/finance/PaymentMethodPills.tsx
- src/components/finance/ReceiptLineItemRow.tsx

---

### US-9: Fix Architecture Compliance

**As a** developer,
**I want** finance components to follow project conventions for naming, imports, and structure,
**So that** the codebase is consistent and maintainable.

**Acceptance Criteria:**
- ComingSoonPlaceholder renamed to FinanceComingSoonPlaceholder
- SlideToConfirm renamed to FinanceSlideToConfirm (or kept as-is if nested under finance/)
- PaymentMethodPills renamed to FinancePaymentMethodPills (or kept as-is if nested under finance/)
- TodayReceiptsFilters imports ReportDaySelectorBar from common/ instead of reports/
- UnpaidEnrollmentsFilters imports GroupCombobox from common/combobox/ instead of groups/
- ReceiptLineItemRow imports StudentCombobox from common/combobox/ instead of student/
- CreateReceiptPanel imports useStudentsSearch from hooks/finance/ instead of hooks/useDirectory

**Files:**
- src/components/finance/ComingSoonPlaceholder.tsx
- src/components/finance/CreateReceipt/SlideToConfirm.tsx
- src/components/finance/PaymentMethodPills.tsx
- src/components/finance/TodayReceiptsFilters.tsx
- src/components/finance/UnpaidEnrollmentsFilters.tsx
- src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx
- src/components/finance/CreateReceiptPanel.tsx

---

### US-10: Fix Bug Anti-Patterns

**As a** developer,
**I want** React anti-patterns and time formatting inconsistencies fixed,
**So that** the app behaves predictably and displays times consistently.

**Acceptance Criteria:**
- TodayReceiptsList uses formatTime() instead of toLocaleTimeString()
- ReceiptDetailPanel uses formatTime()/formatDate() instead of toLocaleString()
- EnrollmentSelection uses formatDate() instead of toLocaleDateString()
- CreateReceiptPanel handleRemoveLineItem calls setActiveLineItemId outside setLineItems updater
- EnrollmentSelection useEffect removes onSelect from dependency array (use eslint-disable comment)
- CreateReceiptPanel PRESET filter uses conditional check instead of non-null assertion

**Files:**
- src/components/finance/TodayReceiptsList.tsx
- src/components/finance/ReceiptDetailPanel.tsx
- src/components/finance/CreateReceipt/EnrollmentSelection.tsx
- src/components/finance/CreateReceiptPanel.tsx

---

## Non-Goals

- Database performance optimizations (Phase 9 disabled)
- New feature development (refunds UI, competition finance)
- Mobile-specific layout changes (handled by separate mobile audit)
- Backend API changes (frontend-only)

## Dependencies

- queryKeys.ts: Finance query key factory (already exists)
- src/utils/formatting.ts: formatTime, formatDate utilities (already exist)
- src/api/client.ts: API client with auth interceptors (already exists)

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| React Query migration breaks existing data flow | Migrate one hook at a time, verify with manual testing |
| Barrel export cleanup breaks imports | Grep for all consumers before removing |
| Accessibility changes affect layout | Use CSS-only focus styles where possible |
| Animation timing changes feel different | Test with users, keep changes minimal |
