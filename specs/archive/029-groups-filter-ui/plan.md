# Implementation Plan: Groups UI Filter Feature

**Branch**: `029-groups-filter-ui` | **Date**: 2026-06-03 | **Spec**: [specs/029-groups-filter-ui/spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/029-groups-filter-ui/spec.md)
**Input**: Feature specification from `/specs/029-groups-filter-ui/spec.md`

## Summary

This feature replaces local frontend list filtering in the `GroupsPage` with a robust server-side filter architecture via a new Filter Drawer. The drawer will house comprehensive options (Course, Instructor, Level, Day, Status) using existing React Query hooks for options data, and pass correctly serialized array parameters (using `qs`) to the newly unified `/academics/groups/filter` endpoint. It also replaces the fragmented Active/Completed UI with a unified Status filter.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3, `qs` (Query String) 
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

- [x] **Frontend-Only Scope**: Adheres. We are only changing React components, custom hooks, and API client options in `src/`.
- [x] **Server State Discipline**: Adheres. Filters will be handled by React Query, completely replacing the local `processedGroups` array logic.
- [x] **Global State Minimalism**: Adheres. Filter state will live locally in `useGroups` hook and URL state or `useState`, not in Zustand.
- [x] **TypeScript Strict Mode**: Adheres. Will use strict `import type` and `GroupFilterOptions` interfaces.
- [x] **Component Naming Convention**: Adheres. New components will be named `GroupFilters.tsx` and `FilterChips.tsx` inside `components/groups/`.

## Project Structure

### Documentation (this feature)

```text
specs/029-groups-filter-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
└── spec.md              # Feature Specification
```

### Source Code

```text
src/
├── api/academics/groups/core.ts      # [MODIFY] Accept GroupFilterOptions and serialize using qs
├── hooks/useGroupQueries.ts          # [MODIFY] Update query keys and pass filters to getEnrichedGroups
├── hooks/useGroups.ts                # [MODIFY] Add filter state, remove local filtering logic
├── components/groups/
│   ├── GroupsHeader.tsx              # [MODIFY] Add Filter button with active badge
│   ├── GroupFilters.tsx              # [NEW] Drawer/Popover UI with Course/Instructor/Level/Day/Status selects
│   └── FilterChips.tsx               # [NEW] Dismissible chips for active filters
└── pages/GroupsPage.tsx              # [MODIFY] Integrate filters, remove activeView state, consolidate toolbar
```

**Structure Decision**: Frontend-only SPA. The filter component `GroupFilters.tsx` will reside in `components/groups/` since it is highly domain-specific to the Groups page.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None      | N/A        | Adheres completely to the existing TanStack Query and Axios patterns. |
