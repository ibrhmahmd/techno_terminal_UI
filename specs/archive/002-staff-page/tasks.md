---

description: "Task list for Staff Page Improvement feature"
---

# Tasks: Staff Page Improvement

**Input**: Design documents from `/specs/002-staff-page/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: Test tasks are included in the Polish phase. Tests were not explicitly requested for TDD; they are post-implementation coverage as described in the plan.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/{Name}Page.tsx`
  - Types: `src/types/`
  - Tests: `src/tests/`
- Domain folder for this feature: `hr` (existing) for API, `staff` (existing) for components

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify API contracts and create placeholder files

- [ ] T001 Verify backend API returns `total` in paginated response: call `GET /hr/employees?page=1&page_size=1` from dev proxy
- [ ] T002 Verify `EmployeePublic` GET response fields match `EmployeeCreateInput` by calling `GET /hr/employees/{id}`
- [x] T003 [P] Create placeholder hook file at `src/hooks/useStaff.ts` with exported empty query key factory `staffKeys`

**Checkpoint**: API contract confirmed, no surprises. All future tasks assume the API returns `{ success, data, total, skip, limit }` for list and `{ success, data }` for detail.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: React Query hooks and API fixes that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Define `staffKeys` query key factory in `src/hooks/useStaff.ts`: `all`, `list({search, page, pageSize})`, `detail(id)`
- [x] T005 [P] Implement `useEmployees(search, page, pageSize)` query in `src/hooks/useStaff.ts` wrapping `getEmployees` with `staleTime: 5 * 60 * 1000`
- [x] T006 [P] Implement `useEmployee(id)` query in `src/hooks/useStaff.ts` wrapping `getEmployee` with `enabled: !!id`
- [x] T007 [P] Implement `useCreateEmployee()` mutation in `src/hooks/useStaff.ts` that invalidates `staffKeys.all` on success
- [x] T008 [P] Implement `useUpdateEmployee()` mutation in `src/hooks/useStaff.ts` that invalidates `staffKeys.all` on success
- [x] T009 [P] Create `useStaffAccounts()` query and `useCreateEmployeeAccount()` mutation in `src/hooks/useStaffAccounts.ts`
- [x] T010 Fix `fetchEmployeesPaginated` total in `src/api/hr/employees.ts`: return `result.total` from API response instead of `data.length`; compute `hasMore` as `skip + limit < total`; remove `as EmployeePublic[]` cast
- [x] T011 Add optional `q` search param to `getEmployees` in `src/api/hr/employees.ts`: accept `q?: string` in params and pass to API
- [x] T012 Change `EmployeeCard` props from `EmployeePublic` to `EmployeeListItem` in `src/components/staff/EmployeeCard.tsx`; remove fields not on `EmployeeListItem` (email, phone, hired_at) from the card render

**Checkpoint**: Foundation ready — hooks exist, API functions are correct, EmployeeCard uses the right list type. User stories can now begin.

---

## Phase 3: User Story 1 — View Paginated Staff List (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a responsive employee card grid with correct pagination, loading state, and error handling.

**Independent Test**: Navigate to `/staff`. Verify grid renders. Click page 2. Verify grid updates. Reload. Verify page state persists via URL or first page.

### Implementation for User Story 1

- [x] T013 [P] [US1] Wire `useEmployees` into `StaffPage.tsx`: replace `usePagination(fetchEmployeesPaginated, ...)` + `useState`/`useEffect` with `const { data, isLoading, error } = useEmployees('', 1, 20)`; derive pagination from data
- [x] T014 [US1] Replace manual pagination in `StaffPage.tsx` with `PaginationControls` wired to `useEmployees` page state; pass `total` from API response
- [x] T015 [P] [US1] Add loading state to `StaffPage.tsx`: render `<LoadingSpinner />` when `isLoading` is true and no data is cached
- [x] T016 [US1] Add error state to `StaffPage.tsx`: render `<ErrorState />` with retry button when `error` is non-null; retry calls `refetch()`
- [x] T017 [US1] Remove `usePagination` import and `useEffect` on mount from `StaffPage.tsx`; keep only UI state for modals

**Checkpoint**: `/staff` shows the card grid with correct pagination. Loading spinner appears during fetch. Error state shows with retry on failure.

---

## Phase 4: User Story 2 — Search Employees (Priority: P1)

**Goal**: Users type into the search bar and see matching employees across the entire dataset with debounced server-side search.

**Independent Test**: Type "Ahmed" in search bar. After 300ms debounce, grid updates to show only matching employees. Clear search, full list restores.

### Implementation for User Story 2

- [x] T018 [US2] Add debounced search state to `StaffPage.tsx`: `const [search, setSearch] = useState('')` with 300ms debounce using `useEffect` + `setTimeout`
- [x] T019 [US2] Wire `search` into `useEmployees` call: pass debounced search value to `useEmployees(search, page, pageSize)` so React Query key changes on search
- [x] T020 [US2] Remove client-side `filteredEmployees` filter logic from `StaffPage.tsx` (lines filtering `employees.filter(...)`)
- [x] T021 [US2] Add empty search state to `StaffPage.tsx`: render <EmptyState /> with "No employees found" message when data is empty and search is non-empty

