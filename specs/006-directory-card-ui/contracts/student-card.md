# Component Contract: StudentCard

**File**: `src/components/directory/StudentCard.tsx`

## Props

```typescript
interface StudentCardProps {
  student: StudentListItem | StudentFilterItem
  actions: {
    onView: (student: StudentListItem | StudentFilterItem) => void
    onEdit?: (student: StudentListItem | StudentFilterItem) => void
    onDelete?: (student: StudentListItem | StudentFilterItem) => void
    onRestore?: (student: StudentListItem) => void
    onPermanentDelete?: (student: StudentListItem) => void
  }
  /** If true, shows restore/permanent-delete actions instead of edit/delete */
  isDeleted?: boolean
  /** Enable compact rendering for grouped views */
  compact?: boolean
}
```

## Behavior

- Card renders in a rounded container with shadow and border
- Primary display: `full_name` (bold, large)
- Secondary display: `phone` (with icon), `status` (colored badge)
- If `student` has `date_of_birth`, compute and display `age`
- If `student` has `current_group_name` (StudentFilterItem), display enrollment info
- Action buttons are always visible at the bottom of the card
- `isDeleted=true` shows Restore + Permanently Delete instead of Edit + Delete
- Clicking the card body navigates to the student detail page (same as onView)

## States

| State | Behavior |
|-------|----------|
| Normal | Full card with all fields and actions rendered |
| Missing phone | Phone field shows "-" fallback, no layout shift |
| Missing DOB | Age field hidden entirely |
| Missing enrollment | Enrollment section hidden (only relevant on Advanced tab) |
| Deleted mode | Edit/Delete buttons replaced with Restore/PermanentDelete |
| Loading (parent) | Skeleton placeholder used instead of card |

## Usage

```tsx
<StudentCard
  student={student}
  actions={{
    onView: (s) => navigate(`/students/${s.id}`),
    onEdit: (s) => openEditModal(s),
    onDelete: (s) => confirmSoftDelete(s),
  }}
/>
```
