# Frontend API Contracts: Groups API Alignment

## New API Functions (to be added)

### Search Groups

```typescript
// GET /academics/groups/search?query=&status=
export async function searchGroups(
  query: string,
  status?: 'active' | 'inactive' | 'completed'
): Promise<Group[]>
```

### List Archived (Completed) Groups

```typescript
// GET /academics/groups/archived
export async function getArchivedGroups(
  params?: PaginationParams
): Promise<PaginationResult<Group>>
```

### Get Groups by Course

```typescript
// GET /academics/groups/by-course/{course_id}
export async function getGroupsByCourse(
  courseId: number
): Promise<Group[]>
```

### Get Groups by Type

```typescript
// GET /academics/groups/by-type/{group_type}
export async function getGroupsByType(
  groupType: string
): Promise<Group[]>
```

### List Sessions with Level Filter

```typescript
// GET /academics/groups/{id}/sessions?level=N
export async function listSessionsForGroup(
  groupId: number,
  level?: number
): Promise<Session[]>
```

## Updated API Functions (type signature changes)

### Create Group

```typescript
// BEFORE: ScheduleGroupInput { course_id, instructor_id, default_day, default_time_start, default_time_end, max_capacity?, notes? }
// AFTER:  ScheduleGroupInput { course_id, name, capacity, instructor_id, schedule, start_date }
export async function createGroup(data: ScheduleGroupInput): Promise<Group>
```

### Update Group

```typescript
// BEFORE: UpdateGroupDTO extends Partial<ScheduleGroupInput> { name?, level_number?, status? }
// AFTER:  UpdateGroupDTO { name?, capacity?, schedule?, instructor_id?, notes? }
export async function updateGroup(groupId: number, data: UpdateGroupDTO): Promise<Group>
```

## Removed API Functions (to be deleted)

All functions from `groups/competitions.ts`:
- `getGroupCompetitions`
- `getGroupTeams`
- `linkTeamToGroup`
- `registerForCompetition`
- `completeCompetitionParticipation`
- `withdrawFromCompetition`
- `getGroupCompetitionAnalytics`

Utility function from `groups/utils.ts`:
- `getGroupsWithCompetitions`

## New React Query Hooks (to be added)

```typescript
// Search hook
export function useSearchGroups(query: string, status?: string): UseQueryResult<Group[]>

// Archived groups hook
export function useArchivedGroups(params?: PaginationParams): UseQueryResult<PaginationResult<Group>>

// Groups by course hook
export function useGroupsByCourse(courseId: number): UseQueryResult<Group[]>
```

## Schedule Transform Utilities (to be added)

```typescript
// Flat form fields → nested API object (for create/update)
export function formToSchedule(
  day: string,
  startTime: string,
  endTime: string
): Schedule

// Nested API object → flat form fields (for form population)
export function scheduleToForm(
  schedule: Schedule
): { day: string; startTime: string; endTime: string }
```

## New Query Keys (to be added to queryKeys.ts)

```typescript
queryKeys.groupsArchived     // → ['groups', 'archived']
queryKeys.groupsByCourse(id) // → ['groups', 'by-course', id]
queryKeys.groupsByType(type) // → ['groups', 'by-type', type]
queryKeys.groupSearch(q, s)  // → ['groups', 'search', q, s]
```
