# Data Model: Fix Enrollment Issues

## EnrollPanel State

| Field | Type | Current Default | New Default | Description |
|-------|------|----------------|-------------|-------------|
| `amount` | `number` | 150 | 0 | Course fee in EGP |
| `discount` | `number` | 0 | 0 (unchanged) | Discount amount in EGP |

## Reset Triggers
All reset to `amount = 0`:
- On initial render
- On group selection change
- On student selection change
- On form clear
- After successful enrollment submission

## Number Inputs (US2)
Both `amount` (Course Fee) and `discount` inputs are `<input type="number">` with:
- `onWheel` handler that blurs the input on scroll wheel events
- Normal typing and arrow key behavior preserved
