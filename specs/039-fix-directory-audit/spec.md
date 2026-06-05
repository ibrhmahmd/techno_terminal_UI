# Feature Specification: Fix Directory Feature Audit

## Overview

The Directory feature (`/directory`) allows admins to browse, search, filter, and manage students and parents. An audit of the feature uncovered 40 issues across 5 categories: runtime bugs, dead code, TypeScript quality, data fetching anti-patterns, and accessibility gaps. This specification describes the fixes needed to address all findings.

**Scope**: Frontend-only changes to `src/pages/DirectoryPage.tsx`, `src/components/directory/`, `src/hooks/useDirectory.ts`, `src/hooks/directory/`, and `src/api/crm/` (including dead code removal from barrel exports).

---

## User Stories

### US-01: Pagination is correct
As an admin browsing students, I want the pagination to show accurate page counts so that I can navigate through all students reliably.

**Acceptance criteria**:
- When students have "waiting" status on pages beyond page 1, the total student count (and thus page count) is accurate
- The total count shown in the metrics strip for "Waiting List" reflects all waiting students, not just those on the current page

### US-02: Edit student works reliably
As an admin editing a student, I want changes to be saved with a clear success/failure message and proper cache invalidation so that I see up-to-date data after editing.

**Acceptance criteria**:
- If the edit API call fails, an appropriate error message is shown (not a generic "Failed to update student")
- After a successful edit, all directory caches are invalidated (students list, grouped data, parent associations)
- The directory pages re-render with fresh data after the edit

### US-03: Create parent works reliably
As an admin creating a parent, I want errors handled properly so that the UI does not hang or show unhandled errors.

**Acceptance criteria**:
- If parent creation fails, the error is caught and shown via toast notification
- The parent modal remains open on failure so the user can retry without re-entering data

### US-04: Dead API code is removed
As a developer maintaining this codebase, I want unused API functions and their barrel re-exports removed so that the codebase is cleaner and easier to navigate.

**Acceptance criteria**:
- 9 dead API functions are removed from `src/api/crm/students/`
- 8 dead re-exports are removed from `src/api/crm/students/index.ts`
- Build and lint pass after removal

### US-05: TypeScript types are safe
As a developer, I want proper TypeScript types throughout the directory feature so that type errors are caught at compile time.

**Acceptance criteria**:
- All `Record<string, ...>` types for known status values are narrowed to specific union types
- The `isAxiosError` type guard is used instead of inline casts for error handling
- Redundant type assertions are removed

### US-06: Data fetching is efficient
As an admin using the Directory page, I want search queries to only fire when relevant so that unnecessary network requests are avoided.

**Acceptance criteria**:
- Student search queries do not fire when on the Parents or Advanced Filter tabs
- Parent search queries do not fire when on the Students or Advanced Filter tabs
- All query keys use the centralized factory (no inline query key strings)
- Cache invalidation on student mutations is scoped appropriately (does not blow away unrelated caches)

### US-07: Keyboard navigation works
As a keyboard-only user, I want to navigate and activate student and parent cards using my keyboard so that I can use the Directory feature without a mouse.

**Acceptance criteria**:
- Student and parent cards can be focused with Tab key
- Pressing Enter or Space on a focused card navigates to the detail page
- Screen readers announce the card as a link/button

### US-08: Screen reader support is complete
As a screen reader user, I want all UI controls to have proper ARIA attributes so that I can understand and use the Directory feature.

**Acceptance criteria**:
- All three tablists (student groups, waiting groups, filtered groups) have distinct `aria-label` values
- The error state is announced by screen readers (`role="alert"`)
- Skeleton loaders are hidden from screen readers (`aria-hidden="true"`)
- All Material Symbols icons are hidden from screen readers (`aria-hidden="true"`)

### US-09: Filter actions have correct behavior
As an admin filtering students, I want the "Reset" and "Apply Filter" buttons to work correctly even without a try/catch.

**Acceptance criteria**:
- The `handleCreateParent` callback properly catches errors from the mutation
- The double-filter pattern for waiting students is eliminated (only filtered once)

---

## Functional Requirements

### F-01: Correct pagination math
The `totalStudents` calculation in `useDirectoryData` must not subtract the waiting count of the current page from the backend total (which covers all pages). The waiting tab should fetch its own total independently.

### F-02: Error handling in edit flow
The `handleEditStudent` catch block must accept the error parameter and parse validation errors from the API response, matching the pattern used in `handleCreateStudent`.

### F-03: Cache invalidation order
The `handleEditStudent` function must invalidate directory caches only after all follow-up mutations (link parent, update status) have completed, not immediately after the primary edit mutation.

### F-04: Parent creation error handling
The `handleCreateParent` callback must wrap the `mutateAsync` call in a try/catch to prevent unhandled promise rejections.

### F-05: Remove dead API functions
Remove the following unused exports from `src/api/crm/students/`:
- `getStudentStatusSummary`, `getStudentsByStatus` (from `status.ts`)
- `linkSibling`, `unlinkSibling` (from `siblings.ts`)
- `formatStudentDisplay`, `hasOutstandingBalance`, `getBalanceDisplay`, `getStatusColorClass` (from `utils.ts`)
- `getCompetitionHistory` (from `activity.ts`)
And remove their corresponding re-exports from the barrel file.

