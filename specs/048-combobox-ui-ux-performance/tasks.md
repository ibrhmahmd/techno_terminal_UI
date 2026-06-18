# Tasks: Student & Group Combobox UI/UX Redesign & Performance Optimization

**Input**: Design documents from `/specs/048-combobox-ui-ux-performance/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No Vitest test tasks — relies on manual integration checks, build verification (`npm run build`), and lint rules (`npm run lint`).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US4)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/common/SpyCombobox.tsx`, `src/components/common/combobox/`
  - Forms/Panels: `src/components/finance/CreateReceiptPanel.tsx`, `src/components/enrollments/EnrollPanel.tsx`
  - Pages: `src/pages/TeamDetailPage.tsx`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify baseline build before implementing changes

- [x] T001 Run `npm run lint` and `npm run build` to verify baseline build is clean

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Inspect current combobox code to plan implementation

- [x] T002 Inspect `src/components/common/SpyCombobox.tsx` and all combobox imports to map exact props and state variables

**Checkpoint**: Baseline verified. Ready to implement performance optimization.

---

## Phase 3: User Story 1 - Performance Optimization & Progressive DOM Rendering (Priority: P1) 🎯 MVP

**Goal**: Implement progressive rendering and throttle scrollspy handlers to optimize dropdown performance

**Independent Test**: Focus dropdown containing many groups/students. DevTools Elements inspect shows only 40 items loaded initially. Scrolling near bottom appends next 40 items. Scrolling is smooth at 60fps. Keyboard arrow navigation does not cause page scroll layout shifts.

### Implementation for User Story 1

- [x] T003 [US1] Implement `visibleLimit` state and scroll-triggered appending logic in `src/components/common/SpyCombobox.tsx`
- [x] T004 [US1] Throttle the scrollspy scroll handler inside `src/components/common/SpyCombobox.tsx` using a 100ms time guard to prevent synchronous layout recalculations
- [x] T005 [US1] Update `handleKeyDown` keydown handler in `src/components/common/SpyCombobox.tsx` to scroll items using `{ block: 'nearest' }` confined to the dropdown scrolling viewport

**Checkpoint**: US1 complete. Long dropdowns scroll smoothly and render efficiently.

---

## Phase 4: User Story 2 - Built-in Component-Level Debouncing (Priority: P1)

**Goal**: Move search debouncing from parent components into the combobox input wrapper to prevent API flooding

**Independent Test**: DevTools Network tab shows only one query fired when typing rapidly in Create Receipt student search. Pruned parent pages compile cleanly.

### Implementation for User Story 2

- [x] T006 [US2] Implement internal `inputValue` state and a 250ms debounced `useEffect` timer triggering `onSearchChange` in `src/components/common/SpyCombobox.tsx`
- [x] T007 [P] [US2] Refactor `src/components/finance/CreateReceiptPanel.tsx` to remove manual search synchronization state and redundant keypress query triggers
- [x] T008 [P] [US2] Prune redundant manual debouncing timeout states and effects in `src/components/enrollments/EnrollPanel.tsx`
- [x] T009 [P] [US2] Prune redundant manual debouncing timeout states and effects in `src/pages/TeamDetailPage.tsx`
- [x] T010 [P] [US2] Align prop contracts and callbacks in `src/components/common/StudentMultiSelector.tsx` and `src/components/common/combobox/InstructorCombobox.tsx`

**Checkpoint**: US2 complete. Keyboard inputs are debounced internally in the combobox. Build passes.

---

## Phase 5: User Story 3 - Interactive Browse Mode & PII Privacy (Priority: P2)

**Goal**: Support browsing recently selected items from localStorage on empty focus, support 1-char local filtering, and render unpaid balance warnings

**Independent Test**: Click empty student or group dropdown. Cached recent items appear. Selecting an item caches it in localStorage. Typing 1 char filters locally. Typing 2+ chars queries server. Students with unpaid balances display a warning icon.

### Implementation for User Story 3

