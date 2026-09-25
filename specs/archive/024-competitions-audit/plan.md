# Implementation Plan: Competitions Feature Audit & Fix (Phase 3)

**Branch**: `024-competitions-audit` | **Date**: 2026-05-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/024-competitions-audit/spec.md`

## Summary

Comprehensive audit-fix sweep across the competitions feature: fix 4 runtime bugs (null crash, debounce, empty catch, NaN guards), fix 6 cache invalidation gaps (create/update/delete competitions, team member/placement/fee mutations, register team), remove 9 dead code items (getTeamsWithMembers, getCompetitionFeeSummary/consumer, CategoryList, useCompetitionFees, useCompetitionHistory, .update mutation dead code, student stubs, getRecentActivities, searchActivities), consume 3 unused API endpoints (fee summary in Overview, student competitions/teams, wire .update mutation), eliminate 8 unsafe type casts + 3 inline query keys, and add a11y/UX polish (ARIA on spinners, ErrorBoundaries on student tabs, aria-hidden on icons, NaN fallback). All changes frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | PASS | All changes in `src/`. Dead API function removal is safe — backend still serves the endpoint. |
| II. Server State Discipline | PASS (after fix) | Pre-existing violations: CompetitionEditPage calls `updateCompetition()` directly. Remediation: wire via `useCompetition().update` hook. |
| III. Global State Minimalism | PASS | No Zustand stores added. All state remains in React Query + localStorage. |
| IV. TypeScript Strict Mode | PASS (after fix) | Pre-existing: 8 unsafe `as` casts, 3 inline query keys. Remediation: type guards, validation, centralized keys. |
| V. Component Naming Convention | PASS | No new components — only removal and fixes. |

## Project Structure

### Documentation (this feature)
```
specs/024-competitions-audit/
├── plan.md              # This file
├── spec.md              # Feature specification
└── tasks.md             # Task breakdown
```

### Source Code Changes
```
src/
├── api/
│   ├── analytics/competition.ts  # Keep getCompetitionFeeSummary (now consumed by US4)
│   ├── competitions/             # No structural changes
│   └── teams/teams.ts            # Remove getTeamsWithMembers dead export
├── components/
│   ├── common/LoadingSpinner.tsx  # Add role="status", aria-live
│   ├── competitions/
│   │   ├── CategoryList.tsx      # REMOVE (unused, tests integrated elsewhere)
│   │   └── TeamsTab.tsx          # Fix localStorage as cast, inline as { subgroups } cast
│   └── crm/students/             # Student tabs: ErrorBoundaries, loading states, aria-hidden
├── hooks/
│   ├── competitions/
│   │   ├── useCompetition.ts     # Wire .update mutation into CompetitionEditPage consumer
│   │   ├── useCompetitionFees.ts # REMOVE (dead hook)
│   │   └── useCompetitionHistory.ts # REMOVE (dead hook)
│   ├── teams/useTeams.ts         # Fix overly broad invalidation, un-awaited promises
│   └── queryKeys.ts              # No changes needed (centralized factory already correct)
├── pages/
│   ├── CompetitionDetailPage.tsx # Fix null crash, NaN guards, add fee summary section
│   ├── CompetitionEditPage.tsx   # Wire useCompetition().update mutation
│   └── CompetitionsPage.tsx      # Fix create/delete cache invalidation
└── utils/
    └── groupTeams.ts            # Fix unsafe mutation cast
```

## Task Breakdown

### Phase 1 — Runtime Bugs + Cache Invalidation (P1)
1. Fix `summary?.categories?.find(...)` null crash in CompetitionDetailPage
2. Fix `parseInt`/`NaN` guards for optional fee strings (CompetitionDetailPage, CompetitionsPage)
3. Fix empty catch block in registerTeam (CompetitionDetailPage)
4. Add debounce to parent search field (TeamDetailPage)
5. Fix create/delete competition cache invalidation (CompetitionsPage)
6. Fix update competition cache invalidation (CompetitionEditPage → wire .update mutation)
7. Fix overly broad invalidation in useTeams (competition-level scoping)
8. Add missing cache invalidation in useTeamMembers, useTeamPayments, useTeamPlacement
9. Fix un-awaited invalidation promises (4 hooks)
10. Fix redundant invalidation in useCompetition

### Phase 2 — Dead Code Removal (P2)
11. Remove getTeamsWithMembers (dead duplicate in teams.ts)
12. Remove CategoryList component
13. Remove useCompetitionFees hook
14. Remove useCompetitionHistory hook
15. Remove getRecentActivities / searchActivities (or add consumer)
16. Remove student enrollment stubs or implement properly

### Phase 3 — Consume Unused Endpoints (P2)
17. Wire getCompetitionFeeSummary into CompetitionDetailPage Overview tab
18. Implement getStudentCompetitions / getStudentTeams properly in API layer + hooks
19. Wire useCompetition().update mutation into CompetitionEditPage

### Phase 4 — TypeScript Violations (P2)
20. Add validation guard for localStorage reads (TeamsTab, TeamGroupBySelector)
21. Add validation for RegisterTeamInput payload cast
22. Fix unsafe mutation cast in groupTeams.ts
23. Fix inline `as { subgroups }` cast in TeamsTab
24. Fix CompetitionsPage `as CreateCompetitionInput` cast
25. Fix CompetitionEditPage `as UpdateCompetitionInput` cast
26. Migrate inline query keys to centralized factory (student tabs, useStudentTeams)

### Phase 5 — UX/Accessibility (P3)
27. Add role="status" + aria-live to LoadingSpinner
28. Add ErrorBoundary + loading states to student CompetitionsTab and TeamsTab
29. Add aria-hidden to Lucide icons in student TeamsTab
30. Add ARIA label to parent search field
31. Add NaN fallback rendering for fee strings
