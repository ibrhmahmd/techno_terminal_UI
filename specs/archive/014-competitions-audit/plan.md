# Implementation Plan: Competitions Feature Audit & Quality Fix

**Branch**: `012-competitions-api-alignment` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-competitions-audit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Audit and remediation of the competitions feature across 47 findings from a 5-phase analysis. The work spans runtime bug fixes (null-safety, NaN guards), dead code removal (unused exports, unused props), TypeScript quality improvements (unsafe casts, missing return types), data fetching migration (manual fetch → React Query, centralized query keys), and accessibility enhancements (ARIA roles, keyboard navigation, icon accessibility, modal Escape handler). All changes are frontend-only, touching ~20 files across components, hooks, API functions, and pages.

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

## Constitution Check (Post-Design Re-evaluation)

*Re-checked after Phase 1 design completion.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | Confirmed — all changes in `src/`, no backend modifications |
| II. Server State Discipline | PASS | Confirmed — `useCompetitionFees` migrated to React Query; all hooks now use `useQuery`/`useMutation` |
| III. Global State Minimalism | PASS | Confirmed — no Zustand changes |
| IV. TypeScript Strict Mode | PASS | Confirmed — all unsafe casts replaced, catch clauses use `unknown`, return types added |
| V. Component Naming Convention | PASS | Confirmed — no new component types introduced |
| API Layer (client.ts) | PASS | Confirmed — no new endpoints, all existing calls through `client.ts` |
| Cache Keys (queryKeys.ts) | PASS | Confirmed — new factory methods added (`teamsByCompetition`, `teamsWithMembers`, `studentCompetitions`, `competitionFees`); inline keys eliminated |

**Gate Result**: PASS — all principles upheld. Design strengthens constitution adherence.

## Project Structure

### Documentation (this feature)

```text
specs/014-competitions-audit/
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
├── api/                  # Domain-based Axios modules
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── competitions/     # ← UPDATED: null-safety fixes
│   └── teams/            # ← UPDATED: null-safety fixes
├── components/
│   ├── common/           # ← UPDATED: Modal.tsx (a11y), TableActions.tsx (a11y)
│   ├── competitions/     # ← UPDATED: all competition components
│   └── student/          # ← UPDATED: CompetitionsTab.tsx
├── hooks/                # React Query hooks per domain
│   ├── queryKeys.ts      # ← UPDATED: add missing factory methods
│   ├── competitions/     # ← UPDATED: query key usage
│   ├── teams/            # ← UPDATED: enabled guards, query keys
│   ├── students/         # ← UPDATED: query key usage
│   ├── finance/          # ← UPDATED: migrate to React Query
│   └── useStudentActivity.ts  # ← UPDATED: consolidate activityKeys
├── pages/                # 18 route page components
│   ├── CompetitionDetailPage.tsx   # ← UPDATED: a11y, NaN guards
│   ├── CompetitionEditPage.tsx     # ← UPDATED: NaN guards, type safety
│   ├── CompetitionsPage.tsx        # ← UPDATED: a11y, type safety
│   └── TeamDetailPage.tsx          # ← UPDATED: a11y, type safety
├── utils/                # ← UPDATED: date formatting consistency
└── types/                # Global TS interfaces (api.ts, pagination.ts)
```

**Structure Decision**: Frontend-only SPA. All changes modify existing files under `src/`. No new files created — ErrorBoundary already exists at `src/components/common/ErrorBoundary.tsx`. No backend, no monorepo packages. The `activityKeys` factory in `useStudentActivity.ts` remains co-located (different namespace from `queryKeys.ts`, no consolidation needed).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [none] | [all principles pass] | [N/A] |
