# Tasks: Competitions Feature Audit & Quality Fix

**Input**: Design documents from `/specs/014-competitions-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: No test tasks requested in the feature specification. Tests are OPTIONAL and excluded from this task list.

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

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed — this is an audit/remediation of existing code.

_No tasks required._

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure fixes that MUST be complete before ANY user story can be implemented. These address the most critical runtime bugs and type safety issues that affect all downstream work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] Add null-safety guards to `src/api/competitions/competitions.ts` — throw on `response.data.data` null for `getCompetition` and `getCompetitionSummary`
- [ ] T002 [P] Add null-safety guards to `src/api/teams/teams.ts` — throw on `response.data.data` null for `getTeam`, `getTeamMembers`, `addTeamMember`, `updateTeam`
- [ ] T003 [P] Add `competitionFees`, `teamsByCompetition`, `teamsWithMembers`, `studentCompetitions` factory methods to `src/hooks/queryKeys.ts`
- [ ] T004 Add `formatDate` utility function to `src/utils/date.ts` using `Intl.DateTimeFormat`
- [ ] T005 [P] Remove duplicate `TeamDTO`, `TeamMemberDTO`, `TeamWithMembersDTO` from `src/api/competitions/types.ts` — re-export from `src/api/teams/types.ts` instead

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Reliable Competition Data Loading (Priority: P1) 🎯 MVP

**Goal**: Users can view competition details, teams, and summaries without the application crashing due to unexpected API responses or invalid route parameters.

**Independent Test**: Navigate to `/competitions`, select a competition, and verify all data renders without crashes even when API returns edge-case responses (null data, missing fields). Navigate to `/competitions/abc` and verify a user-friendly error is shown.

### Implementation for User Story 1

- [ ] T006 [US1] Add NaN guard to `parseInt(competitionId, 10)` in `src/pages/CompetitionDetailPage.tsx` — show error page for invalid IDs, guard `useTeams(numericId)` call
- [ ] T007 [US1] Add NaN guard to `parseInt(competitionId, 10)` in `src/pages/CompetitionEditPage.tsx` — validate before `updateCompetition` call, fix `location: competition.location ?? undefined` to `?? ''`
- [ ] T008 [US1] Add `enabled` guard to `useTeams` in `src/hooks/teams/useTeams.ts` — prevent query firing with `competitionId=0`
- [ ] T009 [US1] Add `enabled` guard to `useTeamsWithMembers` in `src/hooks/teams/useTeams.ts` — prevent query firing with `competitionId=0`
- [ ] T010 [US1] Migrate `useCompetitionFees` in `src/hooks/finance/useCompetitionFees.ts` from manual useState+useCallback to React Query `useQuery` with `queryKeys.competitionFees(studentId)`
- [ ] T011 [US1] Replace inline query key `['competitions', 'summary', 'empty']` with centralized `queryKeys.competitionSummary(id!)` in `src/hooks/competitions/useCompetitionSummary.ts`
- [ ] T012 [US1] Replace inline query key `['student', studentId, 'competitions']` with `queryKeys.studentCompetitions(studentId)` in `src/hooks/students/useStudentCompetitions.ts`
- [ ] T013 [US1] Replace nested query keys `[queryKeys.teams, queryFilters]` and `[queryKeys.teams, 'with-members', queryFilters]` with centralized factory calls in `src/hooks/teams/useTeams.ts`
- [ ] T014 [US1] Fix `NaN || 0` evaluation in `CompetitionDetailPage.tsx` — use `isNaN(numericId) ? 0 : numericId` for `TeamRegistrationModal` `competitionId` prop
- [ ] T015 [US1] Add NaN validation to mutation calls in `src/hooks/teams/useTeam.ts` — guard `updateTeam` and `removeTeam` against NaN IDs
- [ ] T016 [US1] Add NaN validation to mutation calls in `src/hooks/competitions/useCompetition.ts` — guard `updateCompetition` and `removeCompetition` against NaN IDs

**Checkpoint**: At this point, User Story 1 should be fully functional — no crashes from null responses or invalid IDs

---

## Phase 4: User Story 2 - Accessible Competition Navigation (Priority: P2)

**Goal**: Keyboard-only and screen reader users can navigate between competition tabs, view team details, and interact with all controls using only keyboard input and assistive technology.

**Independent Test**: Navigate the competition detail page using only Tab, Enter, Space, and Escape keys. Verify screen reader announcements match visual content.

### Implementation for User Story 2

- [ ] T017 [US2] Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"` to Modal container, `id="modal-title"` to `<h3>`, Escape key handler, and focus restoration to `src/components/common/Modal.tsx`
- [ ] T018 [US2] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/components/common/datatable/TableActions.tsx` (4 spans: visibility, edit, restore, delete)
- [ ] T019 [US2] Add `role="tablist"`, `aria-label`, and proper `role="tab"`, `aria-selected`, `aria-controls`, `id` attributes to tab navigation in `src/pages/CompetitionDetailPage.tsx`
- [ ] T020 [US2] Add `role="tabpanel"`, `aria-labelledby`, and `id` attributes to tab panels in `src/pages/CompetitionDetailPage.tsx`
- [ ] T021 [US2] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/CompetitionDetailPage.tsx` (12+ spans)
- [ ] T022 [US2] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/CompetitionEditPage.tsx` (2 spans)
- [ ] T023 [US2] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/CompetitionsPage.tsx` (2 spans)
- [ ] T024 [US2] Add `aria-hidden="true"` to all Material Symbols icon spans in `src/pages/TeamDetailPage.tsx` (12+ spans)
- [ ] T025 [US2] Add `aria-hidden="true"` to Material Symbols icon spans in `src/components/competitions/CategoryList.tsx`, `CategoryTeamsModal.tsx`, `CompetitionCard.tsx`, `CompetitionForm.tsx`, `TeamRegistrationModal.tsx`
- [ ] T026 [US2] Add `aria-hidden="true"` to Lucide React icons in `src/components/student/CompetitionsTab.tsx` (Trophy, Medal, Calendar)
- [ ] T027 [US2] Convert clickable `<div>` to `<button>` with keyboard support in `src/components/competitions/CompetitionCard.tsx` — add `role="button"`, `tabIndex={0}`, `onKeyDown` handler
- [ ] T028 [US2] Convert clickable `<div>` to `<button>` with keyboard support in `src/components/competitions/CategoryTeamsModal.tsx` — team navigation items
- [ ] T029 [US2] Convert clickable `<div>` to `<button>` with keyboard support in `src/pages/CompetitionDetailPage.tsx` — team card navigation items
- [ ] T030 [US2] Add `htmlFor`/`id` label association to placement rank and label inputs in `src/pages/TeamDetailPage.tsx`
- [ ] T031 [US2] Wrap each tab panel in `<ErrorBoundary>` with custom fallback in `src/pages/CompetitionDetailPage.tsx` — import from `src/components/common/ErrorBoundary.tsx`
- [ ] T032 [US2] Add `aria-live="polite"` and `aria-busy` with screen reader text to loading states in `src/pages/CompetitionDetailPage.tsx` and `src/pages/CompetitionsPage.tsx`