### F-06: Strengthen status types
Change `Record<string, ...>` in `StudentCard.tsx` statusConfig to use `Record<StudentStatus, ...>` where `StudentStatus` is the union type `'active' | 'waiting' | 'inactive'`.

### F-07: Use isAxiosError for error handling
Replace the inline type cast `as { response?: ... }` in `useStudentActions.ts` with `isAxiosError` from the axios package.

### F-08: Remove redundant type assertions
Remove unnecessary `as 'status' | 'age'` casts in `useDirectoryData.ts` where the ternary expression already narrows the type.

### F-09: Tab-aware search guards
Add an `enabled` guard to `useStudentsSearch` so it only fires when `activeTab` is `'students'` or `'waiting'`. Add an `enabled` guard to `useParentsSearch` so it only fires when `activeTab` is `'parents'`.

### F-10: Migrate inline query keys to factory
Replace all inline query key strings with the centralized `queryKeys` factory:
- `AdvancedSearchPanel.tsx`: `['courses', 'list-simple-filters']` → new factory key
- `DirectoryPage.tsx`: `['directory', 'parents']` → `queryKeys.directory.parents.all`
- `useStudentActions.ts` (line 69): `['directory', 'parents']` → factory key
- `useStudentActions.ts` (line 136): `['directory', 'parents']` → factory key
- `useDirectory.ts` (line 76): `['directory', 'students']` → `queryKeys.directory.students.all`

### F-11: Narrow cache invalidation
In `useDirectory.ts`, change `qc.invalidateQueries({ queryKey: ['students'] })` to `qc.invalidateQueries({ queryKey: ['students', 'grouped'] })` to avoid blowing away individual student detail caches.

### F-12: Keyboard navigation on cards
Add `role`, `tabIndex`, and `onKeyDown` handlers to `StudentCard.tsx` and `ParentCard.tsx` so that cards are keyboard-activatable.

### F-13: ARIA labels on tablists
Add distinct `aria-label` attributes to the three tablist elements in `DirectoryPage.tsx`: "Student groups", "Waiting list groups", "Filtered student groups".

### F-14: Error state accessibility
Add `role="alert"` to the error state div in `DirectoryPage.tsx`.

### F-15: Screen reader visibility
Add `aria-hidden="true"` to skeleton loaders in `CardSkeleton.tsx` and to Material Symbols icon spans in `StudentGroupBySelector.tsx`.

### F-16: Remove dead ParentCard props
Remove the `onEdit` and `onDelete` props from `ParentCardActions` interface and their conditional RowActions branches, since `actions={{}}` is always passed.

### F-17: Eliminate double-filter for waiting students
Remove the redundant `displayStudents.filter(s => s.status !== 'waiting')` in either `useDirectoryData.ts` or `DirectoryPage.tsx` — keep only one.

---

## Non-Functional Requirements

- **Build integrity**: `npm run build` must pass with zero errors after all changes
- **Lint integrity**: `npm run lint` must pass with zero new warnings after all changes
- **No regressions**: Existing directory functionality (search, filter, pagination, grouping, CRUD) must continue working as before

---

## Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Pagination shows correct page count when waiting students span multiple pages | Verified by inspecting total count vs actual items across pages |
| Student edit errors show descriptive messages | Verified by simulating API error response |
| No unhandled promise rejections in console during parent creation | Verified by monitoring browser console |
| Dead functions and re-exports removed | Build passes, grep for function names returns zero hits outside test files |
| No `as any` or unsafe `as StudentListItem` casts remain in directory feature files | Verified by grep |
| Student search does not fire on Parents or Advanced tabs | Verified by network tab inspection |
| All inline query keys replaced with factory usage | Verified by grep for `queryKey: \['` in directory files |
| Keyboard users can activate student and parent cards via Enter/Space | Verified by manual keyboard testing |
| Screen readers announce tablists, error states, and ignore icons/skeletons | Verified by axe DevTools or NVDA inspection |
| Build and lint pass | `npm run build && npm run lint` exits with code 0 |

---

## Key Entities

- **Student**: A student record with id, full_name, phone, status, date_of_birth, grade, gender, group enrollments, activity log, and financial balance
- **Parent**: A parent/guardian record with id, full_name, phone_primary, student_count
- **StudentFilterItem**: A filtered view of a student with age (calculated), unpaid_balance, and without date_of_birth
- **StudentStatus**: Union of `'active' | 'waiting' | 'inactive'`
- **GroupItem<T>**: A grouping bucket with key, label, count, items, and sortKey

---

## Assumptions

- The backend API returns accurate totals for students across all pages
- Keyboard navigation follows standard web patterns (Tab to focus, Enter/Space to activate)
- The project's existing query key factory (`src/hooks/queryKeys.ts`) is the canonical source for query key strings
- `isAxiosError` from the `axios` package is available for type-safe error handling
- All removed dead functions have no consumers in test files
- The barrel re-export removal does not break any consumers since the functions are confirmed unused

---

## Dependencies

- None — all changes are frontend-only with no backend API changes required
