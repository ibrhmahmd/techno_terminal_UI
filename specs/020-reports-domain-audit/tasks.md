---

description: "Task list for Reports Domain Audit Fix (35 findings)"
---

# Tasks: Reports Domain Audit Fix

**Input**: Design documents from `/specs/020-reports-domain-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated unless explicitly needed.

**Organization**: Tasks grouped by user story from spec.md (Bug-Free Reports, Accessible Tab Navigation, Consistent Data Fetching). Dead code and TypeScript quality fixes in Polish phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1=bug fixes, US2=data fetching, US3=accessibility
- Include exact file paths in descriptions

## Path Conventions

- All source in `src/`. No backend.
- API functions: `src/api/{domain}/`
- Components: `src/components/reports/`
- Hooks: `src/components/reports/hooks/`
- Pages: `src/pages/`
- Tests: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add centralized query keys for reports — required by US2

- [X] T001 Add reports query key section to `src/hooks/queryKeys.ts` (reports.all, reports.summary, reports.revenue, reports.enrollmentTrends, reports.instructorPerformance, reports.studentProgress, reports.dailyCollections, reports.dailyReport.data, reports.dailyReport.pdf)

---

## Phase 2: Foundational

**Purpose**: No additional foundational tasks — infrastructure already exists.

---

## Phase 3: User Story 1 — Bug-Free Reports (Priority: P1) 🎯 MVP

**Goal**: Fix 3 runtime bugs — RevenueChart tooltip accessing wrong property, InstructorPerformanceChart tooltip label mismatch, ReportsPage false fallback message.

**Independent Test**: Navigate to Reports > Revenue tab, verify tooltip shows correct net_revenue values (not 0.0%). Navigate to Instructors tab, verify chart renders student counts (not "%"). No "fallback data" message shown on successful load.

- [X] T002 [P] [US1] Fix RevenueChart tooltip formatter to use `net_revenue` instead of `value` in `src/components/reports/RevenueChart.tsx:62-66`
- [X] T003 [P] [US1] Fix InstructorPerformanceChart tooltip formatter — change label from "Attendance Rate" to "Active Students" and remove `%` suffix in `src/components/reports/InstructorPerformanceChart.tsx:60`
- [X] T004 [US1] Remove false "Using fallback data where available" error message in `src/pages/ReportsPage.tsx:35` — no fallback mechanism exists

**Checkpoint**: Revenue chart shows correct percentages, no misleading labels, no phantom error messages.

---

## Phase 4: User Story 2 — Consistent Data Fetching (Priority: P1)

**Goal**: Migrate 5 `useEffect`+`useState` hooks to React Query, centralize query keys, fix `date!` non-null assertion.

**Independent Test**: Navigate between all report tabs. Verify via React DevTools that all queries use centralized keys from `queryKeys.ts` and show proper cache entries.

- [X] T005 [P] [US2] Migrate `useDailyCollections` to `useQuery` with centralized key in `src/components/reports/hooks/useDailyCollections.ts` (remove `useState`/`useEffect`/`useCallback`)
- [X] T006 [P] [US2] Migrate `useEnrollmentTrends` to `useQuery` with centralized key in `src/components/reports/hooks/useEnrollmentTrends.ts` (keep `months` param, remove `isUsingMockData`)
- [X] T007 [P] [US2] Migrate `useInstructorPerformance` to `useQuery` with centralized key in `src/components/reports/hooks/useInstructorPerformance.ts` (remove `isUsingMockData`)
- [X] T008 [P] [US2] Migrate `useRevenueData` to `useQuery` with centralized key in `src/components/reports/hooks/useRevenueData.ts` (pass `months` to API, remove `isUsingMockData`)
- [X] T009 [P] [US2] Migrate `useStudentProgress` to `useQuery` with centralized key in `src/components/reports/hooks/useStudentProgress.ts` (remove `isUsingMockData`)
- [X] T010 [US2] Centralize `useDailyReport` query key + replace `date!` with controlled `enabled: !!date` in `src/components/reports/hooks/useDailyReport.ts:7`
- [X] T011 [US2] Centralize `useReportsSummary` query key — use `queryKeys.reports.summary(today)` instead of inline `['reports', 'summary', today]` in `src/components/reports/hooks/useReportsSummary.ts:60`

**Checkpoint**: All 7 hooks use React Query with centralized `queryKeys` factory. No `useEffect`+`useState` patterns remain in reports hooks.

---

## Phase 5: User Story 3 — Accessible Reports (Priority: P1)

**Goal**: Fix 14 accessibility gaps — ARIA roles on tabs, keyboard navigation, form labels, accordion attributes, icon aria-hidden, ErrorBoundary, semantic ranking.

**Independent Test**: Screen reader announces tab role/state. Arrow keys switch tabs. Inputs have associated labels. Accordion announces expanded state. No unlabeled icons. ErrorBoundary catches DailyReportTab crashes.

- [X] T012 [P] [US3] Add `role="tablist"` to tab container, `role="tab"` + `aria-selected` to tab buttons, keyboard arrow navigation (ArrowLeft/ArrowRight), and focus management in `src/components/reports/molecules/TabNavigation.tsx`
- [X] T013 [P] [US3] Add `htmlFor`/`id` association to date label and input in `src/components/reports/molecules/ReportDatePicker.tsx:10`
- [X] T014 [P] [US3] Add `aria-label="Email recipients"` to email input in `src/components/reports/molecules/ReportEmailSender.tsx:70`
- [X] T015 [P] [US3] Add `aria-expanded` to accordion toggle and `aria-controls` + `id` to accordion panel in `src/components/reports/atoms/ReportPaymentDetails.tsx:48-65`
- [X] T016 [P] [US3] Add `aria-hidden="true"` to all Material Symbols icon spans across ReportSummaryCards, ReportSessionDetails, ReportPaymentDetails, ReportEmailSender, TabNavigation, CollectionsTab, DailyReportTab, OverviewTab, RevenueTab, EnrollmentTab, RevenueChart, StudentProgressChart, ProgressTab
- [X] T017 [P] [US3] Add `htmlFor`/`id` association to date label and input in `src/components/reports/organisms/CollectionsTab.tsx:98`
- [X] T018 [P] [US3] Wrap DailyReportTab content in ErrorBoundary component in `src/components/reports/organisms/DailyReportTab.tsx:1`
- [X] T019 [P] [US3] Remove duplicate `isLoading` prop on DataTable in `src/components/reports/organisms/InstructorsTab.tsx:69` (already short-circuited by earlier `if (isLoading)` block)
- [X] T020 [US3] Replace rank `div` with semantic `<ol>` / `<li>` structure for top-performing students list in `src/components/reports/organisms/ProgressTab.tsx:74-91`

**Checkpoint**: All ARIA attributes present, keyboard navigation works, form inputs labeled, icons hidden from screen readers.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Dead code deletion, TypeScript quality fixes, and build verification.

- [X] T021 [P] Delete dead component `src/components/reports/InstructorPerformanceChart.tsx` (zero imports, unused)
- [X] T022 [P] Delete dead component `src/components/reports/molecules/InstructorDataTable.tsx` (zero imports, unused)
- [X] T023 [P] Remove `export` from `DEFAULT_TABS` in `src/components/reports/molecules/TabNavigation.tsx:57` (never imported externally)
- [X] T024 [P] Remove explicit `any` type from recharts Tooltip formatter callback in `src/components/reports/RevenueChart.tsx:62`
- [X] T025 [P] Remove explicit `any` type from recharts Legend formatter callback in `src/components/reports/StudentProgressChart.tsx:66`
- [X] T026 Run `npm run lint` and fix all errors
- [X] T027 Run `npm run build` (tsc -b && vite build) and verify zero errors

**Checkpoint**: Build passes, lint passes, no dead code.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must complete before US2 tasks (T005-T011)
- **User Stories (Phase 3-5)**: Independent — can run in parallel
  - US1 (T002-T004): No code dependencies on other stories
  - US2 (T005-T011): Depends on T001 (queryKeys factory)
  - US3 (T012-T020): No code dependencies on other stories
- **Polish (Phase 6)**: T021-T025 independent, T026-T027 depend on all prior phases

### User Story Dependencies

- **US1 (P1)**: No dependencies — can start immediately after Phase 1
- **US2 (P1)**: Depends on T001 (queryKeys factory) — otherwise independent
- **US3 (P1)**: No dependencies — can start immediately after Phase 1

### Within Each User Story

- Tasks marked [P] can be done in any order
- Non-[P] tasks should be sequential

### Parallel Opportunities

- **T002-T004** (US1): All [P] — 3 independent bug fixes in 3 different files
- **T005-T009** (US2): All [P] — 5 hooks, all different files, no interdependencies
- **T010-T011** (US2): Sequential — need queryKeys factory (T001) first
- **T012-T020** (US3): All [P] — 9 different files, no interdependencies
- **T021-T025** (Polish): All [P] — 5 independent changes

---

## Parallel Example: All User Stories

```bash
# US1 — Bug fixes (3 parallel tasks):
Task: "Fix RevenueChart tooltip in src/components/reports/RevenueChart.tsx"
Task: "Fix InstructorPerformanceChart label in src/components/reports/InstructorPerformanceChart.tsx"
Task: "Fix ReportsPage error message in src/pages/ReportsPage.tsx"

