# Groups Feature — Audit & Fix

## Description

Audit and fix of the groups feature across 5 categories (runtime bugs, dead code, TypeScript violations, data fetching anti-patterns, accessibility gaps) resulting in 20+ findings across ~35 files.

## User Stories

### US-01: Fix Runtime Bugs
- **US-01-T1**: Fix `useUpdateGroup` DTO mismatch — passes `ScheduleGroupInput` to `updateGroup()` which expects `UpdateGroupDTO`; fields like `capacity`→`max_capacity` and `schedule`→`default_day`/`default_time_start`/`default_time_end` don't match, causing edits to silently fail to update capacity and schedule.
- **US-01-T2**: Add `'archived'` to `Group.status` union type — it is supported by `archiveGroup` endpoint, `GroupStatusBadge`, and filter UI but missing from the type definition.

### US-02: Remove Dead Code
- **US-02-T1**: Delete `LevelStudentsPanel.tsx` — never imported anywhere.
- **US-02-T2**: Delete `TransferDialog.tsx` — only imported by dead `LevelStudentsPanel`; keep `transferEnrollment` API function (used by `DropEnrollmentPanel`).
- **US-02-T3**: Delete `TabNavigation.tsx` — never imported; `GroupDetailPage` uses inline tab logic.
- **US-02-T4**: Delete `useGroupEnrollments.ts` — only imported by dead `LevelStudentsPanel`.
- **US-02-T5**: Remove dead `invalidateGroupsExtended` in `useGroupMutations.ts`.

### US-03: Fix TypeScript & Code Quality
- **US-03-T1**: Remove shadowed local `formatDate` in `LevelsTab.tsx` — use imported `formatDate` from `src/utils/formatting.ts` with null handling.
- **US-03-T2**: Surface errors from all 3 queries in `useGroupDetail.ts` (group, levels, sessions) — currently only `groupError` is returned.
- **US-03-T3**: Add explicit return type annotation to `useGroupHistory`.
- **US-03-T4**: Add explicit return type annotation to `useRecentGroups`.
- **US-03-T5**: Add explicit return type annotation to `useGroupAttendance`.
- **US-03-T6**: Replace non-null assertion `groupBy!` in `useGroups.ts` with proper type narrowing.
- **US-03-T7**: Fix type assertion in `EditGroupDialog.tsx` — include `'archived'` in the union.

### US-04: Fix Data Fetching & Cache Patterns
- **US-04-T1**: Consolidate duplicate mutation logic in `useGroupMutations.ts` and `useGroupQueries.ts` — single canonical `useUpdateGroup` / `useDeleteGroup`.
- **US-04-T2**: Add `enabled` guard to courses/employees queries in `useProgressLevelForm.ts`.
- **US-04-T3**: Use distinct sentinel (e.g., `-1`) for `levelNumber` fallback in `useGroupAttendance.ts` to avoid cache collision at level 0.

### US-05: Fix Accessibility & UX Polish
- **US-05-T1**: Add `aria-hidden="true"` to decorative Material Symbols in `LevelSelector.tsx` (add), `HistoryTab.tsx` (school), `GroupColumns.tsx` (status dot).
- **US-05-T2**: Add `role="status"` to empty states in `GroupCardGrid.tsx`, `GroupsPage.tsx`.
- *Note: `LevelStudentsPanel.tsx` a11y issues are moot — component is deleted in US-02-T1.*

## Scope

All changes are frontend-only. Backend/API changes are out of scope.

## Files Affected

| Category | Files |
|----------|-------|
| Delete | `LevelStudentsPanel.tsx`, `TransferDialog.tsx`, `TabNavigation.tsx`, `useGroupEnrollments.ts` |
| Modify | `useGroupQueries.ts`, `useGroupMutations.ts`, `useGroupDetail.ts`, `useGroups.ts`, `useGroupHistory.ts`, `useGroupAttendance.ts`, `useRecentGroups.ts`, `useProgressLevelForm.ts`, `LevelsTab.tsx`, `EditGroupDialog.tsx`, `GroupCardGrid.tsx`, `GroupColumns.tsx`, `LevelSelector.tsx`, `HistoryTab.tsx`, `GroupsPage.tsx` |
| Types | `src/api/academics/types/groups/models.ts` |

## Verification

```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero errors (feature-related)
```
