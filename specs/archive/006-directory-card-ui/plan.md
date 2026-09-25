# Implementation Plan: Directory Card UI & Pagination Fix

**Branch**: `006-directory-card-ui` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-directory-card-ui/spec.md`

## Summary

Replace the DataTable-based directory views (Students, Parents, Waiting, Advanced) with a responsive card grid layout, and fix the pagination bug where controls fail to render despite having 80+ students. Student cards display name, phone, status, age, and current enrollment. Parent cards display name and phone. All existing features (search, alphabet filter, group-by, CRUD actions) must work identically.

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
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.

**Research complete** — See [research.md](./research.md) for full findings.

1. **Pagination bug root cause**: API may return `total: 0` despite having items. Fix: client-side fallback + `showTotalInfo=true`.
2. **Age/DOB**: `date_of_birth` is in `StudentListItem`. Compute age client-side. No backend change needed.
3. **Current enrollment**: Not in `StudentListItem`. Shown only on Advanced Filter tab (where `StudentFilterItem` has `current_group_name`). Omitted from Students tab.
4. **Parent card fields**: `full_name` + `phone_primary` sufficient for card summary. Detail via parent profile page.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Frontend-Only Scope | All changes in `src/` — no backend, DB, or server code | ✅ PASS |
| II. Server State Discipline | React Query already used for all directory data. Card layout is purely a presentation change. Data fetching stays via Query hooks | ✅ PASS |
| III. Global State Minimalism | No new Zustand stores needed — all state is local (`useState`) or React Query | ✅ PASS |
| IV. TypeScript Strict Mode | New components will use `import type`, avoid `any` and `enum`, follow `verbatimModuleSyntax` | ✅ PASS |
| V. Component Naming Convention | New files: `*Card.tsx` → `components/directory/`, `*Grid.tsx` → `components/directory/` | ✅ PASS |

**Gate result**: PASS — No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/006-directory-card-ui/
├── plan.md              # This file
├── research.md          # Phase 0 — resolves unknowns
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — developer setup
├── contracts/           # Phase 1 — component API contracts
└── tasks.md             # Phase 2 — (/speckit.tasks command)
```

### Source Code (new/changed files)

```text
src/
├── api/
│   └── crm/
│       └── students/
│           └── types/
│               └── models.ts      # Possibly extend StudentListItem with age/enrollment fields
├── components/
│   ├── common/
│   │   └── Pagination.tsx          # FIX: Add showTotalInfo=true by default or fix rendering bug
│   └── directory/
│       ├── StudentCard.tsx         # NEW: Card component for students
│       ├── ParentCard.tsx          # NEW: Card component for parents
│       ├── CardGrid.tsx            # NEW: Responsive grid container for cards
│       └── DirectoryColumns.tsx    # REMOVED: No longer needed (no table columns for directory)
└── pages/
    └── DirectoryPage.tsx           # MODIFIED: Replace DataTable with CardGrid + Cards
```

## Complexity Tracking

> **Skip**: Constitution check passed with no violations.

## Phase 0 — Research Plan

### Unknown 1: Pagination bug root cause
- **Investigate**: Trace `totalStudents` from API response → `useStudentsList` → `createPaginationResult` → `useDirectoryData` → `DirectoryPage` → `<Pagination>` component
- **Possible causes**: API returns `total: 0` despite having items; `showTotalInfo=false` hides the "Page X of Y" text; the buttons themselves are too subtle; `searchTerm` inadvertently hiding pagination
- **Fix options**: Debug API response; ensure `showTotalInfo=true`; add total record count text

### Unknown 2: Age/DOB data availability
- **Check**: `StudentListItem` includes `date_of_birth` — verify if the list API populates it
- **Fallback**: If `date_of_birth` is only in detail endpoint, compute age from DOB; if not in list at all, may need to fetch student details or extend the list API

### Unknown 3: Current enrollment on cards
- **Check**: `StudentListItem` has no enrollment field. `StudentFilterItem` has `current_group_name`. Two approaches:
  1. Use the filter endpoint (`/crm/students/filter`) to get enrollment data
  2. Fetch `StudentWithDetails` for the visible page of students (N+1 problem)
  3. Suggest backend add enrollment info to the list endpoint

### Unknown 4: Parent card fields
- **Check**: Current `ParentListItem` has only id, full_name, phone_primary. Parent cards may need additional fields (email, relation) from the detail endpoint.

## Phase 1 — Design Deliverables

- `data-model.md`: Entity definitions for StudentCard, ParentCard, CardGrid, DirectoryPagination
- `contracts/`: Component props contracts for each new component
- `quickstart.md`: Setup instructions for developers
