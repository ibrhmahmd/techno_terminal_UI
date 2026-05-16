# Tasks: Fix Enrollment Issues

**Input**: Design documents from `/specs/009-fix-enrollment-issues/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Pages: `src/pages/`
  - Common: `src/components/common/`
- Only one file is modified: `src/components/enrollments/EnrollPanel.tsx`

---

## Phase 1: User Story 1 — Default Price to Zero (Priority: P1)

**Goal**: The Course Fee field in the new enrollment form defaults to 0 instead of the hardcoded 150 EGP, preventing accidental incorrect financial records.

**Independent Test**: Open the Enrollments page, click "New Enrollment", select a student and group. Verify the Course Fee input shows 0 (not 150). Enter a different amount, submit — check a`mount_due` was saved correctly.

### Implementation for User Story 1

- [ ] T001 [US1] Change initial `useState(150)` to `useState(0)` for the `amount` variable at the top of `src/components/enrollments/EnrollPanel.tsx`
- [ ] T002 [US1] Change `setAmount(150)` to `setAmount(0)` in the group-selection handler inside `src/components/enrollments/EnrollPanel.tsx`
- [ ] T003 [US1] Change `setAmount(150)` to `setAmount(0)` in the student-change reset handler inside `src/components/enrollments/EnrollPanel.tsx`
- [ ] T004 [US1] Change `setAmount(150)` to `setAmount(0)` in the group-clear handler inside `src/components/enrollments/EnrollPanel.tsx`
- [ ] T005 [US1] Change `setAmount(150)` to `setAmount(0)` in the post-submit form-reset handler inside `src/components/enrollments/EnrollPanel.tsx`

**Checkpoint**: New enrollment form shows 0 as the default Course Fee. All 5 code locations updated.

---

## Phase 2: User Story 2 — Prevent Scroll on Number Inputs (Priority: P1)

**Goal**: Scrolling the mouse wheel over the Course Fee or Discount number inputs does not change their values, preventing silent data entry errors. Manual typing and arrow keys still work.

**Independent Test**: Open enrollment form, place cursor in the Course Fee field, scroll up/down with mouse wheel — value does not change. Place cursor in the Discount field, scroll — value does not change. Type a value manually — typing still works.

### Implementation for User Story 2

- [ ] T006 [US2] Add `onWheel={(e) => (e.target as HTMLInputElement).blur()}` to the Course Fee `<input type="number">` in `src/components/enrollments/EnrollPanel.tsx`
- [ ] T007 [US2] Add `onWheel={(e) => (e.target as HTMLInputElement).blur()}` to the Discount `<input type="number">` in `src/components/enrollments/EnrollPanel.tsx`

**Checkpoint**: Scrolling over number inputs in the enrollment form no longer changes values.

---

## Phase 3: User Story 3 — Review Enrollment Edit API (Priority: P2)

**Goal**: Produce a written assessment of the existing enrollment API endpoints and whether enrollment records (amount_due, discount, notes) can be edited after creation.

**Independent Test**: Review `src/api/enrollments/enrollments.ts` and `docs/api/enrollments.md` and produce a summary of findings.

### Implementation for User Story 3

- [ ] T008 [US3] Review `src/api/enrollments/enrollments.ts` for any PUT/PATCH endpoint for enrollment editing — document findings
- [ ] T009 [US3] Review `docs/api/enrollments.md` for edit-related endpoints — document findings
- [ ] T010 [US3] Produce a written summary listing all existing enrollment endpoints, confirming absence of edit support, and recommending what a PATCH endpoint would need

**Checkpoint**: Written API assessment complete — stored as `docs/api/enrollment-edit-review.md` or reported to the team.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Ensure code quality and no regressions

- [ ] T011 Run `npm run lint` and fix all errors
- [ ] T012 Run `npm run build` (`tsc -b && vite build`) and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No dependencies — can start immediately
- **US2 (Phase 2)**: **Depends on US1** — Both modify the same file (`EnrollPanel.tsx`), must run sequentially
- **US3 (Phase 3)**: No code dependencies — can run independently of US1/US2 (research only)
- **Polish (Phase 4)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — can run first
- **US2 (P1)**: Depends on US1 — both modify the same file, run sequentially to avoid conflicts
- **US3 (P2)**: Can run in parallel with US1/US2 (different files — reviews docs and API code, does not modify EnrollPanel.tsx)

### Within Each User Story

- Tasks within a phase that touch the same file MUST run sequentially
- US1: T001 → T002 → T003 → T004 → T005 (same file, sequential)
- US2: T006 → T007 (same file, sequential)
- US3: T008 → T009 → T010 (different files, sequential research)
- Polish: T011 (lint) before T012 (build)

### Parallel Opportunities

- US3 (research different files) can run in parallel with US1 and US2
- T011 (lint) and T012 (build) must run sequentially within Polish phase

---

## Parallel Example: User Story 1

```bash
# All US1 tasks touch the same file — must run sequentially:
Task: "Update initialState hook useState(150) → useState(0) in EnrollPanel.tsx"
Task: "Update each setAmount(150) → setAmount(0) in EnrollPanel.tsx"
```

## Parallel Example: User Story 3

```bash
# US3 reviews multiple files independently:
Task: "Review API functions in src/api/enrollments/enrollments.ts"
Task: "Review API docs in docs/api/enrollments.md"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: US1 (default price = 0)
2. **STOP and VALIDATE**: Verify Course Fee defaults to 0
3. Complete Phase 2: US2 (scroll prevention)
4. Complete Phase 3: US3 (API review — can run in parallel)
5. Polish: lint, build

### Incremental Delivery

1. US1 → Users see Course Fee at 0 by default
2. US2 → Users no longer accidentally change fee via scrolling
3. US3 → Team has written assessment of enrollment edit capabilities
4. Polish → Build passes

---

## Notes

- All US1 and US2 changes are in a single file: `src/components/enrollments/EnrollPanel.tsx`
- No new files created — all changes are in-place edits
- US3 is research-only (no code changes)
- [P] marker omitted within phases where tasks touch the same file
- `npm run build` must pass at every commit
