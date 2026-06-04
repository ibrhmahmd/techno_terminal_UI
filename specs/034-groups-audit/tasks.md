---
description: "Task list for Groups Feature Audit & Fix"
---

# Tasks: Groups Feature Audit & Fix

**Input**: Design documents from `specs/034-groups-audit/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story. Stories are largely independent — file overlaps noted inline.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths

---

## Phase 1: Setup

**Purpose**: No project initialization needed — fixes applied to existing codebase.

- [ ] T001 Verify working tree is clean: `git status` shows no uncommitted changes
- [ ] T002 [P] Read spec findings for reference: `specs/034-groups-audit/spec.md`

---

## Phase 2: Foundational

**Purpose**: Verify build passes before making changes.

- [ ] T003 Run `npm run build` and `npm run lint` to establish baseline — both must pass with zero errors

**Checkpoint**: Baseline verified. Bug fixing can begin.

---

## Phase 3: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix 9 runtime bugs across 8 files — status mappings, toast loops, missing fallbacks, date formatting, missing deps.

**Independent Test**: Run `npm run build && npm run lint` — must pass. Verify each fix via the file-specific checks below.

> ⚠️ **File overlaps**: `LevelsTab.tsx` is also edited in US3 (types) and US5 (a11y). `useGroupMutations.ts` is also edited in US4 (data). Apply all changes to these files in one pass per file.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Fix `EditGroupDialog.tsx` — Replace STATUSES `['active', 'completed', 'cancelled']` with `['active', 'inactive', 'archived', 'completed']` in `src/components/groups/detail/EditGroupDialog.tsx`
- [ ] T005 [P] [US1] Fix `GroupFilters.tsx` — Add `'completed'` to the STATUSES array at `src/components/groups/GroupFilters.tsx`
- [ ] T006 [P] [US1] Fix `GroupDetailPage.tsx` — Add `useRef` guard on `paymentsError` to prevent toast re-fire loop at `src/pages/GroupDetailPage.tsx:49`
- [ ] T007 [P] [US1] Fix `GroupDetailPage.tsx` — Replace `currentPriceOverride={null}` with `currentPriceOverride={group?.price_override ?? null}` at `src/pages/GroupDetailPage.tsx:309`
- [ ] T008 [P] [US1] Fix `useGroupMutations.ts` — Replace cascading `||` error check with per-mutation `isError` check at `src/hooks/useGroupMutations.ts:101`
- [ ] T009 [P] [US1] Fix `LevelsTab.tsx` — Replace `new Date(p.payment_date).toLocaleDateString()` with `formatDate(p.payment_date)` — import `formatDate` from `src/utils/formatting.ts` at `src/components/groups/LevelsTab.tsx:83`
- [ ] T010 [P] [US1] Fix `GroupInfoCard.tsx` — Add `|| '--:--'` fallback after `formatTime()` calls for null schedule times at `src/components/groups/detail/GroupInfoCard.tsx:159`
- [ ] T011 [P] [US1] Fix `GroupColumns.tsx` — Replace inline `.slice(0, 5)` with shared `formatTimeDisplay` utility at `src/components/groups/GroupColumns.tsx:39`
- [ ] T012 [P] [US1] Fix `useGroupDetail.ts` — Add `setActiveLevelId` to `useEffect` dependency array at `src/hooks/useGroupDetail.ts:65`

**Checkpoint**: All 9 runtime bugs fixed. Run `npm run build && npm run lint` — must pass.

---

## Phase 4: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Delete 2 unused components and prune 8 dead barrel exports + 3 dead types.

**Independent Test**: After deletion, `npm run build && npm run lint` must pass. `rg 'TabNavigation' src/ --glob '!*.test.*'` and `rg 'LevelStudentsPanel' src/ --glob '!*.test.*'` should only find their own definition in git history.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Delete `src/components/groups/TabNavigation.tsx` — entire file is unused (zero imports)
- [ ] T014 [P] [US2] Delete `src/components/groups/detail/LevelStudentsPanel.tsx` — entire file is unused (zero imports)
- [ ] T015 [P] [US2] Remove dead exports from `src/api/academics/groups/index.ts`: `getGroupDetails`, `getGroups`, `searchGroups`, `getArchivedGroups`
- [ ] T016 [P] [US2] Remove dead exports from `src/api/academics/sessions/index.ts`: `getSessionDetails`, `markSubstituteInstructor`
- [ ] T017 [P] [US2] Remove dead exports from `src/api/academics/courses/index.ts`: `searchCourses`, `getAllCourseStats`
- [ ] T018 [P] [US2] Delete `SubstituteInstructorRequest` interface from `src/api/academics/types/sessions/inputs.ts`
- [ ] T019 [P] [US2] Delete `EnrollmentHistoryFilters` interface from `src/api/academics/types/common.ts`
- [ ] T020 [P] [US2] Delete `PaginatedGroupsResponse<T>` (deprecated) from `src/api/academics/types/common.ts`
- [ ] T021 [US2] Update barrel files: Remove entries for deleted components from `src/components/groups/index.ts` and `src/components/groups/detail/index.ts`

**Checkpoint**: Dead code removed. Run `npm run build && npm run lint` — must pass.

---

## Phase 5: User Story 3 — Fix TypeScript Violations (Priority: P3)

**Goal**: Eliminate `any`, `as any`, and unsafe type casts across 6 locations in 5 files.

**Independent Test**: `rg ': any' src/components/groups/ src/hooks/useGroup*.ts` and `rg 'as any' src/components/groups/ src/hooks/useGroup*.ts` should return zero results for the fixed files.

> ⚠️ **File overlaps**: `LevelsTab.tsx` is also edited in US1 (dates) and US5 (a11y). `HistoryTab.tsx` is also edited in US5 (a11y). Apply all changes in one pass per file.

### Implementation for User Story 3

- [ ] T022 [P] [US3] Fix `LevelsTab.tsx` — Replace `payment: any` with `payment: PaymentDetailDTO` in `handleDownloadPdf` and `handleSendWhatsApp` at `src/components/groups/LevelsTab.tsx:30,55`. Import `PaymentDetailDTO` from `src/api/academics/types/groups/models.ts`.
- [ ] T023 [P] [US3] Fix `GroupBySelector.tsx` — Change `value` prop type from `GroupByField` to `GroupBySelectorValue` at `src/components/groups/GroupBySelector.tsx:7`
- [ ] T024 [US3] Fix `GroupsPage.tsx` — Remove `as any` cast from `GroupBySelector` value prop at `src/pages/GroupsPage.tsx:211`
- [ ] T025 [P] [US3] Fix `HistoryTab.tsx` — Replace `enrollmentColumns as any` with properly typed columns at `src/components/groups/HistoryTab.tsx:144`
- [ ] T026 [P] [US3] Fix `useGroups.ts` — Replace unsafe `stored as GroupByField` with a type predicate function at `src/hooks/useGroups.ts:39`
- [ ] T027 [P] [US3] Fix `useGroups.ts` — Remove unnecessary `sortField as keyof EnrichedGroupPublic` cast at `src/hooks/useGroups.ts:79`

**Checkpoint**: Type violations fixed. Run `npm run build && npm run lint` — must pass.

---

## Phase 6: User Story 4 — Fix Data Fetching Anti-Patterns (Priority: P4)

**Goal**: Fix 2 cache management issues — inline query key and redundant invalidations.

**Independent Test**: `rg "queryKey: \['" src/components/groups/` should return no results. `rg 'invalidateQueries' src/hooks/useGroupMutations.ts` should show only the prefix invalidation.

> ⚠️ **File overlaps**: `useGroupMutations.ts` also edited in US1 (error cascading). `AddSessionDialog.tsx` also edited in US5 (a11y). Apply all changes in one pass per file.

### Implementation for User Story 4

- [ ] T028 [P] [US4] Fix `AddSessionDialog.tsx` — Replace inline `queryKey: ['employees', 'list']` with `queryKey: queryKeys.employeesAll` at `src/components/groups/detail/AddSessionDialog.tsx:41`
- [ ] T029 [P] [US4] Fix `useGroupMutations.ts` — Remove redundant per-key invalidations after prefix `['groups']` invalidation at `src/hooks/useGroupMutations.ts:32-38`

**Checkpoint**: Cache patterns fixed. Run `npm run build && npm run lint` — must pass.

---

## Phase 7: User Story 5 — Fix Accessibility Gaps (Priority: P5)

**Goal**: Fix 11 accessibility issues across 5 files — missing ARIA, label associations, keyboard navigation.

**Independent Test**: `rg 'material-symbols-outlined' src/components/groups/ | rg -v 'aria-hidden'` — zero results. `rg 'role="switch"' src/components/groups/` — at least 1 result. `rg 'onKeyDown' src/components/groups/detail/LevelSelector.tsx` — 1 result.

> ⚠️ **File overlaps**: `LevelsTab.tsx` also edited in US1 (dates) and US3 (types). `HistoryTab.tsx` also edited in US3 (as any). `AddSessionDialog.tsx` also edited in US4 (query key). Apply all changes in one pass per file.

### Implementation for User Story 5

- [ ] T030 [P] [US5] Fix `AddSessionDialog.tsx:390` — Add `role="switch"`, `aria-checked={isSubstitute}`, `aria-label="Toggle substitute instructor"` to the substitute instructor toggle button
- [ ] T031 [P] [US5] Fix `AddSessionDialog.tsx:316` — Add `htmlFor="session-date"` to date label and `id="session-date"` to the date input
- [ ] T032 [P] [US5] Fix `AddSessionDialog.tsx:411` — Add `htmlFor="session-notes"` to notes label and `id="session-notes"` to the textarea
- [ ] T033 [P] [US5] Fix `LevelsTab.tsx:381,394` — Add `aria-hidden="true"` to both `<span className="material-symbols-outlined">` icons ("groups" and "payments")
- [ ] T034 [P] [US5] Fix `LevelSelector.tsx:27` — Add `onKeyDown` handler for arrow key navigation (ArrowLeft, ArrowRight, Home, End) to the tablist buttons
- [ ] T035 [P] [US5] Fix `LevelSelector.tsx:59` — Add `aria-hidden="true"` to the "add" Material Symbols icon
- [ ] T036 [P] [US5] Fix `LevelStudentsPanel.tsx:61` — Add `role="button"`, `tabIndex={0}`, and `onKeyDown` handler to the clickable student card div
- [ ] T037 [P] [US5] Fix `LevelStudentsPanel.tsx:72,77` — Add `aria-hidden="true"` to both "phone" Material Symbols icons
- [ ] T038 [P] [US5] Fix `HistoryTab.tsx:176` — Add `aria-hidden="true"` to the "school" Material Symbols icon

**Checkpoint**: All accessibility issues fixed. Run verification commands.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification sweep.

- [ ] T039 [P] Run `npm run build` — must pass with zero errors
- [ ] T040 [P] Run `npm run lint` — must pass with zero errors
- [ ] T041 [P] Run `npm run test -- src/tests/GroupsHeader.test.tsx` — existing test passes
- [ ] T042 Verify no remaining `: any` in groups files: `rg ': any' src/components/groups/ src/hooks/useGroup*.ts`
- [ ] T043 Verify no remaining inline query keys: `rg "queryKey: \['" src/components/groups/`
- [ ] T044 Verify all Material Symbols icons have `aria-hidden`: `rg 'material-symbols-outlined' src/components/groups/ | rg -v 'aria-hidden'` — zero results
- [ ] T045 Verify toggle button has switch role: `rg 'role="switch"' src/components/groups/` — at least 1 result
- [ ] T046 Verify dead components deleted: confirm `TabNavigation.tsx` and `LevelStudentsPanel.tsx` no longer exist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Baseline build verification
- **User Stories (Phase 3–7)**: Each story is independent but may edit same files as another story
  - File overlaps must be merged manually when working on the same file
  - Recommended order: US1 → US3 → US4 → US5 (by priority), applying all changes per file
  - US2 (dead code deletion) is fully independent
- **Polish (Phase 8)**: Depends on all stories being complete

### File Conflict Map

| File | Stories Touching It |
|------|-------------------|
| `LevelsTab.tsx` | US1 (dates), US3 (types), US5 (a11y) |
| `useGroupMutations.ts` | US1 (error), US4 (invalidations) |
| `AddSessionDialog.tsx` | US4 (query key), US5 (a11y) |
| `HistoryTab.tsx` | US3 (as any), US5 (a11y) |
| `GroupDetailPage.tsx` | US1 (toast + price, 2 changes in same file) |

### Recommended Execution Order (minimizes conflicts)

1. **Phase 3 (US1)**: Fix all runtime bugs first — they are highest priority
2. **Phase 4 (US2)**: Delete dead code independently
3. **Phase 5 (US3)**: Fix types — conflicts with LevelsTab and HistoryTab already partly addressed by US1
4. **Phase 6 (US4)**: Fix data fetching — useGroupMutations changes can be merged with US1 changes
5. **Phase 7 (US5)**: Fix a11y — conflicts with files already edited
6. **Phase 8**: Final validation

### Parallel Opportunities

- All tasks within a phase marked `[P]` can run in parallel (different files, no dependencies)
- US2 (dead code deletion) is fully independent and can run whenever
- Tasks T004–T012 in US1 are all on different files → fully parallelizable
- T022–T027 in US3 are on different files → mostly parallelizable (T023+T024 must be sequential)

---

## Parallel Example: User Story 1

```bash
# All US1 tasks are on different files — can run in parallel:
# Task: T004 Edit EditGroupDialog.tsx STATUSES
# Task: T005 Edit GroupFilters.tsx status list
# Task: T006 + T007 Edit GroupDetailPage.tsx (same file, sequential)
# Task: T008 Edit useGroupMutations.ts error handling
# Task: T009 Edit LevelsTab.tsx date format
# Task: T010 Edit GroupInfoCard.tsx fallback
# Task: T011 Edit GroupColumns.tsx format utility
# Task: T012 Edit useGroupDetail.ts deps
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Baseline verification
2. Complete Phase 3: User Story 1 (9 runtime bug fixes)
3. **STOP and VALIDATE**: `npm run build && npm run lint`
4. Deploy/demo if needed

### Incremental Delivery

1. Phase 1+3 → Runtime bugs fixed (MVP!) → Deploy
2. + Phase 4 → Dead code removed → Deploy
3. + Phase 5 → Type safety improved → Deploy
4. + Phase 6 → Cache patterns fixed → Deploy
5. + Phase 7 → Accessibility improved → Deploy
6. + Phase 8 → Final validation

### Full Delivery

All phases in priority order. File conflicts resolved by applying all changes to each file in one pass.

---

## Notes

- 38 total tasks across 8 phases
- MVP scope: Phase 3 only (9 tasks, ~68% of bugs fixed)
- No test tasks required — spec does not request TDD
- No API contract changes — all changes are internal
- All changes are frontend-only
- Build gate: `npm run build` must pass before final commit
