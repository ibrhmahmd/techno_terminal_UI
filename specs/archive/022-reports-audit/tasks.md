---
description: "Task list for Reports Feature Audit & Fix"
---

# Tasks: Reports Feature Audit & Fix

**Input**: Design documents from `/specs/022-reports-audit/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: No test tasks — this is a bugfix/cleanup pass with no new logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/components/reports/hooks/`
  - Pages: `src/pages/{domain}Page.tsx`
  - Types: `src/types/`
- All modifications in this feature are within the reports domain.

---

## Phase 1: User Story 1 — Fix Runtime Bugs (Priority: P1) 🎯 MVP

**Goal**: Fix 6 runtime bugs identified in the audit — progress status mislabeling, fragile 404 detection, error coalescing, null fallback, dead code, and API contract documentation.

**Independent Test**: Navigate to the Reports page — Overview tab loads, Progress tab shows correct labels ("On Track", "At Risk", "Behind"), Daily Report tab empty state works with any date, Revenue & Collections tab shows both revenue metrics and daily collections without cascading errors.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Remove unused `formattedAmount` field from data mapping in `src/components/reports/RevenueChart.tsx` (simplify to `const formattedData = data`)
- [ ] T002 [P] [US1] Add null fallback in `select: (response) => response.data ?? null` in `src/components/reports/hooks/useDailyReport.ts`
- [ ] T003 [P] [US1] Fix error coalescing: replace `||` with `??` in `src/components/reports/organisms/RevenueAndCollectionsTab.tsx` line 27 (`revError?.message ?? colError?.message ?? null`)
- [ ] T004 [P] [US1] Fix 404 detection: replace `error.message.includes('404')` with `(error as any)?.response?.status === 404` in `src/components/reports/organisms/DailyReportTab.tsx`
- [ ] T005 [US1] Fix progress status labels: rename `completed`/`inProgress`/`notStarted` to `onTrack`/`atRisk`/`behind` in `src/components/reports/organisms/ProgressTab.tsx` and update `src/components/reports/StudentProgressChart.tsx` props/labels/legend accordingly
- [ ] T006 [US1] Add API contract comment for `attendance_rate * 100` in `src/components/reports/atoms/ReportSummaryCards.tsx` documenting the assumption that API returns decimal 0.0–1.0

**Checkpoint**: All 6 runtime bugs fixed. Run `npm run build` to verify zero TypeScript errors. Manually verify Progress tab shows correct labels.

---

## Phase 2: User Story 2 — Fix TypeScript Safety (Priority: P2)

**Goal**: Eliminate 2 unsafe type assertions — `as string` cast and double `as unknown as Record` bypass.

**Independent Test**: `npm run build` passes with zero errors. Run `rg 'as unknown as Record' src/components/reports/` returns no matches.

### Implementation for User Story 2

- [ ] T007 [US2] Replace `date as string` with `date!` in `queryFn: () => getDailyReportData(date!)` in `src/components/reports/hooks/useDailyReport.ts`
- [ ] T008 [US2] Refactor Legend formatter: replace double `as unknown as Record<string, unknown>` cast with typed approach in `src/components/reports/StudentProgressChart.tsx` line 67

**Checkpoint**: Zero `as` violations in reports domain. Build passes.

---

## Phase 3: User Story 3 — Fix Data Fetching Anti-Patterns (Priority: P3)

**Goal**: Fix 3 data fetching issues — add missing `dailyReceipts` query key factory, surface both query errors, return Promise from refetch wrapper.

**Independent Test**: Navigate to Revenue & Collections tab, change date via week-bar — both collections and receipts queries fire with correct cache keys. Errors show both messages if both queries fail.

### Implementation for User Story 3

- [ ] T009 [P] [US3] Add `dailyReceipts(date: string)` factory to `queryKeys.reports` in `src/hooks/queryKeys.ts` following the same pattern as `dailyCollections`
- [ ] T010 [P] [US3] Update query key in `useDailyCollections` to use `queryKeys.reports.dailyReceipts(date)` instead of hijacking `dailyCollections(\`${date}-receipts\`)` in `src/components/reports/hooks/useDailyCollections.ts`
- [ ] T011 [P] [US3] Fix error handling in `useDailyCollections` to surface both collections and receipts errors (merge them or concatenate) in `src/components/reports/hooks/useDailyCollections.ts`
- [ ] T012 [US3] Return Promise from refetch wrapper: add `async`/`await` to `refetch()` call in `src/components/reports/hooks/useRevenueData.ts`

