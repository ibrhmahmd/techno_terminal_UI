# Feature Specification: Edit Enrollment

**Feature Branch**: `036-edit-enrollment`  
**Created**: 2026-06-04  
**Status**: Draft  
**Input**: User description: "lets open a new spec focusing on the enrollments page functionalities we need to add a new feature for editing an enrollment so we need to check what the backend provide for the enrollment managment and consume so look deepley in the backend API that related to the enrollment managments and lets get ready to use it in the front end and check the missing features"

## Clarifications

### Session 2026-06-04
- Q: When editing an enrollment, how should the system handle potential conflicts with existing invoices or related records? → A: Allow modifications but implement strong validation to prevent conflicts (e.g., blocking/warning if changes contradict already created or paid invoices/records).
- Q: Should administrators be allowed to edit enrollments that are already inactive, dropped, or transferred? → A: No, editing is completely disabled for inactive, dropped, or transferred enrollments.
- Q: How should administrators revert a custom enrollment price back to the group's default price? → A: Clear the input field (leaving it blank/empty), saving `amount_due` as `null` on the backend.
- Q: Should the system keep an audit history of enrollment edits (such as who edited it, what changed, and when)? → A: Yes, log edit details (editor, timestamp, old vs. new values) in the `enrollment_metadata` JSONB field.
- Q: Should an email or WhatsApp notification be dispatched to the student or parent when their enrollment details are edited? → A: Yes, send a Gmail notification to the parent detailing the updated financial terms.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Enrollment Details (Priority: P1)

As an administrator, I want to edit the details of an existing student enrollment so that I can correct mistakes or update financial agreements (like custom amounts or discounts) and add internal notes without dropping and re-enrolling the student.

**Why this priority**: Correcting enrollment data is a critical operational task. Without it, administrators are forced to perform destructive actions (dropping and re-enrolling) which messes up history and reporting.

**Independent Test**: Can be fully tested by opening an active enrollment, modifying the custom amount due and notes, saving, and verifying the new values persist on the enrollment record.

**Acceptance Scenarios**:

1. **Given** an active student enrollment, **When** the administrator updates the custom amount due and saves, **Then** the system updates the enrollment record and displays the new amount.
2. **Given** an active student enrollment, **When** the administrator adds an internal note, **Then** the note is saved and visible on the enrollment details.
3. **Given** an enrollment with a discount already applied, **When** the administrator modifies the discount amount, **Then** the total balance reflects the new discount correctly.

---

### Edge Cases

- What happens if an edit API request is received for an already dropped/transferred enrollment? (Backend MUST return a validation error blocking the request).
- How does the system handle negative amounts or discounts that exceed the base price?
- What happens if the backend validation fails during the edit operation?
- How does the system handle edits to pricing/discounts when related invoices have already been fully or partially paid?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a backend API endpoint (`PATCH` or `PUT`) to update an existing enrollment.
- **FR-002**: System MUST allow administrators to modify the `amount_due` (custom pricing), `discount_applied`, and `notes` on an existing enrollment.
- **FR-003**: System MUST NOT allow changing the `student_id` or `group_id` through the edit functionality (these require transfers or new enrollments).
- **FR-004**: System MUST display an "Edit" action on the enrollment cards/rows in the frontend (Enrollments page and Student Profile page).
- **FR-005**: System MUST provide a user-friendly form modal in the frontend to capture the edited fields.
- **FR-006**: System MUST gracefully handle validation errors (e.g. invalid discount amounts) and display them to the user.
- **FR-007**: System MUST perform strong validation during enrollment updates to prevent conflicts with existing billing records (e.g., preventing changes to pricing/discounts if they conflict with already paid or locked invoices).
- **FR-008**: System MUST only allow editing on enrollments that have an 'active' status. Inactive, dropped, or transferred enrollments MUST have the edit action disabled in the UI and blocked on the backend.
- **FR-009**: System MUST allow setting `amount_due` to `null` (None) when the administrator clears the input in the edit form, reverting the enrollment pricing to the group's default price.
- **FR-010**: System MUST log details of enrollment edits (such as the performing user ID, timestamp, and a diff of modified fields) in the `enrollment_metadata` JSONB field upon update.
- **FR-011**: System MUST send a Gmail notification (using background tasks) to the student's parent/fallback email when enrollment financial details (`amount_due`, `discount_applied`) are modified.

### Key Entities *(include if feature involves data)*

- **Enrollment**: Represents a student's membership in a group. Key attributes to be edited: `amount_due`, `discount_applied`, `notes`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can successfully edit an enrollment's financial details and notes within 30 seconds.
- **SC-002**: The need to drop and re-enroll students to correct financial details is reduced by 100%.
- **SC-003**: 100% of edited enrollments correctly recalculate and display the updated financial balances immediately.

## Assumptions

- Target users (administrators) have the necessary permissions to edit enrollments.
- Editing an enrollment's financial details will only affect future payments or the overall balance, assuming the underlying billing logic handles dynamic balance changes.
- The core attributes like `student_id` and `group_id` are strictly immutable for an existing enrollment.
