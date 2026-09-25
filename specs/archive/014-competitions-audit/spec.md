# Feature Specification: Competitions Feature Audit & Quality Fix

**Feature Branch**: `014-competitions-audit`  
**Created**: 2026-05-18  
**Status**: Draft  
**Input**: User description: "Audit and fix of the competitions feature across 5 user stories: (1) Fix 5 runtime bugs including null-safety in API functions, NaN guards on parseInt, and malformed API requests; (2) Remove 3 dead exports and eliminate unused props on CompetitionsTable; (3) Eliminate 6 unsafe type casts, 1 implicit any catch clause, 5 missing return type annotations, and 1 redundant default export; (4) Migrate useCompetitionFees from manual useState+useCallback to React Query, add enabled guards to useTeams/useTeamsWithMembers, centralize all inline query keys, and consolidate duplicate activityKeys factory; (5) Add ARIA roles to tab navigation, aria-hidden to 40+ Material Symbols icons, keyboard support to clickable divs, Escape key handler to Modal, role="dialog"/aria-modal to Modal, and error boundaries to tab panels. All changes are frontend-only."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reliable Competition Data Loading (Priority: P1)

As a user browsing competitions, I can view competition details, teams, and summaries without the application crashing due to unexpected API responses or invalid route parameters.

**Why this priority**: This is the foundational read-only flow. If the app crashes on null responses or malformed IDs, no other feature works. Every user depends on stable data loading.

**Independent Test**: Can be fully tested by navigating to `/competitions`, selecting a competition, and verifying all data renders without crashes even when API returns edge-case responses (null data, missing fields).

**Acceptance Scenarios**:

1. **Given** a competition exists, **When** the API returns valid data, **Then** the competition detail page loads with all fields displayed correctly
2. **Given** a competition ID in the URL is invalid (non-numeric), **When** the page loads, **Then** the system shows a user-friendly error instead of crashing or sending malformed API requests
3. **Given** the API returns a response with null data, **When** the page attempts to render, **Then** the system handles it gracefully with an error message instead of a white-screen crash
4. **Given** a competition has no teams registered, **When** viewing the summary, **Then** the page shows zero counts without errors

---

### User Story 2 - Accessible Competition Navigation (Priority: P2)

As a keyboard-only or screen reader user, I can navigate between competition tabs, view team details, and interact with all controls using only keyboard input and assistive technology.

**Why this priority**: Accessibility is a compliance requirement and affects a significant portion of users. Tab navigation and clickable elements are core to the competition detail experience.

**Independent Test**: Can be fully tested by navigating the competition detail page using only Tab, Enter, Space, and Escape keys, and verifying screen reader announcements match visual content.

**Acceptance Scenarios**:

1. **Given** I am on a competition detail page, **When** I press Tab, **Then** focus moves logically between tabs, buttons, and interactive elements with visible focus indicators
2. **Given** I am viewing competition tabs, **When** I press Enter or Space on a tab, **Then** the corresponding panel activates and is announced by screen readers
3. **Given** a modal dialog is open, **When** I press Escape, **Then** the dialog closes and focus returns to the element that opened it
4. **Given** I use a screen reader, **When** I navigate to icon elements, **Then** decorative icons are skipped and meaningful icons have appropriate labels
5. **Given** I am on a clickable team card, **When** I press Enter, **Then** I navigate to the team detail page

---

### User Story 3 - Stable Team Registration Flow (Priority: P3)

As an admin registering a team, I can complete the registration form without type errors, validation failures, or unexpected behavior caused by unsafe type handling.

**Why this priority**: Team registration is a core admin workflow. Type safety issues can cause silent data corruption or confusing validation errors that block admins from completing their work.

**Independent Test**: Can be fully tested by registering a team through the UI with various inputs (valid, edge-case, invalid) and verifying correct behavior at each step.

**Acceptance Scenarios**:

1. **Given** an admin fills the team registration form, **When** they submit with valid data, **Then** the team is created and appears in the competition
2. **Given** an admin submits with missing required fields, **When** validation runs, **Then** clear error messages indicate exactly what needs to be fixed
3. **Given** an API error occurs during registration, **When** the error is caught, **Then** a user-friendly message is displayed instead of a generic failure notice

---

### User Story 4 - Consistent Code Quality & Maintainability (Priority: P4)

As a developer working on the competitions feature, I can rely on consistent patterns for data fetching, type safety, and code organization without dead code or duplicated logic confusing the codebase.

**Why this priority**: While not user-facing, code quality directly impacts development velocity, bug rates, and onboarding time for new team members.

