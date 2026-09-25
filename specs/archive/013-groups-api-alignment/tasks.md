---

description: "Task list for Groups API Alignment feature"
---

# Tasks: Groups API Alignment

**Input**: Design documents from `/specs/013-groups-api-alignment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/groups-api-frontend.md

**Tests**: Not requested in feature specification. Build gates (`npm run lint` + `npm run build`) serve as verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/academics/groups/`
  - Types: `src/api/academics/types/groups/`
  - Components: `src/components/groups/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/GroupsPage.tsx`, `src/pages/GroupDetailPage.tsx`
  - Utils: `src/utils/`
  - Tests: `src/tests/`

---

## Phase 1: Foundational — Type & API Layer Alignment

**Purpose**: Core type and API changes that ALL user stories depend on. MUST complete before any user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 [P] Update `Group` type in `src/api/academics/types/groups/models.ts` — rename `group_name` → `name`, `max_capacity` → `capacity`, replace flat `default_day`/`default_time_start`/`default_time_end` with nested `schedule: { day, start_time, end_time }`, add `start_date: string`, change status union from `'active' | 'inactive' | 'archived' | 'completed'` to `'active' | 'inactive' | 'completed'`
- [x] T002 [P] Update `EnrichedGroupPublic` type in `src/api/academics/types/groups/models.ts` — align with new field names (`name`, `capacity`, `schedule`), remove `'archived'` from status union
- [x] T003 [P] Update `ScheduleGroupInput` in `src/api/academics/types/groups/inputs.ts` — add `name`, `capacity`, `schedule` (nested object), `start_date`; remove `default_day`, `default_time_start`, `default_time_end`, `max_capacity`
- [x] T004 [P] Update `UpdateGroupDTO` in `src/api/academics/types/groups/inputs.ts` — align with new PATCH contract fields (`name`, `capacity`, `schedule`, `instructor_id`, `notes`); remove `level_number`
- [x] T005 [P] Delete `src/api/academics/types/groups/competitions.ts` and remove all competition type re-exports from `src/api/academics/types/groups/index.ts`
- [x] T006 [P] Delete `src/api/academics/groups/competitions.ts` and remove all competition function re-exports from `src/api/academics/groups/index.ts`
- [x] T007 Remove `getGroupsWithCompetitions` export from `src/api/academics/groups/utils.ts` and remove its re-export from `src/api/academics/groups/index.ts`
- [x] T008 Create schedule transform utilities in `src/utils/scheduleTransform.ts` — `formToSchedule(day, startTime, endTime): Schedule` and `scheduleToForm(schedule): { day, startTime, endTime }`
- [x] T009 Update `createGroup` function in `src/api/academics/groups/core.ts` to use new `ScheduleGroupInput` type
- [x] T010 Update `updateGroup` function in `src/api/academics/groups/core.ts` to use new `UpdateGroupDTO` type
- [x] T011 Add `searchGroups(query, status?)` API function in `src/api/academics/groups/core.ts` — `GET /academics/groups/search`
- [x] T012 Add `getArchivedGroups(params?)` API function in `src/api/academics/groups/core.ts` — `GET /academics/groups/archived`
- [x] T013 Add `getGroupsByCourse(courseId)` API function in `src/api/academics/groups/core.ts` — `GET /academics/groups/by-course/{course_id}`
- [x] T014 Add `getGroupsByType(groupType)` API function in `src/api/academics/groups/core.ts` — `GET /academics/groups/by-type/{group_type}`
- [x] T015 Update `listSessionsForGroup` in `src/api/academics/groups/core.ts` to accept optional `level` query param
- [x] T016 Add new query keys in `src/hooks/queryKeys.ts`: `groupsArchived`, `groupsByCourse(id)`, `groupsByType(type)`, `groupSearch(q, s)`
- [x] T017 Run `npm run build` and fix all TypeScript errors from type changes

**Checkpoint**: Foundation ready — all types, API functions, and utilities aligned with new contract.

---

## Phase 2: User Story 1 — View and manage groups with updated API contracts (Priority: P1) 🎯 MVP

**Goal**: Group CRUD operations work end-to-end with new API response/request shapes. Users can create, list, update, and view groups with correct data display.

**Independent Test**: Navigate to `/groups`, verify groups load with correct fields. Create a new group via form, verify it appears. Edit a group, verify changes persist.

### Implementation for User Story 1

