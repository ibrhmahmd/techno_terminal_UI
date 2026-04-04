# Academics API Reference

Base path: `/api/v1/academics`

---

## 🔐 Authentication
All requests MUST include a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <access_token>
```

---

## Schemas

### CoursePublic
```json
{
  "id": 1,
  "name": "Robotics Fundamentals",
  "category": "STEM",
  "description": "Introduction to robotics",
  "price_per_level": 1500.0,
  "sessions_per_level": 12,
  "is_active": true
}
```

### AddNewCourseInput
```json
{
  "name": "string (required)",
  "category": "string (optional)",
  "description": "string (optional)",
  "notes": "string (optional)",
  "price_per_level": "number (required, >0)",
  "sessions_per_level": "integer (required, >=1)"
}
```

### UpdateCourseDTO
```json
{
  "name": "string (optional)",
  "category": "string (optional)",
  "description": "string (optional)",
  "notes": "string (optional)",
  "price_per_level": "number (optional, >0)",
  "sessions_per_level": "integer (optional, >=1)",
  "is_active": "boolean (optional)"
}
```

### GroupPublic
```json
{
  "id": 1,
  "name": "Sat 2PM Robotics",
  "course_id": 1,
  "instructor_id": 1,
  "level_number": 1,
  "max_capacity": 15,
  "default_day": "Saturday",
  "default_time_start": "14:00:00",
  "default_time_end": "16:00:00",
  "is_active": true
}
```

### GroupListItem
```json
{
  "id": 1,
  "name": "Sat 2PM Robotics",
  "course_id": 1,
  "level_number": 1,
  "default_day": "Saturday",
  "default_time_start": "14:00:00",
  "is_active": true
}
```

### ScheduleGroupInput
```json
{
  "course_id": "integer (required)",
  "instructor_id": "integer (required)",
  "default_day": "string (required) - Monday-Sunday",
  "default_time_start": "time (required) - HH:MM:SS",
  "default_time_end": "time (required) - HH:MM:SS",
  "notes": "string (optional)",
  "max_capacity": "integer (default: 15)"
}
```

### UpdateGroupDTO
```json
{
  "name": "string (optional)",
  "course_id": "integer (optional)",
  "level_number": "integer (optional)",
  "max_capacity": "integer (optional)",
  "instructor_id": "integer (optional)",
  "default_day": "string (optional)",
  "default_time_start": "time (optional)",
  "default_time_end": "time (optional)",
  "notes": "string (optional)",
  "status": "string (optional)"
}
```

### SessionPublic
```json
{
  "id": 1,
  "group_id": 1,
  "level_number": 1,
  "session_number": 1,
  "session_date": "2026-04-03",
  "start_time": "14:00:00",
  "end_time": "16:00:00",
  "status": "scheduled",
  "is_extra_session": false,
  "actual_instructor_id": 1,
  "notes": "string"
}
```

### DailyScheduleItem
```json
{
  "session_id": 1,
  "date": "2026-04-03",
  "time_start": "14:00:00",
  "time_end": "16:00:00",
  "status": "scheduled",
  "notes": "string",
  "group_id": 1,
  "group_name": "Sat 2PM Robotics",
  "level_number": 1,
  "course_id": 1,
  "course_name": "Robotics Fundamentals",
  "enrolled_count": 12
}
```

### AddExtraSessionInput
```json
{
  "group_id": "integer (required)",
  "level_number": "integer (required)",
  "extra_date": "date (required) - YYYY-MM-DD",
  "notes": "string (optional)"
}
```

### UpdateSessionDTO
```json
{
  "session_date": "date (optional) - YYYY-MM-DD",
  "start_time": "time (optional) - HH:MM:SS",
  "end_time": "time (optional) - HH:MM:SS",
  "actual_instructor_id": "integer (optional)",
  "is_substitute": "boolean (optional)",
  "notes": "string (optional)",
  "status": "string (optional) - scheduled|completed|cancelled"
}
```

### SubstituteInstructorRequest
```json
{
  "substitute_instructor_id": "integer (required)"
}
```

### CourseStatsPublic
```json
{
  "course_id": 1,
  "course_name": "Robotics Fundamentals",
  "total_groups": 5,
  "active_groups": 3,
  "total_students_ever": 120,
  "active_students": 45
}
```

### UpdateCoursePriceInput
```json
{
  "new_price": "number (required, >0)"
}
```

### EnrichedGroupPublic
```json
{
  "id": 1,
  "name": "Sat 2PM Robotics",
  "course_id": 1,
  "course_name": "Robotics Fundamentals",
  "instructor_id": 1,
  "instructor_name": "Ahmed Hassan",
  "level_number": 1,
  "max_capacity": 15,
  "default_day": "Saturday",
  "default_time_start": "14:00:00",
  "default_time_end": "16:00:00",
  "is_active": true
}
```

### GenerateLevelSessionsRequest
```json
{
  "level_number": "integer (required)",
  "start_date": "date (optional) - YYYY-MM-DD"
}
```

### PaginatedResponse (Envelope)
```json
{
  "success": true,
  "data": [],
  "total": 0,
  "skip": 0,
  "limit": 50
}
```

### ApiResponse (Envelope)
```json
{
  "success": true,
  "data": {},
  "message": null
}
```

---

## Endpoints

### Courses

#### 1. List all active courses
**GET** `/api/v1/academics/courses`

**Query Parameters:**
- `skip` - integer (optional) - Pagination offset
- `limit` - integer (optional) - Page size

**Response (200):** `PaginatedResponse<CoursePublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 2. Create a new course
**POST** `/api/v1/academics/courses`

