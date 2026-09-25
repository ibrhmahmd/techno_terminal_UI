# Quickstart: Redesign Employee Cards & Detail Dialog

**Phase**: 1 | **Date**: 2026-05-12

## Prerequisites

- Backend must deploy changes from [backend-changes.md](backend-changes.md) first (or at minimum the `EmployeeListItem` `phone`/`email` fields)
- `src/api/hr/types.ts` already updated — no additional type changes needed

## Implementation Order

### Step 1: Redesign `EmployeeCard.tsx`

```text
File: src/components/staff/EmployeeCard.tsx
Changes:
- Add phone and email rows after employment_type row
- Use conditional rendering: show field only if value exists
- Use `material-symbols-outlined` icons: `call` for phone, `mail` for email
- Add loading skeleton variant (accept optional `isLoading` prop)
```

### Step 2: Redesign `EmployeeDetailModal.tsx`

```text
File: src/components/staff/EmployeeDetailModal.tsx
Changes:
- Add `national_id` to the Personal Information section
- Add new sections for the extended EmployeePublic fields:
  - "Education" section: university, major, is_graduate
  - "Compensation" section: monthly_salary, contract_percentage
- Use skeleton placeholders (animate-pulse divs) during loading instead of spinner
- Show error state with retry button on fetch failure instead of plain text
- Import from `../common/ErrorState` for error display
```

### Step 3: Fix edit pre-fill in `StaffPage.tsx`

```text
File: src/pages/StaffPage.tsx
Changes:
- When edit modal opens (editingEmployee is set), fetch full detail with useEmployee(editingEmployee)
- Pass full EmployeePublic as initialData to EmployeeForm instead of sparse EmployeeListItem
- Add loading state for the edit modal while detail is being fetched
```

### Step 4: Update `EmployeeForm.tsx` (if needed)

```text
File: src/components/staff/EmployeeForm.tsx
Changes:
- Verify that initialData university, major, is_graduate, monthly_salary, contract_percentage
  are properly destructured into formData initialState
- Already uses `initialData?.fieldName || ''` pattern — should work automatically
```

### Step 5: Build & Lint

```bash
npm run build    # tsc -b && vite build
npm run lint     # zero errors
npm run test     # all tests pass
```

## Verification

1. Open Staff page → verify cards show phone and email
2. Click card → verify detail dialog shows all fields including national_id, education, compensation
3. Click edit → verify all fields pre-filled from full detail
4. Test with employee that has missing optional fields → graceful degradation
5. Test loading states → skeletons visible
6. Test error states → retry buttons visible