- [x] T018 [P] [US1] Create React Query hooks for new API functions in `src/hooks/useGroupQueries.ts` — `useSearchGroups(query, status?)`, `useArchivedGroups(params?)`, `useGroupsByCourse(courseId)`, `useGroupsByType(groupType)` with proper `staleTime` and cache invalidation
- [x] T019 [P] [US1] Update `useGroups` hook in `src/hooks/useGroups.ts` to use new `Group` type fields (`name`, `capacity`, `schedule`)
- [x] T020 [P] [US1] Update `useGroupDetail` hook in `src/hooks/useGroupDetail.ts` to use new `EnrichedGroupPublic` type and `schedule` field
- [x] T021 [P] [US1] Update `useGroupMutations` hook in `src/hooks/useGroupMutations.ts` to use new `ScheduleGroupInput` and `UpdateGroupDTO` types; add cache invalidation for `groupsArchived` key on create/update/delete
- [x] T022 [US1] Update `GroupStatusBadge` in `src/components/groups/shared/GroupStatusBadge.tsx` — replace `'archived'` with `'completed'` in status union and label mapping
- [x] T023 [US1] Update `EditGroupDialog` in `src/components/groups/detail/EditGroupDialog.tsx` — replace `'archived'` with `'completed'` in status dropdown; use `scheduleToForm` for initial values and `formToSchedule` on submit
- [x] T024 [US1] Update group form component (wherever group create/edit form lives) — use flat form fields (`default_day`, `default_time_start`, `default_time_end`) with `scheduleToForm`/`formToSchedule` transform at submit boundary
- [x] T025 [US1] Update `GroupsPage` in `src/pages/GroupsPage.tsx` — replace all references to old `Group` fields (`group_name`, `max_capacity`, `default_day`, etc.) with new fields (`name`, `capacity`, `schedule.day`, etc.)
- [x] T026 [US1] Update `GroupDetailPage` in `src/pages/GroupDetailPage.tsx` — replace old field references with new `schedule` object access patterns
- [x] T027 [US1] Update any remaining group-related components that reference old type fields (search across `src/components/groups/` for `group_name`, `max_capacity`, `default_day`, `default_time_start`, `default_time_end`)
- [x] T028 [US1] Run `npm run build` — verify zero TypeScript errors for US1 changes
- [x] T029 [US1] Run `npm run lint` — verify zero lint errors for US1 changes

**Checkpoint**: User Story 1 complete — group CRUD works with new API shapes.

---

## Phase 3: User Story 2 — Search, filter, and browse groups using new directory endpoints (Priority: P2)

**Goal**: Users can search groups by name (server-side), browse completed groups via "Completed" tab, and filter groups by course or type.

**Independent Test**: Navigate to `/groups`, type a search query, verify server-side search results. Toggle "Completed" tab, verify archived groups load.

### Implementation for User Story 2

- [x] T030 [P] [US2] Add "Completed" tab toggle to `GroupsPage` in `src/pages/GroupsPage.tsx` — when active, fetches from `useArchivedGroups()` instead of default groups list
- [x] T031 [P] [US2] Replace client-side search in `GroupsPage` with server-side search — when search query is non-empty, use `useSearchGroups(query)` hook; when empty, fall back to default list with client-side filtering
- [x] T032 [US2] Update `CourseDetailPage` (if it displays groups) to use `useGroupsByCourse(courseId)` hook instead of client-side filtering
- [x] T033 [US2] Add cache invalidation for `groupsArchived` and `groupSearch` keys in `useGroupMutations` when groups are created, updated, or archived
- [x] T034 [US2] Run `npm run build` — verify zero TypeScript errors for US2 changes
- [x] T035 [US2] Run `npm run lint` — verify zero lint errors for US2 changes

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 4: User Story 3 — Remove deprecated competition endpoints and UI from groups API (Priority: P3)

**Goal**: Eliminate all references to removed competition-group endpoints. No 404 errors at runtime, no dead code.

**Independent Test**: Navigate to `/groups/:id`, verify page loads without competition API calls. Run `npm run build`, verify zero TypeScript errors from removed competition types.

### Implementation for User Story 3

- [x] T036 [P] [US3] Delete `src/hooks/useGroupCompetitions.ts` — the hook that calls removed competition endpoints
- [x] T037 [US3] Update `GroupDetailPage` in `src/pages/GroupDetailPage.tsx` — remove `useGroupCompetitions` import and usage, remove `competitions` state, remove competition-related props from `HistoryTab`
- [x] T038 [US3] Update `HistoryTab` component (wherever it lives under `src/components/groups/`) — remove `competitions` prop and any competition-related rendering
- [x] T039 [US3] Search and remove any remaining imports of removed competition functions/types across `src/` (search for `getGroupCompetitions`, `getGroupTeams`, `CompetitionParticipationDTO`, `TeamPublic`, etc.)
- [x] T040 [US3] Run `npm run build` — verify zero TypeScript errors from competition removal
- [x] T041 [US3] Run `npm run lint` — verify zero unused import warnings from competition removal

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup across all changes.

