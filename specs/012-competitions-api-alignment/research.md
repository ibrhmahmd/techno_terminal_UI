# Research: Competitions API Alignment

## Decision: ApiResponse Envelope for All Teams Endpoints

**Rationale**: The new backend wraps ALL responses (including teams endpoints) in `ApiResponse<T>`. The current frontend code accesses `response.data` directly assuming raw data. Every teams API function in `src/api/teams/teams.ts` must be updated to unwrap `response.data.data` instead of `response.data`.

**Alternatives considered**: 
- Create a separate unenveloped client for teams — rejected because it breaks the single-client architecture and adds maintenance burden
- Use Axios transformers to auto-unwrap — rejected because it would affect all endpoints and could break error handling

## Decision: Payment Model Migration

**Rationale**: Backend replaced boolean `fee_paid` with decimal `amount_paid` (running total) and `member_share` with `amount_due`. This enables partial payments. The UI must show remaining balance (`amount_due - amount_paid`) instead of a simple "Paid/Pending" badge.

**Alternatives considered**:
- Keep old UI and add partial payment as a separate flow — rejected because the backend no longer supports the old model; fields don't exist
- Display only `amount_paid` without `amount_due` — rejected because users need to know what's owed

## Decision: Hard Delete Replaces Soft Delete

**Rationale**: Backend removed `deleted_at` fields and restore endpoints. Competitions and teams are permanently deleted. The "Trash" view and restore functionality must be removed entirely.

**Alternatives considered**:
- Keep trash UI and simulate soft delete client-side — rejected because it would create phantom data that doesn't match the backend
- Add a confirmation modal before hard delete — adopted as UX improvement (not a backend requirement but good practice)

## Decision: Team Registration Payload Restructure

**Rationale**: Backend replaced flat `fee` field with per-student `student_fees` map (`{student_id: fee}`). This allows different fees per student. `project_name` and `project_description` are new optional fields.

**Alternatives considered**:
- Keep flat fee and let backend distribute — rejected because backend no longer accepts `fee` on team registration
- Require equal fees for all students — rejected because the API supports per-student variation

## Decision: Competition Summary Response Shape Change

**Rationale**: Backend changed `CompetitionSummaryCategory` to `CategoryWithTeamsDTO` — removed `category_id` and `category_name`, added `subcategory`. The summary endpoint now returns categories split by subcategory rather than grouped by category ID.

**Alternatives considered**:
- Client-side grouping by category — rejected because the backend already provides the correct shape; duplicating logic is wasteful

## Decision: GET /teams Requires competition_id

**Rationale**: The backend now requires `competition_id` as a query parameter for the teams list endpoint. The frontend must always pass this when fetching teams.

**Alternatives considered**:
- Fetch all teams and filter client-side — rejected because the backend enforces the requirement; requests without it will error

## Decision: TeamDTO Field Changes

**Rationale**: `TeamDTO` lost the `fee` field (fees are now per-member via `amount_due`/`amount_paid`) and gained `project_name` and `project_description`. UI components displaying `team.fee` must be updated to show member-level fees instead.

## Decision: Payment Endpoint Path Change

**Rationale**: Payment endpoint moved from `POST /teams/{team_id}/pay` (with `student_id` in body) to `POST /teams/{team_id}/members/{student_id}/pay` (with `student_id` in URL path). The body now requires `amount` (supports partial payments).
