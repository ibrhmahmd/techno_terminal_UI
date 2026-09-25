# Feature Audit Report: Attendance Grid — Caching, Updates & Refresh

Generated: 2026-08-29 | Phases: bug, data-fetch, react-perf, arch-compliance | Mode: standard
Scope: `src/components/attendance/*`, `src/hooks/useGroupAttendance.ts`, `src/utils/attendanceTransforms.ts`, `src/components/groups/LevelsTab.tsx`, `src/components/dashboard/GroupSessionCard.tsx`, `src/pages/DashboardPage.tsx`, `src/api/attendance/*`

## Severity Heatmap
🟥 Critical: 1 &nbsp; 🟧 High: 5 &nbsp; 🟨 Medium: 5 &nbsp; 🟩 Low: 8

## Breakdown by Phase
| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug   | 0        | 1    | 1      | 1   | 3     |
| Fetch | 1        | 0    | 1      | 0   | 2     |
| Perf  | 0        | 2    | 2      | 4   | 8     |
| Arch  | 0        | 2    | 1      | 3   | 6     |
| **Total** | **1** | **5** | **5** | **8** | **19** |

## Top Findings (Critical & High)

### 🔴 data-fetch: AttendanceGrid.tsx:145 (also 162, 179, 196, 214)
**Rule**: `missing-invalidate-after-mutation` | **Risk**: breaking
**Finding**: Session lifecycle mutations — `handleCancelSession`, `handleDeleteSession`, `handleReactivateSession`, `handleCompleteSession`, `handleSaveEditedSession` — invalidate only `queryKeys.dashboard.overview(selectedDate)` (when set) + `queryKeys.groupLevels(groupId)`, but **NOT** `queryKeys.groupAttendance(groupId, level)`. On the group-detail page `selectedDate` is `undefined` and `refetchData()` is a no-op that only clears `localOverrides`, so the group grid stays stale after cancel/delete/reactivate/complete/edit. Only `handleSaveAll` (line 368) invalidates `groupAttendance` correctly.

**Before**:
```ts
if (selectedDate) {
  await qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
}
await qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
await refetchData()
```
**After**:
```ts
await Promise.all([
  selectedDate
    ? qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
    : Promise.resolve(),
  qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) }),
  qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) }),
])
await refetchData()
```
**Context**: lines 137-220 (5 handlers), each identical pattern.

### 🟧 bug: AttendanceMobileSheet.tsx:276
**Rule**: `missing-status-default` | **Risk**: moderate
**Finding**: The student row reads `localAttendance.get(student.student_id) ?? 'absent'`, but the grid's canonical default for a missing/empty record is `not_taken` (AttendanceGrid reads `?? 'not_taken'`, and `initialMap` at line 99 coerces `cancelled`/`null` → `not_taken`). A student with no attendance record renders as red "Absent" in the mobile sheet but gray "Not Taken" on desktop — divergent semantics on the same status. Additionally `localAttendance` keys are **numbers** (`record.student_id`) while `student.student_id` may be a string, causing the `?? 'absent'` fallback to fire even for recorded students in some paths.

**Before**: `const status = localAttendance.get(student.student_id) ?? 'absent'`
**After**: `const status = localAttendance.get(Number(student.student_id)) ?? 'not_taken'`

### 🟧 react-perf: AttendanceGrid.tsx:254
**Rule**: `memo-defeated-callback` | **Risk**: breaking
**Finding**: `handleToggle` is `useCallback(..., [students])`. Because `students` (a `useMemo`) is rebuilt on every `localOverrides` change, `onToggle` gets a new identity after EVERY cell toggle. `onToggle` is a prop of every `AttendanceCell` (which is `React.memo`), so the memo can never bail out — toggling one cell re-renders every cell in the whole grid (rows × sessions).

**After**: Read current status from `sessions` + functional `setLocalOverrides` so `handleToggle` no longer depends on the derived `students` array; make `onToggle` identity stable across toggles.

### 🟧 react-perf: AttendanceGrid.tsx:75
**Rule**: `nested-find-recompute` | **Risk**: moderate
**Finding**: The `students` memo is O(roster × sessions) and does `session.attendance.find()` per student per session (line 85). It recomputes the ENTIRE matrix on every `localOverrides` change (every cell toggle) even though only one cell changed. Pre-index each session's attendance into a `Map<student_id, status>` and reuse.

### 🟧 arch-compliance: api/attendance/types.ts:8
**Rule**: `duplicate-type-model` | **Risk**: breaking
**Finding**: `AttendanceRosterDTO`/`AttendanceSessionDTO`/`AttendanceLevelResponse` are byte-for-byte duplicated with `src/api/academics/groups/newEndpoints.ts:72-100`. Two identical `getAttendanceForLevel` functions exist too (`api/attendance/attendance.ts:25` and `newEndpoints.ts:276`). Consumers already split between the twins: `useGroupAttendance.ts:4` imports from `../api/attendance`, but `attendanceTransforms.ts:1-4` imports the same-named types from `../api/academics` — the copies can silently diverge.

### 🟧 arch-compliance: AttendanceGrid.tsx:7
**Rule**: `component-direct-api-calls` | **Risk**: moderate
**Finding**: The shared grid calls API functions directly (`cancelSession/updateSession/deleteSession/reactivateSession/markAttendance`) and orchestrates mutation + manual cache invalidation inline, bypassing the "pages use custom hooks" convention. This duplicates mutation/invalidation logic on every surface that embeds the grid.

