# Data Model: Groups Page Audit & Fixes

## Entities

### Group (existing — no schema changes)

Core entity displayed across all group views.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Primary key |
| `group_name` | `string` | Display name |
| `course_name` | `string` | Associated course |
| `instructor_name` | `string \| null` | Fallback: "Unassigned" |
| `status` | `'active' \| 'inactive' \| 'archived' \| 'completed'` | Four valid states — all must be handled consistently |
| `default_day` | `string` | Schedule day name |
| `default_time_start` | `string \| null` | Format: `HH:MM:SS`, display as `HH:MM` |
| `default_time_end` | `string \| null` | Format: `HH:MM:SS`, display as `HH:MM` |
| `current_student_count` | `number` | Must use `?? 0` for fallback, NOT `\| 0` |
| `max_capacity` | `number` | Capacity limit |

### GroupStatus (type correction)

Currently inconsistently handled across components.

| Component | Current Behavior | Corrected Behavior |
|-----------|-----------------|-------------------|
| `GroupColumns.tsx` | Handles all 4 values correctly | No change needed |
| `GroupsTable.tsx` | Maps `inactive` → "Archived" (BUG) | Map `inactive` → "Inactive" |
| `GroupStatusBadge.tsx` | Handles all 4 values correctly | No change needed |

### ScheduleTime (format standardization)

| View | Current Format | Corrected Format |
|------|---------------|-----------------|
| `GroupColumns.tsx` | `''` when undefined | `'--:--'` when undefined |
| `GroupsTable.tsx` | `'--:--'` when undefined | No change needed |
| `GroupCard.tsx` | `''` when undefined | `'--:--'` when undefined |
| `GroupInfoCard.tsx` | `'--:--'` when undefined | No change needed |
| `EditGroupDialog.tsx` | `H:MM:00` (no zero-padding) | `HH:MM:00` (zero-padded) |

### Hook Data Shapes (React Query migration)

#### `useGroupDetail` → `useQuery<GroupDetailData>`
```
{
  group: EnrichedGroupPublic
  levels: Level[]
  isLoading: boolean
  error: string | null
}
```

#### `useGroupPayments` → `useQuery<PaymentData[]>`
```
{
  payments: PaymentData[]
  isLoading: boolean
  error: string | null
}
```

#### `useGroupEnrollments` → `useQuery<EnrollmentData[]>`
```
{
  enrollments: EnrollmentData[]
  isLoading: boolean
  error: string | null
}
```

#### `useGroupCompetitions` → `useQuery<CompetitionData[]>`
```
{
  competitions: CompetitionData[]
  isLoading: boolean
  error: string | null
}
```

### Query Key Additions (to `queryKeys.ts`)

| Key | Pattern | Used By |
|-----|---------|---------|
| `group(id)` | `['groups', id]` | `useGroupDetail` |
| `group(id, 'payments')` | `['groups', id, 'payments']` | `useGroupPayments` |
| `group(id, 'enrollments')` | `['groups', id, 'enrollments']` | `useGroupEnrollments` |
| `group(id, 'competitions')` | `['groups', id, 'competitions']` | `useGroupCompetitions` |
| `group(id, 'attendance', levelNumber)` | `['groups', id, 'attendance', levelNumber]` | `useGroupAttendance` |

### Types Replacing `any`

| Location | New Type |
|----------|----------|
| `GroupsPage.handleUpdateGroup` parameter | `ScheduleGroupInput` |
| `useGroupQueries.updateGroupMutation` data | `UpdateGroupDTO` |
| `GroupsPage` catch clauses | `unknown` with type guard |
| `GroupForm` catch clause | `unknown` with type guard |
| `GroupsPage` error detail mapper | `{ loc?: string[]; msg?: string }` |
