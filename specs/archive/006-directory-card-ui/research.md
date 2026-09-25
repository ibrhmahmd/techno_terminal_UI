# Research: Directory Card UI & Pagination Fix

**Date**: 2026-05-15  
**Spec**: [spec.md](./spec.md)  
**Status**: Complete — all unknowns resolved

---

## Unknown 1: Pagination Bug Root Cause

### Investigation

The pagination data flow was traced:

```
DirectoryPage (currentPage, pageSize)
  → useDirectoryData (page, size)
    → useStudentsList (page, size)
      → getStudentsPaginated({ skip: (page-1)*size, limit: size })
        → GET /api/v1/crm/students?skip=0&limit=25
        → API returns PaginatedApiResponse<Student> { success, data, total, skip, limit }
        → createPaginationResult extracts: { items: data.data, total: data.total, hasMore }
    → totalStudents = studentsListQuery.data?.total ?? 0
  → Pagination: totalPages = Math.ceil(totalStudents / pageSize)
```

**Root cause identified**: The `<Pagination>` component's render condition is `if (totalPages <= 0) return null`. When the backend API incorrectly returns `total: 0` (or omits it), `totalStudents` defaults to `0`, `totalPages` becomes `0`, and pagination hidden. The 25 visible items are from `response.data.data`, but without a correct `total`, pagination cannot render.

Additionally, `showTotalInfo={false}` on the main tab pagination hides "Page X of Y" text, making even functional pagination less discoverable.

### Fix

1. Debug the API response to verify `total` field — if the backend returns `total: 0` despite having items, this is a backend bug
2. Add client-side fallback: if `items.length > 0` but `total === 0`, set `total = items.length` as a safety net
3. Enable `showTotalInfo={true}` on the main tab pagination so users always see "Page X of Y"
4. Ensure pagination is always visible when there are multiple pages, regardless of search state

**Decision**: Fix will include client-side fallback + `showTotalInfo=true` + ensure pagination renders when `totalPages > 1` even during search.

---

## Unknown 2: Age/DOB Data Availability

### Investigation

`StudentListItem` type definition:
```typescript
interface StudentListItem {
  id: number
  full_name: string
  phone?: string | null
  status: StudentStatus
  date_of_birth?: string | null
  gender?: 'male' | 'female' | null
}
```

The `date_of_birth` field IS part of the list API response schema. The list endpoint `GET /crm/students` returns `PaginatedApiResponse<Student>` which maps to the `Student` type that also includes `date_of_birth`.

### Resolution

The age can be computed client-side from `date_of_birth` using a utility function (the existing `calculateAge` in `src/api/crm/students/utils.ts` can be reused). If `date_of_birth` is null/undefined, hide the age field on the card.

**Decision**: Compute age from `date_of_birth` on the frontend. No backend changes needed.

---

## Unknown 3: Current Enrollment Data Availability

### Investigation

`StudentListItem` does **not** include enrollment info. `StudentWithDetails` (detail endpoint `GET /crm/students/:id/details`) has `current_enrollment` with `{ group_name, course_name, instructor_name }`. `StudentFilterItem` (filter endpoint `GET /crm/students/filter`) has `current_group_name`, `instructor_name`.

For the main student list view, there are three options:
1. **Fetch each student's details** (N+1 problem — unacceptable)
2. **Use the filter endpoint** for the visible page — but this is designed for advanced filtering, not general list display
3. **Suggest backend add enrollment info** to the list endpoint — best long-term solution

For the short term, since the card shows enrollment as a secondary detail, and the list endpoint doesn't include it, the card will **omit enrollment info** for the main tab. This means:
- **Students tab**: Show name, phone, status, age (from DOB). Enrollment hidden.
- **Advanced Filter tab**: Show full info including enrollment since `StudentFilterItem` already has `current_group_name`.

### Resolution

Short-term: Enrollment info shown only on Advanced Filter tab (where `StudentFilterItem` has it).  
Long-term: Backend should add `current_enrollment` to the list endpoint.

**Decision**: Display enrollment only on Advanced Filter tab. On the Students tab, card shows name, phone, status, age. This aligns with the existing pattern where enrollment info requires the detail endpoint.

---

## Unknown 4: Parent Card Fields

### Investigation

`ParentListItem` has `id`, `full_name`, `phone_primary`. The detail endpoint `GET /crm/parents/:id` returns `Parent` with additional fields: `phone_secondary`, `email`, `relation`, `notes`.

The parent card in the directory should show basic contact info. `full_name` and `phone_primary` are sufficient for a summary card. No additional fields needed for the card view — detail is available by navigating to the parent's profile.

**Decision**: Parent cards show `full_name` and `phone_primary` only. No fetch of detail endpoint needed.

---

## Design Patterns — Card UI (from existing codebase)

Reference: Employee cards in `components/hr/` were redesigned in spec `003-redesign-employee-cards`. The pattern is:
- Cards use Tailwind `rounded-xl border border-slate-200 bg-white shadow-sm`
- Cards arranged in responsive grid using `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- Each card shows summary info with action buttons at the bottom
- Status badges use `rounded-full px-2.5 py-0.5 text-xs font-medium`
- Loading state uses skeleton placeholders with `animate-pulse`

For the directory cards, the same visual language will be used:
- Similar card container styling
- Grid layout for multi-column responsive display
- Action buttons (view, edit, delete) accessible from the card
- Skeleton placeholders during loading
