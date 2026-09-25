# Feature Specification: Staff Page Improvement

**Feature Branch**: `002-staff-page`
**Created**: 2026-05-12
**Status**: Draft
**Input**: Audit of `StaffPage.tsx`, `src/api/hr/`, `src/components/staff/`

---

## Clarifications

> No questions deferred yet. The spec is based on code audit. If backend API gaps arise (missing fields on GET), those will need a follow-up.

---

## User Stories

### User Story 1 — View Paginated Staff List (Priority: P1)

An admin navigates to the Staff page and sees all employees in a responsive card grid with pagination. The page loads quickly and preserves scroll position.

**Why this priority**: The staff list is the primary view. It currently loads but has broken pagination and missing fields on cards.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they navigate to `/staff`, **Then** a grid of employee cards is displayed with profile initials, name, email, job title, employment type, and status badge
2. **Given** the employee list spans multiple pages, **When** the user clicks a page number, **Then** the next page loads and the grid updates
3. **Given** a page is loading, **Then** a loading state (spinner/skeleton) is shown
4. **Given** the API returns an error, **Then** an error state with retry action is displayed

### User Story 2 — Search Employees (Priority: P1)

An admin types into a search bar and sees matching employees across the entire dataset, not just the current page.

**Why this priority**: Client-side search over a single page is misleading. The current implementation only searches 20 items.

**Acceptance Scenarios**:

1. **Given** the user types in the search bar, **Then** the query is debounced (300ms) and sent as a server-side search parameter
2. **Given** the search returns results, **Then** the grid shows only matching employees with updated pagination
3. **Given** the search returns no results, **Then** an "No employees found" empty state is displayed
4. **Given** the user clears the search, **Then** the full list is restored

### User Story 3 — Create Employee (Priority: P1)

An admin clicks "Add Employee", fills in the form, submits, and the new employee appears in the list without a full page reload.

**Why this priority**: Core CRUD functionality already exists with manual refresh — should use React Query cache invalidation instead.

**Acceptance Scenarios**:

1. **Given** the user clicks "Add Employee", **Then** a modal opens with the employee form (personal info + work settings)
2. **Given** the user submits valid data, **Then** the employee is created, the modal closes, a success toast appears, and the list updates via cache invalidation
3. **Given** the user submits with missing required fields (name, phone, national ID), **Then** inline validation errors are shown
4. **Given** the API returns a 422 validation error, **Then** the error message is parsed and displayed in the form
5. **Given** the user clicks Cancel, **Then** the modal closes without changes

### User Story 4 — Edit Employee (Priority: P1)

An admin clicks "Edit" on an employee card, modifies fields, submits, and the card updates in place.

**Acceptance Scenarios**:

1. **Given** the user clicks "Edit" on an employee, **Then** a modal opens pre-filled with the employee's current data
2. **Given** the user modifies fields and submits, **Then** the employee is updated, the modal closes, a success toast appears, and the list updates
3. **Given** the user toggles "Employee is active", **Then** the status is updated on submit

### User Story 5 — View Employee Details (Priority: P2)

An admin clicks "View" on an employee card and sees full profile details including hire date and employment info.

**Acceptance Scenarios**:

1. **Given** the user clicks "View" on an employee, **Then** a detail modal opens with all available employee fields (name, email, phone, hire date, employment type, job title, status)
2. **Given** the detail is loading, **Then** a loading spinner is shown inside the modal
3. **Given** the detail fetch fails, **Then** an error message is shown in the modal

### User Story 6 — Create Staff Account (Priority: P2)

An admin clicks "Account" on an employee card and creates a Supabase user account for that employee.

**Acceptance Scenarios**:

1. **Given** the user clicks "Account" on an employee, **Then** a modal opens with email, password, and role fields
2. **Given** the user submits with a password ≥ 12 characters, **Then** the account is created and a success toast appears
3. **Given** the user submits with a weak password, **Then** an error is shown
4. **Given** creating the account fails, **Then** the error is shown in the modal

### User Story 7 — Filter by Employment Type (Priority: P3)

An admin filters the staff list by employment type (full-time, part-time, contract) without reloading the page.

**Acceptance Scenarios**:

1. **Given** the user selects an employment type filter, **Then** the list is filtered to show only matching employees
2. **Given** the user clears the filter, **Then** the full list is restored

---

## Technical Design

### Architecture Change: React Query Migration

Replace `usePagination` + manual state with a React Query hook:

```
src/hooks/useStaff.ts            ← NEW: React Query hook for employees
src/hooks/useStaffAccounts.ts    ← NEW: React Query hook for staff accounts
src/pages/StaffPage.tsx          ← REFACTOR: use hooks instead of manual fetch
src/api/hr/employees.ts          ← PATCH: fix fetchEmployeesPaginated total
src/components/staff/            ← REFACTOR: use hooks, fix type alignment
```

**New hook: `src/hooks/useStaff.ts`**
```typescript
export function useEmployees(search: string, page: number, pageSize: number)
export function useEmployee(id: number)
export function useCreateEmployee()
export function useUpdateEmployee()
```

### Search: Server-Side with Debounce

- Use `PaginationParams.q` field (already exists in `src/types/pagination.ts`)
- Debounce 300ms before sending API request
- Include `q` param in the React Query key so cache is search-aware

### Pagination: Server-Authoritative Total

- `fetchEmployeesPaginated` must use `result.total` from `PaginatedApiResponse` instead of `data.length`
- `getEmployees` already returns `ApiResponse<EmployeeListItem[]>` which has `total` — the pagination adapter just needs to use it

### Type Alignment

- `EmployeeCard` props change from `EmployeePublic` to a new display type or use `EmployeePublic` correctly
- `fetchEmployeesPaginated` should return `EmployeePublic[]` with actual data from `getEmployee` or the backend should return richer list items

### State Management

- **Server state**: React Query (all API data)
- **UI state**: `useState` remains only for modals (open/close, which employee is being edited)
- **Toasts**: `useToast` — already used, keep as-is

---

## Constraints

- TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`)
- `erasableSyntaxOnly: true` — no enums or namespaces
- Vitest + happy-dom for tests
- Existing component conventions (naming, folder structure)
- Build must pass `tsc -b && vite build`
- Backend is independent — do not modify server code

## Future Considerations (Out of Scope)

- Employee attendance tracking UI
- Payroll / salary history display
- Role-based action permissions (beyond basic auth guard)
- Bulk employee import/export
- Department filtering
