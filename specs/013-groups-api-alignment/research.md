# Research: Groups API Alignment

## Decision: Status field mapping — `archived` → `completed`

**Rationale**: The new backend API contract uses `completed` for archived groups and `inactive` for deactivated groups. The frontend currently uses `'archived'` as a distinct status value. Aligning the frontend type union to `['active', 'inactive', 'completed']` eliminates runtime mismatches and ensures type-level correctness.

**Alternatives considered**:
- Keep both `'archived'` and `'completed'` for backward compatibility — rejected because the backend never returns `'archived'`, making it dead code
- Map `'archived'` → `'completed'` on the client — rejected because it adds unnecessary transformation overhead and obscures the real API contract

## Decision: Competition data removal from GroupDetailPage

**Rationale**: The backend removed all competition-related group endpoints. The frontend's `useGroupCompetitions` hook will produce 404 errors. Removing the hook usage, competition props from `HistoryTab`, and the competition API functions eliminates runtime errors and dead code.

**Alternatives considered**:
- Replace with a link to the competitions module — rejected as out of scope for this alignment task; can be added later as a separate feature
- Show a placeholder message — rejected because it still renders dead UI chrome

## Decision: Schedule field transformation at API boundary

**Rationale**: The new API uses a nested `schedule` object `{ day, start_time, end_time }` while the existing form UI uses flat fields (`default_day`, `default_time_start`, `default_time_end`). Keeping flat fields in the form (better UX for date/time pickers) and transforming at the API boundary minimizes UI changes while maintaining API compliance.

**Alternatives considered**:
- Change form UI to use nested object directly — rejected because it would require rewriting form state management and date/time picker integration
- Use nested types but flatten in form via wrappers — equivalent complexity to the chosen approach, but the chosen approach is simpler to reason about

## Decision: Server-side search with client-side fallback

**Rationale**: The new API provides `GET /academics/groups/search?query=&status=` for server-side search. Replacing client-side filtering with server-side search when the user enters a query improves performance at scale. Keeping client-side filtering as a fallback when the query is empty preserves the existing behavior for browsing.

**Alternatives considered**:
- Keep client-side search entirely — rejected because it doesn't leverage the new API capability and performs poorly at scale
- Use server-side search exclusively — rejected because it would change the behavior of the default list view unnecessarily

## Decision: "Completed" tab within existing Groups page

**Rationale**: Adding a "Completed" tab toggle within the existing Groups page provides access to `GET /academics/groups/archived` without adding new routes or sidebar navigation items. This keeps the navigation structure simple and consistent with the current tab-based layout pattern.

**Alternatives considered**:
- Separate `/groups/archived` route — rejected because it adds navigation complexity for a secondary view
- Sidebar navigation item — rejected because it clutters the sidebar with a sub-page of groups

## Best Practices: React Query cache invalidation for new endpoints

**Pattern**: Each new endpoint gets its own query key via the `queryKeys` factory. Mutations that affect groups (create, update, archive, delete) invalidate all group-related caches:
- `queryKeys.groups` (list)
- `queryKeys.groupsArchived` (completed list)
- `queryKeys.group(id)` (individual group)
- `queryKeys.groupEnriched` (enriched list)

This follows the existing pattern in `useGroupQueries.ts` where group creation also invalidates dashboard caches.

## Best Practices: TypeScript type migration strategy

**Approach**: Update types in a single pass rather than incrementally:
1. Update base types in `types/groups/models.ts` and `types/groups/inputs.ts`
2. Update API functions in `groups/core.ts` to use new types
3. Update hooks to use new API function signatures
4. Update components to use new hook return types
5. Run `tsc -b` to catch all type errors at once

This avoids the "half-migrated" state where some components use old types and some use new types.
