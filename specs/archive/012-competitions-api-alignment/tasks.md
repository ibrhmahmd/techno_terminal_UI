# Tasks: Competitions API Alignment

**Input**: Design documents from `/specs/012-competitions-api-alignment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md

**Tests**: Not explicitly requested in the feature specification. Test tasks omitted.

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

**Purpose**: No new infrastructure needed — project already exists. This phase covers reading the API contract and preparing type definitions.

- [x] T001 Read `competitions-api.md` at repo root and confirm all endpoint shapes, DTOs, and error codes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and API layer updates that MUST be complete before ANY user story can be implemented. These unblock all downstream work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Update `CompetitionDTO` in `src/api/competitions/types.ts` — make `location` nullable (`string | null`), remove `deleted_at`
- [x] T003 [P] Update `TeamDTO` in `src/api/teams/types.ts` — remove `fee` and `deleted_at`, add `project_name: string | null` and `project_description: string | null`
- [x] T004 [P] Update `TeamMemberDTO` in `src/api/teams/types.ts` — replace `member_share` with `amount_due: number`, replace `fee_paid: boolean` with `amount_paid: number`, remove `payment_id`
- [x] T005 [P] Update `TeamMemberRosterDTO` in `src/api/teams/types.ts` — same field changes as TeamMemberDTO
- [x] T006 [P] Update `PayCompetitionFeeInput` in `src/api/teams/types.ts` — replace `student_id` with `amount: number`, keep `parent_id?`
- [x] T007 [P] Update `PayCompetitionFeeResponseDTO` in `src/api/teams/types.ts` — add `amount_paid: number` and `amount_due: number`
- [x] T008 [P] Update `RegisterTeamInput` in `src/api/teams/types.ts` — remove `fee`, add `student_fees?: Record<string, number>`, `project_name?: string`, `project_description?: string`
- [x] T009 [P] Update `CompetitionSummaryCategory` → `CategoryWithTeamsDTO` in `src/api/competitions/types.ts` — replace `category_id`/`category_name` with `subcategory: string | null`
- [x] T010 [P] Update nested `TeamMemberDTO` in `src/api/competitions/types.ts` (used in summary) — same field changes as T004
- [x] T011 [P] Update nested `TeamDTO` in `src/api/competitions/types.ts` (used in summary) — same field changes as T003
- [x] T012 [P] Remove `RemoveTeamMemberResultDTO` from `src/api/teams/types.ts` — replace with `ApiResponse<boolean>` return type
- [x] T013 [P] Remove soft-delete types: `restoreCompetition`, `restoreTeam`, `getDeletedCompetitions`, `getDeletedTeams` type references from `src/api/competitions/types.ts` and `src/api/teams/types.ts`
- [x] T014 Update ALL teams API functions in `src/api/teams/teams.ts` — unwrap `ApiResponse<T>` envelope (access `response.data.data` instead of `response.data`), update return types to `ApiResponse<T>`
- [x] T015 Update payment endpoint in `src/api/teams/teams.ts` — change path from `POST /teams/{id}/pay` to `POST /teams/{id}/members/{student_id}/pay`, update payload to `{ amount, parent_id? }`
- [x] T016 Remove soft-delete API functions from `src/api/competitions/competitions.ts` — remove `restoreCompetition`, `getDeletedCompetitions`
- [x] T017 Remove soft-delete API functions from `src/api/teams/teams.ts` — remove `restoreTeam`, `getDeletedTeams`
- [x] T018 Update `deleteCompetition` return type in `src/api/competitions/competitions.ts` to `ApiResponse<boolean>`
- [x] T019 Update `deleteTeam` return type in `src/api/teams/teams.ts` to `ApiResponse<boolean>`
- [x] T020 Update `getTeams` in `src/api/teams/teams.ts` — add `competition_id` as required query param, handle nested `TeamWithMembersDTO` when `include_members=true`

**Checkpoint**: Foundation ready — all types and API functions match the new backend contracts. User story implementation can now begin.

---

## Phase 3: User Story 1 — View Competitions and Teams (Priority: P1) 🎯 MVP

**Goal**: Users can browse competitions, view details including categories/teams/members, and see accurate payment status with the new data shapes.

**Independent Test**: Navigate to `/competitions`, select a competition, and verify all data (competition info, categories, teams, members, payment status) renders without undefined values or errors.

### Implementation for User Story 1

- [x] T021 [P] [US1] Update `useCompetitions` hook in `src/hooks/competitions/useCompetitions.ts` — ensure competition list/detail queries parse new `CompetitionDTO` shape (nullable `location`)
- [x] T022 [P] [US1] Update `useCompetitionSummary` hook in `src/hooks/competitions/useCompetitions.ts` — parse new `CategoryWithTeamsDTO` shape (`subcategory` instead of `category_id`/`category_name`)
- [x] T023 [P] [US1] Update `useTeams` hook in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse` envelope, require `competition_id` param, handle `TeamWithMembersDTO` nested shape
- [x] T024 [P] [US1] Update `useTeamMembers` hook in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse` envelope, parse new `TeamMemberRosterDTO` with `amount_due`/`amount_paid`
- [x] T025 [US1] Update `CompetitionCard` in `src/components/competitions/CompetitionCard.tsx` — handle nullable `location` and `competition_date` with null-safe rendering
- [x] T026 [US1] Update `CompetitionDetailPage` in `src/pages/CompetitionDetailPage.tsx` — fix category rendering to use `subcategory` field instead of removed `category_id`/`category_name`, update team member payment display from `fee_paid` boolean to `amount_due`/`amount_paid` calculation
- [x] T027 [US1] Update `CategoryTeamsModal` in `src/components/competitions/CategoryTeamsModal.tsx` — fix category grouping to use new `CategoryWithTeamsDTO` shape, update team fee display from `team.fee` to per-member `amount_due`
- [x] T028 [US1] Update `TeamDetailPage` in `src/pages/TeamDetailPage.tsx` — replace all `team.fee` references with per-member fee display, add `project_name` and `project_description` rendering, update member roster to show `amount_due`, `amount_paid`, and remaining balance
- [x] T029 [US1] Update `CompetitionsPage` in `src/pages/CompetitionsPage.tsx` — remove trash/restore UI, remove `deleted_at` filtering, remove "View Deleted" button

**Checkpoint**: All competitions and teams pages render correctly with new API data shapes. Payment status shows amounts instead of boolean. No undefined values.

---

## Phase 4: User Story 2 — Register a Team (Priority: P2)

**Goal**: Admins can register teams with per-student fees, project name, and project description.

**Independent Test**: Register a new team through the UI and verify it appears in the competition detail page with correct student fees and project details.

### Implementation for User Story 2

- [x] T030 [P] [US2] Update `useRegisterTeam` mutation in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse` envelope from response, update payload to use `student_fees` map instead of flat `fee`
- [x] T031 [US2] Update `TeamRegistrationModal` in `src/components/competitions/TeamRegistrationModal.tsx` — add per-student fee input (replacing single team fee), add `project_name` and `project_description` optional fields, send `student_fees` map in payload
- [x] T032 [US2] Update `CompetitionDetailPage` in `src/pages/CompetitionDetailPage.tsx` — ensure "Register Team" button opens updated modal and invalidates competition summary cache on success
- [x] T033 [US2] Add conflict error handling in `TeamRegistrationModal` — display 409 errors for duplicate student or team name within competition

