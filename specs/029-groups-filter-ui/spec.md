# Feature Specification: Groups UI Filter Feature

**Epic**: Academics UI Modernization
**Feature ID**: 029-groups-filter-ui
**Status**: DRAFT
**Created**: 2026-06-03
**Target Branch**: `029-groups-filter-ui`

## 1. Executive Summary

This feature modernizes the UI for the `GroupsPage` by replacing local frontend list filtering with a robust server-side filter architecture. This is a direct follow-up to the backend API consolidation (Feature 028). The new UI introduces a "Filter Drawer" housing comprehensive options (Course, Instructor, Level, Day, Status) and active Filter Chips, drastically improving user experience and aligning the frontend with the powerful new backend `/filter` endpoint capabilities.

## 2. Business Value & Goals

- **Improved UX:** Users can now combine multiple filters (e.g., specific Course AND specific Instructor) to pinpoint groups, overcoming the limitations of the previous single-string search.
- **Improved Performance & Scalability:** By shifting to Server-Side filtering, the UI will no longer need to fetch hundreds of active groups into memory at once. Pagination and filtering happen at the database level.
- **Simplified Workflow:** Unifying "Active", "Inactive", and "Completed" groups under a single "Status" filter reduces UI fragmentation and eliminates legacy duplicated view logic.

## 3. Success Criteria

- [ ] A dedicated Filter Button appears in the `GroupsPage` header, indicating the number of active filters.
- [ ] Users can open a Filter Drawer/Panel containing at minimum: Course, Instructor, Level, Day, and Status filters.
- [ ] Active filters are displayed as dismissible "Chips" above the group list.
- [ ] The legacy "Active" vs "Completed" tab toggle is completely removed.
- [ ] The `GroupBySelector` functions alongside the new unified Toolbar layout.
- [ ] Network requests to `/academics/groups/filter` properly serialize array parameters (e.g., `course_ids`) as repeated query parameters.

## 4. User Scenarios

### Scenario A: Complex Multi-Filter Search
- **Given** an admin on the Groups page
- **When** they open the Filter Drawer and select Course "Robotics 101" and Instructor "Sarah Connor"
- **Then** the UI updates to show only groups matching both criteria.
- **And** the Filter Button shows a badge `[2]`.
- **And** two Filter Chips ("Course: Robotics 101", "Instructor: Sarah Connor") appear above the list.

### Scenario B: Removing a Filter via Chip
- **Given** an admin with the "Course: Robotics 101" filter applied
- **When** they click the 'x' on the corresponding Filter Chip
- **Then** the filter is removed, the list refreshes immediately, and the Filter Drawer selection clears.

### Scenario C: Viewing Archived Groups
- **Given** an admin wants to see past groups
- **When** they open the Filter Drawer and change the "Status" filter from "Active" to "Archived"
- **Then** the list fetches and displays only archived groups without navigating to a separate hardcoded "Completed" page layout.

## 5. Scope & Constraints

**In Scope:**
- Building the `GroupFilters` drawer/panel.
- Building the `FilterChips` display component.
- Updating `core.ts` to support the new `GroupFilterOptions` and serialize arrays properly.
- Modifying React Query hooks to accept filter state.
- Redesigning the toolbar to consolidate `GroupBySelector` and `ViewToggle`.
- Removing the legacy `activeView` state and its separate completed group rendering paths.

**Out of Scope:**
- Updating backend `/academics/groups/filter` endpoints (already completed).
- Changing how the `GroupBySelector` `/grouped` endpoint functions on the backend.
- Adding complex new filters like `max_capacity_min` unless specifically requested (focusing on primary dimensions first: Course, Instructor, Level, Day, Status).

## 6. Assumptions & Dependencies

- The backend `/academics/groups/filter` endpoint is fully deployed and supports the documented parameters.
- Existing React Query hooks for fetching Courses (`useCourses`) and Instructors (`useStaff`) are available and functional for populating the filter dropdowns.
- `qs` library is available in the project to serialize axios array parameters (or we can use `URLSearchParams`).

## 7. Next Steps

1. Review and approve this Specification (`/speckit.clarify` if needed).
2. Generate the detailed Implementation Plan (`/speckit.plan`).
3. Generate granular tasks (`/speckit.tasks`).
