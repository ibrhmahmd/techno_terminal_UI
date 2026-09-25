# Feature Specification: Directory Card UI & Pagination Fix

**Feature Branch**: `006-directory-card-ui`
**Created**: 2026-05-15
**Status**: Draft
**Input**: User description: "lets creat a spec for directory page focusing on the student listing lets review its UI because i don not see the pagination controls and lets plan to the suggestion for displaying the students in cards UI not in a table UI so lets exchanges questioins"

## User Scenarios & Testing

### User Story 1 - Browse Students via Card Layout (Priority: P1)

A staff admin views the directory and sees each student/parent displayed as a visual card showing key info (name, phone, status, age, current enrollment) with clear click targets for navigation, making it easier to scan and identify records at a glance compared to a dense table layout.

**Why this priority**: The card layout is the primary visual change and directly addresses the user's request to move away from a table UI. It's the foundation for all other directory interactions.

**Independent Test**: Can be tested by loading the directory page and verifying all tabs (Students, Parents, Waiting, Advanced) render records as individual cards instead of table rows, with each card showing name, phone, status, age, and enrollment info.

**Acceptance Scenarios**:

1. **Given** the directory page is loaded with data, **When** viewing the Students tab, **Then** each student is displayed as a card with full_name, phone, status badge, age, and current enrollment info visible
2. **Given** the directory page is loaded, **When** viewing the Parents tab, **Then** each parent is displayed as a card with full_name and phone visible
3. **Given** the directory page is loaded, **When** viewing the Waiting tab, **Then** each waiting student is displayed as a card
4. **Given** the directory page is loaded, **When** viewing the Advanced Filter tab, **Then** filtered results are displayed as cards
5. **Given** a student has no phone number, **When** viewing their card, **Then** the phone field shows a placeholder (e.g., "-") rather than blank space
6. **Given** the data is loading, **When** cards are still being fetched, **Then** skeleton/placeholder cards matching the card dimensions are shown

---

### User Story 2 - Staff Admin Navigates Pages with Working Pagination (Priority: P1)

A staff admin views a paginated directory and can clearly see pagination controls below the card grid — they know which page they're on, can navigate between pages, and understand how many total records exist. Currently with 80+ students, only the first 25 render with no pagination controls visible.

**Why this priority**: The user confirmed pagination is broken — 80+ students exist but only 25 show with no way to reach the rest. Fixing this is critical before any visual redesign.

**Independent Test**: Can be tested by loading a tab with enough records for 2+ pages and verifying pagination controls show current page, total pages, and allow navigation to subsequent pages.

**Acceptance Scenarios**:

1. **Given** a tab has more records than the current page size (e.g., 80+ students with pageSize=25), **When** viewing that tab, **Then** pagination controls are visible below the card grid
2. **Given** pagination controls are displayed, **When** viewing them, **Then** the current page number is highlighted, "Page X of Y" text is shown, and total record count is indicated
3. **Given** no pagination controls are currently visible with 80+ records, **When** the pagination bug is fixed, **Then** 4 pages of cards are navigable with first/prev/next/last buttons
4. **Given** the user clicks "Next Page", **When** the next page loads, **Then** the card grid updates to show the next set of records and page indicator updates

---

### User Story 3 - Take Action on a Card (Priority: P2)

A staff admin viewing any card can quickly access common actions (view profile, edit, move to trash/delete) directly from the card without navigating away from the directory.

**Why this priority**: Actions on records are a frequent workflow. Keeping actions accessible on the card preserves the efficiency of the current inline action buttons.

**Acceptance Scenarios**:

1. **Given** a card is displayed, **When** the user clicks "View", **Then** they are navigated to that record's detail page
2. **Given** a student card is displayed, **When** the user clicks "Edit", **Then** the edit student modal opens with the student's data pre-filled
3. **Given** a parent card is displayed, **When** the user clicks "Edit", **Then** the edit parent modal opens
4. **Given** an active card is displayed, **When** the user clicks "Delete", **Then** a confirmation dialog appears before the record is moved to trash
5. **Given** a deleted card is displayed, **When** viewing it, **Then** the card shows Restore and Permanently Delete actions instead of Edit and Delete

---

### Edge Cases

