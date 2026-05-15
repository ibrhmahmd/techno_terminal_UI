# Component Contract: ParentCard

**File**: `src/components/directory/ParentCard.tsx`

## Props

```typescript
interface ParentCardProps {
  parent: ParentListItem
  actions: {
    onView: (parent: ParentListItem) => void
    onEdit?: (parent: ParentListItem) => void
    onDelete?: (parent: ParentListItem) => void
  }
}
```

## Behavior

- Card renders in a rounded container with shadow and border
- Primary display: `full_name` (bold, large)
- Secondary display: `phone_primary` (with phone icon)
- Action buttons always visible at the bottom
- Clicking card body navigates to parent detail page

## States

| State | Behavior |
|-------|----------|
| Normal | Full card with all fields and actions rendered |
| Loading (parent) | Skeleton placeholder used instead |

## Usage

```tsx
<ParentCard
  parent={parent}
  actions={{
    onView: (p) => navigate(`/parents/${p.id}`),
    onEdit: (p) => openEditParentModal(p),
    onDelete: (p) => confirmDelete(p),
  }}
/>
```
