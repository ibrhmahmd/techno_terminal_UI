# Feature Audit Report: Attendance Grid
Generated: 2026-07-11 | Phases: bug,dead-code,ts-quality,data-fetch,a11y-ux,react-perf,arch-compliance,ui-polish | Mode: standard

## Severity Heatmap
🟥 Critical: 4   🟧 High: 28   🟨 Medium: 42   🟩 Low: 29   **Total: 103**

## Breakdown by Phase
| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 0 | 2 | 4 | 5 | 11 |
| Dead Code | 0 | 0 | 0 | 6 | 6 |
| TS Quality | 0 | 1 | 3 | 8 | 12 |
| Data Fetch | 0 | 2 | 3 | 2 | 7 |
| A11y/UX | 4 | 16 | 10 | 5 | 35 |
| React Perf | 0 | 6 | 14 | 5 | 25 |
| Arch Compliance | 0 | 4 | 5 | 2 | 11 |
| UI Polish | 0 | 8 | 13 | 5 | 26 |
| **Total** | **4** | **28** | **42** | **29** | **103** |

## Top Findings (Critical & High)

### 🔴 a11y-ux: AttendanceMobileSheet.tsx:140,155 — Icon missing aria-hidden
**Rule**: icon-no-hidden | **Risk**: breaking
Material Symbols icons `arrow_back` and `close` in back/close buttons lack `aria-hidden="true"`.
**After**: Add `aria-hidden="true"` to all decorative Material Symbols icons.

### 🔴 a11y-ux: AttendanceMobileSheet.tsx:154 — Close button no accessible name
**Rule**: button-no-label | **Risk**: breaking
Icon-only close button has no `aria-label` — screen readers announce "button" with no context.
**After**: Add `aria-label="Close attendance sheet"`.

### 🔴 a11y-ux: AttendanceMobileSheet.tsx:136 — Back button no accessible name
**Rule**: button-no-label | **Risk**: breaking
Button contains only a material icon with no accessible name.
**After**: Add `aria-label="Back to sessions"`.

### 🔴 a11y-ux: EditSessionPopup.tsx:310 — Toggle switch missing ARIA semantics
**Rule**: toggle-no-role | **Risk**: breaking
Toggle switch button lacks `role="switch"`, `aria-checked`, and `aria-label`.
**After**: Add `role="switch" aria-checked={isSubstitute} aria-label="Substitute Instructor"`.

### 🟧 bug: AttendanceGrid.tsx:400 — Stale closure in hasChanges after save
**Rule**: stale-closure-hasChanges | **Risk**: breaking
`dirtyNotes.size` read from pre-update closure; `hasChanges` never clears after fully successful save.
**After**: Compute from results array or add `useEffect` watching `pendingChanges` + `dirtyNotes`.

### 🟧 bug: AttendanceGrid.tsx:453 — Stale closure in handleRetrySession
**Rule**: stale-closure-retry-hasChanges | **Risk**: breaking
`pendingChanges.size` captured before `setPendingChanges` runs; `hasChanges` never clears on single-retry.
**After**: Use functional updater with `queueMicrotask` for `setHasChanges`.

### 🟧 data-fetch: AttendanceGrid.tsx:430 — handleRetrySession missing cache invalidation
**Rule**: MISSING_CACHE_INVALIDATION | **Risk**: breaking
Successful retry updates local state but never invalidates `dashboard.overview` or `groupAttendance` caches.
**After**: Add `await qc.invalidateQueries(...)` after successful retry.

### 🟧 data-fetch: AttendanceMobileSheet.tsx:100 — Missing groupAttendance cache invalidation
**Rule**: MISSING_CACHE_INVALIDATION | **Risk**: breaking
Mobile save only invalidates `dashboard.overview`, not `groupAttendance` — desktop shows stale data.
**After**: `await Promise.all([invalidate dashboard.overview, invalidate groupAttendance])`.

### 🟧 react-perf: AttendanceGrid.tsx:264 — handleToggle depends on students state
**Rule**: usecallback-stale-dep | **Risk**: moderate
`handleToggle` depends on `[students]` which changes on every toggle — useCallback recreated every time.
**After**: Use functional state updates to remove `students` dependency.

### 🟧 react-perf: EditSessionPopup.tsx:123 — renderTimeGrid defined inside component
**Rule**: component-inside-component | **Risk**: moderate
JSX-returning function defined inside EditSessionPopup — recreated every render, called twice.
**After**: Extract to standalone `TimeGridSelector` component.

### 🟧 react-perf: AttendanceTableBody.tsx:54 — Inline onToggle per cell
**Rule**: inline-function-jsx | **Risk**: moderate
300+ inline arrow functions created per render (30 students × 10 sessions).
**After**: Pass `disabled` prop to `AttendanceCell` instead of wrapping in closure.

### 🟧 react-perf: AttendanceCell.tsx:28 — Missing React.memo
**Rule**: missing-memo | **Risk**: moderate
Rendered 300+ times; re-renders on every parent state change even when status unchanged.
**After**: Wrap in `React.memo`.

