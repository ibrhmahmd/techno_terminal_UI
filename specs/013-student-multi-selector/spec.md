# Feature Specification: Student Multi-Selector for Team Registration

**Feature Branch**: `013-student-multi-selector`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: Replace manual student ID inputs in team registration with a searchable multi-student selector that shows names, status, and allows per-student fee configuration.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Search and Select Students by Name (Priority: P1) 🎯 MVP

As an admin registering a team, I can search for students by typing their name, see matching results with their name, phone, and status, and select multiple students to add to the team.

**Why this priority**: This is the core replacement for the current broken workflow of typing numeric IDs. Without search-by-name, the team registration modal remains unusable.

**Independent Test**: Open the team registration modal, type a student name, see results, click to select multiple students, verify they appear in the selected roster.

**Acceptance Scenarios**:

1. **Given** the admin is on the team registration modal, **When** they type 2+ characters in the search field, **Then** matching students appear with their full name, phone number, and status badge
2. **Given** search results are displayed, **When** the admin clicks a student, **Then** that student is added to the selected roster and removed from search results
3. **Given** the admin has selected students, **When** they view the selected roster, **Then** each student shows their name with a remove button and an inline fee input
4. **Given** no students are selected, **When** the admin tries to submit, **Then** the form shows a validation error requiring at least one student

---

### User Story 2 — Configure Per-Student Fees (Priority: P2)

As an admin, I can set a different fee amount for each selected student, or leave it at the default competition fee.

**Why this priority**: The API supports per-student fees (`student_fees` map). The UI must allow this configuration without forcing the admin to remember student IDs.

**Independent Test**: Select 3 students, set different fees for 2 of them, submit, verify the `student_fees` payload contains only the explicitly set fees.

**Acceptance Scenarios**:

1. **Given** a student is in the selected roster, **When** the admin enters a fee amount, **Then** that fee is included in the `student_fees` map on submission
2. **Given** a student is in the selected roster, **When** the admin leaves the fee field empty, **Then** no fee entry is sent for that student (backend defaults to 0)

---

### User Story 3 — Reusable Multi-Selector Component (Priority: P3)

As a developer, I can reuse the multi-student selector component in other parts of the app (bulk enrollment, group management) without duplicating search logic.

**Why this priority**: The `StudentCombobox` already exists for single-select. A multi-select variant should follow the same pattern and be reusable.

**Independent Test**: Import `StudentMultiSelector` in a test page, pass students/search props, verify it renders and emits selection changes.

**Acceptance Scenarios**:

1. **Given** the `StudentMultiSelector` component is imported, **When** rendered with student search props, **Then** it displays search results and selected chips matching the design
2. **Given** the component is used outside team registration, **When** the fee input is not needed, **Then** it can be hidden via a prop

---

### Edge Cases

- What happens when a student selected for the team is already in another team for the same competition? The API returns 409 — the UI should show a conflict error.
- What happens when the search returns no results? Show "No students found matching '...'" message.
- What happens when the search API fails? Show a retry option or error message.
- How does the selector handle inactive/waitlisted students? They should appear in results but be visually distinguished (greyed out or with status badge).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a searchable student selector that queries the existing `searchStudents` API (`GET /crm/students?q=...`) and displays results with name, phone, and status
- **FR-002**: System MUST support multi-selection — admins can select multiple students from search results
- **FR-003**: System MUST display selected students as removable chips/pills with the student's full name
- **FR-004**: System MUST provide an optional per-student fee input for each selected student
- **FR-005**: System MUST prevent team registration submission when no students are selected
- **FR-006**: System MUST send the correct `student_ids` array and `student_fees` map to the `POST /teams` endpoint
- **FR-007**: System MUST display 409 conflict errors when a selected student is already in another team for this competition
- **FR-008**: System MUST be implemented as a reusable component (`StudentMultiSelector`) that can be used outside team registration
- **FR-009**: System MUST reuse the existing `SpyCombobox` infrastructure and `searchStudents` API function
- **FR-010**: System MUST show inactive/waitlisted students in search results with appropriate visual distinction

### Key Entities

- **Student Selection**: A selected student with `id`, `full_name`, `phone`, `status`, and optional `fee` override
- **Search Results**: Paginated list of `StudentListItem` from `GET /crm/students?q=...`

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can find and select a student by name in under 5 seconds (2+ char search, click result)
- **SC-002**: Zero references to manual student ID text inputs remain in the team registration modal
- **SC-003**: The `StudentMultiSelector` component is imported and used in at least one location outside `TeamRegistrationModal` within 2 future features
- **SC-004**: Team registration form validates student selection before submission with clear error messaging

## Assumptions

- The existing `searchStudents` API (`GET /crm/students?q=...`) returns sufficient data (id, full_name, phone, status) for the selector
- The existing `SpyCombobox` component can be extended or adapted for multi-select behavior
- No backend changes are needed — the `POST /teams` endpoint already accepts `student_ids` as an array of integers
- The `StudentCombobox` single-select component serves as a reference for styling and interaction patterns
- Inactive/waitlisted students should be selectable but visually distinguished (not blocked)
