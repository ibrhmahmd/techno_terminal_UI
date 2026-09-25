# Tasks: Finance Page Audit & Fix

**Input**: Design documents from `/specs/064-finance-page-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not requested — this is a refactor/fix audit, not new feature development.

**Organization**: Tasks are grouped by user story. US-6 (dead code) runs first to reduce scope for all subsequent stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/finance/`
  - Components: `src/components/finance/`
  - Hooks: `src/hooks/finance/`
  - Pages: `src/pages/FinancePage.tsx`
  - Types: `src/api/finance/types/`
  - Shared constants: `src/components/finance/financeConstants.ts` (new)

---

## Phase 1: Foundational — Remove Dead Code (US-6)

**Purpose**: Remove dead code first to reduce scope for all subsequent changes. This phase MUST complete before user stories begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] [US6] Delete useRefunds hook (zero consumers) in `src/hooks/finance/useRefunds.ts`
- [ ] T002 [P] [US6] Delete refunds API module (only consumer is dead useRefunds) in `src/api/finance/refunds.ts`
- [ ] T003 [P] [US6] Extract METHOD_LABELS to shared constants file in `src/components/finance/financeConstants.ts`
- [ ] T004 [US6] Trim useBalance to only expose used properties (fetchUnpaidEnrollments, unpaidEnrollments, isLoadingUnpaidEnrollments, unpaidEnrollmentsError) in `src/hooks/finance/useBalance.ts`
- [ ] T005 [US6] Clean hooks barrel: remove useRefunds, UseRefundsResult, UseBalanceResult, UseDailyMetricsResult, UseDailyReceiptsResult, UseStudentEnrollmentsReturn exports in `src/hooks/finance/index.ts`
- [ ] T006 [US6] Clean API barrel: remove batchGenerateReceipts, markReceiptAsSent, generateReceiptText, issueRefund, previewOverpaymentRisk, previewRefundRisk exports in `src/api/finance/index.ts`
- [ ] T007 [US6] Clean types barrel: remove BalanceSummary, BalanceAdjustmentRequest, RefundRequest, RefundResult, RiskAssessment, OverpaymentRisk exports in `src/api/finance/types/index.ts`
- [ ] T008 [US6] Remove dead types: CreditInfoPublic, CreditInfo, BalanceSummaryPublic from `src/api/finance/types/balance.ts`
- [ ] T009 [US6] Remove legacy type exports: ReceiptItem, Receipt, CreateReceiptResponse from `src/api/finance/types/receipts.ts`
- [ ] T010 [US6] Remove unused query key: queryKeys.finance.receipts.search from `src/hooks/queryKeys.ts`
- [ ] T011 [US6] Update TodayReceiptsList to import METHOD_LABELS from shared constants and merge duplicate imports in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T012 [US6] Update ReceiptDetailPanel to import METHOD_LABELS from shared constants in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T013 Run `npm run build` and verify zero errors

**Checkpoint**: Dead code removed — scope reduced for all subsequent phases

---

## Phase 2: User Story 1 — Migrate Finance Hooks to React Query (Priority: P1) 🎯 MVP

**Goal**: All finance data fetching hooks use React Query with centralized query keys, caching, and proper invalidation.

**Independent Test**: Finance page loads data correctly, receipt creation works, search works, unpaid enrollments display, mutations invalidate cache.

### Implementation for User Story 1

- [ ] T014 [US1] Create useUnpaidEnrollments hook with useQuery in `src/hooks/finance/useUnpaidEnrollments.ts`
- [ ] T015 [US1] Create useCreateReceipt mutation hook in `src/hooks/finance/useCreateReceipt.ts`
- [ ] T016 [US1] Create useMarkAsSent mutation hook in `src/hooks/finance/useMarkAsSent.ts`
- [ ] T017 [US1] Create useBatchGenerate mutation hook in `src/hooks/finance/useBatchGenerate.ts`
- [ ] T018 [US1] Create useReceiptSearch hook with useQuery in `src/hooks/finance/useReceiptSearch.ts`
- [ ] T019 [US1] Create useReceiptDetail hook with useQuery in `src/hooks/finance/useReceiptDetail.ts`
- [ ] T020 [US1] Update hooks barrel to export new hooks in `src/hooks/finance/index.ts`
- [ ] T021 [US1] Migrate UnpaidEnrollmentsPanel from useEffect to useUnpaidEnrollments in `src/components/finance/UnpaidEnrollmentsPanel.tsx`
- [ ] T022 [US1] Migrate FinancePage to use new hooks in `src/pages/FinancePage.tsx`
- [ ] T023 [US1] Migrate TodayReceiptsList to use new hooks in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T024 [US1] Migrate ReceiptDetailPanel to use useReceiptDetail in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T025 [US1] Migrate CreateReceiptPanel to use new mutation hooks in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T026 [US1] Fix staleTime in useDailyMetrics to 300000 (was 120000) in `src/hooks/finance/useDailyMetrics.ts`
- [ ] T027 [US1] Fix staleTime in useDailyReceipts to 300000 (was 120000) in `src/hooks/finance/useDailyReceipts.ts`
- [ ] T028 [US1] Fix staleTime in useStudentEnrollments to 300000 (was 120000) in `src/hooks/finance/useStudentEnrollments.ts`
- [ ] T029 [US1] Add cache invalidation to useMarkAsSent (receipts.detail + dailyReceipts) in `src/hooks/finance/useMarkAsSent.ts`
- [ ] T030 [US1] Add cache invalidation to useBatchGenerate (finance prefix) in `src/hooks/finance/useBatchGenerate.ts`
- [ ] T031 Run `npm run build` and verify zero errors

