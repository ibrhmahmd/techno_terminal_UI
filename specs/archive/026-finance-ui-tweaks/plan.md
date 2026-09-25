# Implementation Plan: Finance UI Tweaks

**Branch**: `026-finance-ui-tweaks` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/026-finance-ui-tweaks/spec.md`

## Summary

Three UI modifications to the Finance page: (1) replace metrics strip cards with labeled tab navigation, (2) update payment method pills with distinct colors and icons (Cash=green, E-Wallet=red, instaPay=purple, Other=grey) and require selection before submit, (3) re-align line item rows into a two-column layout (Student/Enrollment left, Amount/Discount/Payment Type right).

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Reason |
|------|--------|--------|
| **I. Frontend-Only Scope** | ✅ PASS | All changes are in existing `src/components/finance/*` and `src/pages/FinancePage.tsx` — no backend needed |
| **II. Server State Discipline** | ✅ PASS | No new API calls or React Query mutations — only local form state and existing hooks |
| **III. Global State Minimalism** | ✅ PASS | No new Zustand stores — all state remains in local `useState` |
| **IV. TypeScript Strict Mode** | ✅ PASS | No new types that violate strict rules — existing patterns followed |
| **V. Component Naming Convention** | ✅ PASS | Modifications to existing components only (FinancePage, CreateReceiptPanel, PaymentMethodPills, ReceiptLineItemRow) |
| **Build Gates** | ✅ PASS (expected) | All changes are standard TSX/CSS — no new dependencies |

## Project Structure

### Documentation (this feature)

```text
specs/026-finance-ui-tweaks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code Changes

```text
src/
├── components/
│   ├── common/
│   │   └── MetricsStripCards.tsx    # MODIFY — remove from FinancePage, keep component
│   └── finance/
│       ├── PaymentMethodPills.tsx    # MODIFY — add color+icon per pill option
│       ├── CreateReceiptPanel.tsx    # MODIFY — replace payment pills config, require selection, line item layout
│       ├── ReceiptLineItemRow.tsx    # MODIFY — two-column layout
│       └── TodayReceiptsList.tsx     # MODIFY — return if changes affect it
├── pages/
│   └── FinancePage.tsx              # MODIFY — remove metrics strip, add tab labels nav
└── specs/026-finance-ui-tweaks/
    └── contracts/
        └── PaymentMethodPills.tsx.md # UPDATE — add color and icon to PillOption
```

## Complexity Tracking

No constitution violations — all changes are straightforward UI modifications to existing components.

## Phase 0 — Research

**Status**: All NEEDS CLARIFICATION resolved in spec clarifications session. No research tasks required.

Key decisions from spec:
- Tab labels verbatim: "Today's Receipts", "Create Receipt", "Unpaid", "Refunds"
- Pill colors: Cash=green, E-Wallet=red, instaPay=purple, Other=grey
- Icons: Material Symbols defaults (e.g., `payments`, `account_balance_wallet`, `bolt`, `more_horiz`)
- Mobile tabs: horizontal scroll (overflow-x-auto)
- Refunds tab: keep "Coming Soon" placeholder
- E-Wallet/instaPay: UI labels only, no gateway integration
- Line item layout: two-column (Student+Enrollment left, Amount+Discount+Payment Type right)

## Phase 1 — Design & Contracts

### Data Model

No new entities. The only data-structure change is the `PillOption` interface adding optional `color` and `icon` fields.

### Contracts

- Update `PaymentMethodPills.tsx.md` — add `color?: string` and `icon?: string` to `PillOption`

### Files to Create

- `specs/026-finance-ui-tweaks/quickstart.md`
- `specs/026-finance-ui-tweaks/data-model.md`
- `specs/026-finance-ui-tweaks/contracts/PaymentMethodPills.tsx.md` (update from 025)

## Phase 2 — Tasks

See `tasks.md` (generated by `/speckit.tasks`).
