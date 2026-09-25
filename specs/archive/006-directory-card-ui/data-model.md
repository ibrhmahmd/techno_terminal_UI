# Data Model: Directory Card UI

**Date**: 2026-05-15  
**Spec**: [spec.md](./spec.md)

---

## Entities

### StudentCard

A visual card component representing a single student in the directory.

**Source data**: `StudentListItem` (from `GET /crm/students`)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| full_name | string | `StudentListItem.full_name` | Primary display text |
| phone | string? | `StudentListItem.phone` | Fallback to "-" if null |
| status | `'active' \| 'waiting' \| 'inactive'` | `StudentListItem.status` | Rendered as colored badge |
| age | number? | Computed from `StudentListItem.date_of_birth` | Hidden if DOB is null |
| current_enrollment | string? | `StudentFilterItem.current_group_name` | Only on Advanced Filter tab; hidden on Students tab |

**Actions**:
- View → navigate to `/students/:id`
- Edit → open edit student modal
- Delete → soft delete with confirmation dialog
- Restore (deleted view only) → restore student
- Permanently Delete (deleted view only) → hard delete with confirmation

### ParentCard

A visual card component representing a single parent in the directory.

**Source data**: `ParentListItem` (from `GET /crm/parents`)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| full_name | string | `ParentListItem.full_name` | Primary display text |
| phone_primary | string | `ParentListItem.phone_primary` | Always present on Parent |

**Actions**:
- View → navigate to `/parents/:id`
- Edit → open edit parent modal
- Delete → delete with confirmation

### CardGrid

A responsive grid container that arranges card components.

**Props**:
- `children`: Card components to arrange
- `columns`: Optional column count override (default: responsive breakpoints)
- `className`: Additional CSS classes

**Responsive behavior**:
- Default: 1 column on mobile (< 768px)
- 2 columns on tablet (768px - 1023px)
- 3 columns on desktop (1024px - 1279px)
- 4 columns on wide (≥ 1280px)

### DirectoryPagination

Reused `<Pagination>` component with `showTotalInfo={true}`.

**Props** (unchanged from existing):
- `currentPage`, `totalPages`, `onPageChange`
- `pageSize`, `onPageSizeChange`, `pageSizeOptions`
- `showTotalInfo`: Now defaults to `true` for directory
- `loading`: Loading state flag

---

## Data Flow

```
DirectoryPage
  │
  ├── Students tab
  │   ├── Normal view: useStudentsList(page, size) → StudentListItem[]
  │   ├── Search: useStudentsSearch(term) → StudentListItem[]
  │   ├── Grouped: useStudentsGrouped(...) → StudentGroup[] (each has StudentListItem[])
  │   └── Deleted: useDeletedStudents(page, size) → StudentListItem[]
  │
  ├── Parents tab
  │   ├── Normal view: useParentsList(page, size) → ParentListItem[]
  │   └── Search: useParentsSearch(term) → ParentListItem[]
  │
  ├── Waiting tab
  │   ├── Normal view: filtered from students (status=waiting)
  │   └── Grouped: useStudentsGrouped(...) → StudentGroup[]
  │
  └── Advanced Filter tab
      ├── Flat: filterQuery.data.students → StudentFilterItem[] (has enrollment info)
      └── Grouped: useStudentsGrouped(...) → StudentFilterItem[]
```

**Transform for Cards**:
- `StudentListItem[]` → `StudentCardProps[]` (computed: age from DOB, no enrollment)
- `ParentListItem[]` → `ParentCardProps[]` (direct mapping)
- `StudentFilterItem[]` → `StudentCardProps[]` (direct: age + enrollment available)

---

## State Transitions

No new state transitions. All existing state transitions (create, edit, delete, restore) remain unchanged. The card layout is purely a presentational change.