**Checkpoint**: At this point, all competition pages should be fully accessible via keyboard and screen readers

---

## Phase 5: User Story 3 - Stable Team Registration Flow (Priority: P3)

**Goal**: Admins can complete the team registration form without type errors, validation failures, or unexpected behavior caused by unsafe type handling.

**Independent Test**: Register a team through the UI with various inputs (valid, edge-case, invalid) and verify correct behavior at each step.

### Implementation for User Story 3

- [ ] T033 [US3] Replace unsafe `err as {...}` cast with proper type guard in `src/components/competitions/TeamRegistrationModal.tsx` catch clause
- [ ] T034 [US3] Replace unsafe `err as {...}` cast with proper type guard in `src/pages/CompetitionDetailPage.tsx` catch clause (delete competition handler)
- [ ] T035 [US3] Replace unsafe `err as {...}` cast with proper type guard in `src/pages/CompetitionsPage.tsx` catch clause
- [ ] T036 [US3] Replace unsafe `err as {...}` cast with proper type guard in `src/pages/TeamDetailPage.tsx` catch clauses (4 locations: add member, remove member, pay fee, update placement)
- [ ] T037 [US3] Remove unsafe `cleanedData as CreateCompetitionInput` cast in `src/components/competitions/CompetitionForm.tsx` — fix type at source
- [ ] T038 [US3] Remove unsafe `data as UpdateCompetitionInput` cast in `src/pages/CompetitionEditPage.tsx` — fix type at source
- [ ] T039 [US3] Remove unsafe `data as CreateCompetitionInput` cast in `src/pages/CompetitionsPage.tsx` — fix type at source

**Checkpoint**: At this point, team registration and all mutation flows have proper error typing

---

## Phase 6: User Story 4 - Consistent Code Quality & Maintainability (Priority: P4)

**Goal**: Developers can rely on consistent patterns for data fetching, type safety, and code organization without dead code or duplicated logic confusing the codebase.

