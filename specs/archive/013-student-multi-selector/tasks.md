# Tasks: Student Multi-Selector for Team Registration

**Input**: Design documents from `/specs/013-student-multi-selector/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not explicitly requested in the feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/{domain}/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Types: `src/types/`
  - Tests: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed — project already exists. Review existing components to understand patterns.

- [ ] T001 Review `src/components/common/SpyCombobox.tsx` to understand the combobox infrastructure (props, keyboard nav, category grouping)
- [ ] T002 Review `src/components/common/combobox/StudentCombobox.tsx` to understand the single-select student search pattern
- [ ] T003 Review `src/api/crm/students/search.ts` to understand the `searchStudents` API function signature and return type

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the shared types and interfaces that the `StudentMultiSelector` component will use. These MUST be complete before any UI work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 [P] Define `StudentSelection` interface in `src/components/common/StudentMultiSelector.tsx` — wraps `StudentListItem` with optional `fee` field
- [ ] T005 [P] Define `StudentMultiSelectorProps` interface in `src/components/common/StudentMultiSelector.tsx` — `selected`, `onChange`, `showFeeInput`, `defaultFee`, `maxSelections`

**Checkpoint**: Types defined — UI implementation can now begin.

---

## Phase 3: User Story 1 — Search and Select Students by Name (Priority: P1) 🎯 MVP

**Goal**: Admins can search students by name, see results with name/phone/status, select multiple students, and view them as removable chips.

**Independent Test**: Open the team registration modal, type a student name, see results, click to select multiple students, verify they appear in the selected roster.

### Implementation for User Story 1

- [ ] T006 [US1] Create `StudentMultiSelector` component in `src/components/common/StudentMultiSelector.tsx` — build the shell with search state, selected state, and debounced search logic using `searchStudents` API
- [ ] T007 [US1] Integrate `SpyCombobox` inside `StudentMultiSelector` — pass `searchStudents` results as categories (alphabetical grouping), configure `onSelect` to add student to selected array instead of closing dropdown
- [ ] T008 [US1] Build selected students chip list in `StudentMultiSelector` — render each selected student as a removable pill with name, status badge, and an "×" remove button
- [ ] T009 [US1] Filter selected students out of search results in `StudentMultiSelector` — exclude already-selected student IDs from `SpyCombobox` categories
- [ ] T010 [US1] Handle search states in `StudentMultiSelector` — "Type at least 2 chars" for empty search, "No students found matching '...'" for no results, loading spinner during API call
- [ ] T011 [US1] Style inactive/waitlisted students in `StudentMultiSelector` search results — apply visual distinction (e.g., reduced opacity, different badge color) using existing status badge patterns from `StudentCombobox`
- [ ] T012 [US1] Update `TeamRegistrationModal` in `src/components/competitions/TeamRegistrationModal.tsx` — replace the student ID input section with `StudentMultiSelector`, wire `onChange` to update internal selection state
- [ ] T013 [US1] Add validation in `TeamRegistrationModal` — prevent form submission when no students are selected, show error message "At least one student is required"

**Checkpoint**: Admin can search, select multiple students, see them as chips, remove them, and form validates selection before submission.

---

## Phase 4: User Story 2 — Configure Per-Student Fees (Priority: P2)

**Goal**: Admins can set different fee amounts for each selected student, and the correct `student_fees` map is sent to the API.

**Independent Test**: Select 3 students, set different fees for 2 of them, submit, verify the `student_fees` payload contains only the explicitly set fees.

### Implementation for User Story 2

- [ ] T014 [US2] Add inline fee input to each selected student chip in `StudentMultiSelector` — `type="number"`, `step="0.01"`, `min="0"`, placeholder showing default fee
- [ ] T015 [US2] Wire fee input changes in `StudentMultiSelector` to update the `StudentSelection.fee` field and emit `onChange` with updated selections
- [ ] T016 [US2] Update `TeamRegistrationModal` submission logic — build `student_ids` array from selected students and `student_fees` map from students with non-empty fee values
- [ ] T017 [US2] Add 409 conflict error handling in `TeamRegistrationModal` — display inline error message when a selected student is already in another team for this competition

**Checkpoint**: Admin can set per-student fees, submit with correct `student_ids` and `student_fees` payload, and see conflict errors.

---

## Phase 5: User Story 3 — Reusable Multi-Selector Component (Priority: P3)

**Goal**: The `StudentMultiSelector` is designed for reuse with configurable props for fee input visibility and selection limits.

**Independent Test**: Import `StudentMultiSelector` in a test context, pass props with `showFeeInput={false}`, verify it renders without fee inputs.

### Implementation for User Story 3

- [ ] T018 [US3] Add `showFeeInput` prop to `StudentMultiSelector` — when `false`, hide fee inputs from selected chips (default: `true`)
- [ ] T019 [US3] Add `maxSelections` prop to `StudentMultiSelector` — when set, disable adding more students once limit is reached, show "Maximum N students selected" message
- [ ] T020 [US3] Export `StudentMultiSelector` and `StudentSelection` from `src/components/common/index.ts` (or barrel export) for easy importing

**Checkpoint**: `StudentMultiSelector` is reusable with configurable fee visibility and selection limits.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, verification, and build gates.

- [ ] T021 [P] Remove old student ID input code from `TeamRegistrationModal` — delete the `StudentEntry` interface, `students` state, and the old ID/fee input rows
- [ ] T022 [P] Run `npm run lint` and fix all errors in modified files
- [ ] T023 [P] Run `npm run build` and verify `tsc -b && vite build` succeeds with zero errors
- [ ] T024 Manual end-to-end verification: open competition detail → register team → search student → select 3 students with different fees → submit → verify team appears in competition teams list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1) must complete before US2 (P2) — fee inputs depend on selected chips existing
  - US2 (P2) must complete before US3 (P3) — reuse props depend on fee input logic existing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 — needs selected chips to add fee inputs to
- **User Story 3 (P3)**: Depends on US2 — needs fee input logic to make it optional

### Within Each User Story

- Component shell before SpyCombobox integration
- SpyCombobox integration before chip rendering
- Chip rendering before fee inputs
- Fee inputs before submission logic
- Story complete before moving to next priority

### Parallel Opportunities

- Phase 1 tasks T001–T003 (review existing code) can run in parallel
- Phase 2 tasks T004–T005 (type definitions) can run in parallel
- Phase 6 tasks T021–T023 (cleanup, lint, build) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch both type definition tasks together (T004–T005):
Task: "Define StudentSelection interface in src/components/common/StudentMultiSelector.tsx"
Task: "Define StudentMultiSelectorProps interface in src/components/common/StudentMultiSelector.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (3 tasks — review existing code)
2. Complete Phase 2: Foundational (2 tasks — type definitions)
3. Complete Phase 3: User Story 1 (8 tasks — search, select, chips, validation)
4. **STOP and VALIDATE**: Open team registration modal, search for a student, select them, verify chip appears
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Types ready for component work
2. Add User Story 1 → Search + multi-select + chips work → Test independently
3. Add User Story 2 → Per-student fees + correct API payload → Test independently
4. Add User Story 3 → Reusable props (`showFeeInput`, `maxSelections`) → Test independently
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical**: The `SpyCombobox` is single-select by design (closes on `onSelect`). The `StudentMultiSelector` must prevent the dropdown from closing when a student is selected — this may require passing a custom `onSelect` that doesn't trigger the close behavior, or wrapping `SpyCombobox` to intercept the close
- **Critical**: The `searchStudents` API requires min 2 characters — the UI must communicate this clearly to avoid confusion when typing 1 character shows no results
