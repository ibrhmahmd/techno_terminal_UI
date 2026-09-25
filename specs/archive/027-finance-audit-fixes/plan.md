# Implementation Plan: Finance Audit Fixes

**Branch**: `027-finance-audit-fixes` | **Date**: 2026-06-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/027-finance-audit-fixes/spec.md`

## Summary

Fix 33 issues identified by a comprehensive audit of the finance feature: 4 breaking bugs (stale error display, zero-amount search results, unrendered detail fetch, incorrect unpaid totals with >200 enrollments), 2 dead files to remove, 3 components with outdated payment method labels, 5 TypeScript type-safety gaps (4 unsafe assertions + 1 widened type), 5 data-fetching anti-patterns (3 missing cache invalidations, 1 manual fetch, 1 silent API cap), and 14 accessibility gaps (missing ARIA roles, icon markers, form labels, error boundaries, focus management). All changes are frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined`) + Lucide React  
**Fonts**: Space Grotesk (`font-headline`) + Inter (`font-body`)  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Reason |
|------|--------|--------|
| **I. Frontend-Only Scope** | ✅ PASS | All changes in `src/` — no backend code, no DB schemas, no server logic |
| **II. Server State Discipline** | ✅ PASS (enforcing) | Migrates `useStudentEnrollments` from manual `useEffect` to `useQuery`; adds missing `queryClient.invalidateQueries()` after create/balance/refund mutations |
| **III. Global State Minimalism** | ✅ PASS | No new Zustand stores — all state is local `useState`, React Query, or URL params |
| **IV. TypeScript Strict Mode** | ✅ PASS | Eliminates `any` catch clauses; adds runtime type guards for payment method/type; narrows `PillOption.color` from `string` to union |
| **V. Component Naming Convention** | ✅ PASS | No new files; removing dead files (`SearchReceiptsPanel.tsx`) follows convention |
| **Build Gates** | ✅ PASS | SC-007 and SC-008 require `tsc -b && vite build` and lint to pass with zero errors |

## Project Structure

### Documentation (this feature)

```text
specs/027-finance-audit-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # (empty — no new contracts needed)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code Changes

```text
src/
├── api/finance/types/receipts.ts               # No change needed (already updated in 026)
├── components/
│   ├── common/
│   │   ├── ErrorBoundary.tsx                    # No change — reuse as-is
│   │   └── MetricsStripCards.tsx               # MODIFY: add tablist ARIA roles + aria-hidden
│   └── finance/
│       ├── PaymentMethodPills.tsx               # MODIFY: narrow PillOption.color type + aria-hidden
│       ├── CreateReceiptPanel.tsx               # MODIFY: fix error display, type guards, htmlFor, aria-hidden
│       ├── SearchReceiptsPanel.tsx              # DELETE (dead code)
│       ├── TodayReceiptsList.tsx                # MODIFY: METHOD_LABELS update, aria-hidden, htmlFor
│       ├── ReceiptDetailPanel.tsx               # MODIFY: METHOD_LABELS update, dialog ARIA, close btn aria-label
│       ├── UnpaidEnrollmentsPanel.tsx           # MODIFY: remove alert/console.log, add radiogroup/tablist roles, aria-hidden
│       ├── UnpaidEnrollmentCard.tsx             # MODIFY: replace title with aria-label, aria-hidden
│       ├── UnpaidEnrollmentsFilters.tsx         # MODIFY: radiogroup role, htmlFor
│       ├── ComingSoonPlaceholder.tsx            # MODIFY: aria-hidden
│       ├── index.ts                             # DELETE (dead barrel)
│       └── CreateReceipt/
│           ├── ReceiptLineItemRow.tsx           # MODIFY: htmlFor, aria-hidden
│           └── EnrollmentSelection.tsx          # MODIFY: htmlFor
├── hooks/
│   ├── queryKeys.ts                             # MODIFY: add studentEnrollments factory
│   └── finance/
│       ├── useReceipts.ts                       # MODIFY: cache invalidation + catch unknown
│       ├── useBalance.ts                        # MODIFY: cache invalidation + catch unknown
│       ├── useRefunds.ts                        # MODIFY: cache invalidation + catch unknown
│       ├── useStudentEnrollments.ts             # MODIFY: migrate to useQuery + remove console.log
│       └── useDailyMetrics.ts                   # MODIFY: fix limit:1000 issue
└── pages/
    └── FinancePage.tsx                          # MODIFY: ErrorBoundary per panel + focus management
```

## Complexity Tracking

No constitution violations — all changes are pure frontend fixes within existing patterns. The most complex change (useStudentEnrollments migration to useQuery) follows established patterns from useDailyMetrics and useDailyReceipts.

## Phase 0 — Research

**Status**: Complete. The audit itself served as Phase 0 research. Key findings consolidated in `research.md`.

Key decisions:
- ErrorBoundary reuse from `src/components/common/ErrorBoundary.tsx`
- React Query pattern: follow `useDailyMetrics.ts`/`useDailyReceipts.ts` conventions
- Cache invalidation keys: `['finance', 'metrics']` and `['finance', 'daily-receipts']` (prefix matching)
- Query key factory: add `studentEnrollments` to `queryKeys.ts`
- `SearchReceiptsPanel.tsx` confirmed dead — safe to delete
- Accessibility fixes: purely mechanical attribute additions (no structural changes)

## Phase 1 — Design & Contracts

### Data Model

No new entities. Changes limited to:
- `PillOption.color` narrowed from `string` to `'emerald' | 'red' | 'purple' | 'slate'`
- New query key factory: `queryKeys.finance.studentEnrollments(id)`
- `METHOD_LABELS`/`METHOD_COLORS` updated in 3 components (1 deleted)

### Contracts

No new contracts. `PaymentMethodPills` contract from 026-finance-ui-tweaks already covers the pill option type. All changes are internal refactoring of existing components and hooks.

### Agent Context Update

Plan reference in `AGENTS.md` updated to point to this plan.

## Phase 2 — Tasks

Generated by `/speckit.tasks`.