- [x] T011 [US3] Create local storage caching utility functions in `src/utils/recentCache.ts` to retrieve and store `{ id, name }` items (up to 5 per list type)
- [x] T012 [P] [US3] Modify `src/components/common/combobox/StudentCombobox.tsx` to show only recently selected students on empty search, filter locally on 1-char inputs, and call server query on 2+ chars
- [x] T013 [P] [US3] Add a warning triangle icon next to student names in `src/components/common/combobox/StudentCombobox.tsx` if `has_unpaid_balance` is true
- [x] T014 [P] [US3] Modify `src/components/common/combobox/GroupCombobox.tsx` to show nothing on focus unless recently used groups are present, require typing to search, and remove the `slice(0, 50)` list limitation
- [x] T015 [P] [US3] Modify `src/components/common/combobox/InstructorCombobox.tsx` to show nothing on focus unless recently used instructors are present, and require typing to search

**Checkpoint**: US3 complete. Browse mode, privacy-safe caching, and unpaid balance indicators are functional.

---

## Phase 6: User Story 4 - Mobile-Responsive Layout Refactoring (Priority: P2)

**Goal**: Optimize dropdown layout to fit mobile screens by collapsing category sidebar and rendering single-column list with inline sticky headers

**Independent Test**: Emulate mobile layout (<640px) in DevTools. Left category sidebar collapses. Dropdown list renders as single column with inline sticky headers. Dropdown fits screen container without overflowing.

### Implementation for User Story 4

- [x] T016 [US4] Add Tailwind CSS responsive classes (`hidden sm:block`) to the category sidebar container in `src/components/common/SpyCombobox.tsx`
- [x] T017 [US4] Implement conditional rendering of inline category headers inside the main items pane in `src/components/common/SpyCombobox.tsx` when the sidebar is hidden (mobile view)
- [x] T018 [US4] Style dropdown outer container in `src/components/common/SpyCombobox.tsx` to adapt and scale within mobile screen boundaries

**Checkpoint**: US4 complete. Combobox dropdown scales and fits cleanly on mobile screen sizes.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Verify all changes compile, lint, and work together

- [x] T019 Run `npm run lint` and resolve any style or syntax errors in all modified files
- [x] T020 Run `npm run build` to verify production compiler success
- [x] T021 Execute manual test scenarios from `quickstart.md` to verify all behaviors work together

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3-6)**: All depend on Foundational completion.
  - US1 (Performance) must be implemented first because progressive rendering provides the performance foundation for browsing and infinite scroll.
  - US2 (Debouncing) can run in parallel with US3 (Browse Mode) as they touch different files.
  - US4 (Mobile Layout) should be done last as it adjusts styling on the finished component.
- **Polish (Final Phase)**: Depends on all user stories being completed.

### User Story Dependencies

- **US1 (P1)**: No dependencies.
- **US2 (P1)**: Depends on US1 completion.
- **US3 (P2)**: Depends on US1 completion.
- **US4 (P2)**: Depends on US3 completion.

### Parallel Opportunities

- Within US2, refactoring different pages (`CreateReceiptPanel.tsx`, `EnrollPanel.tsx`, `TeamDetailPage.tsx`) can be done in parallel (T007, T008, T009).
- Within US3, modifying different selectors (`StudentCombobox.tsx`, `GroupCombobox.tsx`, `InstructorCombobox.tsx`) can be done in parallel (T012, T013, T014, T015).

---

## Parallel Example: User Stories

```bash
# Launch parallel refactoring of parent pages (US2):
Task: "Refactor CreateReceiptPanel.tsx" (T007)
Task: "Prune EnrollPanel.tsx timeouts" (T008)
Task: "Prune TeamDetailPage.tsx timeouts" (T009)

# Launch parallel modification of selectors (US3):
Task: "Modify StudentCombobox.tsx empty state & 1-char filter" (T012)
Task: "Modify GroupCombobox.tsx empty state" (T014)
Task: "Modify InstructorCombobox.tsx empty state" (T015)
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)

1. Complete Setup and Foundational.
2. Complete US1 (Progressive Rendering & Throttled Scrollspy).
3. Complete US2 (Component Debouncing).
4. **STOP and VALIDATE**: Confirm that lists render smoothly and devtools shows only debounced API calls when typing rapidly.

### Incremental Delivery

1. Setup + Foundational → Baseline ready.
2. Add US1 + US2 → Test performance & debouncing (MVP!).
3. Add US3 → Test Browse Mode, Local Cache, and Unpaid Balance Warning.
4. Add US4 → Test Mobile Responsive UI.
5. Polish → Final Linting & Build Verification.
