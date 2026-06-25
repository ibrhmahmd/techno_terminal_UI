# Feature Specification: Staff Page Redesign — Design System Alignment

**Feature Branch**: `050-staff-page-redesign`
**Created**: 2026-06-25
**Status**: Draft
**Input**: "redesign the staff page to follow the design system doc of the app and match the other card components used in other pages"

## Current State Assessment

The Staff page (`src/pages/StaffPage.tsx`) and its sub-components (`EmployeeCard`, `EmployeeDetailModal`) were built before the app's design system and shared component library matured. They now lag behind the groups and directory pages in visual consistency, accessibility, and use of shared infrastructure.

### What other card pages do differently (Groups, Students, Parents)

| Concern | EmployeeCard (current) | StudentCard / GroupCard (target) |
|---------|----------------------|----------------------------------|
| Card container | `bg-white rounded-xl border border-slate-200 p-5` | `bg-white rounded-xl border border-slate-200 p-5 shadow-sm` |
| Hover | `hover:shadow-lg transition-shadow` | `hover:shadow-md hover:border-secondary/30 transition-all duration-300` |
| Name typography | `font-semibold text-slate-900` | `font-headline font-semibold text-on-surface` |
| Skeleton | Inline `Skeleton` component with employee-specific layout | Shared `CardSkeleton` (`src/components/directory/shared/CardSkeleton.tsx`) |
| Grid wrapper | Inline `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4` | Shared `CardGrid` (`src/components/directory/CardGrid.tsx`) |
| Actions | Inline buttons with text labels | `RowActions` with icon-only buttons in a border-top footer |
| Accessibility | No `role`, `tabIndex`, `onKeyDown` keyboard support | `role="link"` / `role="button"`, `tabIndex={0}`, keyboard handlers |
| Icon sizing | `text-sm` | `text-[16px]` (fixed pixel for alignment) |
| Color tokens | Hardcoded `text-slate-*`, `bg-slate-*` | Design tokens `text-on-surface`, `text-on-surface-variant`, `border-slate-200` |
| Loading pattern | 8 inline skeleton cards hardcoded in page | `CardSkeleton` in a `CardGrid` via `GroupCardGrid` wrapper |

### Page-level gaps

- Skeletons rendered inline in `StaffPage.tsx:146-157` instead of using a shared grid skeleton component
- Empty state rendered inline using hardcoded `<EmptyState>` rather than through a `GroupCardGrid`-like wrapper
- `EmployeeCard` inline skeleton does not match `CardSkeleton` layout (different placeholder shapes)
- Detail modal uses `Skeleton` component inline vs shared pattern

## User Scenarios & Testing

### User Story 1 — Cards Follow App-Wide Design Language (P1)

An admin views the staff page and sees employee cards that look and behave identically to group and student cards — same hover effects, same typography hierarchy, same action button placement, and same responsive grid behavior.

**Acceptance Scenarios**:
1. **Given** the staff page is loaded, **When** viewing any employee card, **Then** it uses the same card container styling as GroupCard/StudentCard: `shadow-sm`, `hover:shadow-md hover:border-secondary/30`
2. **Given** the staff page is loaded, **When** viewing any employee card, **Then** the employee name uses `font-headline font-semibold text-on-surface`
3. **Given** the staff page is loaded, **When** viewing any employee card, **Then** all icon sizes use `text-[16px]` consistently
4. **Given** the staff page is loaded, **When** tabbing through cards with the keyboard, **Then** each card is focusable with visible focus ring
5. **Given** the staff page is loaded, **When** viewing any employee card, **Then** action buttons use `RowActions` in a border-top footer, matching the other card pages

### User Story 2 — Loading & Error States Use Shared Components (P2)

While data is loading, card skeletons match the `CardSkeleton` component used everywhere else. Error states use the same pattern as other pages.

**Acceptance Scenarios**:
1. **Given** the staff list is loading, **When** viewing the page, **Then** skeleton placeholders use `CardSkeleton` rendered via `CardGrid`
2. **Given** the staff list load fails, **When** viewing the page, **Then** an error banner appears above the empty card grid

