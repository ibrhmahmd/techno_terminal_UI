# Contract: Schedule Time Formatting

Applies to: `GroupColumns.tsx`, `GroupsTable.tsx`, `GroupCard.tsx`, `GroupInfoCard.tsx`, `EditGroupDialog.tsx`, `GroupForm.tsx`

## Display Format

| Condition | Output |
|-----------|--------|
| Both `default_time_start` and `default_time_end` set | `"HH:MM - HH:MM"` (slice 0,5 of each) |
| Only one time set | `"HH:MM"` (slice 0,5 of the set value) |
| Neither time set | `"--:--"` |

## Input Normalization

When submitting time values to the API (via `GroupForm` or `EditGroupDialog`):

| Input | Normalized Output |
|-------|------------------|
| `"9:30"` | `"09:30:00"` |
| `"09:30"` | `"09:30:00"` |
| `"9:30:00"` | `"09:30:00"` |
| `""` or `null` | `null` |

## Shared Utility

A `formatTimeInput(value: string | null): string | null` function MUST be used by both `GroupForm` and `EditGroupDialog` for input normalization.

A `formatTimeDisplay(value: string | null): string` function MUST be used by all components for display formatting, returning `"--:--"` for null/undefined values.
