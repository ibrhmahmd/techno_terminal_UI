# Data Model: Groups Card Layout

## Entities

### GroupCard

A visual card representing a single group in the listing.

**Display fields** (from `EnrichedGroupPublic`):

| Field | Source | Format |
|-------|--------|--------|
| Group Name | `group_name` | Bold primary text |
| Course | `course_name` | Secondary text, pill badge style |
| Instructor | `instructor_name` | Secondary text, fallback "Unassigned" |
| Schedule Day | `default_day` | Bold label |
| Schedule Time | `default_time_start` / `default_time_end` | "HH:MM - HH:MM" format, slice(0,5) |
| Capacity | `current_student_count` / `max_capacity` | "N / M" with icon |
| Status | `status` | Colored badge via `GroupStatusBadge` |

**Actions**:
- View: navigates to `/groups/:id`
- Edit: opens edit modal
- Delete: opens confirmation dialog

**States**:
- Loading: `CardSkeleton` placeholder
- Error: N/A (errors handled at page level)
- Empty: N/A (handled at page/grid level)

### GroupCardGrid

Wrapper around `CardGrid` with groups-specific empty state.

**Props**:
- `children`: ReactNode (GroupCard instances)
- `emptyMessage`: string
- `emptyIcon`: string

**Responsive breakpoints**: 1 col mobile, 2 col tablet, 3 col desktop, 4 col wide

### ViewToggle

Segmented control to switch between table and card view.

**Props**:
- `value`: 'table' | 'cards'
- `onChange`: (mode: 'table' | 'cards') => void

**Design**: Two pill buttons with icons (`table_rows` / `grid_view`), matching GroupBySelector styling.

### GroupCategoryTabs

Tab bar for grouped card view — dark themed, matching DirectoryPage pattern.

**Props**:
- `categories`: Array<{ key: string, label: string, count: number }>
- `activeKey`: string
- `onChange`: (key: string) => void

### EnrichedGroupPublic (existing, no changes)

```typescript
interface EnrichedGroupPublic extends Group {
  course_name: string
  group_name: string
  instructor_name: string
  default_day: string
  schedule_time?: string
  notes?: string | null
  status: 'active' | 'inactive' | 'archived' | 'completed'
  students?: Array<{ id: number; full_name: string }>
  current_student_count: number
}
```
