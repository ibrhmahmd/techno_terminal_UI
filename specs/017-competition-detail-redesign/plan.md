# Implementation Plan: Competition Detail Redesign

**Branch**: `017-competition-detail-redesign` | **Date**: 2026-05-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/017-competition-detail-redesign/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Redesign the competition detail page from 4 tabs (Overview, Categories, Teams, Summary) to 2 tabs (Overview, Teams). The Overview tab absorbs competition info, stats (total teams/participants), and a compact grid of category cards. The Teams tab shows all teams as rich cards with placement badges, fee payment status, member counts, a category filter, and a primary + secondary group-by selector (modeled after the Groups page GroupBySelector). No backend changes — all data from existing endpoints; grouping performed client-side.

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
| I. Frontend-Only Scope | PASS | All changes in `src/`. Backend endpoints reused as-is — no new API endpoints needed. |
| II. Server State Discipline | PASS | All team/category/summary data through existing React Query hooks (`useTeams`, `useCompetitionCategories`, `useCompetitionSummary`). No raw fetch or useEffect for API calls. |
| III. Global State Minimalism | PASS | New state: tab selection via `useState`, group-by preference via `localStorage` (matching the Groups page pattern). No Zustand changes needed. |
| IV. TypeScript Strict Mode | PASS | All existing types (`TeamDTO`, `TeamWithMembersDTO`, `CategoryWithTeamsDTO`) used as-is. New grouping types follow the `GroupByField` pattern. |
| V. Component Naming Convention | PASS | New components: `TeamsTab.tsx` → `components/competitions/`, `TeamGroupBySelector.tsx` → `components/competitions/`, `TeamCard.tsx` → `components/competitions/`. Overview content stays inline in `CompetitionDetailPage.tsx` or extracted into `CompetitionOverviewTab.tsx`. |

**Gate Result**: PASS — all principles upheld.

## Project Structure

### Documentation (this feature)

```text
specs/017-competition-detail-redesign/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/
│   └── teams/teams.ts       # Update getTeams to use include_members=true for payment data
├── components/
│   ├── common/
│   │   └── combobox/        # Reused if InstructorCombobox needed in teams filter
│   └── competitions/
│       ├── TeamCard.tsx          # NEW — Rich team card (name, placement, fee status, members)
│       ├── TeamGroupBySelector.tsx  # NEW — Group-by + subgroup-by selectors
│       ├── TeamCategoryFilter.tsx  # NEW — Category filter dropdown/pill row
│       └── CategoryTeamsModal.tsx  # Unchanged — reused as-is
├── hooks/
│   └── teams/useTeams.ts     # Update to return member/payment data
├── pages/
│   └── CompetitionDetailPage.tsx  # MAJOR — restructure: 2 tabs, inline overview stats,
│                                  #   category grid, teams tab with grouping/filtering
└── tests/
    ├── TeamCard.test.tsx           # NEW
    └── CompetitionDetailPage.test.tsx  # NEW or updated
```

**Structure Decision**: Frontend-only SPA. Follows the existing domain organization under `src/components/competitions/` and `src/hooks/teams/`. New components mirror the Groups page pattern (`GroupBySelector` → `TeamGroupBySelector`, `GroupCard` → `TeamCard`).

## Complexity Tracking

No violations — all principles pass. Complexity Tracking not needed.