- What happens when there are 0 records? → An empty state with a clear message is shown (no cards, no pagination)
- What happens when there are fewer records than the page size? → Cards fill the available space; pagination controls are hidden since there's only one page
- What happens during slow network? → Each card slot shows a skeleton/placeholder state
- What happens on very narrow viewports (mobile)? → Cards stack in a single column with full-width layout
- What happens when a record is missing a phone number? → The field shows "-" or is gracefully hidden
- What happens when a student has no current enrollment? → The enrollment field shows "No active enrollment" or is hidden
- What happens when the pagination API returns total=0 but has items? → The bug must be identified and fixed so total accurately reflects the full record count
- What happens when switching tabs? → The card layout adapts to the data type (student vs parent) with appropriate fields

## Requirements

### Functional Requirements

#### Pagination Bug Fix (P1)
- **FR-001**: With 80+ students and pageSize=25, pagination controls MUST appear below the card grid showing 4 page buttons — the current bug where only page 1 renders without controls MUST be fixed
- **FR-002**: Pagination controls MUST show: current page highlighted, total page count, first/prev/next/last navigation buttons, and page size selector
- **FR-003**: Pagination controls MUST always display "Page X of Y" text so users know their position in the list
- **FR-004**: Pagination MUST be hidden only when there is only one or fewer pages of data

#### Card Layout (P1)
- **FR-005**: ALL tabs (Students, Parents, Waiting, Advanced Filter) MUST display records as cards instead of table rows
- **FR-006**: Each student card MUST show: full_name (prominently), phone number, status badge (Active/Waiting/Inactive), age, and current enrollment info
- **FR-007**: Each parent card MUST show: full_name (prominently) and phone number
- **FR-008**: Cards MUST have visible action buttons appropriate to the record type and context
- **FR-009**: Cards MUST be responsive — multi-column grid on wide screens, single-column stack on narrow viewports

#### Feature Parity (P1)
- **FR-010**: The AlphabetSlider navigation MUST continue to work with the card layout — clicking a letter filters visible cards to records whose name starts with that letter
- **FR-011**: The GroupBy selector (none, deleted, status, age) MUST continue to work with the card layout
- **FR-012**: Search functionality MUST continue to work with the card layout — search results display as cards
- **FR-013**: When viewing deleted records (groupBy=deleted), cards MUST show actions: View, Restore, Permanently Delete

#### States (P2)
- **FR-014**: Skeleton/placeholder cards MUST be shown while data is loading
- **FR-015**: Empty state (no records) MUST show a clear message with no cards and no pagination
- **FR-016**: When a record is missing optional fields (phone, enrollment), the card MUST gracefully hide or show a placeholder

### Key Entities

- **StudentCard**: Visual card component for a student. Displays: full_name (primary), phone, status badge, age, current enrollment info, and action buttons (view, edit, delete/restore).
- **ParentCard**: Visual card component for a parent. Displays: full_name (primary), phone, and action buttons (view, edit, delete).
- **CardGrid**: Responsive grid container that arranges cards in a multi-column layout, collapsing to single column on narrow viewports. Used across all directory tabs.
- **DirectoryPagination**: Pagination component that appears below the card grid showing page navigation controls, page size selector, and "Page X of Y" position indicator.

## Success Criteria

### Measurable Outcomes

- **SC-001**: All directory tabs (Students, Parents, Waiting, Advanced) display records as cards, not table rows — verifiable by visual inspection
- **SC-002**: Each student card displays name, phone, status, age, and current enrollment — no additional clicks needed to see this summary info
- **SC-003**: Pagination controls show "Page X of Y" and are visible with 80+ students at pageSize=25 — the existing bug is fixed
- **SC-004**: All existing directory features (search, alphabet filter, group-by, create/edit/delete actions) continue to work with the card layout — no regression in functionality
- **SC-005**: Cards render correctly across viewport widths (320px and above) — verifiable by resizing the browser
- **SC-006**: Loading states show skeleton card placeholders — no blank areas or layout shifts during data fetching

## Assumptions

- **Card layout replaces table layout for ALL tabs**: Students, Parents, Waiting, and Advanced Filter all switch to cards.
- **Existing pagination component is reused but fixed**: The current `<Pagination>` component has a bug causing it not to render with 80+ records. This must be debugged and fixed — likely a data flow issue where `total` from the API is not being properly passed to the pagination.
- **Existing DataTable component is not removed**: It remains available for other pages that use it; only the Directory page migrates to cards.
- **Student enrollment info is available via existing API**: The current enrollment data can be fetched from the existing student detail or list endpoint.
- **Student age is available via existing API**: The age/DOB field is either already in the list response or can be added.
- **Mobile responsiveness is required**: The card grid should work on mobile viewports even though the current UI is desktop-first.
