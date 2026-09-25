# Data Model

## EnrichedGroupPublic

The core model returned by the filter endpoint.

- `id`: number
- `group_name`: string (frontend will normalize this to `name`)
- `course_id`: number
- `course_name`: string
- `instructor_id`: number | null
- `instructor_name`: string
- `level_number`: number
- `default_day`: string | null
- `default_time_start`: string | null
- `default_time_end`: string | null
- `max_capacity`: number | null (frontend normalizes to `capacity`)
- `notes`: string | null
- `status`: 'active' | 'inactive' | 'archived'
- `current_student_count`: number

## Pagination Envelope

```typescript
interface GroupFilterResultDTO {
  groups: EnrichedGroupPublic[];
  total: number;
  skip: number;
  limit: number;
}
```
