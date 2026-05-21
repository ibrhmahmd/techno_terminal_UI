# API Contracts: Competitions & Team Management

## Teams API

### `PATCH /teams/{id}` — Update Team

**Purpose**: Edit existing team fields. Already exists in API layer (`src/api/teams/teams.ts:updateTeam`). No new endpoint needed.

**Request body** (`UpdateTeamInput`):
```typescript
{
  team_name?: string
  category?: string
  subcategory?: string
  project_name?: string
  project_description?: string
  group_id?: number
  coach_id?: number   // UI calls this "instructor"
  notes?: string
}
```

**Response**: `ApiResponse<TeamDTO>`

**Error handling**: Standard HTTP errors (400 validation, 404 not found, 409 conflict). No concurrent-edit detection.

### `POST /teams` — Register Team (unchanged)

**Purpose**: Register new team. Already functional via `TeamRegistrationModal`. The `coach_id` field exists but is not exposed in the UI.

**Request body** (`RegisterTeamInput`):
```typescript
{
  competition_id: number
  team_name: string
  category: string
  subcategory?: string
  project_name?: string
  project_description?: string
  student_ids: number[]
  student_fees?: Record<string, number>
  coach_id?: number   // NEW: to be exposed via InstructorCombobox
  group_id?: number
  notes?: string
}
```

**Fix needed**: When `group_id` is provided, `student_ids` should not be sent (omit from payload).

## HR API (Instructor Search)

### `GET /hr/employees` — Search Employees

**Purpose**: Find instructors for the instructor combobox. Already exists and used by `EditSessionPopup`.

**Parameters**: `q` (search query), `page`, `page_size`, `employment_type`

**Response**: `ApiResponse<EmployeeListItem[]> & { total, skip, limit }`

**Key fields**: `id`, `full_name`

**Caching**: `useEmployees` hook has 5 min staleTime via `staffKeys.list(...)`.

## CRM API (Parent Search)

### Existing `searchParents` function

**Location**: `src/api/crm/parents/search.ts`

**Purpose**: Search parents for the payment parent selector.

**Note**: Verify the function signature and return type before integration.

## Teams List API

### `GET /teams?competition_id=X&include_members=true`

**Purpose**: Fetch teams with member data (fee status). Currently unused (`useTeamsWithMembers` hook is dead code). For the team list enhancement (placement + fee status), we can either:
- A: Reactivate `useTeamsWithMembers` to get `TeamWithMembersDTO[]` (includes `members[]` with `amount_paid`, `amount_due`, `student_name`)
- B: Use existing `useTeams` for list + `useCompetitionSummary` for category breakdown (already done)

**Recommendation**: Use existing `useTeams` + `useCompetitionSummary` for the team list display. The summary already contains team data with member info via `CategoryWithTeamsDTO.teams[].members[]`.
