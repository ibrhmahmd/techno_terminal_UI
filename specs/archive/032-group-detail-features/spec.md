# Feature Specification: Group Detail Page — Feature Completions

**Feature Branch**: `032-group-detail-features`  
**Created**: 2026-06-03  
**Status**: Draft  
**Input**: User description: "Complete missing features on the Group Detail page: history tab (consume backend analytics), session management (add/delete per level), student actions (view navigation, transfer), and level number edit as 'coming soon'."

---

## Background

The Group Detail page (`/groups/:id`) currently exposes five tabs: Attendance, Levels, Students, Payments, and History. Analysis of the current codebase against available backend APIs reveals four gaps:

1. **History tab** — rendered as a placeholder stub; backend provides enrollment-history and instructor-history analytics endpoints that are unused.
2. **Session management** — backend has full add/delete/cancel/reactivate session endpoints; no UI surfaces them in the Levels tab.
3. **Student actions** — "View" and "Edit" buttons in the Students tab show toast messages instead of navigating or acting; Transfer endpoint exists and is unused.
4. **Level number edit** — backend field exists but is architecturally risky; to be marked "coming soon" in the UI.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Group History Tab (Priority: P1)

An admin opens a group's detail page and clicks the **History** tab to understand how the group has evolved: which students have passed through it (with their enrollment and payment status) and which instructors have taught it.

**Why this priority**: The History tab is already present in the navigation and currently shows nothing useful. This is a visible regression and the backend data is fully ready.

**Independent Test**: Navigate to any group → click History → two sections appear: "Enrollment History" (student list with payment columns) and "Instructor History" (instructor timeline). Verifiable end-to-end with existing backend data.

**Acceptance Scenarios**:

1. **Given** a group with past and current enrollments, **When** the admin opens the History tab, **Then** a list of all enrollments (active, completed, dropped) is displayed with: student name, phone, level number at enrollment, enrollment date, status badge, and payment balance.
2. **Given** a group that has had multiple instructors across levels, **When** the admin views the History tab, **Then** an instructor history section lists each instructor with: name, levels taught, first-assigned date, last-assigned date, and a "Current" badge for the active instructor.
3. **Given** a group with more than 100 enrollments, **When** the History tab loads, **Then** results are paginated or filtered by status (active / completed / dropped) without blocking the page.
4. **Given** the History tab is not the active tab, **When** the user switches away, **Then** the data is cached and the tab does not re-fetch on switch-back within 5 minutes.

---

### User Story 2 — Session Management in Levels Tab (Priority: P2)

An admin opens a group's Levels tab, expands a level, and sees the list of scheduled sessions for that level. From there they can add an extra session (specifying a date and optional note) or delete an existing session after confirmation.

**Why this priority**: Admins need to manage scheduling exceptions (cancelled/added sessions) directly from the group context without leaving the page.

**Independent Test**: Open Levels tab → expand any level → session list appears with dates and status → "Add Session" button opens a date-picker form → submit creates session → it appears in the list immediately. Separately, clicking delete on a session and confirming removes it.

**Acceptance Scenarios**:

1. **Given** a level card is expanded in the Levels tab, **When** the view renders, **Then** a list of all sessions for that level is shown, each row displaying: session number, date, status (scheduled / cancelled / completed), and action buttons (cancel, reactivate, delete).
2. **Given** an admin clicks "Add Session" on a level, **When** they fill in the extra-session date and submit, **Then** a new session is created for that level and appears in the session list without a full page reload.
3. **Given** an admin clicks "Delete" on a session, **When** they confirm the action, **Then** the session is permanently removed and the session list updates.
4. **Given** an admin clicks "Cancel" on a scheduled session, **When** they confirm, **Then** the session status changes to "Cancelled" (reversible).
5. **Given** a cancelled session exists, **When** the admin clicks "Reactivate", **Then** the session returns to "Scheduled" status.
6. **Given** a session with attendance records exists, **When** the admin attempts to delete it, **Then** the system prevents deletion and displays an appropriate error message.

---

### User Story 3 — Student Actions: Navigate & Transfer (Priority: P2)

