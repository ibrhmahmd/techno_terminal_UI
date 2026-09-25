# Implementation Plan: Redesign Employee Cards & Detail Dialog

**Branch**: `003-redesign-employee-cards` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-redesign-employee-cards/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Redesign `EmployeeCard` to show phone and email on every card (reducing clicks for contact lookups). Redesign `EmployeeDetailModal` to display all `EmployeePublic` fields including `national_id` and the newly added `university`, `major`, `is_graduate`, `monthly_salary`, `contract_percentage`. Fix `EmployeeForm` edit mode to pre-fill from full detail fetch instead of sparse list data. Add skeleton loading and error states throughout. No new backend endpoints — the list adapter already passes through all response fields; only type definitions need extending (already done in `src/api/hr/types.ts`).

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

| Principle | Check |
|-----------|-------|
| I. Frontend-Only Scope | ✅ Feature touches only `src/` files. Backend contract changes documented in `backend-changes.md`. |
| II. Server State Discipline | ✅ Uses existing `useEmployees` / `useEmployee` / `useUpdateEmployee` hooks. No raw fetch or direct Axios. |
| III. Global State Minimalism | ✅ No new Zustand stores. All state is React Query or local `useState`. |
| IV. TypeScript Strict Mode | ✅ Types updated with optional fields. No `any`. |
| V. Component Naming Convention | ✅ All components (`EmployeeCard`, `EmployeeDetailModal`, `EmployeeForm`) follow existing convention. |
| Build Gates (lint, build) | ✅ Both pass. |

**Verdict**: PASS — zero violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-redesign-employee-cards/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
├── backend-changes.md   # Backend API contract change request
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/hr/types.ts           # EmployeePublic + EmployeeListItem extended
├── components/staff/
│   ├── EmployeeCard.tsx       # REDESIGN: add phone, email; skeleton on loading
│   ├── EmployeeDetailModal.tsx # REDESIGN: all fields, organized sections, loading/error states
│   └── EmployeeForm.tsx       # FIX: pre-fill from full detail fetch on edit
├── pages/StaffPage.tsx        # Minor: pass full data for edit pre-fill
└── hooks/
    ├── useStaff.ts            # useEmployee fetch for edit form
    └── useStaffAccounts.ts    # Unchanged
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations to track.

## Phases

### Phase 0: Research — Complete

**Status**: No NEEDS CLARIFICATION markers remained. Technical unknowns resolved by inspecting existing code:

1. **List endpoint adapter** (`fetchEmployeesPaginated`): Passes through all API response fields via `result.data`. No field filtering. Once `EmployeeListItem` has `phone?` and `email?`, TypeScript accepts them automatically. No adapter changes needed.
2. **Detail endpoint adapter** (`getEmployee`): Same pass-through via `response.data`. Once `EmployeePublic` has new optional fields, TypeScript accepts them. No adapter changes needed.
3. **Existing skeleton patterns**: See `GroupCard` or `CourseCard` for card skeleton; common `Modal` component for dialog skeleton; form skeleton via input `disabled` + `animate-pulse`.
4. **Edit pre-fill pattern**: Fetch full employee (`useEmployee(id)`) in `EmployeeForm` when `initialData.id` is present, populate defaultValues.

See [research.md](research.md) for full findings.

### Phase 1: Design & Contracts

1. **Data model**: See [data-model.md](data-model.md).
2. **Contracts**: See [contracts/](contracts/).
3. **Quickstart**: See [quickstart.md](quickstart.md).
4. **Agent context**: Updated below.
