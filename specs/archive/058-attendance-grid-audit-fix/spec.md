# Attendance Grid Audit Fix

## Overview

Audit and fix of the attendance grid feature across 103 identified issues spanning 8 audit phases: runtime bugs, dead code, TypeScript quality, data fetching patterns, accessibility, React performance, architecture compliance, and UI polish.

The attendance grid is a core feature enabling instructors and admins to mark student attendance for group sessions. It supports both a desktop table grid and a mobile bottom-sheet flow, with batch save, session management (edit/cancel/delete/reactivate/complete), and real-time cache synchronization across dashboard and group detail views.

## User Scenarios & Testing

### Primary User Flows

1. **Mark attendance on desktop**: Instructor opens a group's attendance tab, sees a grid of students × sessions, clicks cells to cycle through present/absent/cancelled, adds session notes, and clicks "Save Changes" to persist all changes in batch.

2. **Mark attendance on mobile**: Instructor taps a group card on the dashboard, selects a session from the mobile sheet, taps each student to cycle their status, and taps "Save Attendance" to persist immediately.

3. **Retry failed saves**: If a save fails for a specific session, the footer shows per-session retry buttons. The instructor clicks retry to re-attempt that session's save without re-saving successful sessions.

4. **Session management**: Instructor edits session details (date, time, instructor, status), cancels or deletes sessions, reactivates cancelled sessions, and marks sessions as completed — all from the attendance grid header actions.

### Testing Scenarios

- Save attendance with notes and verify both persist correctly
- Save attendance, then verify dashboard and group detail pages both reflect the update
- Retry a failed session save and verify caches update across views
- Open edit session modal, cancel without changes, verify no dirty state
- Mark all students as present, save, verify `hasChanges` clears and footer hides
- Navigate away and return to verify data consistency
- Test on mobile viewport to verify sheet flow and save behavior
- Test with keyboard navigation on all interactive controls
- Test with screen reader to verify all icons and buttons are announced correctly

## Functional Requirements

### FR-1: Stale Closure Fix (Critical)
After a successful batch save, the `hasChanges` flag must clear reliably. Currently, `dirtyNotes.size` and `pendingChanges.size` are read from stale closures in `handleSaveAll` and `handleRetrySession`, preventing the save/cancel footer from hiding after all changes are saved.

**Acceptance Criteria**:
- After saving all pending attendance changes and notes, the save/cancel footer hides
- After retrying all failed sessions individually, the save/cancel footer hides
- The `hasChanges` state reflects actual unsaved changes, not stale closure values

### FR-2: Cache Invalidation Consistency (Critical)
All save and retry operations must invalidate both `dashboard.overview` and `groupAttendance` query caches. The mobile sheet and retry handler currently skip one or both invalidations.

**Acceptance Criteria**:
- After saving attendance via mobile sheet, both dashboard and group detail pages reflect updated data
- After retrying a failed session save, dashboard and group detail caches are invalidated
- Cache invalidation uses `Promise.all` for independent queries instead of sequential awaits

### FR-3: Accessibility Compliance (Critical)
All interactive controls must be accessible to screen readers and keyboard-only users. Currently, 20+ icons lack `aria-hidden`, 3 buttons lack `aria-label`, and the toggle switch lacks ARIA semantics.

**Acceptance Criteria**:
- All decorative Material Symbols icons have `aria-hidden="true"`
- All icon-only buttons have descriptive `aria-label` attributes
- The substitute instructor toggle has `role="switch"`, `aria-checked`, and `aria-label`
- The bottom sheet supports Escape key dismissal and focus trapping
- All form inputs have programmatically linked labels via `htmlFor`/`id`
- Data tables have `aria-label` or `caption` for screen reader context
- Loading states use `aria-live="polite"` to announce to screen readers

### FR-4: Reduced Motion Support (High)
All animations and transitions must respect `prefers-reduced-motion`. Currently, spinners, fade-ins, blur effects, and slide transitions have no `motion-reduce` fallback.

**Acceptance Criteria**:
- All `animate-*` utilities have `motion-reduce:animate-none` counterparts
- All `transition-*` utilities have `motion-reduce:transition-none` counterparts
- The `blur-[1px]` on cancelled sessions has `motion-reduce:blur-none`

### FR-5: Focus Visible States (High)
All interactive elements must use `focus-visible:` instead of `focus:` to avoid showing focus rings on mouse clicks. Ring opacity must be increased from 20-30% to 50% for adequate contrast.

**Acceptance Criteria**:
- Form inputs, textareas, and buttons use `focus-visible:ring-2 focus-visible:ring-secondary/50`
- No `focus:ring-*` patterns remain in attendance components
- Focus indicators meet WCAG 2.4.13 (Focus Appearance) requirements

### FR-6: React Performance Optimization (High)
The attendance grid renders 300+ cells (30 students × 10 sessions). Currently, every state change causes all cells to re-render due to missing memoization and unstable callback references.

**Acceptance Criteria**:
- `AttendanceCell` and `StudentInfo` are wrapped in `React.memo`
- `handleToggle` uses functional state updates to avoid depending on `students` state
- Inline arrow functions in `onToggle` props are replaced with stable callbacks or `disabled` prop
- `renderTimeGrid` is extracted as a standalone `TimeGridSelector` component
- Sequential `await` calls for independent cache invalidations are parallelized with `Promise.all`

### FR-7: Dead Code Cleanup (Medium)
Remove unused props, refs, and exports that add noise without functionality.

