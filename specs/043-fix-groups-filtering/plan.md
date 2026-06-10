# Implementation Plan: Fix Groups Filtering & Pagination

**Branch**: `043-fix-groups-filtering` | **Date**: 2026-06-10 | **Spec**: specs/043-fix-groups-filtering/spec.md
**Input**: Feature specification from `/specs/043-fix-groups-filtering/spec.md`

## Summary

Fix groups filtering and pagination across 3 user stories: card view missing pagination (US1), page not resetting on filter changes (US2), and missing record count in pagination footer (US4). All frontend-only. US3 (grouped view filters + pagination) requires backend changes and is deferred to a separate backend track.

## Technical Context

- **GroupsPage.tsx**: Renders `<Pagination>` only in flat table view (line 416-432), missing in card view
- **GroupFilters.tsx**: Filter option clicks don't reset `currentPage` — only "Apply" button does
- **useGroups.ts**: `filterOptions` useMemo depends on filter state + `currentPage`. When filter state changes without page reset, the query sends stale offset
- **Pagination.tsx**: Already supports `totalRecords` prop (line 108-111) — just not passed from GroupsPage

## Source Code Changes

```
src/
├── components/groups/
│   └── GroupFilters.tsx                 # ← page reset on option click
└── pages/
    └── GroupsPage.tsx                   # ← pagination in card view, pass totalRecords
```

## Implementation Order

1. **Phase 1**: US1 — Card view pagination (frontend-only, no deps)
2. **Phase 2**: US2 — Pagination reset on filter (frontend-only, no deps)  
3. **Phase 3**: US4 — Record count (frontend-only, depends on US1 for card view)
