# Contract: MetricsStripCards

**File**: `src/components/common/MetricsStripCards.tsx` (existing, modify)

## Props

```typescript
interface MetricItem {
  label: string
  value: string
  icon: string
  color: 'secondary' | 'emerald' | 'amber' | 'blue'
  isLoading?: boolean
  isActive?: boolean        // NEW — highlight the active card
  onClick?: () => void
}

interface MetricsStripCardsProps {
  items: MetricItem[]
}
```

## Behavior

- `isActive` adds a prominent visual state (e.g., `ring-2 ring-secondary` + `bg-secondary/10`)
- `onClick` on the active card is a no-op (clicking the same panel again does nothing)
- Cards wrap responsively on smaller screens
- Skeleton loading covers all cards when any is loading (batch state)
