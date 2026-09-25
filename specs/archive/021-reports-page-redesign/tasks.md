---

description: "Task list for Reports Page Redesign"
---

# Tasks: Reports Page Redesign

**Input**: Design documents from `/specs/021-reports-page-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks.

**Organization**: Tasks grouped by user story from spec.md. Each tab is independently modifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1=unified states, US2=tab nav, US3=lazy loading, US4=system components
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed. All common components, hooks, and utilities already exist.

---

## Phase 2: User Story 2 — Dark Premium Tab Navigation (Priority: P1) 🎯 MVP

**Goal**: Tab bar uses `bg-slate-800 rounded-xl` dark style with `bg-secondary text-white` active state. Enrollment and Instructors tabs uncommented. Page header uses `PageHeader` component.

**Independent Test**: Navigate to Reports. Tab bar shows dark slate background with teal active tab. All 7 tabs visible: Overview, Enrollment, Revenue, Collections, Progress, Daily.

- [X] T001 [US2] Rewrite TabNavigation dark premium style (`bg-slate-800 p-1.5 rounded-xl` bar, `bg-secondary text-white shadow-sm` active, `text-slate-300 hover:text-white hover:bg-white/10` inactive) and uncomment enrollment/instructors tabs in `src/components/reports/molecules/TabNavigation.tsx`
- [X] T002 [US2] Replace inline `<header>` with `PageHeader` component in `src/pages/ReportsPage.tsx` (import from common, use title="Reports" subtitle="Analytics and insights dashboard")
- [X] T003 [US2] Refactor ReportsPage to render only the active tab (`{activeTab === 'x' && <XTab />}`), remove all 6 data hook imports and their invocations, remove isLoading/errorMessage/retry logic — each tab handles its own states in `src/pages/ReportsPage.tsx`

**Checkpoint**: Dark tab bar renders, all 7 tabs visible, page header matches other pages, no data fetching on mount.

---

## Phase 3: User Story 3 — Per-Tab Lazy Loading (Priority: P1)

**Goal**: Each tab imports and calls its own data hook. ReportsPage no longer fetches anything.

**Independent Test**: Open Network tab, navigate to Reports. Only one API call (Overview tab's default). Switch to Revenue tab → only Revenue API call fires.

- [X] T004 [P] [US3] Add `useReportsSummary` + `useRevenueData` imports and calls inside OverviewTab, remove them from props interface in `src/components/reports/organisms/OverviewTab.tsx`
- [X] T005 [P] [US3] Add `useEnrollmentTrends` import and call inside EnrollmentTab, remove from props in `src/components/reports/organisms/EnrollmentTab.tsx`
- [X] T006 [P] [US3] Add `useRevenueData` import and call inside RevenueTab, remove from props in `src/components/reports/organisms/RevenueTab.tsx`
- [X] T007 [P] [US3] Add `useInstructorPerformance` import and call inside InstructorsTab, remove from props in `src/components/reports/organisms/InstructorsTab.tsx`
- [X] T008 [P] [US3] Add `useStudentProgress` import and call inside ProgressTab, remove from props in `src/components/reports/organisms/ProgressTab.tsx`
- [X] T009 [P] [US3] Add `useDailyCollections` import and call inside CollectionsTab, remove from props in `src/components/reports/organisms/CollectionsTab.tsx`

**Checkpoint**: Each tab independently fetches its data. Only one API call per tab switch.

---

## Phase 4: User Story 1 — Unified Tab Experience (Priority: P1)

**Goal**: All tabs use `LoadingState`/`ErrorState`/`EmptyState` from common for consistent state rendering.

**Independent Test**: Stub each hook to return loading/error/empty and verify the UI renders the correct system component each time.

- [X] T010 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/OverviewTab.tsx`
- [X] T011 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/EnrollmentTab.tsx`
- [X] T012 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/RevenueTab.tsx`
- [X] T013 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/InstructorsTab.tsx`
- [X] T014 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/ProgressTab.tsx`
- [X] T015 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/CollectionsTab.tsx`
- [X] T016 [P] [US1] Replace inline loading/error/empty states with `LoadingState`/`ErrorState`/`EmptyState` in `src/components/reports/organisms/DailyReportTab.tsx`

**Checkpoint**: All 7 tabs have consistent loading/error/empty UX using system components.

---

## Phase 5: User Story 4 — System Colors & Components (Priority: P2)

**Goal**: KPI cards use `MetricSummaryCard`, charts use system teal, date picker has system focus ring.

**Independent Test**: Verify teal gradients on charts. Verify MetricSummaryCard renders with proper colors. Verify date input focus ring matches system style.

- [X] T017 [P] [US4] Replace `MetricCard` with `MetricSummaryCard` in RevenueTab in `src/components/reports/organisms/RevenueTab.tsx`
- [X] T018 [P] [US4] Replace `MetricCard` with `MetricSummaryCard` in CollectionsTab in `src/components/reports/organisms/CollectionsTab.tsx`
- [X] T019 [P] [US4] Replace custom `ReportCard`/`MetricCard` usage in OverviewTab with `MetricSummaryCard` in `src/components/reports/organisms/OverviewTab.tsx` (remove SummaryCards import, inline MetricSummaryCard usage)
- [X] T020 [P] [US4] Replace `MetricCard` with `MetricSummaryCard` in ReportSummaryCards in `src/components/reports/atoms/ReportSummaryCards.tsx`
- [X] T021 [P] [US4] Recolor RevenueChart — replace amber `#f59e0b` gradient/line/stroke with system teal `#006a61` in `src/components/reports/RevenueChart.tsx`
- [X] T022 [P] [US4] Recolor StudentProgressChart — replace blue/custom with teal-primary scheme in `src/components/reports/StudentProgressChart.tsx`
- [X] T023 [P] [US4] Recolor EnrollmentTrendsChart — replace blue bar with teal `#006a61` in `src/components/reports/EnrollmentTrendsChart.tsx`
- [X] T024 [US4] Add system focus ring styling (`focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary`) to ReportDatePicker in `src/components/reports/molecules/ReportDatePicker.tsx`

