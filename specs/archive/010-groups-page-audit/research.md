# Research: Groups Page Audit & Fixes

## Decisions Resolved

### Decision 1: Batch competitions endpoint (N+1 fix)
**Decision**: No batch endpoint exists on the backend. The N+1 fix uses `Promise.all` to fire all `getGroupCompetitions` requests in parallel rather than sequentially.

**Rationale**: Backend is external (FastAPI at fastapicloud.dev). Adding a batch endpoint would require backend changes (out of scope per constitution Principle I). Parallel requests with `Promise.all` reduces wall-clock time from N × latency to 1 × latency.

**Alternatives considered**: 
- Sequential requests (current — slowest)
- Request a single "all groups with competitions" endpoint (doesn't exist)
- Cache individual competition results and deduplicate (adds complexity for marginal gain)

### Decision 2: Debounce implementation for notes field
**Decision**: Create a lightweight `useDebounce` custom hook (~10 lines) in `src/hooks/useDebounce.ts`. No external dependency needed.

**Rationale**: Adding `lodash.debounce` adds ~4KB to bundle for a single use case. A custom hook is trivial and follows the project's minimal-dependency philosophy.

**Alternatives considered**:
- `lodash/debounce` — adds dependency
- `setTimeout` inline in `GroupInfoCard` — harder to test and reuse
- CSS `:focus` + `onBlur` only — loses real-time save behavior

### Decision 3: React Query migration scope
**Decision**: Migrate all 4 active manual hooks to React Query. Remove `useGroupLevels` (dead code).

| Hook | Current Pattern | Target Pattern |
|------|----------------|----------------|
| `useGroupDetail` | `useEffect` + `useState` + `getGroup` | `useQuery` with `queryKeys.group(id)` |
| `useGroupPayments` | `useEffect` + `useState` + `getGroupPayments` | `useQuery` with `queryKeys.group(id, 'payments')` |
| `useGroupEnrollments` | `useEffect` + `useState` + `getGroupEnrollments` | `useQuery` with `queryKeys.group(id, 'enrollments')` |
| `useGroupCompetitions` | `useEffect` + `useState` + `getGroupCompetitions` | `useQuery` with `queryKeys.group(id, 'competitions')` |
| `useGroupLevels` | Dead code | REMOVED |

**Rationale**: Constitution Principle II mandates React Query for all server state. Manual `useEffect` fetches bypass caching, deduplication, and invalidation.

### Decision 4: Test migration for `GroupsTable.tsx`
**Decision**: Migrate existing tests to test `DataTable` + `groupColumns` pattern. Fix mock data to use `status` field instead of `is_active`.

**Rationale**: `GroupsTable.tsx` is dead code — `GroupsPage` uses `DataTable` with `groupColumns`. Tests should cover the actual implementation.

### Decision 5: Employee fetch deduplication
**Decision**: Extract employee fetching into a shared `useAllEmployees` hook that both `GroupForm` and `EditGroupDialog` consume. The hook paginates through all employees and caches the result via React Query.

**Rationale**: Both components have nearly identical `fetchAllEmployees` functions. A shared hook eliminates duplication and leverages React Query caching so the second component gets instant data.

### Decision 6: `any` type replacements

| Location | Current | Replacement |
|----------|---------|-------------|
| `GroupsPage.tsx:84` | `catch (err: any)` | `catch (err: unknown)` with type guard |
| `GroupsPage.tsx:105` | `catch (err: any)` | `catch (err: unknown)` with type guard |
| `GroupsPage.tsx:111` | `(d: any)` | `(d: { loc?: string[]; msg?: string })` |
| `GroupsPage.tsx:121` | `data: any` | `data: ScheduleGroupInput` |
| `GroupsPage.tsx:129` | `catch (err: any)` | `catch (err: unknown)` with type guard |
| `useGroupQueries.ts:86` | `data: any` | `data: UpdateGroupDTO` |
| `GroupForm.tsx:127` | `catch (err: any)` | `catch (err: unknown)` with type guard |

### Decision 7: `console.*` statement handling

| Category | Action |
|----------|--------|
| Debug logging in hooks (`useGroupAttendance`, `useGroupCompetitions`, `useGroupLevels`, `useGroupPayments`, `useGroupEnrollments`, `useGroupDetail`) | Remove all `console.log`/`console.error`. Use the existing API client debug mode (`localStorage.setItem('api_debug', 'true')`) for development debugging |
| Error logging in `GroupForm`, `GroupsPage` | Replace `console.error` with proper error state handling (already done via `setMutationError` and `showToast`) |
| Stub logging in `StudentsTab` | Replace with actual implementation or remove stubs |

### Decision 8: Accessibility approach

| Component | ARIA Attributes to Add |
|-----------|----------------------|
| `ViewToggle` | `role="group"`, `aria-label="View mode"`, `aria-pressed` on buttons |
| `GroupBySelector` | `role="tablist"`, `role="tab"`, `aria-selected` on buttons |
| `GroupCategoryTabs` | `role="tablist"`, `role="tab"`, `aria-selected` on buttons |
| `TabNavigation` | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls` on buttons |
| `LevelSelector` | `role="group"`, `aria-label="Level"`, `aria-pressed` on buttons |
| `GroupsHeader` search input | `aria-label="Search groups"` |
| All Material Symbols icons | `aria-hidden="true"` |

### Decision 9: Group ID validation on detail page
**Decision**: Add early validation in `GroupDetailPage` — if `groupId` is `0` or `NaN`, show an error state immediately without attempting a fetch.

**Rationale**: Prevents unnecessary API calls and confusing "Group not found" loading states for invalid URLs like `/groups/abc`.

### Decision 10: Time format normalization
**Decision**: Create a shared `formatTimeInput` utility in `src/utils/formatting.ts` (or add to existing utils) that normalizes time strings to `HH:MM:00` format. Both `GroupForm` and `EditGroupDialog` use this utility.

**Rationale**: Eliminates the inconsistency between `GroupForm`'s `to24h()` converter and `EditGroupDialog`'s simple string concatenation.
