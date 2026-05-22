# Implementation Plan: Reports Page Redesign

**Branch**: `021-reports-page-redesign` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)
**Input**: Design audit of Reports page vs app design system

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Redesign the Reports page to match the app's Material Design 3-inspired design system. Full restructure: dark premium tab bar, per-tab lazy data loading, replace all custom components with system equivalents (MetricSummaryCard, ErrorState, EmptyState, LoadingState), recolor charts to system teal, and use PageHeader component. This eliminates ~4 duplicate components and unifies all loading/error/empty states across 7 tabs.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3
**Styling**: Tailwind CSS v3.4 with custom design tokens (secondary=`#006a61`, surface=`#f8f9ff`)
**Common Components**: MetricSummaryCard, ErrorState, EmptyState, LoadingState, PageHeader, ActionButton, DateInput, DataTable
**Chart Library**: Recharts (AreaChart, BarChart, PieChart, ResponsiveContainer)
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA
**Constraints**: Frontend-only. Strict TS. Build must pass `tsc -b && vite build`.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | Only `src/` code. No backend. |
| II. Server State Discipline | ✅ PASS | Per-tab lazy loading still uses React Query (already migrated in 020). |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores. |
| IV. TypeScript Strict Mode | ✅ PASS | No `any`, no unused vars expected. |
| V. Component Naming Convention | ✅ PASS | No new naming conventions. Deleting ReportCard/MetricCard (were already non-conformant). |

**Result**: ALL GATES PASS.

## Project Structure

### Documentation

```
specs/021-reports-page-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — design decisions
├── data-model.md        # Phase 1 — component mapping
├── quickstart.md        # Phase 1 — developer onboarding
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
src/
├── components/reports/
│   ├── RevenueChart.tsx              # REFACTOR: teal recolor (#f59e0b → #006a61)
│   ├── StudentProgressChart.tsx      # REFACTOR: teal recolor
│   ├── EnrollmentTrendsChart.tsx     # REFACTOR: teal recolor
│   ├── molecules/
│   │   ├── TabNavigation.tsx         # REFACTOR: dark premium style + uncomment all tabs
│   │   ├── ReportDatePicker.tsx      # REFACTOR: system styling
│   │   └── SummaryCards.tsx          # DELETE: replaced by MetricSummaryCard usage
│   ├── atoms/
│   │   ├── ReportCard.tsx            # DELETE: replaced by MetricSummaryCard
│   │   ├── MetricCard.tsx            # DELETE: replaced by MetricSummaryCard
│   │   ├── ReportSummaryCards.tsx    # REFACTOR: use MetricSummaryCard
│   │   ├── ReportSessionDetails.tsx  # KEEP: no change needed
│   │   └── ReportPaymentDetails.tsx  # KEEP: no change needed
│   └── organisms/
│       ├── OverviewTab.tsx           # REFACTOR: own hook, common states, MetricSummaryCard
│       ├── EnrollmentTab.tsx         # REFACTOR: own hook, common states
│       ├── RevenueTab.tsx            # REFACTOR: own hook, common states, MetricSummaryCard
│       ├── InstructorsTab.tsx        # REFACTOR: own hook, common states
│       ├── ProgressTab.tsx           # REFACTOR: own hook, common states
│       ├── CollectionsTab.tsx        # REFACTOR: own hook, common states, MetricSummaryCard
│       └── DailyReportTab.tsx        # REFACTOR: own hook already, common states
└── pages/
    └── ReportsPage.tsx               # REFACTOR: PageHeader, per-tab rendering, no data hooks
```

## Complexity Tracking

No complexity violations. This is a frontend-only visual/structure refactor within a single page.

## Phase 0 — Research

See [research.md](research.md)

## Phase 1 — Design & Contracts

See [data-model.md](data-model.md), [quickstart.md](quickstart.md)
