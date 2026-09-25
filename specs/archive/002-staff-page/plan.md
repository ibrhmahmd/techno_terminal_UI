# Implementation Plan: Staff Page Improvement

**Branch**: `002-staff-page` | **Date**: 2026-05-12 | **Spec**: [spec.md](spec.md) | **Clarifications**: Pending
**Input**: Feature specification from `/specs/002-staff-page/spec.md`

## Summary

Refactor the Staff page to use React Query (matching the rest of the app), fix pagination total, enable server-side search, align types properly, and add test coverage.

## Technical Context

**Current Stack**: React 19, Vite 8, TanStack React Query 5, TypeScript ~5.9, Vitest 4.1 + happy-dom
**Key Files**:
- `src/pages/StaffPage.tsx` — 287 lines, manual fetch logic
- `src/api/hr/employees.ts` — REST + pagination adapter
- `src/api/hr/types.ts` — `EmployeePublic`, `EmployeeListItem`, `EmployeeCreateInput`
- `src/components/staff/` — 5 files, ~640 lines total
- `src/hooks/usePagination.ts` — generic manual pagination (will no longer be used by staff)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Server State Discipline** | ✅ PASS | Migrating away from manual state to React Query — server data stays in React Query |
| **II. Component Naming Convention** | ✅ PASS | All new components follow existing naming conventions |
| **III. TypeScript Strict Mode** | ✅ PASS | `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` enforced |
| **IV. Existing Hook Patterns** | ✅ PASS | `useStaff` follows pattern of `useGroupQueries`, `useDashboard`, etc. |

## Phases

### Phase 0: Audit & Setup (Estimated: 30 min)

- [x] Audit current implementation (DONE — see `research.md`)
- [ ] Verify backend API returns `total` in paginated employee response
- [ ] Verify what fields `EmployeePublic` GET actually returns vs `EmployeeCreateInput` expects
- [ ] Create `src/hooks/useStaff.ts` and `src/hooks/useStaffAccounts.ts` placeholders

**Verification**: API calls against the dev proxy confirm contract accuracy.

### Phase 1: React Query Migration (Estimated: 2h)

1. Create `src/hooks/useStaff.ts`:
   - `useEmployees(search, page, pageSize)` — wraps `getEmployees`
   - `useEmployee(id)` — wraps `getEmployee`
   - `useCreateEmployee()` — mutation with cache invalidation
   - `useUpdateEmployee()` — mutation with cache invalidation
   - Query keys: `['staff', 'employees', { search, page }]`, `['staff', 'employee', id]`

2. Refactor `StaffPage.tsx`:
   - Replace `usePagination` + state with `useEmployees`
   - Replace manual create/edit with `useCreateEmployee` / `useUpdateEmployee`
   - Keep modal open/close in `useState` (UI-only state)
   - Remove `useEffect` on mount — React Query handles initial fetch

3. Update `EmployeeCard` / `EmployeeForm` / `EmployeeDetailModal`:
   - Ensure they receive correct types (no `as` casts)
   - Fix props to match actual data shape

**Verification**: `npm run build` passes. Page loads, paginates, creates, and edits without manual refresh.

### Phase 2: Fix Pagination & Search (Estimated: 1h)

1. Fix `fetchEmployeesPaginated` in `src/api/hr/employees.ts`:
   - Use `result.total` from `PaginatedApiResponse` (backend returns `total`)
   - Remove `hasMore` heuristic — use `skip + limit < total`
   - Remove `as EmployeePublic[]` cast — use proper type or fetch detail separately

2. Add server-side search:
   - Wire `q` param from `PaginationParams` into `getEmployees`
   - Add debounced search (300ms) in `StaffPage.tsx`
   - Include `search` in React Query key for cache separation
   - Remove client-side `filteredEmployees` logic

**Verification**: Search across pages works. Pagination shows correct total. Build passes.

### Phase 3: Type Alignment (Estimated: 1h)

1. Fix `fetchEmployeesPaginated` return type:
   - If the backend list endpoint returns `EmployeeListItem` (not `EmployeePublic`), the grid card should use `EmployeeListItem`
   - Either add missing fields to `EmployeeListItem` on the backend side (not our scope), or fetch details per-card
   - Viable approach: keep the list view using `EmployeeListItem` for the grid, fetch `EmployeePublic` only when opening detail modal (already done this way)

2. `EmployeeCard` props → `EmployeeListItem` (simpler, avoids cast)
3. `EmployeeDetailModal` → `EmployeePublic` (already correct)

**Verification**: No type errors. Cards render without missing-field bugs.

### Phase 4: Tests (Estimated: 2h)

1. `src/tests/staff/EmployeeCard.test.tsx`:
   - Renders name, email, job title
   - Shows active/inactive badge correctly
   - Calls onView, onEdit, onCreateAccount on button clicks

2. `src/tests/staff/EmployeeForm.test.tsx`:
   - Validates required fields (name, phone)
   - Validates national_id required in create mode
   - Calls onSubmit with correct data
   - Shows API error when provided

3. `src/tests/staff/StaffPage.test.tsx`:
   - Renders page header and search bar
   - Shows loading state
   - Shows employee cards when data loaded
   - Shows empty state when no results

4. `src/tests/staff/useStaff.test.ts`:
   - Queries return expected data shape
   - Mutations invalidate cache on success

**Verification**: `npm run test -- src/tests/staff/` passes. `npm run build` passes.

### Phase 5: Polish & Edge Cases (Estimated: 1h)

1. Add `employeeStatusColors` from `src/utils/colors.ts` to EmployeeCard status badge
2. Handle empty search state with proper icon and message
3. Handle network error state with retry button (use `ErrorState` component)
4. Ensure modals reset form state on close/open
5. Verify all UI states: loading, empty, error, populated

**Verification**: Manual testing of all states. Build + lint pass.

## Complexity Tracking

| Concern | Risk | Mitigation |
|---------|------|------------|
| Backend `total` field missing | Medium | Verify via API call in Phase 0; if missing, use client-side `data.length` as fallback with comment |
| `EmployeeListItem` lacks fields for card display | Medium | Use `EmployeeListItem` for grid, only show fields available; detail modal fetches full `EmployeePublic` |
| Mutation cache invalidation scope | Low | Invalidate `['staff', 'employees']` on any create/update — simple and safe |
| Test setup for React Query | Low | Use `QueryClientProvider` wrapper in tests, existing pattern from other tests |
