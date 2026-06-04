# Research: Edit Enrollment Feature

**Date**: 2026-06-04 | **Branch**: `036-edit-enrollment`

## Decision 1: Backend PATCH Endpoint Exists?

- **Finding**: **No**. The backend `enrollments_router.py` has 6 endpoints:
  - `POST /enrollments` — create enrollment
  - `DELETE /enrollments/{id}` — drop enrollment
  - `POST /enrollments/transfer` — transfer student
  - `GET /enrollments/student/{student_id}` — student enrollment history
  - `POST /enrollments/{id}/discount` — apply sibling discount
  - `GET /enrollments/group/{group_id}/students-summary` — group enrollment summary
- **Decision**: A new `PATCH /enrollments/{enrollment_id}` endpoint must be created on the backend.
- **Rationale**: No existing endpoint supports partial updates to `amount_due`, `discount_applied`, or `notes`.
- **Alternatives Considered**: Using `POST /enrollments/{id}/discount` for all financial edits — rejected because it only handles `discount_applied` and doesn't support `notes` or `amount_due` changes.

## Decision 2: Backend Schema for Update Input

- **Finding**: The existing `EnrollStudentInput` schema (Pydantic) has `student_id`, `group_id`, `amount_due`, `discount`, `notes`, `created_by`. No `UpdateEnrollmentInput` exists.
- **Decision**: Create a new `UpdateEnrollmentInput` schema in `app/modules/enrollments/core/schemas.py` with fields: `amount_due: Optional[float]`, `discount_applied: Optional[float]`, `notes: Optional[str]`.
- **Rationale**: The update schema must be separate from the create schema because `student_id` and `group_id` are immutable after creation. Using `Optional` fields allows partial updates.

## Decision 3: Repository Update Function

- **Finding**: The repository has `update_enrollment_status()` and `update_discount()` — both are single-field updaters. No generic update function exists.
- **Decision**: Add a new `update_enrollment_fields()` function in `core/repository.py` that accepts a dict of changed fields and applies them atomically.
- **Rationale**: Avoids creating N single-field functions. Uses `apply_update_audit()` for consistent `updated_at` stamping.

## Decision 4: Conflict Validation Strategy

- **Finding**: The `Payment` model (finance) has an `enrollment_id` FK column. Payments are linked to enrollments. The `payment_repository.py` has a `get_balance_by_enrollment()` method that computes `total_charged`, `total_paid`, `remaining_balance` per enrollment.
- **Decision**: Before allowing `amount_due` or `discount_applied` changes, the service must check if any payments already exist for this enrollment. If payments exist, display a warning but still allow changes (per user's clarification: "allow modification with strong validation").
- **Rationale**: The user explicitly chose to allow edits with strong validation, not block them. The API response will include a `has_payment_conflicts` flag and a `warnings` array so the frontend can display appropriate alerts.

## Decision 5: Audit History in `enrollment_metadata`

- **Finding**: The `Enrollment` model has an `enrollment_metadata` JSONB column (mapped to DB column `metadata`). Currently unused for audit purposes.
- **Decision**: Store edit history as an array under `enrollment_metadata.edit_history`, with each entry containing: `{ editor_id, timestamp, changes: { field: { old, new } } }`.
- **Rationale**: Avoids schema migration for a new audit table. The JSONB column already exists and is purpose-built for extensible metadata.

## Decision 6: Notification Integration

- **Finding**: `EnrollmentNotificationService` has methods for `created`, `completed`, `dropped`, `transferred`, and `level_progression`. No `notify_enrollment_updated` exists.
- **Decision**: Add a `notify_enrollment_updated()` method to `EnrollmentNotificationService` that sends a Gmail notification when financial fields change.
- **Rationale**: User explicitly chose option B (Gmail notification to parent on financial detail changes). Follows the existing pattern: public method → `background_tasks.add_task(self._process_updated, ...)`.

## Decision 7: Frontend API Function

- **Finding**: `src/api/enrollments/enrollments.ts` has functions for `create`, `transfer`, `delete`, `applyDiscount`, `getStudentEnrollments`, `getStudentEnrollmentsSummary`. No `updateEnrollment` function exists.
- **Decision**: Add `updateEnrollment(enrollmentId: number, data: UpdateEnrollmentRequest): Promise<Enrollment>` using `client.patch()`.
- **Rationale**: Follows existing patterns in the API layer. `PATCH` is the correct HTTP verb for partial updates.

## Decision 8: Frontend UI Placement

- **Finding**: The `EnrollmentsPage.tsx` has two modes: "Enroll" and "Manage". The "Manage" panel (`ManageEnrollmentPanel.tsx`) lets users select a student → select an enrollment → choose "Transfer" or "Drop". There is no "Edit" action.
- **Decision**: Add an "Edit" action button alongside "Transfer" and "Drop" in the `ManageEnrollmentPanel`'s action hub. When clicked, it opens an `EditEnrollmentModal` with form fields for `amount_due`, `discount_applied`, and `notes`.
- **Rationale**: The manage panel already has the student/enrollment selection flow. Adding "Edit" as a third action fits the existing UX pattern naturally.

## Decision 9: Enrollment Type Fix

- **Finding**: The frontend `Enrollment` interface has `amount_due: number` but the backend `EnrollmentPublic` has `amount_due: Optional[float] = None`. This means the frontend doesn't handle `null` values for `amount_due`.
- **Decision**: Update the frontend `Enrollment` type to `amount_due: number | null` to match the backend's nullable semantics, allowing the "clear to revert to default" flow.
- **Rationale**: Necessary for FR-009 (clearing `amount_due` to `null`).

## Decision 10: Cache Invalidation

- **Finding**: `queryKeys.ts` has `finance.studentEnrollments(studentId)` and `groupEnrollments(groupId)`. After editing, both caches must be invalidated.
- **Decision**: The `useUpdateEnrollment` mutation hook will invalidate `finance.studentEnrollments`, `groupEnrollments`, and `studentDetails` cache keys.
- **Rationale**: Ensures all views that display enrollment financial data reflect the updated values.