### User Story 3 — Detail Dialog Aligns to Design Tokens (P2)

The employee detail dialog uses design system colors and fonts rather than hardcoded utility classes.

**Acceptance Scenarios**:
1. **Given** the detail dialog is open, **When** viewing any section, **Then** labels use `text-on-surface-variant` and values use `text-on-surface`
2. **Given** the detail dialog is open, **When** viewing the employment details section, **Then** the blue-50 background is replaced with `bg-surface-container-low` or equivalent
3. **Given** the detail dialog is open, **When** viewing employee name, **Then** it uses `font-headline`

## Requirements

### Functional Requirements

- **FR-001**: EmployeeCard MUST use the shared `CardSkeleton` component for loading state instead of inline skeleton layout
- **FR-002**: StaffPage card grid MUST use the shared `CardGrid` component
- **FR-003**: EmployeeCard action buttons MUST use `RowActions` in a border-top footer (matching StudentCard/GroupCard)
- **FR-004**: EmployeeCard MUST be keyboard accessible: `role`, `tabIndex`, `onKeyDown` handlers for View action
- **FR-005**: EmployeeCard MUST use design tokens: `font-headline`, `text-on-surface`, `text-on-surface-variant`
- **FR-006**: EmployeeCard hover MUST match: `hover:shadow-md hover:border-secondary/30 transition-all duration-300`
- **FR-007**: EmployeeCard icon sizes MUST use `text-[16px]` consistently
- **FR-008**: StaffPage skeleton loading MUST render via `CardGrid` + `CardSkeleton` (not inline skeleton divs)
- **FR-009**: EmployeeDetailModal MUST use design tokens (`text-on-surface`, `text-on-surface-variant`, `bg-surface-container-low`) instead of hardcoded grays and blues

### Design Token Migration

| Current | Target Token | Files Affected |
|---------|-------------|----------------|
| `text-slate-900` | `text-on-surface` | EmployeeCard, EmployeeDetailModal |
| `text-slate-700` | `text-on-surface-variant` | EmployeeCard, EmployeeDetailModal |
| `text-slate-600` / `text-slate-500` | `text-on-surface-variant` | EmployeeCard, EmployeeDetailModal |
| `bg-slate-50` | `bg-surface-container-low` | EmployeeCard |
| `bg-blue-50` | `bg-surface-container-low` | EmployeeDetailModal |
| `border-slate-200` | `border-outline-variant` | EmployeeCard, EmployeeDetailModal |
| `font-semibold text-slate-900` (name) | `font-headline font-semibold text-on-surface` | EmployeeCard |
| `hover:shadow-lg` | `hover:shadow-md hover:border-secondary/30` | EmployeeCard |

### Success Criteria

- **SC-001**: EmployeeCard visual styling is indistinguishable from StudentCard/GroupCard in layout structure
- **SC-002**: Keyboard navigation works: Tab to focus card, Enter/Space to view details
- **SC-003**: Skeleton loading state visually matches CardSkeleton used by groups and directory
- **SC-004**: No hardcoded `text-slate-*` or `bg-slate-*` classes remain in staff components (use design tokens)
- **SC-005**: All three action buttons (View, Edit, Create Account) remain functional via RowActions

### Entities

- **EmployeeCard**: Card component in the employee grid. Current inline skeleton, hardcoded colors, inline buttons. Target: shared CardSkeleton, design tokens, RowActions footer.
- **EmployeeDetailModal**: Detail dialog. Current mixed gray/blue color scheme. Target: design token colors throughout.
- **StaffPage**: Page wrapper. Current inline grid + inline skeleton array. Target: CardGrid + shared skeleton pattern.

### Non-Goals

- No changes to `EmployeeForm` or `CreateAccountModal` (already aligned or out of scope)
- No changes to the data fetching layer (`useEmployees`, `fetchEmployeesPaginated`)
- No new API fields or backend changes
- No changes to `InstructorCombobox`
- No changes to the layout of the detail modal sections (groups/headers stay the same)
