# Research: Groups Feature Audit — Phase 0

## Overview

The groups feature was audited across 5 dimensions (runtime bugs, dead code, TypeScript, data fetching, accessibility) using automated grep searches and manual code review of 24 components, 10 hooks, 15 API files, 14 type files, and 2 pages.

All "NEEDS CLARIFICATION" items from the Technical Context were resolved during the audit phase. No further unknowns remain.

## Key Decisions

### Runtime Bugs

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Fix `EditGroupDialog` STATUSES to match API model (`active/inactive/archived/completed`) | `cancelled` is not a valid server status; causes "Unknown" badge display | Could add `cancelled` to data model, but that's backend scope — out of bounds |
| Guard `GroupDetailPage` toast with `useRef` to prevent re-fire loop | `showToast` reference instability causes toast on every render when error is present | Could memoize `showToast`, but the hook itself is unstable — ref guard is simpler |
| Add `completed` to `GroupFilters` status list | Users cannot filter completed groups | Could query API for valid status list, but no such endpoint exists |
| Compute mutation errors per-mutation instead of cascading `\|\|` | Cascading `\|\|` masks success of one mutation when another has stale error | Could clear all errors on each mutation start, but per-mutation `isError` check is more granular |
| Use shared `formatDate` instead of `toLocaleDateString()` | Cross-browser locale consistency | Could standardize locale, but shared utility is the established convention |
| Pass actual `price_override` to dialog instead of `null` | Existing overrides would be silently discarded | Could ignore, but that's a data loss bug |

### Dead Code

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Delete `TabNavigation.tsx` in groups/ | Zero imports anywhere outside its own file. Shadowed by reports/molecules/TabNavigation | Rename instead of delete, but no consumer exists |
| Delete `LevelStudentsPanel.tsx` | Zero imports. Functionality not used by GroupDetailPage or any page | Could keep for future use, but dead code should be removed per spec |
| Remove 8 dead barrel exports from academics/*/index.ts | Functions exist in core.ts but are never imported from the barrel by any consumer | Could keep barrel exports for completeness, but they add maintenance surface with no benefit |
| Delete `SubstituteInstructorRequest`, `EnrollmentHistoryFilters`, `PaginatedGroupsResponse` types | Zero imports. `PaginatedGroupsResponse` is already marked `@deprecated` | Keep deprecated type for migration period, but nothing imports it |

### TypeScript Violations

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Replace `payment: any` with `PaymentDetailDTO` | The parameter receives properly typed data from `.map()` | Could keep `any` with justification, but the type is available and correct |
| Fix `GroupBySelectorProps.value` to accept `'search'` | The component's onChange already accepts `GroupBySelectorValue` which includes `'search'` | Could keep `as any` cast in GroupsPage, but that masks the real prop type mismatch |
| Replace unsafe `stored as GroupByField` with type predicate | The cast passes through Set.has() which can accept any string | Could use `includes()` on array, but type predicate is more idiomatic TS |
| Remove unnecessary `as keyof EnrichedGroupPublic` | `sortField` is already typed as `SortField` with valid keys | Keep for clarity, but it's redundant and suppresses useful narrowing |

### Data Fetching

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Replace inline `['employees', 'list']` with `queryKeys.employeesAll` | Creates duplicate cache entry; invalidation of one won't affect the other | Could add `employeesAll` as alias, but the key already exists in the factory |
| Remove redundant per-key invalidations in `invalidateGroups` | Prefix `['groups']` invalidation already matches all nested keys | Keep for explicitness, but it's dead code that suggests wrong mental model |

### Accessibility

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Add `aria-hidden="true"` to 6 decorative Material Symbols icons | Screen readers read raw icon names aloud | Could use CSS `content` instead of spans, but would lose icon framework compatibility |
| Add `role="switch"` + `aria-checked` + `aria-label` to substitute toggle | No semantic meaning — screen readers can't identify or operate it | Could use `<input type="checkbox">` styled as toggle, but requires more CSS restructuring |
| Add `htmlFor`/`id` pairs to date input and textarea | Relies on proximity for label association | Could wrap input in label element, but adds nesting and may conflict with existing layout |
| Add arrow key navigation to LevelSelector tablist | Tab-like control must support arrow keys per WAI-ARIA pattern | Could use `<div role="tabpanel>` pattern, but would require more DOM restructuring |
| Add `role="button"` + `tabIndex` to clickable student card | Keyboard-only users cannot activate | Could convert to `<button>` but requires restyling |

## Dependencies

- `formatDate` utility exists at `src/utils/formatting.ts` — verified
- `formatTime` utility exists at `src/utils/formatting.ts` — verified  
- `PaymentDetailDTO` type exists at `src/api/academics/types/groups/models.ts` — verified
- `EnrichedGroupPublic` type exists at `src/api/academics/types/groups/models.ts` — verified
- `queryKeys.employeesAll` exists at `src/hooks/queryKeys.ts` — verified

## Risks

- No risks identified. All changes are bug fixes, dead code removal, or type strictness improvements. No behavioral regressions expected when following the spec's before/after snippets.
