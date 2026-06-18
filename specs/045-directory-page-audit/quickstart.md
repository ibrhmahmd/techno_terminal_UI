# Quickstart: Directory Page — Audit Fix

## Order of Implementation

Follow user story priority (P1 → P2 → P3):

### 1. US1 — Fix Runtime Bugs (P1)
1. `src/components/directory/AdvancedSearchPanel.tsx`: Add `onKeyDown` guard — skip Enter if target is INPUT/TEXTAREA/SELECT
2. `src/pages/DirectoryPage.tsx`: Derive waiting-list pagination from waiting query separately from parent tab
3. `src/components/directory/hooks/useStudentActions.ts`: Replace sequential awaits with `Promise.allSettled`, add per-call toasts

### 2. US2 — Remove Dead Code (P2)
1. Delete `src/components/crm/StudentList.tsx`
2. Delete `src/components/crm/ParentList.tsx`
3. Delete `src/api/crm/students/finance.ts`
4. Remove `StudentList` / `ParentList` from `src/components/crm/index.ts` barrel export
5. `src/hooks/useStudentsGrouped.ts`: Remove unused `all` query key

### 3. US3 — Fix TypeScript Safety (P2)
1. Create type guard: `isStudentListItem` in shared utility
2. Create mapper: `toStudentListItem` for `StudentFilterItem` → `StudentListItem`
3. `src/pages/DirectoryPage.tsx`: Replace `as unknown as StudentListItem` with guarded mapping
4. `src/components/crm/StudentMobileCard.tsx`: Validate `status` against `StudentStatus` union
5. `src/hooks/useWaitingList.ts`: Remove unnecessary `as Error | null` cast

### 4. US4 — Fix Data Fetching (P2)
1. `src/hooks/queryKeys.ts`: Add `directory.waitingList` factory entries
2. `src/hooks/useWaitingList.ts`: Use centralized `queryKeys`, add `enabled` param
3. `src/pages/DirectoryPage.tsx`: Replace inline `['directory', 'parents']` with `queryKeys.directory.parents.all`
4. `src/hooks/useStudentsGrouped.ts`: Fix `staleTime` from 5 min → 3 min

### 5. US5 — Accessibility (P3)
1. `src/components/crm/WaitingListPanel.tsx`: Add `aria-label` to search input, `aria-hidden` to Lucide icons
2. `src/components/crm/WaitingStudentCard.tsx`: Add `aria-hidden` to Lucide icons
3. `src/components/crm/StudentMobileCard.tsx`: Add `aria-hidden` to icons
4. `src/components/crm/ParentMobileCard.tsx`: Add `aria-hidden` to Material Symbols
5. `src/pages/DirectoryPage.tsx`: Add `role="tabpanel"` + `aria-labelledby`, implement keyboard tab nav (ArrowLeft/Right/Home/End)

## Verification

### After each US
```bash
npm run build    # tsc -b && vite build — zero errors
npm run lint     # zero feature-related errors
```

### Final verification
1. `npm run build` — zero errors
2. `npm run lint` — zero feature-related errors
3. Manual Independent Tests per spec (Enter key, pagination, keyboard nav, screen reader)
