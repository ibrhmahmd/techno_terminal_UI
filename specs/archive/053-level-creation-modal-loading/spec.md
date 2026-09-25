# Feature Specification: Level Creation Loading UX

**Feature Branch**: `053-level-creation-modal-loading`  
**Created**: 2026-07-02  
**Status**: Draft  
**Input**: User description: "focusing on the level creation modal and ui ux cause we have some problems there when the use clicks to create a level there are no loading of any types whoch make the user clicks more than once we neeed to invistigate deep and lets see put recommended solutions"

## Clarifications

### Session 2026-07-02
- Q: How should the form input fields behave in the Progress Level Dialog while the level progression is in progress? → A: Option A (Disable all form input fields, dropdown selectors, checkboxes, and toggles in addition to the Action buttons (Cancel/Confirm)).
- Q: If the level progression request fails, what should be the behavior of the modal and form controls? → A: Option A (Keep the modal open, re-enable all form inputs, select dropdowns, and action buttons, keeping previous user inputs intact so they can rectify mistakes and retry).
- Q: Disclaimer message on level creation → Added requirement for a dynamic summary callout box in the dialog describing exactly what records/actions will be created.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Progress Level Modal Loading UX (Priority: P1)

As a user, when I fill in the level progression form and click "Confirm Progression", I want to see visual feedback that the operation is running, and I want the submit/cancel buttons to be disabled to prevent duplicate submissions.

**Why this priority**: Crucial P1 to avoid multiple concurrent API requests that cause race conditions, duplicate database entries, or client/server sync errors when creating new levels.

**Independent Test**:
- Open the Progress Level modal for a group.
- Fill out the required fields.
- Click "Confirm Progression".
- Verify that the confirm button displays a loading spinner and is disabled.
- Verify that the cancel button is disabled.
- Verify that clicking the background overlay does not close the modal during loading.
- Verify that all inputs, selects, and checkboxes in the form are disabled.
- Verify the presence of the dynamic progression summary/disclaimer box explaining exactly what this action will do.

**Acceptance Scenarios**:
1. **Given** the Level Progression modal is open and form is valid, **When** I click "Confirm Progression", **Then** the button text changes/shows a loading spinner, all buttons/form inputs/dropdowns are disabled, and background click is ignored.
2. **Given** the Level Progression mutation completes successfully, **When** the page receives the success response, **Then** the toast notification is shown and the modal closes automatically.
3. **Given** the Level Progression mutation fails, **When** the request returns an error, **Then** a toast notification displays the error, the modal remains open, and all form controls and action buttons are re-enabled with previous entries preserved.
4. **Given** the Level Progression modal is open, **When** I modify form settings (e.g. toggle "complete current level" or "auto-migrate enrollments"), **Then** the summary disclaimer text updates dynamically to show the updated scope of the progression.

---

### User Story 2 - Group Info Card Level Up Button Loading UX (Priority: P1)

As a user, when I click the "Level Up" button in the group info header, I want the button to display a loading state and disable itself, so that I cannot submit multiple requests.

**Why this priority**: Prevent accidental double-clicking on the main "Level Up" action, which triggers the automated progression API.

**Independent Test**:
- Navigate to a group detail page.
- Locate the "Level Up" button in the header.
- Click "Level Up".
- Verify the button is disabled and shows loading feedback until the query invalidates.

**Acceptance Scenarios**:
1. **Given** the group is eligible for level up, **When** I click "Level Up", **Then** the button becomes disabled and shows a spinner/loading indicator.

---

### Edge Cases

- **Mutation Failure**: If the progression mutation fails, the dialog stays open, displays the error via a Toast notification, re-enables all controls, and preserves form values for correction and retry.
- **Concurrent Notes Save**: If notes auto-save is in progress when the progression modal opens or submits, the level progression mutation should execute independently without blockages.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST disable the "Confirm Progression" button, Cancel actions, and all form input fields, selectors, checkboxes, and toggles in the `ProgressLevelDialog` when the progression mutation is pending.
- **FR-002**: The `ProgressLevelDialog` MUST show a `LoadingSpinner` inside the confirm button when loading.
- **FR-003**: The `useGroupMutations` hook MUST expose individual pending flags `isCreateLevelPending` and `isLevelUpPending` (in addition to the aggregate `status === 'loading'`) so pages/components can check specific operation states.
- **FR-004**: The "Level Up" button in `GroupInfoCard` MUST be disabled and show loading state when the level up mutation is pending.
- **FR-005**: All background overlay clicks and keyboard escape handlers on `ProgressLevelDialog` MUST be disabled while the progression mutation is pending.
- **FR-006**: On progression mutation failure, the `ProgressLevelDialog` MUST remain open, re-enable all inputs and action buttons, and preserve previous user inputs for editing and retry.
- **FR-007**: The `ProgressLevelDialog` MUST display a dynamic disclaimer / action summary callout summarizing what objects will be created or modified (e.g. creating level X, marking current level complete, migrating active enrollments, and scheduling new sessions starting on date Y).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Action buttons are disabled within 16ms of click.
- **SC-002**: Zero duplicate level creation requests are sent to the backend.
- **SC-003**: The loading indicator is visible during the entire duration of the level creation network request.

---

## Assumptions

- We reuse React Query's `isPending` state from `createLevelMutation` and `levelUpMutation` inside the `useGroupMutations` hook.
- No database migrations or API modifications are required; the issue is entirely on the client-side state handling and UI feedback.