**Checkpoint**: Team registration works with per-student fees and project fields. Registered teams appear correctly in competition detail.

---

## Phase 5: User Story 3 — Manage Team Members and Payments (Priority: P3)

**Goal**: Admins can add/remove team members, process partial payments, and update team placement after competition date.

**Independent Test**: Add a member to a team, process a full and partial payment, verify payment status updates, then attempt placement update.

### Implementation for User Story 3

- [x] T034 [P] [US3] Update `useAddTeamMember` mutation in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse` envelope, add optional `amount_due` to payload
- [x] T035 [P] [US3] Update `useRemoveTeamMember` mutation in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse<boolean>` envelope, handle 400 error for paid members
- [x] T036 [P] [US3] Update `usePayCompetitionFee` mutation in `src/hooks/competitions/useTeams.ts` — change endpoint to `POST /teams/{team_id}/members/{student_id}/pay`, add `amount` to payload, unwrap `ApiResponse` envelope
- [x] T037 [P] [US3] Update `useUpdatePlacement` mutation in `src/hooks/competitions/useTeams.ts` — unwrap `ApiResponse` envelope, handle 400 error when competition date not passed
- [x] T038 [US3] Update `TeamDetailPage` payment flow in `src/pages/TeamDetailPage.tsx` — replace confirmation-only payment with amount input modal (support partial payments), display remaining balance (`amount_due - amount_paid`), show receipt number after payment
- [x] T039 [US3] Update `TeamDetailPage` member removal in `src/pages/TeamDetailPage.tsx` — prevent removal when `amount_paid > 0`, show error message from 400 response
- [x] T040 [US3] Update `TeamDetailPage` placement update in `src/pages/TeamDetailPage.tsx` — add validation to prevent placement before competition date, handle 400 error gracefully
- [x] T041 [US3] Update `CompetitionDetailPage` delete flow in `src/pages/CompetitionDetailPage.tsx` — replace soft-delete with hard-delete confirmation modal, handle 409 error when teams are registered
- [x] T042 [US3] Update `TeamDetailPage` delete flow in `src/pages/TeamDetailPage.tsx` — replace soft-delete with hard-delete confirmation modal, handle 409 error when members have paid

