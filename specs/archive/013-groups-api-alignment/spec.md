# Feature Specification: Groups API Alignment

**Feature Branch**: `012-competitions-api-alignment`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "focus on the academics/groups API implementation index it and build your context around it getting ready to update it and align it with the new groups API documentation at groups-api.md"

## Clarifications

### Session 2026-05-18

- Q: Status field mapping — `archived` vs `completed`? → A: Replace `'archived'` with `'completed'` everywhere in frontend types and UI to match new API contract.
- Q: Competition data in GroupDetailPage — removal strategy? → A: Remove competition data loading and UI from GroupDetailPage entirely.
- Q: Schedule field transformation — form UI vs API shape? → A: Keep flat form fields in UI; transform to/from nested `schedule` object at API boundary.
- Q: Search endpoint — replace or augment existing client-side search? → A: Replace client-side search with server-side; use API when query has content.
- Q: Archived groups view — placement in the UI? → A: Add a "Completed" tab/filter toggle within the existing Groups page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and manage groups with updated API contracts (Priority: P1)

Administrators and staff interact with the Groups page, group detail views, and group creation/editing forms. The frontend must correctly send and receive data matching the new API response shapes — particularly the `schedule` nested object format and renamed fields like `name`/`capacity`.

**Why this priority**: Core functionality — if the frontend sends/receives wrong field shapes, group CRUD operations will fail or display incorrect data.

**Independent Test**: Can create, list, update, and view a group end-to-end with correct data display and no API errors.

**Acceptance Scenarios**:

1. **Given** a user opens the Groups page, **When** groups are fetched, **Then** the response fields (`name`, `capacity`, `schedule.day`, `schedule.start_time`, etc.) map correctly to the UI
2. **Given** a user creates a new group, **When** the form is submitted, **Then** the request body uses the new shape (`course_id`, `name`, `capacity`, `instructor_id`, `schedule`, `start_date`)
3. **Given** a user updates a group, **When** partial fields are sent, **Then** only provided fields are updated per the PATCH contract

---

### User Story 2 - Search, filter, and browse groups using new directory endpoints (Priority: P2)

Users need to find groups by name (search), browse completed groups, and view groups filtered by course or type. These endpoints exist in the new API but are not yet implemented in the frontend. Server-side search replaces client-side filtering when the user enters a query. A "Completed" tab toggle within the existing Groups page provides access to completed groups.

**Why this priority**: Improves discoverability and workflow efficiency; missing functionality from the new API.

**Independent Test**: Can search for groups by name, view completed groups, and filter groups by course or type.

**Acceptance Scenarios**:

1. **Given** a user types a search query, **When** the search is executed, **Then** results are returned from `GET /academics/groups/search?query=&status=` and client-side filtering is bypassed
2. **Given** a user toggles the "Completed" tab on the Groups page, **When** the view loads, **Then** data is fetched from `GET /academics/groups/archived`
3. **Given** a user views a course detail page, **When** groups for that course are shown, **Then** data comes from `GET /academics/groups/by-course/{course_id}`
4. **Given** the search input is empty, **When** the groups list loads, **Then** the default paginated or enriched list endpoint is used with client-side filtering as fallback

---

### User Story 3 - Remove deprecated competition endpoints and UI from groups API (Priority: P3)

The backend has removed all competition-related group endpoints (`/academics/groups/{id}/competitions`, `/academics/groups/{id}/teams`, etc.). The frontend still references these endpoints in `GroupDetailPage.tsx` (via `useGroupCompetitions`) and will receive 404 errors if called. Competition data loading and the competition section of the History tab must be removed from GroupDetailPage entirely.

**Why this priority**: Prevents runtime errors and dead code; lower priority because competition functionality may be migrated to a separate API module.

**Independent Test**: No frontend code calls removed competition-group endpoints; no compilation or runtime errors from missing types.

**Acceptance Scenarios**:

1. **Given** the competition-related group API functions are removed or deprecated, **When** the app builds, **Then** no TypeScript errors or unused import warnings remain
2. **Given** a user navigates to a group detail page, **When** the page loads, **Then** no competition data is fetched from the groups API and no 404 errors occur
3. **Given** the History tab in GroupDetailPage, **When** rendered, **Then** competition-related sections and the `useGroupCompetitions` hook are no longer present

---

### Edge Cases

