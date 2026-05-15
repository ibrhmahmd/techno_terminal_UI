# Implementation Plan: Competitions Bug Audit & API-UI Gap Analysis

**Branch**: `005-competitions-bug-audit` | **Date**: 2026-05-13 | **Spec**: `specs/005-competitions-bug-audit/spec.md`
**Input**: Feature specification from `specs/005-competitions-bug-audit/spec.md`

## Summary

Audit the competitions domain for frontend/backend API contract mismatches, fix all found bugs, and identify API-documented features that lack frontend UI integration. Research (Phase 0) is already complete — 10 mismatches documented in `research.md`. Source code audit confirms most types/API calls are already aligned with docs; remaining work is Phase 1 verification against live backend + UI regression testing.

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
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). Build must pass `tsc -b && vite build`.  
**NEEDS CLARIFICATION**: None — research.md already resolves all unknowns with documented evidence.

## Research Findings (Phase 0 — Complete)

Research is fully documented in `research.md` with 10 identified mismatches. After code audit, **7 of 10 are already resolved in the source code**:

| # | Mismatch | Doc Says | Code Says | Status |
|---|----------|----------|-----------|--------|
| 1 | List Competitions response | `list[CompetitionDTO]` (flat) | Flat `Competition[]` via `getCompetitions()` | ✅ Aligned |
| 2 | List Competitions params | `include_deleted` only | `include_deleted` only | ✅ Aligned |
| 3 | Categories response shape | `CategoryResponse` (strings) | `CategoryResponse` (strings) | ✅ Aligned |
| 4 | Team registration endpoint | `POST /teams` | `POST /teams` via `registerTeam()` | ✅ Aligned |
| 5 | RegisterTeamInput payload | Flat `student_ids: int[]` | Flat `student_ids: int[]` | ✅ Aligned |
| 6 | Team field name | `team_name` | `team_name` in `TeamDTO` + `TeamPublic` | ✅ Aligned |
| 7 | GroupCompetitionHistoryDTO | `participations[]` | `participations[]` | ✅ Aligned |
| 8 | Undocumented endpoints | Not in docs | Removed from code (dead code elimination) | ✅ Resolved |
| 9 | Dead types | N/A | `CompetitionCategory`, `TeamRegistration`, et al. removed | ✅ Resolved |
| 10 | Student competitions | `GET /students/{id}/competitions` | Stub returning `[]` | ❌ Backend not implemented |

## API Features Without UI (Gap Analysis)

Based on `docs/api/competitions/` vs `src/pages/` and `src/components/` audit:

| Endpoint | Doc Status | Frontend Status | Gap |
|----------|-----------|-----------------|-----|
| `GET /teams` | Documented | `useTeams` hook exists, consumed in CompetitionDetailPage teams tab | ✅ Covered |
| `PUT /teams/{id}` | Documented | Not implemented in `teams.ts` | ⚠️ Low priority — PATCH covers similar use |
| `GET /teams/deleted` | Documented | `useDeletedTeams` hook exists, no UI page | ⚠️ No dedicated UI for listing deleted teams |
| `POST /teams/{id}/members` | Documented | `addTeamMember` API + hook exists, no UI component | ⚠️ No dedicated modal/component for adding members |
| `GET /students/{id}/competitions` | Documented | Stub returning `[]` | ❌ Backend not implemented, no UI |
| Group competitions management | Documented | `useGroupCompetitions` hook exists, `HistoryTab` + `CompetitionRecords` exist | ✅ Covered in group detail page |
| Finance/Analytics competitions | Documented | Fully implemented | ✅ Aligned |

## Constitution Check

### Gate Evaluation

| Principle | Check | Status |
|-----------|-------|--------|
| **I. Frontend-Only Scope** | Audit is frontend-only. All changes in `src/`. No backend code. | ✅ Pass |
| **II. Server State Discipline** | All API calls go through `src/api/client.ts` (Axios). Types aligned with doc contracts. React Query hooks used everywhere. | ✅ Pass |
| **III. Global State Minimalism** | No global state changes. All state is local or React Query. | ✅ Pass |
| **IV. TypeScript Strict Mode** | No `any`, no unused locals/params. `verbatimModuleSyntax` honored. `erasableSyntaxOnly` respected (no enums). | ✅ Pass |
| **V. Component Naming Convention** | Existing components follow `*Card`, `*Modal`, `*Form`, `*Page`, `*Tab` conventions. | ✅ Pass |
| **Cache & API Discipline** | Query keys from `queryKeys.ts`. Mutations invalidate affected caches. | ✅ Pass |

