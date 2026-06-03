# Tasks: Group Detail Page — Feature Completions

**Input**: Design documents from `specs/032-group-detail-features/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story (US1–US4) from spec.md priorities.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend the API layer and query keys to support all four features.

- [x] T001 [P] Add `EnrollmentHistoryItem`, `EnrollmentHistoryResponse`, `InstructorHistoryItem`, `InstructorHistoryResponse` types to `src/api/academics/groups/newEndpoints.ts`
- [x] T002 [P] Add `getEnrollmentHistory(groupId)` and `getInstructorHistory(groupId)` API functions to `src/api/academics/groups/newEndpoints.ts`
- [x] T003 Add `groupEnrollmentHistory(id)` and `groupInstructorHistory(id)` cache keys to `src/hooks/queryKeys.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared hooks that multiple user story components depend on.

**⚠️ CRITICAL**: US1 depends on T004. US2 depends on T005. Complete before story phases.

- [x] T004 Create `src/hooks/useGroupHistory.ts` — two `useQuery` calls for enrollment-history and instructor-history with `staleTime: 5 * 60 * 1000`, using keys from T003, returns `{ enrollmentHistory, instructorHistory, isLoadingEnrollments, isLoadingInstructors, enrollmentError, instructorError }`
- [x] T005 Create `src/hooks/useSessionMutations.ts` — four `useMutation` wrappers for `addExtraSession`, `deleteSession`, `cancelSession`, `reactivateSession` from `src/api/academics/sessions/core.ts`. On success, invalidate `queryKeys.groupLevels(groupId)` and `queryKeys.groupSessions(groupId)`

**Checkpoint**: Foundation ready — all hooks and API wiring in place.

---

## Phase 3: User Story 1 — History Tab (Priority: P1) 🎯 MVP

**Goal**: Replace the History tab placeholder with live enrollment history and instructor history data.

**Independent Test**: Navigate to any group → click History tab → enrollment table loads with student/payment data, instructor section lists assignment history. Switch away and back within 5 min — no re-fetch (cache hit in DevTools Network tab).

### Implementation for User Story 1

- [x] T006 [US1] Create `src/components/groups/HistoryTab.tsx` — two sections:
  1. **Enrollment History section**: Summary stats row (total/active/completed/dropped counts from response), `PillSelector` for client-side status filter (All/Active/Completed/Dropped), `DataTable` with columns: Student Name (link to `/students/{id}`), Phone, Level #, Enrolled At (formatted), Status (badge), Balance (amount_due − payments_made)
  2. **Instructor History section**: Card list with instructor name, levels taught count, date range (first_assigned – last_assigned), "Current" badge for `is_current === true`
  3. Empty states: "No enrollment history for this group." / "No instructor history available."
- [x] T007 [US1] Wire `HistoryTab` into `src/pages/GroupDetailPage.tsx` — replace the placeholder `<div>` at line 291-296 with `<HistoryTab groupId={groupId} />`, add import

**Checkpoint**: History tab is fully functional — enrollment + instructor data renders with filtering and caching.

---

## Phase 4: User Story 2 — Session Management in Levels Tab (Priority: P2)

**Goal**: Show sessions per level when expanded, with add/delete/cancel/reactivate actions.

