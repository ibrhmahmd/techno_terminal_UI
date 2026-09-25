# Removed API Endpoints - Backend Notice

**Date:** April 26, 2026  
**Commit:** `2b4a0c5`  
**Status:** Frontend no longer uses these endpoints - Safe to remove from backend API

---

## Endpoints Removed from Frontend

### 1. Dashboard Summary
```
GET /api/v1/analytics/dashboard/summary
```
**Replaced by:** `GET /api/v1/dashboard/daily-overview`

**Rationale:** The new consolidated endpoint provides all dashboard data (groups, instructors, sessions, roster) in a single request with lookup tables.

---

### 2. Daily Schedule
```
GET /api/v1/academics/sessions/daily-schedule
```
**Status:** Completely unused - No replacement needed

**Rationale:** Frontend now uses `/dashboard/daily-overview` which includes today's schedule embedded.

---

### 3. Group Roster (Analytics Module)
```
GET /api/v1/analytics/academics/groups/{group_id}/roster?level_number={n}
```
**Replaced by:**
- Dashboard: Roster embedded in `/dashboard/daily-overview` response
- Group Detail: `GET /api/v1/academics/groups/{group_id}/attendance?level_number={n}`

**Rationale:** Roster data is now embedded in the consolidated endpoints, eliminating the N+1 query problem.

---

## TypeScript Types Also Removed

| Type | Module | Notes |
|------|--------|-------|
| `DailyScheduleItem` | `src/api/academics/types/sessions` | Unused |
| `GetGroupRosterParams` | `src/api/enrollments/types` | Unused |

---

## API Documentation Updates Needed

Please update the following documentation files to mark these endpoints as deprecated/removed:

1. `docs/api/analytics/academic.md`
   - Remove or deprecate `GET /analytics/dashboard/summary`
   - Remove or deprecate `GET /analytics/academics/groups/{group_id}/roster`

2. `docs/api/academics/sessions.md`
   - Remove or deprecate daily schedule endpoint if documented

---

## Current Active Dashboard Endpoints (For Reference)

| Endpoint | Purpose |
|----------|---------|
| `GET /dashboard/daily-overview?date={YYYY-MM-DD}&include_attendance={bool}` | Main dashboard data |
| `GET /academics/groups/enriched` | All groups list |
| `GET /academics/groups/{id}/attendance?level_number={n}` | Group attendance grid |
| `GET /analytics/bi/revenue-metrics` | BI revenue data |
| `GET /analytics/bi/instructor-performance` | BI instructor metrics |
| `GET /analytics/academics/student-progress` | Student progress reports |

---

*Frontend migration complete - Safe to remove deprecated backend endpoints*
