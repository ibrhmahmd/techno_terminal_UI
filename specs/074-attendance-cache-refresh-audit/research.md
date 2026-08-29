# Research — Attendance Grid Cache/Update/Refresh Audit Fix

Phase 0 output for `074-attendance-cache-refresh-audit`.

## 0.1 Where should the shared cache-invalidation helper live?

**Decision**: New hook `src/hooks/useAttendanceCaches.ts` exporting `useAttendanceInvalidation(groupId)` that returns an `invalidateAttendanceCaches({ level?, selectedDate? })` function, plus a standalone `invalidateSessionCaches(qc, { groupId, level, selectedDate })` util in `src/utils/attendanceInvalidation.ts`.

**Rationale**: Four call sites need identical invalidation — the 5 grid session-lifecycle handlers, `handleSaveAll`, `AttendanceMobileSheet.handleSave`, dashboard `AttendanceGrid` render, and the existing `useSessionMutations` hook (which today misses `groupAttendance` + `dashboard.overview`). Centralizing guarantees the group grid can never go stale again and keeps the crucial `groupAttendance` key present everywhere.

**Alternatives considered**:
- Put it inside each component (`AttendanceGrid`) — rejected: mobile sheet and `useSessionMutations` are separate surfaces; duplication caused this bug.
- Extend existing `useSessionMutations` only — rejected: grid+sheet don't use it today; mixing React Query `useMutation` orchestration with the grid's batch-save model adds risk.

**Design**:
```ts
// src/utils/attendanceInvalidation.ts
export function invalidateSessionCaches(
  qc: QueryClient,
  { groupId, level, selectedDate }: { groupId: number; level?: number | null; selectedDate?: string },
): Promise<void[] | void> {
  return Promise.all([
    selectedDate ? qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) }) : Promise.resolve(),
    level != null ? qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) }) : Promise.resolve(),
    qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) }),
  ])
}
```
`level` is optional because `useSessionMutations`/`groupSessions`-based surfaces don't always know the current level.

## 0.2 How to stabilize `handleToggle` (remove `[students]` dep)?

**Decision**: Consolidate `localOverrides` + `pendingChanges` + `dirtySessions` + `sessionSaveStatus` into a single `useReducer` inside `AttendanceGrid`. The reducer derives current status from baseline (session attendance, stable) + pending override, so `handleToggle` becomes a stable `useCallback(..., [sessions])`.

**Rationale**: The root cause of the memo churn is that `handleToggle` closes over the derived `students` array, which is recreated on every `localOverrides` change. When `onToggle` identity changes, `AttendanceCell.memo` is defeated and the whole grid re-renders per toggle. A reducer gives a single, predictable state transition and removes the dependency on derived render data.

**Alternatives considered**:
- Drop `useReducer`, just read current status from baseline `sessions` + `setLocalOverrides(prev => …)` using `prev` inside the updater, dispatching `setPendingChanges` from within. — rejected: dispatching other state setters inside a reducer/updater is a side-effect pattern that risks stale `pendingChanges`; reducer is cleaner and still testable.
- Keep `students` dep but `React.memo` the rows. — rejected: correct fix is making the callback stable, not papering over re-renders.

**Design**: `AttendanceGrid` gets `useReducer(gridReducer, initialState)` where `gridReducer` handles `{ type: 'toggle', studentId, sessionId, baseline }` and returns `{ localOverrides, pendingChanges, dirtySessions, sessionSaveStatus }`. `getNextStatus` (extracted, see 0.3) resolves the next status inside the reducer. `handleToggle = useCallback((s,e) => dispatch({ type:'toggle', ... }), [sessions])` — but the dispatch argument needs the session baseline; pass `sessions` as a stable ref read, or compute baseline in `onToggle` and pass it in the action. To keep `onToggle` maximally stable we pass `(studentId, sessionId)` only and have the reducer read baseline from a `sessionsRef`. Document this in the design (0.6).

## 0.3 Where should `getNextStatus` live (shared)?

**Decision**: New `src/utils/attendanceStatus.ts` exporting `getNextStatus(current: AttendanceStatus): AttendanceStatus` and a shared `ATTENDANCE_STATUSES` const. Both `AttendanceGrid` (remove module-private copy) and `AttendanceMobileSheet.handleStudentTap` import it.

**Rationale**: The cycle is business logic duplicated in two places (grid `getNextStatus`, sheet inline if/else); a future status change must touch one file.

## 0.4 Which attendance type copy is the source of truth?

**Decision**: Keep `src/api/academics/groups/newEndpoints.ts` (and its re-exports via `academics/groups/index.ts` / `academics/index.ts`) as the single source for `AttendanceRosterDTO|AttendanceSessionDTO|AttendanceLevelResponse` and `getAttendanceForLevel`. Convert `src/api/attendance/types.ts` to re-export from `academics` and delete its duplicates; `src/api/attendance/attendance.ts` re-exports `getAttendanceForLevel` from academics and keeps only `markAttendance`.

