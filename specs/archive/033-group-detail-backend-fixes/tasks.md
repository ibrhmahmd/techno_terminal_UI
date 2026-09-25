---
description: "Task list for implementing the Group Detail Page Fixes (Spec 033)"
---

# Tasks: Group Detail Page Fixes

**Input**: Design documents from `/specs/033-group-detail-backend-fixes/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-changes.md, quickstart.md

**Organization**: Tasks are grouped by bug/fix to enable independent implementation and testing of each issue. Tests were not explicitly requested but independent testing criteria are provided.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which fix this task belongs to (e.g., US1, US2, US3)
- File paths are exact

---

## Phase 1: Setup

**Purpose**: Project initialization and basic structure
*No specific setup tasks needed as this is a bugfix spec for existing code.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented
*No foundational tasks needed as infrastructure is already in place.*

---

## Phase 3: User Story 1 - BUG-1: All Levels Return (Priority: P1) 🎯 MVP

**Goal**: Return all levels from `get_levels_detailed()` to unblock multi-level navigation.

**Independent Test**: Call `GET /academics/groups/{group_id}/levels/detailed` (no query params) and verify ALL levels for the group are returned, not just the active one.

### Implementation for User Story 1

- [x] T001 [P] [US1] Update `get_levels_detailed` to use `list_group_levels(include_inactive=True)` in `app/modules/academics/group/details/service.py`

**Checkpoint**: At this point, the backend returns all levels and the frontend LevelSelector works correctly.

---

## Phase 4: User Story 2 - BUG-2: Unpaid Count (Priority: P2)

**Goal**: Fix `unpaid_count` by deriving `total_students` from the enrollments table instead of payment records.

**Independent Test**: Call `GET /finance/groups/{group_id}/payments` and verify `unpaid_count` correctly reflects enrolled students minus students with payments.

### Implementation for User Story 2

- [x] T002 [P] [US2] Update `get_group_payments` logic to derive total_students from enrollments in `app/modules/academics/group/details/service.py`

**Checkpoint**: At this point, the Payments tab shows the correct unpaid count per level.

---

## Phase 5: User Story 3 - BUG-3: Session Commit (Priority: P1)

**Goal**: Add `session.commit()` to `add_extra_session()` to ensure sessions are persisted to the database.

**Independent Test**: Call `POST /academics/groups/{group_id}/sessions` and verify the session persists across page refreshes.

### Implementation for User Story 3

- [x] T003 [P] [US3] Add `session.commit()` and `session.refresh(result)` to `add_extra_session()` in `app/modules/academics/session/service.py`

**Checkpoint**: At this point, adding a session works and data is not lost.

---

## Phase 6: User Story 4 - BUG-4: Notes Loop (Priority: P1)

**Goal**: Fix the notes auto-save infinite loop by replacing the dual `useEffect` with a `lastSavedRef` pattern.

**Independent Test**: Type a note in the Group Info Card and verify exactly 1 PATCH request is sent after the debounce period, with no subsequent loops.

### Implementation for User Story 4

- [x] T004 [P] [US4] Implement `lastSavedRef` pattern for notes synchronization in `src/components/groups/detail/GroupInfoCard.tsx`

**Checkpoint**: At this point, notes auto-saving is stable and does not loop.

---

## Phase 7: User Story 5 - BUG-5: Time Format (Priority: P3)

**Goal**: Standardize the schedule time display to 12h format.

**Independent Test**: Verify the schedule time in the Group Info Card displays in 12h format (e.g., 2:00 PM - 4:00 PM).

### Implementation for User Story 5

- [x] T005 [P] [US5] Replace inline `formatTime` with imported shared utility in `src/components/groups/detail/GroupInfoCard.tsx`

**Checkpoint**: All fixes are now fully implemented and independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T006 Run `npm run lint` (Pre-existing errors ignored, feature code passed)
- [x] T007 Run `npm run build` and verify zero errors
- [x] T008 Start the backend (`python run_api.py`) and verify API works without startup errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Stories (Phase 3-7)**: No dependencies between them. All 5 bugs are isolated and can be fixed in parallel.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent
- **User Story 2 (P2)**: Independent (modifies same file as US1 but different methods)
- **User Story 3 (P1)**: Independent
- **User Story 4 (P1)**: Independent
- **User Story 5 (P3)**: Independent (modifies same file as US4 but different lines)

### Parallel Opportunities

- ALL tasks T001 through T005 can be executed in parallel.
- Backend and Frontend fixes can be done completely asynchronously.

---

## Implementation Strategy

### Incremental Delivery

1. Backend dev fixes BUG-3 (Session Commit) to unblock Session Add functionality.
2. Backend dev fixes BUG-1 (All Levels) to unblock Level Navigation UI.
3. Backend dev fixes BUG-2 (Unpaid Count) for financial data accuracy.
4. Frontend dev fixes BUG-4 (Notes Loop) to stop API spam.
5. Frontend dev fixes BUG-5 (Time Format) for cosmetic consistency.
6. Verify all together and run final polish phase.
