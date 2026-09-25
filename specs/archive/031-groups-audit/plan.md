# Implementation Plan: Groups Page Audit & Fix

**Branch**: `030-groups-ui-redesign` | **Date**: 2026-06-03 | **Spec**: `specs/031-groups-audit/spec.md`
**Input**: Feature specification from `/specs/031-groups-audit/spec.md`

## Summary

Audit and fix of the Groups feature across 5 user stories: (1) Fix 5 runtime bugs including `GroupStatusBadge` crash on unknown status, `instructor_id: 0` sent to PATCH, and silent multi-filter truncation; (2) Remove 5 dead exports; (3) Eliminate 1 `any` type usage, 6 unsafe `as X` casts, and 1 `Record<string, any>` param object; (4) Migrate 1 manual `useEffect`-based fetch to `useCourses()` and centralize 2 local query key factories into `queryKeys.ts`; (5) Add ARIA attributes (`aria-label`, `aria-pressed`, `aria-selected`, `role="tabpanel"`, `role="alert"`, `<fieldset>`, `aria-hidden="true"`) to 21 interactive controls. All changes are frontend-only.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)
**Testing**: Vitest 4.1 + happy-dom — test files in `src/tests/`, setup in `src/test/setup.ts`
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text
**Build Gates**: Must pass `npm run build` (`tsc -b && vite build`) and `npm run lint`
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`). `any` forbidden unless justified. Build must pass `tsc -b && vite build`.
**Scale/Scope**: ~30 scoped files across groups feature: 22 components, 9 hooks, 2 pages, 5 API modules, 4 type files

### Key State Locations
- **`src/hooks/useGroups.ts`** — Central groups page state: filter selections, groupBy mode, pagination, sort. Uses React Query for server data.
- **`src/hooks/useGroupQueries.ts`** — React Query hooks: queries (flat list, grouped) + mutations (create, update, delete). Local `groupKeys` factory.
- **`src/store/groupingSettingsStore.ts`** — Zustand store for groupingSettings.
- **Centralized query keys**: `src/hooks/queryKeys.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| **I. Frontend-Only Scope** | ✅ PASS | All changes in `src/`. No backend code, no schemas, no server logic. API-driven integration preserved. |
| **II. Server State Discipline** | ⚠️ VIOLATIONS FOUND (to be fixed) | US4 explicitly fixes: `GroupForm.tsx` uses manual `useEffect`+`getCourses()` instead of `useCourses()` hook. Inline query keys in `useStudentsGrouped.ts` and `useProgressLevelForm.ts` bypass centralized `queryKeys.ts`. All violations are fixed by this plan. |
| **III. Global State Minimalism** | ✅ PASS | No new Zustand stores. All state remains local or in React Query filter/pagination state. |
| **IV. TypeScript Strict Mode** | ⚠️ VIOLATIONS FOUND (to be fixed) | US3 explicitly fixes: `as any` cast in `GroupCombobox.tsx`, `Record<string, any>` in `groups/core.ts`, redundant casts in `GroupForm.tsx`, `useGroups.ts`, `GroupDetailPage.tsx`. All violations are fixed by this plan. |
| **V. Component Naming Convention** | ✅ PASS | No new components created. Existing naming follows convention. |

**Gate Result**: ✅ PASS — All violations are explicitly addressed by the plan's user stories. No exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/031-groups-audit/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (scoped files)

```text
src/components/groups/
├── GroupBySelector.tsx       # US1: Fix aria-selected. US5: Add aria-selected fix
├── GroupCard.tsx             # US5: Add aria-label to clickable card
├── GroupCategoryTabs.tsx     # US5: role="tabpanel" wrapping
├── GroupFilters.tsx          # US5: aria-label close, aria-pressed on pills
├── GroupForm.tsx             # US1: fix. US3: DRY schedule parsing. US4: migrate to useCourses()
├── GroupsHeader.tsx          # (no changes needed)
├── ViewToggle.tsx            # (no changes needed)
├── TabNavigation.tsx         # US5: role="tabpanel" wrapping
├── AttendanceTab.tsx         # US5: role="alert" on errors
├── LevelsTab.tsx             # US5: role="region" + aria-labelledby on accordion
├── PaymentsTab.tsx           # US5: role="status" on skeleton, nested button fix
├── StudentsTab.tsx           # US5: role="alert" on errors
├── shared/GroupStatusBadge.tsx  # US1: crash fix, color fix
├── detail/EditGroupDialog.tsx   # US1: instructor_id:0 fix, day validation, status field. US5: fieldset
├── detail/GroupInfoCard.tsx     # US5: aria-label on buttons, aria-hidden on icons
├── detail/LevelSelector.tsx     # (no changes needed)
├── detail/ProgressLevelDialog.tsx # (no changes needed)
├── detail/index.ts              # US2: remove unused barrel exports
└── index.ts                     # US2: remove unused GroupCardProps export

src/common/combobox/GroupCombobox.tsx  # US3: fix as any. US5: aria-hidden, aria-label
src/common/datatable/GroupedTable.tsx  # (no changes needed)

src/hooks/
├── useGroups.ts               # US1: multi-filter truncation. US2: remove processedGroups. US3: cast fixes
├── useGroupQueries.ts         # US1: grouped limit 50→200. US4: consolidate into queryKeys.ts
├── useGroupDetail.ts          # (no changes needed)
├── useGroupMutations.ts       # (no changes needed)
├── useGroupAttendance.ts      # US2: remove unused type export
├── useGroupEnrollments.ts     # (no changes needed)
├── useGroupPayments.ts        # (no changes needed)
├── useRecentGroups.ts         # (no changes needed)
├── useStudentsGrouped.ts      # US4: move keys to queryKeys.ts
├── useProgressLevelForm.ts    # US4: inline key → queryKeys.ts (cross-reference)
└── queryKeys.ts               # US4: absorb local factories

src/pages/
├── GroupsPage.tsx             # US1: fix groupBy initial state. US4: remove redundant refresh()
├── GroupDetailPage.tsx         # US4: remove redundant refetch(). US3: fix stale mutationError

src/api/academics/groups/
├── core.ts                    # US3: Record<string, any> → Record<string, unknown>
├── index.ts                   # (no changes needed)
├── lifecycle.ts               # (no changes needed)
└── newEndpoints.ts            # (no changes needed)
```

## Complexity Tracking

No constitution violations require justification. All violations detected are explicitly fixed by this plan.

---

# Phases

## Phase 0: Outline & Research

### Unknowns / Research Tasks

1. **`instructor_ids[]` and `level_numbers[]` API params**: Confirm the backend accepts array params for multi-filter queries. If not, determine fallback (comma-separated string, or keep single-only).
2. **`Record<string, any>` → `Record<string, unknown>` migration**: Check that `api/academics/groups/core.ts` consumers handle the stricter type.
3. **Query key consolidation**: Map all key patterns in `useGroupQueries.ts`, `useStudentsGrouped.ts`, `useProgressLevelForm.ts` and design the unified schema in `queryKeys.ts`.

### Research Output

Consolidated in `research.md` (created below).

## Phase 1: Design & Contracts

### Data Model

No new data model required — all changes are refactoring of existing code. The `data-model.md` will document the entity types and state transitions affected.

### Contracts

No external API contracts change — all fixes are internal.

### Quickstart

Verification guide for each user story.

## Phase 2: Task Generation

Output in `tasks.md` (/speckit.tasks command).
