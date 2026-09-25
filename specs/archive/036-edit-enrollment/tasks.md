---
description: "Task list for Edit Enrollment feature implementation"
---

# Tasks: Edit Enrollment

**Input**: Design documents from `specs/036-edit-enrollment/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/patch-enrollment.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths are included in the descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure fixes.

- [ ] T001 [P] Fix `amount_due` type to allow `null` in `src/api/enrollments/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [ ] T002 [P] Create `UpdateEnrollmentInput` and `UpdateEnrollmentResult` schemas in `app/modules/enrollments/core/schemas.py`
- [ ] T003 [P] Define `UpdateEnrollmentRequest` and `UpdateEnrollmentResponse` interfaces in `src/api/enrollments/types.ts`
- [ ] T004 [P] Implement `update_enrollment_fields` atomic update method in `app/modules/enrollments/core/repository.py`
- [ ] T005 [P] Create `notify_enrollment_updated` method for Gmail dispatch in `app/modules/notifications/services/enrollment_notifications.py`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Edit Enrollment Details (Priority: P1) 🎯 MVP

**Goal**: Allow administrators to edit financial details (`amount_due`, `discount_applied`) and `notes` on existing active enrollments without re-enrolling students.

**Independent Test**: Can be verified by using the frontend Manage Enrollment panel to open the Edit modal, updating the custom amount and notes, and seeing the changes persist across reloads and reflect in the UI immediately.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Add `update_enrollment` signature to `EnrollmentCoreInterface` in `app/modules/enrollments/core/interface.py`
- [ ] T007 [US1] Implement `update_enrollment` logic with validation and audit logging in `app/modules/enrollments/core/service.py`
- [ ] T008 [US1] Implement `PATCH /enrollments/{enrollment_id}` endpoint in `app/api/routers/enrollments_router.py`
- [ ] T009 [P] [US1] Implement `updateEnrollment` client function in `src/api/enrollments/enrollments.ts` and re-export in `src/api/enrollments/index.ts`
- [x] T010 [US1] Create `useUpdateEnrollment` mutation hook with cache invalidation in `src/hooks/useEnrollmentMutations.ts`
- [x] T011 [US1] Build `EditEnrollmentModal` UI component in `src/components/enrollments/EditEnrollmentModal.tsx`
- [x] T012 [US1] Integrate "Edit" action and modal into `src/components/enrollments/ManageEnrollmentPanel.tsx`

**Checkpoint**: User Story 1 is fully functional from frontend to backend.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple layers and ensure code quality.

- [x] T013 [P] Run `npm run lint` and fix any ESLint issues
- [x] T014 [P] Run `npm run build` and ensure zero TypeScript or Vite errors
- [x] T015 Run `pytest tests/ -k enrollment` to verify existing tests remain passing

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Can start immediately (parallel to Phase 1). Blocks Phase 3.
- **User Stories (Phase 3)**: Depends on Phase 2 completion.
- **Polish (Phase 4)**: Depends on Phase 3 completion.

### User Story Dependencies

- **User Story 1 (P1)**: The only user story. Full stack implementation from backend API to frontend component.

### Within User Story 1

- Backend service (T007) depends on the interface and repository updates.
- Backend router (T008) depends on the service.
- Frontend hook (T010) depends on the API client function.
- Frontend UI (T011, T012) depends on the hook.

### Parallel Opportunities

- **Backend / Frontend Split**: Once schemas and types are defined (T002, T003), the backend service logic (T006-T008) and the frontend client/components (T009-T012) can be worked on completely in parallel.
- **Repository / Notifications**: T004 and T005 don't depend on each other and can be written concurrently.

---

## Implementation Strategy

### MVP First

1. Complete Setup and Foundational tasks to establish data structures.
2. Build the backend service and router endpoint (T006-T008).
3. Build the frontend client, hook, and modal (T009-T011).
4. Integrate the pieces in the `ManageEnrollmentPanel` (T012).
5. **STOP and VALIDATE**: Test User Story 1 independently in the browser.
6. Perform polishing (lint, build, tests).
