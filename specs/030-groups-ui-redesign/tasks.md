# Tasks: Groups UI Controls Redesign

**Input**: Design documents from `/specs/030-groups-ui-redesign/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested in spec. Visual verification per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/`
  - Common components: `src/components/common/`
- Both modified files are in `src/components/groups/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks required — this feature modifies existing files only.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

No foundational tasks required — no new API calls, hooks, or types needed. Both stories directly modify existing components.

---

## Phase 3: User Story 1 — Group View Selector with Consistent Visual Design (Priority: P1) 🎯 MVP

**Goal**: Restyle the GroupBySelector to match the dashboard DaySelectorBar's blue-themed segmented pill design.

**Independent Test**: Open `/groups`, verify the toggle pills use `bg-blue-50 border border-blue-100` container and active pill shows `bg-white shadow-sm font-bold border border-blue-200`. ArrowLeft/Right keyboard navigation still works.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Update GroupBySelector container styling in `src/components/groups/GroupBySelector.tsx` — replace `bg-slate-100 rounded-lg p-1` with `bg-blue-50 border border-blue-100 rounded-lg p-1`
- [ ] T002 [P] [US1] Update GroupBySelector active button styling in `src/components/groups/GroupBySelector.tsx` — add `border border-blue-200` to the active button class list (alongside existing `bg-white text-secondary shadow-sm font-bold`)
- [ ] T003 [US1] Update GroupBySelector inactive button styling in `src/components/groups/GroupBySelector.tsx` — change inactive hover from `hover:bg-white/50` to `hover:bg-white/70` (matching DaySelectorBar)

**Checkpoint**: At this point, User Story 1 should be fully functional. The GroupBy selector now visually matches the dashboard DaySelectorBar.

---

## Phase 4: User Story 2 — Filter Panel with Category Pill Design (Priority: P1)

**Goal**: Replace GroupFilters multi-select dropdowns with FilterPill horizontal category pills and expandable panels, matching the student directory AdvancedSearchPanel pattern.

**Independent Test**: Open `/groups`, click "Filters" button. Verify horizontal FilterPill row appears with 5 category pills (Course, Instructor, Level, Day, Status). Click each pill — verify correct controls appear. Select values — verify count badges and ActiveFilterTagsList update.

### Implementation for User Story 2

- [ ] T004 [P] [US2] Import `FilterPill` from `src/components/common/FilterPill.tsx` at the top of `src/components/groups/GroupFilters.tsx`
- [ ] T005 [P] [US2] Define filter category config (label, icon, id) as a constant array in `src/components/groups/GroupFilters.tsx` — entries: Course (`menu_book`), Instructor (`person`), Level (`layers`), Day (`calendar_today`), Status (`flag`)
- [ ] T006 [US2] Add `expandedCategory` state (`string | null`) and toggle handler to `src/components/groups/GroupFilters.tsx` — clicking a pill sets it as expanded; clicking it again or a different pill collapses/expands
- [ ] T007 [P] [US2] Replace the multi-select grid section in `src/components/groups/GroupFilters.tsx` with a row of `FilterPill` components iterating over the category config — wire `icon`, `label`, `isExpanded`, `filterCount`, and `onClick` props
- [ ] T008 [US2] Render an expandable panel div (`bg-slate-50 rounded-xl p-4 border border-slate-200`) below the pill row when `expandedCategory` is set, containing category-specific controls:
  - **Course**: Search input + checkbox list from `useCourses()` data
  - **Instructor**: Search input + checkbox list from `useEmployees()` data
  - **Day**: Toggle pill buttons for Mon–Sun (reuse AdvancedSearchPanel toggle button styling: `rounded-full bg-secondary text-white` / `bg-white text-slate-600 border border-slate-200`)
  - **Level**: Toggle pill buttons for 1–8 (same styling)
  - **Status**: Toggle pill buttons for Active, Inactive, Archived (same styling)
- [ ] T009 [US2] Wire count badges — compute `getFilterCount(categoryId)` function in `src/components/groups/GroupFilters.tsx` that returns count of active filter values for each category, pass as `filterCount` prop to `FilterPill`
- [ ] T010 [US2] Preserve "Reset Defaults" button in the expanded panel footer area in `src/components/groups/GroupFilters.tsx` — calls the same reset logic as before
- [ ] T011 [US2] Remove the old multi-select `<select>` grid code from `src/components/groups/GroupFilters.tsx` and clean up unused imports

**Checkpoint**: At this point, User Story 2 should be fully functional. The filter panel now uses FilterPill horizontal pills with expandable panels, matching the student directory pattern.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification that both stories work together without regressions.

- [ ] T012 [P] Run `npm run lint` and fix all errors
- [ ] T013 [P] Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T014 [P] Run `npm run test` and verify existing tests pass
- [ ] T015 Perform visual verification per `specs/030-groups-ui-redesign/quickstart.md` — check GroupBy blue theme, filter pill row, expandable panels, toggle buttons, count badges, active filter tags

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Skipped — no setup needed
- **Foundational (Phase 2)**: Skipped — no blockers
- **User Stories (Phase 3+)**: US1 and US2 can be implemented in any order (different parts of the same file tree but independent components)
  - US1 (GroupBySelector) and US2 (GroupFilters) touch different components within `src/components/groups/`
  - They are fully independent — can run in parallel
- **Polish (Phase 5)**: Depends on both US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies — standalone CSS restyle of existing component
- **User Story 2 (P1)**: No dependencies on US1 — standalone component rewrite

### Within Each User Story

- Implement in task order within each story
- Within US2: T004 (import) → T005 (config) → T006 (state) → T007 (pill row) → T008 (panel) → T009 (badges) → T010 (reset) → T011 (cleanup)

### Parallel Opportunities

- **All US1 tasks** can run sequentially (one file, one component)
- **US2 tasks** T004–T007 can be done first, then T008–T011
- **US1 and US2** can run in parallel entirely — no overlapping files
- **Polish tasks** T012–T014 can run in parallel (lint/build/test)

---

## Parallel Example: User Stories 1 & 2

```bash
# Story 1 (parallel with Story 2):
Task: "Update GroupBySelector styling in src/components/groups/GroupBySelector.tsx"

# Story 2 (parallel with Story 1):
Task: "Redesign GroupFilters to use FilterPill in src/components/groups/GroupFilters.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (GroupBySelector restyle ~3 trivial class swaps)
2. **STOP and VALIDATE**: Open `/groups`, verify blue theme renders correctly
3. This alone delivers visual consistency value

### Incremental Delivery

1. Complete US1 (GroupBySelector restyle) → quick win, minimal risk
2. Complete US2 (GroupFilters redesign) → larger change, test filter behavior
3. Run polish tasks

### Parallel Team Strategy

With multiple developers:
- Developer A: User Story 1 (GroupBySelector restyle ~2 min)
- Developer B: User Story 2 (GroupFilters redesign ~15 min)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No tests requested in spec — visual verification per quickstart.md
- Commit after each task or logical group
- Both stories are P1 priority — implement both for full feature delivery
