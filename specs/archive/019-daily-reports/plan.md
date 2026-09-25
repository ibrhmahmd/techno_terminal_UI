# Implementation Plan: Daily Reports

**Branch**: `019-daily-reports` | **Date**: 2026-05-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `daily-reports.md` and `/specs/019-daily-reports/spec.md`

## Summary

Add a Daily Reports feature to the existing Reports page. The backend provides two API modes under `/api/v1/notifications/reports/daily`: fetch JSON report data, download as PDF (base64), or email to recipients. The frontend adds a "Daily Report" tab to the Reports page with a date picker, summary dashboard, PDF download button, and email send form. Requires `admin` or `system_admin` role.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1
**Testing**: Vitest 4.1 + happy-dom
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols + Lucide React components
**Fonts**: Space Grotesk (`font-headline`), Inter (`font-body`)
**Constraints**: Frontend-only. Strict TS. Build must pass `tsc -b && vite build`.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | Only `src/` code. No backend. |
| II. Server State Discipline | ✅ PASS | All data flows through React Query. No raw fetch/useEffect. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores needed. Auth store for role checks only. |
| IV. TypeScript Strict Mode | ✅ PASS | `import type`, `erasableSyntaxOnly`, no `any`. |
| V. Component Naming Convention | ✅ PASS | New components follow existing Tab/Page/Card suffix patterns. |

**Result**: ALL GATES PASS.

## Project Structure

### Documentation

```
specs/019-daily-reports/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — design decisions
├── data-model.md        # Phase 1 — entities & validation
├── quickstart.md        # Phase 1 — developer onboarding
├── tasks.md             # Phase 2 — task breakdown
├── contracts/
│   └── daily-reports-api.md  # Client-side contract doc
└── checklists/
    └── requirements.md
```

### Source Code Changes

```text
src/
├── api/
│   └── reports/
│       └── daily.ts             # NEW: API functions for daily report
├── components/reports/
│   ├── hooks/
│   │   └── useDailyReport.ts    # NEW: React Query hooks
│   ├── organisms/
│   │   └── DailyReportTab.tsx   # NEW: main tab component
│   ├── molecules/
│   │   ├── ReportDatePicker.tsx # NEW: date selection component
│   │   └── ReportEmailSender.tsx # NEW: email send form
│   └── atoms/
│       ├── ReportSummaryCards.tsx  # NEW: KPI cards (revenue, enrollments, etc.)
│       ├── ReportSessionDetails.tsx # NEW: session breakdown table
│       └── ReportPaymentDetails.tsx # NEW: payment breakdown table
├── pages/
│   └── ReportsPage.tsx      # REFACTOR: add Daily Report tab + update TabId
├── types/
│   └── api.ts              # Unchanged (reuses ApiResponse)
└── tests/
    └── daily-reports.test.ts # NEW: tests
```

## Complexity Tracking

No complexity violations.

## Phase 0 — Research

See [research.md](research.md)

## Phase 1 — Design & Contracts

See [data-model.md](data-model.md), [quickstart.md](quickstart.md)
