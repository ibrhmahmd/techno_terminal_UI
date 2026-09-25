# Data Model: Groups Page Audit & Fix

No new entities. Changes are limited to modifying existing types and refactoring existing code.

## Affected Types

### `GroupFilterOptions` (`src/api/academics/groups/core.ts:122`)

**Current:**
```ts
export interface GroupFilterOptions {
  q?: string;
  course_ids?: number[];
  day?: string[];
  instructor_id?: number;      // singular — drops multi-select
  level_number?: number;       // singular — drops multi-select
  status?: string[];
  has_instructor?: boolean;
  include_inactive?: boolean;
  limit?: number;
  skip?: number;
}
```

**Target:**
```ts
export interface GroupFilterOptions {
  q?: string;
  course_ids?: number[];
  day?: string[];
  instructor_ids?: number[];   // plural — supports multi-select
  level_numbers?: number[];    // plural — supports multi-select
  status?: string[];
  has_instructor?: boolean;
  include_inactive?: boolean;
  limit?: number;
  skip?: number;
}
```

### `GroupByField` (`src/api/academics/types/groups/grouping.ts:11`)

No change. The `'search'` option is internal to `GroupBySelector` via `GroupBySelectorValue` type and does not affect the API.

### `UpdateGroupDTO` (`src/api/academics/types/groups/inputs.ts`)

No change, but confirmed that `status` is NOT a field — US1 strips it from the EditGroupDialog mutation payload.

## Query Key Schema (consolidated into `queryKeys.ts`)

### Added to `queryKeys.ts`:

```ts
export const queryKeys = {
  // ... existing keys ...

  groups: {
    all:     ['groups'] as const,
    flat:    (filters?: GroupFilterOptions) => ['groups', 'flat', filters] as const,
    grouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
    byCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
  } as const,

  students: {
    grouped: {
      all: ['students', 'grouped'] as const,
      byParams: (...) => /* existing */ as const,
    } as const,
  } as const,

  employees: {
    all: ['employees', 'all'] as const,
  } as const,
}
```

Backward-compatible re-exports in `useGroupQueries.ts`:
```ts
export const groupKeys = queryKeys.groups
```

## State Transitions

| Entity | Transition | Trigger |
|--------|-----------|---------|
| `useGroups.groupBy` | `undefined → null → 'day'|'course'|'instructor'|'status'` | GroupBySelector onChange |
| `useGroups.groupBy` | `* → null` | Group Search pill click (forces flat view + opens filters) |
| `StatusBadge` render | `'active'|'inactive'|'completed'|'archived'|'unknown'` | Status string from API; unknown falls back to "Unknown" label |
| `EditGroupDialog.day` | `'' → string` | Day dropdown selection; empty string no longer passes schedule |
