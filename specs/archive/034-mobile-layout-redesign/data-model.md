# Data Model: Mobile Layout Redesign (034)

**Date**: 2026-06-04

This feature is **purely UI/layout** — no new API endpoints, no new backend types.
All data flows through existing React Query hooks.

---

## Existing Types Used (No Changes)

### From `src/api/dashboard/types/models.ts`

```
GroupInfoDTO          — name, course_name, student_count, instructor_id
InstructorInfoDTO     — id, name
StudentRosterDTO      — student_id, student_name, gender, billing_status, balance
SessionWithAttendanceDTO — session_id, session_number, date, time_start, time_end,
                           status, attendance (AttendanceRecordDTO[])
ScheduledGroupDTO     — group_id, today_session, current_level, roster
DashboardDailyOverviewDTO — root response shape
```

### From `src/api/attendance/types.ts`

```
AttendanceStatus = 'present' | 'absent' | 'cancelled' | null
AttendanceEntry  = { student_id: string; status: AttendanceStatus }
```

---

## New Component Props Interfaces

### `MobileGroupCard` Props
```
groupId:         number
groupName:       string
courseName:      string
instructorName:  string
sessionCount:    number                   // sessions.length for the selected day
studentCount:    number                   // GroupInfoDTO.student_count
todaySession:    TodaySessionDTO | null   // the specific today_session
onOpenAttendance: () => void              // triggers AttendanceMobileSheet
```

### `AttendanceMobileSheet` Props
```
isOpen:             boolean
groupId:            number
groupName:          string
instructorName:     string
sessions:           SessionWithAttendanceDTO[]
roster:             StudentRosterDTO[]
selectedDate:       string
onClose:            () => void
```

### `MobileDashboardFAB` Props
```
todaySessionCount:  number                // passed through from DashboardPage
```

### `MobileTopBar` Props
```
title:  string    // e.g. "Dashboard", "Groups"
```

---

## State Model: `AttendanceMobileSheet`

### Local State (useState)

| State | Type | Purpose |
|-------|------|---------|
| `activeStep` | `'sessions' \| 'students'` | Which view is shown |
| `selectedSession` | `SessionWithAttendanceDTO \| null` | Selected session for step 2 |
| `localAttendance` | `Map<string, AttendanceStatus>` | student_id → status (optimistic) |
| `pendingEntries` | `AttendanceEntry[]` | Queued changes for save |
| `isSaving` | `boolean` | Save in-flight flag |

### Derived State

| Derived | Source |
|---------|--------|
| `displayRoster` | `roster` merged with `localAttendance` overrides |
| `hasChanges` | `pendingEntries.length > 0` |

---

## Hook: `useIsMobile`

New shared hook at `src/hooks/useIsMobile.ts`.

```
Returns: boolean
Mechanism: window.matchMedia('(max-width: 1023px)') 
           + resize listener (via matchMedia.addEventListener)
SSR-safe: initializes to false, updates after mount
```

No Zustand — pure local reactive hook. Consistent with Constitution III (Global State Minimalism).
