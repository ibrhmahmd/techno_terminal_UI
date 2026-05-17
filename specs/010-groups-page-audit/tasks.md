# Tasks: Groups Page Audit & Fixes

**Input**: Design documents from `/specs/010-groups-page-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Existing test files (`src/tests/GroupsTable.test.tsx`, `src/tests/useGroups.test.ts`) need mock data fixes and migration to match the actual implementation (`DataTable` + `groupColumns` pattern).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/academics/`
  - Components: `src/components/groups/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/GroupsPage.tsx`, `src/pages/GroupDetailPage.tsx`
  - Tests: `src/tests/`

---

## Phase 1: Foundational (Shared Utilities)

**Purpose**: Create shared utilities that multiple user stories depend on. These MUST be complete before US1 and US5 can fully implement their fixes.

**⚠️ CRITICAL**: US1 time format fixes and US5 debounce/ARIA work depend on these utilities.

- [x] T001 [P] Create `useDebounce` hook at `src/hooks/useDebounce.ts`
- [x] T002 [P] Create time format utilities at `src/utils/formatting.ts`
- [x] T003 [P] Create `useAllEmployees` hook at `src/hooks/useAllEmployees.ts`

**Checkpoint**: Shared utilities available. US1 time fixes, US5 debounce, and US4 employee deduplication can now proceed.

---

## Phase 2: User Story 1 — Eliminate Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix all runtime bugs and logic errors so staff members see correct data and functional interactions across the Groups page and detail views.

**Independent Test**: Load the Groups page and Group Detail page — verify all group statuses display correctly ("Inactive" not "Archived"), student counts render accurately (bitwise OR fixed), schedule times show `--:--` consistently, "Drop Student" uses ConfirmDialog (not native confirm), and back navigation from Group Detail uses client-side routing (no page reload).

### Implementation for User Story 1

- [x] T004 [US1] Fix status mapping in `src/components/groups/GroupsTable.tsx:115-124`
- [x] T005 [US1] Fix bitwise OR in `src/components/groups/detail/GroupInfoCard.tsx:133`
- [x] T006 [US1] Fix navigation in `src/pages/GroupDetailPage.tsx:122`
- [x] T007 [US1] Fix `handleDrop` in `src/components/groups/StudentsTab.tsx:70-72`
- [x] T008 [US1] Fix time format in `src/components/groups/GroupColumns.tsx:38-39`
- [x] T009 [US1] Fix time format in `src/components/groups/GroupCard.tsx:18-21`
- [x] T010 [US1] Add group ID validation in `src/pages/GroupDetailPage.tsx:25`
- [x] T011 [US1] Fix `useEffect` toast re-fire in `src/pages/GroupDetailPage.tsx:69-79`

**Checkpoint**: All runtime bugs fixed. Groups page and detail page display correct data, use proper navigation, and handle edge cases gracefully.

---

## Phase 3: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Remove all unused component files, hook files, and their exports from the groups feature.

**Independent Test**: Scan `src/components/groups/` and `src/hooks/` — verify zero unused files remain. Run `npm run build` — verify zero import errors from removed files.

### Implementation for User Story 2

- [x] T012 [US2] Delete dead component files (8 components, 3 hooks)
- [x] T013 [US2] Clean up barrel exports in `src/components/groups/detail/index.ts`

**Checkpoint**: Zero dead code remains. Build passes with no import errors.

---

## Phase 4: User Story 3 — TypeScript & Code Quality (Priority: P2)

**Goal**: Eliminate all `any` types, `console.*` statements, and redundant `export default` patterns. Remove unused props.

**Independent Test**: Run `npm run lint` and `npm run build` — verify zero `any` types, zero `console.*` statements, and zero redundant default exports in groups-related code.

### Implementation for User Story 3

- [x] T024 [US3] Replace `any` types in GroupsPage.tsx and useGroupQueries.ts
- [x] T025 [US3] Remove all `console.*` statements from groups components and hooks
- [x] T026 [US3] Remove redundant `export default` from all group components
- [x] T027 [US3] Remove unused props (enrollmentCount, _groupId, groupId)
- [x] T028 [US3] Fix `handleSort` type and remove deprecated `setGroups` in useGroups.ts

**Checkpoint**: Zero `any` types, zero `console.*` statements, zero redundant exports, zero unused props. Build and lint pass cleanly.

