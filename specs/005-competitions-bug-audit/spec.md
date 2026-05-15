# Feature Specification: Competitions Bug Audit

**Feature Branch**: `005-competitions-bug-audit`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "From the implementation-map.md create a spec to plan and find potential bugs and errors in the competitions page related logic"

## User Scenarios & Testing

### User Story 1 — View Competition Categories (Priority: P1)

As an admin user, I want to see the categories for a competition on the Categories tab so that I can understand how teams are organized.

**Why this priority**: The Categories tab currently receives a response shape that does not match what the frontend expects — this is a confirmed broken feature.

**Independent Test**: An admin opens any competition with registered teams, clicks the Categories tab, and sees category cards with names, descriptions, team counts, and max team sizes instead of broken/empty content.

**Acceptance Scenarios**:

1. **Given** I am on a competition detail page, **When** I click the Categories tab, **Then** I see category cards displaying name, description, age range, max team size, and registered team count
2. **Given** I navigate to a competition with multiple categories, **When** the tab loads, **Then** all categories are rendered as individual cards
3. **Given** the backend returns the documented `CategoryResponse` schema (strings only), **When** the tab tries to render, **Then** fields like `id`, `max_team_size`, `registered_teams` will be `undefined` and the display breaks

---

### User Story 2 — Register a Team for a Competition Category (Priority: P1)

As an admin user, I want to register a team for a competition category so that students can participate.

**Why this priority**: Team registration uses a different endpoint and payload format than documented — if the backend matches the docs, registration will fail.

**Independent Test**: An admin opens a competition category, clicks Register Team, fills in team name and members, submits, and the team appears in the category's team list.

**Acceptance Scenarios**:

1. **Given** I am on a category's team list, **When** I click Register Team and fill the form, **Then** the submission uses `POST /competitions/register-team` with a `members` array containing `student_id` and `role`
2. **Given** the backend expects `POST /teams` with flat `student_ids` list, **When** the frontend submits to `/competitions/register-team`, **Then** the request fails with a 404 or 405
3. **Given** the backend expects `RegisterTeamInput` with `student_ids` field, **When** the frontend sends `members` array instead, **Then** the request returns a 400 validation error
4. **Given** the frontend calls `GET /competitions/{competitionId}/categories/{categoryId}/teams` to fetch teams, **When** this endpoint is not implemented, **Then** the team list appears empty

---

### User Story 3 — Browse and Filter Competitions List (Priority: P2)

As an admin user, I want to filter and paginate through competitions so that I can find specific competitions quickly.

**Why this priority**: The list endpoint uses different query parameters than documented — pagination and filters may not work if the backend changed.

**Independent Test**: An admin opens the competitions page, changes the page, applies a search term, and sees the expected filtered results without errors.

**Acceptance Scenarios**:

1. **Given** I am on the competitions page, **When** I navigate to page 2, **Then** the frontend sends `skip` and `limit` parameters and renders the next page of results
2. **Given** I type a search term, **When** the request is sent, **Then** the frontend includes a `search` parameter
3. **Given** the backend only recognizes `include_deleted` as a valid parameter, **When** the frontend sends `status`, `skip`, `limit`, and `search`, **Then** those extra parameters are silently ignored and the response is unfiltered/unpaginated
4. **Given** the response is a flat list (not paginated), **When** the frontend reads `response.data.total` and `response.data.skip`, **Then** these values are `undefined` and fall back to `0`, making pagination impossible

---

### User Story 4 — View Group Competition Information (Priority: P2)

As an admin user, I want to see correct team names and competition history for a group so that I can track group performance.

**Why this priority**: Type field name mismatches between docs and frontend can cause missing or incorrect data display.

**Independent Test**: An admin opens a group detail page and views the teams list and competition history with correct team names, competition names, and result data.

**Acceptance Scenarios**:

1. **Given** I am on a group detail page, **When** I view the teams list, **Then** team names display correctly (frontend expects `name` field but backend returns `team_name`)
2. **Given** I view competition analytics for a group, **When** the `GroupCompetitionHistoryResponseDTO` loads, **Then** the competition list renders correctly (frontend expects `competitions[]` but doc says `participations[]`)
3. **Given** I view competition history records, **When** each `CompetitionParticipationDTO` renders, **Then** all fields display (frontend type differs from doc's `GroupCompetitionParticipationDTO`)

---

### User Story 5 — View Student Competition Records (Priority: P3)

As an admin user, I want to see a student's competition history on the Competitions tab so that I can track individual achievements.

**Why this priority**: The underlying backend endpoint is not implemented — the tab will always be empty.

**Independent Test**: An admin opens a student detail page, navigates to the Competitions tab, and either sees competition records or a clear "not yet available" message.

**Acceptance Scenarios**:

1. **Given** I am on a student detail page, **When** I view the Competitions tab, **Then** the page does not crash even though the backend returns an empty array
2. **Given** the backend endpoint `GET /crm/students/{id}/competitions` is not implemented, **When** it is eventually implemented, **Then** the response schema should match the frontend's `CompetitionRecord` type

---

### Edge Cases

- What happens when the backend returns `CategoryResponse` (strings) but frontend expects `CompetitionCategory` (entities)? — Fields `max_team_size`, `registered_teams`, `id` will be `undefined`, causing broken card rendering
- What happens when `POST /competitions/register-team` returns a 404? — The team registration modal shows an error and the team is not created
- What happens when a paginated response is actually a flat list? — `total` and `skip` default to 0, pagination shows 1 page only
- What happens when `TeamPublic` returns `team_name` but frontend reads `name`? — Team name column shows empty/undefined
- What happens when `POST /competitions/team-members/{id}/mark-paid` is undocumented? — Fee marking may silently fail if endpoint changes

## Requirements

### Functional Requirements

- **FR-001**: System MUST correctly render the Categories tab with all category fields — the frontend response type must match what the backend actually returns
- **FR-002**: System MUST successfully register a team using the correct endpoint and payload format — either align frontend to backend or backend to frontend
- **FR-003**: System MUST successfully fetch category teams using an endpoint that exists and returns the expected format
- **FR-004**: System MUST support pagination and filtering on the competitions list with parameters that the backend recognizes
- **FR-005**: System MUST handle competition list responses correctly whether paginated or flat
- **FR-006**: System MUST display group team names correctly by matching the field name (`name` or `team_name`) between frontend type and backend response
- **FR-007**: System MUST display group competition analytics with correct field names matching the backend response
- **FR-008**: System MUST gracefully handle the student competitions empty state (stub returning `[]`) without errors
- **FR-009**: System MUST document and align all competition API endpoints — no undocumented endpoints consumed by frontend
- **FR-010**: System MUST have a verified audit confirming that all competition endpoints match between `docs/api/competitions/` and `src/api/competitions/`

### Key Entities

- **Competition**: Core entity representing a contest event with lifecycle (active → soft-deleted → restored)
- **CompetitionCategory**: Competition sub-division; response format differs between docs (string names) and frontend (entity objects)
- **TeamRegistration**: Group of students registered for a competition; endpoint and payload format are misaligned
- **CompetitionParticipation**: Group-level participation record; frontend and doc schemas differ in field names and structure
- **CompetitionRecord**: Student-level competition history; backend endpoint not yet implemented
- **UnpaidCompFeeItem**: Competition fee tracked in finance module — fully aligned
- **CompetitionFeeSummaryDTO**: Analytics fee summary — fully aligned

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 4 critical mismatches identified in the audit are verified against the real backend response (capture actual API responses via browser console)
- **SC-002**: Every frontend API call in `src/api/competitions/` either matches the documentation or the documentation is updated to reflect reality
- **SC-003**: Every documented endpoint in `docs/api/competitions/` that is consumed by the frontend has a correct and up-to-date schema
- **SC-004**: Zero console errors or undefined field access when navigating through: competitions list → detail → categories tab → register team flow
- **SC-005**: Group competitions tab renders teams with correct names and competition history without missing data
- **SC-006**: Student competitions tab shows a graceful empty state rather than broken UI
- **SC-007**: A verified trace exists confirming whether categories endpoint returns string names or entity objects

## Assumptions

- The backend is the source of truth — where frontend and docs disagree, the actual API response determines what needs to change
- The developer can access the running application and browser console to verify actual API responses (debug mode: `localStorage.setItem('api_debug', 'true')`)
- Both frontend types and documentation may need updating — this spec does not prescribe which direction changes should go
- The `teams.md` documented endpoints under `/teams/*` that are not consumed by the frontend are legacy and out of scope for this audit
- Student competitions backend endpoint will be implemented separately — this audit only ensures graceful degradation
- Audit can be done without a backend development environment (frontend-only verification against the running dev proxy)
