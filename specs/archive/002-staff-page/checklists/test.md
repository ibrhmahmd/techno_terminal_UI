# Test Coverage Checklist: Staff Page

| Component | Test File | Status |
|-----------|-----------|--------|
| EmployeeCard | `src/tests/staff/EmployeeCard.test.tsx` | ❌ |
| EmployeeForm | `src/tests/staff/EmployeeForm.test.tsx` | ❌ |
| CreateAccountModal | `src/tests/staff/CreateAccountModal.test.tsx` | ❌ |
| StaffPage | `src/tests/staff/StaffPage.test.tsx` | ❌ |
| useStaff (useEmployees) | `src/tests/staff/useStaff.test.ts` | ❌ |
| useStaff (useCreateEmployee) | `src/tests/staff/useStaff.test.ts` | ❌ |

## EmployeeCard Test Cases

- [ ] Renders employee name, email, job title, employment type
- [ ] Shows "Active" green badge when `is_active` is true
- [ ] Shows "Inactive" gray badge when `is_active` is false
- [ ] Click View button → calls `onView`
- [ ] Click Edit button → calls `onEdit`
- [ ] Click Account button → calls `onCreateAccount`

## EmployeeForm Test Cases

- [ ] Renders all fields: full_name, email, phone, national_id, job_title, employment_type
- [ ] Pre-fills initialData in edit mode
- [ ] Submit with empty name → validation error
- [ ] Submit with empty phone → validation error
- [ ] Submit in create mode without national_id → validation error
- [ ] Submit in edit mode without national_id → allows (optional)
- [ ] Submit with valid create data → calls `onSubmit` with correct shape
- [ ] Shows `apiError` prop when provided
- [ ] Cancel button calls `onCancel`

## CreateAccountModal Test Cases

- [ ] Renders email, password, role fields
- [ ] Pre-fills email from employee prop
- [ ] Submit with empty password → error message
- [ ] Submit with password < 12 chars → error message
- [ ] Submit with valid data → calls `onSubmit` with correct data
- [ ] Close button resets form state

## StaffPage Test Cases

- [ ] Renders "Staff Management" header
- [ ] Renders "Add Employee" button
- [ ] Renders search bar
- [ ] Loading state: shows spinner
- [ ] Populated state: renders employee cards
- [ ] Empty state: shows empty message
- [ ] Error state: shows error message

## useStaff Hook Test Cases

- [ ] `useEmployees` returns data from API
- [ ] `useCreateEmployee` calls API endpoint and invalidates cache
- [ ] `useUpdateEmployee` calls API endpoint and invalidates cache
