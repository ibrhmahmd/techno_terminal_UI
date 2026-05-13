# Feature Specification: Redesign Employee Cards & Detail Dialog

**Feature Branch**: `003-redesign-employee-cards`
**Created**: 2026-05-12
**Status**: Draft
**Input**: User description: "redesign the employees cards for a better UX, currently the cards does not show all the employee info and the employee info dialoge too"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Card Shows Richer Employee Summary (Priority: P1)

A staff admin browses the employee list and can see key contact information (phone, email) directly on each card without needing to open a detail view, reducing the number of clicks needed to find basic info.

**Why this priority**: The card is the primary browsing interface. Showing contact info directly on cards eliminates unnecessary drilling into detail dialogs for common lookups, directly addressing the core complaint that "cards don't show all employee info."

**Independent Test**: Can be tested by loading the staff page and verifying that each employee card displays phone number and email address alongside the existing name, job title, employment type, and status.

**Acceptance Scenarios**:

1. **Given** the employee list has loaded, **When** viewing any employee card, **Then** the card displays: full name, job title, employment type, status (active/inactive), phone number, and email address
2. **Given** an employee has no phone number, **When** viewing their card, **Then** the phone field is gracefully hidden or shows a placeholder
3. **Given** an employee has no email address, **When** viewing their card, **Then** the email field is gracefully hidden or shows a placeholder
4. **Given** the employee list is loading, **When** cards are still being fetched, **Then** each card shows a skeleton/placeholder state matching the card dimensions

---

### User Story 2 - Detail Dialog Shows Complete Employee Profile (Priority: P1)

A staff admin opens an employee detail dialog and sees all available information about that employee, including national ID, in a well-organized layout without scrolling endlessly.

**Why this priority**: The detail dialog is the canonical view of an employee's full record. Missing fields (like national_id) mean users cannot find complete information about any employee, which is the second part of the user's complaint.

**Independent Test**: Can be tested by clicking any employee card to open the detail dialog and verifying all available fields are displayed: name, phone, email, national ID, job title, employment type, status, and hire date.

**Acceptance Scenarios**:

1. **Given** the detail dialog is opened for an employee, **When** viewing the dialog, **Then** all EmployeePublic fields are displayed: full_name, phone, email, national_id, job_title, employment_type, is_active, hired_at, id
2. **Given** the employee has no national_id on file, **When** viewing the detail dialog, **Then** the national_id field is shown as "Not provided" or omitted gracefully
3. **Given** the detail data is still loading, **When** the dialog is open, **Then** a loading skeleton is shown inside the dialog
4. **Given** the detail fetch fails (network error), **When** the dialog is open, **Then** an error state is shown with a retry button

---

### User Story 3 - Edit Form Pre-fills From Full Employee Data (Priority: P2)

A staff admin edits an existing employee and all previously saved fields (phone, email, national ID, university, major, salary, etc.) are pre-populated, preventing data loss on edit.

**Why this priority**: Currently editing an employee resets most fields to blank because the form is populated from the sparse list data. This can cause accidental data loss and admin frustration. This is P2 because the primary complaint is about viewing, not editing.

**Independent Test**: Can be tested by opening the edit form for an employee who has previously saved values for phone, email, national_id, university, major, etc., and verifying all fields are pre-populated.

**Acceptance Scenarios**:

1. **Given** the edit form is opened, **When** the employee detail fetch returns full data, **Then** all fields match the fetched values: phone, email, national_id, university, major, is_graduate, monthly_salary, contract_percentage
2. **Given** the edit form is opened and the full detail fetch is still loading, **When** viewing the form, **Then** fields show a loading state (skeleton inputs)
3. **Given** the edit form is opened and the full detail fetch fails, **When** viewing the form, **Then** an error message is shown with a retry option

---

### Edge Cases

