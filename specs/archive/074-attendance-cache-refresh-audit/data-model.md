# Data Model — Attendance Grid Cache/Update/Refresh

Phase 1 output. This documents the in-app data/type model the refactor touches. The backend owns wire DTOs; the frontend owns view-models and cache state.

## Entities

### AttendanceSessionDTO (wire, single source: `academics/groups/newEndpoints.ts`)

Represents one scheduled class occurrence for a level.

| Field | Type | Notes |
|-------|------|-------|
| `session_id` | number | PK |
| `session_number` | number | ordinal |
| `date` | string | ISO date |
| `time_start` / `time_end` | string | |
| `status` | `'scheduled' \| 'completed' \| 'cancelled'` | use shared `SessionStatus` union |
| `is_extra_session` | boolean | |
| `notes` | `string \| null` | normalized empty→null on save |
| `attendance` | `Record<studentId, 'present'\|'absent'\|'excused'\|'late'\|null>` | raw wire map |

**Refactor**: `SessionStatus` extracted to a single shared union; `AttendanceSessionDTO` (and `AttendanceRosterDTO`, `AttendanceLevelResponse`) defined once in academics and re-exported from `api/attendance`.

### AttendanceRecord (wire entry)

One student's status for a session. In the wire API this is the value of `attendance[studentId]`; after `transformSessions` it becomes the frontend `{ student_id, student_name, gender, status }` shape consumed by `SessionWithAttendanceDTO`.

### GroupLevel

Owns `roster: AttendanceRosterDTO[]` and `sessions: AttendanceSessionDTO[]`. The attendance grid is keyed per `groupId` + `levelNumber` (`queryKeys.groupAttendance(groupId, levelNumber)`).

### AttendanceStatus (frontend view model, `api/attendance/types.ts`)

`'present' | 'absent' | 'not_taken'`. Wire `excused`/`late` collapse to `present`, `null`/`cancelled` → `not_taken` (via `mapStatus`).

## State shapes (component-local)

### AttendanceGrid — consolidated `useReducer` state

| Slice | Type | Purpose |
|-------|------|---------|
| `localOverrides` | `Map<"studentId-sessionId", AttendanceStatus>` | optimistic toggle state merged into derived rows |
| `pendingChanges` | `Map<sessionId, { student_id, status }[]>` | queued batch-save entries |
| `dirtySessions` | `Set<sessionId>` | sessions awaiting save |
| `sessionSaveStatus` | `Map<sessionId, 'idle'\|'saving'\|'success'\|'error'>` | per-session footer state |

**Reducer action**: `{ type: 'toggle', studentId, sessionId, baseline }` → derives next status via shared `getNextStatus`, updates all slices together. This removes the `handleToggle` dependency on the derived `students` memo.

### Cache keys (contract, from `queryKeys.ts`)

| Key factory | Array | Invalidated by |
|-------------|-------|----------------|
| `groupAttendance(id, levelN)` | `['groups', id, 'attendance', levelN]` | every attendance/session mutation |
| `groupLevels(id)` | `['groups', id, 'levels']` | session lifecycle + attendance save |
| `dashboard.overview(date)` | `['dashboard','overview',date]` | when `selectedDate` set |
| `groupSessions(id)` | `['dashboard','sessions',id]` | `useSessionMutations` path |

**Invariant**: Every mutation that changes a session or its attendance MUST call the shared `invalidateSessionCaches` covering all three (or the appropriate subset) caches.

## Validation rules (from spec)

- Missing attendance record → `not_taken`, identical on desktop + mobile.
- `student_id` lookups normalize through `Number(...)` to avoid string/number mismatch.
- Notes: empty string normalized to `null` on save; dirty-notes preserved across refetch (`dirtyNotes.size` guard).
