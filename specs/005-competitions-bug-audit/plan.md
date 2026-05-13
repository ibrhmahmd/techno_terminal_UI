# Implementation Plan: Competitions Bug Audit

**Branch**: `005-competitions-bug-audit` | **Date**: 2026-05-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-competitions-bug-audit/spec.md`

## Summary

Audit and fix mismatches between the documented competitions API (`docs/api/competitions/`) and actual frontend consumption (`src/api/competitions/`, `src/hooks/competitions/`, `src/components/competitions/`). The `implementation-map.md` identified 4 critical mismatches (categories response shape, team registration endpoint/payload, 3 undocumented endpoints) and 5 warnings (list params, field name mismatches, student competitions stub). This plan resolves all by capturing real API responses and aligning either the frontend types or the documentation.

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

### Unknowns to Research

1. **Category response actual shape** — Does `GET /competitions/{id}/categories` return `CategoryResponse` (strings) or `CompetitionCategory` (entities)? This determines if Categories tab is broken or not.
2. **Team registration actual endpoint** — Does the backend accept `POST /competitions/register-team` or only `POST /teams`?
3. **List competitions actual params** — Does the backend accept `status`/`skip`/`limit`/`search` parameters or only `include_deleted`?
4. **List competitions response format** — Does it return a flat `list[CompetitionDTO]` or a paginated `{ data[], total, skip, limit }` envelope?
5. **TeamPublic actual field names** — Does the backend return `team_name` (as documented) or `name` (as frontend expects)?
6. **GroupCompetitionHistoryResponseDTO actual fields** — Does it have `participations[]` (doc) or `competitions[]` (frontend)?
7. **Actual existence of 3 undocumented endpoints** — `GET .../categories/{catId}/teams`, `POST competitions/register-team`, `POST competitions/team-members/{id}/mark-paid`, `GET competitions/{id}/stats`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ Pass | Bug audit stays in `src/`, no backend changes |
| II. Server State Discipline | ✅ Pass | No new data fetching patterns |
| III. Global State Minimalism | ✅ Pass | Not relevant |
| IV. TypeScript Strict Mode | ✅ Pass | Standard build constraint |
| V. Component Naming | ✅ Pass | Not relevant |
| Build Gates (lint + build) | ✅ Pass | Standard requirement |
| Testing | ✅ Pass | Not required by spec |

**All gates pass — no violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/005-competitions-bug-audit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — captured API responses
├── data-model.md        # Phase 1 output — aligned type definitions
├── quickstart.md        # Phase 1 output — audit & fix instructions
├── contracts/           # Phase 1 output — verified API contracts
├── checklists/
│   └── requirements.md  # Spec quality validation
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code

```text
src/
├── api/competitions/
│   ├── types.ts          # ★ Likely needs type alignment
│   ├── competitions.ts   # ★ May need endpoint/payload alignment
│   └── index.ts
├── api/academics/types/groups/
│   └── competitions.ts   # ★ May need field name alignment
├── components/competitions/
│   ├── CompetitionCard.tsx
│   ├── CompetitionForm.tsx
│   ├── CategoryList.tsx
│   ├── CategoryForm.tsx
│   └── TeamRegistrationModal.tsx
├── hooks/competitions/
│   ├── useCompetitions.ts
│   ├── useCompetition.ts
│   ├── useCompetitionCategories.ts
│   ├── useCompetitionTeams.ts
│   ├── useDeletedCompetitions.ts
│   └── useCompetitionSummary.ts
├── pages/
│   ├── CompetitionsPage.tsx
│   └── CompetitionDetailPage.tsx
└── docs/api/competitions/
    ├── implementation-map.md  # Existing
    ├── competitions.md        # ★ May need doc update
    ├── schemas.md             # ★ May need doc update
    ├── teams.md               # May need archiving
    ├── errors.md
    └── README.md
```

## Complexity Tracking

> No Constitution violations — this section is intentionally empty.

## Phases

### Phase 0 — Research

**Goal**: Resolve all 7 unknowns by capturing real backend responses.

Tasks:
1. Start dev server, login, enable API debug mode
2. Capture `GET /competitions/{id}/categories` response
3. Capture `POST /competitions/register-team` response (or 404)
4. Capture `GET /competitions` with various params
5. Capture `GET /academics/groups/{id}/teams` response
6. Capture `GET /academics/groups/{id}/competitions/analytics` response
7. Capture `GET /competitions/{id}/stats` response
8. Capture `GET /competitions/{competitionId}/categories/{categoryId}/teams` response
9. Capture `POST /competitions/team-members/{id}/mark-paid` response
10. Consolidate all findings into `research.md`

**Output**: `research.md` — all unknowns resolved with actual API response traces.

### Phase 1 — Design & Contracts

**Goal**: Align frontend types, API calls, and documentation to match actual backend responses.

Tasks:
1. Update `src/api/competitions/types.ts` — fix `CompetitionCategory` type if backend returns `CategoryResponse`; fix `RegisterTeamInput` if payload differs; fix field names where needed
2. Update `src/api/competitions/competitions.ts` — align endpoint paths if needed; fix response unwrapping if flat vs paginated
3. Update `src/api/academics/types/groups/competitions.ts` — align `TeamPublic` field names; align history DTO fields
4. Update `docs/api/competitions/competitions.md` and `schemas.md` — bring docs in line with actual responses
5. Update `src/components/competitions/CategoryList.tsx` — if categories response is strings, adapt rendering
6. Update `src/components/competitions/TeamRegistrationModal.tsx` — if team registration payload format changed
7. Verify build passes (`npm run build`), lint passes (`npm run lint`), tests pass (`npm run test`)
8. Generate `contracts/` — verified API contracts for all competition endpoints
9. Generate `data-model.md` — aligned entity definitions
10. Generate `quickstart.md` — how to run the audit and fix steps
11. Update AGENTS.md SPECKIT markers to point to this plan

**Output**: `data-model.md`, `contracts/`, `quickstart.md`, updated source files, updated docs.

### Phase 2 — Tasks (via `/speckit.tasks`)

**Output**: `tasks.md` with concrete implementation steps.
