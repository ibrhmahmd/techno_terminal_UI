# Quickstart: Directory Card UI

## Prerequisites

- Node.js ≥ 18
- `npm install` already run
- Backend API running at configured URL (see `vite.config.ts` proxy)

## Key Files

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/directory/StudentCard.tsx` | Card component for students |
| `src/components/directory/ParentCard.tsx` | Card component for parents |
| `src/components/directory/CardGrid.tsx` | Responsive grid container |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/DirectoryPage.tsx` | Replace `<DataTable>` with `<CardGrid>` + `<StudentCard>`/`<ParentCard>` |
| `src/components/common/Pagination.tsx` | Fix `showTotalInfo` bug (enable `true`), ensure pagination renders when totalPages > 1 |
| `src/components/directory/DirectoryColumns.tsx` | Delete (no longer needed) |

### Files to Review (no changes expected)

| File | Reason |
|------|--------|
| `src/api/crm/students/types/models.ts` | `StudentListItem` has all fields needed |
| `src/hooks/useDirectory.ts` | Data fetching stays the same |
| `src/hooks/directory/useDirectoryData.ts` | Data hook stays the same |

## Implementation Order

1. **Fix pagination bug** — Debug API response, add client-side fallback, enable `showTotalInfo`
2. **Create `CardGrid`** — Responsive grid container (start simple)
3. **Create `StudentCard`** — Card with name, phone, status, age, actions
4. **Create `ParentCard`** — Card with name, phone, actions
5. **Update `DirectoryPage`** — Replace DataTable usage with CardGrid + Cards
6. **Remove `DirectoryColumns`** — Clean up dead code

## Build Verification

```bash
npm run build    # tsc -b && vite build — must pass
npm run lint     # ESLint — zero errors
npm run test     # Vitest — existing tests pass
```

## Testing Approach

- **Unit**: Test card rendering with various data states (missing phone, missing DOB)
- **Visual**: Manual verification of grid layout at different viewport widths
- **Integration**: Verify all CRUD actions (create, edit, delete, restore) still work via cards
- **Regression**: Verify search, alphabet filter, group-by still work with card layout
