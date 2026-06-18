# Feature Specification: Directory Page — Audit Fix

**Feature Branch**: `045-directory-page-audit`  
**Created**: 2026-06-10  
**Status**: Draft  
**Input**: Audit findings from directory page feature investigation

---

## Clarifications

### Session 2026-06-10
- Q: Error recovery for parallel edit API calls (US1 SC4)? → A: Use `Promise.allSettled` with partial success — show per-call success/error toasts, no rollback.
- Q: Should automated Vitest tests be added? → A: No new tests — rely on manual "Independent Test" checks, `npm run build`, and `npm run lint`.

## User Stories & Testing *(mandatory)*

### User Story 1 — Fix Runtime Bugs (Priority: P1)

**Why this priority**: Enter key accidentally submits filters while typing, pagination shows parent counts on waiting tab, and edit flow runs 3 sequential API calls — all degrade the user experience.

**Independent Test**: Open filter panel, type in instructor name field, press Enter — filters should NOT apply. Navigate to waiting tab — pagination should show waiting count, not parent count.

**Acceptance Scenarios**:

1. **Given** the advanced filter panel is open with active filters, **When** the user presses Enter while focused on a text input (instructor name, activity search, date field), **Then** the filters do NOT apply.
2. **Given** the advanced filter panel is open with active filters, **When** the user presses Enter while NOT focused on a text input, **Then** the filters apply as expected.
3. **Given** the user is on the waiting list tab, **When** pagination controls render, **Then** `totalPages` and `totalRecords` reflect the waiting list count, not the parent count.
4. **Given** the user edits a student, **When** the save operation runs, **Then** the three independent API calls (update, link parent, update status) execute in parallel via `Promise.allSettled` with per-call success/error toasts and no rollback of successful calls.

---

### User Story 2 — Remove Dead Code (Priority: P2)

**Why this priority**: 2 dead components (`StudentList`, `ParentList`) and 1 duplicate finance API module increase maintenance surface and mislead future developers.

**Independent Test**: Search `src/` for `StudentList` (component, not type) and `ParentList` — zero results.

**Acceptance Scenarios**:

1. **Given** the CRM components directory, **When** searching for imports of `StudentList` (the component) in `src/` excluding test files, **Then** zero results found.
2. **Given** the CRM components directory, **When** searching for imports of `ParentList` (the component), **Then** zero results found.
3. **Given** the CRM components directory, **When** checking barrel files (`index.ts`), **Then** `StudentList` and `ParentList` are removed from re-exports.
4. **Given** the `api/crm/students/finance.ts` module, **When** checking whether `api/finance/balance.ts` provides the same endpoints, **Then** the duplicate is removed and consumers are redirected to the canonical module.
5. **Given** the `useStudentsGrouped.ts` hook, **When** checking unused query keys, **Then** the `all` key is removed.

---

### User Story 3 — Fix TypeScript Safety Violations (Priority: P2)

**Why this priority**: Double type assertions (`as unknown as`) and unsafe casts bypass TypeScript's type system entirely — an invalid shape at runtime will not be caught until it crashes.

**Independent Test**: Search for `as unknown as` and `as StudentListItem` in `DirectoryPage.tsx` — verify all are replaced with proper guards.

**Acceptance Scenarios**:

1. **Given** the `DirectoryPage.tsx` edit flow, **When** a `StudentFilterItem` is passed to the edit modal, **Then** it is not cast via `as unknown as StudentListItem` — a type guard or proper mapping is used instead.
2. **Given** the `DirectoryPage.tsx` soft/hard delete handlers, **When** a `StudentListItem | StudentFilterItem` union is passed, **Then** it is validated before being treated as `StudentListItem`.
3. **Given** the group-by selector change handlers, **When** the raw string value from the dropdown arrives, **Then** it is narrowed against the valid union before being set as state.
4. **Given** the `StudentMobileCard.tsx`, **When** receiving a `status` prop typed as `string`, **Then** it is validated against `StudentStatus` before being used as an index key.
5. **Given** `useWaitingList.ts`, **When** the error object is returned, **Then** it is not unnecessarily cast with `as Error | null`.

