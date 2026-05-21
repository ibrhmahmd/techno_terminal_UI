---

description: "Task list for Competition Detail Redesign feature"
---

# Tasks: Competition Detail Redesign

**Input**: Design documents from `specs/017-competition-detail-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL — include test tasks only if explicitly requested.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`.
  - API: `src/api/{domain}/`
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/{domain}/`
  - Pages: `src/pages/`
  - Tests: `src/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no setup tasks needed; modifying existing files only.

No tasks required.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API and data layer changes that block both user stories.

**Critical**: No user story work can begin until this phase is complete.

- [x] T001 [P] Update `getTeams` to use `include_members=true` in `src/api/teams/teams.ts` so response includes member payment data. Transform `TeamWithMembersDTO[]` into enriched `TeamCardData[]` in the hook or API layer.
- [x] T002 [P] Define `TeamGroupByField` type and `TeamCardData` / `TeamGroup` interfaces in `src/api/teams/types.ts` (or a new `src/types/teams.ts`).
- [x] T003 Implement `groupTeams(teams, groupBy, subgroupBy)` utility function — pure client-side grouping that returns `TeamGroup[]`. Cover all 6 group-by fields and subgroup logic in `src/components/competitions/utils/groupTeams.ts`.

**Checkpoint**: Foundation ready — both user stories can now be implemented in either order.

---

## Phase 3: User Story 1 — Overview Tab (Priority: P1) 🎯 MVP

**Goal**: Competition info, stats, and categories grid all on the Overview tab. No separate Categories or Summary tabs.

**Independent Test**: Navigate to any competition and confirm Overview shows: competition info card, stats row (total teams, participants), and a compact grid of category cards. No Categories or Summary tabs in tab bar. Empty states when no categories exist.

- [x] T004 [US1] Reduce tab bar from 4 tabs to 2 (Overview, Teams) in `src/pages/CompetitionDetailPage.tsx`. Remove Categories and Summary tabs. Change `activeTab` type to `'overview' | 'teams'`.
- [x] T005 [P] [US1] Add stats row (total teams, total participants) to the Overview section using `useCompetitionSummary` data in `src/pages/CompetitionDetailPage.tsx`.
- [x] T006 [P] [US1] Build compact category grid section in Overview — renders categories from `useCompetitionCategories` as compact cards with category name, subcategories list, and team count badge — in `src/pages/CompetitionDetailPage.tsx`.
- [x] T007 [US1] Wire "Register Team" button (opens `TeamRegistrationModal` with preselected category) and "View Teams" action (opens `CategoryTeamsModal`) on each category card in the Overview grid.
- [x] T008 [P] [US2] Build `TeamCard` component in `src/components/competitions/TeamCard.tsx` — renders team name, project name, category/subcategory, placement badge (trophy icon + rank), member count, "X of Y paid" with green/amber/gray coloring. Card is clickable → navigates to `/teams/:id`.
- [x] T009 [P] [US2] Build `TeamGroupBySelector` component in `src/components/competitions/TeamGroupBySelector.tsx` — pill-bar for primary group-by (matching `GroupBySelector` styling from Groups page) and dropdown for secondary subgroup-by. Reads from `TeamGroupByField` type. Subgroup options dynamically exclude the current primary grouping and `alphabetical`.
- [x] T010 [P] [US2] Build `TeamCategoryFilter` component in `src/components/competitions/TeamCategoryFilter.tsx` — dropdown or pill-row filter showing all available categories. "All Categories" option clears the filter.
- [x] T011 [US2] Build `TeamsTab` component in `src/components/competitions/TeamsTab.tsx` — integrates `TeamCategoryFilter`, `TeamGroupBySelector`, `groupTeams()` result, and `TeamCard` grid. Empty state when no teams. Loading spinner while data loads. "No teams match filter" state. Includes `localStorage` persistence for `groupBy` (key: `'tt:competitions:groupBy'`) and `subgroupBy` (key: `'tt:competitions:subgroupBy'`) — matching Groups page pattern.
- [x] T012 [US2] Wire `TeamsTab` into `CompetitionDetailPage.tsx` replacing the old inline teams content. Pass `teams` (as `TeamCardData[]`) and `categories` as props. Ensure modal interactions remain accessible from both tabs.

**Checkpoint**: US2 complete — Teams tab has rich cards, filter, and two-level grouping.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality, testing, and cleanup.

- [x] T013 [P] Write component tests for `TeamCard` in `src/tests/TeamCard.test.tsx` — cover rendering with placement, without placement, with payment data, click navigation, empty states.
- [x] T014 [P] Write tests for `CompetitionDetailPage` in `src/tests/CompetitionDetailPage.test.tsx` — cover tab switching, overview category grid rendering, teams tab rendering with mock data, empty states.
- [x] T015 Run `npm run lint` and fix all errors
- [x] T016 Run `npm run build` (`tsc -b && vite build`) and verify zero errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — can start immediately. BLOCKS all user stories.
- **US1 (Phase 3)**: Depends on Phase 2 (needs API + types ready).
- **US2 (Phase 4)**: Depends on Phase 2 (needs `groupTeams` utility + types).
- **Polish (Phase 5)**: Depends on both US1 and US2 being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. Can proceed independently of US2.
- **US2 (P1)**: Can start after Phase 2. Can proceed independently of US1.

Both stories are independent since they render in separate tabs and don't share state beyond the page-level modal flags.

### Within Each User Story

- Types/API before components
- Utility functions before component integration
- Component unit tests before page integration

### Parallel Opportunities

| Phase | Parallel Tasks |
|-------|---------------|
| Foundational | T001 and T002 can run in parallel |
| US1 | T005 and T006 can run in parallel |
| US2 | T008, T009, T010 can run in parallel |
| Polish | T013 and T014 can run in parallel |

---

## Parallel Example: User Story 2

```bash
# These 3 components have no interdependencies and can be built in parallel:
Task: "Build TeamCard in src/components/competitions/TeamCard.tsx"
Task: "Build TeamGroupBySelector in src/components/competitions/TeamGroupBySelector.tsx"
Task: "Build TeamCategoryFilter in src/components/competitions/TeamCategoryFilter.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (types, API, utility)
2. Complete Phase 3: US1 (Overview tab redesign)
3. **STOP and VALIDATE**: Test US1 independently
4. Deploy/demo if ready (Overview tab works, Teams tab still shows old data)

### Incremental Delivery

1. Foundational → Data layer ready
2. Add US1 → Overview tab redesigned → Deploy
3. Add US2 → Teams tab with rich cards + grouping → Deploy
4. Each step adds value without breaking previous steps

---

## Notes

- [P] tasks = different files, no dependencies
- [US1]/[US2] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify build passes at each checkpoint
- Commit after each task or logical group
- No new API endpoints — all data from existing endpoints
