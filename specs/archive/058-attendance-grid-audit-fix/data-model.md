# Data & Component Model: Attendance Grid Audit Fix

Specification of key entities, types, and interfaces modified or referenced by this feature.

## Core Entities

### AttendanceStatus
```typescript
// src/api/attendance/types.ts
type AttendanceStatus = 'present' | 'absent' | 'cancelled' | null
```
Unchanged — the toggle cycle is `null → present → absent → cancelled → null`.

### SessionWithAttendanceDTO
```typescript
// src/api/dashboard/types/models.ts
interface SessionWithAttendanceDTO {
  id: number
  session_id: number          // alias
  session_date: string
  date: string                // alias
  time_start: string
  start_time: string          // alias
  instructor_name: string
  instructor_id: number | null
  status: string
  notes: string | null
  attendance: AttendanceRecordDTO[] | null
}
```
No changes — alias fields retained for backward compatibility.

### StudentRosterDTO
```typescript
// src/api/dashboard/types/models.ts
interface StudentRosterDTO {
  student_id: number
  name: string
  gender: string
  billing_status: 'paid' | 'due' | 'partial'
  paid_amount: number
  total_amount: number
}
```
No changes — `attendanceTransforms.ts` continues to set `gender: 'male'` (new API doesn't return gender).

### StudentRowData
```typescript
// src/components/attendance/AttendanceGrid.tsx
interface StudentRowData {
  id: number
  name: string
  gender: string
  billing_status: string
  paid_amount: number
  total_amount: number
  attendance: Record<string, AttendanceStatus>
}
```
**Change (FR-8)**: Deduplicate with `StudentRow` from shared types, or extract to `src/types/attendance.ts`.

---

## Modified Interfaces

### AttendanceGridProps
```typescript
// BEFORE
interface AttendanceGridProps {
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]
  groupId: number
  levelNumber: number
  isLoading?: boolean        // REMOVED — never destructured
  selectedDate?: string
}

// AFTER
interface AttendanceGridProps {
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]
  groupId: number
  levelNumber: number
  selectedDate?: string
}
```

### AttendanceFooterProps
```typescript
// BEFORE
interface AttendanceFooterProps {
  hasChanges: boolean
  isSaving: boolean
  hasError?: boolean         // REMOVED — never referenced
  onSave: () => void
  onCancel: () => void
  sessionSaveStatus: Map<number, 'idle' | 'saving' | 'success' | 'error'>
  onRetrySession: (sessionId: number) => void
}

// AFTER
interface AttendanceFooterProps {
  hasChanges: boolean
  isSaving: boolean
  onSave: () => void
  onCancel: () => void
  sessionSaveStatus: Map<number, 'idle' | 'saving' | 'success' | 'error'>
  onRetrySession: (sessionId: number) => void
}
```

### AttendanceCell Props
```typescript
// BEFORE
interface AttendanceCellProps {
  status: AttendanceStatus
  onToggle: () => void       // inline closure wrapper
}

// AFTER
interface AttendanceCellProps {
  status: AttendanceStatus
  onToggle: (studentId: number, sessionId: number) => void
  studentId: number
  sessionId: number
  disabled?: boolean
}
```

### TimeGridSelector (NEW component)
```typescript
// src/components/attendance/TimeGridSelector.tsx
interface TimeGridSelectorProps {
  value: string
  onChange: (value: string) => void
  label: string
}
```
Extracted from `renderTimeGrid` inside `EditSessionPopup.tsx`.

---

## Hook Signatures

### useGroupAttendance (unchanged)
```typescript
// src/hooks/useGroupAttendance.ts
function useGroupAttendance(
  groupId: number | undefined,
  levelNumber: number
): {
  sessions: SessionWithAttendanceDTO[]
  roster: StudentRosterDTO[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```
Query key: `queryKeys.groupAttendance(groupId, levelNumber)` — `staleTime: 60s`, `gcTime: 5min`.

### useEmployees (NEW)
```typescript
// src/hooks/useEmployees.ts
function useEmployees(): {
  employees: EmployeeDTO[]
  isLoading: boolean
}
```
Uses `queryKeys.employees.list()`. Replaces inline `getEmployees` call in `EditSessionPopup`.

---

## Query Key Updates

```typescript
// src/hooks/queryKeys.ts — additions
export const queryKeys = {
  // ...existing keys...
  employees: {
    list: () => ['employees', 'list'] as const,
  },
}
```

---

## File Movement

| Before | After |
|--------|-------|
| `src/api/academics/academics.ts` — `getAttendanceForLevel` | `src/api/attendance/attendance.ts` — `getAttendanceForLevel` |
| `src/hooks/useGroupAttendance.ts` — import from `api/academics/` | `src/hooks/useGroupAttendance.ts` — import from `api/attendance/` |

Only consumer: `useGroupAttendance.ts`. No other files import `getAttendanceForLevel`.

---

## Summary of Changes

| Entity | Change Type | FR |
|--------|-------------|-----|
| `AttendanceGridProps` | Remove `isLoading` prop | FR-7 |
| `AttendanceFooterProps` | Remove `hasError` prop | FR-7 |
| `AttendanceCellProps` | Add `studentId`, `sessionId`, `disabled`; change `onToggle` signature | FR-6 |
| `StudentRowData` | Deduplicate or extract to shared type | FR-8 |
| `TimeGridSelector` | New component (extracted from `EditSessionPopup`) | FR-6 |
| `useEmployees` | New hook | FR-9 |
| `queryKeys.employees` | New key factory | FR-9 |
| `getAttendanceForLevel` | Move from `api/academics/` to `api/attendance/` | FR-9 |
