# Implementation Plan: Staff Page Redesign — Design System Alignment

**Branch**: `050-staff-page-redesign` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/050-staff-page-redesign/spec.md`

## Summary

Redesign `EmployeeCard`, `EmployeeDetailModal`, and `StaffPage` to align with the app's established design system tokens and shared component patterns already used by `GroupCard`, `StudentCard`, and `ParentCard`. Three structural changes: (1) adopt `CardGrid` + `CardSkeleton` from `src/components/directory/`, (2) replace inline action buttons with `RowActions` in a border-top footer with whole-card click for View, (3) migrate all hardcoded color utilities to design tokens. Frontend-only, no backend changes.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json) — design tokens in `tailwind.config.js`
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**Project Type**: Frontend SPA (React single-page application)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) via `RowActions`
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/components/staff/` and `src/pages/StaffPage.tsx` — no backend code |
| II. Server State Discipline | ✅ PASS | No changes to hooks or API functions; purely visual refactoring |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores; all state is local useState or React Query (unchanged) |
| IV. TypeScript Strict Mode | ✅ PASS | No new types; existing `EmployeeListItem` / `EmployeePublic` unchanged. No `any` |
| V. Component Naming Convention | ✅ PASS | Existing components (`EmployeeCard`, `EmployeeDetailModal`, `StaffPage`) keep names; `CardGrid` and `CardSkeleton` are shared imports from `directory/` |
| Build Gates (lint, build) | ✅ PASS | Both pass with no new dependencies |

**Gate Result**: PASS — zero violations.

## Project Structure

### Documentation (this feature)

```text
specs/050-staff-page-redesign/
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
├── components/
│   ├── directory/
│   │   ├── CardGrid.tsx              # Already exists — import into StaffPage
│   │   └── shared/CardSkeleton.tsx   # Already exists — use for EmployeeCard loading
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

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
