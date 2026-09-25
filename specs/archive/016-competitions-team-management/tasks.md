# Tasks: Competitions & Team Management Feature Complete

**Input**: Design documents from `/specs/016-competitions-team-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included in Phase 8 (User Story 9) as requested in the spec. They are optional and can be skipped if rapid delivery is needed.

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

**Purpose**: No new infrastructure needed — this is an audit/fix feature that modifies and extends existing code.

_No tasks required._

---

## Phase 2: Foundational — Code Quality Cleanup (US5, US6, US7)

**Purpose**: Safe, independent cleanup tasks that reduce noise and make subsequent feature work cleaner. These do NOT block feature stories but are best done first to avoid merge conflicts on shared files.

**⚠️ RECOMMENDED**: Complete before any user story work, but not strictly blocking.

### Implementation for Code Quality Cleanup

- [ ] T001 [P] [US5] Remove duplicate type definitions in `src/api/competitions/types.ts` — delete the second block (~lines 71-89), keeping the first block (~lines 18-36). Verify all imports resolve.
- [ ] T002 [P] [US6] Complete barrel exports in `src/components/competitions/index.ts` — add `CompetitionForm`, `CompetitionCard`, `CategoryList`, `TeamRegistrationModal`, `CategoryTeamsModal`
- [ ] T003 [P] [US6] Remove unused `onRestore` and `actionLabels` props from `CompetitionsTable` component interface and usages in `src/components/competitions/CompetitionsTable.tsx`
- [ ] T004 [P] [US7] Remove unused `useTeamsWithMembers` hook export from `src/hooks/teams/useTeams.ts`
- [ ] T005 [P] [US7] Remove unused `getTeamsWithMembers` API function from `src/api/teams/teams.ts`

**Checkpoint**: Build passes (`tsc -b && vite build`), lint clean, all exports valid.

---

## Phase 3: User Story 8 — Fix `registerTeam` Payload for Group Mode (Priority: P3)

**Goal**: When registering a team from a group, send only `group_id` in the payload (not `student_ids: []`). When selecting individual students, only send `student_ids` (not `group_id`).

**Independent Test**: Open devtools network tab, register a team using "From Group" mode, verify the API request body contains `group_id` and does NOT contain `student_ids`. Repeat for "Select Students" mode and verify the opposite.

### Implementation for User Story 8

- [ ] T006 [US8] Fix `handleSubmit` in `src/components/competitions/TeamRegistrationModal.tsx` to conditionally omit `student_ids` from payload when `group_id` is set, and omit `group_id` when `student_ids` is set. Use spread or conditional assignment for type-clean payload construction.

**Checkpoint**: Team registration works in both modes with correct API payloads.

---

## Phase 4: User Story 1 — Edit Team After Registration (Priority: P1) 🎯 MVP

**Goal**: Admins can edit team name, category, subcategory, project info, instructor, and notes after creation via a modal on the team detail page.

**Independent Test**: Navigate to `/teams/:id`, click "Edit Team" button, change team name, submit, verify the page updates without page reload.

**UX Pattern**: Modal on team detail page (not a separate route). Inline error banner on failure. No concurrent-edit detection.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create `TeamEditModal` component at `src/components/teams/TeamEditModal.tsx` — modal form with fields: team_name (required), category (required), subcategory, project_name, project_description, instructor (placeholder for InstructorCombobox from US2), notes. Pre-fill from `UpdateTeamInput`. Submit calls `updateTeam` from `useTeam` hook.
- [ ] T008 [US1] Add "Edit Team" button to `src/pages/TeamDetailPage.tsx` that opens `TeamEditModal`. Wire `onSubmit` to call `useTeam().update`, invalidate `['teams', teamId]` query key on success, close modal, show inline error on failure.
- [ ] T009 [US1] Add `formatDate` or reuse existing date formatting for the created_at field display on team detail page (if not already present).
- [ ] T010 [US1] Verify `useTeam().update` mutation is properly wired in `src/hooks/teams/useTeam.ts` — confirm it exists and invalidates `['teams', id]` on success.

**Checkpoint**: Team edit modal opens, pre-fills data, submits successfully, page updates without reload.

---

## Phase 5: User Story 2 — Instructor Assignment (Priority: P2)

**Goal**: Admins can assign an instructor to a team during registration and edit. The instructor name displays on the team detail page.

**Independent Test**: Open team registration modal, search and select an instructor, create team, verify instructor name appears on detail page. Edit team, change instructor, verify update.

**UX Pattern**: SpyCombobox-based searchable combobox, term "Instructor" in UI (backend field is `coach_id`). Powered by `getEmployees` from `src/api/hr/employees.ts`.

### Implementation for User Story 2

- [ ] T011 [P] [US2] Create `InstructorCombobox` component at `src/components/common/combobox/InstructorCombobox.tsx` — SpyCombobox-based, searchable, powered by `useEmployees` hook. Match `GroupCombobox` pattern. Filter employees on search query. Display `full_name` in results.
- [ ] T012 [US2] Add instructor selector to `src/components/competitions/TeamRegistrationModal.tsx` — insert `InstructorCombobox` in the form, map selection to `coach_id` in the submit payload.
- [ ] T013 [US2] Add instructor selector to `src/components/teams/TeamEditModal.tsx` — same pattern as registration modal, pre-fill from existing team data.
- [ ] T014 [US2] Display instructor name on `src/pages/TeamDetailPage.tsx` — fetch employee name using `useEmployee(instructorId)` when `coach_id` is set, show in team info section. Handle null/undefined gracefully (hide section).

**Checkpoint**: Instructor can be selected during registration and edit, displays on team detail page.

---

## Phase 6: User Story 3 — Payment Parent Association (Priority: P2)

**Goal**: When processing a competition fee payment, optionally select a parent to associate with the payment.

**Independent Test**: Open pay fee modal on team member, see optional parent selector. Submit with and without parent selection — both succeed.

**UX Pattern**: SpyCombobox-based searchable parent selector (matching `StudentMultiSelector` search pattern). Powered by `searchParents` from `src/api/crm/parents/search.ts`.

### Implementation for User Story 3

- [ ] T015 [P] [US3] Verify `searchParents` API function signature at `src/api/crm/parents/search.ts` — confirm return type shape and how to integrate with SpyCombobox.
- [ ] T016 [US3] Add optional parent selector to the pay fee modal in `src/pages/TeamDetailPage.tsx` (or extract as `ParentCombobox.tsx` at `src/components/common/ParentCombobox.tsx` if reusable). Wire selection to `parent_id` in `PayCompetitionFeeInput`.
- [ ] T017 [US3] Update the pay fee modal submit handler in `src/pages/TeamDetailPage.tsx` to include `parent_id` when a parent is selected (omit when not selected).

**Checkpoint**: Pay fee modal has optional parent selector. Payment succeeds with and without parent.

---

## Phase 7: User Story 4 — Placement & Fee Status in Team Lists (Priority: P3)

**Goal**: Team list cards in Teams tab and CategoryTeamsModal show placement rank badge, member count, and "X of Y paid" fee summary.

**Independent Test**: Navigate to Teams tab of a competition with teams that have placement ranks and payment data. Verify each card shows rank badge, member count, and fee summary.

### Implementation for User Story 4

- [ ] T018 [US4] Enhance team cards in `src/pages/CompetitionDetailPage.tsx` Teams tab — add placement rank badge (when set), member count, and "X of Y paid" fee summary. Data available from `useTeams` (TeamDTO includes `placement_rank`) and `useCompetitionSummary` (summary includes members with fee data).
- [ ] T019 [US4] Enhance team rows in `src/components/competitions/CategoryTeamsModal.tsx` — add member count and "X of Y paid" fee summary per team. Data available from `CategoryWithTeamsDTO.teams[].members[]`.
- [ ] T020 [US4] Calculate fee summary string: iterate team members, count members where `amount_paid > 0`, format as `"{paidCount} of {totalCount} paid"`. Handle edge case of no members (show "0 of 0 paid" or "No members").

**Checkpoint**: Teams tab and CategoryTeamsModal display placement rank, member count, and fee summary.

---

## Phase 8: User Story 9 — Test Coverage (Priority: P4)

**Goal**: Add test coverage for core components to prevent regressions.

**Independent Test**: Run `npm run test` and verify new tests pass alongside existing 54 passing tests.

### Tests for User Story 9 ⚠️

- [ ] T021 [P] [US9] Write test for `TeamRegistrationModal` at `src/tests/TeamRegistrationModal.test.tsx` — test form renders all fields, validation shows error on empty team name, validation shows error on no students selected.
- [ ] T022 [P] [US9] Write test for `CategoryList` at `src/tests/CategoryList.test.tsx` — test renders categories with subcategory badges, displays empty state when no categories, "Register Team" button click fires callback.
- [ ] T023 [P] [US9] Write test for team detail page inline features at `src/tests/TeamDetailPage.test.tsx` — test placement rank renders when present, fee summary renders correctly for mixed payment statuses.

**Checkpoint**: All new tests pass. Total test count increases by 3.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all user stories.

- [ ] T024 Run `npm run lint` and fix all errors across modified files
- [ ] T025 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T026 Run `npm run test` and verify all 57 tests pass (54 existing + 3 new)
- [ ] T027 Final review: verify all 9 user story acceptance criteria are met end-to-end
- [ ] T028 Update AGENTS.md SPECKIT block if implementation reveals new architectural decisions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No tasks — can skip
- **Phase 2 (Code Quality)**: No dependencies — can start immediately
- **Phase 3 (US8)**: Depends on Phase 2 completion (same file `TeamRegistrationModal.tsx` as US2's T012, so avoid conflicts)
- **Phase 4 (US1 - MVP)**: Depends on Phase 2 completion. No dependency on US8 or other stories.
- **Phase 5 (US2)**: Depends on US1 completion (T013 and T014 both depend on TeamEditModal and TeamDetailPage changes from US1)
- **Phase 6 (US3)**: Depends on Phase 2 completion only — independent of other stories
- **Phase 7 (US4)**: Depends on Phase 2 completion only — independent of other stories
- **Phase 8 (US9)**: Depends on all other phases (tests verify completed features)
- **Phase 9 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US5, US6, US7 (Phase 2)**: Independent — can run in any order or parallel
- **US8 (Phase 3)**: Independent of most stories — affects same file as US2
- **US1 (Phase 4 — MVP)**: Independent — first feature story to implement
- **US2 (Phase 5)**: Depends on US1 (TeamEditModal and TeamDetailPage)
- **US3 (Phase 6)**: Independent — standalone pay modal change
- **US4 (Phase 7)**: Independent — standalone team list enhancement
- **US9 (Phase 8)**: Depends on all features being implemented

### Parallel Opportunities

- All Phase 2 tasks (T001-T005) can run in parallel
- Phase 3 (US8) and Phase 4 (US1) can run in parallel with Phase 6 (US3) and Phase 7 (US4)
- Phase 5 (US2) must wait for Phase 4 (US1) — the edit modal and detail page share files
- All Phase 8 test tasks (T021-T023) can run in parallel

---

## Parallel Example

```bash
# Phase 2 — all code quality tasks in parallel:
Task: "Remove duplicate types in src/api/competitions/types.ts" (T001)
Task: "Complete barrel exports in src/components/competitions/index.ts" (T002)
Task: "Remove unused props from CompetitionsTable" (T003)
Task: "Remove useTeamsWithMembers from hooks" (T004)
Task: "Remove getTeamsWithMembers from API" (T005)

