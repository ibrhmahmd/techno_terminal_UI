# Implementation Plan: Directory Page Student Filtering Audit

## Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 8 + tsc -b
- **Styling**: Tailwind CSS v3
- **State**: Zustand (global) + React Query (server)
- **API**: Axios with 401 auto-refresh interceptor
- **Testing**: Vitest + happy-dom (globals enabled)
- **Icons**: Lucide React + Google Material Symbols

## Project Structure (relevant)
```
src/
├── api/crm/students/
│   ├── search.ts          # filterStudents, getStudentsGrouped, StudentFilterParams
│   ├── core.ts            # getStudentsPaginated, getDeletedStudents
│   └── types/models.ts    # StudentListItem, StudentFilterItem, ParentListItem
├── hooks/
│   ├── directory/
│   │   ├── useDirectoryData.ts    # orchestrates all directory queries
│   │   └── useAdvancedSearch.ts    # filter state management
│   ├── useDirectory.ts           # React Query hooks + directoryKeys definitions
│   ├── useStudentsGrouped.ts     # grouped student data query
│   └── queryKeys.ts              # centralized query key factories
├── components/directory/
│   ├── AdvancedSearchPanel.tsx
│   ├── DirectoryTabs.tsx
│   ├── StudentCard.tsx
│   ├── StudentGroupBySelector.tsx
│   ├── AlphabetSlider.tsx
│   ├── CardGrid.tsx
│   ├── hooks/useStudentActions.ts
│   └── shared/CardSkeleton.tsx
├── components/common/
│   ├── SearchBar.tsx
│   ├── DualNumberInput.tsx
│   ├── Modal.tsx, ConfirmDialog.tsx
│   ├── PageHeader.tsx, Pagination.tsx
│   ├── ErrorState.tsx, LoadingState.tsx
│   └── ActionButton.tsx, RowActions.tsx
├── config/studentGrouping.ts
└── store/groupingSettingsStore.ts
```

## User Story Priorities
| Priority | Story | Impact |
|----------|-------|--------|
| P1 | US-01: Advanced search grouped view ignores filters | Critical bug — wrong data shown |
| P1 | US-04: Cache invalidation mismatch | Critical bug — stale grouped data |
| P2 | US-02: Group key stale on mode switch | High bug — empty content |
| P2 | US-03: No fallback on stale key | High bug — empty content |
| P3 | US-06: Eliminate as any (20 violations) | Critical tech debt |
| P4 | US-05: Remove 15 dead code items | Cleanup |
| P5 | US-07: A11y + error states | Polish |

## Dependencies
- US-04 (cache consolidation) should precede US-01 since grouped filter fix uses the same query keys
- US-02 and US-03 are closely related and should be done together
- US-06 (type fixes) requires careful mapping of API response shapes
- US-05 (dead code) is fully independent
- US-07 (a11y) is independent except where error state propagation touches useDirectoryData

## Implementation Strategy
1. Fix critical bugs first (US-04 + US-01) — cache and grouped filter
2. Fix high-severity UI bugs (US-02 + US-03) — group key management
3. Fix type safety (US-06) — eliminate as any
4. Clean up dead code (US-05)
5. Polish a11y + error states (US-07)
