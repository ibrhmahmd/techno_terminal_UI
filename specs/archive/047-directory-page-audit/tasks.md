# Tasks: Directory Page Audit & Fix

**Input**: Design documents from `/specs/047-directory-page-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No Vitest test tasks — relies on Independent Test procedures + build gates (`npm run lint`, `npm run build`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1-US8)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- All changes are to existing files under `src/` — no new files created (except file moves noted).
- **Directory-specific**: `src/pages/DirectoryPage.tsx`, `src/components/directory/`, `src/components/crm/`, `src/components/common/`, `src/hooks/directory/`, `src/hooks/useWaitingList.ts`, `src/api/crm/students/`

---

## Phase 1: Setup (Review Audit Findings)

**Purpose**: Review audit findings and verify baseline build

- [x] T001 Read `specs/047-directory-page-audit/findings-report.md` — understand severity heatmap and per-file scoring
- [x] T002 Read `specs/047-directory-page-audit/spec.md` — understand all 8 user stories and 85 findings
- [x] T003 Run `npm run build` — verify baseline build passes before changes
- [x] T004 Run `npm run lint` — verify baseline lint is clean (29 pre-existing errors, none in directory-related files)

**Checkpoint**: Baseline established. All 85 findings understood.

---

## Phase 2: User Story 1 — Runtime Bug Fix (Priority: P0 Critical)

**Goal**: Fix 1 critical runtime crash and 2 related bugs in directory page flow

**Independent Test**: Open Directory page, create a new student, then edit a student — no crashes. Open waiting tab — waiting count matches API response, not page-scoped value.

### Implementation for User Story 1

- [x] T005 [P] [US1] Guard `editingStudent!` non-null assertion in `src/pages/DirectoryPage.tsx` (~line 1006) — skip submit handler when `editingStudent` is null
- [x] T006 [P] [US1] Remove unhandled `throw new Error()` after `toast.error` in `src/components/directory/hooks/useStudentActions.ts` (~line 116); replace with `return`
- [x] T007 [US1] Replace page-scoped waiting count with dedicated waiting-list query total: update `src/hooks/directory/useDirectoryData.ts` to fetch waiting count and pass to `src/pages/DirectoryPage.tsx`; remove local `waitingCount` state from DirectoryPage

**Checkpoint**: US1 complete — critical crash fixed. Proceed to build/lint validation.

---

## Phase 3: User Story 2 — Dead Code Removal (Priority: P1 High)

**Goal**: Remove 3 unused hooks and 12 dead barrel exports

**Independent Test**: Build passes with zero errors. grep for deleted function names returns no references. No regressions in directory page functionality.

### Implementation for User Story 2

- [x] T008 [P] [US2] Delete `useUpdateStudentStatus`, `useSetWaitingPriority`, `useActivateStudent` from `src/hooks/useWaitingList.ts` — remove function definitions and all internal references; verify `src/hooks/directory/`, `src/components/crm/WaitingListPanel.tsx`, `src/components/crm/WaitingStudentCard.tsx` don't import them
- [x] T009 [P] [US2] Prune 12 unused barrel type re-exports from `src/api/crm/students/index.ts` — already done by 045 fixes (type names don't exist in current barrel)

**Checkpoint**: US2 complete — dead code removed. Build passes.

---

## Phase 4: User Story 3 — TypeScript Safety (Priority: P1 High)

**Goal**: Eliminate 6 unsafe type casts with runtime validation and type guards

**Independent Test**: TypeScript compilation passes with zero errors. All unsafe `as` casts in directory code replaced with validated narrowing.

### Implementation for User Story 3

- [x] T010 [P] [US3] Validate `setFilterGroupBy` cast in `src/hooks/directory/useDirectoryData.ts` — narrow parameter type to `'none' | 'status' | 'age'` and eliminate `as` in the setter call
- [x] T011 [P] [US3] Replace 3 unsafe `as` casts with runtime validation in grouping selectors in `src/hooks/useStudentsGrouped.ts` — already cleaned by 045 fixes (no unsafe casts remain)
- [x] T012 [P] [US3] Remove redundant `as 'status' | 'age'` cast in `src/hooks/directory/useDirectoryData.ts` (~line 138) — removed
- [x] T013 [P] [US3] Narrow `status` prop type or add type guard in `src/components/crm/StudentMobileCard.tsx` — changed `string` to `StudentStatus`
- [x] T014 [P] [US3] Remove redundant cast in `src/components/directory/StudentGroupBySelector.tsx` — replaced `as` with runtime validation via `isValidGroupBy` type guard

**Checkpoint**: US3 complete — all unsafe casts eliminated. Build passes.

---

## Phase 5: User Story 4 — Data Fetching & Cache Patterns (Priority: P2 Medium)

**Goal**: Normalize staleTime, eliminate duplicate fetches, remove ineffective cache invalidation

**Independent Test**: Open directory page, observe network tab — no duplicate waiting-list requests when waiting tab is active. All useDirectory/useWaiting list hooks have staleTime: 3min.

### Implementation for User Story 4

- [x] T015 [P] [US4] Normalize `staleTime` from 2min to 3min in `src/hooks/useWaitingList.ts` and `src/hooks/directory/useDirectory.ts` — find all query options with `staleTime: 120000` and change to `180000` (or `1000 * 60 * 3`)
- [x] T016 [US4] Eliminate duplicate waiting-list fetch when waiting tab is active in `src/components/crm/WaitingListPanel.tsx` — ensure the waiting query is enabled only when the tab is active and not already fetched by parent; remove redundant `refetch()` or `enabled` condition
- [x] T017 [US4] Remove redundant/ineffective `queryKeys.studentsAll` invalidation in `src/pages/DirectoryPage.tsx` — check which mutations call this and whether the invalidation is duplicated by more specific key invalidation

**Checkpoint**: US4 complete — cache consistency improved. Build passes.

---

## Phase 6: User Story 5 — Accessibility (Priority: P1 High)

**Goal**: Fix 10 a11y gaps: focus-visible rings, aria attributes, heading typography, error boundaries

**Independent Test**: Keyboard-navigate entire directory page — all interactive elements show visible focus rings. Screen reader announces heading hierarchy. Tab panels don't crash parent page on error (ErrorBoundary catches). Decorative icons are skipped by screen readers.

### Implementation for User Story 5

- [x] T018 [P] [US5] Add `focus-visible:ring-2 focus-visible:ring-cyan-400/70` to SearchBar input in `src/components/common/SearchBar.tsx` and AlphabetSlider letter buttons in `src/components/directory/AlphabetSlider.tsx`
- [x] T019 [P] [US5] Add `focus-visible:ring-2 focus-visible:ring-cyan-400/70` to `src/components/directory/StudentCard.tsx`, `src/components/directory/ParentCard.tsx`, `src/components/directory/StudentGroupBySelector.tsx`, `src/components/crm/WaitingStudentCard.tsx`
- [x] T020 [P] [US5] Add `font-headline` (Space Grotesk) class to 4 heading elements: Waiting List `<h2>` in `src/components/crm/WaitingListPanel.tsx`, `<h3>` in `src/components/crm/StudentMobileCard.tsx`, `<h3>` in `src/components/crm/ParentMobileCard.tsx`, `<h3>` in `src/components/crm/WaitingStudentCard.tsx`
- [x] T021 [P] [US5] Add `aria-hidden="true"` to 3 decorative icon spans/elements: SearchBar icon in `src/components/common/SearchBar.tsx`, student icon and parent icon in `src/components/crm/StudentMobileCard.tsx`
- [x] T022 [P] [US5] Add `aria-controls` to MetricsStripCards tab buttons and `aria-orientation="horizontal"` to tablist container in `src/components/common/MetricsStripCards.tsx`
- [x] T023 [US5] Wrap each tab panel in `src/pages/DirectoryPage.tsx` with a React `<ErrorBoundary>` component — import or create a minimal ErrorBoundary wrapper if one doesn't exist as a shared component

**Checkpoint**: US5 complete — keyboard accessibility and screen reader support improved. Build passes.

---

## Phase 7: User Story 6 — React Performance (Priority: P1 High)

**Goal**: 16 performance improvements: parallel operations, direct imports, useMemo, Map lookups, lazy loading

**Independent Test**: Profile create-student flow — `linkParentToStudent` and `logActivity` fire in parallel. HMR updates during development are noticeably faster (direct imports). Re-renders of student list don't recompute filter/sort unnecessarily.

### Implementation for User Story 6

- [x] T024 [P] [US6] Parallelize independent `linkParentToStudent`/`logActivity` post-creation operations with `Promise.all` in `src/pages/DirectoryPage.tsx` `handleCreateStudent` function — wrap the two sequential `await` calls in `Promise.all`
- [x] T025 [US6] Replace barrel imports with direct module paths in 8 files: `src/pages/DirectoryPage.tsx`, `src/components/crm/WaitingListPanel.tsx`, `src/components/directory/AdvancedSearchPanel.tsx`, `src/components/directory/StudentCard.tsx`, `src/components/directory/ParentCard.tsx`, `src/components/directory/StudentGroupBySelector.tsx`, `src/hooks/directory/useDirectoryData.ts`, `src/components/common/SearchBar.tsx` — remove `from '@/api/crm/students'` barrel imports and replace with direct path imports to individual modules
- [x] T026 [P] [US6] Replace `Array.some` + `Array.find` O(2n) lookups with `Map`-based lookup in 3 instances in `src/pages/DirectoryPage.tsx` — build a `Map<id, item>` once and use `.get()` for repeated lookups in grouped data processing
- [x] T027 [P] [US6] Add `useMemo` for 4 computations: `displayStudents` in `src/pages/DirectoryPage.tsx`, `hasActiveFilters` in `src/hooks/directory/useAdvancedSearch.ts`, `filteredStudents` in `src/pages/DirectoryPage.tsx`, `options` in `src/components/directory/StudentGroupBySelector.tsx`
- [x] T028 [P] [US6] Lazy-load `EnrollPanel`, `StudentForm`, `ParentForm` in `src/pages/DirectoryPage.tsx` using `React.lazy(() => import(...))` — wrap each in `<Suspense>` with a fallback skeleton
- [x] T029 [US6] Hoist `PANEL_ORDER` constant to module scope in `src/pages/DirectoryPage.tsx` (outside component) and replace `useState` initializer for panel state with lazy initializer: `useState(() => initialValue)`

**Checkpoint**: US6 complete — performance improvements applied. Build passes.

---

## Phase 8: User Story 7 — Architecture Compliance (Priority: P1 High)

**Goal**: Move misplaced hook to correct directory, fix barrel exports, align naming conventions

**Independent Test**: grep for imports of `useStudentActions` — all point to `src/hooks/directory/useStudentActions`. Barrel exports from `src/api/crm/students/index.ts` include `isStudentListItem` and `toStudentListItem`. Build passes.

### Implementation for User Story 7

- [x] T030 [US7] Move `useStudentActions` from `src/components/directory/hooks/useStudentActions.ts` to `src/hooks/directory/useStudentActions.ts` — physically move the file; update all import paths in `src/pages/DirectoryPage.tsx` and any other consumers; clean up the now-empty `src/components/directory/hooks/` directory if empty
- [x] T031 [P] [US7] Add missing `isStudentListItem` type guard and `toStudentListItem` converter function to barrel exports in `src/api/crm/students/index.ts` — ensure both are included as named exports from `src/api/crm/students/utils.ts` and re-exported via the barrel
- [x] T032 [P] [US7] Review and fix component naming suffixes that have drifted from convention in `src/components/directory/` — identify components whose suffix doesn't match their role (e.g., Panel→Form, Slider→Nav, Selector→Select) and either rename files or extend the naming convention documentation

**Checkpoint**: US7 complete — module placement follows architecture. Build passes.

---

## Phase 9: User Story 8 — UI Polish & Design System (Priority: P1 High)

**Goal**: 19 UI fixes: contrast, spacing tokens, motion preferences, hover states, semantic HTML

**Independent Test**: Check disabled StudentGroupBySelector button — text has sufficient contrast (≥3:1 against background). All spacing values are standard Tailwind tokens. `animate-pulse` pauses when `prefers-reduced-motion` is set. Mobile cards have hover states on desktop. Navigation links in mobile cards are `<a>` elements.

### Implementation for User Story 8

- [x] T033 [P] [US8] Fix disabled button contrast in `src/components/directory/StudentGroupBySelector.tsx` — change disabled text color from ~1.5:1 ratio to a color meeting WCAG AA minimum (e.g., `text-slate-400` → `text-slate-500` or add a semi-transparent overlay)
- [x] T034 [US8] Fix 6 non-standard spacing values across directory components: `h-7`→`h-8` in `src/components/directory/AlphabetSlider.tsx`, `p-1.5`→`p-2` in `src/pages/DirectoryPage.tsx`, `gap-2.5`→`gap-3` in `src/components/directory/AdvancedSearchPanel.tsx`, `py-1.5`→`py-2` in `src/pages/DirectoryPage.tsx`, `gap-1.5`→`gap-2` in `src/pages/DirectoryPage.tsx`
- [x] T035 [P] [US8] Add `motion-safe:` prefix to `animate-pulse` in `src/components/directory/shared/CardSkeleton.tsx` and `src/components/crm/WaitingListPanel.tsx` — change `animate-pulse` to `motion-safe:animate-pulse`
- [x] T036 [P] [US8] Fix low-contrast grade text in `src/components/crm/StudentMobileCard.tsx` — change `text-slate-400` to `text-slate-500`
- [x] T037 [P] [US8] Add hover states (`hover:bg-slate-50` or equivalent) to `src/components/crm/StudentMobileCard.tsx` and `src/components/crm/ParentMobileCard.tsx`
- [x] T038 [P] [US8] Fix chevron icon contrast (`text-slate-300`→`text-slate-400`) in mobile card navigation elements, and instructor icon contrast in `src/components/crm/StudentMobileCard.tsx`
- [x] T039 [P] [US8] Replace `<button>` with `<a>` for navigation in `src/components/crm/StudentMobileCard.tsx` and `src/components/crm/ParentMobileCard.tsx` — use `<Link>` (React Router) or `<a>` with proper `href` for navigation actions; add `role="button"` if styling requires button appearance
- [x] T040 [P] [US8] Add `motion-safe:` prefix guard to `transition-all` classes in `src/components/directory/AdvancedSearchPanel.tsx` filter cards — change `transition-all duration-300` to `motion-safe:transition-all motion-safe:duration-300`

**Checkpoint**: US8 complete — design system alignment achieved. Build passes.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that all changes compile, lint, and work together

- [x] T041 Run `npm run lint` — fix any lint errors introduced across all changes
- [x] T042 Run `npm run build` — verify `tsc -b && vite build` passes with zero errors
- [x] T043 Execute full Independent Test procedure from `quickstart.md` — verify all 9 test scenarios pass

**Checkpoint**: All 85 findings addressed. Build clean. Ready for commit.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — read findings first
- **US1 (Phase 2, P0)**: No blocking dependencies — can start immediately after Setup
- **US2 (Phase 3, P1)**: No dependencies on other user stories — fully independent
- **US3 (Phase 4, P1)**: No dependencies on other user stories — fully independent
- **US4 (Phase 5, P2)**: No dependencies on other user stories — fully independent
- **US5 (Phase 6, P1)**: No dependencies on other user stories — fully independent
- **US6 (Phase 7, P1)**: No dependencies on other user stories — fully independent
- **US7 (Phase 8, P1)**: No dependencies on other user stories — fully independent
- **US8 (Phase 9, P1)**: No dependencies on other user stories — fully independent
- **Polish (Phase 10)**: Depends on ALL user stories being complete

### User Story Dependencies

- All user stories (US1-US8) are **fully independent** of each other — they touch different files and concerns
- **US1 (P0)** should be done first due to critical severity
- **No story blocks another story**

### Within Each User Story

- Tasks marked **[P]** can be done in parallel within the same story
- Build/lint validation after each story
- Story complete before moving to next phase (sequential recommended)

### Parallel Opportunities

- **US2 through US8 can all be implemented in parallel** (different files, no cross-dependencies)
- Within each story, **[P]** tasks can run in parallel
- All spacing fixes (T034) should be done together to avoid partial-state issues
- The barrel import fix (T025) may conflict with other changes to the same files — do it first or last within each affected story

---

## Parallel Example: User Stories

```bash
# US1 (critical — do first, all tasks in sequence):
Task: T005 — Guard editingStudent! null assertion in DirectoryPage.tsx
Task: T006 — Remove throw new Error() in useStudentActions.ts
Task: T007 — Replace scoped waiting count with dedicated query