### 🟧 react-perf: StudentInfo.tsx:29 — Missing React.memo
**Rule**: missing-memo | **Risk**: moderate
Re-renders on every grid state change even when props identical.
**After**: Wrap in `React.memo`.

### 🟧 arch-compliance: EditSessionPopup.tsx:6 — Cross-feature HR API import
**Rule**: cross-feature-import-api | **Risk**: moderate
`getEmployees` called inline instead of via React Query hook.
**After**: Create `useEmployees` hook.

### 🟧 arch-compliance: EditSessionPopup.tsx:30 — Inline query key
**Rule**: query-key-standards | **Risk**: moderate
Inline `['employees', 'list']` instead of centralized `queryKeys` factory.
**After**: Add to `queryKeys` factory and use it.

### 🟧 arch-compliance: AttendanceGrid.tsx:17 — Cross-feature AddSessionDialog import
**Rule**: arch-feature-boundary | **Risk**: moderate
`AddSessionDialog` imported from groups domain inside attendance component.
**After**: Move to shared location or use render prop.

### 🟧 arch-compliance: useGroupAttendance.ts:3 — Domain misplacement
**Rule**: domain-misplacement | **Risk**: moderate
`getAttendanceForLevel` lives under `api/academics` instead of `api/attendance`.
**After**: Move to `api/attendance/`.

### 🟧 ui-polish: AttendanceCell.tsx:36 — focus: should be focus-visible:
**Rule**: focus-visible-states | **Risk**: moderate
`focus:ring-secondary/30` triggers on mouse clicks and has low opacity.
**After**: `focus-visible:ring-2 focus-visible:ring-secondary/50`.

### 🟧 ui-polish: AttendanceMobileSheet.tsx:289 — animate-spin no motion-reduce
**Rule**: reduced-motion-support | **Risk**: moderate
Spinner has no `motion-reduce:animate-none` fallback (WCAG 2.3.3).
**After**: Add `motion-reduce:animate-none`.

## File-by-File Summary
| File | Bugs | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|------|----------|----|-------|------|------|------|----|-------|
| AttendanceGrid.tsx | 3 | 3 | 3 | 1 | 1 | 8 | 2 | 4 | 🟥 25 |
| AttendanceMobileSheet.tsx | 2 | 1 | 1 | 2 | 14 | 3 | 0 | 5 | 🟥 28 |
| EditSessionPopup.tsx | 1 | 0 | 2 | 1 | 4 | 2 | 2 | 5 | 🟧 17 |
| AttendanceCell.tsx | 0 | 1 | 0 | 0 | 1 | 2 | 0 | 2 | 🟨 6 |
| AttendanceHeader.tsx | 1 | 0 | 0 | 0 | 1 | 2 | 0 | 2 | 🟨 6 |
| AttendanceTableBody.tsx | 0 | 0 | 1 | 0 | 0 | 2 | 1 | 1 | 🟨 5 |
| SessionActionsRow.tsx | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 1 | 🟩 3 |
| SessionNotesRow.tsx | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 1 | 🟩 3 |
| AttendanceFooter.tsx | 0 | 0 | 1 | 0 | 0 | 2 | 0 | 2 | 🟨 5 |
| StudentInfo.tsx | 0 | 0 | 0 | 0 | 2 | 1 | 0 | 0 | 🟩 3 |
| PaymentSummaryStrip.tsx | 0 | 1 | 0 | 0 | 3 | 1 | 0 | 2 | 🟨 7 |
| useGroupAttendance.ts | 0 | 0 | 0 | 1 | 0 | 0 | 1 | 0 | 🟩 2 |
| attendanceTransforms.ts | 1 | 1 | 1 | 0 | 0 | 0 | 1 | 0 | 🟨 4 |
| attendance.ts (API) | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 0 |

Score legend:
- 🟩 0-2 findings — Clean
- 🟨 3-5 findings — Needs attention
- 🟧 6-10 findings — Needs significant work
- 🟥 10+ findings — Needs rewrite

## Critical Priority Fixes

### 1. Stale closure bugs (AttendanceGrid.tsx:400, 453)
The `handleSaveAll` and `handleRetrySession` functions read `dirtyNotes.size` and `pendingChanges.size` from stale closures, preventing `hasChanges` from ever being cleared after a successful save. The save/cancel footer remains visible indefinitely.

### 2. Missing cache invalidation (AttendanceGrid.tsx:430, AttendanceMobileSheet.tsx:100)
`handleRetrySession` never invalidates caches after success. `AttendanceMobileSheet` only invalidates `dashboard.overview` but not `groupAttendance`, causing stale data on desktop.

### 3. Accessibility violations (AttendanceMobileSheet.tsx, EditSessionPopup.tsx)
20+ icons missing `aria-hidden`, 3 buttons missing `aria-label`, toggle switch missing `role="switch"`, no Escape key handler on bottom sheet, no focus trap.

### 4. Performance: handleToggle stale dep (AttendanceGrid.tsx:264)
`useCallback([students])` recreates on every toggle, invalidating all child component memoization. 300+ `AttendanceCell` components re-render on every state change.