**Checkpoint**: All finance data fetching migrated to React Query — caching, deduplication, and invalidation working

---

## Phase 3: User Story 7 — Fix TypeScript Quality (Priority: P2)

**Goal**: Unsafe type casts replaced with proper type guards, inline query keys eliminated.

**Independent Test**: Build passes strict TypeScript checks, no `as any` casts, no inline query keys.

### Implementation for User Story 7

- [ ] T032 [P] [US7] Add type guard for session storage deserialization in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T033 [P] [US7] Add type guard for payment method validation in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T034 [P] [US7] Use `as const` for UnpaidEnrollmentsPanel groupBy options in `src/components/finance/UnpaidEnrollmentsPanel.tsx`
- [ ] T035 [P] [US7] Remove `| string` from ReceiptLinePublic transaction_type union in `src/api/finance/types/receipts.ts`
- [ ] T036 [P] [US7] Remove dead studentBalance field from UseStudentEnrollmentsReturn in `src/hooks/finance/useStudentEnrollments.ts`
- [ ] T037 [P] [US7] Remove redundant `enabled: true` from ReceiptDetailPanel in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T038 Run `npm run build` and verify zero errors

**Checkpoint**: TypeScript quality improved — no unsafe casts, proper type guards

---

## Phase 4: User Story 8 — Fix React Performance (Priority: P3)

**Goal**: Finance page loads quickly with code splitting, optimized imports, and efficient state management.

**Independent Test**: Finance page initial load is faster, no unnecessary re-renders, RegExp and objects hoisted.

### Implementation for User Story 8

- [ ] T039 [US8] Add React.lazy() for CreateReceiptPanel, UnpaidEnrollmentsPanel, TodayReceiptsList in `src/pages/FinancePage.tsx`
- [ ] T040 [P] [US8] Fix Pagination import to direct path in `src/components/finance/UnpaidEnrollmentsPanel.tsx`
- [ ] T041 [P] [US8] Fix finance hook imports to direct paths in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T042 [P] [US8] Fix finance hook imports to direct paths in `src/pages/FinancePage.tsx`
- [ ] T043 [US8] Hoist RegExp to module scope in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T044 [US8] Hoist COLOR_STYLES to module scope in `src/components/finance/PaymentMethodPills.tsx`
- [ ] T045 [US8] Parse getSessionDraft once (not 6 times) in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T046 [US8] Fix selectedReceiptId check to use !== null in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T047 [US8] Add setTimeout ref + cleanup on unmount in `src/pages/FinancePage.tsx`
- [ ] T048 [US8] Move setActiveLineItemId outside setLineItems updater in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T049 [US8] Apply search results via callback/ref instead of useEffect in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T050 Run `npm run build` and verify zero errors

**Checkpoint**: Performance optimized — code splitting, hoisted values, efficient state

---

## Phase 5: User Story 10 — Fix Bug Anti-Patterns (Priority: P4)

**Goal**: React anti-patterns fixed and time formatting made consistent across all finance components.

**Independent Test**: All times display in 12h format via formatTime, no side effects in state updaters.

### Implementation for User Story 10

- [ ] T051 [P] [US10] Replace toLocaleTimeString with formatTime in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T052 [P] [US10] Replace toLocaleString with formatTime/formatDate in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T053 [P] [US10] Replace toLocaleDateString with formatDate in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T054 [US10] Fix handleRemoveLineItem: call setActiveLineItemId outside setLineItems updater in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T055 [US10] Fix EnrollmentSelection useEffect: remove onSelect from deps, add eslint-disable comment in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T056 [US10] Fix PRESET filter: use conditional check instead of non-null assertion in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T057 Run `npm run build` and verify zero errors

**Checkpoint**: Bug anti-patterns fixed — consistent time display, safe React patterns

---

## Phase 6: User Story 9 — Fix Architecture Compliance (Priority: P5)

**Goal**: Finance components follow project conventions for naming, imports, and structure.

**Independent Test**: All imports use correct paths, component names follow convention.