An admin viewing the Students tab can click a student row to navigate to their profile page, or use a "Transfer" action to move the student to a different group via an inline dialog.

**Why this priority**: The current "View" and "Edit" actions are non-functional stubs — clicking them shows a toast notification instead of performing any action. This is a usability regression.

**Independent Test**: In Students tab, clicking a student row navigates to `/students/{student_id}`. Clicking "Transfer" opens a group-selector dialog; selecting a target group and confirming calls the transfer endpoint and the student's row updates to reflect the transferred status.

**Acceptance Scenarios**:

1. **Given** the Students tab shows a list of enrolled students, **When** the admin clicks the "View" action on a student row, **Then** the browser navigates to that student's profile page (`/students/{student_id}`).
2. **Given** the admin clicks "Transfer" on an active enrollment, **When** the transfer dialog opens, **Then** it shows a searchable group combobox (existing `GroupCombobox` component) listing only active groups.
3. **Given** the admin selects a target group in the transfer dialog and confirms, **When** the transfer is submitted, **Then** the enrollment status updates to "transferred", the student disappears from the current level's list, and a success notification is shown.
4. **Given** the admin selects a target group that is at capacity, **When** the transfer is submitted, **Then** the transfer is still allowed (backend allows oversubscription with a warning) and an informational warning banner is shown.
5. **Given** the admin tries to transfer a student to the same group they are currently in, **When** they attempt to confirm, **Then** the confirm button is disabled and a validation message explains the issue.
6. **Given** the transfer succeeds, **When** the dialog closes, **Then** the Students tab list refreshes automatically to reflect the removed enrollment.

---

### User Story 4 — Level Number Edit "Coming Soon" (Priority: P3)

An admin sees a "Edit Level Number" option in the Levels tab that is visually present but displays a "Coming Soon" tooltip/badge when interacted with, signalling that the feature is planned but not yet available.

**Why this priority**: This prevents future confusion ("where is this feature?") without introducing the complexity and risk of a cascading level-renumber operation. It serves as a roadmap placeholder.

**Independent Test**: Levels tab → expand a level → "Edit Number" button is visible, disabled, and shows a tooltip reading "Coming soon — level renumbering requires a database migration".

**Acceptance Scenarios**:

1. **Given** the admin expands a level in the Levels tab, **When** they see the level header, **Then** an "Edit Level Number" control is visible with a "Coming Soon" visual indicator (badge, tooltip, or disabled state).
2. **Given** the "Edit Level Number" control is present, **When** the admin attempts to interact with it (click, hover, keyboard focus), **Then** a tooltip or inline message explains that the feature is not yet available.
3. **Given** the control is disabled, **When** the admin navigates the page, **Then** the control does not interfere with keyboard or screen-reader navigation.

---

### Edge Cases

- What happens when a group has zero sessions in a level? → "No sessions" empty state with "Add Session" button still available.
- What happens when the History tab loads but there are no enrollments? → Empty state message "No enrollment history for this group."
- What happens when the History tab loads but there are no instructor records? → Instructor section shows "No instructor history available."
- What happens when a student in the transfer dialog search returns 0 groups? → "No active groups found" message with a link to the Groups page.
- What happens if the add-session API call fails (e.g., date conflict)? → Inline error in the dialog, dialog stays open, no partial state committed.
- What happens when deleting the last session in a level? → Deletion is allowed; level shows empty session list with "No sessions" state.

---

## Requirements *(mandatory)*

### Functional Requirements

**History Tab**

- **FR-001**: The History tab MUST fetch and display all enrollment records for the group via `GET /groups/{id}/enrollment-history` when the tab is first activated.
- **FR-002**: Each enrollment row MUST display: student name, phone number, level number at enrollment, enrollment date, status (active / completed / dropped / transferred), and payment balance.
- **FR-003**: Enrollment records MUST be filterable by status (all / active / completed / dropped) via a segmented control or dropdown, with filtering applied client-side after the initial fetch.
- **FR-004**: The History tab MUST fetch and display instructor assignment history via `GET /groups/{id}/instructor-history`.
- **FR-005**: Each instructor row MUST display: instructor name, levels taught count, first-assigned date, last-assigned date, and a "Current" badge if `is_current === true`.
- **FR-006**: Both history datasets MUST only be fetched when the History tab is active (lazy loading), and cached for at least 5 minutes to prevent redundant calls on tab switches.

