# Feature Specification: Groups Filtering — Audit Fix

**Feature Branch**: `044-groups-filtering-audit`  
**Created**: 2026-06-10  
**Status**: Clarified  
**Input**: Audit findings from groups filtering feature investigation

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Fix Runtime Bugs in Groups Filtering (Priority: P1)

**Why this priority**: Bugs cause empty card grids, wrong record counts, and inconsistent labels — users cannot trust the interface.

**Independent Test**: Switch between groupBy options in card view; verify groups always show. Switch to grouped view; verify total count is non-zero.

**Acceptance Scenarios**:

1. **Given** the user is in grouped card view, **When** they switch from one groupBy field to another (e.g., from Day to Course), **Then** the active category resets and groups display correctly — no empty card grid.
2. **Given** the user is in grouped view, **When** they view the header, **Then** `totalGroups` reflects the sum across all grouped categories (not zero).
3. **Given** a group has an unknown status, **When** it renders in the table, **Then** the status badge shows "Unknown" (consistent with card view's `GroupStatusBadge`).
4. **Given** the user selects statuses including active, **When** they check the filter count badge, **Then** the count matches the number of visible filter tags.
5. **Given** the user uses arrow key navigation in GroupBySelector, **When** they press ArrowRight past the last option, **Then** it wraps to the first without error.

---

### User Story 2 — Remove Dead Code from Groups API Module (Priority: P2)

**Why this priority**: 4 exported functions are never imported — dead code increases maintenance surface and misleads future developers.

**Independent Test**: Verify `getGroupDetails`, `getGroups`, `searchGroups`, and `getArchivedGroups` are not imported anywhere in `src/` (excluding specs/).

**Acceptance Scenarios**:

1. **Given** the groups API module, **When** searching for imports of `getGroupDetails`, **Then** zero results found outside specs/.
2. **Given** the groups API module, **When** searching for imports of `getGroups`, **Then** zero results found.
3. **Given** the groups API module, **When** searching for imports of `searchGroups`, **Then** zero results found.
4. **Given** the groups API module, **When** searching for imports of `getArchivedGroups`, **Then** zero results found.
5. **Given** the barrel index files (`index.ts`), **When** checking the export entries, **Then** the dead functions are removed from re-exports.

---

### User Story 3 — Fix TypeScript Violations in Groups Module (Priority: P2)

**Why this priority**: 5 unsafe type assertions bypass compile-time safety — will mask future type errors.

**Independent Test**: Run `npm run build` — zero errors. Run `npm run lint` — no new errors.

**Acceptance Scenarios**:

1. **Given** `useGroups.ts` reads `groupBy` from localStorage, **When** validating the stored string, **Then** a type guard function narrows the type instead of raw `as` cast.
2. **Given** `useGroups.ts` passes `groupBy` to `useGroupsGrouped`, **When** the query runs, **Then** the type assertion is removed or verified by a type guard.
3. **Given** `GroupsPage.tsx` catches an error from `createGroupMutation`, **When** accessing `err.response.data.detail`, **Then** an Axios type predicate is used instead of raw `as` cast.
4. **Given** `core.ts` defines `normalizeEnrichedGroup`, **When** declaring the function, **Then** it has an explicit return type annotation.
5. **Given** `useGroups.ts` creates the `filters` object, **When** returning it from the hook, **Then** the object is memoized with `useMemo` to prevent downstream useMemo recomputation.
6. **Given** `useGroups.ts` accesses `sortField` on a group, **When** doing array lookup, **Then** the redundant `as keyof EnrichedGroupPublic` cast is removed.

---

### User Story 4 — Fix Accessibility Gaps in Groups UI (Priority: P1)

**Why this priority**: 10 issues found — pagination, controls, and dynamic content are inaccessible to screen reader users.

**Independent Test**: Navigate the groups page using only keyboard and a screen reader; verify all controls are reachable and announce correctly.

**Acceptance Scenarios**:

1. **Given** the Pagination component, **When** rendering navigation buttons (First, Prev, Next, Last) and page number buttons, **Then** each button has `aria-label`, Material Symbols icons have `aria-hidden="true"`, and the active page has `aria-current="page"`.
2. **Given** the Pagination page size `<select>`, **When** rendered, **Then** it has an `aria-label` describing its purpose.
3. **Given** the RowActions icons (both Material Symbols and Lucide), **When** rendered inside labeled buttons, **Then** they have `aria-hidden="true"`.
4. **Given** the GroupBySelector, **When** rendered, **Then** it uses `role="radiogroup"` with `role="radio"` and `aria-checked` instead of `role="tablist"`/`role="tab"`.
5. **Given** the groups dynamic content area (card grids, DataTable, category tabs), **When** filters, pagination, or view mode change, **Then** the container has `aria-live="polite"` to announce updates.
6. **Given** the groups page layout, **When** rendering the toolbar row (GroupBySelector + ViewToggle), **Then** it wraps on narrow viewports without overflow.
7. **Given** the GroupFilters panel, **When** open, **Then** it has `role="region"` with `aria-label="Filter groups"`.
8. **Given** the GroupFilters expanded category content, **When** shown, **Then** it has `aria-live="polite"`.
9. **Given** the groups page, **When** rendering the main content area, **Then** card view and table view each have their own `<ErrorBoundary>` instead of a single wrapper.

---

### User Story 5 — Fix Data Fetching Anti-Patterns (Priority: P3)

**Why this priority**: One manual fetch bypasses React Query entirely (lost caching, retry, invalidation). One staleTime mismatches project convention.

**Independent Test**: Verify `DropEnrollmentPanel.tsx` uses React Query. Verify `useGroupQueries.ts` uses `staleTime: 5min`.

**Acceptance Scenarios**:

1. **Given** `DropEnrollmentPanel.tsx` fetches enriched groups, **When** it needs the data, **Then** it uses `useGroupsFlat` (existing React Query hook) instead of manual `useEffect` + `useState` + `getEnrichedGroups`.
2. **Given** `useGroupQueries.ts` configures the flat query, **When** setting `staleTime`, **Then** it uses `5 * 60 * 1000` (matching the project convention) instead of `10 * 60 * 1000`.

---

### Edge Cases

- `groupBy` localStorage value is `null` (valid, means "All" view) — must not crash.
- `groupBy` localStorage value is an invalid string (e.g., old version) — must fall back to `undefined`.
- `activeCategoryKey` is null on first grouped view load — must default to first category.
- Error detail from API is a string, not an array — must handle both shapes.
- Page size select options are integers — must not break with string coercion.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `activeCategoryKey` MUST reset to `null` when `groupBy` field changes.
- **FR-002**: `totalGroups` MUST reflect the sum of grouped category counts in grouped view.
- **FR-003**: Unknown group status MUST display as "Unknown" in table view (consistent with card view).
- **FR-004**: Filter count badge on status category MUST count all selected statuses (not exclude active).
- **FR-005**: GroupBySelector keyboard handler MUST guard against `OPTIONS[next]` being undefined.
- **FR-006**: `getGroupDetails`, `getGroups`, `searchGroups`, `getArchivedGroups` MUST be removed (function + barrel exports) if zero consumers confirmed.
- **FR-007**: `groupKeys` in `useGroupQueries.ts` MUST be module-private (drop `export`).
- **FR-008**: localStorage `groupBy` hydration MUST use a type guard function instead of raw `as` cast.
- **FR-009**: Error detail access in `GroupsPage.tsx` MUST use a type predicate instead of raw `as` cast.
- **FR-010**: `normalizeEnrichedGroup` MUST have an explicit return type annotation.
- **FR-011**: The `filters` object in `useGroups.ts` MUST be memoized with `useMemo`.
- **FR-012**: The redundant `as keyof EnrichedGroupPublic` cast in `useGroups.ts` sort access MUST be removed.
- **FR-013**: Pagination navigation buttons MUST have `aria-label` attributes.
- **FR-014**: Pagination Material Symbols icons MUST have `aria-hidden="true"`.
- **FR-015**: Active page button MUST have `aria-current="page"`.
- **FR-016**: Page size `<select>` MUST have `aria-label`.
- **FR-017**: RowActions Material Symbols and Lucide icons MUST have `aria-hidden="true"`.
- **FR-018**: GroupBySelector MUST use `role="radiogroup"`/`role="radio"`/`aria-checked` instead of `role="tablist"`/`role="tab"`/`aria-selected`.
- **FR-019**: Dynamic content area in GroupsPage MUST have `aria-live="polite"`.
- **FR-020**: Card view and table view sections MUST each have their own `<ErrorBoundary>`, with independent loading states — each section handles its own spinner/loading indicator rather than a shared overlay.
- **FR-021**: GroupsPage toolbar row MUST wrap on narrow viewports without overflow.
- **FR-022**: GroupFilters panel container MUST have `role="region"` and `aria-label="Filter groups"`.
- **FR-023**: GroupFilters expanded category content MUST have `aria-live="polite"`.
- **FR-024**: `DropEnrollmentPanel.tsx` MUST use `useGroupsFlat` instead of manual `useEffect` + `useState`.
- **FR-025**: `useGroupQueries.ts` MUST use `staleTime: 5 * 60 * 1000`.

### Key Entities

- **Group**: Teaching group entity with id, name, course_id, instructor_id, capacity, status, schedule, level, start_date.
- **GroupFilterOptions**: Filter params — q, course_ids, instructor_ids, level_numbers, day, status, skip, limit.
- **GroupByField**: Grouping field — one of day, course, instructor, status, or null (flat view).
- **PaginationState**: Client-side currentPage, pageSize, totalPages, totalRecords.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero "empty card grid" states when switching groupBy in card view.
- **SC-002**: Zero mislabeled status badges in table view.
- **SC-003**: Zero unused exported API functions in groups module.
- **SC-004**: All `<Pagination>` buttons accessible via screen reader — `aria-label`, `aria-current`, `aria-hidden` verified.
- **SC-005**: GroupBySelector announced as a radio group, not a tab list.
- **SC-006**: Dynamic content changes announced to screen readers via `aria-live`.
- **SC-007**: `npm run build` passes with zero errors.
- **SC-008**: `npm run lint` passes — only pre-existing warnings (no new issues).

## Clarifications

### Session 2026-06-10

- Q: FR-024 targets `DropEnrollmentPanel.tsx` which is in the enrollments module, not groups — should US5 be scoped to include cross-feature changes? → A: Yes, include it. US5 covers both findings (FR-024 cross-module, FR-025 within groups) under a single data-fetching audit phase. The `DropEnrollmentPanel.tsx` migration is in scope.
- Q: After FR-020 splits the single `<ErrorBoundary>` into separate wrappers for card view and table view, how should loading states behave? → A: Each section handles its own loading independently — card view spinner, table view spinner, no shared overlay.

## Assumptions

- All changes are frontend-only — no backend modifications needed.
- `getGroupDetails`, `getGroups`, `searchGroups`, `getArchivedGroups` have zero consumers outside specs/ — verified via grep before removal.
- The existing `ErrorBoundary` component supports wrapping individual sections.
- The existing `Pagination` component can accept new `aria-label` props without API breakage.
- `DropEnrollmentPanel.tsx` uses `getEnrichedGroups` directly and can be migrated to `useGroupsFlat` — included in US5 scope per clarification.
- The `DropEnrollmentPanel` migration is scoped to switching its data source to `useGroupsFlat`; no enrollment business logic changes are required.
