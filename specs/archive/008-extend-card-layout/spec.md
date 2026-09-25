# Feature Specification: Courses & Competitions Card Layout

**Feature Branch**: `008-extend-card-layout`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "Apply the cards pattern in the courses page and the competition page, identify potential bugs and errors, plan to remove duplicated/dead code"

## User Scenarios & Testing

### User Story 1 — Browse Courses as Cards (Priority: P1)

A staff member visits the Courses page and can now switch between a table view and a visual card view using a toggle. Each course card shows the course name, category, price per level, sessions per level, and active status — following the same card pattern as the Groups page.

**Why this priority**: Card browsing is the primary ask — provides immediate visual improvement and consistency with the Groups page pattern.

**Independent Test**: Load the Courses page. Click the "Cards" toggle — verify courses render as cards with name, category, price per level, sessions per level, and active status. Click "Table" toggle — verify table view still works. Verify responsive layout by resizing browser.

**Acceptance Scenarios**:

1. **Given** the user is on the Courses page, **When** they click the cards toggle, **Then** the view switches from a table to a responsive card grid showing all courses.
2. **Given** the user is in card view, **When** they search for a course by name, **Then** the card grid filters to show only matching courses.
3. **Given** the user is in card view, **When** they click a course card's View button, **Then** they navigate to the course detail page.
4. **Given** the user is in card view, **When** they click a course card's Edit or Delete button, **Then** the edit modal or delete confirmation dialog opens respectively.

---

### User Story 2 — Browse Competitions with Table/Card Toggle (Priority: P1)

A staff member visits the Competitions page and can switch between the existing card grid and a new table view. The page currently only shows cards; adding a table view improves scannability for dense competition data.

**Why this priority**: Completes the consistency pattern across all three pages (Groups, Courses, Competitions) with a uniform table/cards toggle.

**Independent Test**: Load the Competitions page. Click the "Table" toggle — verify competitions render as a table with name, location, date, edition, fee, and status. Click "Cards" toggle — verify original card grid view still works.

**Acceptance Scenarios**:

1. **Given** the user is on the Competitions page, **When** they click the "Table" toggle, **Then** the view switches from card grid to a table showing all active competitions.
2. **Given** the user is in table view, **When** they toggle to the deleted competitions view, **Then** the table shows deleted competitions (replacing the current card-only deleted view).
3. **Given** the user is in card view, **When** they click a competition card, **Then** they navigate to the competition detail page (existing behavior preserved).

---

### User Story 3 — Audit and Clean Up Bugs, Dead Code, and Deprecated Patterns (Priority: P2)

During implementation of the card layouts, the Courses and Competitions pages are audited for bugs, dead code, deprecated patterns, and inconsistencies. Issues found are fixed to improve code quality.

**Why this priority**: Clean code prevents future bugs and reduces maintenance cost. P2 because the audit piggybacks on the card layout work.

**Independent Test**: Run the build and lint — verify zero new errors. Verify table view on Courses page still works. Verify card view on Competitions page still works. Verify all CRUD operations on both pages still work.

**Acceptance Scenarios**:

1. **Given** the codebase, **When** audited for dead code, **Then** unused imports, unused variables, and dead functions are removed.
2. **Given** the codebase, **When** audited for deprecated patterns, **Then** stateful (useState/useEffect) data fetching patterns in competition hooks are migrated to React Query where feasible.
3. **Given** the Competitions page, **When** the restore modal is opened on a deleted competition, **Then** clicking "Restore" actually restores the competition instead of just closing the modal.
4. **Given** newly created components, **When** they require shared types, **Then** barrel export files (index.ts) exist for both courses and competitions component directories.
5. **Given** the build step, **When** it runs, **Then** it completes with zero errors.

---

### Edge Cases

- What happens when a course has no category or instructor? The card should show "Uncategorised" or "Unassigned" fallbacks.
- What happens when the courses API returns more than 50 results? Client-side pagination should handle the full dataset (fetch limit may need to be increased).
- What happens when a competition has no edition or date? The card/table should gracefully show "—" placeholder.
- How does the delete/restore flow work when switching between table and card views? State should persist across view modes.
- What happens when the view toggle is clicked while grouped/filtered data is displayed? The same data should render in the new view mode.

## Requirements

### Functional Requirements

- **FR-001**: Courses page MUST have a view toggle (table/cards) integrated into its header area, matching the Groups page pattern.
- **FR-002**: Courses page MUST render a responsive card grid when card view is active, with course name, category badge, price per level, sessions per level, and active status on each card.
- **FR-003**: Courses page card view MUST support the same actions as the table view: View (navigate to detail), Edit (open modal), Delete (confirm dialog).
- **FR-004**: Competitions page MUST have a view toggle (table/cards) to allow switching between the existing card grid and a new table view.
- **FR-005**: Competitions table view MUST show competition name, location, date, edition, and fee per student; the deleted view (trash) MUST also work in table mode.
- **FR-006**: Competitions page deleted view MUST work in both table and card modes.
- **FR-007**: Unused imports and dead code MUST be removed from CoursesPage, CompetitionsPage, CompetitionForm, and CategoryList components.
- **FR-008**: Debug `console.log` statements in CompetitionForm MUST be removed.
- **FR-009**: Barrel export files (`index.ts`) MUST exist for both `src/components/courses/` and `src/components/competitions/` directories.
- **FR-010**: The restore modal in CompetitionDetailPage MUST actually call the restore API when confirmed.

### Key Entities

- **Course**: Represents a course offering with name, category, price per level, sessions per level, and active status. Used in both table and card views.
- **Competition**: Represents a competition event with name, location, date, edition, fee per student, and soft-delete status. Already has a card component; needs table view.
- **View mode toggle**: A control allowing users to switch between table and card views on both pages.
- **Course card**: A new visual card representing a single course with name, category, pricing, and status.
- **Competition table columns**: A column definition set for rendering competitions in table format.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can switch between table and card views on both Courses and Competitions pages in under 1 second (no full page reload).
- **SC-002**: All CRUD operations (create, view, edit, delete) work identically in both table and card views on both pages.
- **SC-003**: Zero new lint errors or warnings introduced by the changes.
- **SC-004**: The project build completes with zero errors before merging.
- **SC-005**: All identified dead code, unused imports, and debug console.log statements are removed (verified by code review).
- **SC-006**: The restore functionality on CompetitionDetailPage works correctly — clicking "Restore" restores the competition.

## Assumptions

- The existing view toggle and card grid components from the Groups page can be reused for both Courses and Competitions.
- The Courses page will support both table and card views, mirroring the Groups page approach.
- The Competitions page already renders a card grid; only a table view and toggle need to be added.
- All field data for cards already exists in the current API responses — no backend changes are needed.
- Action buttons on cards (View, Edit, Delete) follow the same pattern used on Groups page cards.
- Status badges for courses use the same active/inactive colored badge pattern as other pages.