### Implementation for User Story 9

- [ ] T058 [P] [US9] Rename ComingSoonPlaceholder to FinanceComingSoonPlaceholder in `src/components/finance/ComingSoonPlaceholder.tsx`
- [ ] T059 [P] [US9] Fix TodayReceiptsFilters import: ReportDaySelectorBar from common/ in `src/components/finance/TodayReceiptsFilters.tsx`
- [ ] T060 [P] [US9] Fix UnpaidEnrollmentsFilters import: GroupCombobox from common/combobox/ in `src/components/finance/UnpaidEnrollmentsFilters.tsx`
- [ ] T061 [P] [US9] Fix ReceiptLineItemRow import: StudentCombobox from common/combobox/ in `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`
- [ ] T062 [US9] Fix CreateReceiptPanel import: useStudentsSearch from hooks/finance/ in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T063 Run `npm run build` and verify zero errors

**Checkpoint**: Architecture compliance achieved — consistent naming and imports

---

## Phase 7: User Story 2 — Fix Confirmation Modal Accessibility (Priority: P6)

**Goal**: Receipt confirmation modal and slide-to-confirm are fully keyboard accessible with proper ARIA semantics.

**Independent Test**: Complete payment flow using only keyboard, screen reader announces all elements correctly.

### Implementation for User Story 2

- [ ] T064 [US2] Add keyboard accessibility to SlideToConfirm: role="slider", tabIndex={0}, onKeyDown, aria-valuemin/max/now in `src/components/finance/CreateReceipt/SlideToConfirm.tsx`
- [ ] T065 [US2] Add ARIA to confirmation modal: role="dialog", aria-modal, aria-labelledby, focus trap, Escape handler in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T066 [US2] Add aria-hidden="true" to all Material Symbols icons in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T067 [US2] Add aria-hidden="true" to all Material Symbols icons in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T068 [US2] Add htmlFor/id association to Payer Name and General Notes inputs in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T069 [US2] Add Escape handler and focus management to ReceiptDetailPanel dialog in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T070 [US2] Replace title with aria-label on delete button in `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`
- [ ] T071 Run `npm run build` and verify zero errors

**Checkpoint**: Payment flow fully keyboard accessible — screen reader compatible

---

## Phase 8: User Story 3 — Fix WCAG Contrast and Focus Indicators (Priority: P7)

**Goal**: All text meets WCAG AA contrast ratios, all interactive elements have visible focus indicators.

**Independent Test**: Visual inspection of all finance components for contrast and focus visibility.

### Implementation for User Story 3

