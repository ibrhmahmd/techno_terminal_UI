# API Contract: Employee Endpoints

**Phase**: 1 | **Date**: 2026-05-12

## GET /hr/employees (List)

Extended response item with `phone` and `email`:

```typescript
interface EmployeeListItem {
  id: number
  full_name: string
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  is_active: boolean
  phone?: string     // NEW - previously not returned
  email?: string     // NEW - previously not returned
}
```

**Query params**: `page`, `page_size`, `q`, `employment_type` — unchanged.

---

## GET /hr/employees/:id (Detail)

Extended response with education and salary fields:

```typescript
interface EmployeePublic {
  id: number
  full_name: string
  phone: string
  email: string
  national_id?: string
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  is_active: boolean
  hired_at: string
  university?: string              // NEW
  major?: string                   // NEW
  is_graduate?: boolean            // NEW
  monthly_salary?: number          // NEW
  contract_percentage?: number     // NEW
}
```

---

## POST /hr/employees (Create)

Payload — unchanged (`EmployeeCreateInput`).

Response — now returns extended `EmployeePublic` (with the new fields populated).

---

## PUT /hr/employees/:id (Update)

Payload — unchanged (`Partial<EmployeeCreateInput>`).

Response — now returns extended `EmployeePublic`.

---

## Frontend Contract Compliance

The frontend `src/api/hr/types.ts` already matches these contracts as of this feature. No adapter changes needed — Axios passes through all response fields via the generic type parameter.
