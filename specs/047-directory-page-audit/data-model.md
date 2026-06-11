# Data Model: Directory Page Audit & Fix

## Status

**No new data models required.** All changes operate on existing types:

| Type | Location | Usage |
|------|----------|-------|
| `StudentListItem` | `src/api/crm/students/index.ts` | Add `isStudentListItem`/`toStudentListItem` utils to barrel (US7) |
| `WaitingStudent` | `src/api/crm/students/index.ts` | Existing — used by waiting list hooks |
| `Parent` | `src/types/api.ts` | Existing — used by ParentCard |
| `GroupByOption` | `src/components/directory/StudentGroupBySelector.tsx` | Narrow allowed values to `'none' | 'status' | 'age'` (US3) |

## No Schema Changes

- No new tables, fields, or API endpoints
- No database migrations
- No new query keys needed