**Request Body:** `AddNewCourseInput`

**Response (201):** `ApiResponse<CoursePublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 3. Update a course
**PATCH** `/api/v1/academics/courses/{course_id}`

**Path Parameters:**
- `course_id` - integer (required)

**Request Body:** `UpdateCourseDTO`

**Response (200):** `ApiResponse<CoursePublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 4. Update course price
**PATCH** `/api/v1/academics/courses/{course_id}/price`

**Path Parameters:**
- `course_id` - integer (required)

**Request Body:** `UpdateCoursePriceInput`

**Response (200):** `ApiResponse<CoursePublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Requires admin role
- Price must be positive (> 0)

---

#### 5. Get aggregate stats for all courses
**GET** `/api/v1/academics/courses/stats`

**Response (200):** `ApiResponse<list<CourseStatsPublic>>`

**Notes:**
- Returns stats from v_course_stats view
- Includes group counts and student enrollment totals

---

#### 6. Get aggregate stats for a single course
**GET** `/api/v1/academics/courses/{course_id}/stats`

**Path Parameters:**
- `course_id` - integer (required)

**Response (200):** `ApiResponse<CourseStatsPublic>`

**Error Response (404):** Course not found

---

#### 7. Get all groups for a specific course
**GET** `/api/v1/academics/courses/{course_id}/groups`

**Path Parameters:**
- `course_id` - integer (required)

**Response (200):** `ApiResponse<list<EnrichedGroupPublic>>`

**Error Response (422):** `HTTPValidationError`

---

### Groups

#### 8. List all active groups
**GET** `/api/v1/academics/groups`

**Query Parameters:**
- `skip` - integer (optional)
- `limit` - integer (optional)

**Response (200):** `PaginatedResponse<GroupListItem>`

**Error Response (422):** `HTTPValidationError`

---

#### 9. Get all active groups with instructor and course names
**GET** `/api/v1/academics/groups/enriched`

**Response (200):** `ApiResponse<list<EnrichedGroupPublic>>`

**Notes:**
- Returns groups joined with instructor and course names for display
- Useful for dropdowns and lists

---

#### 10. Schedule a new group
**POST** `/api/v1/academics/groups`

**Request Body:** `ScheduleGroupInput`

**Response (201):** `ApiResponse<GroupPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 11. Get group by ID
**GET** `/api/v1/academics/groups/{group_id}`

