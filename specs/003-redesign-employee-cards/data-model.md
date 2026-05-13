# Data Model: Redesign Employee Cards & Detail Dialog

**Phase**: 1 | **Date**: 2026-05-12

## Entities

### EmployeeListItem (card summary)

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `id` | `number` | Yes | Backend | Employee ID |
| `full_name` | `string` | Yes | Backend | Displayed in card avatar header |
| `job_title` | `string` | Yes | Backend | |
| `employment_type` | `'full_time' \| 'part_time' \| 'contract'` | Yes | Backend | Displayed as label |
| `is_active` | `boolean` | Yes | Backend | Rendered as Active/Inactive badge |
| `phone` | `string` | No | Backend | NEW — shown on card |
| `email` | `string` | No | Backend | NEW — shown on card |

**Used by**: `EmployeeCard`, `StaffPage` (list rendering)

---

### EmployeePublic (full detail)

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `id` | `number` | Yes | Backend | |
| `full_name` | `string` | Yes | Backend | |
| `phone` | `string` | Yes | Backend | |
| `email` | `string` | Yes | Backend | |
| `national_id` | `string` | No | Backend | NEW to dialog — previously not rendered |
| `job_title` | `string` | Yes | Backend | |
| `employment_type` | `'full_time' \| 'part_time' \| 'contract'` | Yes | Backend | |
| `is_active` | `boolean` | Yes | Backend | |
| `hired_at` | `string` | Yes | Backend | ISO 8601 date string |
| `university` | `string` | No | Backend | NEW — added to EmployeePublic |
| `major` | `string` | No | Backend | NEW — added to EmployeePublic |
| `is_graduate` | `boolean` | No | Backend | NEW — added to EmployeePublic |
| `monthly_salary` | `number` | No | Backend | NEW — added to EmployeePublic |
| `contract_percentage` | `number` | No | Backend | NEW — added to EmployeePublic |

**Used by**: `EmployeeDetailModal`, `EmployeeForm` (edit mode)

---

### EmployeeCreateInput (create/update payload)

Unchanged from current type. Already includes all fields.

**Used by**: `EmployeeForm` (both create and edit modes)

## Display Grouping

### EmployeeCard fields layout

```
┌──────────────────────────────┐
│ [Avatar] full_name           │
│          job_title           │
│          employment_type     │
│          [phone]             │ ← NEW
│          [email]             │ ← NEW
│ ┌──────┐                     │
│ │Active│                     │
│ └──────┘                     │
│ ───────────────────────────  │
│  View  │  Edit  │  Account   │
└──────────────────────────────┘
```

### EmployeeDetailModal sections

| Section | Fields |
|---------|--------|
| Header (always shown) | Avatar, full_name, job_title, is_active badge, employment_type label |
| Personal Information | national_id, hired_at, employee_id (#id) |
| Contact | email, phone |
| Employment Details | university, major, is_graduate, monthly_salary, contract_percentage |

## State Transitions

- **Loading**: Cards show skeleton (`animate-pulse` divs). Dialog shows skeleton inside modal. Edit form shows skeleton inputs.
- **Loaded**: Cards/dialog/form render with data.
- **Missing optional field**: Field label hidden or shown as "Not provided" — no layout distortion.
- **Error**: Error state displayed with retry button. List error shown as banner. Dialog error shown inside modal. Form error shown with inline error message + retry.
