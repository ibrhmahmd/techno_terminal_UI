# Implementation Plan: Courses & Competitions Card Layout

**Branch**: `008-extend-card-layout` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-extend-card-layout/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a table/card view toggle to the Courses page (new card mode) and the Competitions page (new table mode), following the Groups page hybrid layout pattern. Simultaneously audit and fix bugs, dead code, and deprecated patterns across both pages. All existing CRUD operations preserved in both view modes.

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
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

## Research Decisions (Phase 0)

- **ViewToggle reuse**: Reuse `src/components/groups/ViewToggle.tsx` as-is for both Courses and Competitions
- **CardGrid/CardSkeleton reuse**: Reuse `src/components/directory/CardGrid.tsx` and `CardSkeleton.tsx` as-is
- **RowActions reuse**: Reuse `src/components/common/RowActions.tsx` for card action buttons
- **CourseCard fields**: name, category, price_per_level, sessions_per_level, is_active — all available in existing `Course` type
- **CompetitionColumns fields**: name, location, competition_date, edition, fee_per_student — all in existing `Competition` type
- **GroupBySelector not needed**: Neither Courses nor Competitions pages have grouping — just the view toggle in the header area
- **Competitions uses React Query for list**: `useCompetitions` already uses React Query; only `useCompetition` (detail) and `useCompetitionCategories` use deprecated stateful patterns — these are P2 migration candidates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Frontend-Only Scope | All changes in `src/` — card layout + cleanup. No backend code. | ✅ PASS |
| II. Server State Discipline | Courses already uses React Query via `useCourses`. Competitions list uses `useCompetitions` (React Query). Detail hooks (`useCompetition`, `useCompetitionCategories`) use deprecated stateful patterns — migration to React Query is part of US3 cleanup | ⚠️ US3 FIX |
| III. Global State Minimalism | View mode is local `useState` on each page. No new Zustand stores needed | ✅ PASS |
| IV. TypeScript Strict Mode | New components use `import type`, avoid `any` and `enum`, follow `verbatimModuleSyntax` | ✅ PASS |
| V. Component Naming Convention | New files: `CourseCard.tsx` → `components/courses/`, `CompetitionColumns.tsx` → `components/competitions/`, `CompetitionsTable.tsx` → `components/competitions/` | ✅ PASS |

**Gate result**: PASS — Constitution violations (Principle II for stateful hooks) are explicitly addressed in US3 scope.

## Project Structure

### Documentation (this feature)

```text
specs/008-extend-card-layout/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (new/changed files)

```text
src/
├── components/
│   ├── courses/
│   │   ├── CourseCard.tsx        # NEW: Card component for courses
│   │   ├── CoursesTable.tsx      # NEW: Table component extracted from CoursesPage inline columns
│   │   └── index.ts              # NEW: Barrel exports
│   ├── competitions/
│   │   ├── CompetitionColumns.tsx # NEW: Column definitions for competition table view
│   │   ├── CompetitionsTable.tsx  # NEW: Table component for competition list
│   │   └── index.ts              # NEW: Barrel exports
│   └── groups/
│       └── ViewToggle.tsx        # REUSED: Already exists, no changes needed
├── pages/
│   ├── CoursesPage.tsx           # MODIFIED: Add viewMode state + conditional card/table rendering
│   └── CompetitionsPage.tsx      # MODIFIED: Add viewMode state + conditional table/card rendering
└── hooks/
    └── competitions/
        ├── useCompetition.ts     # MODIFIED: Migrate from stateful to React Query pattern (US3)
        └── useCompetitionCategories.ts # MODIFIED: Migrate from stateful to React Query pattern (US3)
```

### Reused (no changes)

```text
src/components/directory/CardGrid.tsx              # Reused as-is
src/components/directory/shared/CardSkeleton.tsx    # Reused as-is
src/components/common/RowActions.tsx               # Reused as-is
src/components/groups/ViewToggle.tsx                # Reused as-is
```

### Cleanup Scope (US3)

```text
src/pages/CompetitionsPage.tsx          # Remove unused UpdateCompetitionInput import
src/components/competitions/CompetitionForm.tsx  # Remove dead handleInputChange, remove console.log
src/components/competitions/CategoryList.tsx      # Remove unused props (competitionId, canManage)
src/pages/CompetitionDetailPage.tsx     # Fix restore modal — actually call restore API
CourseDetailPage.tsx                   # Fix console.log in form, clean up
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. No backend, no monorepo packages.

## Complexity Tracking

> **Skip**: Constitution check passed — the only violation (Principle II for stateful hooks) is explicitly included in US3 scope and will be fixed during implementation.
