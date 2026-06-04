# Quickstart — Groups Feature Audit Fixes

## Prerequisites

```bash
npm install
```

## Work Order

For the most efficient implementation, follow this order to minimize merge conflicts:

### Story 1: Fix Runtime Bugs (6 files)
1. `EditGroupDialog.tsx` — Fix STATUSES array
2. `GroupFilters.tsx` — Add `'completed'` to status list
3. `GroupDetailPage.tsx` — Add useRef guard + fix price_override null
4. `useGroupMutations.ts` — Fix cascading error or
5. `LevelsTab.tsx` — Replace toLocaleDateString with formatDate
6. `GroupInfoCard.tsx` + `GroupColumns.tsx` — Fallback/format fixes
7. `useGroupDetail.ts` — Add missing dep

### Story 2: Remove Dead Code (3 files + 4 barrels)
1. Delete `TabNavigation.tsx`
2. Delete `LevelStudentsPanel.tsx`
3. Prune barrels in `api/academics/groups/index.ts`, `sessions/index.ts`, `courses/index.ts`
4. Delete dead types in `api/academics/types/common.ts`

### Story 3: Fix TypeScript Violations (4 files)
1. `LevelsTab.tsx` — Replace `any` with `PaymentDetailDTO`
2. `GroupBySelector.tsx` — Fix prop type to accept `'search'`
3. `GroupsPage.tsx` — Remove `as any` cast
4. `useGroups.ts` — Replace unsafe casts, remove redundant cast

### Story 4: Fix Data Fetching (2 files)
1. `AddSessionDialog.tsx` — Use `queryKeys.employeesAll`
2. `useGroupMutations.ts` — Remove redundant per-key invalidations

### Story 5: Fix Accessibility (5 files)
1. `AddSessionDialog.tsx` — Toggle a11y + label associations
2. `LevelSelector.tsx` — Arrow key nav for tablist
3. `LevelsTab.tsx` + `HistoryTab.tsx` + `LevelStudentsPanel.tsx` — Add `aria-hidden` to icons

## Verification

```bash
npm run build
npm run lint
npm run test -- src/tests/GroupsHeader.test.tsx
```
