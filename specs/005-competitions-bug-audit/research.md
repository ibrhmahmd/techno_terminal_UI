# Research: Competitions Bug Audit

**Date**: 2026-05-13  
**Source**: `docs/api/competitions/` (competitions.md, schemas.md, teams.md, errors.md), `src/api/competitions/` (types.ts, competitions.ts), `src/api/academics/types/groups/competitions.ts`, `implementation-map.md`

## Unknown Resolutions

### U1: Category response actual shape

**Decision**: The backend returns `CategoryResponse` (string names + subcategories), but frontend expects `CompetitionCategory` (entity objects).

**Evidence**: 
- Doc `schemas.md:165-171` defines `CategoryResponse` as `{ category: string, subcategories: string[] }`
- Doc `competitions.md:118-122` says "Returns distinct categories and subcategories for autocomplete" — confirming it's a lightweight schema
- Frontend `types.ts:24-33` defines `CompetitionCategory` with `id`, `name`, `description`, `min_age`, `max_age`, `max_team_size`, `registered_teams` — a completely different shape

**Impact**: Categories tab will show broken/empty data because frontend expects entity fields that don't exist in the response.

**Fix direction**: Either backend adds entity endpoint, or frontend adapts to string-based category display.

---

### U2: Team registration actual endpoint

**Decision**: The backend expects `POST /teams` with flat `RegisterTeamInput`, but frontend calls `POST /competitions/register-team` with nested `members[]` payload.

**Evidence**:
- Doc `teams.md:22-36` defines `POST /teams` with `RegisterTeamInput` body
- Doc `schemas.md:106-117` defines `RegisterTeamInput` with flat fields: `competition_id`, `team_name`, `category`, `subcategory`, `student_ids: list[int]`, `coach_id`, `group_id`, `fee`, `notes`
- Frontend `competitions.ts:79-82` calls `POST /competitions/register-team`
- Frontend `types.ts:99-104` defines `RegisterTeamInput` as `{ competition_id, category_id, team_name, members: [{ student_id, role }] }`

**Impact**: If backend validates against the documented schema, registration will fail with 400 (unknown fields) or 404 (wrong path).

**Fix direction**: Determine which path the backend actually accepts — update frontend or documentation accordingly.

---

### U3: List competitions actual params

**Decision**: Backend accepts documented `include_deleted` param, but frontend sends `status`/`skip`/`limit`/`search`.

**Evidence**:
- Doc `competitions.md:10-14` documents only `include_deleted` (bool) as query parameter
- Frontend `competitions.ts:9-14` passes `GetCompetitionsParams` with `status`, `skip`, `limit`, `search`
- Frontend `useCompetitions.ts:30-32` initializes with `{ skip: 0, limit: 20 }`

**Impact**: Pagination and filtering parameters are silently ignored by backend; frontend pagination UI shows only 1 page.

---

### U4: List competitions response format

**Decision**: Backend returns flat `list[CompetitionDTO]`, but frontend expects paginated `{ data[], total, skip, limit }` envelope.

**Evidence**:
- Doc `competitions.md:15` says `Response: list[CompetitionDTO]` — a flat array
- Frontend `competitions.ts:18-26` wraps response: `{ data: response.data.data || [], total: response.data.total || 0, skip: response.data.skip || 0, limit: response.data.limit || 50 }` — expects paginated wrapper
- Frontend `useCompetitions.ts:48-49` reads `data?.data` and `data?.total`

**Impact**: `total` and `skip` are `undefined`, defaulting to `0`; `totalPages` becomes `0`; pagination shows no pages.

---

### U5: TeamPublic actual field names

**Decision**: Backend returns `team_name` (as documented), but frontend expects `name`.

**Evidence**:
- Doc `group_competitions.md:34-40` defines `TeamPublic` with `team_name` field
- Frontend `src/api/academics/types/groups/competitions.ts:24-32` defines frontend `TeamPublic` with `name` field (not `team_name`)

**Impact**: Group teams list shows undefined/empty team names.

---

### U6: GroupCompetitionHistoryResponseDTO actual fields

**Decision**: Backend returns `participations[]` (as documented), but frontend expects `competitions[]`.

**Evidence**:
- Doc `group_competitions.md:99-119` defines `GroupCompetitionHistoryResponseDTO` with `participations: [...]`, `total_participations`, `active_participations`, `completed_participations`
- Frontend `competitions.ts:59-66` defines frontend version with `competitions: CompetitionParticipationDTO[]`, `total_competitions`, `wins`, `runner_ups` — completely different field names

**Impact**: Analytics data won't render — frontend reads `competitions[]` but backend sends `participations[]`.

---

### U7: Existence of 3 undocumented endpoints

**Decision**: These endpoints may or may not exist on the backend. They are consumed by the frontend but not documented.

**Evidence**:
- `GET /competitions/{competitionId}/categories/{categoryId}/teams` — frontend `competitions.ts:84-87` calls this
- `POST /competitions/register-team` — frontend `competitions.ts:79-82` calls this
- `POST /competitions/team-members/{teamMemberId}/mark-paid` — frontend `competitions.ts:89-91` calls this
- `GET /competitions/{competitionId}/stats` — frontend `competitions.ts:93-108` calls this
- None of these appear in `competitions.md` or `teams.md`

**Impact**: If backend doesn't implement these, features silently fail. If they exist, documentation is incomplete.

---

## Summary of All Findings

| # | Endpoint | Doc Says | Frontend Expects | Status |
|---|----------|----------|-----------------|--------|
| 1 | `GET /competitions` | `list[CompetitionDTO]`, param `include_deleted` | `PaginatedResponse`, params `status`/`skip`/`limit`/`search` | ❌ Mismatch |
| 2 | `POST /teams` vs `/competitions/register-team` | `POST /teams`, flat `RegisterTeamInput` | `POST /competitions/register-team`, nested `members[]` | ❌ Mismatch |
| 3 | `GET /competitions/{id}/categories` | `CategoryResponse` (strings) | `CompetitionCategory[]` (entities) | ❌ Mismatch |
| 4 | `GET /competitions/{id}/stats` | Not documented | `{ total_teams, total_participants, total_revenue, ... }` | ❌ Undocumented |
| 5 | `GET .../categories/{catId}/teams` | Not documented | `TeamRegistration[]` | ❌ Undocumented |
| 6 | `POST .../team-members/{id}/mark-paid` | Not documented | `void` | ❌ Undocumented |
| 7 | Team field name | `team_name` | `name` | ❌ Mismatch |
| 8 | History DTO field | `participations[]`, `total_participations` | `competitions[]`, `total_competitions` | ❌ Mismatch |
| 9 | List response format | Flat `list[CompetitionDTO]` | `{ data[], total, skip, limit }` | ❌ Mismatch |
| 10 | Student competitions | `GET /students/{id}/competitions` | `GET /crm/students/{id}/competitions` (stub) | ❌ Stub |
