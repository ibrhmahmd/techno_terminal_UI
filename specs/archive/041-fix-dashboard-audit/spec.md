# Feature Specification: Dashboard Audit Fix

**Feature Branch**: `041-fix-dashboard-audit`  
**Created**: 2026-06-05  
**Status**: Draft  
**Input**: Audit findings from `/audit-feature dashboard`

## User Scenarios & Testing

### User Story 1 — Fix runtime bugs in session display (Priority: P1)

The dashboard shows a list of today's group sessions. Administrators view session times and level information. Currently, time formatting uses a 24-hour inline `.slice(0,5)` approach instead of the standard 12-hour format used elsewhere, and level numbers can crash when the API returns null.

**Why this priority**: These are production bugs — time display inconsistency causes user confusion, and the missing null guard on `current_level` can crash the entire dashboard when data is incomplete.

**Independent Test**: Dashboard displays all session times in consistent 12-hour format matching the rest of the application. Level numbers never crash even with partial API data.

**Acceptance Scenarios**:

1. **Given** a group session with `default_time_start = "09:00:00"`, **When** the dashboard renders it, **Then** the time displays as "9:00 AM" (not "09:00")
2. **Given** a scheduled group where `current_level` is null, **When** the dashboard renders it, **Then** it displays level 0 (not crash)
3. **Given** a group session with `current_level` populated, **When** the dashboard renders it, **Then** the correct level number is shown
4. **Given** the dashboard is loading, **When** `getGroupInfo` is accessed for the same group ID, **Then** it is called only once per render (not 4 times)

---

### User Story 2 — Remove dead code and unused exports (Priority: P1)

Several dashboard files are entirely dead (contain only placeholder comments), and unused exports exist in barrel files. Removing dead code reduces maintenance burden and improves build performance.

**Why this priority**: Dead code confuses developers, increases bundle size, and clutters the codebase. Cleanup is fully mechanical and risk-free.

**Independent Test**: Build passes with zero errors. No remaining imports reference the removed files or exports.

**Acceptance Scenarios**:

1. **Given** the file `src/components/dashboard/DashboardHeader.tsx` (placeholder-only), **When** it is deleted, **Then** the build passes with zero errors
2. **Given** the file `src/hooks/dashboard/useAttendance.ts` (placeholder-only), **When** it is deleted, **Then** the build passes with zero errors
3. **Given** the barrel file `src/components/dashboard/index.ts`, **When** its dead re-exports are removed (or the entire file deleted), **Then** the build passes with zero errors
4. **Given** unused query key factory entries `dashboardKeys.schedule` and `dashboardKeys.sessions`, **When** they are removed, **Then** the build passes with zero errors
5. **Given** `MobileDashboardFABProps.todaySessionCount` prop that is never consumed, **When** it is removed from the interface and caller, **Then** the build passes
6. **Given** barrel type re-exports in `src/api/dashboard/types/index.ts` for types only used transitively, **When** they are removed, **Then** the build passes

---

### User Story 3 — Fix TypeScript code quality issues (Priority: P2)

The edit session panel contains an unnecessary type assertion and a redundant double function call. These reduce type safety and code clarity.

**Why this priority**: Not a runtime bug, but the unsafe `as number` assertion bypasses TypeScript safety, and the repeated `getGroupInfo` call is wasteful.

**Independent Test**: TypeScript build (`tsc -b`) passes with zero type errors. The `as number` cast is removed.

**Acceptance Scenarios**:

1. **Given** `getGroupInfo(openGroupId)` is called in the edit session section, **When** it is accessed, **Then** the result is stored in a local variable and reused (not called multiple times)
2. **Given** an `instructor_id` value from group info, **When** it is used to look up an instructor name, **Then** it does not use `as number` type assertion
3. **Given** the dev-only `console.log` in `useDashboard.ts`, **When** it is removed, **Then** the build still passes

---

### User Story 4 — Centralize dashboard query keys (Priority: P2)

Dashboard query keys are currently defined locally in `useDashboard.ts` and exported from there. The project convention requires all query keys to live in `src/hooks/queryKeys.ts` for discoverability and consistency.

**Why this priority**: Local query keys violate project conventions, making it harder for developers to find all cache keys and increasing the risk of key collisions or incorrect invalidation.

**Independent Test**: All dashboard query keys are defined in `src/hooks/queryKeys.ts` and consumed via the centralized factory. No inline `['dashboard', ...]` keys exist.

**Acceptance Scenarios**:

1. **Given** `useDashboard.ts`, **When** it is inspected, **Then** its query keys use `queryKeys.dashboard.*` from the centralized factory
2. **Given** `AttendanceGrid.tsx` and `AttendanceMobileSheet.tsx`, **When** they invalidate dashboard queries, **Then** they use keys from `queryKeys.dashboard.*`
3. **Given** `src/hooks/queryKeys.ts`, **When** it is inspected, **Then** it contains a `dashboard` section with `overview`, `schedule`, and `sessions` factory functions

---

### User Story 5 — Fix keyboard accessibility gaps (Priority: P3)

The mobile FAB and tablist controls have keyboard navigation gaps. The FAB's action buttons remain keyboard-tabbable when hidden, the FAB menu cannot be dismissed with Escape, and tablists lack arrow key navigation.

**Why this priority**: These are accessibility violations that affect keyboard-only users. Fixing them ensures compliance with WCAG guidelines.

**Independent Test**: Tab through the dashboard using only a keyboard. The FAB action buttons are not focusable when hidden, the FAB closes on Escape, and tablists support arrow key navigation.

