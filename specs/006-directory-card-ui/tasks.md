# Tasks: Directory Card UI & Pagination Fix

**Input**: Design documents from `/specs/006-directory-card-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Common components: `src/components/common/`
  - Types: `src/api/crm/students/types/`
  - Tests: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new component files needed for the card layout

- [ ] T001 Create directory card component files at `src/components/directory/StudentCard.tsx`
- [ ] T002 [P] Create directory card component files at `src/components/directory/ParentCard.tsx`
- [ ] T003 [P] Create card grid container at `src/components/directory/CardGrid.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix pagination bug and enable page info display. Must be done before card layout to ensure pagination works with the new UI.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Debug pagination data flow: trace `totalStudents` from API via `useStudentsList` → `useDirectoryData` → `DirectoryPage` at `src/pages/DirectoryPage.tsx` — verify `total` from `GET /crm/students` response reaches the `<Pagination>` component correctly
- [ ] T005 [P] Add client-side fallback in `src/api/crm/students/core.ts` (`createPaginationResult`): if `items.length > 0` but `total === 0`, set `total = items.length` as safety net
- [ ] T006 [P] Enable `showTotalInfo={true}` on main tab pagination at `src/pages/DirectoryPage.tsx` (line ~585) so users always see "Page X of Y" text
- [ ] T007 [P] Add total record count display text to `<Pagination>` component at `src/components/common/Pagination.tsx` — show "Showing X-Y of Z records" when `showTotalInfo` is true

**Checkpoint**: Foundation ready — pagination now renders correctly and shows page info. User story implementation can begin.

---

## Phase 3: User Story 1 — Browse via Card Layout (Priority: P1) 🎯 MVP

**Goal**: All directory tabs display records as visual cards instead of table rows. Student cards show name, phone, status, age. Parent cards show name, phone. Cards are responsive (multi-column grid).

**Independent Test**: Load the directory Students tab — verify records render as cards (not table rows) with name, phone, status badge, and age visible. Verify Parents tab shows parent cards. Verify responsive layout by resizing browser width.

**Note**: Enrollment info is omitted from Students tab (only available on Advanced Filter tab via `StudentFilterItem`). Age is computed from `date_of_birth` client-side.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Create `StudentCard` component at `src/components/directory/StudentCard.tsx` — render `full_name` (bold primary), `phone` (with icon, fallback "-"), `status` (colored badge), `age` (computed from `date_of_birth`), and skeleton loading state
- [ ] T009 [P] [US1] Create `ParentCard` component at `src/components/directory/ParentCard.tsx` — render `full_name` (bold primary) and `phone_primary` (with icon), skeleton loading state
- [ ] T010 [P] [US1] Create `CardGrid` component at `src/components/directory/CardGrid.tsx` — responsive CSS grid: 1 col mobile, 2 col tablet, 3 col desktop, 4 col wide
- [ ] T011 [P] [US1] Create card skeleton placeholder at `src/components/directory/shared/CardSkeleton.tsx` — pulsing placeholder matching card dimensions for loading states
- [ ] T012 [US1] Update `DirectoryPage` at `src/pages/DirectoryPage.tsx` — replace `<DataTable>` with `<CardGrid>` + `<StudentCard>` for Students tab
- [ ] T013 [US1] Update `DirectoryPage` at `src/pages/DirectoryPage.tsx` — replace `<DataTable>` with `<CardGrid>` + `<ParentCard>` for Parents tab
- [ ] T014 [US1] Update `DirectoryPage` at `src/pages/DirectoryPage.tsx` — replace `<DataTable>` with `<CardGrid>` + `<StudentCard>` for Waiting tab (status=waiting filter)
- [ ] T015 [US1] Update `DirectoryPage` at `src/pages/DirectoryPage.tsx` — replace `<DataTable>` with `<CardGrid>` + `<StudentCard>` for Advanced Filter tab (use `StudentFilterItem` fields for enrollment info)
- [ ] T016 [US1] Verify AlphabetSlider works with card layout at `src/pages/DirectoryPage.tsx` — letter filter should still filter visible cards
- [ ] T017 [US1] Verify GroupBy selector works with card layout — grouped view should show tab bar with cards per group
- [ ] T018 [US1] Verify Search still works — search results display as cards instead of table rows
- [ ] T019 [US1] Delete `DirectoryColumns.tsx` at `src/components/directory/DirectoryColumns.tsx` — no longer needed

**Checkpoint**: At this point, all tabs display records as cards with correct info. The directory is fully navigable via card clicks.

---

## Phase 4: User Story 2 — Working Pagination (Priority: P1)

**Goal**: Pagination controls are visible when there are enough records for 2+ pages, show "Page X of Y" text, and allow full navigation.