## File-by-File Summary
| File | Bugs | Fetch | Perf | Arch | Score |
|------|------|-------|------|------|-------|
| AttendanceGrid.tsx | 0 | 1 | 4 | 2 | 🟧 7 |
| AttendanceMobileSheet.tsx | 1 | 0 | 1 | 2 | 🟨 4 |
| attendanceTransforms.ts | 0 | 0 | 1 | 0 | 🟩 1 |
| LevelsTab.tsx | 0 | 0 | 2 | 0 | 🟨 2 |
| api/attendance/types.ts | 0 | 0 | 0 | 1 | 🟩 1 |
| api/attendance/attendance.ts | 0 | 0 | 0 | 1 | 🟩 1 |
| api/dashboard/types/models.ts | 0 | 0 | 0 | 1 | 🟩 1 |
| components/attendance/types.ts | 0 | 0 | 0 | 1 | 🟩 1 |
| EditSessionPopup.tsx | 0 | 0 | 0 | 1 | 🟩 1 |
| PaymentSummaryStrip.tsx | 0 | 0 | 0 | 1 | 🟩 1 |
| useGroupAttendance.ts | 0 | 1 | 0 | 0 | 🟩 1 |
| **Total** | **1** | **2** | **8** | **11** | **19** |

Score legend: 🟩 0-2 Clean · 🟨 3-5 Needs attention · 🟧 6-10 Significant work · 🟥 10+ Rewrite

## Full Findings Table

| # | Severity | Risk | Category | File:Line | Finding | Rule |
|---|----------|------|----------|-----------|---------|------|
| 1 | critical | breaking | Fetch | AttendanceGrid.tsx:145 | Session lifecycle mutations missing `groupAttendance` invalidation → stale group grid | `missing-invalidate-after-mutation` |
| 2 | high | moderate | Bug | AttendanceMobileSheet.tsx:276 | `?? 'absent'` default diverges from grid's `not_taken`; number/string key mismatch | `missing-status-default` |
| 3 | high | breaking | Perf | AttendanceGrid.tsx:254 | `handleToggle` deps `[students]` defeat `AttendanceCell.memo` → full-grid re-render per toggle | `memo-defeated-callback` |
| 4 | high | moderate | Perf | AttendanceGrid.tsx:75 | `students` memo O(roster×sessions) with nested `.find`, recomputed every toggle | `nested-find-recompute` |
| 5 | high | breaking | Arch | api/attendance/types.ts:8 | Duplicate types + duplicate `getAttendanceForLevel`; consumers import different twins | `duplicate-type-model` |
| 6 | high | moderate | Arch | AttendanceGrid.tsx:7 | Components call API mutations directly, bypassing hooks convention | `component-direct-api-calls` |
| 7 | medium | breaking | Perf | attendanceTransforms.ts:65 | `transformSessions` nested `.find` per entry; not memoized → re-runs every render | `js-index-map` |
| 8 | medium | moderate | Perf | LevelsTab.tsx:560 | `transformRoster`/`transformSessions` run on every render, not memoized | `unmemoized-transform` |
| 9 | medium | moderate | Arch | AttendanceGrid.tsx:17 | `AttendanceGrid` → `groups/detail/AddSessionDialog` bidirectional feature coupling | `cross-feature-import` |
| 10 | medium | moderate | Arch | AttendanceMobileSheet.tsx:140 | Mobile sheet re-implements save + invalidation + toggle cycle independently | `sheet-mutation-duplication` |
| 11 | medium | moderate | Fetch | useGroupAttendance.ts | Verify cache invalidation coverage on both surfaces; confirm 60s staleTime is applied to shared query | `cache-coverage` |
| 12 | medium | moderate | Bug | AttendanceGrid.tsx:103-115 | `sessionNotes` state derived in `useEffect` from `initialSessionNotes` → fragile stale-write window (Fix 1 workaround exists) | `rerender-derived-state` |
| 13 | low | safe | Bug | AttendanceGrid.tsx:19 | Type-only imports verified compliant (`import type` used) | `type-only-imports-verified` |
| 14 | low | safe | Perf | AttendanceGrid.tsx:365 | Sequential cache invalidations in `handleSaveAll`; could be `Promise.all` | `sequential-cache-invalidate` |
| 15 | low | moderate | Perf | LevelsTab.tsx:470 | Heavy `AttendanceGrid` not memoized → parent state changes re-render grid tree | `component-remount-on-switch` |
| 16 | low | moderate | Perf | AttendanceMobileSheet.tsx:277 | `statusConfig` object literal allocated per student per render | `inline-loop-object-literal` |
| 17 | low | safe | Arch | components/attendance/types.ts:3 | `StudentRowData` component-local DTO duplicates/renarrows roster DTO | `component-local-dto-duplication` |
| 18 | low | safe | Arch | EditSessionPopup.tsx:9 | Undocumented `Popup` suffix (should be `Modal`/`Dialog`); `Strip`/`Info`/`Body` suffixes drift too | `component-naming-suffix-drift` |
| 19 | low | safe | Arch | AttendanceGrid.tsx:23 | `getNextStatus()` module-private; duplicated inline in `AttendanceMobileSheet` (110-115) | `duplicated-toggle-cycle` |

## Refactor Targets (from high-risk findings)

1. **Unify session-mutation invalidation** — extract a single helper `invalidateSessionCaches()` that always invalidates `groupAttendance(groupId, level)` + `groupLevels(groupId)` + `dashboard.overview(selectedDate)`, and reuse it in all 5 lifecycle handlers + `handleSaveAll`.
2. **Stabilize `handleToggle` identity** — remove `[students]` dep so `AttendanceCell.memo` works; pre-index session attendance lookups.
3. **Single source of truth for attendance types + status union** — dedupe `api/attendance/*` vs `api/academics/groups/newEndpoints.ts`.
4. **Share `getNextStatus()` and mobile save logic** between desktop grid and mobile sheet.
5. **Memoize transforms** in `LevelAttendancePanel` and index roster lookups (`Map` instead of `.find`).
