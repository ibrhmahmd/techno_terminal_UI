# Contracts — Attendance Grid Cache/Update/Refresh

Phase 1 output. These are the internal frontend contracts the refactor introduces or restores. A React SPA exposes no public API; these are the component/hook/cache invariants other surfaces rely on.

## C-1: `invalidateSessionCaches(qc, opts)`

`src/utils/attendanceInvalidation.ts`

```ts
export function invalidateSessionCaches(
  qc: QueryClient,
  opts: { groupId: number; level?: number | null; selectedDate?: string },
): Promise<unknown>
```

- Invalidates `groupLevels(groupId)` **always**.
- Invalidates `groupAttendance(groupId, level)` **when `level != null`**.
- Invalidates `dashboard.overview(selectedDate)` **when `selectedDate` set**.
- Contract: returns a Promise that the caller MUST await before showing success toasts / clearing dirty state (mirrors the Fix-1 ordering rule already observed in `AttendanceGrid.handleSaveAll`).

## C-2: `useAttendanceInvalidation(groupId)`

`src/hooks/useAttendanceCaches.ts`

```ts
export function useAttendanceInvalidation(groupId: number): {
  invalidate: (opts?: { level?: number | null; selectedDate?: string }) => Promise<unknown>
}
```

- Convenience wrapper over C-1 that binds `qc` + `groupId` via hooks.
- Used by `AttendanceGrid`, `AttendanceMobileSheet`, and (optionally) `useSessionMutations`.

## C-3: `getNextStatus(current)` + `ATTENDANCE_STATUSES`

`src/utils/attendanceStatus.ts`

```ts
export const ATTENDANCE_STATUSES = ['not_taken', 'present', 'absent'] as const
export type CycleStatus = typeof ATTENDANCE_STATUSES[number] // = AttendanceStatus
export function getNextStatus(current: AttendanceStatus): AttendanceStatus // not_taken→present→absent→not_taken
```

- Single source of the toggle cycle; imported by `AttendanceGrid` and `AttendanceMobileSheet`.
- Contract: `getNextStatus` is total — every `AttendanceStatus` input returns a valid next status.

## C-4: `AttendanceGrid` props contract (unchanged shape, verified)

| Prop | Type | Notes |
|------|------|-------|
| `sessions` | `SessionWithAttendanceDTO[]` | transformed input |
| `roster` | `StudentRosterDTO[]` | required |
| `groupId` | number | |
| `level` | number | cache key component |
| `selectedDate?` | string | when set, also invalidates dashboard overview |

Contract: `AttendanceGrid` derives rows from props + local state (no own fetch); consumers must invalidate `queryKeys.groupAttendance(groupId, level)` after mutations.

## C-5: Attendance DTO single-source re-export

`src/api/attendance/types.ts`:
```ts
export type { AttendanceRosterDTO, AttendanceSessionDTO, AttendanceLevelResponse } from '../academics'
export type { AttendanceStatus } from './types'           // stays frontend
export type { AttendanceEntry } = ...                      // stays frontend
```
`src/api/attendance/attendance.ts`:
```ts
export { getAttendanceForLevel } from '../academics/groups'  // single impl
export { markAttendance } = ...                              // stays here
```
- Contract: `getAttendanceForLevel` and the three DTOs exist **exactly once** (in academics); all consumers import the same implementation regardless of which barrel they reference.

## C-6: Cache invalidation coverage map (update/refresh correctness)

| Surface | Mutation | Must invalidate |
|---------|----------|-----------------|
| Grid session lifecycle (cancel/delete/reactivate/complete/edit) | `cancelSession`/`deleteSession`/`reactivateSession`/`updateSession` | `groupAttendance(level)` + `groupLevels` (+ `dashboard.overview` if selectedDate) |
| Grid batch save | `markAttendance` per session + `updateSession` notes | `groupAttendance(level)` + `groupLevels` (+ `dashboard.overview`) |
| Mobile sheet save | `markAttendance` | `groupAttendance(level)` + `groupLevels` (+ `dashboard.overview`) |
| `useSessionMutations` (add/delete/cancel/reactivate) | `addExtraSession`/`deleteSession`/`cancelSession`/`reactivateSession` | `groupLevels` + `groupSessions` (+ `groupAttendance` if level known) |

**This coverage table is the acceptance contract for US-1.** A mutation listed in the left column MUST trigger its right-column invalidations — this is what the audit found missing.
