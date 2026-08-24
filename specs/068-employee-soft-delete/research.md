# Research: Employee Soft-Delete

**Feature**: 068-employee-soft-delete

---

## D1: Student soft-delete pattern as reference

**Decision**: Follow the established student soft-delete pattern (`src/api/crm/students/`) for API functions, hooks, and cache invalidation.

**Rationale**: The student entity has a complete soft-delete implementation with `softDeleteStudent`, `restoreStudent`, `hardDeleteStudent`, and `getDeletedStudents`. The HR employee version is simpler (no hard delete, no separate deleted-list endpoint — uses `include_deleted` flag instead). The dual-cache invalidation pattern (`staffKeys.all` + `queryKeys.employees.all`) must be followed for HR to avoid stale data.

**Trade-off**: Slightly more complex invalidation than a single cache, but necessary because `useEmployees` from `useStaff.ts` and `useEmployees` from `useEmployees.ts` are separate cache families serving different consumers.

---

## D2: include_deleted as query param vs separate endpoint

**Decision**: Use `?include_deleted=true` query param on the existing list endpoint (backend contract) rather than a separate deleted-employees endpoint.

**Rationale**: The HR backend contract specifies `GET /hr/employees?include_deleted=true` — this is simpler than the student approach (`GET /crm/admin/deleted-students` which is a separate paginated endpoint). The param approach keeps all employees in one list and lets the toggle control visibility.

**Trade-off**: Deleted employees consume pagination slots when toggle is on, but this is acceptable for an admin discovery view.

---

## D3: Restore does NOT re-enable login

**Decision**: Restore operation re-adds the employee to the staff list but does NOT re-enable their login. This is a backend behavior (documented in migration notes §2 gotcha).

**Rationale**: Login re-enablement is a separate security action that should be explicit. The UI banner warns users of this.

**Trade-off**: Users may expect full restoration. Mitigated by prominent warning text in the detail modal banner.

---

## D4: No confirmation dialog library — use native confirm or inline

**Decision**: Use browser `confirm()` or a lightweight inline confirmation pattern (e.g., a state-driven "Are you sure?" overlay within the card/modal) rather than adding a dialog library.

**Rationale**: The existing codebase uses `window.confirm` for student soft-delete (`DirectoryPage.tsx`). Consistency over polish for this scope.

**Trade-off**: Less polished than a designed modal, but matches existing patterns and avoids new dependencies.

---

## D5: Cache invalidation timing

**Decision**: After delete/restore mutations, invalidate both `staffKeys.all` and `queryKeys.employees.all` in the same `onSuccess` callback.

**Rationale**: Two independent cache families serve different consumers. Invalidating only one leaves the other stale. Pattern proven in student soft-delete's `useStudentInvalidator`.

**Trade-off**: Double invalidation causes two refetches, but these are lightweight list queries and happen only on user-triggered mutations.
