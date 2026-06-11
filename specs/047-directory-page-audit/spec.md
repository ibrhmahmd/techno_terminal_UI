# Audit and Fix: Directory Page

## Feature Description

Audit and fix of the directory page feature across 8 user stories:
(1) Fix 1 runtime bug — non-null assertion crash on `editingStudent!`;
(2) Remove 3 dead hooks (`useUpdateStudentStatus`, `useSetWaitingPriority`, `useActivateStudent`) and 12 unused barrel exports;
(3) Eliminate 6 unsafe type casts across grouping selectors and status validation;
(4) Fix 3 staleTime inconsistencies (2min → 3min) and eliminate duplicate waiting-list fetching;
(5) Add `aria-hidden` to decorative icons, `aria-controls` to tab buttons, `aria-orientation` to tablist, `focus-visible` rings to 6+ interactive element groups, and `font-headline` to 4 heading elements;
(6) Parallelize sequential post-creation operations in `handleCreateStudent`, replace barrel imports with direct paths (8 files), add `useMemo` for 4 unmemoized computations, and build a `Map`-based lookup for grouped data;
(7) Move `useStudentActions` from `src/components/directory/hooks/` to `src/hooks/directory/` and add `isStudentListItem`/`toStudentListItem` to barrel exports;
(8) Fix 4 contrast violations (disabled button, grade text, chevron icons, instructor icon), 6 non-standard spacing values, add `motion-safe:` guards to 2 skeleton loaders, add hover states to 2 mobile cards, and replace `<button>` navigation with `<a>` in 2 mobile card components.
All changes are frontend-only.

## User Stories

### US1: Runtime Bug Fix
- **Critical (P0)**: Guard `editingStudent!` non-null assertion in `DirectoryPage.tsx:1006` — skip submit when null
- **High (P1)**: Remove unhandled `throw new Error()` after toast in `useStudentActions.ts:116`
- **Medium (P2)**: Replace page-scoped waiting count with dedicated waiting-list query total

### US2: Dead Code Removal
- **High (P1)**: Delete `useUpdateStudentStatus`, `useSetWaitingPriority`, `useActivateStudent` from `useWaitingList.ts`
- **Medium (P2)**: Prune 12 unused barrel type re-exports from `src/api/crm/students/index.ts`

### US3: TypeScript Safety
- **High (P1)**: Validate `setFilterGroupBy` cast against allowed values (`'none' | 'status' | 'age'`)
- **Medium (P2)**: Replace 3 unsafe `as` casts with runtime validation in grouping selectors
- **Medium (P2)**: Remove redundant `as 'status' | 'age'` cast in `useDirectoryData.ts:138`
- **Medium (P2)**: Narrow `status` prop type or add type guard in `StudentMobileCard.tsx`
- **Low (P3)**: Remove redundant cast in `StudentGroupBySelector.tsx`

### US4: Data Fetching & Cache Patterns
- **Medium (P2)**: Normalize 3 hooks from staleTime 2min → 3min (`useDirectory.ts`, `useWaitingList.ts`)
- **Medium (P2)**: Eliminate duplicate waiting-list fetch when waiting tab is active
- **Low (P3)**: Remove redundant/ineffective `queryKeys.studentsAll` invalidation

### US5: Accessibility
- **High (P1)**: Add `focus-visible:ring-2` to SearchBar input and AlphabetSlider letter buttons
- **Medium (P2)**: Add `focus-visible` rings to StudentCard, ParentCard, StudentGroupBySelector, WaitingStudentCard
- **Medium (P2)**: Add `font-headline` to 4 heading elements (Waiting List h2, StudentMobileCard h3, ParentMobileCard h3, WaitingStudentCard h3)
- **Medium (P2)**: Add `aria-hidden="true"` to 3 decorative icons (SearchBar, StudentMobileCard)
- **Medium (P2)**: Add `aria-controls` to MetricsStripCards tab buttons and `aria-orientation` to tablist
- **Medium (P2)**: Wrap tab panels with React ErrorBoundary for crash isolation

### US6: React Performance
- **High (P1)**: Parallelize independent `linkParentToStudent`/`logActivity` after `createStudent` with `Promise.all`
- **High (P1)**: Replace barrel imports with direct module paths in 8 files (HMR improvement)
- **Medium (P2)**: Replace `Array.some` + `Array.find` O(2n) lookups with `Map`-based lookup (3 instances)
- **Medium (P2)**: Add `useMemo` for `displayStudents`, `hasActiveFilters`, `filteredStudents`, `options`
- **Medium (P2)**: Lazy-load EnrollPanel, StudentForm, ParentForm with `React.lazy`
- **Low (P3)**: Hoist `PANEL_ORDER` to module scope, use lazy `useState` initializer

### US7: Architecture Compliance
- **High (P1)**: Move `useStudentActions` from `src/components/directory/hooks/` → `src/hooks/directory/`
- **Medium (P2)**: Add missing `isStudentListItem`/`toStudentListItem` to barrel exports
- **Medium (P2)**: Rename component suffixes (Panel→Form, Slider→Nav, Selector→Select) or extend convention

### US8: UI Polish & Design System
- **High (P1)**: Fix disabled button contrast (~1.5:1) in StudentGroupBySelector
- **Medium (P2)**: Fix 6 non-standard spacing values (h-7→h-8, p-1.5→p-2, gap-2.5→gap-3, py-1.5→py-2, gap-1.5→gap-2)
- **Medium (P2)**: Add `motion-safe:` prefix to `animate-pulse` in CardSkeleton and WaitingListPanel
- **Medium (P2)**: Fix low-contrast grade text (text-slate-400→500)
- **Medium (P2)**: Add hover states to StudentMobileCard and ParentMobileCard
- **Low (P3)**: Fix chevron icon contrast (text-slate-300→400), instructor icon contrast
- **Low (P3)**: Replace `<button>` with `<a>` for navigation in mobile cards
- **Low (P3)**: Add `motion-safe:` guard to `transition-all` in AdvancedSearchPanel filter cards

## Out of Scope
- Backend changes, database schema, pagination redesign, CSS framework migration
