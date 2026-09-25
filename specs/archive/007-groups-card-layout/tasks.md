# Tasks: Groups Card Layout

**Input**: Design documents from `/specs/007-groups-card-layout/`
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
  - Types: `src/api/academics/types/groups/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new component files needed for the card layout

- [x] T001 Create `src/components/groups/GroupCard.tsx`
- [x] T002 [P] Create `src/components/groups/ViewToggle.tsx`
- [x] T003 [P] Create `src/components/groups/GroupCardGrid.tsx`
- [x] T004 [P] Create `src/components/groups/GroupCategoryTabs.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build view toggle and card grid wrapper that every user story depends on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 [P] Implement `ViewToggle` at `src/components/groups/ViewToggle.tsx` — segmented pill control with `table_rows` and `grid_view` icons, matching GroupBySelector styling
- [x] T006 [P] Implement `GroupCardGrid` at `src/components/groups/GroupCardGrid.tsx` — wraps `CardGrid` (from `src/components/directory/`) with skeleton loading state (reuse `CardSkeleton`) and empty state with icon/message

**Checkpoint**: Foundation ready — ViewToggle and GroupCardGrid available. User story implementation can begin.

---

## Phase 3: User Story 1 — Browse Groups as Cards (Priority: P1) 🎯 MVP

**Goal**: Groups display as visual cards in a flat (non-grouped) view. Staff can toggle between table and cards via ViewToggle. Cards show group name, course, instructor, schedule, capacity, and status.

**Independent Test**: Load the Groups page, click the "Cards" toggle — verify groups render as cards with name, course, instructor, schedule, capacity, and status visible. Click "Table" toggle — verify table view still works. Verify responsive layout by resizing browser.

**Note**: Action buttons (View, Edit, Delete) NOT yet required — this story focuses on read-only display. Actions come in US3.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create `GroupCard` component at `src/components/groups/GroupCard.tsx` — render group name (bold primary), course (pill badge), instructor (fallback "Unassigned"), schedule (day + time), capacity (current_student_count / max_capacity with icon), status (via `GroupStatusBadge`), and skeleton loading state
- [x] T008 [P] [US1] Export new components from `src/components/groups/index.ts` (GroupCard, ViewToggle, GroupCardGrid, GroupCategoryTabs)
- [x] T009 [US1] Update `src/pages/GroupsPage.tsx` — add `viewMode` state (`'table' | 'cards'`, default `'table'`), render `ViewToggle` in GroupBySelector bar, conditionally render `<CardGrid>` + `<GroupCard>` (flat) or `<DataTable>` based on viewMode

**Checkpoint**: At this point, users can toggle between table and card views. Flat card view shows all groups with correct info. Card layout is responsive.

---

## Phase 4: User Story 2 — Grouped Card View (Priority: P2)

**Goal**: When a grouping option is selected (Day, Course, Instructor, Status, Competition) and card view is active, groups appear in category tabs with cards beneath the active tab.

**Independent Test**: Select "Day" from the GroupBySelector while in card view — verify category tabs appear with day names, cards under active tab show groups for that day, clicking different tab updates cards.

**Note**: Grouped view renders the card grid inside the active category tab. The `GroupCategoryTabs` component provides the dark-themed tab bar (matching DirectoryPage grouped view pattern).

### Implementation for User Story 2

- [x] T010 [P] [US2] Implement `GroupCategoryTabs` at `src/components/groups/GroupCategoryTabs.tsx` — dark-themed horizontal tab bar with category label + count badge, active state highlighting
- [x] T011 [US2] Update `src/pages/GroupsPage.tsx` — when `isGroupedView && viewMode === 'cards'`, render `<GroupCategoryTabs>` above `<CardGrid>` with `<GroupCard>`, passing active category state

**Checkpoint**: Grouped card view works for all grouping options (Day, Course, Instructor, Status, Competition). Users can navigate categories via tabs.

---

## Phase 5: User Story 3 — Take Action on Group Cards (Priority: P3)

**Goal**: Each group card has visible action buttons (View, Edit, Delete) allowing CRUD operations directly from the card view.

**Independent Test**: Load the Groups page in card view — see View, Edit, Delete buttons on each card. Click View → navigates to `/groups/:id`. Click Edit → edit modal opens. Click Delete → confirmation dialog appears.

