# Data Model: Fix Directory Audit

## Overview

No new entities are introduced. This feature only modifies existing types and removes unused ones.

## Existing Entities

### StudentListItem
- **Source**: `src/api/crm/students/types/models.ts`
- **Fields**: `id`, `full_name`, `phone`, `status`, `date_of_birth`, `gender`, `grade`, `current_group_name`, `has_unpaid_balance`, etc.
- **Usage**: Primary student type used in directory list views

### StudentFilterItem
- **Source**: `src/api/crm/students/types/models.ts`
- **Fields**: `id`, `full_name`, `phone`, `status`, `age`, `gender`, `grade`, `unpaid_balance`, etc.
- **Note**: Structurally different from StudentListItem — lacks `date_of_birth`, uses `age` instead, uses `unpaid_balance` instead of `has_unpaid_balance`

### ParentListItem
- **Source**: `src/api/crm/parents.ts`
- **Fields**: `id`, `full_name`, `phone_primary`, `student_count`, etc.

### StudentStatus
- **Type**: `'active' | 'waiting' | 'inactive'`
- **Usage**: Filter, status badges, status updates

### FilterState
- **Source**: `src/hooks/directory/useAdvancedSearch.ts`
- **Fields**: `ageMin`, `ageMax`, `status[]`, `gender[]`, `courseIds[]`, `groupDays[]`, `instructorName`, `hasUnpaidBalance`, `enrollmentCountMin/Max`, `enrollmentDateFrom/To`, `excludeCourseIds[]`, `courseEnrollmentDateFrom/To`, `minActivityCount`, `maxActivityCount`, `activityTypes[]`, `activityDateFrom/To`, `activitySearchTerm`

### GroupItem<T>
- **Source**: `src/hooks/directory/useDirectoryData.ts`
- **Fields**: `key: string`, `label: string`, `count: number`, `items: T[]`, `sortKey: number`

## Type Changes

| File | Change | Impact |
|------|--------|--------|
| `StudentCard.tsx:23` | `Record<string, {…}>` → `Record<StudentStatus, {…}>` | Only allows valid status keys in statusConfig |
| `ParentCard.tsx:6` | Remove `onEdit`, `onDelete` from `ParentCardActions` | Interface becomes empty; can be replaced with `Record<string, never>` or removed entirely if no consumers exist |