**Acceptance Scenarios**:

1. **Given** the mobile FAB is closed, **When** a user tabs through the page, **Then** the FAB action buttons are NOT focusable
2. **Given** the mobile FAB is open, **When** a user presses Escape, **Then** the FAB closes
3. **Given** a tablist (day selector or instructor selector), **When** a user presses ArrowRight or ArrowLeft, **Then** focus moves to the adjacent tab
4. **Given** a tablist, **When** a user tabs into it, **Then** only the selected tab receives keyboard focus (roving tabindex pattern)

---

### User Story 6 — Add screen reader ARIA attributes (Priority: P3)

Multiple icon-only and decorative elements lack proper ARIA attributes, and error banners lack `role="alert"`, preventing screen readers from announcing dynamic content.

**Why this priority**: These are low-effort fixes that significantly improve the experience for blind and low-vision users.

**Independent Test**: Run axe DevTools on the dashboard page — zero critical and medium accessibility violations related to missing ARIA attributes.

**Acceptance Scenarios**:

1. **Given** the error banner appears, **When** a screen reader is active, **Then** it announces the error content immediately
2. **Given** Material Symbols icon spans used decoratively, **When** a screen reader encounters them, **Then** they are skipped (not announced)
3. **Given** the Instructor Selector bar, **When** a screen reader encounters the icon span, **Then** it is hidden from assistive technology

---

### Edge Cases

- What happens when `getGroupInfo` returns undefined for a group ID in the schedule? The desktop path currently renders fallback text; the mobile path returns null. Both paths should handle missing groups consistently.
- What happens when the API returns null for `current_level`? Should gracefully fall back to level 0 without crashing.
- What happens if `default_time_start` or `default_time_end` is null? The `formatTime` utility should handle null/undefined input gracefully.
- What happens when the FAB is open and the user navigates away? The FAB should reset to closed state.

## Requirements

### Functional Requirements

- **FR-001**: Session times MUST display in 12-hour format using `formatTime()` from `src/utils/formatting.ts`
- **FR-002**: The dashboard MUST handle null `current_level` without crashing by falling back to a safe default
- **FR-003**: `getGroupInfo(openGroupId)` MUST be called at most once per render in the edit session panel
- **FR-004**: Dead placeholder files `DashboardHeader.tsx` and `useAttendance.ts` MUST be deleted
- **FR-005**: Unused barrel re-exports from `src/components/dashboard/index.ts` MUST be removed
- **FR-006**: Unused `todaySessionCount` prop from `MobileDashboardFABProps` MUST be removed
- **FR-007**: Unused query key entries (`schedule`, `sessions`) in `dashboardKeys` MUST be removed
- **FR-008**: The `as number` type assertion on `instructor_id` in `DashboardPage.tsx` MUST be replaced with proper typing
- **FR-009**: Dev-only `console.log` in `useDashboard.ts` MUST be removed
- **FR-010**: Dashboard query keys MUST be centralized in `src/hooks/queryKeys.ts`
- **FR-011**: Consumers of `dashboardKeys` (`AttendanceGrid`, `AttendanceMobileSheet`, `useGroupQueries`) MUST import from the centralized factory
- **FR-012**: Hidden FAB action buttons MUST NOT be keyboard-focusable (use `invisible` class alongside `opacity-0 pointer-events-none`)
- **FR-013**: The mobile FAB MUST close when the user presses Escape
- **FR-014**: Tablists (day selector, instructor selector) MUST support arrow key navigation with roving tabindex
- **FR-015**: Error banners MUST have `role="alert"` for screen reader announcement
- **FR-016**: All decorative icon spans using `material-symbols-outlined` MUST have `aria-hidden="true"`
- **FR-017**: The desktop schedule path MUST handle missing groups consistently with the mobile path

### Key Entities

- **DashboardDailyOverview**: The top-level data structure representing a day's schedule, including scheduled groups, sessions, and summary statistics
- **ScheduledGroup**: A group assigned to a specific time slot on the dashboard, containing group info, current level, instructor, and attendance records
- **SessionWithAttendance**: A session occurring within a scheduled group, with per-student attendance records
- **CurrentLevel**: The current curriculum level of a group, with level number and name; may be null for new groups
- **FormattedTime**: A time string in 12-hour format (e.g., "9:00 AM") produced by the `formatTime` utility

## Success Criteria

### Measurable Outcomes

- **SC-001**: All session times display in consistent 12-hour format — zero instances of 24-hour format in the dashboard
- **SC-002**: Build passes with zero TypeScript errors after all changes
- **SC-003**: Build passes with zero lint errors (dashboard-specific) after all changes
- **SC-004**: Zero keyboard focusability issues on hidden FAB buttons (verified via keyboard tab test)
- **SC-005**: All Material Symbols icon spans in dashboard components have `aria-hidden="true"`
- **SC-006**: Error banners are announced by screen readers immediately on render

## Assumptions

- The `formatTime` utility function in `src/utils/formatting.ts` already handles null/undefined input gracefully — if not, null guards will be added
- The `dashboardKeys` factory is already exported from `useDashboard.ts` and consumed by `AttendanceGrid`, `AttendanceMobileSheet`, and `useGroupQueries` — consumers will be updated in the same migration
- Unused barrel type re-exports can be safely removed if no build errors result; otherwise they will be kept as-is
- The `noUnusedLocals` TypeScript flag will catch any accidentally-removed imports during dead code cleanup