---

### User Story 4 — Fix Data Fetching & Cache Patterns (Priority: P2)

**Why this priority**: Inline query keys and decentralized cache management cause stale data — e.g., enrolling a student from the waiting list doesn't invalidate the grouped cache, so old data persists.

**Independent Test**: Create a student, enroll them, then navigate to the directory — the new student should appear without a manual refresh.

**Acceptance Scenarios**:

1. **Given** the waiting list hook, **When** query keys are defined, **Then** they use the centralized `queryKeys` factory rather than local inline arrays.
2. **Given** the directory page's create-parent mutation, **When** it invalidates the parents query, **Then** it uses `queryKeys.directory.parents.all` instead of inline `['directory', 'parents']`.
3. **Given** the `useWaitingList` hook, **When** it is called without explicit enablement, **Then** it should accept an `enabled` parameter to prevent unnecessary fetches when the tab is not active.
4. **Given** the grouped students hook, **When** `staleTime` is configured, **Then** it matches the directory convention of 3 minutes.

---

### User Story 5 — Fix Accessibility Gaps (Priority: P3)

**Why this priority**: Missing ARIA labels, keyboard navigation, and `aria-hidden` on icons create barriers for screen reader users and keyboard-only users.

**Independent Test**: Navigate the directory page tabs and group tabs using only the keyboard — all interactive controls should be reachable and operable.

**Acceptance Scenarios**:

1. **Given** the waiting list search input, **When** a screen reader encounters it, **Then** it has an `aria-label` describing its purpose ("Search waiting list").
2. **Given** the group tab buttons in the directory page, **When** a keyboard-only user navigates to them, **Then** ArrowLeft/ArrowRight/Home/End keys change the active tab.
3. **Given** the group tab panels, **When** a screen reader encounters them, **Then** they have `role="tabpanel"` and `aria-labelledby` pointing to the corresponding tab.
4. **Given** icon-only elements (gender avatar, chevron, phone, calendar, search), **When** a screen reader encounters them, **Then** they have `aria-hidden="true"` because they are decorative.
5. **Given** the `WaitingStudentCard` and `WaitingListPanel` components, **When** checking all Lucide icon usages, **Then** every decorative icon has `aria-hidden="true"`.
6. **Given** the `ParentMobileCard`, **When** checking all Material Symbol usages, **Then** every decorative icon has `aria-hidden="true"`.

---

## Files Changed

### Delete (3 files)
- `src/components/crm/StudentList.tsx` — dead component, no consumers
- `src/components/crm/ParentList.tsx` — dead component, no consumers
- `src/api/crm/students/finance.ts` — duplicate of `api/finance/balance.ts`

### Modify (9 files)
- `src/pages/DirectoryPage.tsx` — pagination count, Enter key guard, unsafe casts, inline query key, a11y (tab keyboard nav, tabpanel role)
- `src/components/directory/AdvancedSearchPanel.tsx` — Enter key filter guard (exclude input elements)
- `src/components/directory/hooks/useStudentActions.ts` — parallelize independent awaits
- `src/components/crm/StudentMobileCard.tsx` — unsafe status cast, a11y (aria-hidden)
- `src/components/crm/ParentMobileCard.tsx` — a11y (aria-hidden)
- `src/components/crm/WaitingListPanel.tsx` — search input aria-label, Lucide icons aria-hidden
- `src/components/crm/WaitingStudentCard.tsx` — Lucide icons aria-hidden
- `src/hooks/useWaitingList.ts` — centralized query keys, add enabled parameter, remove unnecessary assertion
- `src/hooks/useStudentsGrouped.ts` — remove unused `all` key, fix staleTime (5→3 min)
