# Data Model: Employee Soft-Delete

**Feature**: 068-employee-soft-delete

---

## Entities

### EmployeePublic (extended)

**Source**: `GET /hr/employees/{id}` — full employee detail

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | number | ✅ | Primary key |
| full_name | string | ✅ | |
| phone | string | ✅ | |
| email | string | ✅ | |
| national_id | string | ❌ | Optional on create, required on edit |
| job_title | string | ✅ | |
| employment_type | `'full_time' \| 'part_time' \| 'contract'` | ✅ | |
| is_active | boolean | ✅ | Account status (distinct from soft-delete) |
| hired_at | string \| null | ✅ | ISO date |
| has_account | boolean | ✅ | Whether a login account exists |
| university | string | ❌ | |
| major | string | ❌ | |
| is_graduate | boolean | ❌ | |
| monthly_salary | number | ❌ | |
| contract_percentage | number | ❌ | |
| **deleted_at** | **string \| null** | ✅ | **NEW** — ISO timestamp when soft-deleted, null if live |
| **deleted_by** | **number \| null** | ✅ | **NEW** — User ID of the deleting admin, null if live |

### EmployeeListItem (extended)

**Source**: `GET /hr/employees` — paginated list

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | number | ✅ | Primary key |
| full_name | string | ✅ | |
| job_title | string | ✅ | |
| employment_type | `'full_time' \| 'part_time' \| 'contract'` | ✅ | |
| is_active | boolean | ✅ | |
| phone | string | ❌ | |
| email | string | ❌ | |
| **deleted_at** | **string \| null** | ✅ | **NEW** |
| **deleted_by** | **number \| null** | ✅ | **NEW** |

### EmployeeCreateInput (unchanged)

No new fields — soft-delete is a separate operation, not a form input.

---

## State Transitions

```
[Live] ──DELETE /hr/employees/{id}──► [Soft-Deleted]
                                          │
                              POST /hr/employees/{id}/restore
                                          │
                                          ▼
                                     [Live]
```

- **Live**: `deleted_at = null`, `deleted_by = null` — appears in default list
- **Soft-Deleted**: `deleted_at = ISO timestamp`, `deleted_by = user ID` — hidden from default list, visible with `?include_deleted=true`

### Constraints

- Deleting an already-deleted employee → 404 (`NotFoundError`)
- Restoring a non-deleted employee → 409 (`ConflictError`, "is not deleted")
- Restoring after identity re-use (re-hire with same national_id/phone/email) → 409 (`ConflictError`, aggregated field conflicts)
- After deletion: `national_id`, `phone`, `email` become available for new employees (uniqueness is among live employees only)

---

## Cache Key Impact

```ts
// Extended to include include_deleted
staffKeys.list({ search, page, pageSize, employment_type, include_deleted })

// Detail key unchanged (same endpoint, same shape)
staffKeys.detail(id)
```

Delete/restore mutations invalidate:
- `staffKeys.all` (invalidates list + detail)
- `queryKeys.employees.all` (invalidates flat employee lists used by instructor combobox, tasks, attendance)
