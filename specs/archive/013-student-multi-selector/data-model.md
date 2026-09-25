# Data Model: Student Multi-Selector

## Entities

### StudentSelection

A student selected for team membership, with optional fee override.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | number | No | Student ID (from `StudentListItem`) |
| `full_name` | string | No | Display name |
| `phone` | string | Yes | Phone number for display context |
| `status` | `'active' \| 'waiting' \| 'inactive'` | No | Used for visual distinction |
| `fee` | number | Yes | Per-student fee override; `undefined` means use default (0) |

### StudentMultiSelectorProps

Props interface for the reusable component.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `selected` | `StudentSelection[]` | No | Currently selected students |
| `onChange` | `(selected: StudentSelection[]) => void` | No | Callback when selection changes |
| `showFeeInput` | boolean | Yes | Whether to show per-student fee inputs (default: true) |
| `defaultFee` | number | Yes | Placeholder value for fee inputs (default: 0) |
| `maxSelections` | number | Yes | Maximum number of students that can be selected (default: unlimited) |

## Relationships

```
TeamRegistrationModal 1 ─── 1 StudentMultiSelector
StudentMultiSelector * ─── * StudentSelection (selected roster)
StudentSelection * ─── 1 StudentListItem (from search API)
```

## Validation Rules

- At least 1 student must be selected before form submission
- `fee` must be >= 0 when provided
- `full_name` must not be empty (guaranteed by API)
- `status` must be one of `'active'`, `'waiting'`, `'inactive'` (guaranteed by API)