**Path Parameters:**
- `group_id` - integer (required)

**Response (200):** `ApiResponse<GroupPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 12. Update a group
**PATCH** `/api/v1/academics/groups/{group_id}`

**Path Parameters:**
- `group_id` - integer (required)

**Request Body:** `UpdateGroupDTO`

**Response (200):** `ApiResponse<GroupPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 13. Soft delete a group (archive)
**DELETE** `/api/v1/academics/groups/{group_id}`

**Path Parameters:**
- `group_id` - integer (required)

**Response (200):** `ApiResponse<GroupPublic>`

**Error Response (404):** Group not found

**Notes:**
- Soft delete - sets is_active to false
- Group history is preserved

---

#### 14. Generate sessions for a specific level
**POST** `/api/v1/academics/groups/{group_id}/generate-sessions`

**Path Parameters:**
- `group_id` - integer (required)

**Request Body:** `GenerateLevelSessionsRequest`

**Response (201):** `ApiResponse<list<SessionPublic>>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Generates N weekly sessions based on course.sessions_per_level
- Raises error if sessions already exist for this level
- Use for manual session generation or recovery

---

#### 15. List sessions for a group
**GET** `/api/v1/academics/groups/{group_id}/sessions`

**Path Parameters:**
- `group_id` - integer (required)

**Query Parameters:**
- `level` - integer (optional) - Filter by level number

**Response (200):** `ApiResponse<list<SessionPublic>>`

**Error Response (422):** `HTTPValidationError`

---

#### 16. Progress group to the next level
**POST** `/api/v1/academics/groups/{group_id}/progress-level`

**Path Parameters:**
- `group_id` - integer (required)

**Response (200):** `ApiResponse<GroupPublic>`

**Error Response (422):** `HTTPValidationError`

**Notes:**
- Increments group level_number
- Auto-generates sessions for the new level
- Updates all active enrollments to new level
- Bills students for the new level (adds amount_due)

---

### Sessions

#### 17. Add an extra session to a group
**POST** `/api/v1/academics/groups/{group_id}/sessions`

**Path Parameters:**
- `group_id` - integer (required)

**Request Body:** `AddExtraSessionInput`

**Response (201):** `ApiResponse<SessionPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 18. Get daily session schedule
**GET** `/api/v1/academics/sessions/daily-schedule`

**Query Parameters:**
- `target_date` - string (optional) - Format: YYYY-MM-DD

**Response (200):** `ApiResponse<list<DailyScheduleItem>>`

**Error Response (422):** `HTTPValidationError`

---

#### 19. Get session details
**GET** `/api/v1/academics/sessions/{session_id}`

**Path Parameters:**
- `session_id` - integer (required)

**Response (200):** `ApiResponse<SessionPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 20. Update a session
**PATCH** `/api/v1/academics/sessions/{session_id}`

**Path Parameters:**
- `session_id` - integer (required)

**Request Body:** `UpdateSessionDTO`

**Response (200):** `ApiResponse<SessionPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 21. Delete a session
**DELETE** `/api/v1/academics/sessions/{session_id}`

**Path Parameters:**
- `session_id` - integer (required)

**Response (200):** `ApiResponse<None>`

**Error Response (422):** `HTTPValidationError`

---

#### 22. Cancel a session
**POST** `/api/v1/academics/sessions/{session_id}/cancel`

**Path Parameters:**
- `session_id` - integer (required)

**Response (200):** `ApiResponse<SessionPublic>`

**Error Response (422):** `HTTPValidationError`

---

#### 23. Mark substitute instructor
**POST** `/api/v1/academics/sessions/{session_id}/substitute`

**Path Parameters:**
- `session_id` - integer (required)

**Request Body:** `SubstituteInstructorRequest`

**Response (200):** `ApiResponse<SessionPublic>`

**Error Response (422):** `HTTPValidationError`
