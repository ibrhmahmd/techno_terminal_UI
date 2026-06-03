# Research: Groups UI Filter Feature

**Feature**: 029-groups-filter-ui
**Date**: 2026-06-03

## Context
We are implementing a comprehensive UI Filter Drawer for the Groups page to replace local frontend search-filtering with the new, powerful backend `/filter` endpoint.

## Clarifications & Findings

### 1. Array Parameter Serialization (Axios)
**Unknown**: How does the backend expect arrays like `course_ids` or `status`?
**Finding**: The migration guide explicitly states that the backend requires repeated query parameters (e.g., `?status=active&status=inactive`) rather than bracket notation (e.g., `?status[]=active`). Axios uses bracket notation by default.
**Decision**: We must use the `qs` library with `{ arrayFormat: 'repeat' }` in `paramsSerializer` within the Axios request in `src/api/academics/groups/core.ts`.

### 2. Grouped View & Filtering
**Unknown**: Does the existing `GET /academics/groups/grouped` endpoint accept the same rich filter parameters (`course_ids`, `instructor_id`, etc.) as the `/filter` endpoint?
**Finding**: According to the migration guide, the grouped view endpoint is unchanged and does not advertise support for these new filters (it only supports `search`).
**Decision**: In the UI, when `isGroupedView` is active (i.e., `groupBy !== undefined`), we will **disable** the Filter button or hide it to prevent user confusion, as the server-side grouping endpoint cannot currently process these granular filters.

### 3. Local vs Server-Side Filtering
**Unknown**: Should `useGroups.ts` continue fetching all groups and applying the new filters locally, or shift to server-side?
**Finding**: The backend has been completely refactored specifically to support this server-side filtering via `/filter`. Fetching all groups into memory is unscalable for the CRM.
**Decision**: Remove the local filtering and pagination logic in `useGroups.ts`. Pass the filter state directly down to the React Query hooks (`useGroupsFlat`) and let the backend handle the filtering and pagination.

### 4. Legacy "Active" vs "Completed" Views
**Unknown**: How does the new filtering scheme affect the current `activeView` vs `completedView` toggles in `GroupsPage.tsx`?
**Finding**: The UI currently fragments logic to conditionally render active vs completed groups, and even uses a separate React Query hook (`useArchivedGroups`).
**Decision**: Since `/filter` natively supports `status=active` and `status=archived`, we will completely delete the `activeView` state and `useArchivedGroups` hook. "Status" becomes a standard multi-select filter (defaulting to `['active']`) in the new Filter Drawer.
