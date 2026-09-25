# Quickstart: Staff Page Redesign

## Branch

```
git checkout 050-staff-page-redesign
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/staff/EmployeeCard.tsx` | Replace inline skeleton with `CardSkeleton`, replace inline buttons with `RowActions`, add whole-card click + a11y, migrate to design tokens |
| `src/components/staff/EmployeeDetailModal.tsx` | Migrate hardcoded colors to design tokens (`text-on-surface`, `text-on-surface-variant`, `bg-surface-container-low`) |
| `src/pages/StaffPage.tsx` | Replace inline grid with `CardGrid`, replace inline skeleton array with `CardSkeleton` loop |

## New Imports

```typescript
import { CardGrid } from '../components/directory/CardGrid'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { RowActions } from '../components/common/RowActions'
```

## Verification

```bash
npm run lint       # zero errors
npm run build      # tsc -b && vite build — must pass
```

## Design Token Reference

| Hardcoded | Token |
|-----------|-------|
| `text-slate-900` | `text-on-surface` |
| `text-slate-700` | `text-on-surface-variant` |
| `text-slate-600` | `text-on-surface-variant` |
| `text-slate-500` | `text-on-surface-variant` |
| `bg-blue-50` | `bg-surface-container-low` |
| `font-semibold` (name) | `font-headline font-semibold` |
| `hover:shadow-lg` | `hover:shadow-md hover:border-secondary/30 transition-all duration-300` |
