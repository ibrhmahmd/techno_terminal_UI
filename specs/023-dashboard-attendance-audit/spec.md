# Dashboard Cache & Attendance Grid Audit Fix

**Status**: Draft
**Created**: 2026-05-23
**Feature Directory**: `specs/023-dashboard-attendance-audit/`

## Description

Audit and remediate the dashboard data caching strategy and attendance grid feature. The dashboard currently shows stale data after attendance edits, has unused cache infrastructure, and suffers from runtime bugs, dead code, TypeScript type-safety gaps, and accessibility deficiencies in the attendance grid and related dashboard components.

## User Stories

### US-01: Accurate Dashboard After Attendance Changes
As a staff user viewing the dashboard, I want the attendance summary and scheduled sessions to reflect my latest edits immediately (or within seconds) so that I can make reliable decisions based on current data.

### US-02: Error-Free Attendance Management
As a staff user managing attendance in a group session, I want to mark attendance, cancel sessions, and edit session details without encountering silent failures, duplicate confirmation dialogs, or data loss from unsaved notes.

### US-03: Clean, Maintainable Cache Infrastructure
As a developer maintaining the frontend, I want unused cache configuration, dead hooks, and dead API functions removed so that the codebase is easier to understand and less prone to maintenance errors.

### US-04: Type-Safe Data Handling
As a developer working on attendance features, I want all type assertions and unsafe casts eliminated so that TypeScript can properly validate data flow and catch potential runtime errors at build time.

### US-05: Accessible Attendance Management
As a user who relies on a screen reader, I want to interact with the attendance grid, session controls, and dashboard widgets using standard ARIA patterns so that I can perform my duties independently.

### US-06: Clear Loading and Error States
As a user, I want clear feedback when data is loading or when an error occurs, so that I understand the system state and can take appropriate action.

## Functional Requirements

### FR-01: Cache Invalidation After Attendance Edits
- The system must refresh dashboard overview data when attendance is marked, sessions are cancelled, or session details are edited.
- The system must refresh group-level attendance data when attendance is modified from the dashboard context.
- Unsaved session notes must not be discarded when the attendance grid refetches data.

### FR-02: Runtime Bug Fixes
- Level number zero must be accepted as a valid value for attendance queries.
- The native browser `confirm()` dialog must be replaced with the application's accessible ConfirmDialog component for session cancellation.
- Date formatting must use the user's local timezone rather than UTC for `getTodayISO`.
- The hardcoded GMT+2 timezone offset assumption must be removed from the dashboard header.

### FR-03: Modern Data Fetching
- The employee instructor list in the session edit popup must be loaded via the application's standard data fetching pattern (cached query) rather than a manual `useEffect` with raw fetch.
- Derived student rows in the attendance grid must be computed via memoization rather than stored in state with a synchronizing effect.

### FR-04: Dead Code Removal
- The following unused components, hooks, API functions, and types must be removed:
  - `DashboardHeader` component (unused)
  - `useMarkAttendance`, `useCancelSession`, `useAddExtraSession` hooks (unused)
  - `getSessionAttendance` API function (unused)
  - `SessionAttendanceRowDTO`, `AttendanceUpdate`, `MarkAttendanceRequest` types (unused)
  - `attendanceStatusColors`, `departmentColors` constants (unused externally)
- The following dead centralized query keys must be removed:
  - `groupHistory`, `groupStudents`, `groupsArchived`, `groupsByCourse`, `groupsByType`, `groupSearch`
  - `students`, `student`, `studentBalance`, `studentSiblings`
  - `course`
  - `teamPayments`
  - `receipts`, `refunds`
  - `dashboard`, `stats`, `attendance`, `dashboardOverview`
  - `reports.all`, `reports.enrollmentTrends`, `reports.instructorPerformance`, `reports.dailyReport.pdf`
  - `auth.user`

### FR-05: Type Safety Improvements
- All `as any` type assertions in the attendance grid and edit session popup must be replaced with proper typed access.
- The `AttendanceEntry` status type assertion must use a proper type guard instead of an unsafe cast.
- All type-only imports must use `import type` syntax per project conventions.
- Redundant type casts must be removed.

### FR-06: Accessibility Compliance
- All Material Symbols icon spans must have `aria-hidden="true"`.
- All icon-only buttons must have an `aria-label` describing the action.
- The day selector bar must use `role="tablist"`/`role="tab"`/`aria-selected` for its toggle buttons.
- The instructor selector bar must use `role="tablist"`/`role="tab"`/`aria-selected` for its filter buttons.
- The confirm dialog must use `role="alertdialog"`, `aria-modal`, `aria-labelledby`, and `aria-describedby`.
- The modal close button must have an `aria-label`.
- The session notes textarea must have an `aria-label`.
- The error banner must have `role="alert"` so screen readers announce errors.
- The loading spinner must have `role="status"` so screen readers announce the loading state.
- The dashboard info button in the attendance grid must have an `aria-label`.

### FR-07: Semantic HTML Structure
- The DashboardPage must use a `<main>` landmark element instead of a generic `<div>`.
- The page heading hierarchy must not skip levels (no jump from h1 to h3 without an h2).
- The QuickActionsGrid `<section>` must have an accessible name via `aria-label`.

## Key Entities

| Entity | Description |
|--------|-------------|
| Dashboard Overview | Aggregated data showing scheduled sessions, attendance counts, and stats for a selected date |
| Session Attendance Record | A single student's attendance status for a specific session (present, absent, late, excused) |
| Group Session | A scheduled class session belonging to a student group, with date, time, instructor, and notes |
| Attendance Grid | The UI component displaying a roster of students with per-session attendance status controls |
| Cache Store | The client-side data cache that stores fetched data with configurable staleness thresholds |

## Success Criteria

1. After marking attendance or editing a session from the dashboard, the dashboard overview refreshes within 2 seconds without requiring a manual page reload.
2. After marking attendance from the dashboard, the group detail page attendance tab shows the updated data within 2 seconds.
3. Users can cancel a session with a single confirmation dialog (not two) that is screen-reader accessible.
4. Attendance queries work correctly for groups with level number zero.
5. The dashboard header displays the correct local time regardless of the server's timezone setting.
6. Zero production `console.log` statements remain in dashboard or attendance grid source files.
7. Zero `as any` type assertions remain in attendance-related source files.
8. All icon-only buttons and interactive controls pass an automated accessibility audit (axe-core or equivalent).
9. Keyboard-only users can navigate between day selector and instructor filter buttons using arrow keys.
10. The codebase compiles without TypeScript errors after all changes.
11. The linting pass completes with zero errors after all changes.

## Out of Scope

- Adding new dashboard features or widgets
- Redesigning the attendance grid layout or visual appearance
- Modifying the backend attendance API contracts
- Adding test coverage for the affected components
- Performance optimization beyond cache invalidation timing
- Cross-browser compatibility testing

## Dependencies

- Existing React Query infrastructure and query key factory pattern
- Existing ConfirmDialog and Modal components
- Existing API functions for attendance CRUD operations

## Assumptions

- The project's existing React Query cache configuration (`staleTime: 5 min` default) is appropriate and will not be changed.
- Timezone handling should use the browser's local timezone for date display.
- Level numbers are zero-indexed in the curriculum data model, so zero is a valid value.
- All icon-only buttons convey their purpose through adjacent visual context and only need an `aria-label` for screen reader accessibility.
