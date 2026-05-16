# Feature Specification: Fix Enrollment Issues

**Feature Branch**: `009-fix-enrollment-issues`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "1. default price to zero in new enrollment tab. 2. stop scroll from changing price input. 3. review API for editing enrollment"

## User Scenarios & Testing

### User Story 1 - Default Price to Zero in New Enrollment Form (Priority: P1)

Admins creating a new enrollment see the "Course Fee" field pre-filled with 0 EGP instead of a hardcoded 150 EGP. They enter the actual fee manually, avoiding confusion and data entry errors.

**Why this priority**: The hardcoded default of 150 EGP does not reflect actual course prices and causes incorrect financial records if the admin forgets to change it. Zero is a safer neutral default that forces conscious entry.

**Independent Test**: Navigate to the Enrollments page, click "New Enrollment", select a student and group. Observe that the Course Fee input shows 0 (not 150). Enter a different value, submit — verify the enrollment is created with the correct `amount_due`.

**Acceptance Scenarios**:

1. **Given** the EnrollPanel form is opened, **When** a student and group are selected, **Then** the Course Fee field defaults to 0
2. **Given** the EnrollPanel form is reset (after successful creation or clearing selection), **When** a new selection is made, **Then** the Course Fee field resets to 0
3. **Given** the Course Fee field shows 0, **When** the admin enters a specific fee amount and submits, **Then** the enrollment is created with that exact `amount_due`

---

### User Story 2 - Prevent Scroll from Changing Price Input (Priority: P1)

When admins fill in the enrollment form, scrolling the mouse wheel over the Course Fee or Discount number inputs does not accidentally change their values. This prevents silent data entry mistakes.

**Why this priority**: Accidental scroll changes to number inputs are a well-known usability bug that can silently corrupt financial data. Fixing this prevents hard-to-catch data entry errors.

**Independent Test**: Open the enrollment form, place the cursor in the Course Fee or Discount field, scroll up/down with the mouse wheel. Verify the value does not change. Manually type a value — verify typing still works.

**Acceptance Scenarios**:

1. **Given** the Course Fee input is focused, **When** the user scrolls the mouse wheel, **Then** the value does not change
2. **Given** the Discount input is focused, **When** the user scrolls the mouse wheel, **Then** the value does not change
3. **Given** either number input is focused, **When** the user types a value manually or uses the keyboard arrow keys, **Then** the value updates normally

---

### User Story 3 - Review Enrollment Edit API (Priority: P2)

Review the existing backend API to determine if enrollment records (amount_due, discount, notes) can be edited after creation. Document what endpoints exist and what changes would be needed to support editing.

**Why this priority**: Understanding API capabilities determines whether enrollment editing requires a backend change or can be done client-side. This is research that may unblock future feature work.

**Independent Test**: Review the API documentation and source code to produce a written assessment of edit capabilities.

**Acceptance Scenarios**:

1. **Given** the API source code is reviewed, **When** examining available endpoints, **Then** produce a list of all enrollment-related endpoints with their HTTP methods
2. **Given** no edit endpoint exists, **When** documenting findings, **Then** include a recommendation for what a PATCH/PUT endpoint would need
3. **Given** only create/transfer/delete/discount endpoints exist, **When** considering future edit support, **Then** document the fields that should be editable (amount_due, discount_applied, notes)

---

### Edge Cases

- What happens when an admin clears the Course Fee field (sets it to blank) before submitting?
- Does the Discount field also suffer from the scroll-to-change bug?
- After a successful enrollment, when the form resets for another enrollment, does the fee reset to zero?
- If the API does not support editing, do we have a workaround (e.g., drop + re-enroll)?

## Requirements

### Functional Requirements

- **FR-001**: The Course Fee input in the new enrollment form MUST default to 0 instead of 150
- **FR-002**: All `setAmount` calls (on group select, student change, form reset) MUST use 0 instead of 150
- **FR-003**: The Course Fee input MUST NOT change value when the user scrolls over it
- **FR-004**: The Discount input MUST NOT change value when the user scrolls over it
- **FR-005**: Manual typing and keyboard arrow keys MUST still work on number inputs
- **FR-006**: A written assessment of the enrollment API MUST be produced listing all endpoints and whether an edit endpoint exists

### Key Entities

- **Enrollment**: A record linking a student to a group with payment details (amount_due, discount_applied, notes, status)
- **EnrollPanel**: The UI component for creating new enrollments with student selection, group selection, and payment details sections
- **ManageEnrollmentPanel**: The UI component for transferring or dropping an existing enrollment

## Success Criteria

### Measurable Outcomes

- **SC-001**: The Course Fee field shows 0 on initial load, after selection changes, and after form reset — verified in all 5 code locations
- **SC-002**: Scrolling over any number input in the enroll panel does not change the value — verified manually
- **SC-003**: A written API assessment is produced listing all enrollment endpoints with their methods and a recommendation for edit support
- **SC-004**: Build passes with zero TypeScript and lint errors after all changes

## Assumptions

- The hardcoded value 150 is not intentional business logic — it was a placeholder default
- Both the Course Fee and Discount inputs need the scroll-prevention fix
- The scroll-prevention fix applies only to the enrollment form number inputs (not globally)
- The API review is a research task, not a backend implementation task — any required backend changes will be spec'd separately
- All changes are frontend-only except possibly the API review findings
