# Research: Competition Detail Redesign

## Decisions

### Decision 1: Team Payment Data Access

- **Decision**: Change `getTeams()` to use `include_members=true` to fetch member payment data alongside team info.
- **Rationale**: Team cards need to show "X of Y paid" fee status. The flat `TeamDTO[]` (from `include_members=false`) has no member/payment data. Using `include_members=true` returns `TeamWithMembersDTO[]` where each item is `{ team: TeamDTO, members: TeamMemberDTO[] }` — the members array includes `amount_paid` for each student.
- **Alternatives considered**:
  - Fetch teams flat + summary separately for payment data (double query, stale sync issues)
  - Add member count to `TeamDTO` (requires backend change — out of scope)
- **Normalization**: Transform `TeamWithMembersDTO[]` → enriched `TeamCardData[]` where each card item has `{ ...team, members, paidCount, memberCount }` for rendering.

### Decision 2: Client-Side Grouping

- **Decision**: All grouping and subgrouping is performed client-side on the fetched teams array.
- **Rationale**: No `/teams/grouped` endpoint exists (unlike `GET /academics/groups/grouped`). The teams list is relatively small (typically <100 per competition), so client-side grouping is efficient and avoids a backend change.
- **Alternatives considered**: Request a new backend grouped endpoint (out of scope — `FR-011`).
- **Implementation**: A pure function `groupTeams(teams, groupBy, subgroupBy)` that returns `GroupGroup[]` — matching the shape expected by rendering components like `GroupCategoryTabs`.

### Decision 3: TeamGroupByField Type

- **Decision**: Create a `TeamGroupByField` type with values: `'instructor' | 'category' | 'subcategory' | 'payment_status' | 'placement' | 'alphabetical'`.
- **Rationale**: Mirrors the existing `GroupByField` type pattern (`src/api/academics/types/groups/grouping.ts`) for consistency.
- **Alternatives considered**: Reuse `GroupByField` directly (not applicable — different domain).

### Decision 4: Subgroup-by Dynamic Options

- **Decision**: The secondary subgroup-by dropdown dynamically shows options relevant to the selected primary group-by.
- **Rationale**: Not all subgroup combinations make sense. E.g., grouping by "Payment Status" and then sub-grouping by "Payment Status" is redundant. The options are computed based on available fields minus the current primary group.
- **Subgroup exclusions**: The current primary group-by is always excluded from subgroup options. Additionally, "Alphabetical" is excluded from subgroup since it's a sort, not a logical grouping.

### Decision 5: UI Component Pattern

- **Decision**: Teams tab follows the Groups page pattern: `GroupBySelector`-style pill bar for primary group-by, a secondary dropdown for subgroup-by, and `GroupCategoryTabs`-style headers for each group section.
- **Rationale**: Users familiar with the Groups page will immediately understand the pattern. Components already exist in the codebase for reference.
- **Alternative considered**: A single dropdown with combined group+subgroup selection (harder to discover and use).

### Decision 6: Category Filter

- **Decision**: A dropdown/pill-row category filter that narrows the displayed teams before grouping.
- **Rationale**: Mirrors the "day selector" / group category selector from the Groups page behavior. Teams can be filtered to a single category before the group-by is applied.
- **Defaults**: Initially shows "All Categories" — all teams visible.

### Decision 7: Overview Category Grid

- **Decision**: Categories rendered as a compact grid of cards (2-4 columns depending on viewport), each showing category name, subcategories list, team count badge, "Register Team" button, and "View Teams" button.
- **Rationale**: The user explicitly chose option C (compact grid of cards). Pattern matches the `GroupCardGrid` layout from the Groups page.
- **Empty state**: When no categories exist, show an informative empty state with guidance.

### Decision 8: Summary Tab Removal

- **Decision**: The Summary tab is removed. Its useful data (total teams, total participants) is displayed as stats cards in the Overview tab.
- **Rationale**: The user identified the summary as duplicative — its per-category team lists are already accessible via category card "View Teams" actions and the Teams tab.
- **Impact**: The `useCompetitionSummary` hook is still used to populate the Overview stats cards.

## Technical Reference

### Endpoints (all existing, unchanged)

| Endpoint | Used For | Response Shape |
|----------|----------|----------------|
| `GET /competitions/:id` | Competition header info | `CompetitionDTO` |
| `GET /competitions/:id/categories` | Category list for overview grid | `CategoryDTO[]` |
| `GET /competitions/:id/summary` | Stats (total teams/participants) for overview | `CompetitionSummaryDTO` |
| `GET /teams?competition_id=:id&include_members=true` | Teams with member/payment data for teams tab | `TeamWithMembersDTO[]` |

### Data Shapes for Team Cards

```typescript
// Transformed from TeamWithMembersDTO for rendering
interface TeamCardData {
  id: number
  team_name: string
  category: string
  subcategory: string | null
  project_name: string | null
  coach_id: number | null
  placement_rank: number | null
  placement_label: string | null
  members: TeamMemberDTO[]
  memberCount: number
  paidCount: number       // members.filter(m => m.amount_paid > 0).length
}

// Grouping shape (matching GroupGroup pattern)
interface TeamGroup {
  key: string
  label: string
  count: number
  teams: TeamCardData[]
}
```

### Member Payment Data

`TeamMemberDTO` includes `amount_paid: number`. A member is considered "paid" when `amount_paid > 0`. Payment status groups:
- **All Paid**: `memberCount > 0 && paidCount === memberCount`
- **Partial Paid**: `paidCount > 0 && paidCount < memberCount`
- **None Paid**: `paidCount === 0`
