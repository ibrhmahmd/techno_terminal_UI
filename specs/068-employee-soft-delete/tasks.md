# Tasks: Employee Soft-Delete

**Feature**: 068-employee-soft-delete
**Input**: spec.md, plan.md, migration notes
**Prerequisites**: local backend running (`:8000`), `npm run dev` running

---

## Phase 1: Setup

- [ ] T001 Confirm backend endpoints are accessible: `DELETE /hr/employees/{id}`, `POST /hr/employees/{id}/restore`, `GET /hr/employees?include_deleted=true` return expected responses; record baseline `npm run build` passes

---

## Phase 2: Foundational — Types, API, Hooks (US5)

**Purpose**: Extend types and API layer so all UI tasks can consume soft-delete data

- [ ] T005 [US5] Add `deleted_at: string | null` and `deleted_by: number | null` to `EmployeePublic` and `EmployeeListItem` in `src/api/hr/types.ts`
- [ ] T006 [US5] Add `include_deleted?: boolean` to `GetEmployeesParams` in `src/api/hr/employees.ts`
- [ ] T007 [P] [US5] Add `softDeleteEmployee(id: number)` and `restoreEmployee(id: number)` functions in `src/api/hr/employees.ts`
- [ ] T008 [P] [US5] Re-export new functions from `src/api/hr/index.ts`
- [ ] T009 [US5] Extend `staffKeys.list(...)` params with `include_deleted?: boolean` in `src/hooks/useStaff.ts`
- [ ] T010 [US5] Add `useSoftDeleteEmployee()` and `useRestoreEmployee()` hooks in `src/hooks/useStaff.ts` — both invalidate `staffKeys.all` AND `queryKeys.employees.all` on success
- [ ] T011 [US5] Update `useEmployees` to pass `include_deleted` through to `fetchEmployeesPaginated` in `src/hooks/useStaff.ts`

**Checkpoint**: `npm run build` passes with new types/functions

---

## Phase 3: US1 — Soft-Delete Employee (P1)

**Goal**: Admin can delete an employee from row actions and detail modal

**Independent Test**: Delete an employee → card vanishes from list → detail modal shows 404

- [ ] T012 [P] [US1] Add "Delete" action to `RowActions` in `src/components/staff/EmployeeCard.tsx` (icon: `delete`, variant: `danger`)
- [ ] T013 [US1] Add confirmation dialog component or inline confirm ("Are you sure you want to delete {name}?") in `src/pages/StaffPage.tsx`
- [ ] T014 [US1] Wire delete: call `useSoftDeleteEmployee().mutateAsync(id)` on confirm → close detail modal if open → invalidate list cache → show success toast
- [ ] T015 [US1] Add "Delete Employee" button in `EmployeeDetailModal` footer (red variant, confirmation dialog)
- [ ] T016 [US1] Handle delete errors: 404 → "Employee not found", generic → `extractApiErrorMessage`

---

## Phase 4: US2 — Deleted Employees Discovery View (P1)

**Goal**: Toggle shows deleted employees with red/muted styling

**Independent Test**: Toggle include_deleted → deleted employee appears with red row + badge → toggle off → disappears

- [ ] T017 [US2] Add `includeDeleted` state toggle in `src/pages/StaffPage.tsx` near search bar (toggle switch or checkbox)
- [ ] T018 [US2] Pass `include_deleted: includeDeleted` to `useEmployees` hook in `src/pages/StaffPage.tsx`
- [ ] T019 [US2] Apply deleted-row styling in `src/components/staff/EmployeeCard.tsx`: when `deleted_at` is non-null → red tint background (`bg-red-50`), reduced opacity, red "Deleted" badge chip
- [ ] T020 [US2] Conditionally replace row actions for deleted employees: show "Restore" action instead of Edit/Create Account in `src/components/staff/EmployeeCard.tsx`
- [ ] T021 [US2] Show deleted timestamp in card when `deleted_at` is present (e.g., "Deleted {date}")

---

## Phase 5: US3 — Restore Employee (P1)

**Goal**: Restore from list row actions + detail modal

**Independent Test**: Restore from list → employee disappears from deleted view → reappears in default list

- [ ] T022 [US3] Wire restore action from deleted employee's "Restore" row action in `src/pages/StaffPage.tsx` — call `useRestoreEmployee().mutateAsync(id)` on confirm
- [ ] T023 [US3] Handle restore errors: 404 → "not found", 409 "not deleted" → "This employee is not deleted", 409 colliding fields → aggregated message via `extractApiErrorMessage`
- [ ] T024 [US3] After restore: invalidate both `staffKeys.all` + `queryKeys.employees.all`, refresh list

---

## Phase 6: US4 — Restore from Detail Modal Banner (P2)

**Goal**: Yellow warning banner with restore button on deleted employee detail

**Independent Test**: Open deleted employee detail → see yellow banner → click restore → banner disappears

- [ ] T025 [US4] Add yellow warning banner at top of `src/components/staff/EmployeeDetailModal.tsx` when `deleted_at` is non-null: "Employee was soft-deleted on {formatted date}. Restoring will NOT automatically re-enable their login."
- [ ] T026 [US4] Add "Restore Employee" button in the banner — calls `useRestoreEmployee().mutateAsync(id)` → on success: close and reopen detail modal with refreshed data, or refresh in-place
- [ ] T027 [US4] After restore from banner: invalidate caches, remove banner, show restored employee

---

## Phase 7: Polish & Cross-Cutting

- [ ] T028 `npm run build` — PASS
- [ ] T029 `npm run lint` — ≤43 problems (no new violations)
- [ ] T030 Regression: verify default list still excludes deleted employees, InstructorCombobox unaffected, all existing staff CRUD unchanged
- [ ] T031 Update `AGENTS.md` Active plan line to `specs/068-employee-soft-delete/plan.md`

---

## Dependencies & Execution Order

```text
T001 → T005-T011 (foundational) → T012-T016 (US1) → T017-T021 (US2) → T022-T024 (US3) → T025-T027 (US4) → T028-T031 (polish)
```

- **Sequential spine**: US1 → US2 → US3 share StaffPage.tsx edits — execute in order
- **Within-phase parallel**: T007 ∥ T008 (different files); T012 ∥ T015 (different files)
- **US4 (T025-T027)** depends on US3 infrastructure being in place

## MVP Scope

US5 (foundational) + US1 + US2 — types, delete, and discovery view. US3/US4 (restore) follow immediately after.

## Scope Guards

- Hard delete NOT in scope (backend doesn't support it for HR)
- Login re-enablement after restore is a separate admin action — banner documents this
- No bulk operations
- No audit log UI beyond `deleted_by` field display
