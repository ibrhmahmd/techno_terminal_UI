# Data Model: Competition Detail Redesign

## Client-Side Data Shapes

### TeamCardData (derived from API response)

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `id` | `number` | `team.id` | |
| `team_name` | `string` | `team.team_name` | |
| `category` | `string` | `team.category` | |
| `subcategory` | `string \| null` | `team.subcategory` | |
| `project_name` | `string \| null` | `team.project_name` | |
| `coach_id` | `number \| null` | `team.coach_id` | Resolved to instructor name via `/employees` |
| `placement_rank` | `number \| null` | `team.placement_rank` | |
| `placement_label` | `string \| null` | `team.placement_label` | |
| `members` | `TeamMemberDTO[]` | from `TeamWithMembersDTO.members` | Full members array for drill-down |
| `memberCount` | `number` | Computed: `members.length` | |
| `paidCount` | `number` | Computed: `members.filter(m => m.amount_paid > 0).length` | |

### TeamGroup (rendering shape, matches GroupGroup pattern)

| Field | Type | Notes |
|-------|------|-------|
| `key` | `string` | Unique group identifier (e.g., instructor ID, category name, payment status slug) |
| `label` | `string` | Human-readable group header label |
| `count` | `number` | Number of teams in this group |
| `teams` | `TeamCardData[]` | Teams belonging to this group |

### TeamGroupByField

```typescript
type TeamGroupByField = 'instructor' | 'category' | 'subcategory' | 'payment_status' | 'placement' | 'alphabetical'
```

### TeamSubgroupByField (dynamic, depends on primary group)

| Primary Group | Available Subgroup Options |
|--------------|---------------------------|
| `category` | `instructor`, `subcategory`, `payment_status`, `placement` |
| `instructor` | `category`, `subcategory`, `payment_status`, `placement` |
| `subcategory` | `instructor`, `category`, `payment_status`, `placement` |
| `payment_status` | `instructor`, `category`, `subcategory`, `placement` |
| `placement` | `instructor`, `category`, `subcategory`, `payment_status` |
| `alphabetical` | `instructor`, `category`, `subcategory`, `payment_status`, `placement` |

The primary group-by is always excluded from subgroup options. `alphabetical` is excluded from subgroup (it's a sort, not a logical group).

## UI State Model

| State | Type | Storage | Notes |
|-------|------|---------|-------|
| `activeTab` | `'overview' \| 'teams'` | `useState` | Default: `'overview'` |
| `groupBy` | `TeamGroupByField \| null` | `localStorage` | `null` = flat list (All). Key: `'tt:competitions:groupBy'` |
| `subgroupBy` | `TeamGroupByField \| null` | `localStorage` | `null` = no subgroup. Key: `'tt:competitions:subgroupBy'` |
| `categoryFilter` | `string \| null` | `useState` | `null` = All categories |
| `selectedCategory` | `string \| null` | `useState` | For registration modal pre-selection |
| `isRegistrationModalOpen` | `boolean` | `useState` | |
| `isCategoryTeamsModalOpen` | `boolean` | `useState` | |
| `selectedCategoryTeams` | `CategoryWithTeamsDTO \| null` | `useState` | |
| `isDeleteModalOpen` | `boolean` | `useState` | |
| `deleteError` | `string \| null` | `useState` | |

## Data Flow

```
CompetitionDetailPage
├── useCompetition(id)          → competition, isLoading, error
├── useCompetitionCategories(id) → categories[], isLoading
├── useCompetitionSummary(id)   → summary (total_teams, total_participants)
└── useTeams(id, filters)       → teams: TeamCardData[]
    └── client-side groupTeams(teams, groupBy, subgroupBy)
        → TeamGroup[] 
        → rendered as GroupCategoryTabs + TeamCardGrid
```

## Existing API Contracts (unchanged)

### `GET /teams?competition_id=:id&include_members=true`

**Response**: `ApiResponse<TeamWithMembersDTO[]>`

```typescript
interface TeamWithMembersDTO {
  team: TeamDTO
  members: TeamMemberDTO[]
}

interface TeamDTO {
  id: number
  competition_id: number
  team_name: string
  category: string
  subcategory: string | null
  group_id: number | null
  coach_id: number | null
  project_name: string | null
  project_description: string | null
  placement_rank: number | null
  placement_label: string | null
  notes: string | null
  created_at: string | null
}

interface TeamMemberDTO {
  id: number
  student_id: number
  amount_paid: number
  student_name?: string  // may be included depending on backend
}
```