**Note**: All action handlers already exist in `GroupsPage.tsx` (`handleView`, `handleEdit`, `handleDeleteClick`). This phase wires them to the card.

### Implementation for User Story 3

- [x] T012 [US3] Add action buttons to `GroupCard` at `src/components/groups/GroupCard.tsx` — View (navigate), Edit (open modal), Delete (confirm dialog) using `RowActions` from `src/components/common/RowActions.tsx`
- [x] T013 [US3] Wire card actions to existing handlers in `src/pages/GroupsPage.tsx` — pass `onView`, `onEdit`, `onDelete` callbacks to GroupCard

**Checkpoint**: Cards are fully interactive with all CRUD actions accessible directly from card view.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure code quality, no regressions, and build passes

- [x] T014 [P] Remove any unused imports from `src/pages/GroupsPage.tsx` after adding card view logic
- [x] T015 Run `npm run lint` and fix all errors
- [x] T016 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [x] T017 Verify no regressions: table view still works, grouping still works, search still works, CRUD via table view still works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — creates empty files
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 1+2 — creates GroupCard + integrates flat card view
- **User Story 2 (Phase 4)**: Depends on Phase 3 (US1) — needs GroupCard and GroupsPage with card mode
- **User Story 3 (Phase 5)**: Depends on Phase 3 (US1) — needs GroupCard to add actions
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1) — Flat Card View**: Depends on Foundational. No dependencies on other stories.
- **US2 (P2) — Grouped Card View**: Depends on US1 (needs GroupCard + GroupsPage card integration).
- **US3 (P3) — Card Actions**: Depends on US1 (needs GroupCard to exist). Independent of US2 — can run in parallel.

### Within Each User Story

- Sub-components before page integration
- Card components (GroupCard) before container (GroupCardGrid)
- Verification tasks last in each phase

### Parallel Opportunities

- T001, T002, T003, T004 (Setup) can run in parallel
- T005, T006 (Foundational) can run in parallel
- T007, T008 (US1 sub-components) can run in parallel
- US2 (Phase 4) and US3 (Phase 5) can run in parallel after US1 completes
- T014 (Polish) can run in parallel with other Polish tasks

---

## Parallel Example: User Story 1

```bash
# Launch all card components together:
Task: "Create GroupCard in src/components/groups/GroupCard.tsx"
Task: "Export new components from src/components/groups/index.ts"

# After sub-components complete, update GroupsPage:
Task: "Update GroupsPage with viewMode state and conditional card rendering"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup (create component files)
2. Complete Phase 2: Foundational (ViewToggle, GroupCardGrid)
3. Complete Phase 3: User Story 1 (GroupCard + flat card view)
4. **STOP and VALIDATE**: Verify Groups page shows cards with toggle, flat view works, responsive layout works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → ViewToggle and GroupCardGrid available
2. Add US1 (Flat Card View) → Users can toggle between table and cards, cards display correctly → **MVP ready!**
3. Add US2 (Grouped Card View) → Grouping works in card mode with category tabs
4. Add US3 (Card Actions) → Each card has View/Edit/Delete buttons
5. Polish → Lint, build, verify

### Parallel Team Strategy

With multiple developers:

1. Dev A: Phase 1 + Phase 2 (setup + foundational — critical path)
2. Dev B: Phase 3 US1 (GroupCard component)
3. After Phase 3 done: Dev A → Phase 4 (US2 grouped card view), Dev B → Phase 5 (US3 card actions)
4. Either developer: Phase 6 (polish)

---

## Notes

- No test tasks generated (not explicitly requested in feature spec)
- [P] tasks = different files, no dependencies
- Each user story phase should be independently completable and testable
- CardGrid reused from `src/components/directory/CardGrid.tsx` — no changes needed
- CardSkeleton reused from `src/components/directory/shared/CardSkeleton.tsx` — no changes needed
- RowActions reused from `src/components/common/RowActions.tsx` — no changes needed
- GroupStatusBadge reused from `src/components/groups/shared/GroupStatusBadge.tsx` — no changes needed
- `npm run build` must pass at every commit
- Stop at any checkpoint to validate independently
