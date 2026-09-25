# Groups Feature — Data Model

## Group

```typescript
interface Group {
  id: number;
  course_id: number;
  name: string;
  status: 'active' | 'inactive' | 'archived' | 'completed';  // ← add 'archived'
  capacity: number;
  current_level: number;
  instructor_id: number;
  schedule: Schedule;
  start_date: string;
}
```

## EnrichedGroupPublic

```typescript
interface EnrichedGroupPublic {
  id: number;
  name: string;
  course_name: string;
  instructor_name: string;
  status: 'active' | 'inactive' | 'archived' | 'completed';  // ← add 'archived'
  capacity: number;
  current_level: number;
  schedule?: Schedule;
  start_date?: string;
  notes?: string | null;
  students?: Array<{ id: number; full_name: string }>;
  current_student_count?: number;
  course_id?: number;
  instructor_id?: number;
  level_number?: number;
}
```

## UpdateGroupDTO

```typescript
interface UpdateGroupDTO {
  name?: string;
  course_id?: number;
  level_number?: number;
  max_capacity?: number;
  instructor_id?: number;
  default_day?: string;
  default_time_start?: string;
  default_time_end?: string;
  notes?: string;
  status?: string;
}
```

## ScheduleGroupInput

```typescript
interface ScheduleGroupInput {
  course_id: number;
  name: string;
  capacity: number;
  instructor_id: number;
  schedule: ScheduleInput;
  start_date: string;
}
```

## Key Relationships

- **Group → Levels**: `1:N` via `useGroupDetail` → `getDetailedLevels(groupId)`
- **Group → Sessions**: `1:N` via `useGroupDetail` → `listSessionsForGroup(groupId)`
- **Group → Enrollments**: `1:N` via `getGroupEnrollmentsAll(groupId)`
- **Group → Payments**: `1:N` via `getGroupPayments(groupId)`
- **Group → History**: `1:N` via `getEnrollmentHistory(groupId)`, `getInstructorHistory(groupId)`

## State Transition

```
active ──→ inactive (via update)
active ──→ archived (via archiveGroup)
active ──→ completed (via progressLevel)
inactive → active (via update)
inactive → archived (via archiveGroup)
```

## Grouped Views

```typescript
type GroupByField = 'day' | 'course' | 'instructor' | 'status' | null

interface GroupedGroupsResponse {
  groups: Array<{ field: string; groups: EnrichedGroupPublic[] }>
  total: number
  groupBy: GroupByField
}
```

## Files to Delete

| File | Reason |
|------|--------|
| `src/components/groups/detail/LevelStudentsPanel.tsx` | No consumers |
| `src/components/groups/detail/TransferDialog.tsx` | Only consumed by dead LevelStudentsPanel |
| `src/components/groups/TabNavigation.tsx` | No consumers |
| `src/hooks/useGroupEnrollments.ts` | Only consumed by dead LevelStudentsPanel |

## Dead Code to Remove

| Location | Reason |
|----------|--------|
| `useGroupMutations.ts:invalidateGroupsExtended` | Dead — `invalidateGroups` already covers all needed keys |
