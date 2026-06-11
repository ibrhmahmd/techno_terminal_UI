# Quickstart: Directory Page Audit & Fix

## Execution Order (Priority-Based)

### P0 — Critical (1 finding)
1. **`DirectoryPage.tsx`**: Guard `editingStudent!` null assertion (line ~1006)

### P1 — High (13 findings)
2. **`useStudentActions.ts`**: Remove unhandled `throw new Error()` after toast (line ~116)
3. **`useWaitingList.ts`**: Delete 3 dead hooks (`useUpdateStudentStatus`, `useSetWaitingPriority`, `useActivateStudent`)
4. **`DirectoryPage.tsx`**: Parallelize `linkParentToStudent`/`logActivity` with `Promise.all`
5. **8 files**: Replace barrel imports with direct module paths
6. **`useDirectoryData.ts`**: Validate `setFilterGroupBy` cast against allowed values
7. **`SearchBar.tsx` + `AlphabetSlider.tsx`**: Add `focus-visible:ring-2`
8. **`StudentCard.tsx`, `ParentCard.tsx`, `StudentGroupBySelector.tsx`, `WaitingStudentCard.tsx`**: Add `focus-visible` rings
9. **`MetricsStripCards.tsx`**: Add `aria-controls`, `aria-orientation`
10. **`StudentGroupBySelector.tsx`**: Fix disabled button contrast (~1.5:1)
11. **`useStudentActions`**: Move `src/components/directory/hooks/` → `src/hooks/directory/`

### P2 — Medium (36 findings)
12. **WaitingListPanel.tsx** + **useDirectoryData.ts**: Fix waiting count to use dedicated query
13. **`api/crm/students/index.ts`**: Prune 12 unused barrel type re-exports
14. **3 grouping selectors**: Replace `as` casts with runtime validation
15. **`useDirectoryData.ts`**: Remove redundant `as 'status' | 'age'` cast
16. **`StudentMobileCard.tsx`**: Narrow/n type guard for `status` prop
17. **3 hooks**: Normalize staleTime 2min → 3min
18. **`WaitingListPanel.tsx`**: Eliminate duplicate fetch on tab switch
19. **`DirectoryPage.tsx`**: Remove redundant `queryKeys.studentsAll` invalidation
20. **4 heading elements**: Add `font-headline` (WaitingListPanel, StudentMobileCard, ParentMobileCard, WaitingStudentCard)
21. **3 decorative icons**: Add `aria-hidden="true"`
22. **Wrap tab panels** with React ErrorBoundary
23. **Replace Array.some + Array.find** O(2n) → Map-based lookup
24. **Add `useMemo`**: displayStudents, hasActiveFilters, filteredStudents, options
25. **`React.lazy`**: Lazy-load EnrollPanel, StudentForm, ParentForm
26. **`aria-controls`/`aria-orientation`** on MetricsStripCards tablist
27. **Naming compliance**: Add `isStudentListItem`/`toStudentListItem` to barrel
28. **6 spacing values**: h-7→h-8, p-1.5→p-2, gap-2.5→gap-3, py-1.5→py-2, gap-1.5→gap-2
29. **`motion-safe:`**: animate-pulse in CardSkeleton + WaitingListPanel
30. **Grade text**: text-slate-400→500
31. **Hover states**: StudentMobileCard + ParentMobileCard

### P3 — Low (35 findings)
32. **`StudentGroupBySelector.tsx`**: Remove redundant cast
33. **Chevron icons**: text-slate-300→400
34. **Instructor icon**: fix contrast
35. **Mobile cards**: Replace `<button>` with `<a>` for navigation
36. **`transition-all`**: Add `motion-safe:` guard in AdvancedSearchPanel
37. **`PANEL_ORDER`**: Hoist to module scope
38. **useState**: Use lazy initializer

## Build Verification

```bash
# After each change or batch of changes:
npm run lint     # Zero errors
npm run build    # tsc -b && vite build must succeed
```

## Independent Test Procedure

1. Open Directory page — verify no crash on load
2. Click an edit button — verify form opens
3. Save an edit — verify mutation succeeds
4. Create a new student — verify parent linking + activity logging
5. Toggle waiting tab — verify data loads without duplicate requests
6. Tab through all interactive elements — verify focus-visible rings appear
7. Test with forced motion preferences — verify animate-pulse disabled
8. Resize to mobile — verify card layout + hover states + link navigation
9. Test with keyboard-only — verify aria attributes guide navigation
