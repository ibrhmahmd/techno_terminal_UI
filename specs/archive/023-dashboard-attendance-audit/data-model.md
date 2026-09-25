# Data Model: Dashboard & Attendance Cache

> **Note**: This is an existing-data-model reference, not a new schema. No entities are being added — this documents the cache relationships relevant to invalidation fixes.

## Dashboard Overview

| Field | Source | Cached By |
|-------|--------|-----------|
| `scheduled_groups` | API `GET /dashboard/overview` | `dashboardKeys.overview(date)` |
| `groups` | API `GET /dashboard/overview` | `dashboardKeys.overview(date)` |
| `instructors` | API `GET /dashboard/overview` | `dashboardKeys.overview(date)` |
| `summary` | API `GET /dashboard/overview` | `dashboardKeys.overview(date)` |

## Group Attendance

| Field | Source | Cached By |
|-------|--------|-----------|
| Session attendance per student | API `GET /groups/:id/attendance/:level` | `queryKeys.groupAttendance(groupId, levelNumber)` |

## Cache Invalidation Graph

```
AttendanceGrid (mark, cancel, edit session)
  ├── invalidates → dashboardKeys.overview(date)       [MISSING — needs fix]
  └── invalidates → queryKeys.groupAttendance(id, level) [MISSING — needs fix]

useMarkAttendance (dashboard/useAttendance.ts — DEAD)
  ├── invalidates → dashboardKeys.sessions(groupId)    [exists]
  ├── invalidates → dashboardKeys.overview(date)       [exists]
  └── invalidates → queryKeys.groupAttendance(id, level) [MISSING — needs fix]
```

## Affected API Endpoints (read-only reference)

| Endpoint | Called From | Cache Key |
|----------|-------------|-----------|
| `GET /api/v1/dashboard/overview` | `useDashboard(selectedDate)` | `dashboardKeys.overview(date)` |
| `POST /api/v1/attendance/:sessionId/mark` | `AttendanceGrid.saveChanges` | No key (mutation endpoint) |
| `POST /api/v1/attendance/sessions/:id/cancel` | `AttendanceGrid.handleCancelSession` | No key (mutation endpoint) |
| `PUT /api/v1/attendance/sessions/:id` | `AttendanceGrid.handleSaveEditedSession` | No key (mutation endpoint) |
| `GET /api/v1/hr/employees` | `EditSessionPopup` (useEffect) | No key — needs `useQuery` |
| `GET /api/v1/groups/:id/attendance/:level` | `useGroupAttendance` | `queryKeys.groupAttendance(id, level)` |
