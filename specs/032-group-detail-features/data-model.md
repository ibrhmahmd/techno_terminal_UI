# Data Model: Group Detail Page — Feature Completions

**Date**: 2026-06-03  
**Feature**: `032-group-detail-features`

## New Types (Frontend)

### Enrollment History Types

```typescript
// Response from GET /groups/{id}/enrollment-history
interface EnrollmentHistoryItem {
  enrollment_id: number
  student_id: number
  student_name: string
  student_phone: string | null
  level_number_at_enrollment: number
  enrolled_at: string | null      // ISO datetime
  status: string                   // 'active' | 'completed' | 'dropped' | 'transferred'
  amount_due: number
  discount_applied: number
  payments_made: number            // calculated by backend
  balance_remaining: number        // calculated by backend
}

interface EnrollmentHistoryResponse {
  group_id: number
  group_name: string
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  dropped_enrollments: number
  enrollments: EnrollmentHistoryItem[]
}
```

### Instructor History Types

```typescript
// Response from GET /groups/{id}/instructor-history
interface InstructorHistoryItem {
  instructor_id: number
  instructor_name: string
  is_current: boolean
  levels_taught_count: number
  first_assigned_at: string        // ISO datetime
  last_assigned_at: string         // ISO datetime
}

interface InstructorHistoryResponse {
  group_id: number
  group_name: string
  total_instructors: number
  current_instructor: InstructorHistoryItem | null
  instructors: InstructorHistoryItem[]
}
```

## Existing Types (No Changes Needed)

### Session Types (already defined)

- `Session` — `src/api/academics/types/sessions/models.ts`
- `AddExtraSessionInput` — `src/api/academics/types/sessions/inputs.ts`
- `LevelSessionDTO` — `src/api/academics/groups/newEndpoints.ts` (embedded in LevelDetailDTO)

### Transfer Types (already defined)

- `TransferEnrollmentRequest` — `src/api/enrollments/types.ts` (`{ from_enrollment_id, to_group_id }`)
- `TransferOptionDTO` — `src/api/academics/groups/newEndpoints.ts` (`{ group_id, group_name, course_name, available_slots }`)

## Entity Relationships

```
Group (1) ──< Level (N) ──< Session (N)
  │                │
  │                └──< Enrollment (N) ──> Student (1)
  │
  └──< EnrollmentHistoryItem (read-only analytics view)
  └──< InstructorHistoryItem (read-only analytics view)
```

## State Transitions

### Session Status
```
scheduled ──[cancel]──> cancelled
cancelled ──[reactivate]──> scheduled
scheduled ──[attendance]──> completed
any ──[delete]──> (removed)
```

### Enrollment Status (on transfer)
```
active ──[transfer]──> transferred (source enrollment)
                    ──> active (new enrollment in target group)
```

## Cache Key Additions

| Key | Pattern | staleTime |
|-----|---------|-----------|
| `groupEnrollmentHistory(id)` | `['groups', id, 'enrollment-history']` | 5 min |
| `groupInstructorHistory(id)` | `['groups', id, 'instructor-history']` | 5 min |