- What happens when the `schedule` field is null or missing in an API response?
- How does the UI handle the transition period where some users may have cached old response shapes in React Query?
- What happens if `GET /academics/groups/search` returns no results?
- How are 409 Conflict errors from level delete (has sessions/enrollments) displayed to users?
- When a user archives a group, the status changes to `completed` (not `archived`) per the new API contract. UI must reflect this terminology.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST update the `Group` type to match the new API response shape: `name` (not `group_name`), `capacity` (not `max_capacity`), `schedule` as nested object `{ day, start_time, end_time }`, and `start_date`
- **FR-002**: System MUST update `ScheduleGroupInput` to match the new create request body: `course_id`, `name`, `capacity`, `instructor_id`, `schedule` (nested object), `start_date`. Form components MUST keep flat fields (`default_day`, `default_time_start`, `default_time_end`) and transform to/from nested `schedule` object at the API boundary
- **FR-003**: System MUST add API functions for new directory endpoints: `GET /academics/groups/archived`, `GET /academics/groups/search`, `GET /academics/groups/by-course/{course_id}`, `GET /academics/groups/by-type/{group_type}`
- **FR-004**: System MUST add `level` query param support to `GET /academics/groups/{id}/sessions`
- **FR-005**: System MUST remove or deprecate all competition-related group API functions (`getGroupCompetitions`, `getGroupTeams`, `linkTeamToGroup`, `registerForCompetition`, `completeCompetitionParticipation`, `withdrawFromCompetition`, `getGroupCompetitionAnalytics`, `getGroupsWithCompetitions`)
- **FR-006**: System MUST remove competition-related types from `types/groups/competitions.ts` and their re-exports
- **FR-006a**: System MUST remove `useGroupCompetitions` hook usage and competition data from `GroupDetailPage.tsx`, including the `HistoryTab` competition props
- **FR-007**: System MUST update `UpdateGroupDTO` to only include fields supported by the new PATCH endpoint (partial update of `name`, `capacity`, `schedule`, `instructor_id`, etc.)
- **FR-007a**: System MUST provide transformation utilities that convert between flat form fields (`default_day`, `default_time_start`, `default_time_end`) and the nested `schedule` object (`{ day, start_time, end_time }`) for both create and update flows
- **FR-008**: System MUST preserve all existing non-competition endpoints that are still valid in the new API (CRUD, lifecycle, analytics, details)
- **FR-009**: System MUST handle 409 Conflict errors from level delete operations with user-friendly error messages
- **FR-010**: System MUST ensure the `EnrichedGroupPublic` type aligns with the new enriched response shape (includes `course_name`, `instructor_name`, but uses new field names)
- **FR-011**: System MUST replace `'archived'` with `'completed'` in all status type unions, status badges, and filter logic to match the new API contract
- **FR-012**: System MUST add a "Completed" tab toggle to the Groups page that fetches data from `GET /academics/groups/archived`
- **FR-013**: System MUST replace client-side search on the Groups page with server-side search via `GET /academics/groups/search` when the query is non-empty, falling back to the default list endpoint when empty

### Key Entities

- **Group**: Core entity representing a scheduled group of students. Key attributes: `id`, `course_id`, `name`, `status`, `capacity`, `current_level`, `instructor_id`, `schedule` (nested: `day`, `start_time`, `end_time`), `start_date`
- **EnrichedGroup**: Group with resolved names instead of IDs. Key attributes: `id`, `name`, `course_name`, `instructor_name`, `status`, `capacity`, `current_level`
- **GroupLevel**: A level within a group's lifecycle. Key attributes: `level_number`, `status`, `start_date`, `end_date`, `sessions`, `students_count`, `payment_summary`
- **Schedule**: Nested object replacing flat day/time fields. Attributes: `day`, `start_time`, `end_time`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All group CRUD operations (create, read, update, delete/archive) complete without API errors after alignment
- **SC-002**: Group list page correctly displays all fields from the new API response shape with zero type mismatches
- **SC-003**: New search endpoint returns results in under 1 second for queries matching existing groups
- **SC-004**: Zero TypeScript compilation errors related to removed competition types or functions
- **SC-005**: All existing group-related UI views (list, detail, create, edit) render correctly with the new data shapes

## Assumptions

- The competition functionality removed from the groups API will be (or already is) available through the separate `/api/v1/competitions` API module — frontend competition features should use that instead
- The backend API at `https://techno-terminal-5c255cfe.fastapicloud.dev/` already implements the new API contract described in `groups-api.md`
- Existing React Query caches will be invalidated naturally through component remounts or explicit cache invalidation after deployment
- The `GET /academics/groups/enriched` endpoint still exists and returns the enriched shape (confirmed in new API docs)
- No changes are needed to the API client interceptor pattern or authentication flow
- The `groups-api.md` document is the authoritative source for the new API contract
