# Dashboard Backend API Specification

**Version:** 1.0  
**Date:** April 13, 2026  
**Status:** Draft for Review

---

## 1. API Overview

### 1.1 Base URL
```
/api/v1/dashboard
```

### 1.2 Authentication
All endpoints require JWT Bearer Token authentication:
```
Authorization: Bearer <jwt_token>
```

### 1.3 Content-Type
```
Content-Type: application/json
```

### 1.4 Rate Limiting
| Endpoint Group | Requests/Minute |
|----------------|-----------------|
| Daily Data | 100 |
| Attendance Grid | 200 |
| Batch Operations | 50 |
| Instructor List | 50 |

---

## 2. Endpoints

### 2.1 GET /dashboard/daily-data

**Description:** Retrieve complete daily dashboard data including schedule, groups, sessions, and instructor list in a single request.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `date` | string (YYYY-MM-DD) | Yes | - | Target date for schedule |
| `include_sessions` | boolean | No | true | Include session history |
| `session_limit` | integer | No | 5 | Max sessions per group (1-10) |
| `include_attendance_preview` | boolean | No | false | Include current attendance status |

**Request Example:**
```http
GET /api/v1/dashboard/daily-data?date=2026-04-13&session_limit=5 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Schema:**
```typescript
interface DashboardDailyDataResponse {
  date: string;                          // Format: YYYY-MM-DD
  schedule_items: DashboardScheduleItem[];
  groups: DashboardGroup[];
  sessions_by_group: Record<string, DashboardSession[]>;
  metadata: DashboardMetadata;
}

interface DashboardScheduleItem {
  session_id: number;
  date: string;                          // YYYY-MM-DD
  time_start: string;                      // HH:MM (24h)
  time_end: string;                      // HH:MM (24h)
  status: "scheduled" | "completed" | "cancelled";
  notes: string | null;
  group_id: number;
  group_name: string;
  level_number: number;
  course_id: number;
  course_name: string;
  enrolled_count: number;
  instructor_id: number;
  instructor_name: string;
}

interface DashboardGroup {
  id: number;
  group_name: string;
  course_id: number;
  course_name: string;
  instructor_id: number;
  instructor_name: string;
  level_number: number;                  // Current level
  current_student_count: number;
  max_capacity: number;
  status: "active" | "inactive" | "archived";
  default_day: string;
  default_time_start: string;
  default_time_end: string;
  schedule_time?: string;                  // Computed display string
}

interface DashboardSession {
  id: number;
  group_id: number;
  level_number: number;
  session_number: number;
  session_date: string;                  // YYYY-MM-DD
  start_time: string;                    // HH:MM:SS
  end_time: string;                      // HH:MM:SS
  status: "scheduled" | "completed" | "cancelled";
  is_extra_session: boolean;
  actual_instructor_id: number;
  instructor_name?: string;
  is_substitute?: boolean;
  notes: string;
  attendance_summary?: {
    present_count: number;
    absent_count: number;
    cancelled_count: number;
    not_marked: number;
  };
}

interface DashboardMetadata {
  total_groups: number;
  total_sessions: number;
  total_students: number;
  instructors: DashboardInstructor[];
  generated_at: string;                  // ISO 8601 timestamp
  cache_ttl: number;                     // Seconds until refresh recommended
}