- [x] T042 [P] Run `npm run lint` — fix all remaining errors
- [x] T043 [P] Run `npm run build` — verify `tsc -b && vite build` passes with zero errors
- [x] T044 [P] Run `npm run test` — verify all existing tests still pass (3 pre-existing failures unrelated to changes; 54 tests pass)
- [x] T045 Verify React Query cache invalidation covers all affected keys after mutations (groups list, archived, search, individual group, enriched)
- [ ] T046 Manual smoke test: navigate to `/groups`, `/groups/:id`, create/edit a group, toggle "Completed" tab, search for groups — verify all work without errors
- [ ] T047 Remove any `console.log` or debug statements added during development

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS all user stories.
- **User Story 1 (Phase 2)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 3)**: Depends on Foundational phase completion. Can start after US1 or in parallel if team capacity allows.
- **User Story 3 (Phase 4)**: Depends on Foundational phase completion. Can start after US1 or in parallel.
- **Polish (Phase 5)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories — independently testable after Foundational.
- **User Story 2 (P2)**: Depends on US1 type/API changes (Foundational phase). Integrates with `GroupsPage` modified by US1.
- **User Story 3 (P3)**: No dependencies on US1 or US2 — pure removal task. Can run in parallel with US1 or US2 after Foundational.

### Within Each User Story

- API functions before hooks
- Hooks before components
- Components before page assembly
- Build + lint verification last

### Parallel Opportunities

- All Foundational tasks T001–T007, T011–T016 are parallelizable (different files, no inter-dependencies)
- T008 (schedule transform) is independent and can run alongside T001–T007
- T009–T010 depend on T003–T004 (type updates) — run after those complete
- T017 (build verification) must wait for all Foundational tasks
- US1 tasks T018–T021 are parallelizable (different hook files)
- US1 tasks T022–T027 are sequential (components depend on hooks)
- US2 tasks T030–T031 are parallelizable (different features on same page)
- US3 tasks T036–T039 are parallelizable (different files)

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent type updates together:
Task T001: Update Group type in models.ts
Task T002: Update EnrichedGroupPublic type in models.ts
Task T003: Update ScheduleGroupInput in inputs.ts
Task T004: Update UpdateGroupDTO in inputs.ts
Task T005: Delete competitions.ts types + update index.ts
Task T006: Delete competitions.ts API + update index.ts
Task T007: Remove getGroupsWithCompetitions from utils.ts + index.ts
Task T008: Create scheduleTransform.ts utilities
Task T011: Add searchGroups API function
Task T012: Add getArchivedGroups API function
Task T013: Add getGroupsByCourse API function
Task T014: Add getGroupsByType API function
Task T015: Update listSessionsForGroup with level param
Task T016: Add new query keys in queryKeys.ts

# Then run dependent tasks:
Task T009: Update createGroup function (depends on T003)
Task T010: Update updateGroup function (depends on T004)
Task T017: Run npm run build (depends on all above)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational — all types, API functions, utilities aligned
2. Complete Phase 2: User Story 1 — group CRUD works with new shapes
3. **STOP and VALIDATE**: Run `npm run build` + `npm run lint` + manual smoke test
4. Commit and demo if ready

### Incremental Delivery

1. Complete Foundational → Types and API layer ready
2. Add User Story 1 → Group CRUD works with new shapes → Build passes → Commit
3. Add User Story 2 → Search + Completed tab → Build passes → Commit
4. Add User Story 3 → Competition cleanup → Build passes → Commit
5. Polish phase → Final verification → Commit

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational together (T001–T017)
2. Once Foundational is done:
   - Developer A: User Story 1 (T018–T029)
   - Developer B: User Story 2 (T030–T035)
   - Developer C: User Story 3 (T036–T041)
3. Stories complete and integrate independently
4. Polish phase (T042–T047) after all stories done

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `schedule` field transform (T008) is critical — all form components depend on it
- Competition removal (US3) is pure deletion — low risk but high impact on build cleanliness
- Status change `'archived'` → `'completed'` affects multiple files — search across entire `src/` for `'archived'` to ensure no missed references
