# Implementation Plan: Reports Domain Audit Fix

**Branch**: `020-reports-domain-audit` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature audit of `src/components/reports/`, `src/pages/ReportsPage.tsx`, `src/hooks/queryKeys.ts`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Resolve 35 audit findings across the Reports domain (21 components, 7 hooks, 2 API files, 1 page) spanning runtime bugs, dead code, TypeScript violations, data-fetching anti-patterns (constitution violations), and accessibility gaps. Primary work: migrate 5 `useEffect`+`useState` hooks to React Query, delete 2 dead components, fix chart rendering bugs in RevenueChart and InstructorPerformanceChart, add ARIA roles/keyboard nav to TabNavigation, and add centralized query keys for reports in `queryKeys.ts`.

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

### Unknowns (NEEDS CLARIFICATION)
1. Are the commented-out tabs (`enrollment`, `instructors`) in `DEFAULT_TABS` meant to be restored or permanently removed?
2. Does `EnrollmentTrendsChart.tsx` have any imports? Not referenced by audit scan — candidate for dead code deletion.
3. Should the `refetch(months)` param in `useRevenueData.ts` be removed entirely from the new React Query signature, or should the API support it?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/`. No backend. |
| II. Server State Discipline | ⚠️ VIOLATED | 5 of 7 report hooks use `useEffect`+`useState` instead of React Query. Must be migrated. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores. |
| IV. TypeScript Strict Mode | ⚠️ VIOLATED | 2 explicit `any` types in chart callbacks, 1 non-null assertion. Must be fixed. |
| V. Component Naming Convention | ✅ PASS | No new components. Existing names follow convention. |

**Result**: 2 violations — both justified as audit fixes. Server State Discipline violation is the primary reason for this spec. TS Strict violations are part of the cleanup.

## Project Structure

### Documentation (this feature)

```text
specs/020-reports-domain-audit/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code Changes

```text
src/
├── api/
│   └── analytics/
│       └── index.ts                       # REFACTOR: add query key exports for reports
├── hooks/
│   └── queryKeys.ts                       # REFACTOR: add reports section to factory
├── components/reports/
│   ├── RevenueChart.tsx                   # FIX: tooltip formatter uses correct net_revenue
│   ├── StudentProgressChart.tsx           # FIX: remove explicit `any` from Legend formatter
│   ├── InstructorPerformanceChart.tsx     # DELETE: dead code (zero imports)
│   ├── EnrollmentTrendsChart.tsx          # CHECK: likely DELETE (dead code)
│   ├── hooks/
│   │   ├── useDailyCollections.ts         # REFACTOR: migrate useEffect→useQuery
│   │   ├── useEnrollmentTrends.ts         # REFACTOR: migrate useEffect→useQuery, remove isUsingMockData
│   │   ├── useInstructorPerformance.ts    # REFACTOR: migrate useEffect→useQuery, remove isUsingMockData
│   │   ├── useRevenueData.ts             # REFACTOR: migrate useEffect→useQuery, remove isUsingMockData
│   │   ├── useStudentProgress.ts          # REFACTOR: migrate useEffect→useQuery, remove isUsingMockData
│   │   ├── useDailyReport.ts             # REFACTOR: replace date! with controlled enabled
│   │   └── useReportsSummary.ts          # REFACTOR: move query key to centralized factory
│   ├── atoms/
│   │   ├── ReportPaymentDetails.tsx       # FIX: add aria-expanded, aria-controls
│   │   ├── ReportSummaryCards.tsx         # FIX: add aria-hidden to icons
│   │   └── ReportSessionDetails.tsx       # FIX: add aria-hidden to icons
│   ├── molecules/
│   │   ├── TabNavigation.tsx              # FIX: role=tablist, role=tab, aria-selected, keyboard nav, focus mgmt
│   │   ├── ReportDatePicker.tsx           # FIX: htmlFor/id association
│   │   ├── ReportEmailSender.tsx          # FIX: aria-label on email input
│   │   └── InstructorDataTable.tsx        # DELETE: dead code (zero imports)
│   ├── organisms/
│   │   ├── OverviewTab.tsx                # FIX: aria-hidden on icons
│   │   ├── CollectionsTab.tsx             # FIX: htmlFor/id on date label, aria-hidden on icons
│   │   ├── DailyReportTab.tsx            # FIX: wrap in ErrorBoundary
│   │   ├── InstructorsTab.tsx            # FIX: remove duplicate isLoading prop on DataTable
│   │   ├── ProgressTab.tsx               # FIX: semantic rank numbering (<ol>)
│   │   ├── RevenueTab.tsx                # FIX: aria-hidden on icons
│   │   └── EnrollmentTab.tsx             # FIX: aria-hidden on icons
└── pages/
    └── ReportsPage.tsx                    # FIX: remove "using fallback data" message (no fallback exists)
```

## Complexity Tracking

> No complexity violations expected. All changes are within a single domain.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 — Research

See [research.md](research.md)

## Phase 1 — Design & Contracts

See [data-model.md](data-model.md), [quickstart.md](quickstart.md)