interface DashboardInstructor {
  id: number;
  name: string;
  group_count: number;                   // Groups on this date
}
```

**Success Response (200 OK):**
```json
{
  "date": "2026-04-13",
  "schedule_items": [
    {
      "session_id": 15234,
      "date": "2026-04-13",
      "time_start": "15:00",
      "time_end": "16:30",
      "status": "scheduled",
      "notes": null,
      "group_id": 101,
      "group_name": "Robotics Alpha",
      "level_number": 3,
      "course_id": 5,
      "course_name": "Robotics Fundamentals",
      "enrolled_count": 12,
      "instructor_id": 42,
      "instructor_name": "Ahmed Hassan"
    },
    {
      "session_id": 15235,
      "date": "2026-04-13",
      "time_start": "17:00",
      "time_end": "18:30",
      "status": "scheduled",
      "notes": null,
      "group_id": 102,
      "group_name": "Coding Juniors",
      "level_number": 2,
      "course_id": 3,
      "course_name": "Python Basics",
      "enrolled_count": 8,
      "instructor_id": 43,
      "instructor_name": "Sara Ali"
    }
  ],
  "groups": [
    {
      "id": 101,
      "group_name": "Robotics Alpha",
      "course_id": 5,
      "course_name": "Robotics Fundamentals",
      "instructor_id": 42,
      "instructor_name": "Ahmed Hassan",
      "level_number": 3,
      "current_student_count": 12,
      "max_capacity": 15,
      "status": "active",
      "default_day": "Saturday",
      "default_time_start": "15:00:00",
      "default_time_end": "16:30:00",
      "schedule_time": "Sat 15:00-16:30"
    },
    {
      "id": 102,
      "group_name": "Coding Juniors",
      "course_id": 3,
      "course_name": "Python Basics",
      "instructor_id": 43,
      "instructor_name": "Sara Ali",
      "level_number": 2,
      "current_student_count": 8,
      "max_capacity": 12,
      "status": "active",
      "default_day": "Saturday",
      "default_time_start": "17:00:00",
      "default_time_end": "18:30:00",
      "schedule_time": "Sat 17:00-18:30"
    }
  ],
  "sessions_by_group": {
    "101": [
      {
        "id": 15230,
        "group_id": 101,
        "level_number": 3,
        "session_number": 10,
        "session_date": "2026-04-06",
        "start_time": "15:00:00",
        "end_time": "16:30:00",
        "status": "completed",
        "is_extra_session": false,
        "actual_instructor_id": 42,
        "instructor_name": "Ahmed Hassan",
        "is_substitute": false,
        "notes": "Covered sensors module",
        "attendance_summary": {
          "present_count": 11,
          "absent_count": 1,
          "cancelled_count": 0,
          "not_marked": 0
        }
      },
      {
        "id": 15231,
        "group_id": 101,
        "level_number": 3,
        "session_number": 11,
        "session_date": "2026-04-10",
        "start_time": "15:00:00",
        "end_time": "16:30:00",
        "status": "completed",
        "is_extra_session": false,
        "actual_instructor_id": 42,
        "instructor_name": "Ahmed Hassan",
        "is_substitute": false,
        "notes": "",
        "attendance_summary": {
          "present_count": 10,
          "absent_count": 2,
          "cancelled_count": 0,
          "not_marked": 0
        }
      },
      {
        "id": 15234,
        "group_id": 101,
        "level_number": 3,
        "session_number": 12,
        "session_date": "2026-04-13",
        "start_time": "15:00:00",
        "end_time": "16:30:00",
        "status": "scheduled",
        "is_extra_session": false,
        "actual_instructor_id": 42,
        "instructor_name": "Ahmed Hassan",
        "is_substitute": false,
        "notes": ""
      }
    ],
    "102": [
      {
        "id": 15235,
        "group_id": 102,
        "level_number": 2,
        "session_number": 8,
        "session_date": "2026-04-13",
        "start_time": "17:00:00",
        "end_time": "18:30:00",
        "status": "scheduled",
        "is_extra_session": false,
        "actual_instructor_id": 43,
        "instructor_name": "Sara Ali",
        "is_substitute": false,
        "notes": ""
      }
    ]
  },
  "metadata": {
    "total_groups": 2,
    "total_sessions": 5,
    "total_students": 20,
    "instructors": [
      {
        "id": 42,
        "name": "Ahmed Hassan",
        "group_count": 1
      },
      {
        "id": 43,
        "name": "Sara Ali",
        "group_count": 1
      }
    ],
    "generated_at": "2026-04-13T08:30:00Z",
    "cache_ttl": 300
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Date Format:**
```json
{
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "Date must be in YYYY-MM-DD format",
    "details": {
      "provided": "13-04-2026",
      "expected_format": "YYYY-MM-DD"
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**400 Bad Request - Date Out of Range:**
```json
{
  "error": {
    "code": "DATE_OUT_OF_RANGE",
    "message": "Date must be within 1 year of current date",
    "details": {
      "provided": "2020-01-01",
      "min_date": "2025-04-13",
      "max_date": "2027-04-13"
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Valid JWT token required",
    "details": {},
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**403 Forbidden - Insufficient Permissions:**
```json
{
  "error": {
    "code": "DASHBOARD_ACCESS_DENIED",
    "message": "User lacks permission to view dashboard",
    "details": {
      "required_permission": "dashboard:read",
      "user_roles": ["instructor"]
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "details": {
      "incident_id": "inc-123e4567-e89b-12d3-a456-426614174000"
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

### 2.2 GET /dashboard/groups/{group_id}/attendance-grid

**Description:** Retrieve complete attendance grid data including roster, sessions, and attendance records in a single request.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `group_id` | integer | Yes | Group ID |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `level_number` | integer | Yes | - | Level number for the group |
| `session_limit` | integer | No | 5 | Number of sessions to return (1-10) |
| `include_history` | boolean | No | true | Include past sessions |

**Request Example:**
```http
GET /api/v1/dashboard/groups/101/attendance-grid?level_number=3&session_limit=5 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response Schema:**
```typescript
interface AttendanceGridResponse {
  group: AttendanceGroupInfo;
  level: LevelInfo;
  sessions: AttendanceSession[];
  students: AttendanceStudent[];
  metadata: AttendanceMetadata;
}

interface AttendanceGroupInfo {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  instructor_id: number;
  instructor_name: string;
  current_student_count: number;
  max_capacity: number;
  status: "active" | "inactive" | "archived";
}

interface LevelInfo {
  level_number: number;
  current_module: string;
  description: string;
  total_sessions_in_level: number;
  completed_sessions: number;
}

interface AttendanceSession {
  id: number;
  session_number: number;
  session_date: string;                  // YYYY-MM-DD
  start_time: string;                    // HH:MM:SS
  end_time: string;                      // HH:MM:SS
  status: "scheduled" | "completed" | "cancelled";
  is_extra_session: boolean;
  notes: string;
  can_edit: boolean;                     // Based on user permissions
  is_future: boolean;                    // Session date > today
}

interface AttendanceStudent {
  student_id: string;
  full_name: string;
  gender: "male" | "female";
  date_of_birth?: string;                // YYYY-MM-DD
  age?: number;                         // Computed
  enrollment_id: number;
  enrollment_date: string;              // YYYY-MM-DD
  enrollment_status: "active" | "on_hold" | "completed" | "dropped";
  balance: number;                      // Current balance (negative = credit)
  billing_status: "paid" | "due" | "credit";
  attendance: Record<string, AttendanceStatus>;  // session_id -> status
  attendance_stats: {
    present_count: number;
    absent_count: number;
    cancelled_count: number;
    not_marked_count: number;
    attendance_rate: number;           // Percentage (0-100)
  };
  progress: {
    sessions_completed: number;
    sessions_remaining: number;
    level_completion_pct: number;       // Percentage (0-100)
  };
}

type AttendanceStatus = "present" | "absent" | "cancelled" | null;

interface AttendanceMetadata {
  total_students: number;
  total_sessions: number;
  can_mark_attendance: boolean;         // Global permission check
  last_updated: string;                 // ISO 8601
  cache_ttl: number;                    // Seconds
}
```

**Success Response (200 OK):**
```json
{
  "group": {
    "id": 101,
    "name": "Robotics Alpha",
    "course_id": 5,
    "course_name": "Robotics Fundamentals",
    "instructor_id": 42,
    "instructor_name": "Ahmed Hassan",
    "current_student_count": 12,
    "max_capacity": 15,
    "status": "active"
  },
  "level": {
    "level_number": 3,
    "current_module": "Advanced Sensors",
    "description": "Working with ultrasonic and infrared sensors",
    "total_sessions_in_level": 12,
    "completed_sessions": 11
  },
  "sessions": [
    {
      "id": 15230,
      "session_number": 10,
      "session_date": "2026-04-06",
      "start_time": "15:00:00",
      "end_time": "16:30:00",
      "status": "completed",
      "is_extra_session": false,
      "notes": "Covered sensors module",
      "can_edit": true,
      "is_future": false
    },
    {
      "id": 15231,
      "session_number": 11,
      "session_date": "2026-04-10",
      "start_time": "15:00:00",
      "end_time": "16:30:00",
      "status": "completed",
      "is_extra_session": false,
      "notes": "",
      "can_edit": true,
      "is_future": false
    },
    {
      "id": 15234,
      "session_number": 12,
      "session_date": "2026-04-13",
      "start_time": "15:00:00",
      "end_time": "16:30:00",
      "status": "scheduled",
      "is_extra_session": false,
      "notes": "",
      "can_edit": true,
      "is_future": true
    }
  ],
  "students": [
    {
      "student_id": "456",
      "full_name": "Omar Hassan",
      "gender": "male",
      "date_of_birth": "2010-05-15",
      "age": 15,
      "enrollment_id": 789,
      "enrollment_date": "2026-01-15",
      "enrollment_status": "active",
      "balance": 0,
      "billing_status": "paid",
      "attendance": {
        "15230": "present",
        "15231": "present",
        "15234": null
      },
      "attendance_stats": {
        "present_count": 11,
        "absent_count": 0,
        "cancelled_count": 0,
        "not_marked_count": 1,
        "attendance_rate": 91.7
      },
      "progress": {
        "sessions_completed": 11,
        "sessions_remaining": 1,
        "level_completion_pct": 91.7
      }
    },
    {
      "student_id": "457",
      "full_name": "Layan Mohammed",
      "gender": "female",
      "date_of_birth": "2011-03-20",
      "age": 14,
      "enrollment_id": 790,
      "enrollment_date": "2026-01-15",
      "enrollment_status": "active",
      "balance": 150,
      "billing_status": "due",
      "attendance": {
        "15230": "present",
        "15231": "absent",
        "15234": null
      },
      "attendance_stats": {
        "present_count": 10,
        "absent_count": 1,
        "cancelled_count": 0,
        "not_marked_count": 1,
        "attendance_rate": 83.3
      },
      "progress": {
        "sessions_completed": 11,
        "sessions_remaining": 1,
        "level_completion_pct": 91.7
      }
    }
  ],
  "metadata": {
    "total_students": 12,
    "total_sessions": 3,
    "can_mark_attendance": true,
    "last_updated": "2026-04-13T08:30:00Z",
    "cache_ttl": 60
  }
}
```

**Error Responses:**

**404 Not Found - Group Doesn't Exist:**
```json
{
  "error": {
    "code": "GROUP_NOT_FOUND",
    "message": "Group with specified ID does not exist",
    "details": {
      "group_id": 99999
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**400 Bad Request - Invalid Level:**
```json
{
  "error": {
    "code": "INVALID_LEVEL",
    "message": "Level number does not exist for this group",
    "details": {
      "group_id": 101,
      "provided_level": 10,
      "valid_levels": [1, 2, 3]
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**403 Forbidden - Attendance Access Denied:**
```json
{
  "error": {
    "code": "ATTENDANCE_ACCESS_DENIED",
    "message": "User cannot view attendance for this group",
    "details": {
      "group_id": 101,
      "user_id": 456,
      "user_role": "instructor",
      "group_instructor_id": 42
    },
    "timestamp": "2026-04-13T08:30:00Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

### 2.3 POST /dashboard/batch-attendance

**Description:** Mark attendance for multiple students across multiple sessions in a single request.

**Request Schema:**
```typescript
interface BatchAttendanceRequest {
  entries: AttendanceEntry[];
  options?: {
    skip_validation?: boolean;           // Skip permission checks (admin only)
    note?: string;                       // Reason for bulk update
  };
}

interface AttendanceEntry {
  session_id: number;
  student_id: number;
  status: "present" | "absent" | "cancelled" | null;  // null = clear attendance
  note?: string;                       // Per-entry note
}
```

**Request Example:**
```http
POST /api/v1/dashboard/batch-attendance HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "entries": [
    {
      "session_id": 15234,
      "student_id": 456,
      "status": "present",
      "note": "Arrived on time"
    },
    {
      "session_id": 15234,
      "student_id": 457,
      "status": "present"
    }
  ],
  "options": {
    "note": "Quick attendance marking"
  }
}
```

**Response Schema:**
```typescript
interface BatchAttendanceResponse {
  results: AttendanceResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  metadata: {
    processed_at: string;
    duration_ms: number;
  };
}

interface AttendanceResult {
  session_id: number;
  student_id: number;
  status: "success" | "failed" | "skipped";
  previous_status?: string | null;
  new_status: string | null;
  error?: {
    code: string;
    message: string;
  };
}
```

**Success Response (200 OK):**
```json
{
  "results": [
    {
      "session_id": 15234,
      "student_id": 456,
      "status": "success",
      "previous_status": null,
      "new_status": "present"
    },
    {
      "session_id": 15234,
      "student_id": 457,
      "status": "success",
      "previous_status": null,
      "new_status": "present"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "skipped": 0
  },
  "metadata": {
    "processed_at": "2026-04-13T15:05:30Z",
    "duration_ms": 45
  }
}
```

**Partial Success Response (207 Multi-Status):**
```json
{
  "results": [
    {
      "session_id": 15234,
      "student_id": 456,
      "status": "success",
      "previous_status": null,
      "new_status": "present"
    },
    {
      "session_id": 15234,
      "student_id": 999,
      "status": "failed",
      "error": {
        "code": "STUDENT_NOT_IN_GROUP",
        "message": "Student is not enrolled in this group's session"
      }
    }
  ],
  "summary": {
    "total": 2,
    "successful": 1,
    "failed": 1,
    "skipped": 0
  },
  "metadata": {
    "processed_at": "2026-04-13T15:05:30Z",
    "duration_ms": 52
  }
}
```

**Error Responses:**

**400 Bad Request - Empty Entries:**
```json
{
  "error": {
    "code": "EMPTY_BATCH",
    "message": "At least one attendance entry is required",
    "details": {},
    "timestamp": "2026-04-13T15:05:30Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**400 Bad Request - Too Many Entries:**
```json
{
  "error": {
    "code": "BATCH_TOO_LARGE",
    "message": "Maximum 50 attendance entries per request",
    "details": {
      "provided": 75,
      "maximum": 50
    },
    "timestamp": "2026-04-13T15:05:30Z",
    "request_id": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

### 2.4 GET /dashboard/instructors

**Description:** Retrieve list of all active instructors with their assigned groups.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `date` | string | No | today | Filter instructors with groups on this date |
| `include_stats` | boolean | No | false | Include teaching statistics |

**Response Schema:**
```typescript
interface InstructorsListResponse {
  instructors: InstructorSummary[];
  total_count: number;
  date: string;
}

interface InstructorSummary {
  id: number;
  name: string;
  email: string;
  phone?: string;
  groups: InstructorGroup[];
  stats?: InstructorStats;
}

interface InstructorGroup {
  id: number;
  name: string;
  course_name: string;
  level_number: number;
  student_count: number;
  session_time: string;
}

interface InstructorStats {
  total_groups: number;
  total_students: number;
  weekly_hours: number;
  attendance_rate: number;
}
```

**Success Response (200 OK):**
```json
{
  "instructors": [
    {
      "id": 42,
      "name": "Ahmed Hassan",
      "email": "ahmed@techno.edu",
      "phone": "+20 100 123 4567",
      "groups": [
        {
          "id": 101,
          "name": "Robotics Alpha",
          "course_name": "Robotics Fundamentals",
          "level_number": 3,
          "student_count": 12,
          "session_time": "Sat 15:00-16:30"
        }
      ],
      "stats": {
        "total_groups": 3,
        "total_students": 35,
        "weekly_hours": 9,
        "attendance_rate": 94.5
      }
    }
  ],
  "total_count": 5,
  "date": "2026-04-13"
}
```

---

## 3. Data Models

### 3.1 Database Entity Relationships

```
Group (1) -----> (N) Session
Group (1) -----> (N) Enrollment -----> (N) Student
Session (1) -----> (N) AttendanceRecord
Group (N) -----> (1) Instructor
Group (N) -----> (1) Course
```

### 3.2 Core Entity Schemas

**Session Entity:**
```python
class Session(Base):
    __tablename__ = "sessions"
    
    id: int (PK)
    group_id: int (FK -> groups.id)
    level_number: int
    session_number: int
    session_date: date
    start_time: time
    end_time: time
    status: SessionStatus (enum: scheduled, completed, cancelled)
    is_extra_session: bool
    actual_instructor_id: int (FK -> instructors.id, nullable)
    notes: str (nullable)
    created_at: datetime
    updated_at: datetime
```

**AttendanceRecord Entity:**
```python
class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id: int (PK)
    session_id: int (FK -> sessions.id)
    student_id: int (FK -> students.id)
    enrollment_id: int (FK -> enrollments.id)
    status: AttendanceStatus (enum: present, absent, cancelled)
    marked_by: int (FK -> users.id)
    marked_at: datetime
    note: str (nullable)
```

---

## 4. Permission Matrix

| Endpoint | Role: Admin | Role: Manager | Role: Instructor | Role: Receptionist |
|----------|-------------|---------------|------------------|-------------------|
| GET /daily-data | ✅ | ✅ | ✅ (own only) | ✅ |
| GET /attendance-grid | ✅ | ✅ | ✅ (own groups) | ✅ |
| POST /batch-attendance | ✅ | ✅ | ✅ (own groups) | ❌ |
| GET /instructors | ✅ | ✅ | ✅ | ✅ |

**Permission Rules:**
- **Admin:** Full access to all data
- **Manager:** Full access to all data
- **Instructor:** Access only to groups where they are assigned as instructor
- **Receptionist:** View-only access to all data

---

## 5. Backend Implementation Guide

### 5.1 FastAPI Router Structure

```python
# backend/app/api/dashboard/router.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from . import models, service
from ..deps import get_db, get_current_user, require_permissions

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/daily-data", response_model=models.DashboardDailyDataResponse)
async def get_daily_dashboard_data(
    target_date: date = Query(..., alias="date"),
    include_sessions: bool = Query(True),
    session_limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get consolidated daily dashboard data."""
    require_permissions(current_user, "dashboard:read")
    
    try:
        return await service.get_daily_data(
            db=db,
            target_date=target_date,
            include_sessions=include_sessions,
            session_limit=session_limit,
            user=current_user,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/groups/{group_id}/attendance-grid", response_model=models.AttendanceGridResponse)
async def get_attendance_grid(
    group_id: int,
    level_number: int = Query(...),
    session_limit: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get attendance grid data for a group."""
    require_permissions(current_user, "attendance:read")
    
    # Check group access for instructors
    if current_user.role == "instructor":
        if not await service.is_group_instructor(db, group_id, current_user.id):
            raise HTTPException(status_code=403, detail="ATTENDANCE_ACCESS_DENIED")
    
    return await service.get_attendance_grid(
        db=db,
        group_id=group_id,
        level_number=level_number,
        session_limit=session_limit,
    )

@router.post("/batch-attendance", response_model=models.BatchAttendanceResponse)
async def batch_mark_attendance(
    request: models.BatchAttendanceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark attendance for multiple students/sessions."""
    require_permissions(current_user, "attendance:write")
    
    return await service.batch_mark_attendance(
        db=db,
        entries=request.entries,
        marked_by=current_user.id,
        options=request.options,
    )

@router.get("/instructors", response_model=models.InstructorsListResponse)
async def list_instructors(
    target_date: Optional[date] = Query(None, alias="date"),
    include_stats: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active instructors."""
    require_permissions(current_user, "dashboard:read")
    
    return await service.list_instructors(
        db=db,
        target_date=target_date,
        include_stats=include_stats,
    )
```

### 5.2 Service Layer Implementation

```python
# backend/app/api/dashboard/service.py
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Dict
from datetime import date, timedelta

from ...models import (
    Group, Session, Student, Enrollment, AttendanceRecord,
    Instructor, Course, User
)
from . import models

async def get_daily_data(
    db: Session,
    target_date: date,
    include_sessions: bool,
    session_limit: int,
    user: User,
) -> models.DashboardDailyDataResponse:
    """
    Optimized query to get all dashboard data in minimal DB round-trips.
    
    Strategy:
    1. Get schedule items for the date
    2. Get all related groups in single query
    3. If include_sessions: Get all sessions for these groups in single query
    4. Aggregate and return
    """
    
    # 1. Get schedule items
    schedule_items = await get_schedule_items(db, target_date)
    
    # 2. Get unique group IDs
    group_ids = list(set(item.group_id for item in schedule_items))
    
    # 3. Get all groups in one query
    groups = await get_groups_by_ids(db, group_ids)
    
    # 4. Get instructors
    instructors = extract_unique_instructors(groups)
    
    # 5. Get sessions if requested
    sessions_by_group = {}
    if include_sessions and group_ids:
        sessions = await get_sessions_for_groups(
            db, group_ids, session_limit
        )
        sessions_by_group = group_sessions_by_group_id(sessions)
    
    return models.DashboardDailyDataResponse(
        date=target_date.isoformat(),
        schedule_items=[convert_schedule_item(si) for si in schedule_items],
        groups=[convert_group(g) for g in groups],
        sessions_by_group=sessions_by_group,
        metadata=models.DashboardMetadata(
            total_groups=len(groups),
            total_sessions=sum(len(s) for s in sessions_by_group.values()),
            total_students=sum(g.current_student_count for g in groups),
            instructors=instructors,
            generated_at=datetime.utcnow().isoformat(),
            cache_ttl=300,
        ),
    )

async def get_attendance_grid(
    db: Session,
    group_id: int,
    level_number: int,
    session_limit: int,
) -> models.AttendanceGridResponse:
    """
    Get complete attendance grid in 3 DB queries:
    1. Group info with course and instructor
    2. Sessions for group/level
    3. Enrolled students with attendance records
    """
    
    # 1. Get group with related data
    group = await get_group_with_details(db, group_id)
    if not group:
        raise ValueError(f"GROUP_NOT_FOUND: {group_id}")
    
    # Validate level exists
    if not await level_exists_for_group(db, group_id, level_number):
        raise ValueError(f"INVALID_LEVEL: {level_number}")
    
    # 2. Get sessions
    sessions = await get_sessions_for_level(
        db, group_id, level_number, session_limit
    )
    
    # 3. Get students with attendance (optimized query)
    students = await get_students_with_attendance(
        db, group_id, level_number, [s.id for s in sessions]
    )
    
    return models.AttendanceGridResponse(
        group=convert_to_attendance_group(group),
        level=convert_level_info(group, level_number),
        sessions=[convert_attendance_session(s) for s in sessions],
        students=[convert_attendance_student(s) for s in students],
        metadata=models.AttendanceMetadata(
            total_students=len(students),
            total_sessions=len(sessions),
            can_mark_attendance=True,  # Computed based on user permissions
            last_updated=datetime.utcnow().isoformat(),
            cache_ttl=60,
        ),
    )

async def batch_mark_attendance(
    db: Session,
    entries: List[models.AttendanceEntry],
    marked_by: int,
    options: Optional[models.BatchOptions],
) -> models.BatchAttendanceResponse:
    """
    Process attendance updates in a single transaction.
    Uses INSERT ... ON CONFLICT (upsert) for efficiency.
    """
    
    results = []
    
    with db.begin():
        for entry in entries:
            try:
                result = await upsert_attendance_record(
                    db,
                    session_id=entry.session_id,
                    student_id=entry.student_id,
                    status=entry.status,
                    marked_by=marked_by,
                    note=entry.note,
                )
                results.append(models.AttendanceResult(
                    session_id=entry.session_id,
                    student_id=entry.student_id,
                    status="success",
                    previous_status=result.previous_status,
                    new_status=entry.status,
                ))
            except Exception as e:
                results.append(models.AttendanceResult(
                    session_id=entry.session_id,
                    student_id=entry.student_id,
                    status="failed",
                    error=models.AttendanceError(
                        code=e.__class__.__name__,
                        message=str(e),
                    ),
                ))
    
    successful = sum(1 for r in results if r.status == "success")
    failed = sum(1 for r in results if r.status == "failed")
    
    return models.BatchAttendanceResponse(
        results=results,
        summary=models.BatchSummary(
            total=len(entries),
            successful=successful,
            failed=failed,
            skipped=0,
        ),
        metadata=models.BatchMetadata(
            processed_at=datetime.utcnow().isoformat(),
            duration_ms=0,  # Computed at end
        ),
    )
```

### 5.3 Database Query Optimizations

```python
# Optimized query for getting students with attendance
async def get_students_with_attendance(
    db: Session,
    group_id: int,
    level_number: int,
    session_ids: List[int],
) -> List[StudentAttendanceRow]:
    """
    Single query to get:
    - All enrolled students in the group
    - Their enrollment details
    - Their attendance for specified sessions
    - Their balance and billing status
    """
    
    query = """
    SELECT 
        s.id as student_id,
        s.full_name,
        s.gender,
        s.date_of_birth,
        e.id as enrollment_id,
        e.enrollment_date,
        e.status as enrollment_status,
        st.balance,
        CASE 
            WHEN st.balance < 0 THEN 'credit'
            WHEN st.balance > 0 THEN 'due'
            ELSE 'paid'
        END as billing_status,
        json_agg(
            json_build_object(
                'session_id', ar.session_id,
                'status', ar.status
            ) 
            FILTER (WHERE ar.session_id = ANY(:session_ids))
        ) as attendance_records,
        COUNT(ar_present.id) as present_count,
        COUNT(ar_absent.id) as absent_count
    FROM students s
    JOIN enrollments e ON e.student_id = s.id
    LEFT JOIN student_balances st ON st.student_id = s.id
    LEFT JOIN attendance_records ar ON ar.enrollment_id = e.id
    LEFT JOIN attendance_records ar_present ON ar_present.enrollment_id = e.id 
        AND ar_present.status = 'present'
    LEFT JOIN attendance_records ar_absent ON ar_absent.enrollment_id = e.id 
        AND ar_absent.status = 'absent'
    WHERE e.group_id = :group_id
        AND e.level_number = :level_number
        AND e.status = 'active'
    GROUP BY s.id, s.full_name, s.gender, s.date_of_birth,
             e.id, e.enrollment_date, e.status, st.balance
    ORDER BY s.full_name
    """
    
    result = await db.execute(
        query,
        {
            "group_id": group_id,
            "level_number": level_number,
            "session_ids": session_ids,
        }
    )
    
    return result.fetchall()
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

```python
# backend/tests/api/dashboard/test_service.py
import pytest
from datetime import date
from sqlalchemy.orm import Session

from app.api.dashboard import service
from app.models import Group, Session, Student, Enrollment

class TestGetDailyData:
    async def test_returns_correct_schedule_items(self, db: Session):
        # Arrange
        target_date = date(2026, 4, 13)
        
        # Act
        result = await service.get_daily_data(
            db=db,
            target_date=target_date,
            include_sessions=True,
            session_limit=5,
            user=mock_user(),
        )
        
        # Assert
        assert result.date == "2026-04-13"
        assert len(result.schedule_items) > 0
        assert all(si.date == "2026-04-13" for si in result.schedule_items)
    
    async def test_returns_sessions_for_each_group(self, db: Session):
        # Arrange
        target_date = date(2026, 4, 13)
        
        # Act
        result = await service.get_daily_data(
            db=db,
            target_date=target_date,
            include_sessions=True,
            session_limit=5,
            user=mock_user(),
        )
        
        # Assert
        for group_id in result.sessions_by_group:
            sessions = result.sessions_by_group[group_id]
            assert len(sessions) <= 5
            assert all(s.group_id == int(group_id) for s in sessions)
    
    async def test_returns_instructor_list(self, db: Session):
        # Act
        result = await service.get_daily_data(...)
        
        # Assert
        assert len(result.metadata.instructors) > 0
        instructor_names = [i.name for i in result.metadata.instructors]
        assert "Ahmed Hassan" in instructor_names

class TestGetAttendanceGrid:
    async def test_returns_complete_grid(self, db: Session):
        # Arrange
        group_id = 101
        level_number = 3
        
        # Act
        result = await service.get_attendance_grid(
            db=db,
            group_id=group_id,
            level_number=level_number,
            session_limit=5,
        )
        
        # Assert
        assert result.group.id == group_id
        assert len(result.sessions) > 0
        assert len(result.students) > 0
        
        # Check attendance mapping
        student = result.students[0]
        assert isinstance(student.attendance, dict)
        for session in result.sessions:
            assert str(session.id) in student.attendance

class TestBatchMarkAttendance:
    async def test_successfully_updates_attendance(self, db: Session):
        # Arrange
        entries = [
            models.AttendanceEntry(
                session_id=15234,
                student_id=456,
                status="present",
            )
        ]
        
        # Act
        result = await service.batch_mark_attendance(
            db=db,
            entries=entries,
            marked_by=42,
            options=None,
        )
        
        # Assert
        assert result.summary.successful == 1
        assert result.results[0].status == "success"
```

### 6.2 Integration Tests

```python
# backend/tests/api/dashboard/test_router.py
from fastapi.testclient import TestClient

class TestDashboardEndpoints:
    def test_get_daily_data_success(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/dashboard/daily-data?date=2026-04-13",
            headers=auth_headers,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "schedule_items" in data
        assert "groups" in data
        assert "sessions_by_group" in data
        assert "metadata" in data
    
    def test_get_daily_data_invalid_date(self, client: TestClient, auth_headers):
        response = client.get(
            "/api/v1/dashboard/daily-data?date=invalid",
            headers=auth_headers,
        )
        
        assert response.status_code == 400
        assert response.json()["error"]["code"] == "INVALID_DATE_FORMAT"
    
    def test_get_attendance_grid_unauthorized(self, client: TestClient, instructor_headers):
        # Instructor trying to access another instructor's group
        response = client.get(
            "/api/v1/dashboard/groups/999/attendance-grid?level_number=1",
            headers=instructor_headers,
        )
        
        assert response.status_code == 403
```

---

## 7. Deployment Checklist

### 7.1 Pre-Deployment
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Database migrations applied
- [ ] API documentation updated
- [ ] Rate limiting configured
- [ ] Monitoring dashboards configured
- [ ] Feature flag created for gradual rollout

### 7.2 Deployment Steps
1. Deploy backend API (new endpoints)
2. Verify endpoints with smoke tests
3. Enable feature flag for internal users
4. Monitor error rates and performance
5. Gradually increase traffic percentage
6. Update frontend to use new endpoints
7. Deprecate old endpoints after full migration

### 7.3 Post-Deployment Monitoring
- API response times (target: <200ms p95)
- Error rates (target: <0.1%)
- Cache hit rates (target: >85%)
- Database query performance
- Frontend bundle size

---

## Appendix A: Migration from Old Endpoints

### Old vs New Mapping

| Old Endpoint | New Endpoint | Migration Notes |
|--------------|--------------|-----------------|
| GET /academics/sessions/daily-schedule | GET /dashboard/daily-data | Returns more data, single call |
| GET /academics/groups/enriched | GET /dashboard/daily-data | Included in response |
| GET /academics/groups/{id}/sessions | GET /dashboard/daily-data | Included in sessions_by_group |
| GET /analytics/academics/groups/{id}/roster | GET /dashboard/groups/{id}/attendance-grid | Combined with attendance |
| GET /attendance/session/{id} | GET /dashboard/groups/{id}/attendance-grid | Embedded in response |
| POST /attendance/session/{id}/mark | POST /dashboard/batch-attendance | Supports bulk operations |

### Frontend Migration Guide

```typescript
// OLD CODE
const [items, groups] = await Promise.all([
  getDailySchedule(date),
  getEnrichedGroups(),
]);
const sessions = await Promise.all(
  groupIds.map(id => getGroupSessions(id))
);

// NEW CODE
const data = await getDashboardDailyData(date);
const { schedule_items, groups, sessions_by_group } = data;
```

---

**End of Specification**
