# API Contracts: Directory Page Audit & Fix

**No new API contracts.** All changes are frontend-only modifications to existing code. The existing API layer at `src/api/crm/students/` covers:

- `getStudents(params)` — list with search/filter/group
- `getStudent(id)` — single student detail
- `createStudent(data)` — new student
- `updateStudent(id, data)` — edit student
- `deleteStudent(id)` — remove student
- `updateStudentStatus(id, status)` — status change
- `linkParentToStudent(studentId, parentId)` — parent linkage
- `getWaitingList(filters)` — waiting list queries
- `logActivity(entityType, entityId, action)` — activity logging

All mutations invalidate the appropriate query keys via `queryClient.invalidateQueries()`.
