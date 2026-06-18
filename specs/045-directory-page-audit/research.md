# Research: Directory Page — Audit Fix

## Status

All clarifications resolved during `/speckit.clarify` session. No NEEDS CLARIFICATION items remain.

## Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Parallel API error handling | `Promise.allSettled` + per-call toasts, no rollback | Resilient partial success; avoids data loss when one of 3 calls fails |
| Automated tests | None — rely on manual Independent Test + build gates | Audit-fix scope; behavior trivially verified manually |
| Backend StudentListingDTO | Out of scope — already completed in prior session | Backend work and frontend type adapters done |
| Type guard approach | Custom type guard functions + mapped transforms | Replaces `as unknown as` double assertions and unsafe string→union casts |
| Centralized query keys | Use `queryKeys` factory from `src/hooks/queryKeys.ts` | Required by constitution; fixes inline key anti-pattern |
| StaleTime convention | 3 minutes for directory hooks | Matches existing directory convention (fixes 5-min outlier) |

## Implementation Approach

### US1 — Runtime Bugs
- **Enter key guard**: Add `onKeyDown` handler that checks `(event.target as HTMLElement).tagName !== 'INPUT'` (and TEXTAREA) before applying filters
- **Pagination count**: Pass separate `waitingTotalPages` / `waitingTotalRecords` state (derived from waiting list query) instead of reusing parent tab's pagination
- **Parallelize**: Replace sequential `await` calls in `useStudentActions` with `Promise.allSettled([...])`, map results to per-call toast notifications

### US2 — Dead Code
- Delete 3 files + clean up barrel exports + remove `all` key from `useStudentsGrouped.ts`

### US3 — TypeScript Safety
- Write `isStudentListItem(item): item is StudentListItem` guard for union narrowing
- Write `toStudentListItem(filter: StudentFilterItem): StudentListItem` mapping function
- Validate `status` string against `StudentStatus` union before index access in `StudentMobileCard`
- Use union-typed state instead of `string` for group-by selector

### US4 — Data Fetching
- Add `queryKeys.directory.waitingList` factory entry (and any missing keys)
- Add `enabled` parameter to `useWaitingList` hook
- Fix `staleTime: 3 * 60 * 1000` in `useStudentsGrouped`

### US5 — Accessibility
- Add `aria-hidden="true"` and `aria-label` to icons across 5 components
- Implement keyboard arrow nav for tab groups (ArrowLeft/Right/Home/End)
- Add `role="tabpanel"` + `aria-labelledby` to tab panels in DirectoryPage
