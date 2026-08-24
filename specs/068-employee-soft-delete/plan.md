# Implementation Plan: Employee Soft-Delete

**Branch**: `068-employee-soft-delete` | **Date**: 2026-08-24 | **Spec**: `specs/068-employee-soft-delete/spec.md`
**Input**: Feature specification from `/specs/068-employee-soft-delete/spec.md`

## Summary

Add soft-delete, restore, and deleted-row discovery view to the HR staff page. Three new API operations (`DELETE /hr/employees/{id}`, `POST /hr/employees/{id}/restore`, `?include_deleted=true` query flag) drive the UI. Two new fields (`deleted_at`, `deleted_by`) appear on employee types. The feature follows the established student soft-delete pattern with dual cache invalidation across two independent cache families.

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
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/api/hr/`, `src/hooks/`, `src/components/staff/`, `src/pages/` — no backend code |
| II. Server State Discipline | ✅ PASS | All server data through React Query; delete/restore mutations invalidate via `queryClient.invalidateQueries()` |
| III. Global State Minimalism | ✅ PASS | No Zustand additions; toggle state is local `useState` in StaffPage |
| IV. TypeScript Strict Mode | ✅ PASS | New types use explicit `string | null` unions; `import type` for type-only imports; no `any` |
| V. Component Naming Convention | ✅ PASS | New components follow existing patterns: `EmployeeCard.tsx`, `EmployeeDetailModal.tsx` (already named correctly) |

**Gate Result**: PASS — no violations

## Project Structure

### Documentation (this feature)

```text
specs/068-employee-soft-delete/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output (test scenarios)
├── tasks.md             # Task breakdown
└── contracts/           # Not applicable (frontend SPA)
```

### Source Code

```text
src/
├── api/                  # Domain-based Axios modules
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── hr/               # HR domain — employees, staff accounts
│   │   ├── types.ts      # EmployeePublic, EmployeeListItem (+ deleted_at, deleted_by)
│   │   ├── employees.ts  # CRUD + softDeleteEmployee, restoreEmployee
│   │   ├── errors.ts     # extractApiErrorMessage
│   │   └── index.ts      # Re-exports
├── components/
│   └── staff/            # EmployeeCard, EmployeeDetailModal, EmployeeForm
├── hooks/
│   ├── useStaff.ts       # staffKeys, useEmployees, useSoftDeleteEmployee, useRestoreEmployee
│   └── queryKeys.ts      # Centralized cache keys
├── pages/
│   └── StaffPage.tsx     # Staff list with toggle, delete, restore
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. New API functions in `src/api/hr/employees.ts`, new hooks in `src/hooks/useStaff.ts`, UI changes in existing components.

## Complexity Tracking

No violations — no complexity tracking needed.