- [ ] T072 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/TodayReceiptsFilters.tsx`
- [ ] T073 [P] [US3] Add focus indicators to search inputs in `src/components/finance/TodayReceiptsFilters.tsx`
- [ ] T074 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T075 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/TodayReceiptsList.tsx`
- [ ] T076 [P] [US3] Fix contrast and add focus-visible to close button in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T077 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/ReceiptLineItemRow.tsx`
- [ ] T078 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T079 [P] [US3] Fix contrast: text-slate-400 → text-slate-500 in `src/components/finance/UnpaidEnrollmentsFilters.tsx`
- [ ] T080 [P] [US3] Fix contrast: text-slate-300 → text-slate-400 for arrows in `src/components/finance/UnpaidEnrollmentCard.tsx`
- [ ] T081 Run `npm run build` and verify zero errors

**Checkpoint**: WCAG AA contrast achieved — all text readable, focus visible

---

## Phase 9: User Story 4 — Add Reduced Motion Support (Priority: P8)

**Goal**: All animations respect prefers-reduced-motion setting.

**Independent Test**: Enable reduced motion in OS settings, verify no animations play.

### Implementation for User Story 4

- [ ] T082 [P] [US4] Add motion-reduce:duration-0 to confirmation modal animations in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T083 [P] [US4] Add motion-reduce:animate-none to draft badge pulse in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T084 [P] [US4] Add motion-reduce:animate-none to SlideToConfirm pulse in `src/components/finance/CreateReceipt/SlideToConfirm.tsx`
- [ ] T085 [P] [US4] Add motion-reduce:animate-none to PaymentMethodPills shake in `src/components/finance/PaymentMethodPills.tsx`
- [ ] T086 [P] [US4] Add motion-reduce:animate-none to EnrollmentSelection bounce in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T087 [P] [US4] Add motion-reduce:animate-none to FinancePage panel fade in `src/pages/FinancePage.tsx`
- [ ] T088 Run `npm run build` and verify zero errors

**Checkpoint**: Reduced motion respected — comfortable experience for all users

---

## Phase 10: User Story 5 — Fix Animation Timing and Typography (Priority: P9)

**Goal**: Animations use standard timing, headings use design system font, spacing aligned to 4px grid.

**Independent Test**: Visual inspection of all finance components for timing, typography, and spacing consistency.

### Implementation for User Story 5

- [ ] T089 [P] [US5] Fix SlideToConfirm: duration-75 → duration-100, cubic-bezier → ease-out in `src/components/finance/CreateReceipt/SlideToConfirm.tsx`
- [ ] T090 [P] [US5] Add font-headline to h3/h4 headings in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T091 [P] [US5] Add font-headline to h4 heading in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T092 [P] [US5] Add font-headline to h4 heading in `src/components/finance/UnpaidEnrollmentCard.tsx`
- [ ] T093 [P] [US5] Fix spacing: py-2.5 → py-2, gap-1.5 → gap-2 in `src/components/finance/CreateReceiptPanel.tsx`
- [ ] T094 [P] [US5] Fix spacing: gap-3.5 → gap-3 in `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`
- [ ] T095 [P] [US5] Fix spacing: gap-1.5 → gap-2 in `src/components/finance/PaymentMethodPills.tsx`
- [ ] T096 [P] [US5] Fix spacing: space-y-3.5 → space-y-3 in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T097 [US5] Apply glassmorphism to ReceiptDetailPanel modal backdrop in `src/components/finance/ReceiptDetailPanel.tsx`
- [ ] T098 [US5] Apply glassmorphism to FinancePage sticky header in `src/pages/FinancePage.tsx`
- [ ] T099 Run `npm run build` and verify zero errors

**Checkpoint**: Design system fully applied — consistent typography, timing, spacing

---

## Phase 11: Polish & Verification

**Purpose**: Final verification across all user stories

- [ ] T100 Run `npm run lint` and fix all errors
- [ ] T101 Run `npm run build` and verify zero errors
- [ ] T102 Manual verification: Finance page loads correctly
- [ ] T103 Manual verification: Receipt creation flow works end-to-end
- [ ] T104 Manual verification: Keyboard navigation works for slide-to-confirm
- [ ] T105 Manual verification: Reduced motion setting respected

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (US-6 Dead Code)**: No dependencies — MUST complete first to reduce scope
- **Phase 2 (US-1 React Query)**: Depends on Phase 1 completion (dead code removed)
- **Phase 3 (US-7 TypeScript)**: Depends on Phase 2 completion (hooks refactored)
- **Phase 4 (US-8 Performance)**: Depends on Phase 2 completion (hooks available)
- **Phase 5 (US-10 Bugs)**: Depends on Phase 2 completion (hooks available)
- **Phase 6 (US-9 Architecture)**: Can run after Phase 1 (independent of hooks)
- **Phase 7 (US-2 A11y)**: Can run after Phase 1 (independent of hooks)
- **Phase 8 (US-3 Contrast)**: Can run after Phase 1 (independent of hooks)
- **Phase 9 (US-4 Motion)**: Can run after Phase 1 (independent of hooks)
- **Phase 10 (US-5 Typography)**: Can run after Phase 1 (independent of hooks)
- **Phase 11 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US-6 (Dead Code)**: No dependencies — runs first
- **US-1 (React Query)**: Depends on US-6
- **US-7 (TypeScript)**: Depends on US-1
- **US-8 (Performance)**: Depends on US-1
- **US-10 (Bugs)**: Depends on US-1
- **US-9 (Architecture)**: Independent after US-6
- **US-2 (A11y)**: Independent after US-6
- **US-3 (Contrast)**: Independent after US-6
- **US-4 (Motion)**: Independent after US-6
- **US-5 (Typography)**: Independent after US-6

### Parallel Opportunities

After Phase 1 (US-6) completes:
- Phases 6-10 (US-9, US-2, US-3, US-4, US-5) can run in parallel
- Phase 3 (US-7) can run in parallel with Phase 4 (US-8) and Phase 5 (US-10)

---

## Parallel Example: Phases 6-10 (After Phase 2)

```bash
# After US-1 React Query migration completes, these can run in parallel:
Task: "US-9 Architecture compliance fixes"
Task: "US-2 Accessibility fixes"
Task: "US-3 Contrast fixes"
Task: "US-4 Reduced motion fixes"
Task: "US-5 Typography and timing fixes"
```

---

## Implementation Strategy

### MVP First (US-6 + US-1)

1. Complete Phase 1: Dead code removal (US-6)
2. Complete Phase 2: React Query migration (US-1)
3. **STOP and VALIDATE**: Test finance page works with new hooks
4. Continue with remaining stories

### Incremental Delivery

1. Phase 1: Dead code removed → Scope reduced
2. Phase 2: React Query migration → Caching working (MVP!)
3. Phases 3-5: TypeScript, Performance, Bugs → Code quality improved
4. Phases 6-10: A11y, Contrast, Motion, Typography → UX polished
5. Phase 11: Final verification → Ready to ship

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Build must pass after every phase (`npm run build`)
