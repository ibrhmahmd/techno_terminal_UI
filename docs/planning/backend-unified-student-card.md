# Backend API Request — Unified Student Listing Type

**Requested By**: Frontend Team  
**Date**: June 10, 2026  
**Priority**: MEDIUM (Unblocks unified card component)  
**Status**: Draft

---

## Overview

Currently there are **5 different response types** across student listing endpoints, each returning a different subset of fields. This forces the frontend to use union types, runtime property checks, and fallback logic to display a simple student card.

**Goal**: Standardize all student listing endpoints to return a single `StudentCardDTO` type with a consistent set of core fields. Each endpoint may still _extend_ this type with additional fields specific to its context.

---

## Current Endpoints & Return Types

| # | Endpoint | Current Return Type | Purpose |
|---|----------|-------------------|---------|
| 1 | `GET /crm/students` | `Student[]` | Paginated student listing |
| 2 | `GET /crm/students?q=` | `StudentListItem[]` | Name/phone search |
| 3 | `GET /crm/students/grouped` | `StudentGroup[]` → `StudentListItem[]` | Grouped by status/age |
| 4 | `GET /crm/students/filter` | `StudentFilterItem[]` | Advanced filter search |
| 5 | `GET /crm/students/waiting-list` | `StudentWithDetails[]` | Waiting list management |

Each type has different optional fields, causing the frontend to maintain this mapping:

```typescript
// Current frontend union — requires runtime checks everywhere
type StudentCardData = StudentListItem | StudentFilterItem
```

---

## Proposed Unified Type: `StudentListingDTO`

```
Endpoint: All listing endpoints under /crm/students
Response Location: response.data (Array) — standard ApiResponse envelope
```

```typescript
interface StudentListingDTO {
  // ── Core Identity (always required) ──
  id: number
  full_name: string
  status: 'active' | 'waiting' | 'inactive'

  // ── Contact (optional) ──
  phone?: string | null

  // ── Demographics (optional) ──
  date_of_birth?: string | null    // Format: YYYY-MM-DD
  age?: number | null              // Pre-computed current age (nullable)
  gender?: 'male' | 'female' | null
  grade?: string | null

  // ── Enrollment (optional) ──
  current_group_name?: string | null  // Denormalized for quick display
  current_enrollment_count?: number   // Number of active enrollments

  // ── Financial (optional) ──
  has_unpaid_balance?: boolean
}
```

---

## Per-Endpoint Field Matrix

| Field | `GET /crm/students` | `?q=` | `/grouped` | `/filter` | `/waiting-list` |
|-------|--------------------|-------|------------|-----------|-----------------|
| `id` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `full_name` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `status` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `phone` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `date_of_birth` | ✅ now | ✅ now | ✅ now | ⛔ missing | ✅ now |
| `age` | ⛔ | ⛔ | ⛔ | ✅ now | ✅ now |
| `gender` | ✅ now | ✅ now | ✅ now | ✅ now | ✅ now |
| `grade` | ⛔ | ✅ now | ✅ now | ✅ now | ✅ now |
| `current_group_name` | ⛔ | ✅ at runtime | ⛔ likely | ✅ now | via `current_enrollment` |
| `current_enrollment_count` | ⛔ | ⛔ | ⛔ | ✅ via `enrollment_count` | via `enrollments.length` |
| `has_unpaid_balance` | ⛔ | ✅ now | ✅ now | ✅ via `unpaid_balance` | via `balance_summary` |

**Legend**: ✅ now = already returned, ⛔ = needs to be added

---

## What Each Endpoint Needs to Change

### 1. `GET /crm/students` (paginated list)

**Current source**: Database `students` table fields only.

**Add these fields to the response:**
- `grade` — already in DB, just not included in response
- `current_group_name` — join with active enrollment → group
- `has_unpaid_balance` — join with finance or derived from balance
- `age` — computed from `date_of_birth`
- `current_enrollment_count` — count of active enrollments

### 2. `GET /crm/students?q=` (search)

**Current source**: Same DB table with `?q=` filter. Already returns most fields.

**Add:**
- `age` — computed from `date_of_birth`
- `current_enrollment_count` — count of active enrollments

### 3. `GET /crm/students/grouped` (grouped listing)

**Current source**: Groups generated server-side, students nested under each group.

**Add:**
- `age` — computed from `date_of_birth`
- `current_group_name` — verify it's already included; if not, add it
- `current_enrollment_count`

### 4. `GET /crm/students/filter` (advanced filter)

**Current source**: Custom SQL with filter criteria. Returns `StudentFilterItemDTO`.

**Add:**
- `date_of_birth` — currently only returns `age`, add the raw DOB field too
- `grade` — if not already included
- `current_enrollment_count` — already has `enrollment_count`, rename or keep both

### 5. `GET /crm/students/waiting-list` (waiting list)

**Current source**: Joins waiting list table with students. Returns `StudentWithDetails`.

**Already has:** Most fields. Map into `StudentCardDTO` shape. Can keep extended fields like `waiting_priority`, `waiting_since`, `waiting_notes` as extras.

---

## Implementation Notes

1. **Backward compatibility**: Keep existing response fields that frontend already consumes. The unified `StudentCardDTO` is an _expansion_ — no field removals.
2. **Performance**: `current_group_name` and `has_unpaid_balance` can be pre-computed or stored as denormalized columns for fast reads.
3. **Pagination**: The standard list (`GET /crm/students`) should keep its `PaginatedApiResponse` envelope (with `data`, `total`, `skip`, `limit`).
4. **Response envelope**: Use the existing `ApiResponse<T>` / `PaginatedApiResponse<T>` pattern — no new envelope required.
5. **Frontend migration**: Once backend is updated, frontend will replace the union type with a single `StudentCardDTO` import and remove all `'field' in student` runtime checks.

---

## Frontend Impact

**After backend update, the frontend will:**
1. Replace `StudentListItem | StudentFilterItem` with single `StudentCardDTO`
2. Remove all `'current_group_name' in student` runtime checks → direct property access
3. Unify `StudentCard` and `StudentMobileCard` to use one type
4. Remove redundant field mappings in `DirectoryPage.tsx`

---

## Contact

**Requestor**: Frontend Development Team  
**Estimated Backend Effort**: 2-4 hours across all 5 endpoints  
**Priority**: MEDIUM — existing workaround works but adds complexity
