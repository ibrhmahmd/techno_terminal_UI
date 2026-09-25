# Implementation Plan: Competitions API Alignment

**Branch**: `012-competitions-api-alignment` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-competitions-api-alignment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Align the frontend competitions and teams implementation with the updated backend API contracts. The backend changed response envelopes (all teams endpoints now use `ApiResponse<T>`), payment model (`fee_paid`/`member_share` → `amount_due`/`amount_paid` with partial payments), delete semantics (hard delete replacing soft delete), team DTO fields (removed `fee`, added `project_name`/`project_description`), and competition summary shape. This requires updating API client functions, TypeScript types, React Query hooks, and UI components across the competitions and teams domains.

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
| I. Frontend-Only Scope | PASS | All changes are in `src/` — API types, hooks, components, pages |
| II. Server State Discipline | PASS | All API calls go through React Query hooks; mutations invalidate cache keys |
| III. Global State Minimalism | PASS | No Zustand changes needed — auth store unchanged |
| IV. TypeScript Strict Mode | PASS | All type updates use `import type`, no `any`, no enums |
| V. Component Naming Convention | PASS | Existing naming patterns preserved; no new component types introduced |
| API Layer (client.ts) | PASS | All requests through `src/api/client.ts` with JWT interceptor |
| Cache Keys (queryKeys.ts) | PASS | Existing cache key patterns reused; invalidation logic preserved |

**Gate Result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/012-competitions-api-alignment/
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
│   ├── competitions/     # ← UPDATED: types.ts, competitions.ts
│   ├── enrollments/
│   ├── attendance/
│   ├── hr/
│   ├── analytics/
│   ├── notifications/
│   └── teams/            # ← UPDATED: types.ts, teams.ts
├── components/
│   ├── common/           # Modal, DataTable, Toast, SearchBar, Pagination
│   ├── layout/           # AppLayout, Sidebar
│   └── competitions/     # ← UPDATED: all competition/team components
├── hooks/                # React Query hooks per domain
│   ├── queryKeys.ts      # Centralized cache keys
│   ├── competitions/     # ← UPDATED: useCompetitions, useTeams, etc.
│   ├── dashboard/
│   ├── students/
│   ├── notifications/
│   └── finance/
├── pages/                # 18 route page components
│   ├── CompetitionsPage.tsx        # ← UPDATED
│   ├── CompetitionDetailPage.tsx   # ← UPDATED
│   ├── CompetitionEditPage.tsx     # ← UPDATED
│   └── TeamDetailPage.tsx          # ← UPDATED
├── store/                # Zustand stores (authStore, groupingSettingsStore)
├── lib/                  # queryClient.ts
├── types/                # Global TS interfaces (api.ts, pagination.ts)
├── utils/                # colors.ts, formatting.ts, date.ts, etc.
├── config/               # studentGrouping.ts
├── test/                 # setup.ts (Vitest setup)
└── tests/                # *.test.{ts,tsx} test files
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. No backend, no monorepo packages. Changes confined to `api/competitions/`, `api/teams/`, `hooks/competitions/`, `components/competitions/`, and 4 page components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
