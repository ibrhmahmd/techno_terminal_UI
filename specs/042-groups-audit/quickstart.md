# Groups Audit — Quickstart

## Commands

```bash
npm run dev             # Start dev server
npm run build           # tsc -b && vite build — must pass before commit
npm run lint            # ESLint — zero errors expected
```

## Implementation Order

1. **Delete dead files** — `LevelStudentsPanel.tsx`, `TransferDialog.tsx`, `TabNavigation.tsx`, `useGroupEnrollments.ts`
2. **Fix DTO in useGroupQueries** — change `useUpdateGroup` to accept `UpdateGroupDTO`, remove local mutation hooks, delegate to `useGroupMutations`
3. **Fix useGroupDetail errors** — add `error` destructuring to levels + sessions queries
4. **Fix types** — add `'archived'` to `Group.status` and `EnrichedGroupPublic.status` union
5. **Fix TypeScript issues** — return types, non-null assertion, type assertion, shadowed formatDate
6. **Fix data fetching** — add enabled guard, fix cache key sentinel, remove dead invalidation
7. **Fix a11y** — aria-hidden on icons, role="status" on empty states
8. **Verify** — `npm run build && npm run lint`

## Key Decisions

| Decision | Choice |
|----------|--------|
| `useUpdateGroup` DTO | Change to `UpdateGroupDTO` (not ScheduleGroupInput) |
| Duplicate mutations | Delete standalone hooks in `useGroupQueries.ts`; delegate to `useGroupMutations.ts` |
| `useGroupMutations` API | Keep the bound-by-groupId pattern; add factory for list page without groupId binding if needed |
| `LevelStudentsPanel` a11y | No fix needed — component is deleted |
| `formatDate` shadowing | Remove local version; use imported `formatDate` with null-safe callsite |