# US2 — Hook migrations (5 parallel tasks, after T001):
Task: "Migrate useDailyCollections in src/components/reports/hooks/useDailyCollections.ts"
Task: "Migrate useEnrollmentTrends in src/components/reports/hooks/useEnrollmentTrends.ts"
Task: "Migrate useInstructorPerformance in src/components/reports/hooks/useInstructorPerformance.ts"
Task: "Migrate useRevenueData in src/components/reports/hooks/useRevenueData.ts"
Task: "Migrate useStudentProgress in src/components/reports/hooks/useStudentProgress.ts"

# US3 — Accessibility (9 parallel tasks):
Task: "ARIA roles in TabNavigation"
Task: "htmlFor/id in ReportDatePicker"
Task: "aria-label in ReportEmailSender"
Task: "aria-expanded in ReportPaymentDetails"
Task: "aria-hidden on all Material Symbols"
Task: "htmlFor/id in CollectionsTab"
Task: "ErrorBoundary in DailyReportTab"
Task: "Remove duplicate isLoading in InstructorsTab"
Task: "Semantic <ol> in ProgressTab"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: T001 (queryKeys factory)
2. Complete Phase 3: T002-T004 (bug fixes)
3. **STOP and VALIDATE**: Verify Revenue chart shows correct values, no fallback message
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 (T001) → Foundation ready
2. Add US1 (T002-T004) → Bug fixes → Validate independently
3. Add US2 (T005-T011) → React Query migration → Validate independently
4. Add US3 (T012-T020) → Accessibility → Validate independently
5. Polish (T021-T027) → Dead code, TS quality, lint/build

### Parallel Team Strategy

1. Setup + queryKeys ready (T001)
2. Three developers in parallel:
   - Dev A: US1 (bugs) + Polish dead code
   - Dev B: US2 (React Query migration)
   - Dev C: US3 (accessibility)
3. Polish lint/build (T026-T027) done by anyone after all phases complete

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- T001 (queryKeys) MUST complete before T005-T011 (US2 hook migration)