**Checkpoint**: All charts use teal accents. All KPI cards use MetricSummaryCard. Date picker has system focus ring.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Delete replaced components, run lint and build.

- [X] T025 [P] Delete `src/components/reports/atoms/ReportCard.tsx` (replaced by MetricSummaryCard)
- [X] T026 [P] Delete `src/components/reports/atoms/MetricCard.tsx` (replaced by MetricSummaryCard)
- [X] T027 [P] Delete `src/components/reports/molecules/SummaryCards.tsx` (replaced by inline MetricSummaryCard usage)
- [X] T028 Run `npm run lint` and fix all errors
- [X] T029 Run `npm run build` (tsc -b && vite build) and verify zero errors

**Checkpoint**: Build passes, lint passes, no dead components.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 2 (US2)**: No dependencies — TabNavigation + ReportsPage first
- **Phase 3 (US3)**: Depends on Phase 2 (ReportsPage must support per-tab rendering)
- **Phase 4 (US1)**: Depends on Phase 3 (tabs must have internal data before we add states)
- **Phase 5 (US4)**: Depends on Phase 4 (components must exist before replacing internals)
- **Phase 6 (Polish)**: Depends on all prior phases

### User Story Dependencies

- **US2 → US3 → US1 → US4**: Sequential chain
- Within each phase, [P] tasks run in parallel

### Parallel Opportunities

- **Phase 2**: T001-T003 sequential (ReportsPage depends on TabNavigation)
- **Phase 3**: T004-T009 all [P] — 6 tabs, all different files
- **Phase 4**: T010-T016 all [P] — 7 tabs, all different files
- **Phase 5**: T017-T024 all [P] — 4 MetricSummaryCard + 3 chart recolor + 1 date picker
- **Phase 6**: T025-T027 all [P] — 3 file deletions

---

## Parallel Example: Phase 3

```bash
# All 6 tab hook migrations in parallel:
Task: "Add useReportsSummary + useRevenueData to OverviewTab"
Task: "Add useEnrollmentTrends to EnrollmentTab"
Task: "Add useRevenueData to RevenueTab"
Task: "Add useInstructorPerformance to InstructorsTab"
Task: "Add useStudentProgress to ProgressTab"
Task: "Add useDailyCollections to CollectionsTab"
```

---

## Implementation Strategy

### MVP (Phase 2 Only)

1. Dark tab bar + PageHeader + per-tab rendering
2. Even without hooks moved, empty tabs render — visual improvement alone is worth deploying

### Full Delivery

1. Phase 2 → Visual redesign (tab bar + page header)
2. Phase 3 → Lazy loading (performance win)
3. Phase 4 → Consistent states (UX win)
4. Phase 5 → System colors (visual consistency)
5. Phase 6 → Cleanup