**Checkpoint**: Searching filters across all pages. Debounce prevents excessive API calls. Empty state shown for no-match queries.

---

## Phase 5: User Story 3 — Create Employee (Priority: P1)

**Goal**: Admin clicks "Add Employee", fills in the form, submits, and the new employee appears in the list without page reload.

**Independent Test**: Click "Add Employee", fill all fields, submit. Modal closes. Toast appears. Employee card appears in grid. No manual refresh needed.

### Implementation for User Story 3

- [x] T022 [P] [US3] Wire `useCreateEmployee` mutation to `handleCreateEmployee` in `StaffPage.tsx`: replace manual `createEmployee` + `refresh()` with `mutation.mutateAsync(data)`
- [x] T023 [US3] Add success toast and modal close on mutation success in `StaffPage.tsx`: call `showToast('Employee created successfully', 'success')` and `setIsAddModalOpen(false)` in mutation's `onSuccess`
- [x] T024 [US3] Pass mutation `isPending` state as `isLoading` to `EmployeeForm` in `StaffPage.tsx`
- [x] T025 [US3] Keep `createError` state for API error display in `EmployeeForm`; errors from mutation are passed as `apiError` prop

**Checkpoint**: Create modal opens. Submit creates employee. Toast confirms. Card appears via cache invalidation. Network error shows in form.

---

## Phase 6: User Story 4 — Edit Employee (Priority: P1)

**Goal**: Admin clicks "Edit" on a card, modifies fields in the modal, submits, and the card updates in place.

**Independent Test**: Click "Edit" on a card. Modal opens pre-filled. Change name. Submit. Modal closes. Card shows new name. Toast confirms.

### Implementation for User Story 4

- [x] T026 [P] [US4] Wire `useUpdateEmployee` mutation to `handleUpdateEmployee` in `StaffPage.tsx`: replace manual `updateEmployee` + `refresh()` with `mutation.mutateAsync({ id: editingEmployee.id, data })`
- [x] T027 [US4] Add success toast and modal close on mutation success in `StaffPage.tsx`: call `showToast('Employee updated successfully', 'success')` and `setEditingEmployee(null)` in mutation's `onSuccess`
- [x] T028 [US4] Pass mutation `isPending` state as `isLoading` to `EmployeeForm` in `StaffPage.tsx` during edit
- [x] T029 [US4] Keep `updateError` state for API error display in edit `EmployeeForm`

**Checkpoint**: Edit modal opens pre-filled. Submit updates card. Toast confirms. Cache invalidation updates grid.

---

## Phase 7: User Story 5 — View Employee Details (Priority: P2)

**Goal**: Admin clicks "View" on a card and sees full employee profile in a detail modal.

**Independent Test**: Click "View" on a card. Detail modal opens showing email, phone, hire date, employment type, status. Close button works.

### Implementation for User Story 5

- [x] T030 [P] [US5] Wire `useEmployee(id)` query to `handleViewEmployee` in `StaffPage.tsx`: replace manual `getEmployee` call with query enabled when `viewingEmployee` is set
- [x] T031 [US5] Pass query `data` and `isLoading` to `EmployeeDetailModal` in `StaffPage.tsx`
- [x] T032 [US5] Add error state to `EmployeeDetailModal.tsx`: show error message when fetch fails
- [x] T033 [US5] Ensure `national_id` field renders in `EmployeeDetailModal.tsx` if present on `EmployeePublic`

**Checkpoint**: View modal opens. Shows employee details with loading state. Error message on fetch failure.

---

## Phase 8: User Story 6 — Create Staff Account (Priority: P2)

**Goal**: Admin clicks "Account" on a card, creates a Supabase user account for the employee.

**Independent Test**: Click "Account" on a card. Fill email, password (≥12 chars), select role. Submit. Toast confirms account created.

### Implementation for User Story 6

- [x] T034 [P] [US6] Wire `useCreateEmployeeAccount` mutation to `handleCreateAccount` in `StaffPage.tsx`: replace manual `createEmployeeAccount` with `mutation.mutateAsync(data)`
- [x] T035 [US6] Add success toast and modal close on mutation success in `StaffPage.tsx`
- [x] T036 [US6] Pass mutation `isPending` to `CreateAccountModal` `isLoading` prop
- [x] T037 [US6] Ensure `CreateAccountModal` form state resets on close: clear email, password, role fields when modal dismisses

**Checkpoint**: Account modal opens. Submit creates account. Toast confirms. Form resets on close.

---

## Phase 9: User Story 7 — Filter by Employment Type (Priority: P3)

**Goal**: Admin filters the staff list by employment type (full-time, part-time, contract).

**Independent Test**: Select "Part Time" filter. Grid shows only part-time employees. Clear filter. Full list restores.

### Implementation for User Story 7

