# Contract: PaymentMethodPills

**File**: `src/components/finance/PaymentMethodPills.tsx` (new)

## Props

```typescript
interface PillOption {
  value: string
  label: string
}

interface PaymentMethodPillsProps {
  options: PillOption[]
  selected: string | null
  onChange: (value: string) => void
  error?: string
  label?: string
}
```

## Behavior

- Renders a row of pill buttons (horizontal flex, wrapping)
- Selected pill: solid secondary background + white text
- Unselected pill: light grey background + slate text
- On click: calls `onChange(value)` — only one can be selected at a time
- If `error` is set: the pill group gets a red border + shake animation, error message appears below
- No pill is pre-selected by default (controlled via `selected={null}`)
- Responsive: pills wrap to next line on small screens