**Session Management**

- **FR-007**: When a level card is expanded in the Levels tab, the system MUST display the full session list for that level including: session number, date, time, and status.
- **FR-008**: Each session row MUST provide action controls: "Delete" (for all sessions) and "Cancel" / "Reactivate" (based on current status).
- **FR-009**: An "Add Session" button MUST be visible on each expanded level, opening a dialog with a date input and an optional notes field.
- **FR-010**: Session deletions MUST require a confirmation dialog before proceeding.
- **FR-011**: After any session mutation (add, delete, cancel, reactivate), the session list MUST update automatically without a full page reload.

**Student Actions**

- **FR-012**: The "View" action on a student row MUST navigate to `/students/{student_id}`.
- **FR-013**: The "Edit" action MUST be replaced by a "Transfer" action button in the Students tab action column.
- **FR-014**: The Transfer dialog MUST use the existing `GroupCombobox` component for group selection, filtered to active groups only.
- **FR-015**: Transfer MUST require the admin to select a target group before enabling the confirm button; the source group MUST be excluded from the selectable options.
- **FR-016**: After a successful transfer, the enrollment list for the current level MUST refresh automatically.

**Level Number Edit**

- **FR-017**: An "Edit Level Number" control MUST be visible in each expanded level card in the Levels tab.
- **FR-018**: The control MUST be rendered in a disabled/non-interactive state with a visible "Coming Soon" indicator.
- **FR-019**: The control MUST NOT trigger any API calls or mutations.

### Key Entities

- **Enrollment History Item**: `enrollment_id`, `student_id`, `student_name`, `student_phone`, `level_number_at_enrollment`, `enrolled_at`, `status`, `amount_due`, `discount_applied`, `payments_made`, `balance_remaining`
- **Instructor History Item**: `instructor_id`, `instructor_name`, `is_current`, `levels_taught_count`, `first_assigned_at`, `last_assigned_at`
- **Session**: `id`, `group_id`, `level_number`, `session_number`, `session_date`, `start_time`, `end_time`, `status` (scheduled / cancelled / completed), `is_extra_session`, `notes`
- **Transfer Input**: `from_enrollment_id`, `to_group_id`

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The History tab displays meaningful data (not a placeholder) within 2 seconds of being activated on a standard connection.
- **SC-002**: Switching away from the History tab and back within 5 minutes does not trigger a second network request (cache hit).
- **SC-003**: An admin can add an extra session to a level in under 30 seconds from clicking "Add Session" to seeing the updated list.
- **SC-004**: An admin can transfer a student to another group in under 45 seconds from clicking "Transfer" to seeing the confirmation.
- **SC-005**: All session mutations (add, cancel, reactivate, delete) reflect in the UI without requiring a manual page refresh.
- **SC-006**: Clicking "View" on a student row navigates to the correct student profile page 100% of the time.
- **SC-007**: The "Coming Soon" level number control is clearly non-interactive: 0 API calls are triggered when it is clicked or focused.

---

## Assumptions

- The existing `GroupCombobox` component will be reused for the Transfer dialog group selection without modification to its API.
- The `listSessionsForGroup` API function already returns sessions for a specific level number when the `level` query parameter is passed — sessions will be filtered per level without an additional endpoint.
- Deleting a session that has attendance records will be rejected by the backend (HTTP 409); the UI will display the backend's error message verbatim.
- The Student tab currently uses `useGroupEnrollments` which returns all levels; filtering to the selected level will remain client-side to avoid additional API calls.
- Frontend-only scope: no new backend endpoints are required for any of the four features in this spec.
- The `GroupEnrollmentsResponseDTO` from `GET /groups/{id}/enrollments/all` already includes `transfer_options` (available groups for transfer); this will be used to pre-populate the transfer combobox if the search is empty.
- The History tab will not implement pagination in v1 — the backend default limit of 100 records is sufficient for typical group sizes at this academy.
