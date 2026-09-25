---
description: "Task list template for feature implementation"
---

# Tasks: Frontend Migration to Unified Groups API

**Input**: Design documents from `/specs/028-groups-api-frontend-migration/`
**Prerequisites**: plan.md, spec.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL and not included since we are just modifying internal API bindings.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No setup tasks needed as this is a refactor of existing files)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

*(No foundational tasks needed as all type definitions and normalization functions like `normalizeEnrichedGroup` already exist)*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Unify Group Fetching Logic (Priority: P1) 🎯 MVP

**Goal**: Refactor the fragmented endpoints inside `src/api/academics/groups/core.ts` to point to `/academics/groups/filter` and adapt to the new pagination response format.

**Independent Test**: Can be tested by navigating to the Groups page and verifying active/archived/search tabs load correctly.

### Implementation for User Story 1

- [x] T001 [US1] Update `getGroupsPaginated` in `src/api/academics/groups/core.ts` to use `/filter`
- [x] T002 [US1] Update `getGroups` in `src/api/academics/groups/core.ts` to use `/filter`
- [x] T003 [US1] Update `getEnrichedGroups` in `src/api/academics/groups/core.ts` to use `/filter`
- [x] T004 [US1] Update `searchGroups` in `src/api/academics/groups/core.ts` to use `/filter` and include inactive groups
- [x] T005 [US1] Update `getArchivedGroups` in `src/api/academics/groups/core.ts` to use `/filter` with archived status
- [x] T006 [US1] Update `getGroupsByCourse` in `src/api/academics/groups/core.ts` to use `/filter` with `course_ids`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Eliminate Dead Code & Technical Debt (Priority: P2)

**Goal**: Remove API client bindings for endpoints that were deleted in the backend and are unused in the frontend React components.

**Independent Test**: Can be verified by running `npm run build` and checking there are no errors about missing functions.

### Implementation for User Story 2

- [x] T007 [P] [US2] Remove `getGroupsByType` from `src/api/academics/groups/core.ts` and `src/api/academics/groups/index.ts`
- [x] T008 [P] [US2] Remove `getCourseGroups` from `src/api/academics/courses/core.ts` and `src/api/academics/courses/index.ts`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T009 [P] Run `npm run lint` and fix all errors
- [x] T010 [P] Run `npm run build` and verify zero errors
- [x] T011 [P] Run `npm run test` to verify API client updates didn't break tests

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start immediately. No dependencies.
- **User Story 2 (P2)**: Can start immediately. Safe to do in parallel since it modifies different files or unused code.

### Parallel Opportunities

- T007 and T008 can be executed in parallel as they target completely different core files.
- The polish tasks (T009, T010, T011) can be run concurrently.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (refactor to `/filter`)
2. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete User Story 1 → Test independently
2. Add User Story 2 (dead code removal) → Test independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
