# Plan: Remove Null Attendance Status

## Context

The current `AttendanceStatus` type is `'present' | 'absent' | 'cancelled' | null`. The `null` value represents "unmarked" — a student with no attendance record. This causes a bug: when saving attendance, `markAttendance` filters out null entries (line 9-11 of `attendance.ts`), so unmarked students can never be batch-saved. They stay unmarked forever.

**Goal**: Remove `null` entirely. Default unmarked students to `absent`. Toggle cycle becomes `absent → present → cancelled → absent` (3 states, no unmarked).

**Backend compatibility**: The API already accepts `present`/`absent`/`cancelled`. It returns `null` in attendance Records for unmarked students — the frontend will map `null → absent` on read. No backend changes needed.

---

## Implementation

### Step 1: Core Type Change

**`src/api/attendance/types.ts`**
- Change `AttendanceStatus` to `'present' | 'absent' | 'cancelled'` (remove `| null`)
- `AttendanceEntry.status` inherits from `AttendanceStatus` — no change needed
- Keep `AttendanceSessionDTO.attendance` as `Record<string, 'present' | 'absent' | 'excused' | 'late' | null>` — this is the **backend type**, it still returns null

### Step 2: markAttendance — Remove Null Filtering

**`src/api/attendance/attendance.ts`**
- Change parameter type: `status: 'present' | 'absent' | 'cancelled'` (remove `| null`)
- Remove the `entries.filter(e => e.status !== null)` — send all entries as-is
- The payload type already matches (`'present' | 'absent' | 'cancelled'`)

### Step 3: mapStatus — Map Backend Null to Absent

**`src/utils/attendanceTransforms.ts`**
- `mapStatus` return type: remove `| null`
- Map `null → 'absent'` (backend null = unmarked = absent)
- Keep `'excused'`/`'late'` → `'present'`

### Step 4: Dashboard Types — Keep Backend Null, Remove Frontend Null

**`src/api/dashboard/types/models.ts`**
- `AttendanceRecordDTO.status`: keep `| null` — this mirrors the backend response
- The frontend will handle the null → absent mapping at the data layer

### Step 5: Toggle Cycle

**`src/components/attendance/AttendanceGrid.tsx`**
- `getNextStatus`: change cycle to `absent → present → cancelled → absent`
- `handleToggle`: remove `|| null` fallback (line 226), remove null check gating entry creation (line 241)
- `students` derivation: `record?.status || 'absent'` instead of `|| null`

**`src/components/attendance/AttendanceMobileSheet.tsx`**
- `handleStudentTap`: new cycle `absent → present → cancelled → absent`
- Remove `null` key from `statusConfig`
- Fix status lookup: `statusConfig[status]` (no null fallback needed)

### Step 6: Remove Empty/Null Visual State

**`src/components/attendance/AttendanceCell.tsx`**
- Remove `ICONS.empty` entry
- Remove the fallthrough to `ICONS.empty` in render — always show one of present/absent/cancelled
- Update `aria-label` to always use the status string

**`src/components/attendance/AttendanceTableBody.tsx`**
- Remove `|| null` fallback — status is always a string now

### Step 7: Clean Up Imports/Types

**`src/components/attendance/types.ts`** — no change (inherits from `AttendanceStatus`)

**`src/api/crm/students/types/models.ts`**
- `SessionAttendanceItem.status`: this is a separate CRM type — leave as-is (backend can return null for CRM student history)

---

## Files Modified (ordered)

1. `src/api/attendance/types.ts` — type change
2. `src/api/attendance/attendance.ts` — remove null filter
3. `src/utils/attendanceTransforms.ts` — mapStatus maps null → absent
4. `src/components/attendance/AttendanceGrid.tsx` — toggle cycle + null removal
5. `src/components/attendance/AttendanceMobileSheet.tsx` — toggle cycle + null config
6. `src/components/attendance/AttendanceCell.tsx` — remove empty state
7. `src/components/attendance/AttendanceTableBody.tsx` — remove null fallback

## Not Modified

- `src/api/dashboard/types/models.ts` — keeps null (backend mirror)
- `src/api/academics/groups/newEndpoints.ts` — keeps null (backend mirror)
- `src/api/crm/students/types/models.ts` — separate CRM concern
- `src/hooks/useGroupAttendance.ts` — no changes needed

## Verification

1. `npm run build` — zero errors
2. `npm run lint` — zero warnings for attendance files
3. Manual: students with no backend record show as absent (red ❌)
4. Manual: toggle cycle absent → present → cancelled → absent
5. Manual: save sends all entries (no null filtering)
6. Manual: after save, unmarked students persist as absent
