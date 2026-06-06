# Groups Feature — Research

## DTO Mismatch in `useUpdateGroup`

**Decision**: Fix `useGroupQueries.ts:useUpdateGroup` to accept and pass `UpdateGroupDTO` instead of `ScheduleGroupInput`.

**Rationale**: The `PATCH /academics/groups/{group_id}` endpoint expects flat fields (`max_capacity`, `default_day`, `default_time_start`, `default_time_end`), not the nested ScheduleGroupInput shape (`capacity`, `schedule: { day, time_start, time_end }`). Currently `useGroupQueries.ts:87` passes `ScheduleGroupInput` to `updateGroup()` which declares `UpdateGroupDTO` — TypeScript allows this via excess-property laxity since both are just objects, but the API receives wrong field names, causing capacity and schedule edits to silently fail.

**Alternatives considered**:
- Keep `ScheduleGroupInput` and transform before sending — unnecessary indirection; callers should pass the correct DTO directly.

## Dead Code Verification

**Decision**: Delete 4 files — `LevelStudentsPanel.tsx`, `TransferDialog.tsx`, `TabNavigation.tsx`, `useGroupEnrollments.ts`.

**Rationale**:
- `LevelStudentsPanel.tsx`: Zero imports across `src/` (verified via `rg "LevelStudentsPanel" src/`). Not in any barrel file.
- `TransferDialog.tsx`: Only imported by dead `LevelStudentsPanel`. The `transferEnrollment` API function it wraps remains in use by `DropEnrollmentPanel` in the attendance feature.
- `TabNavigation.tsx`: Zero imports. `GroupDetailPage` uses inline tab switching via `MetricsStripCards`.
- `useGroupEnrollments.ts`: Only imported by dead `LevelStudentsPanel`. The underlying API functions (`getGroupEnrollmentsAll`) remain in use by `useGroupHistory`.

**Alternatives considered**: Keep dead code for "future use" — rejected to adhere to codebase's standard practice.

## Duplicate Mutation Hooks

**Decision**: Consolidate by deleting `useGroupQueries.ts`'s local `useUpdateGroup`/`useDeleteGroup`/`useCreateGroup` mutation hooks and delegating to `useGroupMutations.ts`.

**Rationale**: `useGroupQueries.ts` defines standalone mutations (`useUpdateGroup`, `useDeleteGroup`, `useCreateGroup`) with different invalidation scope (only root `groupKeys.all`) than `useGroupMutations.ts` (inflight + group-level + levels + sessions). Two sources of truth create maintenance risk. Single canonical implementation in `useGroupMutations.ts` with an option to skip binding by groupId for the list page.

**Alternatives considered**:
- Keep both and align invalidation — doesn't address duplication risk.
- Move `useGroupMutations` into `useGroupQueries.ts` — would create a circular split issue.

## Silently Swallowed Errors in `useGroupDetail.ts`

**Decision**: Surface errors from levels and sessions queries in addition to the group query.

**Rationale**: Lines 43-55 only destructure `error` from the group query; levels and sessions errors are silently dropped. Users may see empty levels/sessions without knowing the request failed.

**Alternatives considered**: Per-query error toasts — adds noise; aggregated error in the hook return is cleaner.

## Missing `'archived'` in `Group.status` Type

**Decision**: Add `'archived'` to the union type `Group.status` and `EnrichedGroupPublic.status` in `models.ts`.

**Rationale**: The `archiveGroup` endpoint exists, `getArchivedGroups` API function exists, `GroupStatusBadge` renders an archived variant, and the filter UI includes an archived status option — but the type definitions only allow `'active' | 'inactive' | 'completed'`.

## Accessibility Issues

**Decision**: All findings from Phase 5 audit are valid and should be fixed per standard a11y patterns.

**Rationale**: Filter-based approach, standard patterns.
