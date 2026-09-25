# Tasks: Competitions Bug Audit & API-UI Gap Analysis

**Input**: Design documents from `specs/005-competitions-bug-audit/`
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
  - Types: `src/api/{domain}/types.ts`
  - Tests: `src/tests/`
- Path examples assume this pattern; adjust domain folder as needed.

---

## Phase 1: Foundational — Live Backend Verification (Blocking Prerequisites)

**Purpose**: Verify actual backend responses against the (now-aligned) frontend types. Everything else depends on knowing what the backend actually returns.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

**Note**: Code audit confirms frontend types already match doc schemas for all endpoints except student competitions. This phase verifies the backend actually serves what the docs promise.

- [ ] T001 Start dev server (`npm run dev`), login as admin, enable API debug (`localStorage.setItem('api_debug', 'true')`), and capture raw responses for all competition endpoints
- [ ] T002 [P] Verify `GET /competitions` response format is flat `CompetitionDTO[]` (not paginated wrapper) and `include_deleted` is accepted
- [ ] T003 [P] Verify `GET /competitions/{id}/categories` returns `CategoryResponse[]` (`{ category: string, subcategories: string[] }`) — this confirms the frontend `CategoryResponse` type is correct
- [ ] T004 [P] Verify `GET /academics/groups/{id}/teams` uses `team_name` (not `name`) — confirms frontend `TeamPublic` field is aligned
- [ ] T005 [P] Verify `GET /academics/groups/{id}/competitions/analytics` uses `participations[]` field names — confirms frontend `GroupCompetitionHistoryResponseDTO` alignment
- [ ] T006 [P] Verify the `POST /teams` endpoint accepts flat `RegisterTeamInput` with `student_ids` array — confirms `TeamRegistrationModal` sends correct payload
- [ ] T007 Consolidate all captured responses into `research.md` with raw JSON traces replacing the doc-only analysis

**Checkpoint**: All 7 verified endpoints confirmed matching both docs and frontend types. `research.md` updated with live traces.

---

## Phase 2: User Story 1 — View Competition Categories (Priority: P1) 🎯 MVP

**Goal**: Ensure the Categories tab renders correctly using the string-based `CategoryResponse` type.

**Independent Test**: Open any competition with registered teams → click Categories tab → see properly rendered category cards showing category name and subcategories.

**Note**: Code audit confirms `CategoryResponse` type and `CategoryList` component are already aligned to the string-based schema. The task is to verify against live data and fix rendering issues.

- [ ] T008 [P] [US1] Navigate to competition detail → Categories tab with live data — confirm category cards render without console errors
- [ ] T009 [P] [US1] Test categories empty state — open a competition with no teams → confirm "No categories yet" message displays
- [ ] T010 [US1] Fix any rendering issues in `CategoryList.tsx` (`src/components/competitions/CategoryList.tsx`) discovered during live verification (e.g., missing fields, layout breaks)
- [ ] T011 [US1] Verify all tabs render without console errors after Categories tab has loaded data

**Checkpoint**: Categories tab displays correctly with actual backend data. No undefined field access.

---

## Phase 3: User Story 2 — Register a Team for a Competition Category (Priority: P1)

**Goal**: Ensure team registration works end-to-end with the correct endpoint and payload.

**Independent Test**: Open a competition category → click Register Team → fill form → submit → team appears in category's team list.

**Note**: Code audit confirms `RegisterTeamInput` uses flat `student_ids` payload and `registerTeam()` calls `POST /teams`. Need end-to-end verification.

- [ ] T012 [P] [US2] Verify the team registration flow — open CategoryList, click Register Team, fill form in `TeamRegistrationModal.tsx` (`src/components/competitions/TeamRegistrationModal.tsx`), submit
- [ ] T013 [P] [US2] Confirm the registered team appears in the Teams tab of `CompetitionDetailPage.tsx` (`src/pages/CompetitionDetailPage.tsx`) after successful registration
- [ ] T014 [US2] Fix any errors in `TeamRegistrationModal.tsx` discovered during live flow (e.g., validation, error display, competition_id placeholder of `0`)
- [ ] T015 [US2] Fix `registerTeam()` call in `CompetitionDetailPage.tsx` if the `competition_id: 0` placeholder in the modal needs to be replaced with the actual competition ID
- [ ] T016 [US2] Verify team detail page at `/teams/{id}` renders correctly for the newly registered team

**Checkpoint**: Team registration works end-to-end. Can register, see team in list, view details.

---

## Phase 4: User Story 3 — Browse and Filter Competitions List (Priority: P2)

**Goal**: Ensure the competitions list paginates and filters correctly.

**Independent Test**: Open competitions page → verify list loads → navigate pages → apply search → see filtered results.

**Note**: Code audit confirms `getCompetitions()` only accepts `include_deleted` and returns flat `Competition[]`. No extra params or pagination wrapper. The page must handle flat lists gracefully.

- [ ] T017 [P] [US3] Verify `CompetitionsPage.tsx` (`src/pages/CompetitionsPage.tsx`) renders the competition list correctly with a flat array response (no pagination wrapper)
- [ ] T018 [P] [US3] Navigate to page 2 (if paginated) or confirm the UI handles a flat list without breaking — fix `CompetitionsPage.tsx` if it expects `total`/`skip`/`limit` from a paginated wrapper
- [ ] T019 [US3] Test the trash toggle (include_deleted) — confirm deleted competitions show when toggled
- [ ] T020 [US3] Verify create/edit competition form (`CompetitionForm.tsx` at `src/components/competitions/CompetitionForm.tsx`) submits correctly with the aligned `CreateCompetitionInput`

**Checkpoint**: Competition list loads correctly. Pagination/trash toggle work without console errors.

