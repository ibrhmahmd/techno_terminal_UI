# Research: Reports Page Redesign

## Design Decisions

### Tab Navigation Style
**Decision**: Dark premium tabs matching GroupedTable
**Rationale**: The `bg-slate-800 p-1.5 rounded-xl` bar with `bg-secondary text-white` active state provides a premium feel and separates the tab bar from content. Already established in GroupedTable component. Light pill style (`bg-slate-100`) blends into the page too much.
- Active tab: `bg-secondary text-white shadow-sm`
- Inactive tab: `text-slate-300 hover:text-white hover:bg-white/10`
- Bar: `bg-slate-800 p-1.5 rounded-xl`

### Metric Cards
**Decision**: Replace custom ReportCard/MetricCard with system MetricSummaryCard
**Rationale**: Eliminates 2 duplicate components (~120 lines total). MetricSummaryCard already supports loading skeletons, error states, color variants (positive/green, negative/red, neutral/slate, warning/amber), and proper design tokens.
- Color mapping: `green`→`positive`, `blue`→`neutral`, `amber`→`warning`, `slate`→`neutral`, `purple` (report card only)→`neutral`
- `Record<string, string>` payment method icons need to remain Material Symbols (not MetricSummaryCard's Lucide) — use `icon` prop if available, or keep icon as `<span>` outside MetricSummaryCard

### Chart Color
**Decision**: System secondary teal `#006a61`
**Rationale**: Consistent with the app's accent color used for buttons, active states, and links throughout the app. The current amber (`#f59e0b`) is not part of the design system.
- RevenueChart Area: teal gradient (`#006a61` → transparent)
- EnrollmentTrendsChart Bar: teal fill
- StudentProgressChart Pie: teal/blue/slate (keep distinct status colors but make the primary/accent slice teal)

### Per-Tab Lazy Loading
**Decision**: Each tab owns its data hook
**Rationale**: Reduces API calls on initial page load from 6 to 1. Each tab becomes self-contained — it can be understood in isolation. The ReportsPage no longer needs to manage 6 hook return values.
- ReportsPage imports tabs, renders `{activeTab === 'x' && <XTab />}`
- Each tab imports its own hook internally
- React Query caching handles deduplication if same data is needed by multiple tabs

### Page Header
**Decision**: Use `PageHeader` component
**Rationale**: Already used by Groups, Competitions, Students pages. Provides responsive padding, subtitle slot, actions slot, and sticky behavior.

### Error/Loading/Empty States
**Decision**: Use system `ErrorState`, `LoadingState`, `EmptyState`
**Rationale**: These components exist in `src/components/common/` and provide consistent visual language. Eliminates ~50 lines of inline state handling per tab × 7 tabs.

### Enrollment & Instructors Tabs
**Decision**: Uncomment and make visible
**Rationale**: Both tabs have fully functional components (`EnrollmentTab`, `InstructorsTab`) wired in ReportsPage. The `enrollment` and `instructors` tab IDs were commented out in DEFAULT_TABS but the components work. Restore them.

### Date Input
**Decision**: Keep native `<input type="date">` but restyle with system focus ring pattern
**Rationale**: `DateInput` is designed for DD-MM-YYYY display format — not ideal for the YYYY-MM-DD native date picker needed here. The native date picker provides a better UX for calendar selection.
- Add `focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary`
- Add proper `htmlFor`/`id` association (already done in 020)

### Action Buttons
**Decision**: Replace inline buttons with `ActionButton` where it simplifies code
**Rationale**: `ActionButton` supports `primary` (teal), `secondary` (outlined), `danger` (red), `ghost` variants with Material icon support and loading state. For simple primary buttons, use `ActionButton variant="primary"`.
- DailyReportTab "Download PDF" → `ActionButton variant="primary"`
- DailyReportTab "Refresh" → `ActionButton variant="secondary"`
- Retry buttons in error states → already handled by `ErrorState` component

## Component Deletion Summary

| Delete | Replace With |
|--------|-------------|
| `ReportCard.tsx` | `MetricSummaryCard` |
| `MetricCard.tsx` | `MetricSummaryCard` |
| `SummaryCards.tsx` | Inline `MetricSummaryCard` usage in OverviewTab |
