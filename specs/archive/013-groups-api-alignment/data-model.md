# Data Model: Groups API Alignment

## Entity: Group

Represents a scheduled group of students enrolled in a course.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Unique identifier |
| `course_id` | `number` | Yes | Associated course |
| `name` | `string` | Yes | Group name (was `group_name`) |
| `status` | `'active' \| 'inactive' \| 'completed'` | Yes | Lifecycle status (was `'archived'`, now `'completed'`) |
| `capacity` | `number` | Yes | Maximum student count (was `max_capacity`) |
| `current_level` | `number` | Yes | Active level number |
| `instructor_id` | `number` | Yes | Assigned instructor |
| `schedule` | `Schedule` | Yes | Nested schedule object |
| `start_date` | `string` (ISO date) | Yes | Group start date |

### State Transitions

```
active → inactive    (deactivate/suspend)
active → completed   (archive)
inactive → active    (reactivate)
```

## Entity: Schedule (Nested)

Replaces flat `default_day`, `default_time_start`, `default_time_end` fields.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `day` | `string` | Yes | Day of week (e.g., "Sunday") |
| `start_time` | `string` | Yes | Start time (e.g., "10:00") |
| `end_time` | `string` | Yes | End time (e.g., "12:00") |

## Entity: EnrichedGroup

Group with resolved names for display purposes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `number` | Yes | Group ID |
| `name` | `string` | Yes | Group name |
| `course_name` | `string` | Yes | Resolved course name |
| `instructor_name` | `string` | Yes | Resolved instructor name |
| `status` | `'active' \| 'inactive' \| 'completed'` | Yes | Status |
| `capacity` | `number` | Yes | Capacity |
| `current_level` | `number` | Yes | Current level |

## Entity: ScheduleGroupInput (Create Request)

Request body for `POST /academics/groups`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `course_id` | `number` | Yes | Course to associate |
| `name` | `string` | Yes | Group name |
| `capacity` | `number` | Yes | Max students |
| `instructor_id` | `number` | Yes | Assigned instructor |
| `schedule` | `Schedule` | Yes | Nested schedule object |
| `start_date` | `string` (ISO date) | Yes | Start date |

## Entity: UpdateGroupDTO (Update Request)

Partial update for `PATCH /academics/groups/{id}`. All fields optional.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | No | Group name |
| `capacity` | `number` | No | Max students |
| `schedule` | `Schedule` | No | Nested schedule object |
| `instructor_id` | `number` | No | Assigned instructor |
| `notes` | `string` | No | Group notes |

## Relationships

```
Course (1) ─── (N) Group
Instructor (1) ─── (N) Group
Group (1) ─── (N) GroupLevel
GroupLevel (1) ─── (N) Session
GroupLevel (1) ─── (N) Enrollment
Enrollment (N) ─── (1) Student
```

## Validation Rules

- `name`: max 255 characters
- `capacity`: positive integer
- `schedule.day`: valid day of week
- `schedule.start_time`, `schedule.end_time`: valid time format (HH:MM)
- `start_date`: valid ISO date (YYYY-MM-DD)
- `start_time` must be before `end_time`
