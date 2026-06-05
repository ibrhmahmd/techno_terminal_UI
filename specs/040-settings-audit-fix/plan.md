# Implementation Plan: Settings Page Audit & Fix

**Branch**: `040-settings-audit-fix` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/040-settings-audit-fix/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Audit and fix 22 issues in the settings page across 5 categories:
(1) Fix 4 runtime bugs including falsy-0 in AgeBucketEditor, stale closure in UsersTab, inconsistent query params, and inline toLocaleString across 5 components;
(2) Remove 4 dead/duplicate components (SessionsTab, ActivityTab, CRMSettingsTab, AgeBucketEditor);
(3) Fix 2 data fetching patterns: replace useCallback faux-debounce with useDebounce in UsersTab, add onSuccess invalidation to useChangePassword;
(4) Fix 11 systematic accessibility gaps: focus traps on 5 modals, htmlFor/id on 20+ label/input pairs, aria-hidden on 26 icons, aria-label on icon-only buttons, scope=col on 3 tables, role=status on empty states, role=alert on dynamic messages.

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

### Pre-Research Gate ✓
| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All fixes are in src/ frontend code. No backend changes. |
| II. Server State Discipline | ✅ PASS | Data fetching fixes ensure proper React Query usage with centralized keys and invalidation. |
| III. Global State Minimalism | ✅ PASS | Not affected — all state changes are local or via React Query. |
| IV. TypeScript Strict Mode | ✅ PASS | No `any` types introduced. All type assertions are safe. |
| V. Component Naming Convention | ✅ PASS | Not affected — removals follow existing naming patterns. |

**Result**: All gates pass. No violations to justify.

### Post-Design Gate ✓
Re-evaluated after Phase 1 design. No new violations introduced. Research and design artifacts do not alter architecture, add dependencies, or change data flow. All gates remain passing.

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
