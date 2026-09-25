# Specification: Groups Feature Audit & Fix

**Spec**: `034-groups-audit` | **Date**: 2026-06-04
**Target**: Groups feature — pages, components, hooks, API layer, types

## Summary

Audit and fix of the Groups feature across 5 categories: runtime bugs, dead code, TypeScript violations, data fetching anti-patterns, and accessibility gaps. All changes are frontend-only.

---

## User Stories

### Story 1: Fix Runtime Bugs

**Finding 1.1** — `EditGroupDialog.tsx:19` — STATUSES array includes `'cancelled'` which is not a valid group status in the data model (valid: `active`, `inactive`, `archived`, `completed`). Also missing `'inactive'` and `'archived'` from the selector. This causes the status badge to show "Unknown" and the columns view to show "Inactive" for cancelled groups.

- **Severity**: high | **Risk**: breaking
- **Fix**: Replace `['active', 'completed', 'cancelled']` with `['active', 'inactive', 'archived', 'completed']`

**Finding 1.2** — `GroupDetailPage.tsx:49` — `useEffect` re-fires its toast on every render when `paymentsError` is truthy and `showToast` reference changes. Can cause toast spam on query retries/refetches.

- **Severity**: high | **Risk**: moderate
- **Fix**: Add `useRef` guard to track previous error value

**Finding 1.3** — `GroupFilters.tsx:36` — Status filter excludes `'completed'` groups, making it impossible to filter for completed groups via the status selector.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Add `'completed'` to the STATUSES array

**Finding 1.4** — `useGroupMutations.ts:101` — Error from one mutation (e.g. failed delete) persists and masks success of another mutation (e.g. successful update) because error is computed via `||` across all mutations without clearing per-mutation errors on independent success.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Compute error by checking `isError` per mutation instead of cascading `||`

**Finding 1.5** — `LevelsTab.tsx:83` — Uses `toLocaleDateString()` instead of shared `formatDate` utility from `utils/formatting.ts`. On non-US browsers this shows a different date format.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Replace `new Date(p.payment_date).toLocaleDateString()` with `formatDate(p.payment_date)`

**Finding 1.6** — `GroupDetailPage.tsx:309` — `currentPriceOverride` hardcoded to `null` instead of reading from group data. If the group has an existing price override, the dialog always defaults to empty, discarding the override.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Pass `{group?.price_override ?? null}` instead of `{null}`

**Finding 1.7** — `GroupInfoCard.tsx:159` — When schedule times are null/undefined, `formatTime('')` returns `''`, producing display like `"No day  - "` instead of showing a placeholder.

- **Severity**: low | **Risk**: safe
- **Fix**: Add `|| '--:--'` fallback after `formatTime()` calls

**Finding 1.8** — `GroupColumns.tsx:39` — Inline `.slice(0, 5)` on time strings instead of shared format utility. Functionally equivalent but bypasses abstraction.

- **Severity**: low | **Risk**: safe
- **Fix**: Replace with shared utility import

**Finding 1.9** — `useGroupDetail.ts:65` — `useEffect` missing `setActiveLevelId` in dependency array. Not a runtime bug (setters are stable) but suppresses lint warnings.

- **Severity**: low | **Risk**: safe
- **Fix**: Add `setActiveLevelId` to dependency array

---

### Story 2: Remove Dead Code

**Finding 2.1** — `components/groups/TabNavigation.tsx` — Entire component is never imported anywhere. The only `<TabNavigation>` usage is from `components/reports/molecules/TabNavigation`.

- **Severity**: high | **Risk**: safe
- **Action**: Delete file + remove its reference from barrel

**Finding 2.2** — `components/groups/detail/LevelStudentsPanel.tsx` — Entire component never imported. Not used by `GroupDetailPage` or any consumer.

- **Severity**: high | **Risk**: safe
- **Action**: Delete file + remove its reference from barrel

**Finding 2.3** — `api/academics/groups/index.ts` — 4 dead exports: `getGroupDetails`, `getGroups`, `searchGroups`, `getArchivedGroups`. Functions still defined in `core.ts` but never imported from the barrel by any consumer.

- **Severity**: high | **Risk**: safe
- **Action**: Remove from barrel export. Optionally delete source functions if unused.

**Finding 2.4** — `api/academics/sessions/index.ts` — 2 dead exports: `getSessionDetails`, `markSubstituteInstructor` (and its type `SubstituteInstructorRequest`).

- **Severity**: high | **Risk**: safe
- **Action**: Remove from barrel export

**Finding 2.5** — `api/academics/courses/index.ts` — 2 dead exports: `searchCourses`, `getAllCourseStats`.

- **Severity**: high | **Risk**: safe
- **Action**: Remove from barrel export

**Finding 2.6** — `api/academics/types/common.ts` — 2 dead types: `EnrollmentHistoryFilters` (line 13), `PaginatedGroupsResponse<T>` (line 24, already marked `@deprecated`).

- **Severity**: medium | **Risk**: safe
- **Action**: Delete type definitions

---

### Story 3: Fix TypeScript Violations

**Finding 3.1** — `LevelsTab.tsx:30,55` — `payment` parameter typed as `any` in `handleDownloadPdf` and `handleSendWhatsApp` instead of `PaymentDetailDTO`.

- **Severity**: high | **Risk**: moderate
- **Fix**: Replace `any` with `PaymentDetailDTO`

**Finding 3.2** — `GroupsPage.tsx:211` — `as any` cast needed because `GroupBySelectorProps.value` is typed as `GroupByField` but the actual value can be `'search'` (a `GroupBySelectorValue`).

