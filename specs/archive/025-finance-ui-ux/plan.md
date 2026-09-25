# Implementation Plan: Finance Page UI/UX & Navigation Overhaul

**Branch**: `025-finance-ui-ux` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/025-finance-ui-ux/spec.md`

## Summary

Redesign the Finance page with: (1) a clickable metrics strip that serves as the primary navigation (no tab bar), (2) Today's Receipts panel (default on load) reusing `ReportDaySelectorBar` with expandable "Advanced Search", (3) Create Receipt UX improvements — payment method AND payment type as pill selectors (no default selection + inline validation), reduced payment types (course_level, competition, other), compact line-item horizontal layout, draft auto-save to sessionStorage, (4) metrics-to-panel mapping: Collected Today → Today's Receipts, Receipts Today → Create Receipt, Unpaid Count/Amount → Unpaid Enrollments, (5) refunds placeholder, and (6) designed empty/loading/error states per panel. All changes are frontend-only.

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

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Metrics strip data source | `getDailyCollections()` from `api/finance/reporting` | Existing endpoint returns today's collections grouped by method — sum `total_amount` and `receipt_count` |
| Unpaid metrics data | `getUnpaidEnrollments()` with limit=1000 | Existing endpoint — sum `remaining_balance` for total, use `total` for count |
| Today's Receipts data | `getDailyReceipts(date)` + `searchReceipts(params)` | Both exist — day view uses reporting, advanced search uses receipt search |
| Day selector | Reuse `ReportDaySelectorBar` from reports | Drop-in compatible via `date` + `onDateChange` props |
| Metrics-as-navigation | No tab bar — metrics strip cards are clickable and switch the panel below | Eliminates redundant UI; KPIs are always visible; click highlights active card |
| Payment type UI | Pills (not dropdown) for both method and type | Consistent UX, inline validation on submit |
| New data hooks | React Query (`useDailyMetrics`, `useDailyReceipts`) | Constitution Gate II mandates React Query for server data |
| Existing create hook | Keep `useReceipts` (raw useState) as-is | Heavily coupled to form state — refactor is out of scope |
| Draft auto-save | sessionStorage, every 10s while editing | Cleared on tab close — prevents stale drafts |
| Refunds panel | "Coming Soon" placeholder (same component) | No API or backend needed yet |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Gate I — Frontend-Only Scope (PASS)
All changes are strictly in `src/`. No backend, no database, no server logic.

### Gate II — Server State Discipline (PASS — with remediation note)
**Pre-existing violations**: `hooks/finance/useReceipts.ts`, `useBalance.ts`, `useRefunds.ts` use raw `useState` + `useCallback` instead of React Query.
**Remediation**: New components (Today's Receipts list, metrics strip) use React Query hooks. Existing raw-state hooks remain for Create Receipt (form-state-heavy). No new violations introduced.

### Gate III — Global State Minimalism (PASS)
No Zustand stores are added or modified. All state uses React Query, local `useState`, or sessionStorage (draft auto-save).

### Gate IV — TypeScript Strict Mode (PASS)
No `as any`, unsafe casts, or type violations expected. All new types use proper interfaces with `import type` for type-only imports.

### Gate V — Component Naming Convention (PASS)
New components follow conventions: `TodayReceiptsList.tsx`, `MetricsStripCards.tsx`, `PaymentMethodPills.tsx`, `ReceiptDetailPanel.tsx`.

## Project Structure

### Documentation (this feature)

```text
specs/025-finance-ui-ux/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/
├── api/finance/         # All needed endpoints already exist
├── components/
│   ├── common/
│   │   └── MetricsStripCards.tsx   # EXISTING (Phase 2 impl) — may need modification for clickable nav
│   ├── finance/
│   │   ├── index.ts                # UPDATE barrel
│   │   ├── CreateReceiptPanel.tsx   # MODIFY — payment method pills, payment type pills, compact layout, draft auto-save
│   │   ├── CreateReceipt/
│   │   │   └── ReceiptLineItemRow.tsx  # MODIFY — payment type pills, compact layout, reduced options
│   │   ├── TodayReceiptsFilters.tsx # EXISTING (Phase 2 impl) — may need advanced search section
│   │   ├── TodayReceiptsList.tsx    # EXISTING (Phase 2 impl) — may need wiring to detail panel
│   │   ├── ReceiptDetailPanel.tsx   # NEW — receipt detail modal/panel with PDF download
│   │   ├── PaymentMethodPills.tsx   # NEW — reusable pill selector component
│   │   └── ComingSoonPlaceholder.tsx # EXISTING (Phase 2 impl)
│   └── reports/molecules/
│       └── ReportDaySelectorBar.tsx  # REUSE as-is
├── hooks/finance/
│   ├── index.ts                    # UPDATE barrel
│   ├── useDailyMetrics.ts          # EXISTING (Phase 2 impl) — may need to also fetch unpaid data if not already
│   ├── useDailyReceipts.ts         # EXISTING (Phase 2 impl)
│   └── useReceipts.ts              # KEEP as-is
├── pages/
│   └── FinancePage.tsx             # REWRITE — metrics-as-nav, no tab bar, panel switching
└── hooks/queryKeys.ts              # EXISTING (Phase 2 impl) — finance keys already added
```

## Complexity Tracking

No new complexity introduced. All changes are component-level refactoring and UI updates within existing patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Raw-state `useReceipts` kept | Form-state-heavy; refactor to RQ is scope creep | Forcing RQ would double component complexity for no caching benefit |
