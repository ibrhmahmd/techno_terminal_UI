# Research: Directory Page Audit & Fix

## Phase 0: Requirements Clarification

## Methodology

The 85 audit findings were identified by the `frontend-feature-audit` skill across 8 phases:
1. **explore** — directory page scope & dependency mapping
2. **dead-code** — unused hooks, variables, exports
3. **arch-compliance** — module placement, barrel exports, naming convention drift
4. **bug-hunter** — null assertions, unhandled errors, logic errors
5. **ts-quality** — unsafe casts, missing type guards, redundant annotations
6. **data-fetch** — staleTime drift, duplicate queries, ineffective invalidation
7. **a11y-ux** — focus rings, aria attributes, heading hierarchy, error boundaries
8. **react-perf** — sequential operations, barrel imports, unmemoized computations
9. **ui-polish** — contrast ratios, spacing tokens, motion preferences, hover states, semantic HTML

## Key Files Impacted

| File | Findings |
|------|----------|
| `src/pages/DirectoryPage.tsx` | 12 (runtime bug, direct imports, Promise.all, Map lookups, useMemo, lazy loading, ErrorBoundary, PANEL_ORDER, useState lazy, spacing) |
| `src/components/crm/WaitingListPanel.tsx` | 6 (motion-safe, useMemo, spacing, barrel imports) |
| `src/hooks/useWaitingList.ts` | 5 (3 dead hooks, staleTime, duplicate fetch) |
| `src/hooks/directory/useDirectoryData.ts` | 3 (redundant cast, waiting count, barrel imports) |
| `src/components/common/SearchBar.tsx` | 3 (aria-hidden, focus-visible, barrel imports) |
| `src/components/common/MetricsStripCards.tsx` | 2 (aria-controls, aria-orientation) |
| `src/components/directory/StudentGroupBySelector.tsx` | 6 (contrast, spacing, focus-visible, redundant cast, barrel imports) |
| `src/components/directory/StudentCard.tsx` | 2 (focus-visible, barrel imports) |
| `src/components/directory/ParentCard.tsx` | 2 (focus-visible, barrel imports) |
| `src/components/directory/AlphabetSlider.tsx` | 2 (focus-visible, spacing) |
| `src/components/directory/AdvancedSearchPanel.tsx` | 4 (motion-safe, useMemo, spacing, barrel imports) |
| `src/components/directory/shared/CardSkeleton.tsx` | 1 (motion-safe) |
| `src/components/directory/hooks/useStudentActions.ts` | 2 (move to hooks/directory/, unhandled error) |
| `src/components/crm/StudentMobileCard.tsx` | 5 (aria-hidden, font-headline, hover, contrst, <a> nav) |
| `src/components/crm/ParentMobileCard.tsx` | 4 (font-headline, hover, contrast, <a> nav) |
| `src/components/crm/WaitingStudentCard.tsx` | 2 (font-headline, focus-visible) |
| `src/api/crm/students/index.ts` | 12 (unused barrel type re-exports) |

## Unknowns & Clarifications

| Question | Answer |
|----------|--------|
| Are there any missing findings not covered by the spec? | No — the audit was comprehensive across 9 dimensions |
| Are there external dependencies that need updating? | No — all changes use existing dependencies |
| Is the runtime bug reproducible? | Yes — it's a non-null assertion `editingStudent!` that crashes when `editingStudent` is null |
| Do any changes require backend coordination? | No — all changes are frontend-only |
| Are there accessibility baseline requirements? | WCAG 2.1 AA implied; fix contrast violations (1.5:1→minimum 3:1) |
| What is the priority order? | P0 (critical) → P1 → P2 → P3, as documented in findings |
| Are test files in scope? | No — "no new Vitest tests" policy |

## Conclusion

All 85 findings are fully specified with exact locations and remediation guidance. **Zero unknowns** require further clarification. Phase 1 can proceed directly.
