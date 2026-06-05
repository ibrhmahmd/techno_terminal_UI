---
description: "Task list for Settings Page audit fixes across 5 user stories"
---

# Tasks: Settings Page Audit & Fix

**Input**: Design documents from `specs/040-settings-audit-fix/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/interfaces.md

**Tests**: Not included — no automated tests requested in spec.

**Organization**: Tasks grouped by user story. US1 (falsy-0 bug) is resolved by US3 (dead code removal) since the buggy component is deleted.

---

## Phase 1: Dead Code Removal — US3 Remove Dead Components (Priority: P1)

**Goal**: Delete 4 unreferenced components and clean up SettingsPage imports

**Independent Test**: `npm run build` passes; `rg 'SessionsTab|ActivityTab|CRMSettingsTab|AgeBucketEditor' src/ --glob '!*.test.*'` returns zero import references outside the deleted files' own definitions.

- [X] T001 [P] [US3] Delete `src/components/settings/SessionsTab.tsx`
- [X] T002 [P] [US3] Delete `src/components/settings/ActivityTab.tsx`
- [X] T003 [P] [US3] Delete `src/components/settings/CRMSettingsTab.tsx`
- [X] T004 [P] [US3] Delete `src/components/settings/AgeBucketEditor.tsx` (verify `useGroupingSettingsStore` and `studentGrouping` config stay intact for directory feature)
- [X] T005 [US3] Remove dead imports and tab entries from `src/pages/SettingsPage.tsx` — delete any `import` for removed components, remove from tab config array, fix `aria-labelledby` on remaining tabpanels

**Checkpoint**: US1 falsy-0 bug is automatically resolved (buggy AgeBucketEditor removed). Build should pass.

---

## Phase 2: Fix Runtime Bugs — US2 Stale Closure & Query Params (Priority: P1)

**Goal**: Fix stale closure in UsersTab Escape handler and inconsistent query params in AuditLogTable

**Independent Test**: Open User Detail modal → open Delete Confirm → dismiss → press Escape — parent modal stays open.

- [X] T006 [US2] Fix stale closure in UsersTab `useEffect` Escape handler: add `showDeleteConfirm` to dependency array at `src/components/settings/UsersTab.tsx`
- [X] T007 [US2] Fix inconsistent query params in AuditLogTable failed-attempts section: change empty string `''` to `undefined` for cleared date-from filter, matching login and password-change audit sections
- [X] T008 [US2] Replace inline `.toLocaleString()` with `formatDate` utility in UsersTab user list rendering
- [X] T009 [US2] Replace inline `.toLocaleString()` with `formatDate` utility in SessionsActivityTab session list
- [X] T010 [US2] Replace inline `.toLocaleString()` with `formatDate` utility in AuditLogTable

**Checkpoint**: All runtime bugs in non-deleted components are resolved.

---

## Phase 3: Data Fetching Anti-Patterns — US4 (Priority: P2)

**Goal**: Fix debounce in UsersTab search and add missing cache invalidation to password change mutation

**Independent Test**: Type in Users tab search — API calls fire after 350ms pause, not per-keystroke.

- [X] T011 [US4] Replace `useCallback` faux-debounce with `useDebounce` hook in UsersTab search (`src/components/settings/UsersTab.tsx`). Pattern: `const debouncedSearch = useDebounce(searchInput, 350)` → pass `debouncedSearch` to `useUsers`
- [X] T012 [US4] Add `onSuccess` cache invalidation to `useChangePassword` mutation in `src/hooks/useAuthQueries.ts`, matching the pattern of other mutations in the same file

**Checkpoint**: Data fetching patterns match project conventions.

---

## Phase 4: Accessibility Fixes — US5 (Priority: P2)

**Goal**: Systematic ARIA fixes across all settings components

**Independent Test**: Navigate settings via keyboard and VoiceOver/NVDA — all controls are labeled, modals trap focus, dynamic messages announced.

- [X] T013 [P] [US5] Fix a11y in `src/components/settings/ProfileTab.tsx`:
  - Add `htmlFor`/`id` association on all ~20+ label/input pairs
  - Add `role="alert"` on success/error mutation messages
  - Add `aria-hidden="true"` on all decorative `material-symbols-outlined` icons
  - Add `aria-label` on icon-only buttons
- [X] T014 [P] [US5] Fix a11y in `src/components/settings/SessionsActivityTab.tsx`:
  - Add `htmlFor`/`id` on form label/input pairs
  - Add `aria-hidden="true"` on decorative icons
  - Add `scope="col"` on table header `<th>` elements
- [X] T015 [P] [US5] Fix a11y in `src/components/settings/UsersTab.tsx`:
  - Add focus traps to 5 hand-rolled modals (UserDetail, Invite, CreateUser, ResetPassword, DeleteConfirm) — adopt `Modal` component or implement focus-trap pattern with `aria-modal`
  - Add `htmlFor`/`id` on all form label/input pairs
  - Add `aria-hidden="true"` on all decorative icons
  - Add `aria-label` on all icon-only buttons
  - Add `role="alert"` on dynamic mutation messages
  - Add `role="status"` on empty states
- [X] T016 [P] [US5] Fix a11y in `src/components/settings/AuditLogTable.tsx`:
  - Add `scope="col"` on table header `<th>` elements
  - Add `role="status"` on empty state message
- [X] T017 [US5] Fix `aria-labelledby` in `src/pages/SettingsPage.tsx`: ensure any `<div role="tabpanel">` references existent `id` attributes

**Checkpoint**: Zero systematic a11y gaps in settings components.

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Verify build integrity and code quality

- [X] T018 Run `npm run lint` and fix all ESLint errors in modified settings files
- [X] T019 Run `npm run build` (`tsc -b && vite build`) and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies
- **Phase 1 (Dead Code Removal)**: No dependencies — start here
- **Phase 2 (Runtime Bugs)**: Depends on Phase 1 completion (deleted components won't be erroneously fixed)
- **Phase 3 (Data Fetching)**: Can start in parallel with Phase 2 (different files)
- **Phase 4 (A11y)**: Can start in parallel with Phases 2 & 3 (different files)
- **Phase 5 (Polish)**: Depends on all prior phases

### User Story Dependencies
- **US1** (falsy-0): Resolved by US3 deletion — no separate tasks needed
- **US2**: Independent of US3 (different files)
- **US3**: Base cleanup — should go first to remove confusion
- **US4**: Independent of US2 (different files)
- **US5**: Independent of US2/US3/US4 (different file concerns)

### Parallel Opportunities
- T001–T004: All deletions are independent — run in parallel
- T006–T010: All runtime bug fixes — independent of each other
- T011–T012: Data fetching fixes — independent of each other
- T013–T017: All a11y fixes target different files — run in parallel
- Phases 2, 3, and 4 can proceed in parallel after Phase 1

### Parallel Example

```bash
# Phase 1: Delete all dead components in parallel
Task: T001 Delete SessionsTab.tsx
Task: T002 Delete ActivityTab.tsx
Task: T003 Delete CRMSettingsTab.tsx
Task: T004 Delete AgeBucketEditor.tsx

# Phase 4: Fix all files for a11y in parallel
Task: T013 Fix ProfileTab a11y
Task: T014 Fix SessionsActivityTab a11y
Task: T015 Fix UsersTab a11y
Task: T016 Fix AuditLogTable a11y
Task: T017 Fix SettingsPage a11y
```

---

## Implementation Strategy

### Incremental Delivery
1. Complete Phase 1 → Build passes, 4 dead files removed, 1 settings page cleaned up
2. Complete Phases 2–4 (in any order) → All bugs fixed, data fetching optimized, a11y gaps closed
3. Complete Phase 5 → Final verification

### Notes
- [P] tasks = different files, no dependencies
- [Story] label maps task to the user story for traceability
- No automated tests requested — acceptance scenarios from spec are manual
- Commit after each task or logical group
- Stop at any checkpoint to verify independently
