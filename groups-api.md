# Groups API — Integration Guide

**Base**: `/api/v1` · **Auth**: `Bearer <jwt>` · **Envelope**: `{ "success": true, "data": ... }`

## Auth Roles

| Role | Access |
|------|--------|
| `admin` / `system_admin` | Full read + write |
| Any authenticated | Read all group endpoints |

---

## Endpoints

### Group CRUD (`/academics/groups`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/academics/groups` | Any | List active groups (paginated, skip/limit) |
| `GET` | `/academics/groups/enriched` | Any | Active groups with instructor + course names |
| `GET` | `/academics/groups/archived` | Any | Archived groups (paginated) |
| `GET` | `/academics/groups/search?query=&status=` | Any | Search by name |
| `GET` | `/academics/groups/{id}` | Any | Get group by ID |
| `GET` | `/academics/groups/{id}/enriched` | Any | Group with course + instructor names |
| `POST` | `/academics/groups` | Admin | Create group (atomic: group + Level 1 + sessions) |
| `PATCH` | `/academics/groups/{id}` | Admin | Update group metadata |
| `PATCH` | `/academics/groups/{id}/archive` | Admin | Archive (status → `completed`) |
| `DELETE` | `/academics/groups/{id}` | Admin | Deactivate (status → `inactive`) |
| `POST` | `/academics/groups/{id}/progress-level` | Admin | Progress to next level |
| `GET` | `/academics/groups/{id}/sessions?level=` | Any | List sessions for group |
| `POST` | `/academics/groups/{id}/generate-sessions` | Admin | Generate sessions for a level |

### Grouped / Filtered Lists

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/academics/groups/grouped?group_by=day\|course\|instructor\|status` | Any | Groups grouped by field |
| `GET` | `/academics/groups/by-course/{course_id}` | Any | Groups for a course |
| `GET` | `/academics/groups/by-type/{group_type}` | Any | Groups by type |

### Group Lifecycle (`/academics/groups/{id}/levels`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/academics/groups/{id}/levels/{level_number}` | Any | Get level details |
| `DELETE` | `/academics/groups/{id}/levels/{level_number}` | Admin | Soft delete level (blocked if has sessions/enrollments) |
| `POST` | `/academics/groups/{id}/levels/{level_number}/complete` | Admin | Complete level, progress to next |
| `POST` | `/academics/groups/{id}/levels/{level_number}/cancel` | Admin | Cancel level with reason |
| `GET` | `/academics/groups/{id}/levels/detailed?level_number=` | Any | All levels with sessions + stats |

### Group Details

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/academics/groups/{id}/attendance?level_number=N` | Any | Attendance grid for level |
| `GET` | `/finance/groups/{id}/payments` | Any | Payments grouped by level |
| `GET` | `/academics/groups/{id}/enrollments/all` | Any | All enrollments grouped by level |

### Group Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/academics/groups/{id}/enrollments/analytics?status=&skip=&limit=` | Any | Enrollment history with payment details |
| `GET` | `/academics/groups/{id}/instructors/analytics` | Any | Instructor assignment history |
| `GET` | `/academics/groups/{id}/enrollment-history` | Any | Alias for enrollments/analytics |
| `GET` | `/academics/groups/{id}/instructor-history` | Any | Alias for instructors/analytics |

---

## Key Request Bodies

### Create Group (`POST /academics/groups`)
```json
{
  "course_id": 1,
  "name": "Robotics - Group A",
  "capacity": 20,
  "instructor_id": 5,
  "schedule": { "day": "Sunday", "start_time": "10:00", "end_time": "12:00" },
  "start_date": "2025-09-01"
}
```
Atomic: creates group + Level 1 + sessions in one transaction.

### Update Group (`PATCH /academics/groups/{id}`)
```json
{ "name": "Robotics - Group A (Updated)", "capacity": 25 }
```
Only provided fields are updated.

### Progress Level (`POST /academics/groups/{id}/progress-level`)
```json
{
  "auto_migrate_enrollments": true,
  "session_start_date": "2025-12-01",
  "target_level": 3
}
```

### Cancel Level (`POST /academics/groups/{id}/levels/{level_number}/cancel`)
```json
{ "reason": "Low enrollment" }
```

---

## Key Response Shapes

### Group (GroupPublic)
```json
{
  "id": 1,
  "course_id": 1,
  "name": "Robotics - Group A",
  "status": "active",
  "capacity": 20,
  "current_level": 2,
  "instructor_id": 5,
  "schedule": { "day": "Sunday", "start_time": "10:00", "end_time": "12:00" },
  "start_date": "2025-09-01"
}
```

### Enriched Group
```json
{
  "id": 1,
  "name": "Robotics - Group A",
  "course_name": "Robotics Fundamentals",
  "instructor_name": "Ahmed Hassan",
  "status": "active",
  "capacity": 20,
  "current_level": 2
}
```

### Paginated List (`GET /academics/groups`)
```json
{
  "success": true,
  "data": [{ "id": 1, "name": "...", "status": "active", ... }],
  "total": 42,
  "skip": 0,
  "limit": 50
}
```

### Level Completion (`POST .../levels/{n}/complete`)
```json
{
  "completed_level": { "id": 10, "group_id": 1, "level_number": 1, "status": "completed" },
  "new_level": { "id": 11, "group_id": 1, "level_number": 2, "status": "active" },
  "message": "Group progressed from level 1 to level 2"
}
```

### Progress Level Result
```json
{
  "old_level_number": 1,
  "new_level_number": 2,
  "enrollments_migrated": 15,
  "sessions_created": 8,
  "message": "Progressed successfully"
}
```

---

## Business Rules

- **Create is atomic** — group + Level 1 + sessions created in one transaction
- **Level delete blocked** if level has sessions or enrollments → 409
- **Level complete** creates next level snapshot automatically
- **Archive** sets status → `completed` (preserves enrollments/history)
- **Deactivate** sets status → `inactive` (suspend, can reactivate later)
- **Progress level** migrates enrollments and generates new sessions
- **Grouped listing** supports `group_by`: `day`, `course`, `instructor`, `status`

## Error Responses

```json
{ "success": false, "error": "NotFoundError", "message": "Group 99 not found" }
```

| Error | Status | Meaning |
|-------|--------|---------|
| `NotFoundError` | 404 | Resource not found |
| `ValidationError` | 422 | Invalid request body |
| `ConflictError` | 409 | Level has sessions/enrollments — cannot delete |
| Auth error | 401 | Missing/invalid JWT |

---

## Changes from Previous Version

1. **Removed** — `GroupCompetitionParticipation` model and all competition-related group endpoints
2. **Removed** — entire `app/modules/academics/group/competition/` slice (service, repository, interface)
3. **Router split** — Group CRUD refactored into 4 focused routers:
   - `groups_router.py` — core CRUD, progress-level, sessions
   - `group_directory_router.py` — listing, search, grouped views
   - `group_lifecycle_router.py` — level lifecycle, analytics
   - `group_details_router.py` — attendance, payments, enrollments
4. **Router registration order** — `group_directory_router` MUST be registered before any router with `/{group_id}` paths to avoid route shadowing
