# Feature Specification: Groups Card Layout

**Feature Branch**: `007-groups-card-layout`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "explore the groups page and plan how to use cards instead of table there in the patterns we made in the directory page"

## User Scenarios & Testing

### User Story 1 - Browse Groups as Cards (Priority: P1)

A staff member views all groups on the Groups page and sees them displayed as visual cards instead of table rows. Each card shows the group name, course, instructor, schedule, capacity, and status at a glance. The cards are arranged in a responsive multi-column grid.

**Why this priority**: This is the core visual change—replacing the table with cards delivers the primary user-facing improvement. Without this, there is no feature.

**Independent Test**: Load the Groups page with groups data — verify groups render as cards (not table rows) with group name, course, instructor, schedule time, current capacity, and status visible on each card.

**Acceptance Scenarios**:

1. **Given** the Groups page has data, **When** the page loads, **Then** groups are displayed as cards in a responsive grid
2. **Given** a group card is rendered, **When** viewed, **Then** it shows group name, course name, instructor name, schedule day/time, student count/capacity, and status badge
3. **Given** the card grid is rendered, **When** the browser is resized, **Then** the grid adjusts: 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide screens
4. **Given** groups data is loading, **When** the page is loading, **Then** skeleton placeholder cards are shown instead of a spinner

---

### User Story 2 - Grouped Card View (Priority: P2)

A staff member selects a grouping option (All, Day, Course, Instructor, Status, Competition) and sees grouped results as category tabs with cards beneath each active group.

**Why this priority**: The existing GroupBySelector already supports grouping; extending it to work with cards maintains feature parity.

**Independent Test**: Select "Day" from the group selector — verify groups appear in day-based category tabs, with each tab showing its card grid.

**Acceptance Scenarios**:

1. **Given** the user selects a grouping option, **When** the view is in card mode, **Then** groups are grouped into category tabs with a card grid under the active tab
2. **Given** a grouped card view is active, **When** the user clicks a different category tab, **Then** the card grid updates to show groups in the selected category
3. **Given** a grouping has no groups, **When** that category tab is selected, **Then** an empty-state message is shown

---

### User Story 3 - Take Action on Group Cards (Priority: P3)

Each group card has visible action buttons (View, Edit, Delete) allowing staff to navigate to the detail page, edit the group, or delete it directly from the listing.

**Why this priority**: Actions on cards complete the user workflow without needing to switch back to a table view. Lower priority because users can still use the existing table view for actions.

**Independent Test**: Hover or view a group card — see View, Edit, Delete buttons. Click View → navigates to group detail page. Click Edit → edit modal opens. Click Delete → confirmation dialog appears.

**Acceptance Scenarios**:

1. **Given** a group card is displayed, **When** the user clicks View, **Then** they navigate to the group detail page at `/groups/:id`
2. **Given** a group card is displayed, **When** the user clicks Edit, **Then** the edit modal opens with the group's data pre-filled
3. **Given** a group card is displayed, **When** the user clicks Delete, **Then** a confirmation dialog appears, and confirming deletes the group

---

### Edge Cases

- What happens when there are no groups to display? Show empty-state message with appropriate icon
- How does the card view handle groups with no instructor assigned? Show a fallback like "TBA" or dash
- How does the card view handle long group or course names? Truncate with ellipsis
- What happens when searching while in card view? Search results display as cards, not table rows

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a toggle to switch between table view and card view on the Groups page
- **FR-002**: Group cards MUST display: group name, course name, instructor name, schedule day/time, student count vs. capacity, and status badge
- **FR-003**: Card grid MUST be responsive: 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide screens
- **FR-004**: Group cards MUST support View, Edit, and Delete actions
- **FR-005**: Grouped view (via GroupBySelector) MUST work with card mode, showing category tabs with cards
- **FR-006**: Loading state MUST show skeleton placeholder cards matching final card dimensions
- **FR-007**: Empty state MUST show a friendly message with an icon when no groups match the current filters or grouping
- **FR-008**: The table view MUST remain available — card view is an alternative, not a replacement
- **FR-009**: Search functionality MUST work identically in card view — search results shown as cards
- **FR-010**: Group status colors MUST be consistent with the existing `GroupStatusBadge` component

### Key Entities

- **GroupCard**: Visual card component displaying a single group's key information (name, course, instructor, schedule, capacity, status)
- **CardGrid**: Responsive grid container that holds cards, controlling column count based on viewport width
- **ViewToggle**: Control allowing users to switch between table and card view modes
- **GroupCategoryTabs**: Tab bar for navigating between grouped categories when in grouped card view

## Success Criteria

### Measurable Outcomes

- **SC-001**: All groups visible in the directory display as cards with name, course, instructor, schedule, capacity, and status — no information from the table view is lost
- **SC-002**: Card grid layout adapts to 4 column widths (mobile/tablet/desktop/wide) without horizontal overflow
- **SC-003**: Users can navigate from the card listing to any group's detail page in one click from the card
- **SC-004**: Edit and Delete actions are accessible from cards without switching to the table view
- **SC-005**: Page load shows skeleton placeholders in under 200ms, with content fully rendered within the existing data loading time

## Assumptions

- The existing `CardGrid` and `CardSkeleton` components from the Directory feature will be reused or adapted
- The view toggle (table vs. cards) will be added near the existing GroupBySelector
- The existing `GroupColumns.tsx` defines the baseline of what data should appear on cards
- The existing `groupColumns` define row actions (View, Edit, Delete) that cards should replicate
- The existing DataTable and all its features (grouped mode, pagination, search) remain unchanged for users who prefer it
- No backend API changes are required — all changes are frontend-only
- Card design follows the same visual language as Directory cards (rounded borders, shadow, hover effects, status badges)
