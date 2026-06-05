# Implementation Plan: Fix Directory Audit

**Branch**: `main` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/039-fix-directory-audit/spec.md`

## Summary

Fix 40 issues found in the directory feature audit across 5 categories: runtime bugs (6), dead code (9 functions + 8 re-exports), TypeScript quality (6), data fetching anti-patterns (5), and accessibility gaps (6). All changes are frontend-only within `src/pages/DirectoryPage.tsx`, `src/components/directory/`, `src/hooks/useDirectory.ts`, `src/hooks/directory/`, and `src/api/crm/`.

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
| I. Frontend-Only Scope | ✅ Pass | All changes in `src/`. No backend. |
| II. Server State Discipline | ✅ Pass | Fixing query key factory usage and cache invalidation — aligns with discipline. |
| III. Global State Minimalism | ✅ Pass | No Zustand changes. |
| IV. TypeScript Strict Mode | ✅ Pass | Removing `any` casts and unsafe assertions — improves strict mode compliance. |
| V. Component Naming Convention | ✅ Pass | No new components. Dead props removed. |
| Cache & API Discipline | ✅ Pass | Migrating inline keys to factory. Narrowing invalidation scope. |
| Build Gates | ✅ Pass | All changes pass `tsc -b && vite build` and `npm run lint`. |

**Verdict**: All gates pass. No complexity exceptions needed.

## Project Structure

### Documentation (this feature)

```
specs/039-fix-directory-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
```

### Source Code

All changes within existing files — no new files needed.

## Complexity Tracking

No constitution violations — complexity tracking is not needed.

## Phase 0: Research

### Unknowns & Resolutions

| Unknown | Resolution |
|---------|------------|
| Should `staleTime` values be aligned to 5min project convention? | No — the 2-3min values are intentional for interactive search/filter UX. Document the deviation in conventions if needed. |
| Does the `waitingStudents` total from current page need an API change? | No — the display should use the total from the backend response, not derive from current page data. The `studentsListQuery.data?.total` already reflects the full backend count. |
| Do removed dead functions have any test consumers? | No — `rg "getStudentStatusSummary|getStudentsByStatus|linkSibling|unlinkSibling|formatStudentDisplay|hasOutstandingBalance|getBalanceDisplay|getStatusColorClass|getCompetitionHistory" src/tests/` returns zero hits. |

### Consolidation

All 40 audit findings are well-defined and actionable. No additional research is needed — the audit already identified each issue, its location, and the fix.

**Decision**: Proceed directly to Phase 1 with the fixes as described in the spec.

## Phase 1: Design & Contracts

### Data Model

No new entities or data model changes. The following entity types are already defined and remain unchanged:

- `StudentListItem`, `StudentFilterItem` (from `src/api/crm/students/types/`)
- `ParentListItem` (from `src/api/crm/`)
- `StudentStatus` (`'active' | 'waiting' | 'inactive'`)
- `FilterState` (from `src/hooks/directory/useAdvancedSearch.ts`)
- `GroupItem<T>` (from `src/hooks/directory/useDirectoryData.ts`)

**Changes**:
- `StudentCard.tsx`: `Record<string, ...>` → `Record<StudentStatus, ...>` for `statusConfig`
- `ParentCard.tsx`: Remove unused `onEdit`/`onDelete` props from `ParentCardActions` interface

### Contracts

No external interface changes. Fixes are internal to existing module boundaries. The API layer (`src/api/crm/`) will lose 9 unused exports and 8 barrel re-exports, but no contract signatures change.

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Remove dead API functions entirely | Confirmed zero consumers. Removing reduces bundle size and maintenance surface. |
| Use `isAxiosError` from axios package | Type-safe alternative to inline `as { response?: ... }` casts. Ships with axios. |
| Add query factory keys for course list | New key `courses.listSimple` to be added to `queryKeys.ts` |
| Keep `staleTime` at 2-3min | Search/filter hooks benefit from fresher data. List hooks could align to 5min but deviation is intentional for interactive UX. |
| Invalidate `['students', 'grouped']` instead of `['students']` | Avoids blowing away individual student detail caches (e.g., `students/42/details`). |

### Quickstart

```bash
# Verify current state
npm run build && npm run lint

# Implementation order (independent sets can be parallelized):
# Set A — Dead code removal (safe, no behavior change)
#   1. Remove 9 unused functions from src/api/crm/students/
#   2. Remove 8 dead re-exports from src/api/crm/students/index.ts
#   3. Remove dead ParentCard actions

# Set B — TypeScript fixes
#   4. Fix StudentCard.tsx statusConfig type
#   5. Replace inline axios cast with isAxiosError
#   6. Remove redundant type assertions

# Set C — Data fetching fixes
#   7. Add tab guards to useStudentsSearch/useParentsSearch
#   8. Migrate inline query keys to factory
#   9. Narrow invalidation in useDirectory.ts

# Set D — Bug fixes
#   10. Fix totalStudents pagination math
#   11. Fix handleEditStudent catch block
#   12. Fix handleCreateParent error handling
#   13. Fix cache invalidation order in edit flow
#   14. Remove redundant double-filter

# Set E — Accessibility
#   15. Add keyboard nav to StudentCard + ParentCard
#   16. Add aria-label to tablists
#   17. Add role="alert" to error state
#   18. Add aria-hidden to skeletons and icons

# Verify after all changes
npm run build && npm run lint
```