# US2 (independent — parallel with US3-US8):
Task: T008 — Delete 3 dead hooks from useWaitingList.ts
Task: T009 — Prune 12 unused barrel exports

# US5 (independent — parallel with US2-US8):
Task: T018 — Add focus-visible rings (SearchBar, AlphabetSlider)
Task: T019 — Add focus-visible rings (4 components)
Task: T020 — Add font-headline to 4 headings
Task: T021 — Add aria-hidden to decorative icons
Task: T022 — Add aria-controls to MetricsStripCards
Task: T023 — Wrap tab panels with ErrorBoundary

# US6 (independent — T025 may conflict with other files):
Task: T024 — Promise.all post-creation
Task: T025 — Barrel→direct imports (8 files — do first or resolve conflicts)
Task: T026 — Map-based lookups
Task: T027 — Add useMemo
Task: T028 — React.lazy imports
Task: T029 — Hoist PANEL_ORDER
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: US1 (critical runtime bug fix)
3. **STOP and VALIDATE**: Test US1 independently — no more crashes
4. Deploy or continue

### Individual Story Delivery (Recommended)

1. Complete Setup → Foundation ready
2. Complete US1 → Test → Build passes (MVP!)
3. Complete US2 → Test → Build passes
4. Complete US3 → Test → Build passes
5. Complete US4 → Test → Build passes
6. Complete US5 → Test → Build passes
7. Complete US6 → Test → Build passes
8. Complete US7 → Test → Build passes
9. Complete US8 → Test → Build passes
10. Polish phase → Final build validation

### Parallel Team Strategy

With multiple developers:
1. One developer: US1 (critical — highest priority, gather context for rest)
2. Developer A: US2 (dead code) + US3 (TS safety)
3. Developer B: US4 (data fetch) + US8 (UI polish)
4. Developer C: US5 (a11y) + US7 (architecture)
5. Developer D: US6 (performance — most complex)
6. All finish → Polish phase validation

---

## Notes

- **[P] tasks** = different files, no dependencies within phase
- **[Story] label** maps task to specific user story for traceability
- **Each user story** is independently completable and testable — verify with Independent Test criteria
- **Build/lint validation** after each story before moving on
- **No new files** created — all changes modify existing files (except file move T030)
- **No new Vitest tests** — use Independent Test procedures + build gates
