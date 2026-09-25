# Feature Specification: Groups UI Controls Redesign

**Feature Branch**: `030-groups-ui-redesign`
**Created**: 2026-06-03
**Status**: Draft
**Input**: User description: "for the group by selector i prefer the old selector design of the groups which was using the same design as the day selector of the dashboard page for the filtring UX i prefer to use the same design as the filtering design woroknungof the student filtiring"

## User Scenarios & Testing

### User Story 1 — Group View Selector with Consistent Visual Design (Priority: P1)

Administrators managing groups need a GroupBy selector that matches the visual design of the dashboard day selector. The current selector uses a different color scheme and styling than the rest of the application, causing visual inconsistency and user confusion.

**Why this priority**: This directly affects visual consistency across the application and is the primary user-facing change requested. The GroupBy selector is the main navigation control on the Groups page.

**Independent Test**: An admin navigates to the Groups page and can switch between group views (All, Day, Course, Instructor, Status) using a selector that shares the same color scheme (blue tones) and structure as the dashboard day selector. The change is purely cosmetic — all existing functionality is preserved.

**Acceptance Scenarios**:

1. **Given** the admin is on the Groups page, **When** they view the GroupBy selector, **Then** it uses the same blue-themed pill design as the dashboard day selector (blue background, white active state with border, consistent rounded corners, same font/typography)
2. **Given** the admin clicks a GroupBy option (e.g., "Day"), **When** the view changes, **Then** the selected option appears with the same active state styling as the dashboard day selector (white background, shadow, border, bold font)
3. **Given** the admin tabs through GroupBy options, **When** each option receives focus, **Then** it follows the same keyboard navigation pattern as the existing selector
4. **Given** the admin switches between grouped and ungrouped views, **When** the GroupBy value changes, **Then** the selector reflects the change with consistent styling

---

### User Story 2 — Filter Panel with Category Pill Design (Priority: P1)

Administrators need to filter groups by multiple criteria (course, instructor, level, day, status) using the same filter interaction pattern as the student directory. The current group filters use multi-select dropdowns that are less discoverable and harder to use than the student filter pills.

**Why this priority**: Filtering is a primary workflow for group management. The student filtering design is already proven and familiar to users who use both pages.

**Independent Test**: An admin opens the filter panel on the Groups page and sees horizontal category pills (similar to the student filtering pattern) instead of multi-select dropdowns. Each pill expands to show the appropriate filter controls for that category.

**Acceptance Scenarios**:

1. **Given** the admin clicks the "Filters" button on the Groups page, **When** the filter panel opens, **Then** it displays horizontal category pills (Course, Instructor, Level, Day, Status) with icons, matching the student directory filter pill design
2. **Given** the admin clicks a filter category pill (e.g., "Course"), **When** the category expands, **Then** it shows filter options using the appropriate interaction per category: toggle buttons for Status, Day, and Level; searchable multi-select dropdown with checkboxes for Course and Instructor — rather than multi-select dropdowns
3. **Given** the admin selects filter values across multiple categories, **When** they close a category, **Then** the category pill shows a badge indicating the number of active filters in that category
4. **Given** the admin has active filters, **When** they view the page, **Then** active filter tags appear above the results as dismissible chips, matching the student directory pattern
5. **Given** the admin clicks "Clear all" on the filter tags, **When** filters are reset, **Then** all filters return to their default state

### Edge Cases

- What happens when the GroupBy selector has no option selected on first load? (It should persist its state from localStorage as currently implemented)
- How does the filter panel behave when the page is in grouped view? (Filters should remain disabled/hidden in grouped view, matching current behavior)
- What happens when all active filters are dismissed one by one? (Filter tags should disappear incrementally; the last tag removal should leave no active filters)
- How do filter pills behave when all filter options within a category are deselected? (The pill should show no badge and the category should return to its default unselected state)

## Requirements

### Functional Requirements

- **FR-001**: The GroupBy selector MUST use the same color scheme and visual styling as the dashboard DaySelectorBar (blue background, white active state with shadow and border)
- **FR-002**: The GroupBy selector MUST preserve all existing options (All, Day, Course, Instructor, Status) and keyboard navigation
- **FR-003**: The GroupBy selector MUST continue to persist the selected value in localStorage
- **FR-004**: The filter panel MUST replace all multi-select `<select>` elements with horizontal category pills matching the student directory AdvancedSearchPanel pattern
- **FR-005**: Each filter category pill MUST expand to show appropriate controls when clicked, and collapse when clicked again or when another pill is clicked
- **FR-006**: Course and Instructor filter categories MUST use a searchable multi-select dropdown with checkboxes when expanded, supporting text search within the list
- **FR-007**: Status, Day, and Level filter categories MUST use toggle button pills when expanded (clicking a toggle adds/removes it from the selection)
- **FR-009**: Active filter pills in each category MUST show a count badge indicating how many filters are applied in that category
- **FR-010**: Active filters MUST be displayed as dismissible tags above the results, using the existing `ActiveFilterTagsList` component
- **FR-011**: The filter panel MUST support the same filter categories as currently available (Course, Instructor, Level, Day, Status)
- **FR-012**: The "Reset Defaults" functionality MUST be preserved, accessible via a clear button matching the student directory pattern
- **FR-013**: Filters MUST remain disabled when the page is in a grouped view (groupBy !== null), matching current behavior

### Key Entities

- **GroupBy Option**: A choice of how to organize group display (All, Day, Course, Instructor, Status), persisted in localStorage
- **Filter Category**: A dimension by which groups can be filtered (Course, Instructor, Level, Day, Status), presented as an expandable pill
- **Active Filter Tag**: A dismissible chip representing an applied filter value, displayed above results

## Success Criteria

### Measurable Outcomes

- **SC-001**: The GroupBy selector is visually indistinguishable from the dashboard DaySelectorBar in terms of color, spacing, border radius, and typography
- **SC-002**: Users can apply a filter across 3+ categories in under 15 seconds using the new pill-based interface
- **SC-003**: All existing filter functionality (same criteria, same backend behavior) is preserved — no regression in filtering accuracy
- **SC-004**: The component structure uses the same FilterPill and ActiveFilterTagsList components already used by the student directory, ensuring design consistency

## Clarifications

### Session 2026-06-03

- Q: How should Course and Instructor filter categories present API-loaded options? → A: Searchable multi-select dropdown with checkboxes (Option B)

## Assumptions

- The dashboard DaySelectorBar design (blue background, white active state with border and shadow) is the target visual reference for the GroupBy selector
- The student directory AdvancedSearchPanel design (FilterPill with expandable category panels + ActiveFilterTagsList) is the target interaction reference for GroupFilters
- No backend changes are required — this is a frontend-only redesign of existing controls
- The existing filter categories (Course, Instructor, Level, Day, Status) remain unchanged; only the UI for interacting with them changes
- The `FilterPill`, `ActiveFilterTagsList`, and related common components from the student directory can be reused as-is or with minor extension
