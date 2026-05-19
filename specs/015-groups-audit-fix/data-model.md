# Data Model: Groups Feature Audit & Fix

**Date**: 2026-05-19  
**Feature**: 015-groups-audit-fix

## Existing Entities (No Schema Changes)

This feature does not modify any data models. It fixes how existing entities are displayed, cached, and interacted with in the frontend.

### Group
- **Fields**: `id`, `course_id`, `name`, `status` (`'active' | 'inactive' | 'completed'`), `capacity`, `current_level`, `instructor_id`, `schedule`, `start_date`, `notes`
- **Validation**: `status` must be one of 4 values (including `'archived'` for backward compatibility)
- **Relationships**: belongs to Course, assigned to Instructor, has many Levels, has many Enrollments

### EnrichedGroupPublic (API Response)
- **Fields**: All Group fields plus `course_name`, `instructor_name`, `students[]`, `current_student_count`
- **Validation**: `schedule` may be undefined; `current_student_count` defaults to 0

### ScheduleInput (API Request)
- **Fields**: `day`, `time_start`, `time_end`
- **Note**: Response uses `Schedule` with `start_time`/`end_time`; request uses `ScheduleInput` with `time_start`/`time_end`

### Enrollment
- **Fields**: `enrollment_id`, `student_id`, `status` (`'active' | 'completed' | 'dropped'`), `payment_status` (`'paid' | 'due' | 'partial'`)
- **State transitions**: active → completed (level progress), active → dropped (manual removal)

### Level
- **Fields**: `level_id`, `level_number`, `status` (`'active' | 'completed' | 'cancelled'`), `start_date`, `end_date`, `sessions_count`, `students_completed`
- **Relationships**: belongs to Group, has many Sessions, has many Enrollments

### Session
- **Fields**: `session_id`, `session_number`, `date`, `time_start`, `time_end`, `status` (`'scheduled' | 'completed' | 'cancelled'`), `is_extra_session`, `actual_instructor_id`, `is_substitute`
- **Relationships**: belongs to Level, has many Attendance records

### Payment
- **Fields**: `payment_id`, `student_id`, `amount`, `discount_amount`, `payment_date`, `payment_method`, `status`, `receipt_number`, `transaction_type`
- **Relationships**: belongs to Enrollment

## Type Changes (Frontend Only)

| Type | Change | Reason |
|------|--------|--------|
| `ScheduleInput` | New type with `time_start`/`time_end` | Backend validation requires these field names in request body |
| `RawEnrichedGroupPublic` | New type extending `EnrichedGroupPublic` with legacy fields | Backward compatibility with old API field names |
| `GroupStatus` | Implicit union `'active' | 'inactive' | 'completed' | 'archived'` | Added `'archived'` to status mapping |