- **Severity**: high | **Risk**: breaking
- **Fix**: Fix the prop type to accept the full value union

**Finding 3.3** — `GroupBySelector.tsx:7` — `value` prop typed as `GroupByField` which excludes `'search'`. Must match the full value union that includes `'search'`.

- **Severity**: high | **Risk**: breaking
- **Fix**: Change prop type to `GroupBySelectorValue`

**Finding 3.4** — `HistoryTab.tsx:144` — `enrollmentColumns as any` used to bypass type mismatch.

- **Severity**: medium | **Risk**: safe
- **Fix**: Remove `as any` after resolving column type mismatch

**Finding 3.5** — `useGroups.ts:39` — Unsafe `stored as GroupByField` cast.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Extract into a type predicate function

**Finding 3.6** — `useGroups.ts:79` — Unnecessary `sortField as keyof EnrichedGroupPublic` cast.

- **Severity**: medium | **Risk**: safe
- **Fix**: Remove redundant cast

---

### Story 4: Fix Data Fetching Anti-Patterns

**Finding 4.1** — `AddSessionDialog.tsx:41` — Inline query key `['employees', 'list']` bypasses the centralized `queryKeys` factory, creating duplicate cache entries.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Use `queryKeys.employeesAll` instead

**Finding 4.2** — `useGroupMutations.ts:32` — Redundant per-key invalidations after prefix invalidation already covers all nested keys.

- **Severity**: low | **Risk**: safe
- **Fix**: Keep only the prefix invalidation, remove redundant per-key lines

---

### Story 5: Fix Accessibility Gaps

**Finding 5.1** — `AddSessionDialog.tsx:390` — Substitute instructor toggle button has no accessible name and no state indication. Screen reader cannot identify purpose or current state.

- **Severity**: critical | **Risk**: safe
- **Fix**: Add `role="switch"`, `aria-checked`, and `aria-label="Toggle substitute instructor"`

**Finding 5.2-5.7** — Six Material Symbols decorative icons missing `aria-hidden="true"` across `LevelsTab.tsx` (lines 381, 394), `LevelSelector.tsx` (line 59), `LevelStudentsPanel.tsx` (lines 72, 77), `HistoryTab.tsx` (line 176).

- **Severity**: high | **Risk**: safe
- **Fix**: Add `aria-hidden="true"` to all `<span className="material-symbols-outlined">` that are decorative

**Finding 5.8** — `AddSessionDialog.tsx:316` — Date input missing programmatic label association (no `htmlFor`/`id` pair).

- **Severity**: medium | **Risk**: safe
- **Fix**: Add `htmlFor` to `<label>` and matching `id` to `<input>`

**Finding 5.9** — `AddSessionDialog.tsx:411` — Notes textarea missing programmatic label association.

- **Severity**: medium | **Risk**: safe
- **Fix**: Add `htmlFor`/`id` pair

**Finding 5.10** — `LevelSelector.tsx:27` — Tablist with `role="tab"` buttons lacks arrow key keyboard navigation.

- **Severity**: medium | **Risk**: moderate
- **Fix**: Add `onKeyDown` handler for ArrowLeft/ArrowRight/Home/End

**Finding 5.11** — `LevelStudentsPanel.tsx:61` — Clickable student card div lacks `role="button"`, `tabIndex`, and keyboard event handlers.

- **Severity**: medium | **Risk**: safe
- **Fix**: Add `role="button"`, `tabIndex={0}`, `onKeyDown` handler

---

## Files Changed

### Delete (3 files)
- `src/components/groups/TabNavigation.tsx`
- `src/components/groups/detail/LevelStudentsPanel.tsx`
- `src/components/groups/detail/index.ts` (remove dead export)

### Edit (14 files)
- `src/components/groups/GroupFilters.tsx`
- `src/components/groups/GroupColumns.tsx`
- `src/components/groups/LevelsTab.tsx`
- `src/components/groups/HistoryTab.tsx`
- `src/components/groups/GroupBySelector.tsx`
- `src/components/groups/detail/EditGroupDialog.tsx`
- `src/components/groups/detail/GroupInfoCard.tsx`
- `src/components/groups/detail/LevelSelector.tsx`
- `src/components/groups/detail/AddSessionDialog.tsx`
- `src/components/groups/shared/GroupStatusBadge.tsx` (verify cancelled→inactive mapping)
- `src/pages/GroupsPage.tsx`
- `src/pages/GroupDetailPage.tsx`
- `src/hooks/useGroups.ts`
- `src/hooks/useGroupMutations.ts`
- `src/hooks/useGroupDetail.ts`

### Barrel cleanup (4 files)
- `src/api/academics/groups/index.ts`
- `src/api/academics/sessions/index.ts`
- `src/api/academics/courses/index.ts`
- `src/api/academics/types/common.ts`

---

## Verification

```bash
npm run build    # Must pass with zero errors
npm run lint     # Must pass with zero errors
rg ': any' src/components/groups/ src/hooks/useGroup*.ts
rg 'console\.' src/components/groups/ src/hooks/useGroup*.ts
```

## Specific checks per story
1. Status selector includes all 4 valid statuses
2. `TabNavigation.tsx` and `LevelStudentsPanel.tsx` are deleted
3. No `as any` in groups/* files after fixes
4. No inline `queryKey: ['...']` in groups components
5. All `material-symbols-outlined` icons have `aria-hidden="true"`
6. Toggle button has `role="switch"` + `aria-checked`
7. LevelSelector tabs support arrow key navigation
