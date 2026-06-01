---

description: "Task list for Finance metrics-as-nav, pill selectors, Today's Receipts enhancements"

---

# Tasks: Finance Page UI/UX Modifications (Metrics-as-Nav + Pills)

**Input**: Design documents from `specs/025-finance-ui-ux/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Pre-existing (Phase 2 impl complete)**:
- `src/components/common/MetricsStripCards.tsx` — exists, needs `isActive` prop
- `src/hooks/finance/useDailyMetrics.ts` — exists
- `src/hooks/finance/useDailyReceipts.ts` — exists
- `src/components/finance/TodayReceiptsList.tsx` — exists, needs advanced search + receipt detail
- `src/components/finance/TodayReceiptsFilters.tsx` — exists
- `src/components/finance/ComingSoonPlaceholder.tsx` — exists
- `src/components/finance/CreateReceiptPanel.tsx` — exists, needs pills + draft save
- `src/pages/FinancePage.tsx` — has tab bar + metrics, needs full rewrite

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: User story label (US1–US6)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project setup needed — everything is already initialized.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update barrel exports and shared components needed by all stories.

- [X] T001 [P] Add `PaymentMethodPills` export to `src/components/finance/index.ts`
- [X] T002 [P] Add `ReceiptDetailPanel` export to `src/components/finance/index.ts`
- [X] T003 Add `isActive` prop to `MetricsStripCards` interface in `src/components/common/MetricsStripCards.tsx` (active card gets `ring-2 ring-secondary` + `bg-secondary/10`)
- [X] T004 [P] Add `activeIndex` prop to `MetricsStripCards` — pass down `isActive` from parent

**Checkpoint**: Foundation ready — all stories can begin.

---

## Phase 3: User Story 1 — Finance Overview Metrics Strip (P1) 🎯

**Goal**: Metrics strip shows 4 KPI cards (Collected Today, Receipts Today, Unpaid Enrollments, Unpaid Amount) with active-state highlighting.

**Independent Test**: Navigate to Finance page — verify 4 cards render with data, and the "Collected Today" card has a highlighted active state.

### Implementation

- [X] T005 [P] [US1] Update `useDailyMetrics` in `src/hooks/finance/useDailyMetrics.ts` to expose 4 computed values: `totalCollected`, `totalReceipts`, `unpaidCount`, `unpaidAmount` with loading + error (already done — verify it works for 4-card layout)
- [X] T006 [US1] Build metric items array in `FinancePage.tsx` with correct labels, icons, colors, and target panel mappings per FR-002

**Checkpoint**: US1 complete — metrics strip renders with active "Collected Today" on load.

---

## Phase 4: User Story 2 — Metrics-Driven Module Navigation (P1)

**Goal**: Users navigate by clicking metric cards. No tab bar. Active card is highlighted. Panel switches below metrics. On page load, Today's Receipts panel is open.

**Independent Test**: Click each metric card — verify the corresponding panel renders below and the clicked card becomes highlighted. Verify Today's Receipts is open by default on page load.

### Implementation

- [X] T007 [US2] Rewrite `src/pages/FinancePage.tsx` navigation: remove tab bar, add `activePanel` state (`'receipts' | 'create' | 'unpaid' | 'refunds'`), wire metric card `onClick` to `setActivePanel`, pass `activeIndex` to metrics strip
- [X] T008 [US2] Add `window.scrollTo({ top: 0, behavior: 'smooth' })` on panel switch in `FinancePage.tsx`
- [X] T009 [US2] Add fadeIn transition wrapper `div key={activePanel}` around panel content in `FinancePage.tsx` (CSS class already in `tailwind.config.js`)
- [X] T010 [US2] Wire "Collected Today" → Today's Receipts, "Receipts Today" → Create Receipt, both unpaid cards → Unpaid Enrollments in the metric items array

**Checkpoint**: US2 complete — metrics-as-nav works, no tab bar, panels switch correctly.

---

## Phase 5: User Story 3 — Today's Receipts with Day Selector (P1)

**Goal**: Receipt list with day selector, paginated results, expandable "Advanced Search" section, and receipt detail panel with PDF download.

**Independent Test**: Open Today's Receipts (default). Select different days. Click "Advanced Search" and verify date range + payer name inputs appear. Click a receipt row and verify detail panel opens with PDF download.

### Implementation

- [X] T011 [P] [US3] Create `ReceiptDetailPanel` in `src/components/finance/ReceiptDetailPanel.tsx` — modal/panel showing receipt details (receipt number, payer, method, date, line items table, total) with PDF download button. Props per `contracts/ReceiptDetailPanel.tsx.md`.
- [X] T012 [US3] Add "Advanced Search" expandable section to `src/components/finance/TodayReceiptsList.tsx` — date range (from/to), payer name input, sort options. Wire to `searchReceipts(params)` on expand.
- [X] T013 [US3] Wire receipt row click → opens `ReceiptDetailPanel` in `TodayReceiptsList.tsx`. Wire "Download PDF" button to `onDownloadPdf` prop.
- [X] T014 [P] [US3] Add "Create Receipt" CTA in empty state and summary bar of `TodayReceiptsList.tsx` (already done — verify wired to `onNavigateToCreate`)

**Checkpoint**: US3 complete — receipt day selector, advanced search, detail panel all work.

---

## Phase 6: User Story 4 — Create Receipt with Improved UX (P1)

**Goal**: Payment method and payment type are pill selectors (not dropdowns). No default selection. Inline validation on submit. Compact horizontal line item layout. Draft auto-save to sessionStorage.

**Independent Test**: Open Create Receipt panel. Verify payment method shows 4 pills (Cash/Card/Transfer/Other) with none selected. Verify each line item shows 3 payment type pills (Course Level/Competition/Other). Click Create Receipt without selecting — verify inline validation. Type data, switch panel, come back — verify draft restored.

### Implementation

- [X] T015 [P] [US4] Create `PaymentMethodPills` component in `src/components/finance/PaymentMethodPills.tsx` — accepts `options: PillOption[]`, `selected: string | null`, `onChange: (value: string) => void`, `error?: string`, `label?: string`. Renders horizontal pill row with selected state styling. Props per `contracts/PaymentMethodPills.tsx.md`.
- [X] T016 [US4] Replace payment method `<select>` with `<PaymentMethodPills>` in `CreateReceiptPanel.tsx`. Remove dropdown. Add inline validation (red border + shake + "Please select a payment method") on submit with none selected per FR-008.
- [X] T017 [US4] Replace payment type `<select>` in `ReceiptLineItemRow.tsx` with `<PaymentMethodPills>` (reuse component). Options: Course Level, Competition, Other. Remove materials and registration. No default selection. Inline validation per line item on submit per FR-009.
- [X] T018 [US4] Implement compact horizontal line item layout in `ReceiptLineItemRow.tsx`: `flex flex-row gap-2 items-start` on desktop, `flex flex-col` on mobile per FR-010.
- [X] T019 [US4] Add draft auto-save to `CreateReceiptPanel.tsx`: serialize `{ payerName, paymentMethod, notes, lineItems }` to `sessionStorage` key `'receipt-draft'` every 10s via `setInterval` while editing. On mount: check for draft → populate form + "Draft restored" toast. On successful create: clear draft per FR-012.

**Checkpoint**: US4 complete — pills, validation, compact layout, draft save all work.

---

## Phase 7: User Story 5 — Unpaid Enrollments (P2)

**Goal**: Users can view and manage unpaid enrollments (already implemented in Phase 2). Tasks below ensure navigation integration.

**Independent Test**: Click any unpaid metric card → verify Unpaid Enrollments panel opens. Click "Pay Now" → verify Create Receipt opens with pre-filled data.

### Implementation

- [X] T020 [US5] Wire `onNavigateToCreate` prop in `src/components/finance/UnpaidEnrollmentsPanel.tsx` — "Create Receipt" CTA button already exists, verify prop wired correctly from FinancePage

**Checkpoint**: US5 complete — unpaid enrollments work with metrics navigation.

---

## Phase 8: User Story 6 — Refunds Placeholder (P3)

**Goal**: Refunds placeholder accessible from metrics strip (already implemented — `ComingSoonPlaceholder.tsx` exists).

**Independent Test**: Click the metric card mapped to Refunds → verify "Coming Soon" placeholder renders.

### Implementation

- [X] T021 [US6] Wire Refunds placeholder to a metric card in `FinancePage.tsx` per FR-015 (mapped to fourth metric card or unpaid amount card)

**Checkpoint**: US6 complete — refunds placeholder accessible.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Build verification and final cleanup.

- [X] T022 Run `npm run lint` and fix all errors
- [X] T023 Run `npm run build` and verify zero errors (`tsc -b && vite build`)
- [X] T024 Remove unused `SearchReceiptsPanel` import from `src/pages/FinancePage.tsx` (no longer a separate tab)
- [X] T025 Remove unused `ComingSoonPlaceholder` import from `FinancePage.tsx` if no longer needed (verify — still needed for refunds)
- [X] T026 [P] Add `scrollbar-thin` utility for the scrollable area in `tailwind.config.js` or `src/index.css` (if not already present — removed tab bar, no longer needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: No dependencies — can start immediately
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 3 — needs metrics items array + active state
- **US3 (Phase 5)**: Depends on Phase 2 only — can run parallel with US1/US2
- **US4 (Phase 6)**: Depends on Phase 2 only — can run parallel with US1/US2
- **US5 (Phase 7)**: Depends on Phase 4 — needs metrics navigation in place
- **US6 (Phase 8)**: Depends on Phase 4 — needs metrics navigation in place
- **Polish (Phase 9)**: Depends on all phases

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 (P1)**: Needs US1 (metrics strip items array)
- **US3 (P1)**: Can start after Foundational — No dependencies on other stories ✅ PARALLEL
- **US4 (P1)**: Can start after Foundational — No dependencies on other stories ✅ PARALLEL
- **US5 (P2)**: Needs US2 (metrics navigation)
- **US6 (P3)**: Needs US2 (metrics navigation)

### Parallel Opportunities

- T001, T002, T003, T004 can all run in parallel (Phase 2)
- US3 (Phase 5) and US4 (Phase 6) can run in parallel with each other ✅
- T011, T014 can run in parallel within US3
- T015 can run in parallel with other US4 tasks
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Phases 5 & 6

```bash
# Phase 5 & 6 can run in parallel after Phase 2:
Task: "US3 — ReceiptDetailPanel, advanced search, TodayReceiptsList wiring"
Task: "US4 — PaymentMethodPills, CreateReceiptPanel pills, ReceiptLineItemRow pills, compact layout, draft save"
```

```bash
# Within US4, create PaymentMethodPills first (dependency for T016, T017):
Task: "T015 — PaymentMethodPills component"
# Then in parallel:
Task: "T016 — CreateReceiptPanel payment method pills"
Task: "T017 — ReceiptLineItemRow payment type pills"
Task: "T018 — compact horizontal layout"
Task: "T019 — draft auto-save"
```

---

## Implementation Strategy

### Recommended Order (sequential)

1. **Phase 2** — Foundational (barrel exports, isActive prop)
2. **Phase 3** — US1 (metrics strip active state) → **Phase 4** — US2 (metrics as nav, no tab bar)
3. **Phase 5** — US3 (Today's Receipts + advanced search + detail panel) — parallel with Phase 6
4. **Phase 6** — US4 (pills, compact layout, draft save) — parallel with Phase 5
5. **Phase 7** — US5 (unpaid nav wiring)
6. **Phase 8** — US6 (refunds placeholder wiring)
7. **Phase 9** — Polish (lint, build, cleanup)

### MVP Scope

The MVP is US1 + US2 (metrics-as-navigation with active state). This is the core behavioral change. US3 (Today's Receipts), US4 (pills), US5, US6 build on top but are independent.

### Rollback Safety

Each phase produces independently testable increments. Commit after each phase. If US3 or US4 runs into complexity, US1 + US2 alone already delivers the core navigation improvement.
