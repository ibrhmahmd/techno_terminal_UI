# Tasks: Courses & Competitions Card Layout

**Input**: Design documents from `/specs/008-extend-card-layout/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Common components: `src/components/common/`
  - Reusable containers: `src/components/directory/` (CardGrid, CardSkeleton)
  - Reusable toggle: `src/components/groups/ViewToggle.tsx`
  - Types: `src/api/academics/types/courses/`, `src/api/competitions/types.ts`

---

## Phase 1: Setup (New Component Files)

**Purpose**: Create empty scaffold files for new components

- [ ] T001 [P] Create `src/components/courses/CourseCard.tsx`
- [ ] T002 [P] Create `src/components/courses/CoursesTable.tsx`
- [ ] T003 [P] Create `src/components/courses/index.ts`
- [ ] T004 [P] Create `src/components/competitions/CompetitionColumns.tsx`
- [ ] T005 [P] Create `src/components/competitions/CompetitionsTable.tsx`
- [ ] T006 [P] Create `src/components/competitions/index.ts`

---

## Phase 2: User Story 1 — Browse Courses as Cards (Priority: P1) 🎯 MVP

**Goal**: Courses page gets a view toggle (table/cards). Card view shows course name, category badge, price per level, sessions per level, active status. Table view remains unchanged but columns extracted to CoursesTable.

**Independent Test**: Load the Courses page. Click the "Cards" toggle — verify courses render as cards with name, category, price per level, sessions per level, and active status visible. Click "Table" toggle — verify table view still works. Verify responsive layout by resizing browser.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Implement `CourseCard` at `src/components/courses/CourseCard.tsx` — render course name (bold primary), category (pill badge, fallback "Uncategorised"), price per level (formatted), sessions per level (numeric), active status (colored badge via inline styling matching GroupStatusBadge pattern), skeleton loading state (reuse CardSkeleton), and action buttons (reuse RowActions: View, Edit, Delete)
- [ ] T008 [P] [US1] Implement `CoursesTable` at `src/components/courses/CoursesTable.tsx` — extract inline column definitions from `src/pages/CoursesPage.tsx` into a reusable `DataTableColumn<Course>[]` export, wrap in a DataTable with standard actions (view/edit/delete)
- [ ] T009 [US1] Update `src/pages/CoursesPage.tsx` — add `viewMode` state (`'table' | 'cards'`, default `'table'`), import and render `ViewToggle` from `../components/groups/ViewToggle` in the header area, import `CourseCard` + `CardGrid`, conditionally render `<CardGrid>` + `<CourseCard>` (flat) or `<CoursesTable>` based on viewMode. When loading in card mode, render CardSkeleton placeholders via CardGrid. Remove the inline column definitions (now in CoursesTable).

**Checkpoint**: Courses page has working table/cards toggle. Card view shows all courses with correct info. Table view remains unchanged.

---

## Phase 3: User Story 2 — Browse Competitions with Table/Card Toggle (Priority: P1)

**Goal**: Competitions page gets a table view alongside the existing card grid. View toggle switches between card grid and DataTable. Deleted competitions also render as a table in table mode.

**Independent Test**: Load the Competitions page. Click the "Table" toggle — verify competitions render as a table with name, location, date, edition, fee per student. Click "Cards" toggle — verify original card grid still works. Toggle trash while in table mode — verify deleted competitions show as a table.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Implement `CompetitionColumns` at `src/components/competitions/CompetitionColumns.tsx` — define `DataTableColumn<Competition>[]` with columns for name, location, competition_date (formatted or "—"), edition (fallback "—"), fee_per_student (formatted currency), and deleted status indicator
- [ ] T011 [P] [US2] Implement `CompetitionsTable` at `src/components/competitions/CompetitionsTable.tsx` — wrap a DataTable with CompetitionColumns, standard actions (view: navigate to detail, edit: open form, delete: confirm dialog), empty state for no data
- [ ] T012 [US2] Update `src/pages/CompetitionsPage.tsx` — add `viewMode` state (`'table' | 'cards'`, default `'cards'` to preserve existing behavior), import and render `ViewToggle` in the header area, conditionally render `CompetitionsTable` or existing card grid based on viewMode. When in table mode and showing deleted competitions, render the DataTable with deleted data instead of the current card-only deleted view.

**Checkpoint**: Competitions page has working table/cards toggle. Table view shows competitions with correct info. Deleted view works in both modes. Card view unchanged.

---

## Phase 4: User Story 3 — Audit and Clean Up (Priority: P2)

**Goal**: Fix bugs, remove dead code, migrate deprecated patterns found during audit of Courses and Competitions pages.

**Independent Test**: Run the build and lint — verify zero errors. Verify table view on Courses page still works. Verify card view on Competitions page still works. Verify all CRUD operations on both pages still work. Verify restore on CompetitionDetailPage actually restores.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Remove unused imports and dead code — remove `UpdateCompetitionInput` from `src/pages/CompetitionsPage.tsx`, remove dead `handleInputChange` function from `src/components/competitions/CompetitionForm.tsx`, remove unused destructured props (`competitionId`, `canManage`) from `src/components/competitions/CategoryList.tsx`
- [ ] T014 [P] [US3] Remove debug `console.log` statements from `src/components/competitions/CompetitionForm.tsx` (lines 58, 61) and `src/components/courses/CourseForm.tsx` (lines 60, 62)
- [ ] T015 [P] [US3] Fix restore modal in `src/pages/CompetitionDetailPage.tsx` — wire `restore()` from `useCompetition` hook to the confirm button in the restore confirmation dialog (currently just closes the modal without calling the API)
- [ ] T016 [P] [US3] Migrate `src/hooks/competitions/useCompetition.ts` from `useState`/`useEffect` to React Query (`useQuery` + `useMutation`) — consolidate fetch, update, delete, restore into a single React Query hook. Update consumers (`CompetitionDetailPage.tsx`, `CompetitionEditPage.tsx`) to use the new API.
- [ ] T017 [P] [US3] Migrate `src/hooks/competitions/useCompetitionCategories.ts` from `useState`/`useEffect` to React Query (`useQuery`) — use `queryKeys.competitionCategories` key factory. Update consumers to use the new API.

**Checkpoint**: All identified bugs fixed. Dead code removed. Deprecated hooks migrated to React Query. Build passes.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Ensure code quality, no regressions, and build passes

- [ ] T018 [P] Remove any unused imports from modified files
- [ ] T019 Run `npm run lint` and fix all errors (ensure zero new errors)
- [ ] T020 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T021 Verify no regressions: Courses table view still works, Competitions card view still works, search and CRUD via both views on both pages still work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — creates empty files
- **US1 (Phase 2)**: Depends on Phase 1 — creates CourseCard, CoursesTable, and updates CoursesPage
- **US2 (Phase 3)**: Depends on Phase 1 — creates CompetitionColumns, CompetitionsTable, and updates CompetitionsPage
- **US3 (Phase 4)**: Depends on Phase 1 + Phase 3 — cleans up files that US2 also modifies (CompetitionsPage)
- **Polish (Phase 5)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1) — Courses Card View**: Depends on Setup. No dependencies on other stories.
- **US2 (P1) — Competitions Table View**: Depends on Setup. No dependencies on other stories. Can run in parallel with US1.
- **US3 (P2) — Cleanup**: Depends on US2 (CompetitionsPage cleanup overlaps with US2 changes). Independent of US1.

### Within Each User Story

- Sub-components before page integration
- Card/table components before page updates
- Verification tasks last in each phase

### Parallel Opportunities

- T001 through T006 (Setup) can run in parallel
- T007, T008 (US1 sub-components) can run in parallel
- T010, T011 (US2 sub-components) can run in parallel
- US1 (Phase 2) and US2 (Phase 3) can run in parallel (different pages, different components)
- T013, T014, T015, T016, T017 (US3 cleanup) can run in parallel
- T018 (Polish) can run in parallel with other Polish tasks

---

## Parallel Example: User Story 1

```bash
# Launch both sub-components together:
Task: "Implement CourseCard in src/components/courses/CourseCard.tsx"
Task: "Implement CoursesTable in src/components/courses/CoursesTable.tsx"

