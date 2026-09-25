# Quickstart: Groups UI Controls Redesign

**Branch**: `030-groups-ui-redesign`

## Files to modify

1. **`src/components/groups/GroupBySelector.tsx`** — Restyle container and active button classes to match `DaySelectorBar` blue theme
2. **`src/components/groups/GroupFilters.tsx`** — Replace multi-select grid with `FilterPill` + expandable category panels

## Reused components (import, don't duplicate)

- `FilterPill` from `src/components/common/FilterPill.tsx`
- `ActiveFilterTagsList` from `src/components/common/ActiveFilterTag.tsx`

## Build & verify

```bash
npm run lint       # zero errors
npm run build      # tsc -b && vite build
npm run test       # existing tests pass
```

## Visual verification

1. Open `/groups` page
2. Check GroupBy selector uses blue theme (bg-blue-50, border-blue-100, active border-blue-200)
3. Click "Filters" button
4. Verify FilterPill row appears with Course, Instructor, Level, Day, Status pills
5. Click each pill — verify correct controls appear per category
6. Select filter values — verify count badges show on pills, ActiveFilterTagsList shows chips
7. Verify keyboard navigation still works on GroupBy selector (ArrowLeft/Right/Home/End)