---

## Phase 5: User Story 4 — View Group Competition Information (Priority: P2)

**Goal**: Ensure group competition team names and analytics display with correct field names.

**Independent Test**: Open a group detail page → view teams list → team names display correctly → view competition history tab → analytics show correct data.

**Note**: Code audit confirms `TeamPublic` uses `team_name` and `GroupCompetitionHistoryResponseDTO` uses `participations[]`. Need live verification.

- [ ] T021 [P] [US4] Verify group teams render with correct `team_name` in `CompetitionRecords.tsx` (`src/components/groups/history/CompetitionRecords.tsx`)
- [ ] T022 [P] [US4] Verify group competition history renders with `participations[]` field data — fix `CompetitionRecords.tsx` or `HistoryTab.tsx` if they reference old field names
- [ ] T023 [US4] Verify `useGroupCompetitions.ts` (`src/hooks/useGroupCompetitions.ts`) return types are aligned with the actual response shapes
- [ ] T024 [US4] Navigate through group detail → teams list → competition history tab — confirm zero console errors

**Checkpoint**: Group page shows correct team names and competition analytics data with no undefined fields.

---

## Phase 6: User Story 5 — View Student Competition Records (Priority: P3)

**Goal**: Ensure the student competitions tab gracefully handles the empty state.

**Independent Test**: Open a student detail page → click Competitions tab → see graceful empty state or "coming soon" message.

**Note**: Backend endpoint is not yet implemented. `getStudentCompetitions()` in `src/api/crm/students/enrollments.ts` is a stub returning `[]`. The UI should handle this gracefully.

- [ ] T025 [P] [US5] Verify `CompetitionsTab.tsx` (`src/components/student/CompetitionsTab.tsx`) shows a clear empty state when the stub returns `[]`
- [ ] T026 [US5] Navigate to student detail → Competitions tab — confirm no console errors or broken UI from undefined field access
- [ ] T027 [US5] Add a comment in `src/api/crm/students/enrollments.ts` noting the documented endpoint path from `teams.md` (`GET /students/{id}/competitions`) and the `StudentCompetitionsResponse` schema for future backend implementation

**Checkpoint**: Student competitions tab shows graceful empty state with no console errors.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation alignment, build verification, API-UI gap items, and final cleanup.

- [ ] T028 [P] Update `research.md` (`specs/005-competitions-bug-audit/research.md`) — replace doc-only analysis with live API response traces from Phase 1
- [ ] T029 [P] Update `data-model.md` (`specs/005-competitions-bug-audit/data-model.md`) — mark entities that are now aligned (CompetitionCategory, TeamRegistration, TeamPublic, GroupCompetitionHistoryResponseDTO) as ✅ instead of ❌
- [ ] T030 [P] Update `contracts/competitions-api.md` (`specs/005-competitions-bug-audit/contracts/competitions-api.md`) — reconcile documented mismatches now resolved in code, add verified status notes
- [ ] T031 [P] Review and fix any remaining `Competition` type extra fields (`deleted_at`, `description`, `status` on `Competition` entity) in `src/api/competitions/types.ts` — confirm backward compatibility
- [ ] T032 [P] Review `GET /teams/deleted` endpoint — confirm `useDeletedTeams` hook exists at `src/hooks/teams/useDeletedTeams.ts` and consider if a UI page is needed for listing deleted teams
- [ ] T033 [P] Review `POST /teams/{id}/members` endpoint — confirm `addTeamMember` hook exists at `src/hooks/teams/useTeamMembers.ts` and add a member-adding UI component if needed
- [ ] T034 Run `npm run build` and fix any TypeScript errors
- [ ] T035 Run `npm run lint` and fix any lint errors
- [ ] T036 Run `npm run test` and verify no regressions
- [ ] T037 Navigate the full competitions flow end-to-end: list → detail → categories → register team → teams → summary → delete/restore — with zero console errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — verification tasks can run immediately. ⚠️ BLOCKS all user stories.
- **User Stories (Phases 2-6)**: All depend on Foundational phase completing (actual response shapes verified)
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

- Live verification before code changes
- Types before components
- Component fixes before page verification

### Parallel Opportunities

- All Foundational [P] tasks (T002-T006) can run in parallel after T001
- US1 and US2 are both P1 and have no shared dependencies — can run in parallel
- US3 and US4 (both P2) can each start immediately after Foundational
- US5 (P3) can start at any time after Foundational
- All [P]-marked tasks within a story can run in parallel
- Doc updates (T028-T030) can run in parallel with build verification (T034-T036)

---

## Parallel Example: Foundational Phase

```bash
# Launch all endpoint verification tasks together:
Task: T002 "Verify GET /competitions response format"
Task: T003 "Verify GET /competitions/{id}/categories response shape"
Task: T004 "Verify GET /academics/groups/{id}/teams field names"
Task: T005 "Verify GET /academics/groups/{id}/competitions/analytics"
Task: T006 "Verify POST /teams accepts flat RegisterTeamInput"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational — verify actual API responses
2. Complete Phase 2: User Story 1 — verify categories tab
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
| **Total tasks** | 37 |
| **Foundational (Phase 1)** | 7 tasks |
| **US1 — Categories** | 4 tasks |
| **US2 — Team Registration** | 5 tasks |
| **US3 — List Competitions** | 4 tasks |
| **US4 — Group Competition** | 4 tasks |
| **US5 — Student Competitions** | 3 tasks |
| **Polish (Phase 7)** | 10 tasks (including 3 doc updates + 3 API-UI gap reviews + 3 build/lint/test + 1 end-to-end) |
| **Parallel [P] tasks** | 16 tasks (43%) |
| **Independent stories** | 5/5 stories (zero cross-dependencies) |
