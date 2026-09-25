# Data Model: Staff Page Redesign

**Phase**: 1 | **Date**: 2026-06-25

This feature introduces no new data entities. All data flows through existing types and hooks unchanged. The entities below document the component-level contracts for implementation.

## EmployeeCard

| Aspect | Detail |
|--------|--------|
| **Props** | `employee: EmployeeListItem`, `onView: () => void`, `onEdit: () => void`, `onCreateAccount: () => void`, `loading?: boolean` |
| **Loading state** | `CardSkeleton` component from `src/components/directory/shared/CardSkeleton.tsx` when `loading === true` |
| **Empty/null state** | Not rendered — handled by parent (StaffPage shows EmptyState when `employees.length === 0`) |
| **Error state** | Not applicable — error handled by parent via `<ErrorState>` banner |
| **Click behavior** | Whole card clickable → calls `onView` (opens modal). Card has `role="button"`, `tabIndex={0}`, keyboard handler (Enter/Space) |
| **Actions** | `RowActions` in `pt-3 border-t border-slate-100` footer with `stopPropagation()`. Three actions: View (primary), Edit (default), Create Account (default) |
| **Style target** | Matches StudentCard/GroupCard: `rounded-xl border border-slate-200 bg-white p-5 shadow-sm` container, `hover:shadow-md hover:border-secondary/30`, `font-headline font-semibold text-on-surface` name |

### Props Interface

```typescript
interface EmployeeCardProps {
  employee: EmployeeListItem
  onView: () => void
  onEdit: () => void
  onCreateAccount: () => void
  loading?: boolean
}
```

### Data Fields Displayed

| Field | Display | Location |
|-------|---------|----------|
| `full_name` | `font-headline font-semibold text-on-surface` | Card header |
| `job_title` | `text-on-surface-variant` with work icon | Card body |
| `employment_type` | `text-on-surface-variant` with schedule icon | Card body |
| `phone` | `text-on-surface-variant` with call icon (hidden if null) | Card body |
| `email` | `text-on-surface-variant` with mail icon (hidden if null) | Card body |
| `is_active` | Status badge (green/gray pill with dot) | Card body |

## EmployeeDetailModal

| Aspect | Detail |
|--------|--------|
| **Props** | `employee: EmployeePublic | null`, `isLoading: boolean`, `isOpen: boolean`, `onClose: () => void`, `onRetry?: () => void` |
| **Design tokens** | Replace hardcoded `text-slate-*` with `text-on-surface` / `text-on-surface-variant`. Replace `bg-blue-50` with `bg-surface-container-low` |
| **Skeleton** | Keep existing inline skeleton layout (matches modal content structure) — no CardSkeleton here since modal shape differs from card |

## StaffPage

| Aspect | Detail |
|--------|--------|
| **State** | Pagination (`page`, `pageSize`), search (`searchInput`, `debouncedSearch`), modals (`isAddModalOpen`, `editingEmployee`, `viewingEmployeeId`, `creatingAccountFor`) — all local `useState` |
| **Loading** | `CardGrid` wrapping array of `CardSkeleton` (8 items) when `isLoading` |
| **Empty** | `<EmptyState>` when `employees.length === 0` and not loading |
| **Error** | `<ErrorState>` banner above grid when `error` is truthy |
| **Grid** | `<CardGrid>` wrapping `<EmployeeCard>` items |

## Design Token Mapping

| Source File | Target Token | Current Value |
|------------|--------------|---------------|
| EmployeeCard | `text-on-surface` (name) | `text-slate-900` |
| EmployeeCard | `text-on-surface` (card link/primary) | `text-slate-900` |
| EmployeeCard | `text-on-surface-variant` (body text) | `text-slate-700`, `text-slate-600`, `text-slate-500` |
| EmployeeCard | `font-headline font-semibold` (name) | `font-semibold` |
| EmployeeCard | `hover:shadow-md hover:border-secondary/30` | `hover:shadow-lg` |
| EmployeeDetailModal | `text-on-surface` (section titles, name) | `text-slate-900` |
| EmployeeDetailModal | `text-on-surface-variant` (labels, secondary) | `text-slate-700`, `text-slate-600`, `text-slate-500` |
| EmployeeDetailModal | `bg-surface-container-low` (employment section) | `bg-blue-50` |

## State Transitions

```
StaffPage
  │
  ├── isLoading=true
  │     └── CardGrid + CardSkeleton[] (8x)
  │
  ├── isLoading=false, error=truthy
  │     └── ErrorState banner + empty CardGrid
  │
  ├── isLoading=false, employees=[empty]
  │     └── EmptyState ("No employees yet")
  │
  └── isLoading=false, employees=[...]
        └── CardGrid + EmployeeCard[]
              ├── Click card → onView → EmployeeDetailModal (isOpen=true)
              ├── Click Edit action → setEditingEmployee → Edit modal
              └── Click Account action → setCreatingAccountFor → CreateAccountModal
```
