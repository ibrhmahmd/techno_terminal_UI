# Data Model: Directory Page — Audit Fix

## Core Types

### `StudentStatus` (union)
```typescript
export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated' | 'withdrawn' | 'waiting' | 'pending';
```
Used as index key in status badge mappings — must be validated before access.

### `StudentListItem`
```typescript
export interface StudentListItem {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  status: StudentStatus;
  gender: 'male' | 'female' | null;
  phone: string | null;
  email: string | null;
  current_group_name: string | null;
  grade: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### `StudentFilterItem`
```typescript
export interface StudentFilterItem {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;       // New — replaces undefined DOB
  status: string;                       // Must validate against StudentStatus
  gender: 'male' | 'female' | null;
  phone: string | null;
  email: string | null;
  current_group_name: string | null;
  grade: string | null;
  avatar_url: string | null;
  current_enrollment_count: number;     // New — replaces enrollment_count
  has_unpaid_balance: boolean;          // New — replaces unpaid_balance (number)
  has_any_outstanding_balance: boolean; // New — from filter params
}
```

### `StudentFilterParams`
```typescript
export interface StudentFilterParams {
  search?: string;
  status?: StudentStatus;
  group_id?: number;
  has_any_outstanding_balance?: boolean; // Renamed from has_unpaid_balance
  // ... other filter fields
}
```

### `StudentGroupedResultDTO`
```typescript
export interface StudentGroupedResultDTO {
  groups: StudentGroup[];
  ungrouped: StudentListItem[];
}
```

## Type Guards (to be created)

```typescript
// Guards for US3
function isStudentListItem(item: StudentListItem | StudentFilterItem): item is StudentListItem;
function isValidStudentStatus(value: string): value is StudentStatus;
function toStudentListItem(filter: StudentFilterItem): StudentListItem;
```

## Query Keys (to be added/updated)

```typescript
// In src/hooks/queryKeys.ts
export const queryKeys = {
  directory: {
    students: {
      all: ['directory', 'students'] as const,
      list: (params: StudentFilterParams) => ['directory', 'students', params] as const,
    },
    parents: {
      all: ['directory', 'parents'] as const,
    },
    groups: {
      all: ['directory', 'groups', 'grouped'] as const,
      grouped: (params?: { search?: string; status?: string }) =>
        ['directory', 'groups', 'grouped', params] as const,
    },
    waitingList: {                          // New — created in US4
      all: ['directory', 'waitingList'] as const,
      list: (params?: { search?: string }) =>
        ['directory', 'waitingList', params] as const,
    },
  },
};
```
