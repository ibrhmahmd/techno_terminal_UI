---

description: "Task list for 043-fix-groups-filtering — card view pagination, page reset on filter, and record count"

---

# Tasks: Fix Groups Filtering & Pagination

**Input**: Design documents from `/specs/043-fix-groups-filtering/`
**Prerequisites**: plan.md, spec.md

**Tests**: Not requested — no test tasks.

**Organization**: Tasks are grouped by user story. Each story is independently implementable and testable.

## Format

- `[P]`: Can run in parallel
- `[Story]`: Which user story this task belongs to

---

## Phase 1: User Story 1 — Card View Pagination (Priority: P1) 🎯 MVP

**Goal**: Users can navigate pages in flat card view.

**Independent Test**: Switch to card view with >50 groups across multiple pages; verify pagination controls appear below the card grid and function identically to table view (page numbers, prev/next, page size selector).

### Implementation

- [ ] T001 [US1] Add `<Pagination>` component after flat card view `</GroupCardGrid>` in `src/pages/GroupsPage.tsx` — clone the existing table-view pagination block (lines 416-432) into the flat card view branch (after line 352), using the same `currentPage`/`totalPages`/`pageSize` props

**Checkpoint**: Flat card view shows pagination controls. Test by loading >50 groups, switching to card view.

---

## Phase 2: User Story 2 — Pagination Reset on Filter Changes (Priority: P1)

**Goal**: Filter pill toggles do not trigger premature query refetches — only Apply/tag-remove/clear-all commit filter changes and reset page to 1.

**Independent Test**: On page 5 with no filters, open filter panel, toggle a course pill, verify results do NOT change (still show page 5). Click Apply – verify page resets to 1 with filtered results.

### Implementation

- [ ] T002 [US2] Add local temp state for each filter category in `src/components/groups/GroupFilters.tsx` — initialize from `props.filters`, update on pill toggle only, commit to `filters.setSelected*` inside `handleApply`; reset reverts to committed values

**Checkpoint**: Pills toggle locally without refetch; Apply commits + page resets; tag-remove and clear-all still reset page to 1 (existing behavior verified).

---

## Phase 3: User Story 4 — Record Count in Pagination Footer (Priority: P3)

**Goal**: Pagination footer shows "Showing X–Y of Z records".

**Independent Test**: Load groups with <50 records; verify pagination footer reads "Showing 1–25 of 25 records" (or similar).

### Implementation

- [ ] T003 [P] [US4] Pass `totalRecords={totalGroups}` to `<Pagination>` in flat table view in `src/pages/GroupsPage.tsx` (line 418)
- [ ] T004 [US4] Pass `totalRecords={totalGroups}` to `<Pagination>` in flat card view in `src/pages/GroupsPage.tsx` (added in T001)

**Checkpoint**: Both table and card views show record count in pagination footer.

---

## Phase 4: Polish & Verification

- [ ] T005 Run `npm run build` and verify zero errors
- [ ] T006 Run `npm run lint` and fix any issues

---

## Dependencies & Execution Order

### User Story Dependencies

| Story | Priority | Depends On | Independent Test |
|-------|----------|------------|------------------|
| US1   | P1       | None       | Switch to card view with >50 groups; pagination controls appear and work |
| US2   | P1       | None       | Toggle pill on page 5; results stay; Apply resets to page 1 |
| US4   | P3       | US1 (card view) | Footer shows "Showing X–Y of Z records" in both views |

### Execution Order

US1 → US2 → US4 (opt. US1 first so US4 can piggyback on both table and card view changes)

### Within Each User Story

- Single implementation task per story (focused, one file each)
- Verify each story independently before moving to next

### Parallel Opportunities

- T003 and T004 modify different parts of `GroupsPage.tsx` — can be done in same pass
- T005 (build) can run in parallel with any remaining task

---

## Parallel Example

```bash
# US1 flat card view pagination:
Task: "Add Pagination after flat card view GroupCardGrid in GroupsPage.tsx"

# US4 record count (once US1 is done):
Task: "Pass totalRecords in table view + card view Pagination in GroupsPage.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: US1 — Card View Pagination
2. **STOP and VALIDATE**: Verify pagination works in flat card view
3. Deploy/demo if needed

### Incremental Delivery

1. US1 → Verify → US2 → Verify → US4 → Verify → Polish
2. Each story is independently testable and adds value without breaking prior work

### Notes

- `Pagination.tsx` already supports `showTotalInfo` and `totalRecords` props — no component changes needed
- Existing `handleRemoveFilter` and `handleClearAllFilters` in `GroupsPage.tsx` already call `setCurrentPage(1)` — behavior preserved
- Grouped card view pagination is deferred (US3 in spec, backend-dependent) — not in scope
