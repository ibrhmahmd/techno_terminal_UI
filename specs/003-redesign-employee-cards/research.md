# Research: Redesign Employee Cards & Detail Dialog

**Phase**: 0 | **Date**: 2026-05-12

## Unknowns Resolved

### 1. Do we need to modify API adapters?

**Decision**: No adapter changes needed.

**Rationale**: `fetchEmployeesPaginated` (`src/api/hr/employees.ts`) calls `getEmployees()` which does:
```typescript
const response = await client.get<ApiResponse<EmployeeListItem[]> & { ... }>('/hr/employees', ...)
return response.data
```

The Axios response is typed by the generic parameter. Once `EmployeeListItem` includes `phone?` and `email?`, TypeScript accepts the backend response as-is — the adapter does no field filtering. Same for `getEmployee` → `EmployeePublic`. The types in `src/api/hr/types.ts` have already been updated.

### 2. What skeleton/loading patterns exist?

**Decision**: Use `animate-pulse` with placeholder divs. No dedicated `Skeleton` component exists.

**Rationale**: The codebase has `LoadingSpinner` (spinning circle) and `LoadingState` (spinner + message) in `src/components/common/`. Neither provides skeleton/placeholder UI. Custom skeleton divs with `animate-pulse` and `bg-slate-100`/`bg-slate-200` are the idiomatic Tailwind approach and used elsewhere in the codebase.

### 3. How should the edit form pre-fill from full data?

**Decision**: Fetch full employee detail via `useEmployee(id)` inside `StaffPage` when edit modal opens, pass the full `EmployeePublic` as `initialData`.

**Rationale**: The existing `useEmployee` hook already fetches from `GET /hr/employees/:id` and returns `EmployeePublic`. `StaffPage` currently passes only 4 fields from `EmployeeListItem`:
```typescript
initialData={{
  id: editingEmployeeData.id,
  full_name: editingEmployeeData.full_name,
  job_title: editingEmployeeData.job_title,
  employment_type: editingEmployeeData.employment_type,
  is_active: editingEmployeeData.is_active,
}}
```
Replace this with the full `EmployeePublic` from `useEmployee(editingEmployee)`. The `EmployeeForm` already accepts `initialData?: Partial<EmployeePublic>` — it will pick up the new fields automatically. The form uses `initialData?.fieldName || ''` for text fields and has empty defaults for `university`, `major`, `is_graduate`, `monthly_salary`, `contract_percentage` — these will now get real values from the full `EmployeePublic`.

### 4. Should detail dialog fields be organized into groups?

**Decision**: Yes — three logical sections: Personal Information, Contact, Employment Details.

**Rationale**: The spec (FR-004) requires organizing fields into logical visual groups. Current dialog already has a header section and a "Employment Information" section. Extend to:
- **Personal Information**: full_name, national_id, hired_at, employee_id
- **Contact**: email, phone
- **Employment Details**: job_title, employment_type, is_active, university, major, is_graduate, monthly_salary, contract_percentage

### 5. How to handle the `national_id` — show in dialog only, not on card?

**Decision**: national_id is displayed in the detail dialog only, never on cards.

**Rationale**: Spec FR-011 explicitly mandates this. national_id is personally identifiable information that should only appear behind an additional click (detail dialog).

## Alternatives Considered

- **Full skeleton component library**: Rejected — too heavy for this scope. Inline `animate-pulse` divs are sufficient.
- **Client-side field enrichment**: Rejected — relying on the API returning fields is cleaner than trying to merge create-time data client-side.
- **Separate endpoint for edit data**: Rejected — `GET /hr/employees/:id` already returns all needed data.