**Checkpoint**: All member management, payment, placement, and delete operations work with new API contracts and business rules.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, cleanup, and verification.

- [x] T043 [P] Update `queryKeys.ts` in `src/hooks/queryKeys.ts` — add/update competition and teams cache key patterns if any changed
- [x] T044 [P] Update cache invalidation in all mutations — ensure `queryClient.invalidateQueries` targets correct keys after API shape changes
- [x] T045 [P] Remove all references to deprecated fields across codebase — search for `fee_paid`, `member_share`, `deleted_at`, `category_id` (in competition context), `category_name` (in competition context), `team.fee` — verify zero remaining usages
- [x] T046 [P] Update color utilities in `src/utils/colors.ts` — add payment status color helper for amount-based status (e.g., fully paid, partially paid, unpaid)
- [x] T047 Run `npm run lint` and fix all errors
- [x] T048 Run `npm run build` and verify `tsc -b && vite build` succeeds with zero errors
- [x] T049 Manual end-to-end verification: navigate through all competitions pages, register a team, process a payment, verify no console errors or undefined values

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Uses components updated by US1 but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Uses hooks updated by US1/US2 but independently testable

### Within Each User Story

- API types before API functions
- API functions before hooks
- Hooks before components
- Components before page assembly
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks T002–T013 (type updates) can run in parallel — different files, no interdependencies
- All Foundational tasks T014–T020 (API function updates) can run in parallel after types are done
- US1 hook updates T021–T024 can run in parallel
- US3 mutation updates T034–T037 can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: Foundational Phase

```bash
# Launch all type updates together (T002–T013):
Task: "Update CompetitionDTO in src/api/competitions/types.ts"
Task: "Update TeamDTO in src/api/teams/types.ts"
Task: "Update TeamMemberDTO in src/api/teams/types.ts"
Task: "Update PayCompetitionFeeInput in src/api/teams/types.ts"
Task: "Update RegisterTeamInput in src/api/teams/types.ts"
# ... etc — all different files, no dependencies

# After types done, launch all API function updates together (T014–T020):
Task: "Update all teams API functions in src/api/teams/teams.ts"
Task: "Update payment endpoint in src/api/teams/teams.ts"
Task: "Remove soft-delete from src/api/competitions/competitions.ts"
Task: "Update getTeams in src/api/teams/teams.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (1 task)
2. Complete Phase 2: Foundational (19 tasks — CRITICAL, blocks all stories)
3. Complete Phase 3: User Story 1 (9 tasks)
4. **STOP and VALIDATE**: Navigate to `/competitions`, verify all data renders correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → All types and API functions match new contracts
2. Add User Story 1 → Competitions/teams pages render correctly with new data shapes → Test independently
3. Add User Story 2 → Team registration with per-student fees works → Test independently
4. Add User Story 3 → Payments, member management, placement, hard delete work → Test independently
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (types first, then API functions)
2. Once Foundational is done:
   - Developer A: User Story 1 (view competitions/teams)
   - Developer B: User Story 2 (register team)
   - Developer C: User Story 3 (payments, members, placement)
3. Stories complete and integrate independently
4. Phase 6 polish after all stories done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Critical**: The ApiResponse envelope change (T014) is the highest-risk task — verify every teams endpoint unwraps correctly before proceeding to user stories
- **Critical**: Payment endpoint path change (T015) breaks existing payment flow — US3 cannot work until this is correct
