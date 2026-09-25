# API Layer Contracts

## `src/api/crm/students/search.ts`

```typescript
// Filter endpoint — unchanged signature, but types updated
export function filterStudents(params: StudentFilterParams): Promise<StudentFilterItem[]>;

// Grouped endpoint — returns grouped + ungrouped students
export function getStudentsGrouped(params?: { search?: string; status?: string }): Promise<StudentGroupedResultDTO>;
```

## `src/api/crm/students/list.ts`

```typescript
// Search endpoint
export function searchStudents(query: string): Promise<StudentListItem[]>;

// List paginated
export function getStudentsList(params: { page: number; per_page: number; search?: string }): Promise<PaginatedApiResponse<StudentListItem>>;
```

## Hook Contracts

### `useWaitingList` (updated — US4)
```typescript
export function useWaitingList(enabled?: boolean): {
  data: StudentListItem[];
  isLoading: boolean;
  error: Error | null;        // No unnecessary cast
};
```

### `useStudentsGrouped` (updated — US4)
```typescript
export function useStudentsGrouped(params?: { search?: string; status?: string }): {
  data: StudentGroupedResultDTO | undefined;
  isLoading: boolean;
  // staleTime: 3 min (was 5 min)
};
```

### `useStudentActions` (updated — US1)
```typescript
export function useStudentActions(): {
  updateStudent: (id: number, data: Partial<StudentListItem>) => Promise<void>;
  linkParent: (studentId: number, parentId: number) => Promise<void>;
  updateStatus: (id: number, status: StudentStatus) => Promise<void>;
  saveAll: (studentId: number, data: { updates: Partial<StudentListItem>; parentId?: number; status?: StudentStatus }) => Promise<void>;
  // saveAll uses Promise.allSettled internally
};
```

## Component Props Contracts

### `AdvancedSearchPanel`
```typescript
interface AdvancedSearchPanelProps {
  onApply: (params: StudentFilterParams) => void;
  // Enter key fires onApply only when NOT focused on an input element
}
```

### `StudentMobileCard`
```typescript
interface StudentMobileCardProps {
  student: StudentListItem & { current_group_name?: string | null };
  // status icon: icon-only, no text label
  // full name: no truncation
}
```

### `WaitingStudentCard`
```typescript
interface WaitingStudentCardProps {
  student: StudentListItem;
  // age computed from date_of_birth (no "Unknown")
  // status: icon-only with tooltip
}
```

### `TabGroup` (DirectoryPage group tabs)
```typescript
// ARIA: role="tablist" on container, role="tab" on each button, role="tabpanel" on each panel
// Keyboard: ArrowLeft/ArrowRight/Home/End navigation
// aria-labelledby on each tabpanel pointing to corresponding tab
```
