# Feature Specification: Competitions Logic Index

**Feature Branch**: `004-competitions-logic-index`  
**Created**: 2026-05-13  
**Status**: Draft  
**Input**: User description: "index all competitions-related logic — from pages through components, hooks, API logic, and cross-domain integrations"

## User Scenarios & Testing

### User Story 1 — Browse and Manage Competitions (Priority: P1)

As an admin user, I want to view a list of all competitions (active and deleted), create new ones, and soft-delete or restore them so that I can manage the competition lifecycle from a central page.

**Why this priority**: This is the primary entry point for all competition management — without listing/creating, no other competition feature is accessible.

**Independent Test**: An admin can open the competitions page, see a list of competitions, create a new one, verify it appears in the list, delete it, verify it moves to the deleted view, and restore it back.

**Acceptance Scenarios**:

1. **Given** I am on the competitions page, **When** the page loads, **Then** I see a grid of active competition cards showing name, date, location, fee, and status
2. **Given** I am on the competitions page, **When** I click the create button and fill in the required fields (name, location, fee per student), **Then** a new competition is created and appears in the grid
3. **Given** I am viewing a competition, **When** I click the delete button, **Then** the competition is soft-deleted and no longer appears in the active view
4. **Given** I switch to the deleted competitions view, **When** I click restore on a deleted competition, **Then** it reappears in the active view
5. **Given** I click the trash icon toggle, **When** the view switches, **Then** I see a DataTable of deleted competitions in place of the active competition cards

---

### User Story 2 — View Competition Details with Tabbed Sections (Priority: P1)

As an admin user, I want to open a competition and see its details organized into tabs (Overview, Categories, Teams, Summary) so that I can quickly find relevant information about a specific competition.

**Why this priority**: The detail page is the hub for all competition-specific actions — viewing stats, managing categories and teams, and reviewing financial summary.

**Independent Test**: An admin can click any competition card, see the detail page load with 4 tabs, navigate between tabs, and see the correct content for each.

**Acceptance Scenarios**:

1. **Given** I click on a competition card, **When** the detail page loads, **Then** I see the Overview tab showing competition name, date, location, edition, fee, notes, and key stats (total teams, total students, total revenue)
2. **Given** I click the Categories tab, **When** it loads, **Then** I see category cards showing name, description, age range, max team size, and number of registered teams
3. **Given** I click the Teams tab, **When** it loads, **Then** I see all registered teams across all categories
4. **Given** I click the Summary tab, **When** it loads, **Then** I see a revenue breakdown by category showing expected and collected fees
5. **Given** I am on the detail page, **When** I delete or restore the competition, **Then** the action succeeds and I am redirected back to the competitions list

---

### User Story 3 — Register Teams for Competition Categories (Priority: P2)

As an admin user, I want to register a team for a competition category by specifying team members and their roles so that students can participate in competitions.

**Why this priority**: Team registration is the core operational action within competitions — without it, competitions cannot have participants.

**Independent Test**: An admin opens a competition detail, navigates to the Categories tab, clicks "Register Team" on a category, fills in team name and members, submits, and sees the team appear in the category's team list.

**Acceptance Scenarios**:

1. **Given** I am on a category's team list, **When** I click "Register Team", **Then** a modal opens with fields for team name and member entries
2. **Given** I am filling the team registration form, **When** I add members with name, student ID, and role (leader/member), **Then** I can add multiple members up to the category's max team size
3. **Given** I submit the team registration form, **When** validation passes (team name provided, at least one member, at least one leader, within max size), **Then** the team is registered and appears in the team list
4. **Given** I submit an invalid form, **When** the team name is empty or no members are added, **Then** I see validation errors and the form is not submitted

---

### User Story 4 — Create and Edit Competitions (Priority: P2)

As an admin user, I want to create new competitions or edit existing ones through a form so that I can keep competition details up to date.

**Why this priority**: Edit/create is fundamental for maintaining accurate competition data alongside the list and detail views.

**Independent Test**: An admin opens the create form, fills in all required fields, submits, and sees the new competition in the list. Then edits the same competition, changes a field, and verifies the update.

**Acceptance Scenarios**:

1. **Given** I click the "Add Competition" button, **When** the form opens, **Then** I see fields for name, notes/description, location, date, edition, and fee per student
2. **Given** I submit the create form, **When** all required fields (name, location, fee) are filled with valid data (non-negative fee), **Then** the competition is created
3. **Given** I submit with missing required fields, **When** name or location is empty or fee is negative, **Then** I see validation errors
4. **Given** I am on the competition detail page, **When** I click edit, **Then** the form pre-fills with existing competition data and I can update fields

---

### User Story 5 — View Competition Fee Summary and Financial Data (Priority: P3)

As an admin user, I want to see a financial summary of a competition showing expected revenue and collected fees per category so that I can track competition finances.

**Why this priority**: Financial tracking provides business value but depends on teams being registered first (P2).

**Independent Test**: An admin opens a competition detail, navigates to the Summary tab, and sees per-category revenue breakdown with expected and collected amounts.

**Acceptance Scenarios**:

1. **Given** I am on the competition Summary tab, **When** the data loads, **Then** I see total teams, total students, expected revenue, and collected revenue
2. **Given** I scroll through the summary, **When** data is available, **Then** I see a per-category breakdown with each category's expected and collected fees
3. **Given** I view the summary for a competition with no teams, **When** the tab loads, **Then** I see zero values for all financial metrics

---

### User Story 6 — View Group Competition History (Priority: P3)

As an admin user, I want to see a group's competition participation history including results and scores so that I can evaluate group performance.

**Why this priority**: Cross-domain feature that adds value on top of the core competition flow, depends on teams being registered and results recorded.

