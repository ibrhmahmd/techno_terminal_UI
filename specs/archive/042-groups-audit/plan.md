# Implementation Plan: Groups Audit & Fix

**Branch**: `042-groups-audit` | **Date**: 2026-06-06 | **Spec**: specs/042-groups-audit/spec.md
**Input**: Feature specification from `/specs/042-groups-audit/spec.md`

## Summary

Audit and fix the groups feature across 5 categories: runtime bugs (DTO mismatch in `useUpdateGroup`, missing `'archived'` status type), dead code (4 files to delete), TypeScript violations (3 missing return types, non-null assertion, shadowed `formatDate`), data fetching anti-patterns (duplicate mutation hooks, missing `enabled` guard), and accessibility gaps (missing `aria-hidden`, `role="status"`). All changes are frontend-only.

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

### Key Technical Details

1. **DTO Mismatch** — `useGroupQueries.ts:useUpdateGroup` passes `ScheduleGroupInput` (with `capacity`, `schedule` nested object) to `updateGroup()` which expects flat `UpdateGroupDTO` (with `max_capacity`, `default_day`/`default_time_start`/`default_time_end`). Caller is `GroupsPage.tsx:handleUpdateGroup`. Bug: capacity and schedule edits silently fail.

2. **Duplicate Mutations** — `useGroupQueries.ts` defines standalone `useCreateGroup`/`useUpdateGroup`/`useDeleteGroup` with different invalidation (root key only). `useGroupMutations.ts` defines the same mutations bound by groupId with full invalidation (group + levels + sessions + enrollments + payments). Two sources of truth.

3. **Silent Error Swallowing** — `useGroupDetail.ts` only destructures `error` from the group query (line 36-41). Levels (line 43) and sessions (line 50) queries do not capture their `error` property. Line 62: `const error = groupError instanceof Error ? groupError.message : null`.

4. **Missing `'archived'` in types** — `models.ts:27` defines `Group.status` as `'active' | 'inactive' | 'completed'` but `archiveGroup` endpoint, `getArchivedGroups`, `GroupStatusBadge`, and filter UI all support `'archived'`.

5. **Dead code** — `LevelStudentsPanel`, `TransferDialog`, `TabNavigation`, `useGroupEnrollments` all have zero consumers.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/` only |
| II. Server State Discipline | ✅ PASS | All data flows through React Query; mutations invalidate caches |
| III. Global State Minimalism | ✅ PASS | No Zustand changes needed |
| IV. TypeScript Strict Mode | ✅ PASS | Changes will respect `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly` |
| V. Component Naming Convention | ✅ PASS | Deleting non-conforming dead code; remaining components follow convention |
| Cache Keys | ✅ PASS | All query keys use centralized factory from `queryKeys.ts` |
| Build Gates (lint, build) | ✅ PASS | Post-fix verification |

**Re-check after Phase 1 design**: ✅ All gates still pass.

## Project Structure

### Documentation (this feature)

```text
specs/042-groups-audit/
├── plan.md              # This file — implementation plan
├── spec.md              # Feature specification (5 user stories)
├── research.md          # Phase 0 — resolved unknowns
├── data-model.md        # Phase 1 — entity definitions, state transitions
├── quickstart.md        # Phase 1 — implementation order and key decisions
├── contracts/
│   └── README.md        # Changed/deleted interfaces
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code

```text
src/
├── api/academics/
│   └── types/groups/models.ts          # ← add 'archived' to Group.status
├── components/groups/
│   ├── GroupCardGrid.tsx                # ← role="status" on empty state
│   ├── GroupColumns.tsx                 # ← aria-hidden on status dot
│   ├── LevelsTab.tsx                    # ← remove shadowed formatDate
│   ├── detail/
│   │   ├── LevelSelector.tsx            # ← aria-hidden on icon
│   │   ├── LevelStudentsPanel.tsx       # ← DELETE
│   │   ├── TransferDialog.tsx           # ← DELETE
│   │   └── EditGroupDialog.tsx          # ← fix type assertion
│   └── TabNavigation.tsx                # ← DELETE
├── hooks/
│   ├── useGroupQueries.ts              # ← remove useUpdateGroup/useDeleteGroup/useCreateGroup
│   ├── useGroupMutations.ts            # ← remove invalidateGroupsExtended
│   ├── useGroupDetail.ts               # ← surface levels/sessions errors
│   ├── useGroups.ts                    # ← replace groupBy! with proper narrowing
│   ├── useGroupHistory.ts              # ← add return type
│   ├── useGroupAttendance.ts           # ← add return type, fix cache key sentinel
│   ├── useRecentGroups.ts              # ← add return type
│   ├── useProgressLevelForm.ts         # ← add enabled guard
│   └── useGroupEnrollments.ts          # ← DELETE
├── pages/
│   └── GroupsPage.tsx                   # ← role="status" on empty state, import from useGroupMutations
└── HistoryTab.tsx                       # ← aria-hidden on icon
```

## Complexity Tracking

No constitution violations. All changes are straightforward refactors within established patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
