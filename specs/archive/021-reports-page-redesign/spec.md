# Feature Specification: Reports Page Redesign

**Feature Branch**: `021-reports-page-redesign`
**Created**: 2026-05-22
**Status**: Draft
**Input**: Design audit of Reports page vs app design system (tailwind.config.js, common components, page patterns)

## Clarifications

- Q: Tab style? → A: Dark premium tabs matching GroupedTable (`bg-slate-800 p-1.5 rounded-xl`).
- Q: Metric cards — custom or system? → A: Replace with system `MetricSummaryCard`.
- Q: Chart colors? → A: Use system secondary teal (`#006a61`).
- Q: Data fetching — keep all-at-once or per-tab lazy? → A: Per-tab lazy loading (each tab owns its hook).
- Q: Scope — visual only or full restructure? → A: Full restructure — use system components everywhere, unify all states.

## User Scenarios & Testing

### User Story 1 — Unified Tab Experience (Priority: P1)
Admin navigates between report tabs and sees consistent loading, empty, and error states across all tabs.

**Independent Test**: Navigate through all 7 tabs. Verify each tab shows proper loading skeleton, error banner (if API fails), and empty state (if no data). All use the same `ErrorState`/`LoadingState`/`EmptyState` components.

### User Story 2 — Dark Premium Tab Navigation (Priority: P1)
Admin sees polished dark tab bar matching the GroupedTable pattern elsewhere in the app.

**Independent Test**: Verify tabs use `bg-slate-800 rounded-xl` bar, active tab has `bg-secondary text-white`, inactive tabs have `text-slate-300`.

### User Story 3 — Per-Tab Lazy Loading (Priority: P1)
Reports page only fetches data for the active tab, reducing API calls on initial load.

**Independent Test**: Open DevTools Network tab, navigate to Reports page. Only one API call fires (for the Overview tab, the default). Switching tabs triggers new calls only for that tab.

### User Story 4 — System Colors & Components (Priority: P2)
All components use the design system's teal secondary color, `MetricSummaryCard` pattern, and consistent typography.

**Independent Test**: Verify charts use teal gradients/line colors. Verify KPI cards use `MetricSummaryCard` with proper status colors.

## Requirements

### Functional Requirements
- **FR-001**: Tabs MUST use dark premium style (`bg-slate-800` bar, `bg-secondary` active state)
- **FR-002**: Each tab MUST own its data hook (lazy loading)
- **FR-003**: ReportsPage MUST NOT fetch all hooks on mount — only renders active tab
- **FR-004**: All loading states MUST use `LoadingState` or `Skeleton` from common
- **FR-005**: All error states MUST use `ErrorState` from common
- **FR-006**: All empty states MUST use `EmptyState` from common
- **FR-007**: KPI/metric cards MUST use `MetricSummaryCard` from common/cards
- **FR-008**: Chart accent color MUST be system secondary teal (`#006a61`)
- **FR-009**: Page header MUST use `PageHeader` component
- **FR-010**: Action buttons MUST use `ActionButton` component where applicable
- **FR-011**: Enrollment and Instructors tabs MUST be uncommented and visible

### Entity Changes
- `ReportsPage.tsx` — simplified, no data hooks, only renders active tab
- `TabNavigation.tsx` — dark premium style, all 7 tabs active
- `SummaryCards.tsx` — replaced by `MetricSummaryCard` usage in OverviewTab
- `ReportCard.tsx` — deleted (replaced by MetricSummaryCard)
- `MetricCard.tsx` — deleted (replaced by MetricSummaryCard)
- `ReportDatePicker.tsx` — restyled or replaced with DateInput
- `RevenueChart.tsx` — teal recoloring
- `StudentProgressChart.tsx` — teal recoloring
- `EnrollmentTrendsChart.tsx` — teal recoloring
- Each tab component — imports its own hook, uses common state components

## Success Criteria
- Build passes (`tsc -b && vite build`) with zero errors
- Lint passes with zero new errors
- All 7 tabs render independently and correctly
- Chart colors are teal, not amber
- KPI cards use `MetricSummaryCard`
- Page header uses `PageHeader`
