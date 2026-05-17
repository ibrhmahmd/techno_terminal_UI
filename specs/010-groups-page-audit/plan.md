# Implementation Plan: Groups Page Audit & Fixes

**Branch**: `010-groups-page-audit` | **Date**: 2026-05-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-groups-page-audit/spec.md`

## Summary

Comprehensive audit and fix of the Groups page feature across 5 user stories: (1) fix 15 runtime bugs and logic errors including status mislabeling, bitwise operators, stub functions, and navigation issues; (2) remove 7 dead components, 3 dead hooks, and 1 unused table component; (3) eliminate 7 `any` type usages, 27 `console.*` statements, and 6 redundant `export default` patterns; (4) migrate 5 manual `useEffect`-based hooks to React Query with centralized query keys; (5) add ARIA attributes and keyboard navigation to all interactive controls. All changes are frontend-only, touching files across `src/components/groups/`, `src/pages/`, `src/hooks/`, and `src/api/academics/`.

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

### Unknowns

| Unknown | Impact | Resolution |
|---------|--------|------------|
| Does backend have a batch competitions endpoint? | Affects N+1 fix approach (FR-018) | See research.md — No batch endpoint exists; fix uses `Promise.all` with parallel requests |
| Debounce implementation for notes field | Dependency choice (FR-006) | See research.md — Custom `useDebounce` hook, no new dependency needed |
| Should `useGroupDetail` manual fetch be migrated to React Query? | Scope of US4 | See research.md — Yes, migrated alongside other manual hooks |
| Test updates for removed `GroupsTable.tsx` | Test file cleanup | See research.md — Tests migrated to use `DataTable` + `groupColumns` pattern |

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Frontend-Only Scope | All changes in `src/` — no backend, DB, or server code | ✅ PASS |
| II. Server State Discipline | US4 migrates all manual `useEffect` fetches to React Query. All mutations invalidate cache keys via `queryClient.invalidateQueries` | ✅ PASS |
| III. Global State Minimalism | No new Zustand stores needed — all state is local `useState`, React Query, or URL params | ✅ PASS |
| IV. TypeScript Strict Mode | US3 eliminates all `any` types. Uses `import type` for type-only imports. No enums or namespaces | ✅ PASS |
| V. Component Naming Convention | Dead components removed. Remaining components follow suffix→location mapping. Named exports only | ✅ PASS |

**Gate result**: PASS — No violations. This spec *enforces* constitution compliance.

## Project Structure

### Documentation (this feature)

```text
specs/010-groups-page-audit/
├── plan.md              # This file
├── research.md          # Phase 0 — resolves unknowns
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — developer setup
├── contracts/           # Phase 1 — component API contracts
└── tasks.md             # Phase 2 — (/speckit.tasks command)
```

### Source Code (modified files)

```text
src/
├── pages/
│   ├── GroupsPage.tsx           # MODIFIED: fix any types, inline functions
│   └── GroupDetailPage.tsx      # MODIFIED: fix window.location.href, useEffect toast
├── components/groups/
│   ├── GroupsTable.tsx          # REMOVED (dead code)
│   ├── RosterTab.tsx            # REMOVED (dead code)
│   ├── RosterPlaceholder.tsx    # REMOVED (dead code)
│   ├── HistoryPlaceholder.tsx   # REMOVED (dead code)
│   ├── ProgressSection.tsx      # REMOVED (dead code)
│   ├── AddSessionModal.tsx      # REMOVED (dead code)
│   ├── SessionsList.tsx         # REMOVED (dead code)
│   ├── GroupHeader.tsx          # MODIFIED: remove unused groupId prop
│   ├── GroupForm.tsx            # MODIFIED: fix any types, console.*, extract employee fetch
│   ├── StudentsTab.tsx          # MODIFIED: fix confirm(), stub actions, console.*, export default
│   ├── AttendanceTab.tsx        # MODIFIED: fix hardcoded gender/group_id, console.*, export default
│   ├── LevelsTab.tsx            # MODIFIED: fix unused _groupId, console.*, export default
│   ├── PaymentsTab.tsx          # MODIFIED: fix export default, console.*
│   ├── TabNavigation.tsx        # MODIFIED: remove unused enrollmentCount prop, add ARIA
│   ├── GroupBySelector.tsx      # MODIFIED: add aria-pressed attributes
│   ├── ViewToggle.tsx           # MODIFIED: add aria-pressed attributes
│   ├── GroupCategoryTabs.tsx    # MODIFIED: add aria-selected attributes
│   ├── GroupColumns.tsx         # MODIFIED: fix time format consistency
│   ├── GroupsHeader.tsx         # MODIFIED: add aria-label to search input
│   ├── GroupCard.tsx            # MODIFIED: fix time format consistency
│   ├── detail/
│   │   ├── GroupInfoCard.tsx    # MODIFIED: fix bitwise OR, debounce notes
│   │   ├── EditGroupDialog.tsx  # MODIFIED: fix time format, share employee fetch, console.*
│   │   ├── GroupPricingCard.tsx # REMOVED (dead code)
│   │   ├── LevelSelector.tsx    # MODIFIED: add aria-pressed
│   │   └── index.ts             # MODIFIED: remove GroupPricingCard export
│   ├── history/
│   │   ├── CoursesHistoryTable.tsx  # MODIFIED: fix array index key, export default
│   │   ├── EnrollmentHistoryTable.tsx # MODIFIED: fix import order, export default
│   │   ├── InstructorHistoryTable.tsx # MODIFIED: export default
│   │   ├── HistoryStats.tsx     # MODIFIED: export default
│   │   └── index.ts             # MODIFIED: re-export cleanup
│   └── shared/
│       ├── GroupStatusBadge.tsx # MODIFIED: ensure all status values handled
│       ├── LevelBadge.tsx       # No changes needed
│       └── index.ts             # No changes needed
├── hooks/
│   ├── useGroups.ts             # MODIFIED: remove deprecated setGroups, fix handleSort type
│   ├── useGroupQueries.ts       # MODIFIED: fix any types
│   ├── useGroupDetail.ts        # MODIFIED: migrate to React Query
│   ├── useGroupPayments.ts      # MODIFIED: migrate to React Query
│   ├── useGroupEnrollments.ts   # MODIFIED: migrate to React Query
│   ├── useGroupCompetitions.ts  # MODIFIED: migrate to React Query, fix N+1
│   ├── useGroupLevels.ts        # REMOVED (dead code)
│   ├── useRecentGroups.ts       # REMOVED (dead code)
│   ├── useStudentsGrouped.ts    # REMOVED (dead code)
│   ├── useGroupAttendance.ts    # MODIFIED: fix inline query key, console.*
│   ├── useGroupMutations.ts     # MODIFIED: fix any types
│   └── queryKeys.ts             # MODIFIED: add group-specific nested keys
├── api/academics/
│   └── groups/
│       └── utils.ts             # MODIFIED: fix N+1 pattern
└── tests/
    ├── GroupsTable.test.tsx     # MODIFIED: fix mock data, migrate to DataTable pattern
    └── useGroups.test.ts        # MODIFIED: fix mock data
