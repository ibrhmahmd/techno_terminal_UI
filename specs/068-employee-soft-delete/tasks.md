# Tasks: Employee Soft-Delete

**Input**: Design documents from `/specs/068-employee-soft-delete/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md
**Tests**: Not requested in spec â€” omitted per template rules

**Organization**: Tasks grouped by user story (US1â€“US5) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in all descriptions

---

## Phase 1: Setup

**Purpose**: Verify backend readiness and capture baseline gates

- [X] T001 Confirm backend endpoints are accessible: `DELETE /hr/employees/{id}`, `POST /hr/employees/{id}/restore`, `GET /hr/employees?include_deleted=true` return expected responses; record baseline `npm run build` passes

---

## Phase 2: Foundational â€” Types, API, Hooks (US5)

**Purpose**: Extend types and API layer so all UI tasks can consume soft-delete data

**âš ï¸ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [US5] Add `deleted_at: string | null` and `deleted_by: number | null` to `EmployeePublic` and `EmployeeListItem` in `src/api/hr/types.ts`
- [X] T003 [US5] Add `include_deleted?: boolean` to `GetEmployeesParams` in `src/api/hr/employees.ts`
- [X] T004 [P] [US5] Add `softDeleteEmployee(id: number)` and `restoreEmployee(id: number)` functions in `src/api/hr/employees.ts`
- [X] T005 [P] [US5] Re-export new functions from `src/api/hr/index.ts`
- [X] T006 [US5] Extend `staffKeys.list(...)` params with `include_deleted?: boolean` in `src/hooks/useStaff.ts`
- [X] T007 [US5] Add `useSoftDeleteEmployee()` and `useRestoreEmployee()` hooks in `src/hooks/useStaff.ts` â€” both invalidate `staffKeys.all` AND `queryKeys.employees.all` on success
- [X] T008 [US5] Update `useEmployees` to pass `include_deleted` through to `fetchEmployeesPaginated` in `src/hooks/useStaff.ts`

**Checkpoint**: `npm run build` passes with new types/functions

---

## Phase 3: User Story 1 â€” Soft-Delete Employee (Priority: P1) ðŸŽ¯ MVP

**Goal**: Admin can delete an employee from row actions and detail modal

**Independent Test**: Delete an employee â†’ card vanishes from list â†’ detail modal shows 404

### Implementation

- [X] T009 [P] [US1] Add "Delete" action to `RowActions` in `src/components/staff/EmployeeCard.tsx` (icon: `delete`, variant: `danger`)
- [X] T010 [US1] Add confirmation dialog component or inline confirm ("Are you sure you want to delete {name}?") in `src/pages/StaffPage.tsx`
- [X] T011 [US1] Wire delete: call `useSoftDeleteEmployee().mutateAsync(id)` on confirm â†’ close detail modal if open â†’ invalidate list cache â†’ show success toast
- [X] T012 [US1] Add "Delete Employee" button in `EmployeeDetailModal` footer (red variant, confirmation dialog)
- [X] T013 [US1] Handle delete errors: 404 â†’ "Employee not found", generic â†’ `extractApiErrorMessage`

**Checkpoint**: Employee can be deleted from both row actions and detail modal

---

## Phase 4: User Story 2 â€” Deleted Employees Discovery View (Priority: P1)

**Goal**: Toggle shows deleted employees with red/muted styling

**Independent Test**: Toggle include_deleted â†’ deleted employee appears with red row + badge â†’ toggle off â†’ disappears

### Implementation

- [X] T014 [US2] Add `includeDeleted` state toggle in `src/pages/StaffPage.tsx` near search bar (toggle switch or checkbox)
- [X] T015 [US2] Pass `include_deleted: includeDeleted` to `useEmployees` hook in `src/pages/StaffPage.tsx`
- [X] T016 [US2] Apply deleted-row styling in `src/components/staff/EmployeeCard.tsx`: when `deleted_at` is non-null â†’ red tint background (`bg-red-50`), reduced opacity, red "Deleted" badge chip
- [X] T017 [US2] Conditionally replace row actions for deleted employees: show "Restore" action instead of Edit/Create Account in `src/components/staff/EmployeeCard.tsx`
- [X] T018 [US2] Show deleted timestamp in card when `deleted_at` is present (e.g., "Deleted {date}")

**Checkpoint**: Deleted employees visible with distinct styling when toggle is on

---

## Phase 5: User Story 3 â€” Restore Employee (Priority: P1)

**Goal**: Restore from list row actions + detail modal

**Independent Test**: Restore from list â†’ employee disappears from deleted view â†’ reappears in default list

### Implementation

- [X] T019 [US3] Wire restore action from deleted employee's "Restore" row action in `src/pages/StaffPage.tsx` â€” call `useRestoreEmployee().mutateAsync(id)` on confirm
- [X] T020 [US3] Handle restore errors: 404 â†’ "not found", 409 "not deleted" â†’ "This employee is not deleted", 409 colliding fields â†’ aggregated message via `extractApiErrorMessage`
- [X] T021 [US3] After restore: invalidate both `staffKeys.all` + `queryKeys.employees.all`, refresh list

**Checkpoint**: Restore works from list view with proper error handling

---

## Phase 6: User Story 4 â€” Restore from Detail Modal Banner (Priority: P2)

**Goal**: Yellow warning banner with restore button on deleted employee detail

**Independent Test**: Open deleted employee detail â†’ see yellow banner â†’ click restore â†’ banner disappears

### Implementation

- [X] T022 [US4] Add yellow warning banner at top of `src/components/staff/EmployeeDetailModal.tsx` when `deleted_at` is non-null: "Employee was soft-deleted on {formatted date} by #{deleted_by}. Restoring will NOT automatically re-enable their login."
- [X] T023 [US4] Add "Restore Employee" button in the banner â€” calls `useRestoreEmployee().mutateAsync(id)` â†’ on success: close and reopen detail modal with refreshed data, or refresh in-place
- [X] T024 [US4] After restore from banner: invalidate caches, remove banner, show restored employee

**Checkpoint**: Restore works from detail modal banner with warning context

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Final validation and cleanup

- [X] T025 `npm run build` â€” PASS
- [X] T026 `npm run lint` â€” â‰¤43 problems (no new violations)
- [ ] T027 Regression: verify default list still excludes deleted employees, InstructorCombobox unaffected, all existing staff CRUD unchanged
- [X] T028 Update `AGENTS.md` Active plan line to `specs/068-employee-soft-delete/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies â€” can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion â€” BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 â†’ US2 â†’ US3 â†’ US4 (sequential â€” share StaffPage.tsx and EmployeeCard.tsx edits)
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within Each User Story

- API functions before hooks (already done in Phase 2)
- Hooks before components
- Components before page assembly
- Story complete before moving to next priority

### Parallel Opportunities

- T004 âˆ¥ T005 (different files: employees.ts vs index.ts)
- T009 âˆ¥ T012 (different files: EmployeeCard.tsx vs EmployeeDetailModal.tsx)
- All [P] tasks within a phase can run together

---

## MVP Scope

**US5 (foundational) + US1 + US2** â€” types, delete, and discovery view. US3/US4 (restore) follow immediately after.

---

## Scope Guards

- Hard delete NOT in scope (backend doesn't support it for HR)
- Login re-enablement after restore is a separate admin action â€” banner documents this
- No bulk operations
- No audit log UI beyond `deleted_by` field display
- No tests requested in spec â€” added only if user requests TDD later


