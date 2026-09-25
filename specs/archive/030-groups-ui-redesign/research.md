# Research: Groups UI Controls Redesign

**Phase 0 output** | **Date**: 2026-06-03

## Overview

No NEEDS CLARIFICATION markers existed in the Technical Context. All reference components are present in the codebase. No external research was required.

## Reference Implementations

### GroupBySelector → DaySelectorBar

Located at `src/components/dashboard/DaySelectorBar.tsx`. Uses:
- Container: `bg-blue-50 border border-blue-100 rounded-lg p-1`
- Active tab: `bg-white text-secondary shadow-sm font-bold border border-blue-200`
- Inactive tab: `text-slate-600 hover:text-secondary hover:bg-white/70`
- Font: `font-headline text-sm font-medium`
- Role: `tab` / `tablist` with `aria-selected`

The current `GroupBySelector` uses `bg-slate-100` container and lacks the blue tones and border. The restyle is purely a Tailwind class swap.

### GroupFilters → AdvancedSearchPanel

Located at `src/components/directory/AdvancedSearchPanel.tsx`. Uses:
- `FilterPill` component (`src/components/common/FilterPill.tsx`) for category pills
- Expanded panel: `bg-slate-50 rounded-xl p-4 border border-slate-200`
- Toggle pill buttons: `rounded-full bg-secondary text-white` (active) / `bg-white text-slate-600 border border-slate-200` (inactive)
- `ActiveFilterTagsList` for displaying active filters
- `DualNumberInput` for range inputs (not needed for group filters)

The `FilterPill` component supports `icon`, `label`, `isExpanded`, `hasFilters`, `filterCount`, `onClick`, and `disabled` props — all wiring needed for the group filter categories.

## Decisions

| Item | Decision | Rationale |
|------|----------|-----------|
| GroupBySelector styling | Match DaySelectorBar exactly | User explicitly requested "old selector design" matching dashboard day selector |
| Course/Instructor control | Searchable multi-select dropdown with checkboxes | Clarified in spec via Q1; handles potentially large lists from API |
| Status/Day/Level control | Toggle pill buttons | Follows AdvancedSearchPanel pattern precisely |
| FilterPill reuse | Import from `components/common/` | Already a shared component, no duplication needed |
| No test changes | Test coverage for UI styling is visual/manual | Existing functional tests remain valid; no new logic to test |
