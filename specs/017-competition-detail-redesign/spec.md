# Feature Specification: Competition Detail Redesign

**Feature Branch**: `017-competition-detail-redesign`
**Created**: 2026-05-20
**Status**: Draft
**Input**: User description: "redesign competition details page UI/UX — merge categories tab and summary tab into overview tab, show teams in cards on teams tab with grouping/filtering"

## User Scenarios & Testing

### User Story 1 — Overview Tab Shows Competition Info, Stats, and Categories (Priority: P1)

As a user viewing a competition, I want to see the competition details, high-level stats, and all its categories on one page so I don't have to switch between tabs to understand the competition structure.

**Why this priority**: This is the first thing users see. Merging categories, summary stats, and competition info into a single overview eliminates tab switches and gives immediate context.

**Independent Test**: Navigate to any competition and confirm that competition info, total teams/participants stats, and categories (as compact grid cards with team count badges) appear on the same view — no separate Categories or Summary tabs needed.

**Acceptance Scenarios**:

1. **Given** a competition with 3 categories and 10 registered teams, **When** I navigate to the competition detail page, **Then** the Overview tab shows: competition info card, stats row (total teams, total participants), and a compact grid of 3 category cards each showing the category name, subcategories, and team count.
2. **Given** a competition with 0 categories, **When** I view the Overview tab, **Then** it shows a meaningful empty state indicating no categories exist yet.
3. **Given** any competition, **When** I view the Overview tab, **Then** there is no separate "Categories" or "Summary" tab in the tab bar.

---

### User Story 2 — Teams Tab Shows All Teams as Rich Cards with Filtering and Grouping (Priority: P1)

As a user, I want to see all registered teams as rich cards with the ability to filter by category and group by different attributes (instructor, category, subcategory, payment status, placement, project).

**Why this priority**: The teams tab is currently where users go to see team data. Adding rich cards, filtering, and grouping makes it a powerful browse-and-compare view.

**Independent Test**: Register several teams across different categories with different instructors. Navigate to the Teams tab, filter by a specific category, and confirm only matching teams appear. Change the group-by selector and confirm teams re-group under the chosen attribute.

**Acceptance Scenarios**:

1. **Given** a competition with 5 teams across 2 categories, **When** I view the Teams tab, **Then** all 5 teams are displayed as rich cards.
2. **Given** a team with a placement rank, **When** it appears on the Teams tab, **Then** the card shows the placement badge (rank number + trophy icon).
3. **Given** a team with 4 members where 2 have paid, **When** it appears on the Teams tab, **Then** the card shows "2 of 4 paid" with appropriate coloring.
4. **Given** a team card, **When** I click/tap it, **Then** I navigate to that team's detail page.
5. **Given** a Teams tab with a category filter (selector similar to the group day selector or group category selector on the Groups page), **When** I select a specific category, **Then** only teams in that category are shown.
6. **Given** a group-by selector on the Teams tab with options (Instructor, Category, Subcategory, Payment Status, Placement, Alphabetical), **When** I select an option, **Then** teams are visually grouped under headers for each value of the selected attribute.
7. **Given** a competition with no teams, **When** I view the Teams tab, **Then** it shows a helpful empty state with a call-to-action to register the first team.

---

### Edge Cases

- What happens when a competition has no categories defined? The Overview shows an empty categories section with guidance to add categories.
- What happens when teams tab data is still loading? Show a loading skeleton/spinner.
- What happens when a team has no project name? Card shows team name only without project line.
- What happens when a category is deleted while teams reference it? Handle gracefully — team still shows its category text even if the category definition is gone.
- What happens when no instructor is assigned to a team? Grouping by Instructor places those teams under "Unassigned".
- What happens when the filter returns zero teams? Show a "No teams match this filter" message.

## Requirements

### Functional Requirements