**Independent Test**: With 80+ students and pageSize=25, verify 4 page buttons appear (#1-#4), "Page X of Y" is shown, clicking page 2 loads the next 25 cards, and page number highlights correctly.

**Note**: The pagination fix in Phase 2 already addressed the root cause. This phase verifies integration with the new card layout and ensures the UX meets spec requirements.

### Implementation for User Story 2

- [ ] T020 [P] [US2] Update `Pagination` at `src/components/common/Pagination.tsx` — ensure total page buttons render when `totalPages > 1` and "Page 1 of N" is always visible
- [ ] T021 [US2] Verify pagination renders below card grid at `src/pages/DirectoryPage.tsx` — pagination visible on all tabs (Students, Parents, Waiting) when multi-page data exists
- [ ] T022 [US2] Verify pagination hidden when only 1 page of data — no empty pagination bar showing page 1 of 1
- [ ] T023 [US2] Verify "Show X per page" selector works with card grid — changing page size re-renders correct number of cards

**Checkpoint**: Pagination fully functional with card layout. Users can browse all pages of students and parents.

---

## Phase 5: User Story 3 — Take Action on a Card (Priority: P2)

**Goal**: Each card has visible action buttons (View, Edit, Delete/Restore) allowing CRUD operations directly from the directory.

**Independent Test**: Load the directory, hover/click a student card — see View, Edit, Delete buttons. Click Edit → edit modal opens. Click Delete → confirmation dialog appears. On deleted view, see Restore and Permanently Delete instead.

### Implementation for User Story 3

- [ ] T024 [P] [US3] Add action buttons to `StudentCard` at `src/components/directory/StudentCard.tsx` — View (navigate), Edit (open modal), Delete (confirm dialog)
- [ ] T025 [P] [US3] Add action buttons to `ParentCard` at `src/components/directory/ParentCard.tsx` — View (navigate), Edit (open modal), Delete (confirm dialog)
- [ ] T026 [US3] Handle deleted view in `StudentCard` at `src/components/directory/StudentCard.tsx` — when `isDeleted` prop is true, show Restore and Permanently Delete instead of Edit and Delete
- [ ] T027 [US3] Wire card actions to existing handlers in `DirectoryPage` at `src/pages/DirectoryPage.tsx` — pass `onView`, `onEdit`, `onDelete`, `onRestore`, `onPermanentDelete` callbacks to cards
- [ ] T028 [US3] Verify all action flows work end-to-end: View → navigates to detail page; Edit → modal opens pre-filled; Delete → confirmation → soft delete; Restore → restores student; Permanently Delete → hard delete

**Checkpoint**: Cards are fully interactive with all CRUD actions accessible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure code quality, no regressions, and build passes

- [ ] T029 [P] Remove unused imports of `studentColumns` and `parentColumns` from `src/pages/DirectoryPage.tsx` after removing DataTable usage for directory tabs
- [ ] T030 [P] Remove unused imports of `DataTable` from `src/pages/DirectoryPage.tsx` if no longer used
- [ ] T031 Run `npm run lint` and fix all errors
- [ ] T032 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T033 Run `npm run test` and verify all existing tests still pass
- [ ] T034 Verify no regressions: search, alphabet filter, group-by, create/edit/delete all work correctly with card layout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — creates empty files
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (pagination must work)
- **User Story 1 (Phase 3)**: Depends on Phase 1+2 complete — cards need pagination fix
- **User Story 2 (Phase 4)**: Depends on Phase 1+2 complete — can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Phase 3 (US1) — actions need cards to exist
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1) — Card Layout**: Depends on Foundational. No dependencies on other stories.
- **US2 (P1) — Pagination Fix**: Depends on Foundational. Independent of US1 — can run in parallel.
- **US3 (P2) — Card Actions**: Depends on US1 (cards must exist to add actions).

### Within Each User Story

- API/DTO changes before components
- Sub-components (StudentCard, ParentCard) before container (CardGrid)
- Card components before DirectoryPage integration
- Verification tasks last in each phase

### Parallel Opportunities

- T001, T002, T003 (Setup) can run in parallel
- T005, T006, T007 (Foundational) can run in parallel
- T008, T009, T010, T011 (US1 sub-components) can run in parallel
- US1 (Phase 3) and US2 (Phase 4) can run in parallel after Foundational
- T024, T025 (US3 card actions) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all card components together:
Task: "Create StudentCard in src/components/directory/StudentCard.tsx"
Task: "Create ParentCard in src/components/directory/ParentCard.tsx"
Task: "Create CardGrid in src/components/directory/CardGrid.tsx"
Task: "Create CardSkeleton in src/components/directory/shared/CardSkeleton.tsx"

# After sub-components complete, update DirectoryPage:
Task: "Replace DataTable with CardGrid+Cards in src/pages/DirectoryPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup (create component files)
2. Complete Phase 2: Foundational (fix pagination — critical bug fix)
3. Complete Phase 3: User Story 1 (cards layout — visual redesign)
4. Complete Phase 4: User Story 2 (pagination verification — ensure working with cards)
5. **STOP and VALIDATE**: Verify directory renders cards with working pagination
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Pagination bug fixed, "Page X of Y" visible
2. Add US1 (Card Layout) → Directory shows cards, all tabs work, pagination functional → **MVP ready!**
3. Add US3 (Card Actions) → Each card has View/Edit/Delete buttons
4. Polish → Lint, build, test pass

### Parallel Team Strategy

With multiple developers:

1. Dev A: Phase 1 + Phase 2 (pagination fix — critical path)
2. Dev B: Phase 3 US1 sub-components (StudentCard, ParentCard, CardGrid, CardSkeleton)
3. After Phase 2 done: Dev A → Phase 4 (US2 pagination verification)
4. Dev A + Dev B: Integrate cards into DirectoryPage
5. Either developer: Phase 5 (US3 card actions)
6. Either developer: Phase 6 (polish)

---

## Notes

- No test tasks generated (not explicitly requested in feature spec)
- [P] tasks = different files, no dependencies
- Each user story phase should be independently completable and testable
- Commit after each logical task group
- Stop at any checkpoint to validate independently
- `npm run build` must pass at every commit
- Enrollment info shown only on Advanced Filter tab (where `StudentFilterItem` has `current_group_name`)
- Age computed from `date_of_birth` client-side
