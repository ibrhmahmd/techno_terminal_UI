# Implementation Plan: Reports Feature Audit & Fix

**Branch**: `main` | **Date**: 2026-05-23 | **Spec**: `specs/022-reports-audit/spec.md`
**Input**: Feature specification from `/specs/022-reports-audit/spec.md`

## Summary

Fix 18 findings from the Reports feature audit across 13 files: 7 runtime bugs (mislabeled progress status, fragile 404 detection, error coalescing), 1 dead code path, 2 TypeScript unsound assertions, 3 data fetching anti-patterns (hijacked query keys, dropped errors, discarded Promise), and 5 accessibility gaps (missing ErrorBoundary, chart aria-labels, table scope attributes). All fixes are purely additive/surgical — no architecture changes, no new dependencies.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules
**Reports-specific context**: The Reports feature spans 11 components, 5 hooks, 4 API files, 3 type modules, 1 page. Audit conducted May 2026 identified 18 issues. No research unknowns — all findings are pre-diagnosed with before/after code snippets.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Result | Rationale |
|------|--------|-----------|
| I. Frontend-Only | ✅ PASS | All changes in `src/` only |
| II. Server State Discipline | ✅ PASS | All hooks already use React Query. US3-T001 fixes hijacked query key. US3-T002 fixes dropped error. |
| III. Global State Minimalism | ✅ PASS | No Zustand stores touched |
| IV. TypeScript Strict Mode | ✅ PASS | US2-T001 and US2-T002 fix the two `as` assertion violations. Zero `any` types in reports domain after fixes. |
| V. Component Naming | ✅ PASS | No new components added. Existing names follow convention. |
| Cache Keys | ✅ PASS | US3-T001 adds missing `dailyReceipts` factory, eliminates inline key abuse. |

**Gate verdict**: All gates pass. No violations requiring justification.

## Complexity Tracking

No complexity violations — this is a straightforward bugfix/cleanup feature with no new architecture.

## Project Structure

### Documentation (this feature)

```text
specs/022-reports-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output — audit findings consolidated
├── data-model.md        # Phase 1 output — data flow changes
├── quickstart.md        # Phase 1 output — implementation order with risk areas
├── contracts/           # Phase 1 output — interface contracts (empty: no new interfaces)
├── tasks.md             # Phase 2 output (/speckit.tasks command)
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (modified files)

```text
src/
├── hooks/
│   └── queryKeys.ts           # US3-T001: add dailyReceipts factory
├── pages/
│   └── ReportsPage.tsx        # US4-T001: wrap 2 tabs in ErrorBoundary
├── components/reports/
│   ├── RevenueChart.tsx        # US1-T005, US4-T002
│   ├── StudentProgressChart.tsx # US1-T001, US2-T002, US4-T003
│   ├── hooks/
│   │   ├── useDailyReport.ts   # US1-T004, US2-T001
│   │   ├── useDailyCollections.ts # US3-T001, US3-T002
│   │   └── useRevenueData.ts   # US3-T003
│   ├── organisms/
│   │   ├── ProgressTab.tsx     # US1-T001
│   │   ├── DailyReportTab.tsx  # US1-T002
│   │   └── RevenueAndCollectionsTab.tsx # US1-T003, US4-T004
│   └── atoms/
│       ├── ReportSummaryCards.tsx  # US1-T006
│       ├── ReportSessionDetails.tsx # US4-T005
│       └── ReportPaymentDetails.tsx # US4-T006
```