```

### New files

```text
src/
└── hooks/
    └── useDebounce.ts           # NEW: reusable debounce hook for notes field
```

**Structure Decision**: Frontend-only SPA. All changes are modifications or removals of existing files under `src/`. One new utility hook (`useDebounce`) added. No backend changes.

## Complexity Tracking

> **No constitution violations to justify.** This spec enforces compliance.

## Phase 0 — Research Plan

### Unknown 1: Batch competitions endpoint
**Decision**: No batch endpoint exists on the backend. The N+1 fix uses `Promise.all` to fire all `getGroupCompetitions` requests in parallel rather than sequentially. This reduces wall-clock time from N × latency to 1 × latency.

**Rationale**: Backend is external (FastAPI). Adding a batch endpoint would require backend changes (out of scope). Parallel requests with `Promise.all` is the best frontend-only approach.

**Alternatives considered**: 
- Sequential requests (current — slowest)
- Request a single "all groups with competitions" endpoint (doesn't exist)
- Cache individual competition results and deduplicate (adds complexity for marginal gain)

### Unknown 2: Debounce implementation for notes field
**Decision**: Create a lightweight `useDebounce` custom hook (10 lines) in `src/hooks/useDebounce.ts`. No external dependency needed.

**Rationale**: Adding `lodash.debounce` or similar adds ~4KB to bundle for a single use case. A custom hook is trivial and follows the project's minimal-dependency philosophy.

**Alternatives considered**:
- `lodash/debounce` — adds dependency
- `setTimeout` inline in `GroupInfoCard` — harder to test and reuse
- CSS `:focus` + `onBlur` only — loses real-time save behavior

### Unknown 3: React Query migration scope for manual hooks
**Decision**: Migrate all 5 manual hooks (`useGroupDetail`, `useGroupPayments`, `useGroupEnrollments`, `useGroupCompetitions`, `useGroupLevels`) to React Query. `useGroupLevels` is dead code and will be removed instead.

**Rationale**: Constitution Principle II mandates React Query for all server state. Manual `useEffect` fetches bypass caching, deduplication, and invalidation. The migration is straightforward — wrap existing API calls in `useQuery`.

**Alternatives considered**:
- Leave manual hooks as-is (violates constitution)
- Migrate only the most-used hooks (inconsistent pattern)

### Unknown 4: Test updates for removed `GroupsTable.tsx`
**Decision**: Migrate existing tests in `GroupsTable.test.tsx` to test the `DataTable` + `groupColumns` pattern instead. Fix mock data to use correct `status` field instead of `is_active`.

**Rationale**: `GroupsTable.tsx` is dead code — `GroupsPage` uses `DataTable` with `groupColumns`. Tests should cover the actual implementation. Mock data fix aligns with the `EnrichedGroupPublic` type.

**Alternatives considered**:
- Keep `GroupsTable.tsx` and its tests (keeps dead code)
- Delete tests entirely (loses coverage)

## Phase 1 — Design Deliverables

- [data-model.md](./data-model.md): Entity definitions for audit scope — Group, GroupStatus, ScheduleTime, and the types that need correction
- [contracts/](./contracts/): Interface contracts for modified components and hooks
- [quickstart.md](./quickstart.md): Setup and verification instructions for developers
