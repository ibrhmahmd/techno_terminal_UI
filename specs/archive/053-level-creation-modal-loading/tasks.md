# Tasks: Level Creation Loading UX

**Input**: Design documents from `/specs/053-level-creation-modal-loading/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: None requested. Verification is manual and check-build.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Set up environment variables and active plan context validation.

- [x] T001 Configure local environment and check active specs mapping in AGENTS.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core state exposure inside the mutation hook that blocks all component changes.

- [x] T002 [P] Expose `isCreateLevelPending` and `isLevelUpPending` flags in `src/hooks/useGroupMutations.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Progress Level Modal Loading UX (Priority: P1) 🎯 MVP

**Goal**: Provide full input locking, close disablement, spinner rendering, failure recovery, and a dynamic progression summary card in the `ProgressLevelDialog`.

**Independent Test**: Trigger a level progression inside the dialog; verify inputs and cancel/close actions are locked, confirm button shows a loading spinner, overlay click is ignored, and controls unlock on mutation failure.

### Implementation for User Story 1

- [x] T003 [US1] Update `src/pages/GroupDetailPage.tsx` to retrieve `isCreateLevelPending` and bind it to `ProgressLevelDialog`'s `isLoading` prop
- [x] T004 [US1] Update `src/components/groups/detail/ProgressLevelDialog.tsx` to disable all form input fields, selection dropdowns, toggles, checkboxes, and buttons when `isLoading` is true
- [x] T005 [US1] Update `src/components/groups/detail/ProgressLevelDialog.tsx` to disable close (X) and backdrop click closing handlers when `isLoading` is true
- [x] T006 [US1] Insert the dynamic action summary callout card at the top of the form body in `src/components/groups/detail/ProgressLevelDialog.tsx`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Group Info Card Level Up Button Loading UX (Priority: P1)

**Goal**: Visual feedback and double-click prevention on the main group "Level Up" button.

**Independent Test**: Click the "Level Up" button in the Group Info Card; verify it immediately disables and renders a spinner during execution.

### Implementation for User Story 2

- [x] T007 [P] [US2] Update `GroupInfoCardProps` interface in `src/components/groups/detail/GroupInfoCard.tsx` to accept `isLevelUpPending?: boolean`
- [x] T008 [US2] Update the "Level Up" button in `src/components/groups/detail/GroupInfoCard.tsx` to disable itself and render a loading spinner when `isLevelUpPending` is true
- [x] T009 [US2] Update `src/pages/GroupDetailPage.tsx` to destructure `isLevelUpPending` from `useGroupMutations` and pass it to `GroupInfoCard`

**Checkpoint**: User Story 2 is fully functional and testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verification of build and guidelines compliance.

- [ ] T010 Run local compiler check using `npm run build` and linter checks using `npm run lint` in the UI project
- [ ] T011 Verify all manual steps defined in `specs/053-level-creation-modal-loading/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: BLOCKS all user story tasks.
- **User Stories (Phase 3 & 4)**: Depend on Foundational phase completion.
- **Polish (Phase 5)**: Depends on all user stories being complete.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (T002).
3. Complete Phase 3: User Story 1 (T003, T004, T005, T006).
4. **STOP and VALIDATE**: Verify User Story 1 works.
5. Proceed to User Story 2.
