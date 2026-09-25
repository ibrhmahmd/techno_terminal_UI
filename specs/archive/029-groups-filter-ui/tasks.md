# Tasks: Groups UI Filter Feature

**Branch**: `029-groups-filter-ui` | **Date**: 2026-06-03 | **Plan**: [specs/029-groups-filter-ui/plan.md](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/specs/029-groups-filter-ui/plan.md)
**Input**: Implementation plan from `/specs/029-groups-filter-ui/plan.md`

## Phase 1: Setup
*(No setup required for this feature, project structure is already in place).*

## Phase 2: Foundational
*Goal: Ensure the API client and React Query hooks can process and transmit the new filter parameters to the backend.*

- [x] T001 Update `GroupFilterOptions` and Axios request (`qs.stringify`) in `src/api/academics/groups/core.ts`
- [x] T002 Update `useGroupsFlat` in `src/hooks/useGroupQueries.ts` to accept filters and include them in query keys
- [x] T003 Update `useGroups` in `src/hooks/useGroups.ts` to add filter state and remove frontend pagination/filtering

## Phase 3: [US1] Complex Multi-Filter Search
*Goal: Users can apply multiple filters using a new Filter Drawer UI.*
*Independent test criteria: Selecting a course and instructor triggers an API call with `course_ids` and `instructor_id` repeated query parameters.*

- [x] T004 [P] [US1] Create `GroupFilters.tsx` component in `src/components/groups/GroupFilters.tsx`
- [x] T005 [US1] Integrate `GroupFilters.tsx` and a Filter button into `src/components/groups/GroupsHeader.tsx`
- [x] T006 [US1] Consolidate `GroupBySelector` and ViewToggle into a unified toolbar in `src/pages/GroupsPage.tsx`
- [x] T007 [US1] Connect `GroupFilters.tsx` to the `useGroups` filter state in `src/pages/GroupsPage.tsx`

## Phase 4: [US2] Removing a Filter via Chip
*Goal: Users can see active filters via chips and remove them easily.*
*Independent test criteria: Filter chips appear when a filter is applied; clicking 'x' removes the filter and triggers a data refetch.*

- [x] T008 [P] [US2] Create `FilterChips.tsx` component in `src/components/groups/FilterChips.tsx`
- [x] T009 [US2] Integrate `FilterChips.tsx` into `src/pages/GroupsPage.tsx`

## Phase 5: [US3] Viewing Archived Groups
*Goal: Unify Active, Inactive, and Archived groups under a single "Status" filter, eliminating fragmented views.*
*Independent test criteria: Changing the status filter to 'Archived' displays past groups without using the legacy "Completed" view.*

- [x] T010 [US3] Remove all `activeView === 'completed'` conditional blocks and toggles from `src/pages/GroupsPage.tsx`
- [x] T011 [US3] Delete the `useArchivedGroups` and `useSearchGroups` hooks from `src/hooks/useGroupQueries.ts`

## Phase 6: Polish & Cross-Cutting Concerns
*Goal: Ensure edge cases like Grouped Views and Empty States are handled gracefully.*

- [x] T012 Disable the Filter button and hide Filter Chips in `src/pages/GroupsPage.tsx` when `GroupBySelector` is active
- [x] T013 Add a "Clear all filters" CTA to the empty state in `src/pages/GroupsPage.tsx`

---

## Execution Constraints

- **Execution Order**: Foundational Tasks (T001-T003) MUST be completed before any UI integration.
- **Dependencies**: 
  - [US1] depends on Foundational.
  - [US2] depends on [US1].
  - [US3] depends on Foundational.

## Parallel Execution Examples

- `T004` (GroupFilters UI) and `T008` (FilterChips UI) can be built in parallel with API/Hook modifications `T001-T003`, as they are purely UI components.

## Implementation Strategy
Start with the API Client and React Query hooks (T001-T003) to establish the server-side filtering pipeline. Then build the basic Filter UI ([US1]). Once that MVP is functioning, add the Filter Chips ([US2]) and rip out the legacy Active/Completed logic ([US3]). Finish by polishing empty states and view toggles.
