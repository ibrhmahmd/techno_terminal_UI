# Quickstart: Groups Card Layout

## Prerequisites
- Working dev environment (`npm run dev`)
- Existing Groups page is functional (DataTable view)

## New Files

```text
src/components/groups/
├── GroupCard.tsx          # Card component (new)
├── ViewToggle.tsx         # Table/cards toggle (new)
├── GroupCardGrid.tsx      # Card grid with empty state (new)
└── GroupCategoryTabs.tsx  # Category tabs for grouped card view (new)
```

## Modified Files

```text
src/pages/GroupsPage.tsx   # Add view mode state, conditional card/table render
```

## Dependencies (reused from existing codebase)

```text
src/components/directory/CardGrid.tsx           # Reuse as-is
src/components/directory/shared/CardSkeleton.tsx # Reuse as-is
src/components/common/RowActions.tsx            # Reuse as-is
src/components/groups/shared/GroupStatusBadge.tsx # Reuse as-is
```

## Implementation Order

1. Create `ViewToggle.tsx` — simple pill toggle
2. Create `GroupCard.tsx` — render group info in card format
3. Create `GroupCardGrid.tsx` — grid + skeletons + empty state
4. Create `GroupCategoryTabs.tsx` — dark tab bar for grouped view
5. Update `GroupsPage.tsx` — add viewMode state, conditionally render cards vs table

## Verification

```bash
npm run build    # tsc -b && vite build must pass
npm run lint     # zero errors
```

## Pattern Reference

Follow the StudentCard implementation pattern from `src/components/directory/StudentCard.tsx`:
- Same card structure (rounded-xl, border, shadow, hover effects)
- Same action button pattern (RowActions with View/Edit/Delete)
- Same loading pattern (CardSkeleton)
- Same status badge pattern (reuse GroupStatusBadge instead of inline)
