# Implementation Plan: Groups UI Controls Redesign

**Branch**: `030-groups-ui-redesign` | **Date**: 2026-06-03 | **Spec**: [specs/030-groups-ui-redesign/spec.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/030-groups-ui-redesign/spec.md)
**Input**: Feature specification from `/specs/030-groups-ui-redesign/spec.md`

## Summary

Redesign two existing Groups page controls to match established UI patterns elsewhere in the app: (1) restyle `GroupBySelector` to match the dashboard `DaySelectorBar`'s blue-themed segmented pill design, and (2) replace `GroupFilters`' multi-select dropdowns with the `FilterPill` + expandable category panel pattern from the student directory's `AdvancedSearchPanel`.

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

### Reference Components (existing)

| Target | Reference | Key Styling |
|--------|-----------|-------------|
| `GroupBySelector` | `DaySelectorBar` (`components/dashboard/`) | Blue background (`bg-blue-50 border border-blue-100`), active=`bg-white shadow-sm font-bold border border-blue-200` |
| `GroupFilters` | `AdvancedSearchPanel` (`components/directory/`) | `FilterPill` horizontal pills, `bg-slate-50 rounded-xl p-4 border border-slate-200` expandable panels, toggle pill buttons, `ActiveFilterTagsList` |

### Interaction per Filter Category

| Category | Control Type | Data Source |
|----------|-------------|-------------|
| Course | Searchable multi-select dropdown w/ checkboxes | `useCourses()` |
| Instructor | Searchable multi-select dropdown w/ checkboxes | `useEmployees()` |
| Day | Toggle pill buttons (Mon–Sun) | Static |
| Level | Toggle pill buttons (1–8) | Static |
| Status | Toggle pill buttons (Active, Inactive, Archived) | Static |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Frontend-Only Scope**: Adheres. All changes are within `src/components/groups/` — no backend or data layer changes.
- [x] **Server State Discipline**: Adheres. No changes to data fetching patterns. Filter state remains in `useGroups` hook's `useState`.
- [x] **Global State Minimalism**: Adheres. Filter state stays in local hook state, not Zustand.
- [x] **TypeScript Strict Mode**: Adheres. No new types needed; existing interfaces reused.
- [x] **Component Naming Convention**: Adheres. `GroupBySelector.tsx` and `GroupFilters.tsx` already follow conventions.

## Project Structure

### Documentation (this feature)

```text
specs/030-groups-ui-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── spec.md              # Feature Specification
├── data-model.md        # Phase 1 output (minimal — no new entities)
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (none — pure UI change)
```

### Source Code

```text
src/components/groups/
├── GroupBySelector.tsx   # [MODIFY] Restyle to match DaySelectorBar blue theme
└── GroupFilters.tsx      # [MODIFY] Redesign to FilterPill + expandable panels
```

**Structure Decision**: Frontend-only SPA. Both modified files live under `components/groups/`. The existing `FilterPill` (from `components/common/`) and `ActiveFilterTagsList` (from `components/common/`) are reused directly.

## Complexity Tracking

No constitution violations — change is purely cosmetic/interaction. Complexity tracking not required.

---

## Phase 0: Research

No NEEDS CLARIFICATION markers exist. All reference implementations are in the codebase. No research needed — proceed to Phase 1.

## Phase 1: Design

### GroupBySelector Restyle

Swap Tailwind classes on the outer container and active button to match `DaySelectorBar`:

| Element | Current | Target (DaySelectorBar) |
|---------|---------|------------------------|
| Container | `bg-slate-100 rounded-lg p-1` | `bg-blue-50 border border-blue-100 rounded-lg p-1` |
| Active button | `bg-white text-secondary shadow-sm font-bold` | `bg-white text-secondary shadow-sm font-bold border border-blue-200` |

### GroupFilters Redesign

Replace the 5-column multi-select grid with a `FilterPill` row + expandable panel pattern:

1. **Pill row**: Iterate over `['Course', 'Instructor', 'Level', 'Day', 'Status']`, render `FilterPill` for each (imported from `components/common/`)
2. **Expanded panel**: When a pill is clicked, render a `bg-slate-50 rounded-xl p-4 border border-slate-200` div below with category-specific controls
3. **Course/Instructor**: Searchable multi-select with checkboxes — render a search input + checkbox list, filter by search term
4. **Day**: Toggle pill buttons (Mon, Tue, Wed, Thu, Fri, Sat, Sun) — reuse the same toggle pill pattern from `AdvancedSearchPanel`
5. **Level**: Toggle pill buttons (Level 1–8)
6. **Status**: Toggle pill buttons (Active, Inactive, Archived)
7. **Count badges**: `FilterPill` natively supports `filterCount` prop — wire up active filter counts per category
8. **ActiveFilterTagsList**: Already used by `GroupsPage` — no changes needed
9. **Reset Defaults**: Keep in the expanded panel footer area

### Icon Mapping

| Category | Icon |
|----------|------|
| Course | `menu_book` |
| Instructor | `person` |
| Level | `layers` |
| Day | `calendar_today` |
| Status | `flag` |