**Independent Test**: Levels tab → expand any level → session table with dates/status/actions visible → "Add Session" opens date picker → submit creates session (appears in list) → Delete session (with confirm dialog) removes it → Cancel changes status → Reactivate restores it.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/components/groups/detail/AddSessionDialog.tsx` — Modal (using `src/components/common/Modal.tsx`) with `DateInput` (from `src/components/common/DateInput.tsx`), optional notes textarea, submit button calls `addExtraSession({ group_id, level_number, extra_date, notes })`, inline error display on failure, dialog stays open on error
- [x] T009 [P] [US2] Create `src/components/groups/detail/SessionListPanel.tsx` — receives `sessions: LevelSessionDTO[]`, `groupId`, `levelNumber`. Renders table with columns: #, Date, Time (start–end), Status badge, Actions. Action buttons per status: scheduled → Cancel + Delete, cancelled → Reactivate + Delete, completed → Delete only. Delete triggers existing `ConfirmDialog`. "Add Session" button at bottom opens `AddSessionDialog`. All mutations via `useSessionMutations(groupId)` from T005
- [x] T010 [US2] Modify `src/components/groups/LevelsTab.tsx` — in the expanded level section (line 146-178), add `<SessionListPanel>` below the existing payment summary. Pass `level.sessions`, `groupId` (add to props), and `level.level_number`. Add `groupId` to `LevelsTabProps` interface
- [x] T011 [US2] Update `src/pages/GroupDetailPage.tsx` — pass `groupId={groupId}` prop to `<LevelsTab>` at line 258-262

**Checkpoint**: Session list renders per level with full add/delete/cancel/reactivate workflow.

---

## Phase 5: User Story 3 — Student Actions: Navigate & Transfer (Priority: P2)

**Goal**: Fix the broken "View" action to navigate to student profile. Replace the broken "Edit" action with a functional "Transfer" dialog.

**Independent Test**: Students tab → click View on any student → browser navigates to `/students/{student_id}`. Click Transfer → group selector dialog opens with pre-loaded active groups (from `transferOptions`) → select target group → confirm → enrollment row updates.

### Implementation for User Story 3

- [x] T012 [P] [US3] Create `src/components/groups/detail/TransferDialog.tsx` — Modal with: student name display (read-only), `GroupCombobox` (from `src/components/common/combobox/GroupCombobox.tsx`) or a custom select populated from `transferOptions: TransferOptionDTO[]`, confirm button disabled until target selected and target ≠ source groupId, calls `transferEnrollment({ from_enrollment_id, to_group_id })` from `src/api/enrollments/enrollments.ts`, on success: invalidate `queryKeys.groupEnrollments(groupId)`, show success toast, close dialog. Same-group validation: disable confirm + show inline message
- [x] T013 [US3] Modify `src/components/groups/StudentsTab.tsx` — (a) Add `useNavigate` import, replace `view` action at line 160 with `navigate(\`/students/${student.student_id}\`)`. (b) Replace `edit` action at line 161 with transfer handler: `setTransferStudent(student); setIsTransferOpen(true)`. (c) Add state: `transferStudent`, `isTransferOpen`. (d) Render `<TransferDialog>` with props from `useGroupEnrollments.transferOptions`. (e) On transfer success, call `refetch()` from `useGroupEnrollments`

**Checkpoint**: View navigates correctly. Transfer dialog opens, submits, and refreshes the enrollment list.

---

## Phase 6: User Story 4 — Level Number Edit "Coming Soon" (Priority: P3)

**Goal**: Add a visible but disabled "Edit Level Number" button with a tooltip in the Levels tab expanded view.

**Independent Test**: Levels tab → expand level → "Edit Level Number" button visible, disabled, with "Coming Soon" badge. Click produces no API calls (verify in DevTools Network tab). Tooltip reads "Coming soon — level renumbering requires a database migration".

### Implementation for User Story 4

- [x] T014 [US4] Modify `src/components/groups/LevelsTab.tsx` — in the expanded level section, add a disabled button below the session list panel: `<button disabled title="Coming soon — level renumbering requires a database migration" className="...opacity-50 cursor-not-allowed">` with Lucide `Edit3` icon, "Edit Level Number" text, and a `<span>Coming Soon</span>` badge. Ensure no click handler. ~10 LOC inline

**Checkpoint**: Coming Soon control is visible, non-interactive, with tooltip.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and cleanup.

- [ ] T015 Run `npm run lint` and fix all linting errors
- [ ] T016 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T017 Manual verification: navigate to a group detail page and test all four features end-to-end (History tab data, session add/delete, student view/transfer, coming soon button)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (query keys T003 must exist before hooks)
- **US1 History (Phase 3)**: Depends on Phase 2 (T004 hook)
- **US2 Sessions (Phase 4)**: Depends on Phase 2 (T005 hook)
- **US3 Student Actions (Phase 5)**: Independent of Phase 2 — uses existing `transferEnrollment` and `useGroupEnrollments`
- **US4 Coming Soon (Phase 6)**: Independent — pure UI, no API or hook dependencies
- **Polish (Phase 7)**: Depends on all story phases

### User Story Dependencies

- **US1 (P1)**: Depends on T001–T004. No dependency on other stories.
- **US2 (P2)**: Depends on T005. No dependency on US1.
- **US3 (P2)**: Independent — all APIs and hooks already exist. Can run in parallel with US1/US2.
- **US4 (P3)**: Independent — purely cosmetic. Can run in parallel with anything.

### Within Each User Story

- API types → API functions → Cache keys → Hook → Components → Page wiring
- No test-first requirement (tests not requested)

### Parallel Opportunities

- T001 + T002 can run in parallel (both in same file but different sections; treat as sequential if same-file constraint applies)
- T008 + T009 can run in parallel (different files)
- T012 can run in parallel with all US2 tasks (different files)
- US3 + US4 can start immediately after Phase 1 (no Phase 2 dependency)

---

## Parallel Example: After Phase 2

```
# These can all start simultaneously after Phase 2 completes:
Track A: T006 → T007                    (US1: History Tab)
Track B: T008 + T009 → T010 → T011     (US2: Session Management)
Track C: T012 → T013                    (US3: Student Actions)
Track D: T014                           (US4: Coming Soon)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T005)
3. Complete Phase 3: US1 History Tab (T006–T007)
4. **STOP and VALIDATE**: History tab renders data, caching works
5. Proceed to US2–US4

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 History Tab → Test → Commit (MVP!)
3. US2 Session Management → Test → Commit
4. US3 Student Actions → Test → Commit
5. US4 Coming Soon → Test → Commit
6. Polish → Build gate → Final commit

### Sequential Developer Strategy

T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016 → T017

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently testable after its phase completes
- All API functions already exist in `src/api/` — only history endpoints need new wiring
- `transferOptions` is already returned by `useGroupEnrollments` — no extra API call for transfer dialog
- Sessions are embedded in `LevelDetailDTO.sessions` — no extra query for session list
- Commit after each phase checkpoint
