# Tasks: Redesign Employee Cards & Detail Dialog

**Input**: Design documents from `/specs/003-redesign-employee-cards/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
- Types already updated: `src/api/hr/types.ts` — `EmployeeListItem` has `phone?`, `email?`; `EmployeePublic` has `university?`, `major?`, `is_graduate?`, `monthly_salary?`, `contract_percentage?`
- Build and lint currently pass.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create reusable components that all user stories depend on

**Note**: Types in `src/api/hr/types.ts` are already updated. No additional type or directory setup needed.

- [x] T001 [P] Create a reusable `Skeleton` component in `src/components/common/Skeleton.tsx` for card/dialog placeholder states using `animate-pulse`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Add `employeeStatusColors` entry for `inactive` status fallback in `src/utils/colors.ts` (ensures consistent badge colors across all components)
- [x] T003 [P] Create field label utility component or helper in `src/components/staff/shared/FieldLabel.tsx` for consistent "label: value" rendering with skeleton/empty states across card and dialog

**Checkpoint**: Foundation ready – user story implementation can now begin in parallel

---

## Phase 3: User Story 1 – Card Shows Richer Employee Summary (Priority: P1) 🎯 MVP

**Goal**: Employee cards display phone number and email alongside existing info, reducing clicks for contact lookups.

**Independent Test**: Load the staff page, verify every card shows phone and email in addition to name, job title, and status. Skeleton shown while loading.

### Implementation for User Story 1

- [x] T004 [P] [US1] Add phone and email rows to `EmployeeCard` in `src/components/staff/EmployeeCard.tsx` using `material-symbols-outlined` icons `call` and `mail`; conditionally render only when value exists
- [x] T005 [P] [US1] Add loading skeleton variant to `EmployeeCard` in `src/components/staff/EmployeeCard.tsx` — accept optional `isLoading` prop, render `animate-pulse` placeholder divs matching card dimensions when true
- [x] T006 [US1] Integrate skeleton loading into `StaffPage` card grid in `src/pages/StaffPage.tsx` — render skeleton cards (using `Skeleton` component or inline) while `isLoading` is true instead of the generic `LoadingSpinner`

**Checkpoint**: At this point, User Story 1 should be fully functional — cards show phone/email, loading states show skeletons

---

## Phase 4: User Story 2 – Detail Dialog Shows Complete Employee Profile (Priority: P1)

**Goal**: Employee detail dialog displays every `EmployeePublic` field organized into logical sections, including `national_id` and the newly added education/compensation fields.

**Independent Test**: Click any employee card, verify the detail dialog shows all fields: personal info (`national_id`, `hired_at`, ID), contact (`email`, `phone`), employment details (`job_title`, `employment_type`, `university`, `major`, `is_graduate`, `monthly_salary`, `contract_percentage`). Skeleton shown while loading. Error state with retry on fetch failure.

### Implementation for User Story 2

- [x] T007 [P] [US2] Redesign `EmployeeDetailModal` in `src/components/staff/EmployeeDetailModal.tsx` — reorganize fields into three labeled sections: "Personal Information" (`national_id`, `hired_at`, employee `id`), "Contact" (`email`, `phone`), "Employment Details" (`job_title`, `employment_type`, `is_active`, `university`, `major`, `is_graduate`, `monthly_salary`, `contract_percentage`)
- [x] T008 [P] [US2] Add skeleton placeholder state in `EmployeeDetailModal` — replace the generic `LoadingSpinner` with `animate-pulse` skeleton divs matching the section layout while `isLoading` is true
- [x] T009 [P] [US2] Add error state with retry button in `EmployeeDetailModal` — replace the plain text error message with `ErrorState` component (imported from `../common/ErrorState`) when `employee` is null and `isLoading` is false; pass `onRetry` callback

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — cards show contact info, dialog shows full profile with loading/error states

---

## Phase 5: User Story 3 – Edit Form Pre-fills From Full Employee Data (Priority: P2)

**Goal**: Editing an employee pre-fills all fields from the full detail endpoint, preventing accidental data loss on edit.

**Independent Test**: Open the edit form for any employee, verify all fields (phone, email, national_id, university, major, is_graduate, monthly_salary, contract_percentage) are pre-populated from saved data.

### Implementation for User Story 3

- [x] T010 [US3] Update edit modal flow in `src/pages/StaffPage.tsx` — when `editingEmployee` is set, fetch full employee detail via `useEmployee(editingEmployee)`; pass the full `EmployeePublic` response as `initialData` to `EmployeeForm` instead of the current sparse `EmployeeListItem` subset
- [x] T011 [US3] Add loading state for edit modal in `src/pages/StaffPage.tsx` — show skeleton placeholders or a `LoadingState` component inside the edit `Modal` while the detail fetch is in progress
- [x] T012 [US3] Add error state for edit modal in `src/pages/StaffPage.tsx` — show error message with retry option inside the edit `Modal` if the detail fetch fails

**Checkpoint**: All user stories should now be independently functional — editing pre-fills all fields, with loading/error states

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 [P] Run `npm run lint` and fix any errors — 0 new errors added
- [x] T014 [P] Run `npm run build` (`tsc -b && vite build`) and verify zero errors — ✅ passes
- [x] T015 [P] Run `npm run test` and verify all tests pass (2 pre-existing failures unrelated) — 57 pass, 2 pre-existing fail

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (different files)
  - US3 depends on US1 (shares `EmployeeCard` integration in `StaffPage`)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories (separate files from US1)
- **User Story 3 (P2)**: Depends on US1 — modifies the same `StaffPage.tsx` edit modal flow

### Within Each User Story

- Component design before integration
- Skeleton states before data rendering
- Error states after main rendering
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002, T003 (Setup + Foundational) — can all run in parallel
- T004, T005 (US1) — can run in parallel
- T007, T008, T009 (US2) — can all run in parallel
- T010, T011, T012 (US3) — sequential (T011/T012 depend on T010's modal structure)
- T013, T014, T015 (Polish) — can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all US1 implementation tasks together:
Task: "Add phone and email rows to EmployeeCard in src/components/staff/EmployeeCard.tsx"
Task: "Add loading skeleton variant to EmployeeCard in src/components/staff/EmployeeCard.tsx"

# Integration task depends on both completing:
Task: "Integrate skeleton loading into StaffPage card grid in src/pages/StaffPage.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all US2 implementation tasks together:
Task: "Redesign EmployeeDetailModal in src/components/staff/EmployeeDetailModal.tsx"
Task: "Add skeleton placeholder state in EmployeeDetailModal"
Task: "Add error state with retry button in EmployeeDetailModal"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Skeleton component)
2. Complete Phase 2: Foundational (FieldLabel utility, color utils)
3. Complete Phase 3: User Story 1 (cards with phone/email + skeletons)
4. **STOP and VALIDATE**: Test cards independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → cards show phone/email → Deploy/Demo (MVP!)
3. Add User Story 2 → dialog shows all fields → Deploy/Demo
4. Add User Story 3 → edit form pre-fills from full data → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (EmployeeCard + StaffPage integration)
   - Developer B: User Story 2 (EmployeeDetailModal)
   - Developer C: Waits for US1 completion, then User Story 3 (StaffPage edit flow)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Types already updated in `src/api/hr/types.ts` — no type changes needed
- Backend changes documented in `backend-changes.md` — deploy backend first if testing against real API
- Build and lint currently pass before implementation
- Stop at any checkpoint to validate story independently