**Independent Test**: Run lint, type-check, and build commands with zero errors. Confirm no dead exports or duplicated implementations exist.

### Implementation for User Story 4

- [ ] T040 [US4] Remove unused `useTeamsWithMembers` export from `src/hooks/teams/index.ts` barrel file
- [ ] T041 [US4] Remove unused `useCompetitionFees` and `UseCompetitionFeesResult` exports from `src/hooks/finance/index.ts` barrel file
- [ ] T042 [US4] Remove unused `competitionColumns` export from `src/components/competitions/index.ts` barrel file
- [ ] T043 [US4] Remove unused `onEdit`, `onRestore` props and `actionLabels.edit`, `actionLabels.restore` from `src/components/competitions/CompetitionsTable.tsx`
- [ ] T044 [US4] Remove redundant `export default CompetitionsTab` from `src/components/student/CompetitionsTab.tsx`
- [ ] T045 [US4] Add explicit return type annotations to 5 exported hooks in `src/hooks/useStudentActivity.ts`
- [ ] T046 [US4] Replace `object` type with `Record<string, unknown>` for query key params in `src/hooks/useStudentActivity.ts` (4 locations)
- [ ] T047 [US4] Add explicit `: unknown` type to catch clause in `src/hooks/finance/useCompetitionFees.ts`
- [ ] T048 [US4] Replace raw `toLocaleDateString()` with `formatDate` utility in `src/components/competitions/CompetitionColumns.tsx`
- [ ] T049 [US4] Replace raw ISO date rendering with `formatDate` utility in `src/components/student/CompetitionsTab.tsx`
- [ ] T050 [US4] Fix "Participation Medals" label to "Participation" in `src/components/student/CompetitionsTab.tsx`
- [ ] T051 [US4] Move `CompetitionRecord` interface from inline definition in `src/components/student/CompetitionsTab.tsx` to `src/api/competitions/types.ts` and import it

**Checkpoint**: All dead code removed, type annotations complete, date formatting consistent

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all user stories

- [ ] T052 [P] Run `npm run lint` and fix all remaining errors
- [ ] T053 [P] Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T054 [P] Run `npm run test` and verify all existing tests pass
- [ ] T055 Verify no remaining `: any` types in competition-related files
- [ ] T056 Verify no remaining `console.log` statements in competition-related files
- [ ] T057 Verify no remaining inline query keys (grep for `queryKey: \['`) in competition-related hooks
- [ ] T058 Verify no remaining `useEffect.*fetch` patterns in competition-related hooks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (no tasks needed)
- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) — No dependencies on other stories

### Within Each User Story

- API fixes before hook fixes
- Hook fixes before component fixes
- Component fixes before page assembly
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T001–T005)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within US2: All `aria-hidden` additions across different files can run in parallel (T018, T021–T026)
- Within US3: All error type guard replacements across different files can run in parallel (T033–T039)
- Within US4: All dead export removals across different files can run in parallel (T040–T044)
- Polish tasks marked [P] can run in parallel (T052–T054)

---

## Parallel Example: Foundational Phase

```bash
# Launch all parallel foundational tasks together:
Task: "Add null-safety to src/api/competitions/competitions.ts" (T001)
Task: "Add null-safety to src/api/teams/teams.ts" (T002)
Task: "Add query key factories to src/hooks/queryKeys.ts" (T003)
Task: "Remove duplicate types from src/api/competitions/types.ts" (T005)
```

## Parallel Example: User Story 2 (Accessibility)

```bash
# Launch all aria-hidden additions together (different files):
Task: "Add aria-hidden to TableActions.tsx" (T018)
Task: "Add aria-hidden to CompetitionDetailPage.tsx" (T021)
Task: "Add aria-hidden to CompetitionEditPage.tsx" (T022)
Task: "Add aria-hidden to CompetitionsPage.tsx" (T023)
Task: "Add aria-hidden to TeamDetailPage.tsx" (T024)
Task: "Add aria-hidden to competition components" (T025)
Task: "Add aria-hidden to CompetitionsTab.tsx" (T026)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Navigate to `/competitions`, test invalid IDs, verify no crashes
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (runtime bugs)
   - Developer B: User Story 2 (accessibility)
   - Developer C: User Story 3 (type safety)
   - Developer D: User Story 4 (code quality)
3. Stories complete and integrate independently
4. Polish phase verifies all changes together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Total tasks**: 58
- **Tasks per story**: US1=11, US2=16, US3=7, US4=12, Foundational=5, Polish=7
- **Parallel opportunities**: 15 tasks marked [P] across all phases
