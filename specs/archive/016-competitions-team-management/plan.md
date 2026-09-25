# Implementation Plan: Competitions & Team Management Feature Complete

**Branch**: `016-competitions-team-management` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-competitions-team-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Close the gap between backend API capabilities and frontend UI coverage for competitions and team management. Nine user stories spanning: team edit modal (P1), instructor assignment on registration/edit (P2), parent selector on fee payment (P2), placement + fee status in team lists (P3), duplicate type removal (P3), barrel export completion (P3), dead code removal of `useTeamsWithMembers` (P3), fix `registerTeam` group mode payload (P3), and test coverage (P4). All changes are frontend-only, touching ~15 files.

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
| I. Frontend-Only Scope | PASS | All changes in `src/`, no backend modifications needed |
| II. Server State Discipline | PASS | All data through React Query — `useTeam.update` already exists, `getEmployees` via `useEmployees` hook |
| III. Global State Minimalism | PASS | No Zustand changes needed — all state is local or React Query |
| IV. TypeScript Strict Mode | PASS | No `any` casts introduced; existing conventions followed |
| V. Component Naming Convention | PASS | `TeamEditModal.tsx` → `components/teams/`, `InstructorCombobox.tsx` → `components/common/combobox/` |
| API Layer (client.ts) | PASS | No new endpoints — all via existing `client.ts` |
| Cache Keys (queryKeys.ts) | PASS | Existing keys suffice — `staffKeys.list`, `teamKeys` already defined |

**Gate Result**: PASS — all principles upheld. Design strengthens constitution adherence.

## Project Structure

### Documentation (this feature)

```text
specs/016-competitions-team-management/
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
├── api/
│   ├── competitions/types.ts      # Remove duplicate type definitions
│   └── teams/teams.ts             # Remove unused getTeamsWithMembers
├── components/
│   ├── common/combobox/
│   │   └── InstructorCombobox.tsx  # NEW — searchable SpyCombobox for instructors
│   ├── competitions/
│   │   ├── index.ts               # Add missing exports
│   │   ├── TeamRegistrationModal.tsx  # Add instructor selector, fix group payload
│   │   └── CategoryTeamsModal.tsx  # Add fee status per team
│   ├── teams/
│   │   ├── TeamDetailPage.tsx      # Add edit button, instructor display, parent selector
│   │   └── TeamEditModal.tsx       # NEW — edit team modal
│   └── common/
│       └── ParentCombobox.tsx      # NEW — searchable parent selector
├── hooks/
│   └── teams/useTeams.ts          # Remove useTeamsWithMembers
├── pages/
│   └── CompetitionDetailPage.tsx  # Enhanced team cards with placement/fee status
└── tests/
    ├── TeamRegistrationModal.test.tsx  # NEW
    ├── CategoryList.test.tsx           # NEW
    └── TeamDetailPage.test.tsx         # NEW
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. New components follow the existing naming conventions. All new components use existing base components (`SpyCombobox`, `Modal`, `LoadingSpinner`).

## Complexity Tracking

No violations — all principles pass. Complexity Tracking not needed.
