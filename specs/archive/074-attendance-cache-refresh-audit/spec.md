# Feature Specification: Attendance Grid — Cache, Update & Refresh Audit Fix

**Feature Branch**: `074-attendance-cache-refresh-audit`
**Created**: 2026-08-29
**Status**: Draft
**Input**: User description: "Audit and fix the attendance grid's caching behavior, updates, and refresh bugs so the group-detail grid stays in sync after any session mutation, and mobile/desktop agree on missing-status semantics. Consolidate the duplicate attendance type model."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Grid stays current after session actions (Priority: P1)

A staff user viewing a group's attendance grid on the group-detail page cancels, deletes, reactivates, completes, or edits a session. The grid must immediately reflect that change without a manual page reload.

**Why this priority**: The grid currently leaves stale session rows on the group-detail page after these actions (the batch-save path is correct, but the per-session lifecycle actions are not). This is the most visible correctness bug and the user's stated focus.

**Independent Test**: On the group detail page, cancel a session and confirm its row disappears immediately; repeat for delete/reactivate/complete/edit.

**Acceptance Scenarios**:
1. **Given** I am on the group-detail attendance grid, **When** I cancel a session, **Then** the session row is removed/updated immediately without a manual refresh.
2. **Given** I am on the group-detail attendance grid, **When** I complete or edit a session, **Then** the updated status/date/notes appear immediately.
3. **Given** I am on the dashboard attendance panel, **When** I perform the same actions, **Then** the dashboard overview still refreshes (existing behavior preserved).

---

### User Story 2 - Missing attendance renders consistently on mobile and desktop (Priority: P2)

A student with no attendance record for a session renders the same way ("Not Taken") whether the staff user is on the desktop grid or the mobile bottom sheet.

**Why this priority**: The mobile sheet defaults an empty record to "Absent" while the desktop defaults to "Not Taken" — two different meanings for the same data state, which confuses users and can cause wrong attendance counts.

**Independent Test**: Open a group with a student who has no attendance record for a session; confirm mobile shows "Not Taken" (gray), matching desktop.

**Acceptance Scenarios**:
1. **Given** a student has no attendance record for a session, **When** I view the mobile sheet for that session, **Then** the student shows "Not Taken", matching the desktop grid.
2. **Given** a student's record is stored under a numeric key, **When** the mobile/lookup runs, **Then** the lookup still resolves (no spurious "Absent" fallback).

---

### User Story 3 - Attendance data model has one source of truth (Priority: P3)

Maintainers editing the attendance data model change it in one place instead of editing identical copies that can silently diverge.

**Why this priority**: Two identical type definitions and two identical `getAttendanceForLevel` functions exist; different consumers already import from different copies, so a future change to one would produce wrong/mismatched behavior with no compile error.

**Independent Test**: Search the codebase and confirm a single definition for each attendance type and the `scheduled|completed|cancelled` status union is imported everywhere.

**Acceptance Scenarios**:
1. **Given** an attendance type is changed, **When** the code is built, **Then** no other copy diverges (exactly one definition is referenced by all consumers).
2. **Given** two surfaces (desktop grid, mobile sheet) toggle attendance, **When** the status cycle is changed, **Then** both update from the same shared logic.

---

### Edge Cases

- Empty attendance: a session with no attendance records at all (all rows "Not Taken").
- A student present in the roster but missing from a session's attendance map (number vs string key mismatch).
- Session lifecycle action performed with `selectedDate` undefined (group-detail context) vs defined (dashboard context).
- Cancelled session rows that should render as "Not Taken" after reactivation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: After a staff user cancels, deletes, reactivates, completes, or edits a session, the attendance grid on the group-detail page MUST update to reflect the change immediately (no manual reload).
- **FR-002**: After any of the above session actions, the grid's cached data MUST be refreshed on BOTH the desktop grid and the dashboard overview when applicable.
- **FR-003**: A student with no attendance record for a session MUST render as "Not Taken" on both the desktop grid and the mobile sheet.
- **FR-004**: Attendance lookup MUST resolve the correct student record regardless of whether IDs are stored as numbers or strings.
- **FR-005**: The attendance data types (roster, session, level response) and the `scheduled|completed|cancelled` status union MUST be defined in exactly one place and imported everywhere.
- **FR-006**: Attendance status toggling MUST share a single cycle definition across the desktop grid and the mobile sheet.

### Key Entities

- **Attendance Session**: A scheduled class occurrence with date/time/instructor/status and per-student attendance records.
- **Attendance Record**: A single student's status for a session (`not_taken`/`present`/`absent`) plus billing info.
- **Group Level**: A subdivision of a group that owns a roster of students and a set of sessions; the attendance grid is keyed per level.
- **Attendance Status**: The `not_taken → present → absent` cycle state shown per student-session cell.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of session lifecycle actions (cancel/delete/reactivate/complete/edit) on the group-detail page update the grid immediately, verified by automated test.
- **SC-002**: A student with no attendance record renders "Not Taken" identically on desktop and mobile in 100% of cases (automated + manual).
- **SC-003**: The attendance type model and status union have exactly one definition; a search for the relevant identifiers returns a single source (excluding the shared util).
- **SC-004**: `npm run build`, `npm run lint`, and `npm run test` all pass with no regressions.

## Assumptions

- The existing authentication, API client, and React Query cache layers are reused unchanged.
- No backend/API contract changes are required; all fixes are frontend-only.
- The batch-save path (`Save Changes`) already invalidates correctly and must not regress.
- Stale-time behaviors intentionally tuned for attendance (`useGroupAttendance` 60s) are correct and not changed.
