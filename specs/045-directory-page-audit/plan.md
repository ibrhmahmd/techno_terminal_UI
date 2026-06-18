# Implementation Plan: Directory Page — Audit Fix

**Branch**: `main` | **Date**: 2026-06-10 | **Spec**: `specs/045-directory-page-audit/spec.md`
**Input**: Feature specification from `specs/045-directory-page-audit/spec.md`

## Summary

Fix 24 audit findings across the Directory Page: 3 runtime bugs (Enter key filter guard, wrong pagination count, sequential awaits), remove 4 dead code artifacts (StudentList, ParentList, duplicate finance.ts, unused query key), fix 5 unsafe TypeScript casts with proper type guards, centralize 4 data fetching patterns (query keys, enabled guard, staleTime), and add 9 accessibility fixes (aria-hidden, tab keyboard nav, input aria-label, tabpanel role). All changes live in `src/`, no backend modifications.

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

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/` — no backend, no DB schemas |
| II. Server State Discipline | ✅ PASS | Uses existing API layer and React Query; no raw fetch or direct useEffect APIs |
| III. Global State Minimalism | ✅ PASS | No Zustand changes needed — page-level state stays local |
| IV. TypeScript Strict Mode | ✅ PASS | Changes explicitly replace unsafe casts with proper guards — strengthens TS safety |
| V. Component Naming Convention | ✅ PASS | All modified files follow existing naming patterns; dead files deleted per convention |
| Cache Keys (factory functions) | ✅ PASS | US4 explicitly requires centralized `queryKeys` factory usage |
| Build Gates | ✅ PASS | No dependency changes; `tsc -b && vite build` expected to pass |
| Styling / Assets | ✅ PASS | No styling changes — accessibility fixes use standard ARIA attributes only |

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