**Result**: All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/005-competitions-bug-audit/
├── plan.md              # This file (filled in)
├── spec.md              # Feature specification
├── research.md          # Phase 0 — 10 documented mismatches
├── data-model.md        # Phase 1 — entity alignment status
├── quickstart.md        # Phase 1 — verification guide
├── contracts/
│   └── competitions-api.md  # Verified API contracts
├── checklists/
│   └── requirements.md  # Quality checklist
└── tasks.md             # 39 tasks across 7 phases
```

### Source Code (relevant files)

```text
src/
├── api/competitions/
│   ├── index.ts         # Barrel exports
│   ├── types.ts         # Competition, CategoryResponse, TeamDTO, etc. (aligned)
│   └── competitions.ts  # 9 API functions (aligned, no undocumented endpoints)
├── api/teams/
│   ├── index.ts         # Barrel exports
│   ├── types.ts         # RegisterTeamInput, TeamDTO, etc. (aligned)
│   └── teams.ts         # 14 API functions (PUT /teams/{id} missing)
├── api/academics/groups/competitions.ts   # Group competitions API
├── api/academics/types/groups/competitions.ts  # Aligned types
├── api/crm/students/enrollments.ts       # Stub getStudentCompetitions
├── components/competitions/
│   ├── CompetitionCard.tsx       # Card display (aligned)
│   ├── CompetitionForm.tsx       # Create/Edit form (aligned)
│   ├── CategoryList.tsx          # String-based categories (aligned)
│   └── TeamRegistrationModal.tsx  # Flat student_ids payload (aligned)
├── components/groups/history/
│   └── CompetitionRecords.tsx    # DataTable for participations
├── components/student/
│   └── CompetitionsTab.tsx       # Student competition history
├── pages/
│   ├── CompetitionsPage.tsx      # List page with create/delete/restore
│   ├── CompetitionDetailPage.tsx  # Detail with 4 tabs
│   └── TeamDetailPage.tsx        # Team detail with members, fees, placement
└── hooks/
    ├── competitions/             # 6 hooks (aligned)
    ├── teams/                    # 7 hooks (aligned)
    ├── useGroupCompetitions.ts   # Group competitions hook
    └── students/useStudentCompetitions.ts  # Stub hook
```

## Current Status Summary

### What's Already Done
- Research complete — all 10 mismatches documented with evidence
- Dead code eliminated — `CompetitionCategory`, `TeamRegistration`, old types, undocumented endpoints removed
- Types aligned with doc schemas — `CategoryResponse` (strings), `TeamDTO` (`team_name`), `GroupCompetitionHistoryResponseDTO` (`participations[]`)
- API functions aligned — `getCompetitions(includeDeleted)`, `registerTeam()` uses `POST /teams`, no undocumented endpoints
- UI components adapted — `CategoryList` handles string categories, `TeamRegistrationModal` sends flat payload
- Contracts documented — `contracts/competitions-api.md` with verified status per endpoint
- Tasks generated — 39 tasks across 7 phases in `tasks.md`

### What Still Needs Doing
1. **Phase 1 verification** (T001-T007): Verify against live backend by running `npm run dev`, enabling debug mode, capturing actual API responses
2. **Phase 2-6 (stories)**: Fix any remaining mismatches revealed by live verification, then test UI end-to-end
3. **Phase 7 (polish)**: Build/lint/test passes, doc updates

### API-UI Gaps to Address
- `PUT /teams/{id}` endpoint not implemented in frontend (low priority — PATCH covers it)
- `GET /teams/deleted` has hook but no UI page for listing deleted teams
- `POST /teams/{id}/members` has hook but no add-member UI component
- `GET /students/{id}/competitions` backend stub — no UI needed until backend is ready
- Group competitions management (link, register, complete, withdraw) — hooks exist, UI coverage needs verification

## Complexity Tracking

No constitution violations to justify. Feature is well-scoped and within established conventions.
