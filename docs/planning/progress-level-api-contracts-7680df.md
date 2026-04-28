# Progress Level API Contracts

API documentation for the enhanced `POST /api/v1/academics/groups/{group_id}/progress-level` endpoint with override options.

---

## Endpoint

### POST /api/v1/academics/groups/{group_id}/progress-level

Progress a group to the next level (or target level) with optional overrides for instructor, course, session start date, and group name.

**Auth:** `require_admin`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group_id` | integer | Yes | ID of the group to progress |

---

## Request Schema

### ProgressGroupLevelRequest

```python
class ProgressGroupLevelRequest(BaseModel):
    price_override: Optional[Decimal] = None           # None/0 uses course default price
    target_level: Optional[int] = None                   # If None, defaults to current + 1
    auto_migrate_enrollments: bool = True                # If False, creates empty level
    complete_current_level: bool = True                  # If False, keeps current level active
    instructor_id: Optional[int] = None                  # Override group's default instructor
    session_start_date: Optional[date] = None            # YYYY-MM-DD format
    course_id: Optional[int] = None                      # Override group's course
    group_name: Optional[str] = None                     # Override group name (max 255 chars)
```

**Request Example:**
```json
{
  "price_override": 1200.00,
  "target_level": 3,
  "auto_migrate_enrollments": true,
  "complete_current_level": true,
  "instructor_id": 8,
  "session_start_date": "2026-05-01",
  "course_id": 5,
  "group_name": "Advanced Python - Mon 6PM"
}
```

**Field Behaviors:**

| Field | Default | Behavior |
|-------|---------|----------|
| `price_override` | `null` | Custom price for new enrollments; null/0 uses course default |
| `target_level` | `current + 1` | Level number to progress to; must be > current level |
| `auto_migrate_enrollments` | `true` | Migrate active enrollments to new level; false creates empty level |
| `complete_current_level` | `true` | Mark current level as completed; false keeps it active |
| `instructor_id` | `group.instructor_id` | Validates employee exists; updates group and new level instructor |
| `session_start_date` | calculated from `default_day` | First session date; subsequent sessions follow `default_day` pattern |
| `course_id` | `group.course_id` | Validates course exists; changes group course and logs to history |
| `group_name` | `group.name` | Updates group name atomically with progression |

---

## Response Schema

### ProgressGroupLevelResult

```python
class ProgressGroupLevelResult(BaseModel):
    old_level_number: int
    new_level_number: int
    enrollments_migrated: int
    sessions_created: int
    message: str
```

**Response Example:**
```json
{
  "data": {
    "old_level_number": 1,
    "new_level_number": 3,
    "enrollments_migrated": 15,
    "sessions_created": 5,
    "message": "Group progressed from level 1 to 3. 5 sessions created, 15 enrollments migrated, name updated, course changed to 5, instructor updated."
  },
  "message": "Group progressed from level 1 to 3. 5 sessions created, 15 enrollments migrated, name updated, course changed to 5, instructor updated.",
  "success": true
}
```

---

## Internal DTOs

### ProgressLevelDTO (Service Layer)

```python
class ProgressLevelDTO(BaseModel):
    group_id: int
    price_override: Optional[Decimal] = None
    auto_migrate_enrollments: bool = True
    target_level: Optional[int] = None
    complete_current_level: bool = True
    instructor_id: Optional[int] = None
    session_start_date: Optional[date] = None
    course_id: Optional[int] = None
    group_name: Optional[str] = None
```

---

## Error Responses

| Status | Code | Description |
|--------|------|-------------|
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | User lacks admin privileges |
| `404` | Not Found | Group not found |
| `404` | Not Found | Instructor (if provided) not found |
| `404` | Not Found | Course (if provided) not found |
| `422` | Unprocessable | Target level <= current level |
| `409` | Conflict | Target level already exists |

**Error Example:**
```json
{
  "detail": "Instructor 999 not found"
}
```

---

## Side Effects

When overrides are applied, the following database changes occur atomically:

| Override | Database Changes |
|----------|-----------------|
| `instructor_id` | `groups.instructor_id` updated; `group_levels.instructor_id` set to new value |
| `course_id` | `groups.course_id` updated; `GroupCourseHistory` record created with audit note |
| `group_name` | `groups.name` updated |
| `session_start_date` | Affects first `CourseSession.session_date` calculation |

---

## Migration from schedule-level

The `POST /api/v1/academics/groups/{group_id}/schedule-level` endpoint has been removed.

**Old Call:**
```http
POST /api/v1/academics/groups/27/schedule-level
{
  "level_number": 2,
  "instructor_id": 8,
  "price_override": 1200.00,
  "start_date": "2026-05-01"
}
```

**New Equivalent:**
```http
POST /api/v1/academics/groups/27/progress-level
{
  "target_level": 2,
  "instructor_id": 8,
  "price_override": 1200.00,
  "session_start_date": "2026-05-01",
  "auto_migrate_enrollments": false,
  "complete_current_level": false
}
```
