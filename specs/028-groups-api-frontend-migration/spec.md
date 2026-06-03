# Feature Specification: Frontend Migration to Unified Groups API

**Feature Branch**: `[028-groups-api-frontend-migration]`  
**Created**: 2026-06-03  
**Status**: Draft  
**Input**: User description: "open a spec for updates on the groups API identified from the front end mogration document in the spec we will work on using the new API contracts and deleting the depricated and deleted endpoints we will not tolerate any dead code, tech debt, backward compatability"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unify Group Fetching Logic (Priority: P1)

Frontend components currently rely on several fragmented, deprecated endpoints to fetch group data (e.g., active, enriched, archived, by course). All these API client calls must be refactored to point to the new, powerful `/academics/groups/filter` canonical endpoint to prevent 404 errors and ensure the UI continues to function correctly.

**Why this priority**: The backend has already removed the legacy endpoints. Without this migration, the Groups UI will completely fail to load.

**Independent Test**: Can be tested by navigating to the Groups page and verifying that the active groups list, the search functionality, and the archived groups tabs load data correctly without any network errors.

**Acceptance Scenarios**:

1. **Given** a user navigates to the groups list, **When** the page loads, **Then** the application successfully fetches active groups using `/filter` with no status parameters (defaulting to active).
2. **Given** a user searches for a group, **When** they type a query, **Then** the application calls `/filter` with the `q` parameter and `include_inactive=true` to search across all statuses.
3. **Given** a user views archived groups, **When** they click the archived tab, **Then** the application calls `/filter` explicitly with the `status=archived` parameter.

---

### User Story 2 - Eliminate Dead Code & Technical Debt (Priority: P2)

The frontend API client contains functions that point to removed endpoints but are actually never invoked by any React components (e.g., `getGroupsByType` and `getCourseGroups`). These must be completely deleted from the codebase.

**Why this priority**: We have a strict policy against dead code and technical debt. Keeping unused API bindings confuses future developers and clutters the codebase.

**Independent Test**: Can be verified by running a codebase search for the deleted functions and ensuring the TypeScript build succeeds without them.

**Acceptance Scenarios**:

1. **Given** a developer inspecting the groups API client, **When** they look for `getGroupsByType` or `getCourseGroups`, **Then** they will find those functions have been completely removed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST replace API calls to `GET /academics/groups` with `GET /academics/groups/filter`.
- **FR-002**: System MUST replace API calls to `GET /academics/groups/enriched` with `GET /academics/groups/filter`.
- **FR-003**: System MUST replace API calls to `GET /academics/groups/search` with `GET /academics/groups/filter`.
- **FR-004**: System MUST replace API calls to `GET /academics/groups/archived` with `GET /academics/groups/filter`.
- **FR-005**: System MUST replace API calls to `GET /academics/groups/by-course/{course_id}` with `GET /academics/groups/filter`.
- **FR-006**: System MUST completely remove `getGroupsByType` and `getCourseGroups` from the API client exports and core definitions.
- **FR-007**: System MUST properly serialize array parameters (like `course_ids` and `status`) in GET requests, adhering to the standard repeated query parameter format if multiple values are sent.
- **FR-008**: System MUST transform the backend response structure (`{ groups, total, skip, limit }`) to match the frontend's expected `PaginationResult` structure.

### Key Entities 

- **GroupFilterResult**: The new response shape from the backend, containing the `groups` array and pagination metadata.
- **EnrichedGroupPublic**: The standard group DTO returned by the `/filter` endpoint, which the UI relies on for rendering group cards and tables.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The frontend project compiles successfully with 0 TypeScript compilation errors.
- **SC-002**: No 404 Not Found errors are triggered by the application when navigating through the Academics Groups module.
- **SC-003**: 100% of the deprecated endpoints listed in the migration guide are removed from the frontend codebase.

## Assumptions

- The frontend UI components themselves do not need visual redesign; the changes are strictly within the API client layer (`src/api/academics/groups/core.ts` and related files).
- The `normalizeEnrichedGroup` helper function remains sufficient to map the backend's `EnrichedGroupPublic` to the frontend's internal expectations.
