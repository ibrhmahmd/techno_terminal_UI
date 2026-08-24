# Backend Requirements: Employee Soft-Delete

**Feature**: 068-employee-soft-delete
**Source**: Frontend migration notes (`040-employee-soft-delete/frontend-migration-notes.md`) + frontend spec clarifications

---

## Existing Contract (Already Implemented)

These endpoints are already deployed and functional on the backend. No changes needed.

### 1. Soft-Delete Employee

```
DELETE /api/v1/hr/employees/{employee_id}
```

**Response 200**:
```json
{ "success": true, "data": true, "message": "Employee deleted successfully." }
```

**Error Responses**:
| Scenario | Status | Error Class | Message |
|----------|--------|-------------|---------|
| Missing / already-deleted ID | 404 | `NotFoundError` | "Employee {id} not found" |

---

### 2. Restore Employee

```
POST /api/v1/hr/employees/{employee_id}/restore
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "...employee fields...",
    "deleted_at": null,
    "deleted_by": null
  },
  "message": "Employee restored successfully."
}
```

**Error Responses**:
| Scenario | Status | Error Class | Message |
|----------|--------|-------------|---------|
| Unknown ID | 404 | `NotFoundError` | "Employee {id} not found" |
| Employee not currently deleted | 409 | `ConflictError` | "{id} is not deleted" |
| Restore after identity re-use (re-hire) | 409 | `ConflictError` | Aggregated field conflicts (e.g., `national_id: already in use; phone: already in use`) |

---

### 3. List with Deleted Rows

```
GET /api/v1/hr/employees?page=1&page_size=20                  → live only (unchanged)
GET /api/v1/hr/employees?page=1&page_size=20&include_deleted=true  → live + deleted
```

**Behavior**:
- Default (no param): returns live employees only — backward-compatible, no breaking change
- `include_deleted=true`: returns live + deleted employees
- Deleted rows are fully populated with `deleted_at` and `deleted_by` markers
- Live rows always carry `"deleted_at": null, "deleted_by": null`

---

### 4. Employee Read Shape — Soft-Delete Fields

Every employee read response (list item and detail) must include:

```ts
interface EmployeeMarkers {
  deleted_at: string | null;   // ISO timestamp when soft-deleted (null for live)
  deleted_by: number | null;   // local user ID of the deleting admin (null for live)
}
```

These fields are **always present** and nullable. They appear on:
- `EmployeePublic` (detail responses)
- `EmployeeListItem` (list responses)

---

## New Requirement: `deleted_by_name`

### What

The frontend restore banner displays: *"This employee was deleted on {date} by {admin_name}."*

Currently `deleted_by` is a numeric user ID (e.g., `3`). To show the admin's **name** instead of a raw ID, the backend must include `deleted_by_name` in employee responses.

### Why

Without this field, the frontend would need either:
1. A separate API call to resolve user ID → name (extra latency, new endpoint dependency)
2. Show raw ID like `#3` (poor UX)

### Requested Change

Add `deleted_by_name` to the employee read shape:

```ts
interface EmployeeMarkers {
  deleted_at: string | null;
  deleted_by: number | null;
  deleted_by_name: string | null;  // ← NEW: display name of the admin who deleted
}
```

**Behavior**:
- Live employees: `"deleted_by_name": null`
- Deleted employees: `"deleted_by_name": "Ahmed Hassan"` (or whatever the admin's display name is)
- Restore: `deleted_by_name` resets to `null` alongside `deleted_at`/`deleted_by`

**Resolution logic**: The backend should resolve `deleted_by` (user ID) to the user's display name at query time. This avoids the frontend needing a user lookup endpoint.

### Impact

- **Affected responses**: `GET /hr/employees` (list) and `GET /hr/employees/{id}` (detail)
- **No breaking change**: new nullable field, backward-compatible
- **Frontend files affected**: `src/api/hr/types.ts` (type update), `src/components/staff/EmployeeDetailModal.tsx` (banner display)

---

## Summary of All Backend Endpoints

| # | Method | Endpoint | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | DELETE | `/hr/employees/{id}` | ✅ Implemented | Soft-delete |
| 2 | POST | `/hr/employees/{id}/restore` | ✅ Implemented | Restore |
| 3 | GET | `/hr/employees?include_deleted=true` | ✅ Implemented | List with deleted |
| 4 | GET | `/hr/employees/{id}` | ✅ Implemented | Detail (needs `deleted_by_name`) |
| 5 | — | Add `deleted_by_name` field | 🔲 **Required** | New field on all employee read responses |

---

## Uniqueness Semantics (Reference)

After deletion, `national_id`, `phone`, and `email` become creatable again. Uniqueness among **live** employees is unchanged — creating a duplicate of a live employee still returns a single aggregated `409` listing all colliding fields at once.
