# Component Contract: CardGrid

**File**: `src/components/directory/CardGrid.tsx`

## Props

```typescript
interface CardGridProps {
  children: ReactNode
  columns?: {
    sm?: number  // < 768px  (default: 1)
    md?: number  // 768-1023px (default: 2)
    lg?: number  // 1024-1279px (default: 3)
    xl?: number  // >= 1280px (default: 4)
  }
  className?: string
}
```

## Behavior

- Renders children in a CSS grid layout
- Default responsive behavior: 1→2→3→4 columns at breakpoints
- Column counts are customizable via the `columns` prop
- Uses Tailwind `grid` with responsive `grid-cols-*` classes
- Children are expected to be `StudentCard` or `ParentCard` components

## States

| State | Behavior |
|-------|----------|
| With children | Cards rendered in grid layout |
| Empty (parent) | Empty state handled by parent component; CardGrid not rendered |

## Usage

```tsx
<CardGrid>
  {students.map((s) => (
    <StudentCard key={s.id} student={s} actions={...} />
  ))}
</CardGrid>
```
