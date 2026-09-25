# Contract: Group Status Display

Applies to: `GroupColumns.tsx`, `GroupsTable.tsx`, `GroupCard.tsx`, `GroupStatusBadge.tsx`, `GroupInfoCard.tsx`

## Status Value Mapping

All components MUST use this exact mapping:

| Value | Display Label | Color | Badge Config |
|-------|--------------|-------|-------------|
| `'active'` | "Active" | Green | `bg-green-100 text-green-700` |
| `'inactive'` | "Inactive" | Gray | `bg-slate-100 text-slate-600` |
| `'archived'` | "Archived" | Gray | `bg-slate-100 text-slate-600` |
| `'completed'` | "Completed" | Blue | `bg-blue-100 text-blue-700` |

## Rules

1. `GroupsTable.tsx` MUST NOT map `inactive` to "Archived"
2. All components MUST handle all 4 status values — no fallback to a default label
3. `GroupStatusBadge` is the single source of truth for status badge rendering
4. `GroupsTable.tsx` and `GroupColumns.tsx` MUST use `GroupStatusBadge` for status display
