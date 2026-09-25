# Feature Specification: Mobile Layout Redesign

**Feature Branch**: `034-mobile-layout-redesign`  
**Created**: 2026-06-04  
**Status**: Ready for Planning  
**Input**: User description: "Plan the mobile view of the application — sidebar, dashboard, then rest of the pages. Desktop view must remain unchanged."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Mobile Navigation via Bottom Tab Bar (Priority: P1)

A staff member opens the app on their phone and immediately sees a bottom navigation bar with the 4 core modules (Dashboard, Groups, Directory, Finance) and a "More" drawer for the rest. The desktop sidebar is hidden on mobile.

**Why this priority**: Navigation is the gateway to everything. If it doesn't work, nothing else does.

**Independent Test**: Open the app on a 390px-wide viewport. The sidebar should be invisible. A bottom tab bar should appear fixed at the bottom. Tapping "Groups" navigates to `/groups`. The active tab is visually distinct. The "More" button opens a slide-up sheet with remaining modules.

**Acceptance Scenarios**:

1. **Given** I am logged in on a mobile device, **When** I view the layout, **Then** the sidebar is hidden and a bottom tab bar with 4 tabs (Dashboard, Groups, Directory, Finance) + More is visible.
2. **Given** I tap a tab, **When** the navigation resolves, **Then** the correct page loads and that tab shows an active indicator.
3. **Given** I tap "More", **When** the sheet opens, **Then** I see all remaining modules in a 3-column icon grid and can navigate to any of them.
4. **Given** I am on a desktop-width viewport (≥ 1024px), **When** I view the layout, **Then** the sidebar is visible and the bottom tab bar is hidden — exactly as before.

---

### User Story 2 - Agenda-Style Dashboard Feed (Priority: P1)

A staff member opens the dashboard on their phone and sees today's scheduled groups as a clean, scrollable agenda feed. A sticky day-selector bar lets them browse the week. A Floating Action Button (FAB) provides quick access to the primary actions (Quick Register, Create Payment, etc.).

**Why this priority**: The dashboard is the landing page and the primary daily-operations surface. A poorly adapted dashboard would make the app feel unusable on mobile.

**Independent Test**: On a mobile viewport, load `/dashboard`. Verify the page renders as a vertical list of group cards, the day selector is sticky below the top bar, and no element causes horizontal scrolling on the page body.

**Acceptance Scenarios**:

1. **Given** I open the dashboard on mobile, **When** the page loads, **Then** I see a mobile top bar with the app name and page title, followed by a sticky day-selector, instructor filter pills, and a scrollable list of group cards.
2. **Given** sessions are scheduled for today, **When** I view the group cards, **Then** each card shows: group name, course name, instructor name, a session count badge, and a student count — without any data table visible.
3. **Given** I want quick actions, **When** I tap the FAB (+), **Then** a small menu appears with "Quick Register" and "Create Payment".
4. **Given** I tap a group card, **When** the attendance modal opens, **Then** I see a session-first view: a list of the group's sessions for the selected day; tapping one reveals a full-screen student list for marking attendance.
5. **Given** I am on a desktop-width viewport, **When** I view the dashboard, **Then** the full attendance grid table renders exactly as before — no regression.

---

### User Story 3 - Session-First Attendance Marking (Priority: P1)

On mobile, a staff member taps a group card, sees the sessions for that day, picks one, and then sees a clean list of enrolled students they can tap to toggle attendance status (present → absent → cancelled → clear).

**Why this priority**: Marking attendance is the most frequent daily action and the most complex desktop widget. Getting this right on mobile is critical.

**Independent Test**: On mobile, tap a group card with at least one session and two enrolled students. Verify the modal opens, shows a session list, tapping a session shows a student list, tapping a student cycles their status. A "Save" button persists changes.

**Acceptance Scenarios**:

1. **Given** I tap a group card on the mobile dashboard, **When** a bottom sheet opens, **Then** I see a list of today's sessions for that group (time, status badge).
2. **Given** I tap a session in the sheet, **When** the attendance view opens, **Then** I see all enrolled students as rows with their current attendance status shown as a color-coded badge.
3. **Given** I tap a student row, **When** the status toggles, **Then** the badge updates immediately (present → absent → cancelled → no mark).
4. **Given** I have made changes, **When** I tap "Save", **Then** attendance is persisted and I return to the dashboard feed.

---

### User Story 4 - Mobile-Adapted Data Tables on Non-Dashboard Pages (Priority: P2)

When a staff member visits a list page (Groups, Directory, Finance) on mobile, data is presented as vertically stacked cards instead of the desktop's horizontal tables.

**Why this priority**: Horizontal data tables are unreadable on mobile. Cards enable scanning and tapping on small screens.

**Independent Test**: Visit `/directory` on a 390px viewport. Verify that student/parent records render as cards (not a wide table), each card shows the key fields, and tapping a card navigates to the detail view.

**Acceptance Scenarios**:

1. **Given** I visit a list page on mobile, **When** the page loads, **Then** records are displayed as vertical cards stacked in a single column.
2. **Given** I tap a card, **When** the navigation resolves, **Then** I reach the detail view for that record.
3. **Given** I am on a desktop-width viewport, **When** I visit the same page, **Then** the original table layout is unchanged.

---

### Edge Cases

- What happens when a group card has 0 sessions for the selected day? → Show the card with a "No sessions today" state; tapping it links to the group detail page.
- What happens if there are 10+ groups scheduled in one day? → The agenda feed scrolls; the day-selector and instructor filter remain sticky.
- What happens when the "More" sheet is open and the user rotates to landscape? → Sheet closes; layout transitions to desktop mode (sidebar visible).
- What happens when a user tries to open the attendance modal for a cancelled session? → The session row is shown in a muted/strikethrough state and is not tappable for attendance marking; only reactivate action is available.
- What happens when screen width is exactly at the 1024px breakpoint? → Desktop layout (sidebar) takes priority; bottom nav is hidden.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST hide the desktop sidebar and show the bottom tab bar on viewports narrower than 1024px.
- **FR-002**: System MUST show the desktop sidebar and hide the bottom tab bar on viewports 1024px and wider (no regression).
- **FR-003**: Bottom tab bar MUST contain exactly 4 primary tabs: Dashboard, Groups, Directory, Finance — plus a "More" trigger.
- **FR-004**: The "More" trigger MUST open a slide-up sheet containing all remaining modules in a 3-column icon grid, including user info and sign-out.
- **FR-005**: On mobile, the dashboard MUST render a top bar showing the app name ("TechnoTerminal") and current page title ("Dashboard"), with no sidebar-related breadcrumbs.
- **FR-006**: On mobile, the dashboard MUST render an agenda-style feed: a sticky day-selector bar, sticky instructor filter pills (if applicable), and a scrollable list of group summary cards.
- **FR-007**: Each group summary card MUST display: group name, course name, instructor name, session count for the day, and enrolled student count.
- **FR-008**: On mobile, the full attendance grid table MUST NOT be rendered in the dashboard feed. It is replaced by the group summary card + modal flow.
- **FR-009**: Tapping a group summary card MUST open a bottom sheet with a session-first attendance flow: session list → student list → tap-to-toggle status.
- **FR-010**: The attendance bottom sheet MUST include a "Save" button that persists all toggled attendance records.
- **FR-011**: A Floating Action Button (FAB) MUST be present on the mobile dashboard for quick actions: "Quick Register" and "Create Payment".
- **FR-012**: On mobile, list pages (Directory, Groups, etc.) MUST render records as vertically stacked cards instead of horizontal tables.
- **FR-013**: All touch targets for interactive elements MUST be at minimum 44×44 CSS pixels.
- **FR-014**: The main page content area on mobile MUST have bottom padding sufficient to avoid being obscured by the bottom tab bar.
- **FR-015**: Role-based visibility rules applied to the desktop sidebar MUST be identically applied to the mobile bottom tab bar and "More" sheet.

### Key Entities

- **MobileLayout**: The breakpoint-conditional shell that switches between sidebar (desktop) and bottom tab bar (mobile).
- **MobileGroupCard**: The mobile-only card representation of a scheduled group, shown in the dashboard agenda feed.
- **AttendanceMobileSheet**: The full-screen bottom sheet that implements the session-first attendance marking flow on mobile.
- **MobileFAB**: The Floating Action Button providing quick access to primary create actions on the dashboard.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The desktop layout is pixel-for-pixel unchanged at viewports ≥ 1024px — all existing visual regression tests pass.
- **SC-002**: On a 390px viewport, the dashboard body does not require horizontal scrolling (overflow-x is contained within cards).
- **SC-003**: A user can reach any module from the mobile bottom bar in no more than 2 taps.
- **SC-004**: A user can mark full attendance for one group session in under 60 seconds on mobile (vs. the desktop table which requires scrolling and precise clicking on small cells).
- **SC-005**: All interactive elements meet the 44×44px minimum touch target standard.
- **SC-006**: The bottom tab bar does not overlap or obscure any page content (main content has correct bottom padding).

---

## Assumptions

- Desktop layout breakpoint is `lg` (1024px), consistent with the existing `hidden lg:flex` / `lg:hidden` classes already in the codebase.
- The existing `BottomNav.tsx` and `MobileNavSheet.tsx` components (already partially built) serve as the foundation for FR-001 through FR-004; they need refinement, not rebuilding from scratch.
- The existing `AppLayout.tsx` already has `ml-0 lg:ml-64` and `pb-16 lg:pb-0`, meaning the layout shell is partially mobile-ready.
- The `AttendanceMobileSheet` is a net-new component. It reuses the existing attendance API calls (`markAttendance`) and data types but renders them in a mobile-optimized flow.
- The mobile card view for list pages (FR-012) will be implemented page-by-page, starting with Dashboard, then Directory, then Groups.
- The FAB does not introduce new backend capabilities — it reuses the existing Quick Register modal and Finance navigation.
- Instructor role restrictions (blocking `/directory`, `/finance`, etc. from the More sheet) are already handled in `MobileNavSheet.tsx` and remain unchanged.
