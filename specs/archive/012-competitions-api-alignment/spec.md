# Feature Specification: Competitions API Alignment

**Feature Branch**: `012-competitions-api-alignment`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "great now open a spec focusing on the competitions page and its API implementation. the back end just updated the competitions API nad we must allign with its API contracts you will find the new API doc at competitions-api.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Competitions and Teams (Priority: P1)

As an authenticated user, I can browse the list of competitions, view competition details including categories, teams, and participants, and see team member rosters with accurate payment status.

**Why this priority**: This is the core read-only flow that all users depend on. If the data shapes are wrong, the entire competitions feature is broken.

**Independent Test**: Can be fully tested by navigating to `/competitions`, selecting a competition, and verifying that all data (competition info, categories, teams, members, payment status) renders correctly without errors.

**Acceptance Scenarios**:

1. **Given** the competitions list page loads, **When** the API returns competition data, **Then** each competition displays its name, edition year, date, location, and fee per student without undefined values
2. **Given** a competition detail page, **When** viewing the summary, **Then** categories display correctly with their team counts and all team/member data renders with the new response shape
3. **Given** a team's member roster, **When** viewing payment status, **Then** each member shows their amount due, amount paid, and remaining balance (not the old boolean fee_paid)
4. **Given** a team with project information, **When** viewing team details, **Then** project name and project description are displayed

---

### User Story 2 - Register a Team (Priority: P2)

As an admin, I can register a new team for a competition, assign students with per-student fees, and optionally set project name and description.

**Why this priority**: Team registration is a core admin workflow. The API contract changed significantly (fee → student_fees, new project fields, ApiResponse envelope).

**Independent Test**: Can be fully tested by registering a new team through the UI and verifying the team appears in the competition detail page with correct data.

**Acceptance Scenarios**:

1. **Given** an admin is on a competition detail page, **When** they register a team with students, **Then** the team is created with per-student fees (not a flat team fee) and the response is correctly parsed from the ApiResponse envelope
2. **Given** an admin is registering a team, **When** they provide project name and description, **Then** those fields are saved and visible on the team detail page
3. **Given** a student is already in a team for this competition, **When** an admin tries to add them to another team, **Then** the system shows a conflict error (409)

---

### User Story 3 - Manage Team Members and Payments (Priority: P3)

As an admin, I can add/remove team members, process competition fee payments (including partial payments), and update team placement after the competition date.

**Why this priority**: Payment flow is the most complex change — endpoint path changed, partial payments supported, and the payment model shifted from boolean to running totals.

**Independent Test**: Can be fully tested by adding a member to a team, processing a full and partial payment, and verifying the payment status updates correctly.

**Acceptance Scenarios**:

1. **Given** an admin views a team member, **When** they process a payment, **Then** they can specify any amount (partial or full) and the system updates amount_paid as a running total
2. **Given** a team member has already paid (amount_paid > 0), **When** an admin tries to remove them, **Then** the system prevents removal with an error
3. **Given** a competition date has passed, **When** an admin updates team placement, **Then** the placement rank and label are saved and reflected in the UI
4. **Given** a competition date has not passed, **When** an admin tries to set team placement, **Then** the system prevents it with an error

---

### Edge Cases

- What happens when a competition has no teams registered? The summary should show zero teams/participants gracefully.
- How does the system handle a payment amount exceeding the remaining balance? The API should reject overpayments (400).
- What happens when deleting a competition that has registered teams? The API returns 409 — the UI should show a clear error message.
- What happens when deleting a team with paid members? The API returns 409 — the UI should prevent deletion and explain why.
- How does the UI handle null location or competition_date fields on a competition?
- What happens when the API returns a 401 during a payment flow? The token refresh interceptor should retry the payment request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST correctly parse all Teams API responses from the `ApiResponse<T>` envelope (unwrapping `data` from the envelope before use)
- **FR-002**: System MUST display team member payment status using `amount_due` and `amount_paid` fields instead of the deprecated `member_share` and `fee_paid` fields
- **FR-003**: System MUST support partial competition fee payments by sending an explicit `amount` to the new payment endpoint (`POST /teams/{team_id}/members/{student_id}/pay`)
- **FR-004**: System MUST remove all soft-delete and restore UI flows for competitions and teams, replacing them with hard-delete operations with confirmation
- **FR-005**: System MUST prevent deletion of competitions that have registered teams (handle 409 BusinessRuleError)
- **FR-006**: System MUST prevent deletion of teams that have paid members (handle 409 BusinessRuleError)
- **FR-007**: System MUST display `project_name` and `project_description` fields on team detail views
- **FR-008**: System MUST use the new team registration payload structure with `student_fees` (per-student fee map) instead of a flat `fee` field
- **FR-009**: System MUST correctly parse the competition summary response using the new `CategoryWithTeamsDTO` shape (with `subcategory` instead of `category_id`/`category_name`)
- **FR-010**: System MUST handle nullable `location` and `competition_date` fields on competitions without rendering errors
- **FR-011**: System MUST prevent removal of team members who have already paid (`amount_paid > 0`) and display an appropriate error
- **FR-012**: System MUST prevent setting team placement before the competition date has passed and display an appropriate error
- **FR-013**: System MUST require `competition_id` when fetching teams list (it is now a required query parameter)
- **FR-014**: System MUST correctly handle the nested `TeamWithMembersDTO` response shape when `include_members=true` on the teams list endpoint

### Key Entities

- **Competition**: A contest/event with a name, edition year, date, location, notes, and default fee per student. Has many teams.
- **Team**: A group of students registered for a specific competition, with a category, optional subcategory, optional project details, coach, and placement results.
- **Team Member**: A student's membership in a team, tracking `amount_due` (fee owed) and `amount_paid` (running total of payments made).
- **Payment**: An atomic transaction recording a fee payment for a team member, generating a receipt number and updating the member's `amount_paid` total.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All competitions and teams pages load without TypeScript errors or undefined values in rendered data within 2 seconds
- **SC-002**: 100% of API responses from the Teams endpoints are correctly unwrapped from the `ApiResponse<T>` envelope (zero "undefined is not a function" errors in console)
- **SC-003**: Team member payment status displays correctly for all members (amount due, amount paid, remaining balance) matching backend data
- **SC-004**: Admin can successfully register a team with per-student fees and project details in a single flow
- **SC-005**: Admin can process partial payments and see the running total update correctly after each payment
- **SC-006**: Delete operations show clear error messages when blocked by business rules (teams registered for competitions, paid members on teams)
- **SC-007**: No references to deprecated fields (`fee_paid`, `member_share`, `deleted_at`, `category_id`, `category_name`, `fee` on TeamDTO) remain in the codebase

## Assumptions

- The backend API at `https://techno-terminal-5c255cfe.fastapicloud.dev/api/v1` is already deployed with the new contracts described in `competitions-api.md`
- The existing authentication and role-based access control (admin, coach, authenticated user) remains unchanged
- The existing React Query cache invalidation patterns will be reused — only the API call shapes and response parsing change
- The frontend will continue to use the same route structure (`/competitions`, `/competitions/:id`, `/competitions/:id/edit`, `/teams/:id`)
- The `edition` field on competitions is deprecated but still accepted by the backend — the UI can continue using it until a future migration to `edition_year`
- Existing color utilities (`src/utils/colors.ts`) for payment status badges will be adapted for the new amount-based payment model
- The `GET /teams` endpoint with `include_members=true` returns `TeamWithMembersDTO[]` wrapped in `ApiResponse` — the frontend must handle the nested structure