**Independent Test**: An admin opens a group detail page, navigates to the History tab, and sees a table of competition records with dates, competition names, results, scores, and notes.

**Acceptance Scenarios**:

1. **Given** I am on a group detail page, **When** I view the History tab, **Then** I see a table of competition participation records
2. **Given** I have competition records, **When** the table loads, **Then** each row shows date, competition name, level, result (with status icons for winner/runner-up/participant/disqualified), score, and notes

---

### User Story 7 — View Student Competition Records (Priority: P3)

As an admin user, I want to see a student's competition history with achievements and results so that I can track individual student performance.

**Why this priority**: Student-level view enriches the student profile but the backend endpoint is not yet implemented, making this a lower priority.

**Independent Test**: An admin opens a student detail page, navigates to the Competitions tab, and sees competition records with achievement badges and color-coded results.

**Acceptance Scenarios**:

1. **Given** I am on a student detail page, **When** I view the Competitions tab, **Then** I see competition history with achievement icons (Gold/Silver/Bronze/Winner)
2. **Given** the student has achievements, **When** the tab loads, **Then** I see an achievements summary grid at the top

---

### Edge Cases

- What happens when the competition has no teams registered? — All tabs show empty states with appropriate messages
- What happens when the backend returns `null` dates or fees? — UI shows fallback values ("Not set", "$0.00") without crashing
- What happens when a deleted competition is viewed? — Detail page shows delete/restore actions, team registration is disabled
- What happens when a category reaches max team capacity? — "Register Team" button should be disabled with a capacity notice
- What happens during concurrent team registration? — Backend race condition handling; frontend shows loading state and error feedback
- What happens when the student competitions backend endpoint is not implemented? — Competitions tab shows an empty state or "Coming Soon" message

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a list of active competitions as a grid of cards showing competition name, date, location, fee, and status
- **FR-002**: System MUST allow toggling between active (card grid) and deleted (DataTable) competition views
- **FR-003**: System MUST support creating a new competition with fields: name, notes, location, date, edition, fee per student
- **FR-004**: System MUST validate that required create fields (name, location, fee) are provided and fee is non-negative
- **FR-005**: System MUST support soft-deleting a competition and restoring it
- **FR-006**: System MUST display a competition detail page with four tabs: Overview, Categories, Teams, Summary
- **FR-007**: System MUST show competition stats (total teams, students, revenue) on the Overview tab
- **FR-008**: System MUST display competition categories in a grid of cards showing name, description, age range, max team size, and registered team count
- **FR-009**: System MUST allow registering a team for a category via a modal with team name and member entries (name, student ID, role)
- **FR-010**: System MUST validate team registration: team name required, at least one member, at least one member with role "leader"
- **FR-011**: System MUST enforce category max team size limit during registration
- **FR-012**: System MUST support editing an existing competition's details via a pre-filled form
- **FR-013**: System MUST display a competition fee summary showing expected and collected revenue per category
- **FR-014**: System MUST display group competition history with participation records, results, scores, and notes
- **FR-015**: System MUST display student competition history with achievement badges and color-coded results
- **FR-016**: System MUST handle loading states (skeleton/placeholder) while data is being fetched
- **FR-017**: System MUST handle error states with user-friendly messages and retry options
- **FR-018**: System MUST support marking a competition fee as paid via the finance module
- **FR-019**: System MUST provide competition fee summary analytics across all competitions (total fees collected vs outstanding)

### Key Entities

- **Competition**: The main entity representing a contest event. Key attributes: name, location, date, edition, fee per student, status (upcoming/active/completed/cancelled), soft-delete support
- **CompetitionCategory**: A division within a competition (e.g., "Junior Math", "Senior Science"). Attributes: name, description, min/max age, max team size. Auto-generated from team registrations (no direct CRUD).
- **TeamRegistration**: A group of students registered for a specific category. Attributes: team name, category, members list with roles (leader/member).
- **TeamMember**: An individual student within a team registration. Attributes: student name, student ID, role (leader/member).
- **CompetitionParticipation (Group)**: A group's participation record in a competition. Attributes: group, competition, result type (winner/runner-up/participant/disqualified), score, notes.
- **CompetitionRecord (Student)**: A student's individual competition history record. Attributes: competition name, date, result, achievement, notes. Backend endpoint not yet implemented — current stub returns empty array.
- **UnpaidCompFeeItem**: An unpaid competition fee entry tracked in finance. Attributes: student, competition, fee amount, fee type, due date, payment status.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can complete the full competition lifecycle (create → view → register teams → view summary → delete) in a single session without errors
- **SC-002**: Competition list page loads and displays within 2 seconds for up to 50 competitions
- **SC-003**: Team registration completes in under 3 clicks (open modal → fill form → submit)
- **SC-004**: Navigation between all 4 detail tabs is instantaneous (no full page reload)
- **SC-005**: All competition pages gracefully handle null/undefined data without crashing (verified by rendering fallback text/values)
- **SC-006**: Cross-domain features (group history, student records, finance fees, analytics summary) load independently without blocking core competition functionality

## Assumptions

- Users are authenticated admins/staff — the competitions pages are behind a ProtectedRoute
- The backend API returns competition data in the format currently documented by the existing API layer
- Categories are auto-generated from team registrations — the backend does not support direct category CRUD
- The student competitions backend endpoint is not yet implemented — the frontend stub returns empty data
- Competition fees are tracked per-student (not per-team) in the finance module
- The system uses soft-delete for competitions — deleted items can be restored
- All monetary values are in a single currency (no multi-currency support needed)
- Mobile responsiveness is not in scope for v1 — the primary interface is desktop
