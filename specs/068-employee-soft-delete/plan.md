# Implementation Plan: Employee Soft-Delete

**Feature**: 068-employee-soft-delete
**Tech Stack**: React + TypeScript, Vite, React Query, Tailwind CSS, Zustand
**Pattern Reference**: Student soft-delete (`src/api/crm/students/`)

---

## Architecture

### API Layer (`src/api/hr/`)

| Function | Endpoint | Method |
|----------|----------|--------|
| `softDeleteEmployee(id)` | `/hr/employees/{id}` | DELETE |
| `restoreEmployee(id)` | `/hr/employees/{id}/restore` | POST |
| `getEmployees({ include_deleted })` | `/hr/employees?include_deleted=true` | GET (existing, extend params) |

### Hook Layer (`src/hooks/useStaff.ts`)

| Hook | Purpose | Invalidation |
|------|---------|-------------|
| `useSoftDeleteEmployee()` | Mutation for DELETE | `staffKeys.all` + `queryKeys.employees.all` |
| `useRestoreEmployee()` | Mutation for POST restore | `staffKeys.all` + `queryKeys.employees.all` |
| `useEmployees(search, page, pageSize, include_deleted)` | Extend existing hook | — |

### Query Key Changes

```ts
staffKeys.list({ ..., include_deleted?: boolean })  // add param
```

### UI Components

| Component | Change |
|-----------|--------|
| `StaffPage.tsx` | Add toggle, deleted-row styling, wire delete/restore |
| `EmployeeCard.tsx` | Add Delete action; conditionally show Restore for deleted rows |
| `EmployeeDetailModal.tsx` | Deleted banner + restore button |

---

## File Change Order

1. `src/api/hr/types.ts` — add `deleted_at`, `deleted_by` (foundational, no deps)
2. `src/api/hr/employees.ts` — add API functions + extend params (depends on 1)
3. `src/api/hr/index.ts` — re-export (depends on 2)
4. `src/hooks/useStaff.ts` — add hooks + extend keys (depends on 2)
5. `src/components/staff/EmployeeCard.tsx` — delete/restore row actions (depends on 4)
6. `src/components/staff/EmployeeDetailModal.tsx` — deleted banner (depends on 4)
7. `src/pages/StaffPage.tsx` — toggle, styling, wire everything (depends on 5, 6)

---

## Verification

- All TypeScript compiles (`npm run build`)
- All new hooks have dual cache invalidation (`staffKeys.all` + `queryKeys.employees.all`)
- Deleted rows visually distinct (red/muted + badge)
- Restore shows warning banner before action
- Confirmation dialogs for destructive actions
