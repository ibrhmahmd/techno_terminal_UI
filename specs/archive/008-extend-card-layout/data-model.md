# Data Model: Courses & Competitions Card Layout

## Entities

### CourseCard

A visual card representing a single course in the listing.

**Display fields** (from `Course`):

| Field | Source | Format |
|-------|--------|--------|
| Course Name | `name` | Bold primary text |
| Category | `category` | Pill badge, colored by category; fallback "Uncategorised" |
| Price per Level | `price_per_level` | Formatted currency label |
| Sessions per Level | `sessions_per_level` | Numeric label |
| Status | `is_active` | Colored badge (Active/Inactive) |

**Actions**:
- View: navigates to `/courses/:id`
- Edit: opens edit modal
- Delete: opens confirmation dialog

**States**:
- Loading: `CardSkeleton` placeholder
- Empty: handled at page/grid level

### CourseCardGrid

Wrapper around `CardGrid` for courses-specific rendering.

**Props**:
- `children`: ReactNode (CourseCard instances)
- `emptyMessage`: string
- `emptyIcon`: string
- `isLoading`: boolean
- `skeletonCount`: number

**Responsive breakpoints**: 1 col mobile, 2 col tablet, 3 col desktop, 4 col wide

### ViewToggle (reused)

Segmented control to switch between table and card view. Already exists at `src/components/groups/ViewToggle.tsx`.

**Props**:
- `value`: 'table' | 'cards'
- `onChange`: (mode: 'table' | 'cards') => void

### CompetitionColumns

Column definitions for rendering competitions in DataTable format.

**Columns**: name, location, date, edition, fee per student, deleted_at indicator

### CompetitionCardGrid

Existing card grid on Competitions page — no changes needed. Only the table view is new.

## Existing Types (no changes)

### Course (from `src/api/academics/types/courses/models.ts`)
```typescript
interface Course {
  id: number
  name: string
  category?: string
  description?: string
  price_per_level?: number
  sessions_per_level?: number
  is_active: boolean
}
```

### Competition (from `src/api/competitions/types.ts`)
```typescript
interface Competition {
  id: number
  name: string
  edition?: string | null
  edition_year?: number | null
  competition_date?: string | null
  location: string
  notes?: string | null
  fee_per_student: number
  created_at: string
  deleted_at?: string | null
}
```
