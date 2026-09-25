# Contract: PaymentMethodPills (Updated)

**File**: `src/components/finance/PaymentMethodPills.tsx`

## Props

```typescript
interface PillOption {
  value: string
  label: string
  color: string    // Tailwind color name: 'emerald' | 'red' | 'purple' | 'slate'
  icon: string     // Material Symbols icon name: e.g., 'payments', 'account_balance_wallet', 'bolt', 'more_horiz'
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
- Each pill displays its `icon` (Material Symbols) and `label`
- **Unselected** pill: icon + label in the pill's assigned color, light background with border
- **Selected** pill: solid background in the pill's assigned color + white text + white icon
- On click: calls `onChange(value)` — only one can be selected at a time
- If `error` is set: the pill group gets a red border + shake animation, error message appears below
- No pill is pre-selected by default (controlled via `selected={null}`)
- Responsive: pills wrap to next line on small screens

## Color Mappings

| Option | Value | Label | Color | Icon |
|--------|-------|-------|-------|------|
| Cash | `cash` | Cash | emerald | `payments` |
| E-Wallet | `e_wallet` | E-Wallet | red | `account_balance_wallet` |
| instaPay | `instapay` | instaPay | purple | `bolt` |
| Other | `other` | Other | slate | `more_horiz` |
