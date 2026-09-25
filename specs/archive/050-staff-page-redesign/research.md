# Research: Staff Page Redesign — Design System Alignment

**Phase**: 0 | **Date**: 2026-06-25

## Unknowns Resolved

### 1. Which shared components already exist for card grid patterns?

**Decision**: Three shared components are available and will be used directly:
- `CardGrid` (`src/components/directory/CardGrid.tsx`) — responsive grid wrapper with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`
- `CardSkeleton` (`src/components/directory/shared/CardSkeleton.tsx`) — pulse-animated skeleton matching card dimensions
- `RowActions` (`src/components/common/RowActions.tsx`) — icon-only action button group with variants

**Rationale**: All three are already consumed by `GroupCard`, `GroupCardGrid`, `StudentCard`, and `ParentCard`. Using them ensures visual consistency and reduces maintenance burden.

### 2. Does EmployeeCard.onView currently navigate or open a modal?

**Decision**: Opens `EmployeeDetailModal` via `viewingEmployeeId` state in `StaffPage`. The redesign keeps this modal pattern (no navigation to `/staff/:id`).

**Rationale**: Per clarification, the card body becomes clickable for View (consistent with GroupCard/StudentCard) but still opens the modal, not a URL route. RowActions uses `stopPropagation()` to prevent card-level click from firing when clicking individual action buttons.

### 3. What design tokens are available for the migration?

**Decision**: The following tokens from `tailwind.config.js` will replace hardcoded utilities:

| Utility | Token | Current Usage |
|---------|-------|---------------|
| `text-slate-900` | `text-on-surface` | EmployeeCard name, EmployeeDetailModal header |
| `text-slate-700` | `text-on-surface-variant` | EmployeeCard job title, metadata text |
| `text-slate-600` / `text-slate-500` | `text-on-surface-variant` | EmployeeCard secondary info, timestamps |
| `bg-blue-50` | `bg-surface-container-low` | EmployeeDetailModal "Employment Details" section |
| `font-semibold` (on name) | `font-headline font-semibold` | EmployeeCard employee name |

**Rationale**: These tokens are already used by GroupCard/StudentCard (e.g., `text-on-surface` for group name, `text-on-surface-variant` for secondary text). Migration ensures visual parity.

### 4. Do EmployeeCard skeleton and CardSkeleton differ?

**Decision**: Yes — currently incompatible. Replace inline skeleton with `CardSkeleton`.

**Rationale**: EmployeeCard's current skeleton uses `Skeleton` with employee-specific avatar + 7 placeholder lines. `CardSkeleton` uses a simpler 3-line layout (title, subtitle, 3 action button icons). Switching to `CardSkeleton` aligns with the rest of the app and is simpler.

### 5. RowActions layout with 3 actions — will it fit?

**Decision**: Yes. StudentCard already supports up to 3 actions (View/Edit/Delete or View/Restore/Permanent Delete) in RowActions. EmployeeCard's 3 actions (View/Edit/Create Account) will follow the same pattern.

**Rationale**: RowActions renders as a flex row of icon buttons with `p-1.5` padding per button. Three buttons fit comfortably. The "Create Account" action icon is `person_add` (Material Symbol), matching the current inline button icon.

### 6. Should StaffPage wrap in a GroupCardGrid-like component or use CardGrid directly?

**Decision**: Use `CardGrid` directly and handle loading/empty states in `StaffPage` inline.

**Rationale**: `GroupCardGrid` adds a `loading` prop and empty state wrapper. StaffPage already has its own loading logic (via `useEmployees`) and empty state handling via `<EmptyState>`. Wrapping in a `GroupCardGrid`-like component would duplicate existing logic. Importing `CardGrid` directly for the grid and using existing `CardSkeleton` array for loading is simpler.

## Alternatives Considered

- **Creating a generic CardGridSkeleton component**: Rejected — `CardGrid` + `CardSkeleton` composition is already the established pattern and works well.
- **Converting EmployeeDetailModal to a page route**: Rejected — keeps modal pattern per clarification; adding a route would require new URL structure and routing changes outside scope.
- **Using `GroupCardGrid` wrapper directly**: Rejected — its loading/empty state logic conflicts with existing StaffPage patterns; `CardGrid` alone is sufficient.
- **Adding visual regression tests**: Deferred — no screenshot testing infrastructure exists; manual review by measurable checkpoints per SC-001 is sufficient for this scope.