**Independent Test**: Can be verified by running lint, type-check, and build commands with zero errors, and confirming no dead exports or duplicated implementations exist.

**Acceptance Scenarios**:

1. **Given** the codebase is audited, **When** automated quality checks run, **Then** zero errors and zero warnings remain in competition-related files
2. **Given** a developer searches for a hook, **When** they find it in a module export, **Then** it is actually used by at least one consumer
3. **Given** a query is defined, **When** its cache key is inspected, **Then** it uses the centralized key factory instead of inline definitions

---

### Edge Cases

- What happens when the API returns a 401 (expired token) during a payment flow? The token refresh interceptor should retry the request transparently.
- How does the system handle a competition with an extremely long name or description? UI should truncate gracefully without layout breakage.
- What happens when a user navigates directly to `/competitions/abc` (non-numeric ID)? Should show a clear error, not crash.
- How does the app handle rapid tab switching while data is still loading? Should cancel stale requests and show the latest panel.
- What happens when a screen reader user encounters a modal with no focus trap? Focus should be contained within the dialog.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST handle null or missing API response data gracefully without crashing the application
- **FR-002**: System MUST validate route parameters (competition IDs, team IDs) before making API requests and show user-friendly errors for invalid values
- **FR-003**: System MUST prevent malformed API requests (e.g., sending `competition_id: 0` or `NaN`) when route parameters are invalid
- **FR-004**: System MUST provide keyboard navigation for all interactive elements including tabs, cards, modals, and buttons
- **FR-005**: System MUST announce tab panel changes to screen readers using proper ARIA roles and attributes
- **FR-006**: System MUST close modal dialogs when the user presses the Escape key and return focus to the triggering element
- **FR-007**: System MUST hide decorative icons from screen readers while preserving meaningful icon labels
- **FR-008**: System MUST use the project's standard data fetching library for all server state (no manual fetch patterns that bypass caching and deduplication)
- **FR-009**: System MUST use the centralized cache key factory for all cached queries (no inline key definitions that risk cache collisions)
- **FR-010**: System MUST include enabled guards on queries that depend on optional or potentially invalid IDs
- **FR-011**: System MUST use strict error typing in all error handling code (no implicit any types in catch clauses)
- **FR-012**: System MUST export only components, hooks, and types that are actually consumed by other modules
- **FR-013**: System MUST display consistent date formatting across all competition-related views
- **FR-014**: System MUST isolate tab panel errors so that a failure in one panel does not break the entire page
- **FR-015**: System MUST provide loading state announcements for screen readers when data is being fetched

### Key Entities

- **Competition**: A contest/event with name, edition, date, location, notes, and default fee per student. Contains categories and teams.
- **Team**: A group of students registered for a specific competition, with category, optional subcategory, project details, and placement results.
- **Category**: A classification label for teams within a competition (e.g., "Robotics", "Programming"), with optional subcategories.
- **Team Member**: A student's membership in a team, tracking fees owed and payments made.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero runtime crashes from null API responses or invalid route parameters across all competitions and teams pages
- **SC-002**: All interactive elements (tabs, cards, modals, buttons) are navigable using only keyboard (Tab, Enter, Space, Escape)
- **SC-003**: Screen readers correctly announce tab panel changes, modal dialogs, and meaningful content while skipping decorative icons
- **SC-004**: All automated code quality checks pass with zero errors and zero warnings in competition-related files
- **SC-005**: Build process completes with zero type-checking errors across all competition-related files
- **SC-006**: Zero unsafe type usages or implicit any types in competition-related code
- **SC-007**: All data fetching uses the project's standard caching library — zero manual fetch patterns remain
- **SC-008**: Zero unused exports in competition-related module index files
- **SC-009**: Modal dialogs close on Escape key press and return focus to the triggering element
- **SC-010**: Consistent date formatting across all competition views (no mixed formatting approaches)

## Assumptions

- All changes are frontend-only — no backend API modifications are required
- The existing authentication and role-based access control remains unchanged
- The existing React Query cache invalidation patterns will be reused
- The route structure (`/competitions`, `/competitions/:id`, `/teams/:id`) remains unchanged
- The Modal component is shared across the application, so accessibility fixes benefit all features using it
- TableActions component is shared across the application, so icon accessibility fixes benefit all table views
- Browser support targets modern Chrome, Firefox, Safari, and Edge (no IE11 or legacy browser support needed)
- The audit findings from the 5-phase analysis accurately represent the current state of the codebase
