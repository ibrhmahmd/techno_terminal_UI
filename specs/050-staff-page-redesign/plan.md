# Implementation Plan: Staff Page Redesign — Design System Alignment

**Branch**: `050-staff-page-redesign` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/050-staff-page-redesign/spec.md`

## Summary

Redesign `EmployeeCard`, `EmployeeDetailModal`, and `StaffPage` to align with the app's established design system tokens and shared component patterns already used by `GroupCard`, `StudentCard`, and `ParentCard`. Three structural changes: (1) adopt `CardGrid` + `CardSkeleton` from `src/components/directory/`, (2) replace inline action buttons with `RowActions` in a border-top footer, (3) migrate all hardcoded color utilities to design tokens. Frontend-only, no backend changes.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json) — design tokens in `tailwind.config.js`
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) via `RowActions`
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text
**Constraints**: Frontend-only. Strict TS (`verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.

## Constitution Check

| Principle | Check |
|-----------|-------|
| I. Frontend-Only Scope | ✅ All changes in `src/components/staff/` and `src/pages/StaffPage.tsx` |
| II. Server State Discipline | ✅ No changes to hooks or API functions |
| III. Global State Minimalism | ✅ No new stores; local state only |
| IV. TypeScript Strict Mode | ✅ No new types; existing `EmployeeListItem` / `EmployeePublic` unchanged |
| V. Component Naming Convention | ✅ Existing components keep names; `CardGrid` and `CardSkeleton` are shared imports |
| Build Gates (lint, build) | ✅ Both pass |

## Project Structure

```
specs/050-staff-page-redesign/
├── plan.md              # This file
├── spec.md              # Feature specification (created)
├── research.md          # Phase 0 (to be filled)
├── data-model.md        # Phase 1 (to be filled)
├── quickstart.md        # Phase 1 (to be filled)
└── tasks.md             # Phase 2 (to be filled)
```

### Source Code Changes

```
src/
├── components/
│   ├── directory/
│   │   ├── CardGrid.tsx              # Already exists — import into StaffPage
│   │   └── shared/CardSkeleton.tsx   # Already exists — use in EmployeeCard
│   ├── common/
│   │   └── RowActions.tsx            # Already exists — use for action buttons
│   └── staff/
│       ├── EmployeeCard.tsx          # MODIFY — skeleton, design tokens, RowActions, a11y
│       └── EmployeeDetailModal.tsx   # MODIFY — design tokens only
├── pages/
│   └── StaffPage.tsx                 # MODIFY — use CardGrid, skeleton pattern
```

## Complexity Tracking

No constitution violations — purely visual refactoring using already-established patterns.

## Research Questions (Phase 0)

1. Does `EmployeeCard.onView` currently navigate or open a modal? (Currently: opens `EmployeeDetailModal` via `viewingEmployeeId` state in `StaffPage`)
2. Should the entire card be clickable for View (like GroupCard) or only the View action button? (Recommended: card body clickable for View, consistent with other cards)
3. Are there any existing tests for `EmployeeCard` or `StaffPage` that need updating?

## Priority Order

1. **P1**: EmployeeCard — structural changes (skeleton, tokens, RowActions, a11y)
2. **P1**: StaffPage — use CardGrid, remove inline skeleton
3. **P2**: EmployeeDetailModal — token migration, no structural changes
