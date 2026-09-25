# Component Contracts: Competition Detail Redesign

## CompetitionDetailPage

**State**: Maintains tab state, modal state, category selection, and delegates to child components.

```typescript
// Tab state
activeTab: 'overview' | 'teams'
setActiveTab: (tab: 'overview' | 'teams') => void

// Modal state (unchanged from current)
isRegistrationModalOpen: boolean
selectedCategory: string | null
isCategoryTeamsModalOpen: boolean
selectedCategoryTeams: CategoryWithTeamsDTO | null
isDeleteModalOpen: boolean
deleteError: string | null
```

## TeamCard

```typescript
interface TeamCardProps {
  team: TeamCardData
  onClick?: () => void           // navigates to /teams/:id
}
```

Renders: icon, team_name, category/subcategory, project_name, placement badge, member count, "X of Y paid" status.

## TeamGroupBySelector

```typescript
interface TeamGroupBySelectorProps {
  groupBy: TeamGroupByField | null
  onGroupByChange: (field: TeamGroupByField | null) => void
  subgroupBy: TeamGroupByField | null
  onSubgroupByChange: (field: TeamGroupByField | null) => void
}
```

Renders: Pill-bar for primary group-by (matching `GroupBySelector` styling), dropdown for subgroup-by.

## TeamCategoryFilter

```typescript
interface TeamCategoryFilterProps {
  categories: string[]           // available category names
  value: string | null           // null = "All Categories"
  onChange: (category: string | null) => void
}
```

Renders: Dropdown or pill-row of selectable categories.

## groupTeams Utility

```typescript
function groupTeams(
  teams: TeamCardData[],
  groupBy: TeamGroupByField | null,
  subgroupBy: TeamGroupByField | null
): TeamGroup[]
```

**Grouping behavior by field**:

| Field | Group Key | Group Label | Sort Within Group |
|-------|-----------|-------------|-------------------|
| `null` (flat) | `'_all'` | `'All Teams'` | Alphabetical by team_name |
| `'instructor'` | `coach_id ?? 'unassigned'` | Instructor name or `'Unassigned'` | Alphabetical by team_name |
| `'category'` | `category` | Category name | Alphabetical by team_name |
| `'subcategory'` | `subcategory ?? '_none'` | Subcategory name or `'No Subcategory'` | Alphabetical by team_name |
| `'payment_status'` | `'all_paid' \| 'partial' \| 'none'` | `'All Paid' \| 'Partial Paid' \| 'None Paid'` | Alphabetical by team_name |
| `'placement'` | `placement_rank ? 'ranked' : 'unranked'` | `'Ranked' \| 'Unranked'` | Ranked: by rank asc, Unranked: alphabetical |
| `'alphabetical'` | First letter of team_name (uppercased) | Letter group (e.g., `'A'`, `'B'`) | Alphabetical by team_name |

**Subgrouping**: When `subgroupBy` is set, each primary group is further subdivided using the same logic applied within that group. The renderer shows two levels of nesting (primary group header → subgroup header → team cards).
