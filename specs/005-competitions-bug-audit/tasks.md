# Tasks: Competitions Bug Audit

**Input**: Design documents from `/specs/005-competitions-bug-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

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
  - Types: `src/types/` and `src/api/{domain}/types.ts`
  - Tests: `src/tests/`
- Path examples assume this pattern; adjust domain folder as needed.

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Verify actual backend responses and establish source-of-truth types. Everything else depends on knowing what the backend actually returns.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 Start dev server (`npm run dev`), login as admin, enable API debug (`localStorage.setItem('api_debug', 'true')`), and capture raw responses for all competition endpoints with `console.log` output recorded
- [ ] T002 [P] Verify `GET /competitions` response format (flat array vs paginated wrapper) and query params actually accepted — log to console
- [ ] T003 [P] Verify `GET /competitions/{id}/categories` actual response shape (strings vs entities) — log to console
- [ ] T004 [P] Verify `GET /academics/groups/{id}/teams` field names (`team_name` vs `name`) — log to console
- [ ] T005 [P] Verify `GET /academics/groups/{id}/competitions/analytics` field names — log to console
- [ ] T006 [P] Verify existence of undocumented endpoints: `GET /competitions/{id}/stats`, `GET .../categories/{catId}/teams`, `POST /competitions/register-team`, `POST .../team-members/{id}/mark-paid` — log status codes
- [ ] T007 Consolidate all captured responses into `research.md` with raw JSON traces replacing the doc-only analysis

**Checkpoint**: All 10 endpoint mismatches verified against live backend. `research.md` updated with actual response traces.

---

## Phase 2: User Story 1 — View Competition Categories (Priority: P1) 🎯 MVP

**Goal**: Fix the Categories tab so it correctly renders competition categories using the actual backend response shape.

**Independent Test**: Open any competition with registered teams → click Categories tab → see properly rendered category cards with the data the backend actually provides.

- [ ] T008 [P] [US1] Update `CompetitionCategory` interface in `src/api/competitions/types.ts` to match the actual backend response shape (documented as `CategoryResponse`: `{ category: string, subcategories: string[] }`)
- [ ] T009 [P] [US1] Update `CategoryList.tsx` in `src/components/competitions/` to render from the corrected `CompetitionCategory` type — adapt card display to show category name and subcategories
- [ ] T010 [US1] Update `docs/api/competitions/schemas.md` to document the `CompetitionCategory` / `CategoryResponse` schema as actually returned by the backend
- [ ] T011 [US1] Verify Categories tab renders without console errors by navigating through competition detail → Categories tab

**Checkpoint**: Categories tab displays correctly with actual backend data. No undefined field access.

---

## Phase 3: User Story 2 — Register a Team for a Competition Category (Priority: P1)

**Goal**: Fix team registration so the frontend sends the correct endpoint and payload format matching the backend.

**Independent Test**: Open a competition category → click Register Team → fill form → submit → team appears in category's team list.

- [ ] T012 [P] [US2] Update `RegisterTeamInput` interface in `src/api/competitions/types.ts` to match the actual backend payload format (from verification: either flat `{ competition_id, team_name, category, student_ids }` or current nested `{ competition_id, category_id, team_name, members }`)
- [ ] T013 [P] [US2] Fix `registerTeam()` function in `src/api/competitions/competitions.ts` to call the correct endpoint and send the correct payload
- [ ] T014 [P] [US2] Fix `getCategoryTeams()` function in `src/api/competitions/competitions.ts` — align endpoint and response unwrapping
- [ ] T015 [P] [US2] Fix `markCompetitionFeePaid()` function in `src/api/competitions/competitions.ts` — align endpoint
- [ ] T016 [P] [US2] Fix `getCompetitionStats()` function in `src/api/competitions/competitions.ts` — align endpoint and response handling
- [ ] T017 [P] [US2] Update `TeamRegistration` and `TeamMember` interfaces in `src/api/competitions/types.ts` to match actual backend response
- [ ] T018 [US2] Update `TeamRegistrationModal.tsx` in `src/components/competitions/` to submit the corrected payload format
- [ ] T019 [US2] Update `useCompetitionTeams.ts` in `src/hooks/competitions/` if the hook's return type needs adjustment
- [ ] T020 [US2] Navigate the full registration flow — open category → register team → verify team appears in list — with zero console errors

**Checkpoint**: Team registration works end-to-end. Can register, see team in list, view stats.

---

## Phase 4: User Story 3 — Browse and Filter Competitions List (Priority: P2)

**Goal**: Fix competitions list pagination and filtering to match actual backend capabilities.

**Independent Test**: Open competitions page → navigate to page 2 → apply search → see filtered results.

- [ ] T021 [P] [US3] Update `getCompetitions()` params in `src/api/competitions/competitions.ts` to use the actual backend query params (documented as `include_deleted` or verified alternative)
- [ ] T022 [P] [US3] Fix `getCompetitions()` response handling in `src/api/competitions/competitions.ts` to unwrap the actual response format (flat list vs paginated `{ data, total, skip, limit }`)
- [ ] T023 [US3] Update `useCompetitions.ts` in `src/hooks/competitions/` if the query hook's data structure changes
- [ ] T024 [US3] Update `GetCompetitionsParams` interface in `src/api/competitions/types.ts` if param names change
- [ ] T025 [US3] Update `docs/api/competitions/competitions.md` — document the actual query parameters and response format

**Checkpoint**: Competition list loads with correct pagination. Page navigation and search work without errors.

---

## Phase 5: User Story 4 — View Group Competition Information (Priority: P2)

**Goal**: Fix group competition team names and analytics display by aligning frontend field names with backend response.

**Independent Test**: Open a group detail page → view teams list → team names display correctly → view competition history tab → analytics show correct data.

- [ ] T026 [P] [US4] Update `TeamPublic` interface in `src/api/academics/types/groups/competitions.ts` to use the actual backend field names (e.g., `team_name` instead of `name`)
- [ ] T027 [P] [US4] Update `GroupCompetitionHistoryResponseDTO` in `src/api/academics/types/groups/competitions.ts` to match actual backend field names (e.g., `participations[]`, `total_participations`)
- [ ] T028 [P] [US4] Update `CompetitionParticipationDTO` in `src/api/academics/types/groups/competitions.ts` to align with backend response
- [ ] T029 [US4] Update components in `src/components/groups/history/CompetitionRecords.tsx` that consume the aligned types
- [ ] T030 [US4] Update `useGroupCompetitions.ts` in `src/hooks/` if hook return types changed

**Checkpoint**: Group page shows correct team names and competition analytics data with no undefined fields.

---

## Phase 6: User Story 5 — View Student Competition Records (Priority: P3)

**Goal**: Ensure the student competitions tab gracefully handles the empty state (backend stub).

**Independent Test**: Open a student detail page → click Competitions tab → see graceful empty state or "coming soon" message instead of broken UI.

- [ ] T031 [P] [US5] Update `CompetitionsTab.tsx` in `src/components/student/` to show a clear "Competition history coming soon" or empty state message when the stub returns `[]`
- [ ] T032 [US5] Add a comment in `src/api/crm/students/enrollments.ts` noting the documented endpoint path from `teams.md` (`GET /students/{id}/competitions`) for future backend implementation

**Checkpoint**: Student competitions tab shows graceful empty state with no console errors.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation alignment, build verification, and final cleanup.

- [ ] T033 [P] Update `docs/api/competitions/competitions.md` to document all endpoint paths including `GET .../stats`, `GET .../categories/{catId}/teams`, `POST .../team-members/{id}/mark-paid`, `POST /competitions/register-team` with correct schemas
- [ ] T034 [P] Update `docs/api/competitions/schemas.md` to include all response/request schemas that match actual backend contracts
- [ ] T035 [P] Update `docs/api/competitions/README.md` — add note about `/teams/*` endpoints being legacy/unused by frontend if confirmed
- [ ] T036 Run `npm run build` and fix any TypeScript errors
- [ ] T037 Run `npm run lint` and fix any lint errors
- [ ] T038 Run `npm run test` and verify no regressions
- [ ] T039 Navigate the full competitions flow end-to-end: list → detail → categories → teams → summary → delete/restore — with zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — verification tasks can run immediately. ⚠️ BLOCKS all user stories.
- **User Stories (Phases 2-6)**: All depend on Foundational phase completing (actual response shapes known)
  - US1 (Categories) can start after Foundational
  - US2 (Team Registration) can start after Foundational — no dependency on US1
  - US3 (List Competitions) can start after Foundational — no dependency on US1/US2
  - US4 (Group Competitions) can start after Foundational — no dependency on US1-3
  - US5 (Student Competitions) can start after Foundational — no dependency on US1-4
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — independently testable
- **US2 (P1)**: No dependencies on other stories — independently testable
- **US3 (P2)**: No dependencies on other stories — independently testable
- **US4 (P2)**: No dependencies on other stories — independently testable
- **US5 (P3)**: No dependencies on other stories — independently testable

### Within Each User Story

- Types before API functions
- API functions before components/hooks
- Component adapt before page verification
- Doc updates last within story

### Parallel Opportunities

- All Foundational [P] tasks (T002-T006) can run in parallel after T001
- US1 and US2 are both P1 and have no shared dependencies — can run in parallel
- US3 and US4 (both P2) can each start immediately after Foundational
- US5 (P3) can start at any time after Foundational
- All [P]-marked tasks within a story can run in parallel
- Doc updates (T033-T035) can run in parallel with build verification (T036-T038)

---

## Parallel Example: Foundational Phase

```bash
# Launch all endpoint verification tasks together:
Task: T002 "Verify GET /competitions response format and params"
Task: T003 "Verify GET /competitions/{id}/categories response shape"
Task: T004 "Verify GET /academics/groups/{id}/teams field names"
Task: T005 "Verify GET /academics/groups/{id}/competitions/analytics"
Task: T006 "Verify undocumented endpoints existence"
```

## Parallel Example: User Story 2

```bash
# Launch all type and API alignment tasks together:
Task: T012 "Update RegisterTeamInput interface"
Task: T013 "Fix registerTeam() endpoint and payload"
Task: T014 "Fix getCategoryTeams() endpoint"
Task: T015 "Fix markCompetitionFeePaid() endpoint"
Task: T016 "Fix getCompetitionStats() endpoint"
Task: T017 "Update TeamRegistration and TeamMember interfaces"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational — verify actual API responses
2. Complete Phase 2: User Story 1 — fix categories tab
3. **STOP and VALIDATE**: Test Categories tab independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → All response shapes verified
2. Add US1 (Categories) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Team Registration) → Test independently → Deploy/Demo
4. Add US3 (List) → Test independently → Deploy/Demo
5. Add US4 (Group) → Test independently → Deploy/Demo
6. Add US5 (Student) → Test independently → Polish → Deploy

### Parallel Team Strategy

With multiple developers:

1. All: Complete Foundational together (T001-T007)
2. Once Foundational is done, split:
   - Developer A: US1 (Categories) + US5 (Student — quick win)
   - Developer B: US2 (Team Registration) + US3 (List)
   - Developer C: US4 (Group) + Doc updates
3. Stories have zero cross-dependencies — each developer works independently
4. Final polish together

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 39 |
| **Foundational (Phase 1)** | 7 tasks |
| **US1 — Categories** | 4 tasks |
| **US2 — Team Registration** | 9 tasks |
| **US3 — List Competitions** | 5 tasks |
| **US4 — Group Competition** | 5 tasks |
| **US5 — Student Competitions** | 2 tasks |
| **Polish (Phase 7)** | 7 tasks |
| **Parallel [P] tasks** | 21 tasks (54%) |
| **Independent stories** | 5/5 stories (zero cross-dependencies) |