# After sub-components complete, update CoursesPage:
Task: "Update CoursesPage with viewMode state and conditional card/table rendering"
```

## Parallel Example: User Story 2

```bash
# Launch both sub-components together:
Task: "Implement CompetitionColumns in src/components/competitions/CompetitionColumns.tsx"
Task: "Implement CompetitionsTable in src/components/competitions/CompetitionsTable.tsx"

# After sub-components complete, update CompetitionsPage:
Task: "Update CompetitionsPage with viewMode state and conditional table/card rendering"
```

---

## Implementation Strategy

### MVP First (User Story 1 — Courses Cards)

1. Complete Phase 1: Setup (create component files)
2. Complete Phase 2: User Story 1 (CourseCard + CoursesPage card view)
3. **STOP and VALIDATE**: Verify Courses page shows cards with toggle, card view works, responsive layout works
4. Deploy/demo if ready

### Incremental Delivery

1. Setup → New component files available
2. Add US1 (Courses Card View) → Users can toggle Courses between table and cards → **MVP ready!**
3. Add US2 (Competitions Table View) → Users can toggle Competitions between cards and table
4. Add US3 (Cleanup) → Dead code removed, bugs fixed, deprecated patterns migrated
5. Polish → Lint, build, verify

### Parallel Team Strategy

With multiple developers:

1. Dev A: Phase 1 + Phase 2 (Courses card view)
2. Dev B: Phase 1 + Phase 3 (Competitions table view)
3. Either developer: Phase 4 (cleanup) after Phase 3
4. Either developer: Phase 5 (polish)

---

## Notes

- No test tasks generated (not explicitly requested in feature spec)
- [P] tasks = different files, no dependencies
- Each user story phase should be independently completable and testable
- ViewToggle reused from `src/components/groups/ViewToggle.tsx` — no changes needed
- CardGrid reused from `src/components/directory/CardGrid.tsx` — no changes needed
- CardSkeleton reused from `src/components/directory/shared/CardSkeleton.tsx` — no changes needed
- RowActions reused from `src/components/common/RowActions.tsx` — no changes needed
- `npm run build` must pass at every commit
- Stop at any checkpoint to validate independently
