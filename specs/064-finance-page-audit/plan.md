# Implementation Plan: Finance Page Audit & Fix

**Branch**: `main` | **Date**: 2026-07-11 | **Spec**: [specs/064-finance-page-audit/spec.md](specs/064-finance-page-audit/spec.md)
**Input**: Feature specification from `/specs/064-finance-page-audit/spec.md`

## Summary

Comprehensive audit and fix of the finance page (POS interface) addressing 142 findings across 8 phases: runtime bugs, dead code, TypeScript quality, data fetching anti-patterns, accessibility, React performance, architecture compliance, and UI polish. The most critical work is migrating 3 hooks from manual useState to React Query (Constitution Principle II) and fixing 7 critical accessibility/blocking issues.

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

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | All 142 findings are frontend-only. No backend changes. |
| II. Server State Discipline | PASS | This audit specifically migrates 3 hooks FROM manual useState TO React Query. Aligns with constitution. |
| III. Global State Minimalism | PASS | No new Zustand stores. All state stays in React Query or local useState. |
| IV. TypeScript Strict Mode | PASS | Audit fixes unsafe type casts, removes `any` usage, adds proper type guards. |
| V. Component Naming Convention | PASS | US-9 fixes 3 naming violations (ComingSoonPlaceholder, SlideToConfirm, PaymentMethodPills). |

**Gate Result**: PASS — No constitution violations. All changes reinforce existing principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/                  # Domain-based Axios modules
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── auth/
│   ├── academics/        # groups, courses, schedule
│   ├── crm/              # students, parents
│   ├── finance/
│   ├── dashboard/
│   ├── competitions/
│   ├── enrollments/
│   ├── attendance/
│   ├── hr/
│   ├── analytics/
│   └── notifications/
├── components/
│   ├── common/           # Modal, DataTable, Toast, SearchBar, Pagination
│   ├── layout/           # AppLayout, Sidebar
│   └── {domain}/         # Feature-specific components
├── hooks/                # React Query hooks per domain
│   ├── queryKeys.ts      # Centralized cache keys
│   ├── dashboard/
│   ├── students/
│   ├── notifications/
│   └── finance/
├── pages/                # 18 route page components
├── store/                # Zustand stores (authStore, groupingSettingsStore)
├── lib/                  # queryClient.ts
├── types/                # Global TS interfaces (api.ts, pagination.ts)
├── utils/                # colors.ts, formatting.ts, date.ts, etc.
├── config/               # studentGrouping.ts
├── test/                 # setup.ts (Vitest setup)
└── tests/                # *.test.{ts,tsx} test files
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. No backend, no monorepo packages. New features add files to the appropriate domain under `api/`, `components/`, `hooks/`, and `pages/` as needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
