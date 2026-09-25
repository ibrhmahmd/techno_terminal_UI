# Research: Staff Page Implementation Audit

**Date**: 2026-05-12
**Source**: `src/pages/StaffPage.tsx`, `src/api/hr/`, `src/components/staff/`

## Current Architecture

```
StaffPage.tsx
├── useState / useEffect for data fetching
├── usePagination(fetchEmployeesPaginated) — manual fetch hook
├── EmployeeCard        → card grid display
├── EmployeeForm        → create/edit form
│   ├── PersonalInfoSection
│   └── WorkSettingsSection
├── EmployeeDetailModal → read-only detail view
└── CreateAccountModal  → create Supabase user account
```

API layer at `src/api/hr/`:
| File | Purpose |
|------|---------|
| `types.ts` | `EmployeePublic`, `EmployeeListItem`, `EmployeeCreateInput`, `StaffAccountPublic`, `CreateEmployeeAccountRequest` |
| `employees.ts` | REST calls (`/hr/employees`), plus `fetchEmployeesPaginated` adapter for `usePagination` |
| `staff-accounts.ts` | GET `/hr/staff-accounts`, POST `/hr/employees/{id}/create-account` |

## Issues Found

### 1. No React Query — Inconsistent with App Convention

Every other data page in the app uses custom React Query hooks. The Staff page uses `usePagination` (a manual fetch hook) + raw `useState`. This means:
- No automatic cache invalidation or stale management
- Manual error/loading state management
- Refresh must be explicitly called
- `setPage` has a stale closure bug (captures old `isLoading`)

### 2. Pagination `total` is Wrong

`fetchEmployeesPaginated` (employees.ts:24-38):
```typescript
const result = await getEmployees({ page, page_size: limit })
return { items: data as EmployeePublic[], total: data.length, hasMore: data.length === limit }
```
- `total: data.length` should be `result.total` — the API `PaginatedApiResponse` has a `total` field
- `hasMore: data.length === limit` is a heuristic, not server-authoritative
- Items cast from `EmployeeListItem[]` to `EmployeePublic[]` — fields like `phone`, `email`, `national_id`, `hired_at` likely missing

### 3. Search is Client-Side Only

`StaffPage.tsx:141-146` filters `filteredEmployees` from the already-fetched page. This means:
- Search only works within the current page (20 items), not across the full dataset
- No debounced server-side search via `q` param (`PaginationParams` supports it)

### 4. Type Mismatch: List vs Detail

`EmployeeListItem` (used in grid) has only: `id`, `full_name`, `job_title`, `employment_type`, `is_active`.
But `EmployeeCard` and `EmployeeDetailModal` expect `EmployeePublic` fields (`email`, `phone`, `hired_at`).
The `as EmployeePublic[]` cast in `fetchEmployeesPaginated` silently masks missing fields.

### 5. Missing Fields in Detail Modal

`EmployeeDetailModal` shows: name, email, phone, hire date, employee ID, employment type, status.
Missing from API schema (`EmployeePublic`): `national_id`.
Missing from backend entirely (in `EmployeeCreateInput` but not `EmployeePublic`):
- `university`, `major`, `is_graduate`
- `monthly_salary`, `contract_percentage`

These fields are sent during create/update but never returned by GET. The spec/plan should decide: either request the backend to include them, or remove them from the form.

### 6. No Tests

Zero test files exist for any Staff component (`src/tests/` has no staff tests).

### 7. No Role-Based Guarding

The page is behind `<ProtectedRoute />` (any authenticated user). No restrictions on who can create/edit/delete employees or create accounts.

### 8. Minor Issues

- `useEffect` with empty deps and `// eslint-disable-next-line` — fragile pattern, especially if the component re-renders unexpectedly
- `PersonalInfoSection.tsx:14` text says "Hire date will be set automatically" — this is form behavior info that should live in the form handler, not the UI template
- `WorkSettingsSection` uses `onStatusChange` prop pattern inconsistent with the generic `onChange` used elsewhere
- `CreateAccountModal` hardcodes min 12-char password rule but doesn't validate complexity
- `LocalStorage key 'api_debug'` — not staff-specific, but worth keeping in AGENTS.md

## API Contract Notes

- GET `/hr/employees?page=&page_size=` → `ApiResponse<EmployeeListItem[]>`
- GET `/hr/employees/{id}` → `ApiResponse<EmployeePublic>`
- POST `/hr/employees` → `ApiResponse<EmployeePublic>`
- PUT `/hr/employees/{id}` → `ApiResponse<EmployeePublic>`
- GET `/hr/staff-accounts` → `ApiResponse<StaffAccountPublic[]>`
- POST `/hr/employees/{id}/create-account` → `ApiResponse<EmployeeAccountResponse>`

## Adjacent Files

| File | Relevance |
|------|-----------|
| `src/utils/colors.ts` | Has `employeeStatusColors` but currently unused by Staff components |
| `src/utils/apiErrors.ts` | Used by StaffPage for error extraction |
| `src/hooks/usePagination.ts` | Generic pagination hook — will be replaced by React Query |
| `src/types/pagination.ts` | `PaginationParams`, `PaginationResult` types |
