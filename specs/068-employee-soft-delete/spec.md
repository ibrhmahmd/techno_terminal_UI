# Spec: Employee Soft-Delete

**Feature**: HR employee soft-delete, restore, and deleted-row discovery view
**Source contract**: `e:\Users\ibrahim\Desktop\techno_data_ Copy\specs\040-employee-soft-delete\frontend-migration-notes.md`
**Reference pattern**: Student soft-delete (`src/api/crm/students/`, `useDirectory.ts`, `DirectoryPage.tsx`)

---

## User Stories

### US1 — Soft-Delete an Employee (P1)

**As an** admin
**I want to** soft-delete an employee from the staff list or detail modal
**So that** I can hide inactive/terminated employees without permanent data loss

**Acceptance Criteria**:
- "Delete" action available in `EmployeeCard` row actions (alongside View, Edit, Create Account)
- "Delete" action available in `EmployeeDetailModal` footer
- Clicking delete opens a confirmation dialog ("Are you sure you want to delete {name}? This will hide them from the staff list and block their login.")
- On confirm: `DELETE /hr/employees/{id}` → optimistic removal from list + detail cache
- Employee disappears from default list immediately
- Error handling: 404 (`NotFoundError`) → "Employee not found" banner; generic errors via `extractApiErrorMessage`
- After delete: if detail modal is open, close it

**Independent Test**: Delete an employee from row actions → card vanishes from list → try to view deleted employee via detail modal → 404 banner

---

### US2 — Deleted Employees Discovery View (P1)

**As an** admin
**I want to** toggle "Include deleted" on the staff page to see soft-deleted employees
**So that** I can find and restore previously deleted employees

**Acceptance Criteria**:
- "Include deleted" toggle control on staff page (near search bar)
- When enabled: `GET /hr/employees?page=&page_size=&include_deleted=true` → list includes deleted rows
- Deleted rows render with red/muted styling: reduced opacity row, red tint background, "Deleted" badge (red chip), deleted timestamp shown
- Live rows render normally
- Pagination and search continue to work with `include_deleted=true`
- Toggle OFF re-fetches default list (no deleted rows)
- Deleted row shows "Restore" action button (replaces Edit/Create Account row actions for deleted employees)
- Cache key includes `include_deleted` in `staffKeys.list(...)` params

**Independent Test**: Toggle include_deleted → deleted employee appears with red/muted styling + "Deleted" badge → toggle off → disappears again

---

### US3 — Restore an Employee (P1)

**As an** admin
**I want to** restore a soft-deleted employee
**So that** I can bring back an employee who was deleted by mistake or is returning

**Acceptance Criteria**:
- "Restore" button on deleted employee's detail modal (yellow warning banner at top: "This employee was deleted on {date} by {admin}. Restoring will re-add them to the staff list but will NOT automatically restore their login.")
- "Restore" button replaces Edit/Create Account row actions for deleted employees in list view
- On confirm: `POST /hr/employees/{id}/restore` → response returns employee with `deleted_at: null, deleted_by: null`
- After restore: employee removed from deleted view, reappears in default list
- Error handling:
  - 404 (`NotFoundError`) → "Employee not found"
  - 409 (`ConflictError`, message "is not deleted") → "This employee is not deleted"
  - 409 (`ConflictError`, colliding fields) → "Cannot restore: {field conflicts}" (aggregated message)
- After restore: invalidate both `staffKeys.all` and `queryKeys.employees.all`

**Independent Test**: Restore from list view → employee disappears from deleted view → appears in default list → try restore again on same employee → "not deleted" error

---

### US4 — Restore from Detail Modal Banner (P2)

**As an** admin viewing a deleted employee's detail
**I want to** see a warning banner with context and a restore button
**So that** I understand the implications before restoring

**Acceptance Criteria**:
- Yellow warning banner at top of `EmployeeDetailModal` when `deleted_at` is non-null
- Banner shows: "Employee was soft-deleted on {formatted date}" and "Restoring will NOT automatically re-enable their login"
- "Restore Employee" button in banner
- Clicking restore triggers US3 flow
- After successful restore: banner disappears, modal refreshes with restored employee data