---

## Phase 5: User Story 4 — Standardize Data Fetching (Priority: P3)

**Goal**: Migrate all manual `useEffect`-based hooks to React Query with centralized query keys. Fix N+1 competitions fetch. Deduplicate employee fetching.

**Independent Test**: Review all group-related hooks — verify each uses `useQuery`/`useMutation`, query keys use `queryKeys` factory, and `staleTime` values follow AGENTS.md conventions (5 min default, 1 min attendance, 3 min enrollments).

### Implementation for User Story 4

- [x] T048 [US4] Migrate `useGroupDetail` at `src/hooks/useGroupDetail.ts` from `useEffect` + `useState` to `useQuery` with `queryKeys.group(groupId)`, `staleTime: 5 min`, `enabled: groupId > 0`
- [x] T049 [P] [US4] Migrate `useGroupPayments` at `src/hooks/useGroupPayments.ts` from `useEffect` + `useState` to `useQuery` with `queryKeys.group(groupId, 'payments')`, `staleTime: 5 min`, `enabled: groupId > 0`
- [x] T050 [P] [US4] Migrate `useGroupEnrollments` at `src/hooks/useGroupEnrollments.ts` from `useEffect` + `useState` to `useQuery` with `queryKeys.group(groupId, 'enrollments')`, `staleTime: 3 min`, `enabled: groupId > 0`
- [x] T051 [P] [US4] Migrate `useGroupCompetitions` at `src/hooks/useGroupCompetitions.ts` from `useEffect` + `useState` to `useQuery` with `queryKeys.group(groupId, 'competitions')`, `staleTime: 5 min`, `enabled: groupId > 0`
- [x] T052 [US4] Fix `useGroupAttendance` at `src/hooks/useGroupAttendance.ts:20` — replace inline query key `['groups', groupId, 'attendance', levelNumber]` with `queryKeys.group(groupId, 'attendance', levelNumber)`
- [x] T053 [US4] Add new query keys to `src/hooks/queryKeys.ts` — extend `queryKeys.group()` to support nested keys: `'payments'`, `'enrollments'`, `'competitions'`, `'attendance'`
- [x] T054 [US4] Fix N+1 pattern in `src/api/academics/groups/utils.ts:14-31` — replace sequential `Promise.all` with `getGroupCompetitions` calls with parallel `Promise.all` (fire all requests simultaneously, reduce wall-clock time from N × latency to 1 × latency)
- [x] T055 [US4] Replace duplicated employee fetch in `src/components/groups/GroupForm.tsx` — use `useAllEmployees` hook (T003) instead of inline `fetchAllActiveEmployees` pagination loop
- [x] T056 [US4] Replace duplicated employee fetch in `src/components/groups/detail/EditGroupDialog.tsx:43-70` — use `useAllEmployees` hook (T003) instead of inline `fetchAllEmployees` pagination loop
- [x] T057 [US4] Update `GroupDetailPage.tsx` consumers — adapt to new React Query return shapes from migrated hooks (`data`, `isLoading`, `error` instead of manual state)

**Checkpoint**: All group hooks use React Query. Centralized query keys. No manual `useEffect` fetches. N+1 fixed. Employee fetch deduplicated.

---

## Phase 6: User Story 5 — Accessibility & UX Polish (Priority: P3)

**Goal**: Add ARIA attributes to all interactive controls, mark icons as hidden, debounce notes field, normalize time input format.

**Independent Test**: Keyboard-only navigation works across all tabs/toggles. Screen reader announces controls correctly with `aria-pressed`/`aria-selected` states. Notes field debounces API calls (≤1 per 300ms during rapid typing).

### Implementation for User Story 5

- [x] T058 [US5] Add ARIA attributes to all interactive controls (ViewToggle, GroupBySelector, GroupCategoryTabs, TabNavigation, LevelSelector, GroupsHeader)
- [x] T059 [US5] Add aria-hidden="true" to all Material Symbols icons
- [x] T060 [US5] Apply debounce to notes field in GroupInfoCard (300ms delay)
- [x] T061 [US5] Normalize time input in EditGroupDialog using formatTimeInput utility
- [x] T062 [US5] Normalize time input in GroupForm using formatTimeInput utility

