# Implementation Plan: Groups Card Layout

**Branch**: `007-groups-card-layout` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-groups-card-layout/spec.md`

## Summary

Replace the DataTable-based Groups page with a hybrid table/card layout. Add a view toggle to switch between table and card modes. Group cards display: group name, course, instructor, schedule, capacity, and status — following the same card pattern established in the Directory page (006). All existing features (grouping, search, pagination, CRUD) work identically in both modes.

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

**Research complete** — See [research.md](./research.md) for full findings.

1. **GroupCard fields**: Same as GroupColumns — group_name, course_name, instructor_name, schedule, capacity, status. No backend changes.
2. **View toggle**: Integrated into GroupBySelector bar area as pill toggle.
3. **Grouped card view**: Category tabs + cards beneath active tab (same pattern as DirectoryPage grouped views).
4. **CardGrid/CardSkeleton**: Reused from `src/components/directory/` — no duplication needed.
5. **RowActions**: Reused from `src/components/common/RowActions.tsx`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Frontend-Only Scope | All changes in `src/` — no backend, DB, or server code | ✅ PASS |
| II. Server State Discipline | React Query already used for all group data. Card layout is purely a presentation change. Data fetching stays via `useGroups` hook | ✅ PASS |
| III. Global State Minimalism | No new Zustand stores needed — view mode is local `useState`, grouping is already local state | ✅ PASS |
| IV. TypeScript Strict Mode | New components will use `import type`, avoid `any` and `enum`, follow `verbatimModuleSyntax` | ✅ PASS |
| V. Component Naming Convention | New files: `GroupCard.tsx` → `components/groups/`, `ViewToggle.tsx` → `components/groups/`, `GroupCategoryTabs.tsx` → `components/groups/` | ✅ PASS |

**Gate result**: PASS — No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/007-groups-card-layout/
├── plan.md              # This file
├── research.md          # Phase 0 — resolves unknowns
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — developer setup
├── contracts/           # Phase 1 — component API contracts
└── tasks.md             # Phase 2 — (/speckit.tasks command)
```

### Source Code (new/changed files)

```text
src/
├── components/
│   └── groups/
│       ├── GroupCard.tsx         # NEW: Card component for groups
│       ├── ViewToggle.tsx        # NEW: Table/cards view mode toggle
│       ├── GroupCardGrid.tsx     # NEW: Card grid with skeleton/empty state
│       └── GroupCategoryTabs.tsx # NEW: Category tabs for grouped card view
└── pages/
    └── GroupsPage.tsx           # MODIFIED: Add view mode toggle + conditional card rendering
```

### Reused (no changes)

```text
src/components/directory/CardGrid.tsx              # Reused as-is
src/components/directory/shared/CardSkeleton.tsx    # Reused as-is
src/components/common/RowActions.tsx               # Reused as-is
src/components/groups/shared/GroupStatusBadge.tsx   # Reused as-is
```

## Complexity Tracking

> **Skip**: Constitution check passed with no violations.

## Phase 0 — Research Plan

No unknowns remained after research (see [research.md](./research.md)). All decisions made.

## Phase 1 — Design Deliverables

- [data-model.md](./data-model.md): Entity definitions for GroupCard, ViewToggle, GroupCardGrid, GroupCategoryTabs
- [contracts/](./contracts/): Component props contracts for each new component
- [quickstart.md](./quickstart.md): Setup instructions for developers
