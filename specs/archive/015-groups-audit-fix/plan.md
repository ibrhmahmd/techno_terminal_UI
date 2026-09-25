# Implementation Plan: Groups Feature Audit & Fix

**Branch**: `015-groups-audit-fix` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-groups-audit-fix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Comprehensive audit and fix of the groups feature addressing 68 findings across 6 categories: runtime bugs (status mapping, cache invalidation, form sync), dead code removal (6 components, 8 API functions, 4 types, 1 test), TypeScript quality (eliminate `as any` casts), data fetching optimization (lazy-load tab queries, complete cache invalidation), accessibility (focus traps, keyboard navigation, ARIA attributes), and UX polish (status icons, per-tab ErrorBoundaries). All changes are frontend-only, maintaining existing API contracts and component conventions.

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

### I. Frontend-Only Scope
**PASS** — All 68 findings are frontend-only: component fixes, hook improvements, type corrections, dead code removal, accessibility enhancements. No backend changes required.

### II. Server State Discipline (NON-NEGOTIABLE)
**PASS** — All fixes reinforce this principle:
- FR-002, FR-013: Add missing `invalidateQueries` calls after mutations
- FR-012: Gate queries by active tab (proper React Query `enabled` usage)
- FR-014: Migrate `generateSessions` from plain async to `useMutation`
- Dead API function removal eliminates unused endpoints from barrel exports

### III. Global State Minimalism
**PASS** — No Zustand changes. All state fixes are local (`useState`, React Query cache).

### IV. TypeScript Strict Mode
**PASS** — This feature directly enforces the constitution:
- FR-010: Eliminate all `as any` casts
- FR-011: Replace `as Error` with proper type guards
- All changes maintain `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` compliance

### V. Component Naming Convention
**PASS** — No new components created. Dead component removal maintains existing conventions.

### Cache & API Discipline
**PASS** — All fixes align with existing patterns:
- Centralized `queryKeys` factory used for all invalidations
- Axios client at `src/api/client.ts` for all HTTP requests
- Cross-domain invalidation added where mutations affect downstream caches

### Build Gates
**PASS** — All changes verified against `npm run lint` and `npm run build` requirements.

### Testing
**PASS** — Test fixes (FR-026, FR-027) align with Vitest + happy-dom conventions. Dead test file removal eliminates false failures.

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
