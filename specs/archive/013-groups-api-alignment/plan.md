# Implementation Plan: Groups API Alignment

**Branch**: `012-competitions-api-alignment` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-groups-api-alignment/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Align the frontend groups API layer, types, hooks, and UI components with the new backend API contract documented in `groups-api.md`. This involves: (1) updating TypeScript types to match new response/request shapes (`name`, `capacity`, nested `schedule` object, `start_date`), (2) adding API functions for new directory endpoints (archived, search, by-course, by-type), (3) removing deprecated competition endpoints and their UI usage in GroupDetailPage, (4) replacing client-side search with server-side search on the Groups page, and (5) adding a "Completed" tab to the Groups page. All changes are frontend-only — the backend is already deployed with the new contract.

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

### Unknowns & Clarifications

| Unknown | Resolution |
|---------|-----------|
| Does the backend already deploy the new API contract? | Yes — confirmed in spec assumptions |
| What happens to existing React Query caches with old shapes? | Natural invalidation on component remount; explicit invalidation on mutation |
| Competition endpoints removed from groups API — where does competition data live? | Separate `/api/v1/competitions` module (already exists) |
| Is `GET /academics/groups/enriched` still available? | Yes — confirmed in new API docs |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | All changes in `src/` — types, API functions, hooks, components |
| II. Server State Discipline | PASS | New endpoints use React Query hooks; mutations invalidate cache keys |
| III. Global State Minimalism | PASS | No Zustand changes needed |
| IV. TypeScript Strict Mode | PASS | All type changes comply with strict mode; no `any` usage |
| V. Component Naming Convention | PASS | New components follow existing suffix conventions |
| Cache Keys | PASS | New hooks use `queryKeys` factory functions |
| Build Gates | PASS | `npm run lint` + `npm run build` must pass after changes |

## Project Structure

### Documentation (this feature)

```text
specs/013-groups-api-alignment/
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
├── api/academics/
│   ├── groups/
│   │   ├── core.ts          # UPDATE: type shapes, renamed fields
│   │   ├── lifecycle.ts     # No changes needed (still valid)
│   │   ├── competitions.ts  # DELETE: removed endpoints
│   │   ├── newEndpoints.ts  # No changes needed (already aligned)
│   │   ├── utils.ts         # UPDATE: remove getGroupsWithCompetitions
│   │   └── index.ts         # UPDATE: remove competition re-exports
│   └── types/groups/
│       ├── models.ts        # UPDATE: Group, EnrichedGroupPublic types
│       ├── inputs.ts        # UPDATE: ScheduleGroupInput, UpdateGroupDTO
│       ├── lifecycle.ts     # No changes needed
│       ├── competitions.ts  # DELETE: removed types
│       ├── grouping.ts      # UPDATE: remove EnrichedGroupPublicWithCompetition
│       └── index.ts         # UPDATE: remove competition re-exports
├── hooks/
│   ├── queryKeys.ts         # UPDATE: add new cache keys if needed
│   └── useGroupQueries.ts   # UPDATE: add search, archived, by-course hooks
├── pages/
│   ├── GroupsPage.tsx       # UPDATE: add "Completed" tab, server-side search
│   └── GroupDetailPage.tsx  # UPDATE: remove competition data loading
├── components/groups/
│   ├── shared/
│   │   └── GroupStatusBadge.tsx  # UPDATE: 'archived' → 'completed'
│   └── detail/
│       └── EditGroupDialog.tsx   # UPDATE: status union, schedule transform
│       └── GroupForm.tsx         # UPDATE: schedule field transform
├── utils/
│   └── scheduleTransform.ts      # NEW: flat ↔ nested schedule utilities
└── types/
    └── api.ts               # No changes needed
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. Changes span types → API layer → hooks → components → pages in a top-down dependency chain.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. All changes align with existing patterns and principles.
