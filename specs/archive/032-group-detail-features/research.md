# Research: Group Detail Page — Feature Completions

**Date**: 2026-06-03  
**Feature**: `032-group-detail-features`

## Research Tasks

### 1. History Tab — Backend API Availability

**Decision**: Use existing `GET /groups/{id}/enrollment-history` and `GET /groups/{id}/instructor-history` endpoints.

**Rationale**: Both endpoints exist on `group_lifecycle_router.py` (lines 179-209) as aliases for the analytics endpoints. They return fully structured DTOs:
- `GroupEnrollmentHistoryResponseDTO` — includes per-enrollment payment calculations (`payments_made`, `balance_remaining`)
- `GroupInstructorHistoryResponseDTO` — includes `is_current` flag, `levels_taught_count`, date ranges

**Alternatives considered**:
- Building a custom aggregation endpoint → Rejected: backend already provides exactly what the UI needs.
- Using the analytics endpoints directly (`/enrollments/analytics`, `/instructors/analytics`) → Both work; the `/enrollment-history` alias is cleaner for frontend consumption.

### 2. Session Management — Data Flow

**Decision**: Use sessions data already embedded in `LevelDetailDTO.sessions` for display; use individual session mutation endpoints for actions.

**Rationale**: The `getDetailedLevels()` call already returns `LevelSessionDTO[]` per level. No additional query needed to render session lists. For mutations, four session endpoints already exist in `sessions_router.py`:
- `POST /groups/{id}/sessions` (add extra)
- `DELETE /sessions/{id}` (hard delete)
- `POST /sessions/{id}/cancel` (soft cancel with reschedule)
- `POST /sessions/{id}/reactivate` (undo cancel)

All four have frontend API functions in `src/api/academics/sessions/core.ts` that are coded but never called from components.

**Alternatives considered**:
- Fetching sessions separately per level → Rejected: data already in levels response, would add N extra API calls.
- Inline editing of session date/time → Deferred to future sprint; current scope is add/delete/cancel/reactivate only.

### 3. Student Transfer — API & Data Source

**Decision**: Use existing `POST /enrollments/transfer` endpoint with `TransferEnrollmentRequest` type. Pre-populate target group list from `useGroupEnrollments.transferOptions`.

**Rationale**: 
- Backend `transfer_student()` service (in `enrollments/core/service.py:136-195`) handles: marking old enrollment as "transferred", creating new enrollment in target group at target's current level, inheriting `amount_due` and `discount_applied`, logging activity, sending notifications.
- Frontend `transferEnrollment()` function already exists in `src/api/enrollments/enrollments.ts:23-26`.
- `useGroupEnrollments` hook already returns `transferOptions: TransferOptionDTO[]` with `group_id`, `group_name`, `course_name`, `available_slots`.
- `GroupCombobox` component exists at `src/components/common/combobox/GroupCombobox.tsx`.

**Alternatives considered**:
- Navigate to a dedicated Enrollments transfer page → Rejected: breaks the in-context workflow.
- Custom group search endpoint for transfer targets → Rejected: `transfer_options` from enrollments endpoint already provides filtered active groups.

### 4. GroupCombobox Compatibility

**Decision**: `GroupCombobox` can be used directly, but may need to accept pre-filtered options via props rather than fetching its own data.

**Rationale**: The `GroupCombobox` likely has its own internal data fetching. For the transfer dialog, we already have `transferOptions` from the enrollments endpoint. We'll pass these as `options` to the combobox or build a lightweight select component from the transfer options array.

**Alternatives considered**:
- Building a new combobox from scratch → Rejected: reuse existing pattern.
- Letting GroupCombobox fetch its own groups → Acceptable alternative but wastes an API call when we already have the options.

### 5. Cache Invalidation Strategy

**Decision**: Session mutations invalidate `groupLevels` and `groupSessions`. Transfer mutations invalidate `groupEnrollments`. History data has its own independent cache keys.

**Rationale**: 
- Sessions are embedded in the levels response, so invalidating `groupLevels` triggers a refetch that includes updated session lists.
- Transfer changes enrollment data, so invalidating `groupEnrollments` updates the Students tab.
- History tab data is independent and rarely changes within a session; 5-minute staleTime is sufficient.

## All Unknowns Resolved

No NEEDS CLARIFICATION items remain.
