# Data Model References — Groups Feature Audit

This audit touches existing types only. No new data models or schema changes.

## Group Status Enum

Defined in `src/api/academics/types/groups/models.ts`:

```
GroupStatus = 'active' | 'inactive' | 'archived' | 'completed'
```

**Bug found**: `EditGroupDialog.tsx` uses `'cancelled'` (not in model) and omits `'inactive'` / `'archived'`.

## PaymentDetailDTO

Defined in `src/api/academics/types/groups/models.ts`:

```
PaymentDetailDTO {
  id: number
  group_id: number
  level_number: number
  student_id: number
  payment_date: string
  amount: number
  status: string
  // ...
}
```

**Bug found**: `LevelsTab.tsx` handlers use `payment: any` instead of this type.

## EnrichedGroupPublic

Defined in `src/api/academics/types/groups/models.ts`:

```
EnrichedGroupPublic {
  id: number
  name: string
  status: GroupStatus
  course_name: string
  instructor_name?: string
  schedule?: { start_time?: string; end_time?: string; day?: string }
  price_override?: number | null
  // ...
}
```

**Bug found**: `GroupDetailPage.tsx:309` passes `null` for `price_override` instead of `group?.price_override`.

## GroupBySelectorValue vs GroupByField

Defined in `src/api/academics/types/groups/grouping.ts`:

```
GroupByField = 'course' | 'status' | 'day' | 'instructor'
GroupBySelectorValue = GroupByField | 'search'
```

**Bug found**: `GroupBySelector` `value` prop typed as `GroupByField` excludes `'search'`, requiring `as any` at call site.

## Employees

```
queryKeys.employeesAll = ['employees', 'all']
```

**Bug found**: `AddSessionDialog` uses inline `['employees', 'list']` creating duplicate cache entry.