**Acceptance Criteria**:
- Remove `isLoading` prop from `AttendanceGridProps` (never destructured, local state shadows it)
- Remove `hasError` prop from `AttendanceFooterProps` (never referenced in component body)
- Remove `attendanceTimeoutRef` and its cleanup useEffect (never assigned a timeout)
- Remove `fetchCycleRef` and associated `console.debug` calls (debug-only, no production logic)
- Remove `mapStatus` export from `attendanceTransforms.ts` (only used internally)
- Remove `AttendanceMobileSheetProps` export (never imported externally)
- Remove trivial wrapper functions (`handleClick` in `AttendanceCell`, `handleSaveClick`/`handleCancelClick` in `AttendanceFooter`)

### FR-8: TypeScript Quality (Medium)
Fix type safety issues including unsafe assertions, missing type imports, and redundant patterns.

**Acceptance Criteria**:
- Replace `as` type assertion on PillSelector onChange with runtime validation
- Add `dirtyNotes.size` to useEffect dependency array in `AttendanceGrid.tsx`
- Replace `|| 0` with `?? 0` for null-coalescing instructor ID
- Remove redundant `|| []` fallback on required `roster` prop
- Remove redundant `as` cast on `Object.entries()` in `attendanceTransforms.ts`
- Replace `NEXT_STATE` string-keyed Record with a typed Map
- Deduplicate `StudentRowData` interface by reusing or extracting from `StudentRow`

### FR-9: Architecture Compliance (Medium)
Fix cross-feature imports and domain misplacement to maintain clean module boundaries.

**Acceptance Criteria**:
- Move `getAttendanceForLevel` from `api/academics/` to `api/attendance/`
- Create `useEmployees` hook for the HR API call in `EditSessionPopup` instead of inline `getEmployees`
- Use centralized `queryKeys` factory in `EditSessionPopup` instead of inline `['employees', 'list']`
- Either move `AddSessionDialog` to a shared location or refactor to use a render prop from the parent

### FR-10: UI Polish (Medium)
Fix contrast ratios, color token consistency, and border weight inconsistencies.

**Acceptance Criteria**:
- Replace `text-outline-variant` (border token) with `text-on-surface-variant` for loading/empty state text
- Replace `text-slate-300` on chevron icon with `text-slate-400` for WCAG AA contrast
- Replace raw Tailwind colors (`bg-blue-100`, `bg-teal-100`) with design system tokens where available
- Replace `bg-slate-900/60` backdrop with `bg-black/60` per AGENTS.md convention
- Replace `border-2 border-slate-400` table borders with lighter `border-outline-variant/20`
- Add `aria-live="polite"` to loading states
- Add `aria-label` to the data table for screen reader context
- Add `scope="col"` to header cells

### FR-11: Premature hasChanges Flag (Medium)
Opening the edit session modal currently sets `hasChanges(true)` before any changes are made. Canceling the modal leaves the dirty flag set.

**Acceptance Criteria**:
- `handleEditSession` does not set `hasChanges(true)` when opening the modal
- `hasChanges` is only set when actual edits are saved via `handleSaveEditedSession`

### FR-12: Derived State Cleanup (Medium)
Replace `useEffect`-based derived state with `useMemo` or inline computation to avoid unnecessary re-renders.

**Acceptance Criteria**:
- `sessionNotes` initialization uses `useMemo` instead of `useEffect` + `setSessionNotes`
- `localAttendance` in mobile sheet is initialized in the session selection handler instead of a separate `useEffect`
- `refetchData` in `AttendanceGrid` is replaced with a `useMemo` that transforms props into student rows

## Assumptions

- The existing React Query cache infrastructure (`queryKeys`, `useQuery`, `useMutation`) is available and should be used for all new hooks
- The design system tokens (secondary, error, surface, etc.) defined in Tailwind config are the source of truth for colors
- `formatTime` from `src/utils/formatting.ts` is the standard for time formatting; a similar `formatShortDate` utility may need to be created for date formatting
- `React.memo` is appropriate for leaf components (`AttendanceCell`, `StudentInfo`) that receive stable props
- The `AddSessionDialog` component can remain cross-imported if moving it would be too disruptive — the priority is fixing the attendance grid itself
- `getAttendanceForLevel` can be moved to `api/attendance/` without breaking other consumers since it's only imported by `useGroupAttendance.ts`

## Out of Scope

- Redesigning the attendance grid layout or UX flow
- Adding new features (e.g., bulk attendance, attendance reports)
- Backend API changes
- Mobile responsiveness improvements beyond accessibility fixes
- Test file creation (no existing attendance tests; test infrastructure is separate)

## Dependencies

- React Query cache infrastructure (`queryKeys`, `useQuery`, `useMutation`)
- Design system tokens in Tailwind config
- `formatTime` and `getInitials` utilities from `src/utils/formatting.ts`
- `Modal`, `PillSelector`, `SearchablePillSelector` common components
- `AddSessionDialog` from groups domain (cross-feature import)

## Success Criteria

- All 4 stale closure and cache invalidation bugs are resolved — saves complete and caches refresh reliably
- Attendance grid passes automated accessibility audit with zero critical violations
- Screen reader announces all interactive controls correctly (buttons, toggles, table headers)
- Focus indicators visible on keyboard navigation but hidden on mouse click
- Animations respect `prefers-reduced-motion: reduce`
- `handleToggle` callback identity is stable across renders (does not recreate on toggle)
- `AttendanceCell` does not re-render when sibling cells change
- No `any` types, no inline query keys, no cross-feature API imports in attendance components
- `npm run build` passes with zero errors
- `npm run lint` passes with zero warnings for attendance files
