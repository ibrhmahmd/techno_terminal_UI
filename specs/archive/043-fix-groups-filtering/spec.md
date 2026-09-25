# Feature Specification: Fix Groups Filtering & Pagination

**Feature Branch**: `043-fix-groups-filtering`  
**Created**: 2026-06-07  
**Status**: Draft  
**Input**: User description: "identify the bugs in the groups filtering logic, and the pagination controls in displaying the groups in both table and card views"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fix Missing Pagination in Card View (Priority: P1)

Group managers who switch to card view cannot navigate beyond the first page of results because pagination controls are only rendered in table view. They need to switch back to table view just to access later pages.

**Why this priority**: Blocks access to all groups beyond the first page in card view — data is invisible to users, not just inconvenient.

**Independent Test**: Switch to card view with >50 groups across multiple pages; verify pagination controls appear and function identically to table view.

**Acceptance Scenarios**:

1. **Given** the groups list has more than one page of results, **When** the user switches from table view to card view, **Then** pagination controls (page numbers, prev/next, first/last, page size selector, record count) are visible below the card grid.
2. **Given** the user is on page 3 in card view, **When** they click page 5, **Then** the card grid updates to show groups on page 5 and the pagination controls reflect the new current page.
3. **Given** the user is on page 1 in card view with 20 records per page showing, **When** they change page size to 50, **Then** the page resets to 1 and up to 50 groups are shown.

---

### User Story 2 — Fix Pagination Reset on Filter Changes (Priority: P1)

When a user applies filters, removes a filter tag, or changes the view type (grouped vs flat), the current page does not always reset to 1. This can result in seeing an empty results page even though matching groups exist on earlier pages.

**Why this priority**: Users cannot trust that filter changes produce correct results — they may need to manually navigate to page 1 to see actual matching groups.

**Independent Test**: Apply a filter while on page 5, then clear the filter — verify page resets to 1 and results update.

**Acceptance Scenarios**:

1. **Given** the user is on page 5 with no active filters, **When** they select any filter option (course, instructor, day, level, or status), **Then** the page immediately resets to 1 and the filtered results load.
2. **Given** the user is on page 8 with active filters, **When** they remove a filter tag, **Then** the page resets to 1 and results reload with remaining filters applied.
3. **Given** the user is on page 3, **When** they switch from flat view to grouped view, **Then** the grouped view starts from its first category.
4. **Given** the user is on page 3, **When** they switch from grouped view to flat view, **Then** the flat view resets to page 1.

---

### User Story 3 — Add Pagination to Grouped View / Allow Filters in Grouped View (Priority: P2)

The grouped view fetches all groups with a hardcoded limit of 200 with no pagination, and the filter sidebar is hidden entirely when in grouped view.

**Why this priority**: Users in grouped view cannot filter groups and may not see all groups if there are more than 200 in a single group.

**Independent Test**: Open grouped view with a status that has >200 groups; verify all groups are accessible. Open filter panel in grouped view and apply a status/course filter.

**Acceptance Scenarios**:

1. **Given** the user is in grouped view (grouped by course or instructor), **When** they toggle open the filter panel, **Then** filters are accessible and applicable to the grouped data.
2. **Given** the user applies a status filter in grouped view, **When** the filter is toggled, **Then** only groups matching the selected status remain in each category.
3. **Given** the user switches from table to card view in grouped mode, **When** they interact with pagination, **Then** the behavior is consistent.

---

### User Story 4 — Show Record Count in Pagination Info (Priority: P3)

The pagination component renders "Page X of Y" but never shows "Showing X-Y of Z records" because `totalRecords` is never passed from GroupsPage.

**Why this priority**: Low impact — partial info still usable, but users cannot see total record count at a glance.

**Independent Test**: Load groups with <50 records on first page; verify pagination footer reads "Showing 1–25 of 25 records".

**Acceptance Scenarios**:

1. **Given** the groups page loads with 73 groups, **When** the pagination footer renders, **Then** it displays "Showing 1–50 of 73 records" on page 1.
2. **Given** the user is on page 2 with 23 remaining groups, **When** the pagination renders, **Then** it displays "Showing 51–73 of 73 records".

---

### Edge Cases

- Empty result set after filter: Pagination should not render at all if there are 0 records and 0 pages (currently renders if `totalPages > 0 && paginatedGroups.length > 0`, which is correct).
- Rapid filter toggle: If user rapidly applies/removes filters, stale query results should not display mismatched pagination.
- Filter change while mid-page: If user is on page 8 and applies a filter that returns only 1 page of results, page should reset to 1.
- All groups visible (single page): Pagination should still render page info but disable prev/next and show only page 1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Pagination controls MUST be rendered in both table view and card view when there are multiple pages of results.
- **FR-002**: The current page MUST reset to 1 whenever the user confirms filter changes via the Apply button, removes a filter tag, or clears all filters. Individual pill toggles do NOT reset the page — the reset happens on confirmation to avoid scroll-jump during multi-select.
- **FR-003**: The current page MUST reset to 1 when switching between flat view and grouped view.
- **FR-004**: Removing a filter tag MUST reset the current page to 1.
- ~~**FR-005**: The grouped view MUST accept filter options — deferred to backend track.~~
- ~~**FR-006**: The grouped query MUST support pagination — deferred to backend track.~~
- **FR-007**: The pagination footer MUST display the total record count (e.g., "Showing 1–50 of 173 records") when `totalRecords` is available.
- ~~**FR-008**: The filter panel MUST NOT be hidden when in grouped view — deferred to backend track.~~
- **FR-009**: The search input MUST reset the current page to 1 whenever the user types or clears the search term.

### Key Entities

- **Group**: A teaching group entity with attributes including id, name, course_id, instructor_id, capacity, status, schedule (day/time), level, start_date.
- **GroupFilterOptions**: Filter parameters sent to the API — includes q (search), course_ids, instructor_ids, level_numbers, day, status, skip (offset), limit (page size).
- **GroupByField**: The field used to group results — one of day, course, instructor, status, or null (flat view).
- **PaginationState**: Client-side state tracking currentPage, pageSize, totalPages, totalRecords.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse all groups in card view with working pagination — 100% of groups are reachable regardless of view mode.
- **SC-002**: Filtering no longer produces empty-page bugs — page resets to 1 on Apply/tag-remove/clear-all and shows matching results.
- **SC-003**: The total record count is visible in the pagination footer on every page, for every view mode that supports pagination.
- ~~**SC-004**: The grouped view respects at least status filters — deferred to backend track.~~

## Clarifications

### Session 2026-06-07

- Q: Should backend changes be allowed for grouped view filtering? → A: Yes — the grouped endpoint will be updated to accept GroupFilterOptions params so filtering happens server-side.

### Session 2026-06-10

- Q: Should the page reset on every filter pill click (immediate) or only on Apply/tag-remove/clear-all? → A: Option B — page resets on Apply, tag-remove, or clear-all. Individual pill toggles do not reset the page to avoid scroll-jump during multi-select.
- Q: US3 (grouped view filters + pagination) deferred — should FR-005/FR-006/FR-008/SC-004 remain in scope? → A: No. Struck through in spec.

## Assumptions

- Filter state (selectedCourses, selectedInstructors, etc.) is managed in the `useGroups` hook as individual useState arrays — changes to any of these should trigger a page reset. The page reset happens on Apply/tag-remove/clear-all (not on individual pill click).
- The backend API (getGroupsPaginated) supports the full GroupFilterOptions contract including skip/limit — no backend changes are needed.
- The grouped query (getGroupsGrouped) support for filter params is deferred to the backend track — not in scope for this implementation.
- Users expect pagination behavior to be consistent across both view modes (table and cards).
- The existing Pagination component is reusable and does not need modification — only the GroupsPage rendering logic needs to pass the right props.
