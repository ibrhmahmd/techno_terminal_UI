# Backend Changes Request

**Feature**: Redesign Employee Cards & Detail Dialog
**Spec**: [spec.md](spec.md)
**Date**: 2026-05-12

## Summary

Two backend schemas need to be extended to support displaying complete employee information on the frontend cards and detail dialog.

---

## 1. Extend `EmployeePublic` (detail endpoint)

**Endpoint**: `GET /hr/employees/:id`
**Current response type**: `EmployeePublic`

### Fields to add

Add these 5 optional fields to the response schema:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `university` | `string` | No | Institution name (stored during create/update) |
| `major` | `string` | No | Field of study (stored during create/update) |
| `is_graduate` | `boolean` | No | Whether employee graduated (stored during create/update) |
| `monthly_salary` | `number` | No | Monthly salary amount (stored during create/update) |
| `contract_percentage` | `number` | No | Contract percentage, 0-100 (stored during create/update) |

### Current `EmployeePublic` (for reference)

```python
class EmployeePublic(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str
    national_id: str | None = None
    job_title: str
    employment_type: Literal["full_time", "part_time", "contract"]
    is_active: bool
    hired_at: str  # ISO 8601 date
```

### Updated `EmployeePublic`

```python
class EmployeePublic(BaseModel):
    id: int
    full_name: str
    phone: str
    email: str
    national_id: str | None = None
    job_title: str
    employment_type: Literal["full_time", "part_time", "contract"]
    is_active: bool
    hired_at: str  # ISO 8601 date
    university: str | None = None       # NEW
    major: str | None = None            # NEW
    is_graduate: bool | None = None     # NEW
    monthly_salary: float | None = None  # NEW
    contract_percentage: float | None = None  # NEW
```

These fields already exist in `EmployeeCreateInput` (the create/update schema) and are stored in the database — they just need to be included in the read response.

---

## 2. Extend list endpoint fields (used for employee cards)

**Endpoint**: `GET /hr/employees` (the one called by `getEmployees`)
**Current response item type**: `EmployeeListItem`

### Fields to add

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `phone` | `string` | No | Primary phone number |
| `email` | `string` | No | Email address |

These fields are needed on the card to avoid forcing users to open the detail dialog just to find a phone number or email.

### Current list item (for reference)

```python
class EmployeeListItem(BaseModel):
    id: int
    full_name: str
    job_title: str
    employment_type: Literal["full_time", "part_time", "contract"]
    is_active: bool
```

### Updated list item

```python
class EmployeeListItem(BaseModel):
    id: int
    full_name: str
    job_title: str
    employment_type: Literal["full_time", "part_time", "contract"]
    is_active: bool
    phone: str | None = None   # NEW
    email: str | None = None   # NEW
```

---

## Implementation Notes

- Both changes are backward-compatible: existing frontends will ignore new fields
- `phone` and `email` already exist in the database on the employee record — the list endpoint query just needs to select them
- `university`, `major`, `is_graduate`, `monthly_salary`, and `contract_percentage` are already stored in the database via the create/update flow — the detail endpoint query just needs to select and return them
- No database migration or schema change is required