- **FR-001**: The Overview tab MUST display competition header info (name, date, location, fee, notes, edition) AND a stats row (total teams, total participants) AND a categories section on the same page.
- **FR-002**: The categories section in the Overview MUST use a compact grid of cards, each showing the category name, subcategories list, and a badge with registered team count.
- **FR-003**: Each category card in the Overview MUST provide BOTH a "Register Team" button AND a "View Teams" action (shows teams in that category via a modal).
- **FR-004**: The Teams tab MUST display all teams as visually distinct cards with: team name, project name (if available), category/subcategory, placement badge (if ranked), member count, and fee payment status ("X of Y paid").
- **FR-005**: Teams tab cards MUST be clickable and navigate to the team detail page.
- **FR-006**: The "Categories" tab MUST be removed from the tab bar. Its functionality is absorbed into the Overview.
- **FR-007**: The "Summary" tab MUST be removed from the tab bar. Its useful data (total teams, total participants) is displayed as stats cards in the Overview.
- **FR-008**: The Teams tab MUST include a category filter selector (styled consistently with the group day/group category selectors on the Groups page) that filters displayed teams by selected category.
- **FR-009**: The Teams tab MUST include a primary group-by selector (styled consistently with the GroupBySelector on the Groups page) and a secondary subgroup-by selector. Available primary group-by options:
  - **Instructor** — teams grouped under each instructor's name (unassigned teams under "Unassigned")
  - **Category** — teams grouped under category headers
  - **Subcategory** — teams grouped under subcategory headers
  - **Payment Status** — groups: All Paid, Partial Paid, None Paid
  - **Placement** — groups: Ranked (ordered by rank), Unranked
  - **Alphabetical** — A–Z by team name
- **FR-009a**: The subgroup-by selector MUST dynamically offer options relevant to the selected primary grouping (e.g., when grouping by Instructor, subgroup-by options could include Category or Payment Status; when grouping by Category, subgroup-by could include Subcategory, Instructor, or Payment Status).
- **FR-009b**: The grouping state (selected primary group and subgroup) MUST persist via localStorage so the user's preference is remembered across sessions.
- **FR-010**: Empty states MUST be informative — showing relevant icons, a brief message, and a primary action button where applicable.
- **FR-011**: Backend changes are out of scope — all data comes from existing API endpoints (`GET /competitions/:id`, `GET /competitions/:id/categories`, `GET /competitions/:id/summary`, `GET /teams?competition_id=:id`).
- **FR-012**: Existing modal components (`TeamRegistrationModal`, `CategoryTeamsModal`) are reused as-is without visual or functional redesign — only their invocation context changes.

### Key Entities

- **Competition**: The main entity being viewed. Has name, date, location, fee, notes, edition, edition_year.
- **Category**: Belongs to a competition. Has name and subcategories. Shows team count badge.
- **Team**: Belongs to a competition and category. Has team_name, project_name, coach_id (instructor), placement_rank, placement_label, members array with payment info.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can see competition info, stats, and categories in one view without switching tabs — elimination of both the "Categories" and "Summary" tabs.
- **SC-002**: Users can browse all teams from a competition directly on the Teams tab without needing to go through category-level drill-down.
- **SC-003**: Team cards show at least: team name, category, placement (if ranked), member count, and fee payment status.
- **SC-004**: Users can filter teams by category and re-group teams by instructor, category, subcategory, payment status, placement, or alphabetical order.
- **SC-005**: All existing functionality (register team from category, delete competition, edit competition) remains accessible from the redesigned page.

## Clarifications

### Session 2026-05-20

- Q: What actions should each category card have in the Overview? → A: Both "Register Team" and "View Teams" buttons on each card.
- Q: How should the Teams tab grouping work? → A: Follow the Groups page pattern — a primary group-by selector (segmented bar) and a secondary subgroup-by selector, with state persisted in localStorage.
- Q: What is explicitly out of scope? → A: Backend changes (no new APIs) and existing modal component redesigns (TeamRegistrationModal, CategoryTeamsModal stay unchanged).

## Assumptions

- Users access the competition detail page after selecting a competition from the competitions list.
- The existing API endpoints (`GET /competitions/:id`, `GET /competitions/:id/categories`, `GET /competitions/:id/summary`, `GET /teams?competition_id=:id`) will be reused without backend changes.
- The existing `TeamRegistrationModal` and `CategoryTeamsModal` components are reused as-is — only their invocation context changes.
- Mobile responsiveness follows existing patterns already in place.
- The edit and delete buttons in the page header remain unchanged.
- Instructor names for grouping are resolved from the existing `/employees` endpoint.