**Independent Test**: Open deleted employee detail → see yellow banner → click restore → banner disappears, employee shows as active

---

### US5 — Employee Type Updates (P2, Foundational)

**As a** developer
**I want** the TypeScript types and API functions to support soft-delete fields and endpoints
**So that** the UI can render deleted status and call new endpoints

**Acceptance Criteria**:
- `EmployeePublic` gains `deleted_at: string | null` and `deleted_by: number | null`
- `EmployeeListItem` gains `deleted_at: string | null` and `deleted_by: number | null`
- `getEmployees` params gain `include_deleted?: boolean`
- New API functions: `softDeleteEmployee(id)`, `restoreEmployee(id)`
- `staffKeys.list(...)` params gain `include_deleted?: boolean`
- New query key: `staffKeys.detail(id)` already exists; deleted employee detail uses same key (restored employee returns same shape)
- Both `staffKeys.all` and `queryKeys.employees.all` invalidated after delete/restore mutations
- EmployeeDetailModal renders `deleted_at` info when present

**Independent Test**: TypeScript compiles with new fields; API functions exist and are exported

---

## Scope Boundaries

### In Scope
- Soft-delete from row actions + detail modal
- Restore from row actions + detail modal banner
- "Include deleted" toggle with red/muted row styling + badge
- Confirmation dialogs for delete and restore
- Cache invalidation (both families)
- Error handling for all documented error scenarios

### Out of Scope
- Hard delete (permanent removal) — not in HR backend contract
- Bulk delete/restore
- Deleted employee count/badge on the toggle
- Audit log of who deleted whom (beyond `deleted_by` field display)
- Login re-enablement after restore (separate admin action, documented as gotcha)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Two cache families (`staffKeys` + `queryKeys.employees.*`) | Stale data if only one invalidated | Every delete/restore mutation invalidates both; pattern already established in student soft-delete |
| `include_deleted` param in cache key | Cache pollution if params not keyed correctly | Include `include_deleted` in `staffKeys.list(...)` params object |
| InstructorCombobox uses `useEmployees` from `useStaff.ts` | Could show deleted employees in instructor picker | Ensure default query (without `include_deleted`) excludes deleted — backend handles this per migration notes |
| Restore does NOT re-enable login | Users may expect full restoration | Banner explicitly warns "will NOT automatically re-enable login" |

---

## Dependencies

- Backend endpoints must be deployed and accessible at `/api/v1/hr/employees/{id}` (DELETE) and `/api/v1/hr/employees/{id}/restore` (POST)
- `include_deleted` query param must be supported on `GET /hr/employees`
- `deleted_at`/`deleted_by` fields must be present in employee responses

---

## Files to Modify

| File | Change |
|------|--------|
| `src/api/hr/types.ts` | Add `deleted_at`, `deleted_by` to `EmployeePublic` + `EmployeeListItem` |
| `src/api/hr/employees.ts` | Add `softDeleteEmployee`, `restoreEmployee`, update `getEmployees` params |
| `src/api/hr/index.ts` | Re-export new functions |
| `src/hooks/useStaff.ts` | Add `useSoftDeleteEmployee`, `useRestoreEmployee` hooks; extend `staffKeys.list` params; dual invalidation |
| `src/pages/StaffPage.tsx` | Add "Include deleted" toggle, deleted-row styling, delete/restore actions |
| `src/components/staff/EmployeeCard.tsx` | Add "Delete" row action; conditionally show "Restore" for deleted rows |
| `src/components/staff/EmployeeDetailModal.tsx` | Add deleted banner with restore button; show `deleted_at`/`deleted_by` |

---

## Verification Strategy

Each user story has independent acceptance criteria that can be tested against the local backend. The existing student soft-delete pattern (`src/api/crm/students/`) provides a proven reference for cache invalidation, API functions, and hook patterns. Tests should use the local backend (`:8000`) with `include_deleted` queries and confirm both `staffKeys` and `queryKeys.employees.*` are invalidated after mutations.