- [x] T038 [P] [US7] Add filter state and `PillSelector` for employment types to `StaffPage.tsx`: options `['all', 'full_time', 'part_time', 'contract']`
- [x] T039 [US7] Pass `employment_type` filter param to `useEmployees` query key and API call in `StaffPage.tsx`
- [x] T040 [US7] Add `employment_type` param support to `getEmployees` in `src/api/hr/employees.ts`
- [x] T041 [US7] Reset page to 1 when filter changes in `StaffPage.tsx`

**Checkpoint**: PillSelector renders. Clicking a filter updates the grid. Clearing restores full list.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, plus test coverage

- [x] T042 [P] Use `employeeStatusColors` from `src/utils/colors.ts` on EmployeeCard status badge in `src/components/staff/EmployeeCard.tsx`
- [x] T043 [P] Replace inline empty state `<div>` with `<EmptyState />` component from `src/components/common/` in `StaffPage.tsx`
- [x] T044 [P] Replace inline error banner with `<ErrorMessage />` component from `src/components/common/` in `StaffPage.tsx`  _(used ErrorState instead — same intent)_
- [ ] T045 [P] Create unit test file at `src/tests/staff/EmployeeCard.test.tsx`: test renders name/email/job-title, active/inactive badge, button clicks
- [ ] T046 [P] Create unit test file at `src/tests/staff/EmployeeForm.test.tsx`: test required field validation, create-mode national_id check, submit data shape, apiError display
- [ ] T047 [P] Create unit test file at `src/tests/staff/CreateAccountModal.test.tsx`: test email/password/role fields, password length validation, submit data
- [ ] T048 Create integration test file at `src/tests/staff/StaffPage.test.tsx`: test header renders, loading state, card grid, empty state with mocked hooks
- [ ] T049 Create hook test file at `src/tests/staff/useStaff.test.ts`: test useEmployees returns data, useCreateEmployee calls API + invalidates cache
- [x] T050 Run `npm run lint` and fix all errors  _(no StaffPage-related lint errors; remaining errors are pre-existing)_
- [x] T051 Run `npm run build` and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1 (Phase 3) → US2 (Phase 4): US2 depends on US1 for the page structure; otherwise parallel
  - US3, US4 (Phase 5-6): Depend on Foundational hooks, NOT on US1/US2
  - US5, US6 (Phase 7-8): Depend on Foundational hooks, independent of earlier stories
  - US7 (Phase 9): Depends on US1 (needs the list page), otherwise independent
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1) MVP**: Phase 2 → Phase 3 — No deps on other stories
- **US2 (P1)**: Phase 2 + US1 → Phase 4 — Search modifies the list page
- **US3 (P1)**: Phase 2 → Phase 5 — Only needs the create mutation hook
- **US4 (P1)**: Phase 2 → Phase 6 — Only needs the update mutation hook
- **US5 (P2)**: Phase 2 → Phase 7 — Only needs the employee detail query hook
- **US6 (P2)**: Phase 2 → Phase 8 — Only needs the create-account mutation hook
- **US7 (P3)**: Phase 2 + US1 → Phase 9 — Filter modifies the list page

### Within Each User Story

- API param changes (if needed) before hook wiring
- Hook wiring before component changes
- Component changes before page integration
- Story complete before moving to next

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel
- After Foundational: US3, US4, US5, US6 can ALL run in parallel (they only touch different modals/mutations)
- US1 and US2 must be sequential (US2 modifies the same page)
- US7 depends on US1
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 3 + 4 + 5 + 6

```bash
# US3: Create Employee — only touches Create modal and useCreateEmployee
Task: "Wire useCreateEmployee mutation in StaffPage.tsx"

# US4: Edit Employee — only touches Edit modal and useUpdateEmployee  
Task: "Wire useUpdateEmployee mutation in StaffPage.tsx"

# US5: View Employee Details — only touches detail modal and useEmployee
Task: "Wire useEmployee query in StaffPage.tsx"

# US6: Create Staff Account — only touches account modal and useCreateEmployeeAccount
Task: "Wire useCreateEmployeeAccount mutation in StaffPage.tsx"
```

These four stories touch different modals and different mutations/queries. They can be implemented in parallel.

---

## Implementation Strategy

### MVP First (User Stories 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (View Paginated List)
4. **STOP and VALIDATE**: Navigate to `/staff`, verify grid loads with correct pagination
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready
2. Add US1 → Test → Deploy (MVP: working list page)
3. Add US2 → Test → Deploy (searchable list)
4. Add US3 + US4 → Test → Deploy (full CRUD)
5. Add US5 → Test → Deploy (detail views)
6. Add US6 → Test → Deploy (account management)
7. Add US7 → Test → Deploy (filtering)
8. Phase 10 → Polish + tests → Finalize

### Parallel Team Strategy

With multiple developers:

1. One developer: Phase 1 + Phase 2 (setup + hooks + API fixes)
2. Once Phase 2 is done:
   - Developer A: US1 + US2 (list + search — share the page file)
   - Developer B: US3 + US4 + US5 (create, edit, detail modals)
   - Developer C: US6 + US7 (account creation, filter)
3. Developer A integrates parallel work sequentially since US1 is needed for US2
4. Polish phase can be divided: tests (T045-T049) are fully parallelizable

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- US3, US4, US5, US6 are the best candidates for parallel implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