**Checkpoint**: All interactive controls have proper ARIA attributes. Icons hidden from screen readers. Notes field debounced. Time input normalized consistently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Fix existing tests, verify build, ensure no regressions.

- [x] T068 [P] Fix mock data in `src/tests/GroupsTable.test.tsx`
- [x] T069 [P] Fix mock data in `src/tests/useGroups.test.ts`
- [x] T070 Run `npm run lint` — groups-related errors fixed
- [x] T071 Run `npm run build` — passes with zero errors
- [x] T072 Verify no regressions — table view, card view, grouping, search, CRUD functional

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS US1 (time format), US4 (employee fetch), US5 (debounce).
- **User Story 1 (Phase 2)**: Depends on T002 (time format utility). No dependencies on other stories.
- **User Story 2 (Phase 3)**: No dependencies on other stories. Can run in parallel with US1 after Phase 1.
- **User Story 3 (Phase 4)**: No dependencies on other stories. Can run in parallel with US1/US2 after Phase 1.
- **User Story 4 (Phase 5)**: Depends on T003 (useAllEmployees hook). No dependencies on other stories.
- **User Story 5 (Phase 6)**: Depends on T001 (useDebounce) and T002 (formatTimeInput). No dependencies on other stories.
- **Polish (Phase 7)**: Depends on all user stories complete.

### User Story Dependencies

- **US1 (P1) — Runtime Bugs**: Depends on T002 (time format utility). Independent of US2–US5.
- **US2 (P2) — Dead Code**: No dependencies. Independent of all stories.
- **US3 (P2) — Code Quality**: No dependencies. Independent of all stories.
- **US4 (P3) — Data Fetching**: Depends on T003 (useAllEmployees). Independent of US1–US3, US5.
- **US5 (P3) — Accessibility**: Depends on T001 (useDebounce), T002 (formatTimeInput). Independent of US1–US4.

### Within Each User Story

- Shared utilities before consumer updates
- Bug fixes before test updates
- Individual file fixes in parallel where possible
- Verification tasks last in each phase

### Parallel Opportunities

- T001, T002, T003 (Foundational) can run in parallel
- After Phase 1: US1 (T004–T011), US2 (T012–T023), US3 (T024–T047), US4 (T048–T057), US5 (T058–T067) can ALL run in parallel
- Within US2: T012–T022 (file deletions) can all run in parallel
- Within US3: T024–T042 (type/console/export fixes) can all run in parallel
- Within US4: T049–T051 (hook migrations) can run in parallel
- Within US5: T058–T063 (ARIA additions) can all run in parallel
- T068, T069 (test fixes) can run in parallel

---

## Parallel Example: After Foundational Phase

```bash
# Launch all user stories in parallel:
Task: "US1: Fix runtime bugs (T004–T011)"
Task: "US2: Remove dead code (T012–T023)"
Task: "US3: TypeScript & code quality (T024–T047)"
Task: "US4: Standardize data fetching (T048–T057)"
Task: "US5: Accessibility & UX polish (T058–T067)"

# After all stories complete, run polish in parallel:
Task: "Fix GroupsTable.test.tsx mock data (T068)"
Task: "Fix useGroups.test.ts mock data (T069)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (shared utilities)
2. Complete Phase 2: User Story 1 (runtime bug fixes)
3. **STOP and VALIDATE**: Load Groups page and detail page — verify status labels, student counts, navigation, time formats, drop student dialog
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 → Shared utilities ready
2. Phase 2 (US1) → Runtime bugs fixed → **MVP ready!**
3. Phase 3 (US2) → Dead code removed → cleaner codebase
4. Phase 4 (US3) → TypeScript strict, no console leaks → build/lint clean
5. Phase 5 (US4) → All hooks use React Query → constitution compliant
6. Phase 6 (US5) → ARIA, debounce, time normalization → accessible & polished
7. Phase 7 → Tests fixed, build verified → no regressions

### Parallel Team Strategy

With multiple developers:

1. Dev A: Phase 1 (Foundational utilities)
2. After Phase 1: Dev A → US1, Dev B → US2, Dev C → US3, Dev D → US4, Dev E → US5
3. Any available developer: Phase 7 (Polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `npm run build` must pass at every commit
- Test files excluded from `tsc -b` by `tsconfig.app.json` — type errors in tests don't block build