**Checkpoint**: All 3 data fetching fixes applied. Build passes.

---

## Phase 4: User Story 4 — Fix Accessibility Gaps (Priority: P4)

**Goal**: Add ErrorBoundary to 2 unprotected tabs, aria-labels to 2 charts, and `scope="col"` to 3 tables containing `<th>` elements.

**Independent Test**: Inspect DOM — RevenueChart AreaChart has `aria-label`, ProgressTab PieChart has `aria-label`, all 3 tables have `scope="col"` on `<th>` elements. Revenue & Collections tab and Progress tab have ErrorBoundary wrappers.

### Implementation for User Story 4

- [ ] T013 [P] [US4] Wrap `<RevenueAndCollectionsTab />` in `<ErrorBoundary>` in `src/pages/ReportsPage.tsx`
- [ ] T014 [P] [US4] Wrap `<ProgressTab />` in `<ErrorBoundary>` in `src/pages/ReportsPage.tsx`
- [ ] T015 [P] [US4] Add `aria-label="Monthly revenue trend chart"` to AreaChart in `src/components/reports/RevenueChart.tsx`
- [ ] T016 [P] [US4] Add `aria-label="Student progress distribution"` to PieChart in `src/components/reports/StudentProgressChart.tsx`
- [ ] T017 [P] [US4] Add `scope="col"` to all `<th>` elements in receipts table in `src/components/reports/organisms/RevenueAndCollectionsTab.tsx`
- [ ] T018 [P] [US4] Add `scope="col"` to all `<th>` elements in `src/components/reports/atoms/ReportSessionDetails.tsx`
- [ ] T019 [P] [US4] Add `scope="col"` to all `<th>` elements in inner payment table in `src/components/reports/atoms/ReportPaymentDetails.tsx`

**Checkpoint**: All 7 accessibility tasks done. Build + lint pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [ ] T020 Run `npm run lint` and fix any new errors introduced by this feature
- [ ] T021 Run `npm run build` and verify zero errors (`tsc -b && vite build`)
- [ ] T022 Run `rg ': any' src/components/reports/ src/components/reports/hooks/` and verify zero matches
- [ ] T023 Run `rg 'console\.' src/components/reports/ src/components/reports/hooks/` and verify zero matches

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No dependencies — can start immediately
- **US2 (Phase 2)**: No dependencies on other stories — can run in parallel with US1
- **US3 (Phase 3)**: No dependencies on other stories — can run in parallel with US1/US2
- **US4 (Phase 4)**: No dependencies on other stories — can run in parallel
- **Polish (Phase 5)**: Depends on all desired phases being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies — **MVP scope**: complete this story first
- **US2 (P2)**: Fully independent from US1
- **US3 (P3)**: Fully independent from US1/US2
- **US4 (P4)**: Fully independent from all other stories

### Within Each User Story

- Simpler tasks first (dead code removal, null fallback), riskier tasks last (progress labels visible to users)
- Build verify after each story

### Parallel Opportunities

- All [P] tasks within the same story can run in parallel
- All user stories are independent and can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all safe [P] fixes together:
Task: T001 — Remove dead formattedAmount (RevenueChart.tsx)
Task: T002 — Add null fallback in select (useDailyReport.ts)
Task: T003 — Fix error coalescing (RevenueAndCollectionsTab.tsx)
Task: T004 — Fix 404 detection (DailyReportTab.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: US1 — Bug Fixes (T001–T006)
2. **STOP and VALIDATE**: Run `npm run build`, manually verify Progress tab labels and 404 empty state
3. Deploy/demo if ready

### Incremental Delivery

1. Complete US1 → Test independently → **MVP ready**
2. Add US2 (types) → Test independently
3. Add US3 (data fetching) → Test independently
4. Add US4 (accessibility) → Test independently
5. Final polish → Build + lint verify

### Parallel Team Strategy

With multiple developers:
- Developer A: US1 (Bug Fixes — 6 tasks)
- Developer B: US2 + US3 (Types + Data Fetching — 5 tasks)
- Developer C: US4 (Accessibility — 7 tasks)
- All stories complete independently and merge together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each logical group
- Stop at any checkpoint to validate independently
- All changes are within `src/` only — frontend-only