**Rationale**: `attendanceTransforms.ts` already imports from `academics`; the academics barrel already re-exports these. Making `api/attendance` re-export keeps the existing consumer imports (`useGroupAttendance.ts` → `../api/attendance`) working unchanged, while ensuring one implementation. `AttendanceEntry` / `AttendanceStatus` (frontend view-models, not wire DTOs) stay in `api/attendance/types.ts`.

**Consideration**: This deletes the `getAttendanceForLevel` duplicate in `attendance.ts` — verify the academics version returns the same shape (it does, byte-identical body).

## 0.5 How to fix the mobile missing-status default (US-2)?

**Decision**: Change `AttendanceMobileSheet.tsx:276` default from `'absent'` to `'not_taken'`, and normalize the lookup key with `Number(student.student_id)` defensively. Also change `AttendanceTableBody.tsx:35` from `?? 'absent'` to `?? 'not_taken'` for consistency (currently unreachable on desktop because the grid memo fills every key, but it's a misleading/divergent default).

**Rationale**: Mobile's `localAttendance` is keyed from `selectedSession.attendance` records (only recorded students), so an unrecorded roster student reads `undefined` and wrongly renders red "Absent". Desktop already renders "Not Taken" for an empty record — mobile must match. The `Number()` coercion guards against any string/number mismatch.

## 0.6 How to fix notes state-derivation fragility (rerender-derived-state)?

**Decision**: Keep the existing `useEffect` + `initialSessionNotes` + `dirtyNotes` guard (the inline "Fix 1" comment shows it's load-bearing for the dirty-note textarea). No change to this logic in v1 — it is already correct and the risk of destabilizing the note-save path outweighs the perf gain (a single extra render on mount). Document as accepted behavior.

**Alternatives considered**: Remove the effect and key the grid by `groupId+level`. Rejected for v1 — remounting the grid on level switch has ripple effects (scroll position, state) across both surfaces.

## 0.7 Performance: index roster/session lookups

**Decision**:
- In `AttendanceGrid` `students` memo, pre-index each session's attendance into a `Map<student_id, status>` once (not per-row `.find`).
- In `transformSessions`, build `rosterById = new Map(roster.map(r => [r.student_id, r]))` once and look up by `Number(studentId)` instead of `roster.find` per entry.
- Wrap `transformRoster`/`transformSessions` calls in `LevelAttendancePanel` with `useMemo`.
- Parallelize `handleSaveAll` cache invalidation via the shared helper (0.1).

**Rationale**: Nested `.find` in loops is O(n²); harmless at small roster sizes but repeatedly re-run on every render (unmemoized) and every toggle (memo). Indexing + memoizing removes the wasted work with no behavior change.

## 0.8 Session-status union single source?

**Decision**: Introduce a shared `export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'` in `src/api/types.ts` (or the academics sessions types) and import it in the ~6 inline-union sites. Low-risk refactor; the union is verified consistent today — this only prevents future drift.

## 0.9 Mobile save + toggle model

**Decision**: The mobile sheet keeps its immediate-save UX (spec requires it), but its `handleSave` switches to the shared `invalidateSessionCaches` helper (0.1) and imports shared `getNextStatus` (0.3). It does **not** adopt the grid's batch `useReducer` model — different UX, keep scope tight.

## 0.10 Unresolved / needs decision

None — all technical decisions resolved from source. Two naming-suffix cleanups (EditSessionPopup→EditSessionModal, PaymentSummaryStrip) are optional polish; include `EditSessionModal` rename as a low-effort consistency win, defer the strip rename to avoid touching the dashboard surface needlessly.

## Decisions Summary

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | `useAttendanceInvalidation` hook + `invalidateSessionCaches` util | one helper everywhere; fixes missing `groupAttendance` invalidation |
| 2 | `useReducer` consolidation in grid | stable `handleToggle`, restores `AttendanceCell.memo` |
| 3 | `getNextStatus` in `utils/attendanceStatus.ts` | single toggle-cycle definition |
| 4 | academics `newEndpoints.ts` = source of truth; attendance re-exports | kill duplicate types/function |
| 5 | mobile default `?? 'not_taken'` + key normalization | mobile matches desktop "Not Taken" |
| 6 | keep notes effect as-is | load-bearing for dirty-note textarea; low perf cost |
| 7 | index map lookups + memoize transforms | remove wasted O(n²) recompute |
| 8 | shared `SessionStatus` union type | prevent future drift |
| 9 | mobile keeps immediate-save UX, uses shared helpers | respect UX, limit scope |
