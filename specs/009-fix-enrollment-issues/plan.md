# Implementation Plan: Fix Enrollment Issues

**Branch**: `009-fix-enrollment-issues` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-fix-enrollment-issues/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix three enrollment-related issues: (1) change hardcoded default price of 150 EGP to 0 in the new enrollment form, (2) prevent scroll wheel from accidentally changing number input values, (3) review the existing API for enrollment edit capabilities.

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

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Frontend-Only Scope | US1 (price default) and US2 (scroll prevention) modify only `src/components/enrollments/EnrollPanel.tsx`. US3 is a read-only API review. No backend code. | ✅ PASS |
| II. Server State Discipline | EnrollPanel calls `createEnrollment()` directly via Axios (pre-existing). Fixing this to use React Query is scope creep. No new server state violations introduced. | ⚠️ EXISTING VIOLATION (documented) |
| III. Global State Minimalism | No new Zustand stores. All state stays local `useState`. | ✅ PASS |
| IV. TypeScript Strict Mode | All changes use `import type`, no `any`, no `enum`. | ✅ PASS |
| V. Component Naming Convention | No new components created. | ✅ PASS |

**Gate result**: PASS — The pre-existing Principle II violation (EnrollPanel calling API directly instead of through React Query) is pre-existing and out of scope for this fix.

## Project Structure

### Documentation (this feature)

```text
specs/009-fix-enrollment-issues/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no new interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (changed files)

```text
src/
└── components/
    └── enrollments/
        └── EnrollPanel.tsx    # MODIFIED: default price 0, onWheel scroll prevention
```

**Only one file modified**: `src/components/enrollments/EnrollPanel.tsx`

### No new files — all changes are in-place edits to existing file.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle II: EnrollPanel uses direct Axios call instead of React Query mutation | Pre-existing pattern — refactoring to React Query would add ~50 lines of hook code + cache invalidation for a change that's purely about default values and event handling | Migrating the entire enrollment creation path to React Query is out of scope for this fix; it would increase complexity by ~3x |