- What happens when an employee has no phone or email? → Field is shown as "Not provided" or the label is hidden rather than showing blank/empty
- What happens when national_id is sensitive data? → Should be visible only in the detail dialog, not on the card (card should not show national_id)
- What happens when the API doesn't return newly added fields? → The UI should gracefully degrade (hide missing fields, show loading for pending data)
- What happens during slow network? → Every viewport shows appropriate skeleton/loading states
- What happens when the employee list endpoint cannot be extended? → The card can optionally fetch individual details, but a more robust solution is extending the list endpoint

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Employee cards MUST display phone number and email address in addition to current fields (name, job title, employment type, status)
- **FR-002**: The employee list endpoint (`GET /hr/employees`) MUST return `phone` and `email` fields for each employee
- **FR-003**: Employee detail dialog MUST display ALL fields returned by the detail endpoint (`GET /hr/employees/:id`), including `national_id`
- **FR-004**: Employee detail dialog MUST organize fields into logical visual groups (e.g. Personal Info, Employment Details) for scannability
- **FR-005**: The edit form (`EmployeeForm`) MUST fetch full employee detail before rendering, rather than relying on the sparse list data
- **FR-006**: The edit form MUST show loading states while full employee detail is being fetched
- **FR-007**: The edit form MUST show an error state with retry if the detail fetch fails
- **FR-008**: Cards MUST show a skeleton/placeholder state while list data is loading
- **FR-009**: Detail dialog MUST show a skeleton/placeholder state while detail data is loading
- **FR-010**: Detail dialog MUST show an error state with retry button if the detail fetch fails
- **FR-011**: Sensitive fields (national_id) MUST NOT appear on card summaries — they belong in the detail dialog only
- **FR-012**: Missing optional fields (phone, email, national_id) MUST be handled gracefully — either hidden or shown as "Not provided"
- **FR-013**: The employee detail endpoint MUST return additional fields stored during employee creation (university, major, is_graduate, monthly_salary, contract_percentage) so the detail dialog and edit form can display them

### Key Entities *(include if feature involves data)*

- **EmployeeCard**: Visual card component in the employee list that displays a summary of employee information. Each card shows: full_name, job_title, employment_type, is_active (as status badge), phone, email.
- **EmployeeDetailModal**: Modal/dialog showing the complete employee profile accessed by clicking a card. Shows all EmployeePublic fields organized into labeled sections.
- **EmployeeListItem**: Data contract for the list endpoint (`GET /hr/employees`). Currently returns id, full_name, job_title, employment_type, is_active. Must be extended to include phone and email.
- **EmployeePublic**: Data contract for the detail endpoint (`GET /hr/employees/:id`). Currently returns id, full_name, phone, email, national_id, job_title, employment_type, is_active, hired_at. Must be extended to include university, major, is_graduate, monthly_salary, contract_percentage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Employees' phone numbers and email addresses are visible on cards without any additional clicks — users no longer need to open detail dialogs for basic contact lookups
- **SC-002**: The employee detail dialog displays every field returned by the backend, including national_id — no EmployeePublic field is left unrendered
- **SC-003**: Editing an employee preserves all previously saved values — no field resets to blank on edit
- **SC-004**: All loading states (list, detail, edit form) show skeleton/placeholder UIs — no blank white boxes or layout shifts
- **SC-005**: All error states (list, detail, edit form) show a clear message with a retry action — no silent failures or unhelpful error text
- **SC-006**: Cards display gracefully with no layout distortion when optional fields (phone, email) are missing

## Assumptions

- **The list endpoint can be extended**: The backend `GET /hr/employees` endpoint or the frontend adapter (`fetchEmployeesPaginated`) can be modified to return `phone` and `email` in addition to existing fields.
- **EmployeePublic is the canonical detail schema**: All fields that the backend stores for an employee that should be visible are included in `EmployeePublic`. Fields `university`, `major`, `is_graduate`, `monthly_salary`, `contract_percentage` MUST be added to `EmployeePublic` by the backend.
- **national_id is not overly sensitive**: It can be displayed in the detail dialog (locked behind authentication) but should not appear on card summaries.
- **EmployeeForm already works well for creation**: The creation flow is not broken; only the edit pre-fill is affected by sparse data.
- **Visual design evolution, not revolution**: The cards keep the same general layout and size, just with more fields added in a clean arrangement.
