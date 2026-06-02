---

description: "Task list for Finance UI Tweaks - tab labels, payment pills, line item layout"

---

# Tasks: Finance UI Tweaks

**Input**: Design documents from `specs/026-finance-ui-tweaks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification — no test tasks required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Types: `src/types/`
  - Tests: `src/tests/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project setup needed — everything is already initialized.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update shared `PillOption` interface to support color+icon fields (blocks US2).

- [ ] T001 Update `PillOption` interface in `src/components/finance/PaymentMethodPills.tsx` to add `color: string` and `icon: string` fields per `data-model.md`

**Checkpoint**: PillOption now supports color and icon — US2 can begin.

---

## Phase 3: User Story 1 — Navigate Finance via Tab Labels (Priority: P1) 🎯 MVP

**Goal**: Finance page uses labeled tabs (Today's Receipts, Create Receipt, Unpaid, Refunds) as primary navigation. No metrics strip cards.

**Independent Test**: Navigate to Finance page — verify no metrics cards visible, tab labels render, clicking each tab switches panel content.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Remove `<MetricsStripCards>` import and usage from `src/pages/FinancePage.tsx`
- [ ] T003 [P] [US1] Add tab navigation bar with 4 labeled tabs (Today's Receipts, Create Receipt, Unpaid, Refunds) in `src/pages/FinancePage.tsx`
- [ ] T004 [US1] Add `activeTab` state (`useState<'receipts' | 'create' | 'unpaid' | 'refunds'>`) and default to `'receipts'` in `src/pages/FinancePage.tsx`
- [ ] T005 [US1] Wire tab clicks to set active panel, highlight active tab, scroll-to-top on switch in `src/pages/FinancePage.tsx`
- [ ] T006 [US1] Add horizontal scroll behavior for mobile (`overflow-x-auto` + flex-nowrap) on tab bar in `src/pages/FinancePage.tsx`

**Checkpoint**: US1 complete — tab labels replace metrics as primary navigation.

---

## Phase 4: User Story 2 — Payment Options as Pills (Priority: P1)

**Goal**: Payment method pills show 4 options (Cash, E-Wallet, instaPay, Other) each with unique color and icon. Selection is required before submit.

**Independent Test**: Open Create Receipt panel — verify 4 colored pills render with icons. Submit without selection → validation error. Select a pill → submit succeeds.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Update `PaymentMethodPills.tsx` to render each pill's icon (Material Symbols) and apply assigned color styling (selected: solid bg + white text, unselected: light bg + colored text)
- [ ] T008 [P] [US2] Add color+icon config map in `CreateReceiptPanel.tsx` with 4 options per `data-model.md`: Cash→emerald/payments, E-Wallet→red/account_balance_wallet, instaPay→purple/bolt, Other→slate/more_horiz
- [ ] T009 [US2] Pass the new config map to `<PaymentMethodPills>` and remove old PAYMENT_METHODS array in `CreateReceiptPanel.tsx`
- [ ] T010 [US2] Add `paymentMethod` required validation — show inline error "Please select a payment method" on submit with none selected in `CreateReceiptPanel.tsx`

**Checkpoint**: US2 complete — colored pills with icons, validation works.

---

## Phase 5: User Story 3 — Line Item Layout (Priority: P2)

**Goal**: Line item rows use two-column layout: Student + Enrollment in left column, Amount + Discount + Payment Type in right column.

**Independent Test**: Open Create Receipt panel with a line item — verify student selector is on the left, amount/discount/payment type on the right in a horizontal row.

### Implementation for User Story 3

- [ ] T011 [US3] Restructure `ReceiptLineItemRow.tsx` to two-column flex layout: StudentCombobox + EnrollmentSelection in left flex-1 column, Amount + Discount + PaymentMethodPills in right column
- [ ] T012 [US3] Verify responsive behavior — columns stack vertically on mobile (use `flex-col md:flex-row`)

**Checkpoint**: US3 complete — line items display in two-column layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and final cleanup.

- [ ] T013 Run `npm run lint` and fix all errors
- [ ] T014 Run `npm run build` and verify zero errors (`tsc -b && vite build`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US1 (Phase 3)**: No dependencies — modifies only FinancePage.tsx ✅ PARALLEL
- **US2 (Phase 4)**: Depends on Phase 2 (PillOption interface update) — modifies PaymentMethodPills.tsx + CreateReceiptPanel.tsx
- **US3 (Phase 5)**: No dependencies — modifies only ReceiptLineItemRow.tsx ✅ PARALLEL
- **Polish (Phase 6)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: No dependencies — can start immediately ✅
- **US2 (P1)**: Depends on Foundational Phase 2 (PillOption interface)
- **US3 (P2)**: No dependencies — can start immediately ✅

### Parallel Opportunities

- T001 (Foundational) must complete before US2 tasks
- US1 and US3 can run in parallel with US2
- T002, T003 are independent files — can run in parallel within US1
- T007, T008 are independent files — can run in parallel within US2

---

## Parallel Example: Independent Stories

```bash
# US1 (FinancePage tab labels):
Task: "T002-T006 — Rewrite FinancePage navigation, remove metrics, add tabs"

# US2 (Payment pills with colors):
Task: "T001 — Update PillOption interface"
Task: "T007-T010 — Update PaymentMethodPills + CreateReceiptPanel"

# US3 (Line item layout):
Task: "T011-T012 — Restructure ReceiptLineItemRow to two-column layout"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (T001 — PillOption interface)
2. Complete Phase 3: US1 (T002-T006 — Tab navigation)
3. **STOP and VALIDATE**: Test tab navigation independently
4. Add US2 (T007-T010) → Payment pills with colors
5. Add US3 (T011-T012) → Line item layout
6. Polish (T013-T014) — lint + build

### Parallel Strategy

With multiple files and no blocking dependencies between stories:

1. Complete Phase 2 (T001 — 5-minute task)
2. US1 (FinancePage) + US3 (ReceiptLineItemRow) can run in parallel
3. US2 can start after T001
4. All stories complete before Polish phase