# Phase 4 + Phase 6 + Phase 7 — independent stories in parallel:
Task: "Create TeamEditModal and wire into TeamDetailPage" (T007-T009)
Task: "Add parent selector to pay fee modal" (T015-T017)
Task: "Enhance team list cards with placement/fee data" (T018-T020)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Code Quality Cleanup
2. Complete Phase 4: User Story 1 (Team Edit Modal)
3. **STOP and VALIDATE**: Build passes, team edit works end-to-end
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 2 → Code quality baseline
2. Add US1 (Phase 4) → Team edit working → **MVP ready**
3. Add US8 (Phase 3) → Payload fix for group mode
4. Add US2 (Phase 5) → Instructor assignment
5. Add US3 (Phase 6) → Parent on payments
6. Add US4 (Phase 7) → Richer team lists
7. Add US9 (Phase 8) → Test coverage
8. Phase 9 → Final polish and verification

### Parallel Team Strategy

With multiple developers:
1. Developer A: Phase 2 + Phase 4 (US1) + Phase 5 (US2)
2. Developer B: Phase 2 + Phase 3 (US8) + Phase 6 (US3) + Phase 7 (US4)
3. Developer C: Phase 8 (US9 — tests) anytime after features are stable
4. All converge on Phase 9 together

---

## Notes

- Tests are OPTIONAL: skip Phase 8 for rapid delivery
- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Run `npm run build` after each phase to catch regressions early
- The 3 pre-existing test failures (`GroupsTable.test.tsx`, `SessionsList.test.tsx`, `useGroups.test.ts`) are unrelated to this feature
