# Research: Competitions Bug Audit

**Date**: 2026-05-13  
**Source**: `docs/api/competitions/` (competitions.md, schemas.md, teams.md, errors.md), `src/api/competitions/` (types.ts, competitions.ts), `src/api/academics/types/groups/competitions.ts`, `implementation-map.md`

## Unknown Resolutions

### U1: Category response actual shape

**Decision**: The backend returns `CategoryResponse` (string names + subcategories). Frontend was _previously_ expecting `CompetitionCategory` (entity objects).

**Evidence**: 
- Doc `schemas.md:165-171` defines `CategoryResponse` as `{ category: string, subcategories: string[] }`
- Doc `competitions.md:118-122` says "Returns distinct categories and subcategories for autocomplete" — confirming it's a lightweight schema
- Frontend `types.ts:39-42` now defines `CategoryResponse` matching the doc schema exactly
- Legacy `CompetitionCategory` type removed during dead code elimination

**Resolution**: ✅ Frontend aligned to doc. `CategoryList` renders from `CategoryResponse` (string-based). Verify against live backend in Phase 1.

---

### U2: Team registration actual endpoint

**Decision**: The backend expects `POST /teams` with flat `RegisterTeamInput`. Frontend was _previously_ calling `POST /competitions/register-team` with nested `members[]`.

**Evidence**:
- Doc `teams.md:22-36` defines `POST /teams` with `RegisterTeamInput` body
- Doc `schemas.md:106-117` defines `RegisterTeamInput` with flat fields: `competition_id`, `team_name`, `category`, `subcategory`, `student_ids: list[int]`
- Frontend now uses `RegisterTeamInput` from `src/api/teams` with flat `student_ids` and calls `registerTeam()` → `POST /teams`
- `TeamRegistrationModal` sends `{ competition_id, team_name, category, student_ids }`

**Resolution**: ✅ Frontend aligned to doc. Team registration uses `POST /teams` with flat payload. Verify against live backend in Phase 1.

---

### U3: List competitions actual params

**Decision**: Backend accepts documented `include_deleted` param. Frontend was _previously_ sending `status`/`skip`/`limit`/`search`.

**Evidence**:
- Doc `competitions.md:10-14` documents only `include_deleted` (bool) as query parameter
- Frontend `competitions.ts:8-14` now only passes `{ include_deleted }` — extra params removed
- Frontend `getCompetitions()` no longer builds a params object with `status`/`skip`/`limit`/`search`

**Resolution**: ✅ Frontend aligned to doc. `getCompetitions(includeDeleted?)` sends only documented params. Verify against live backend in Phase 1.

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

**Decision**: Backend returns `team_name` (as documented). Frontend uses `team_name` matching the doc.

**Evidence**:
- Doc `group_competitions.md:34-40` defines `TeamPublic` with `team_name` field
- Frontend `src/api/academics/types/groups/competitions.ts:16-23` defines `TeamPublic` with `team_name` (aligned)

**Resolution**: ✅ Frontend aligned to doc. Verify against live backend in Phase 1.

---

### U6: GroupCompetitionHistoryResponseDTO actual fields

**Decision**: Backend returns `participations[]` (as documented). Frontend uses `participations[]`.

**Evidence**:
- Doc `group_competitions.md:99-119` defines `GroupCompetitionHistoryResponseDTO` with `participations: [...]`, `total_participations`, `active_participations`, `completed_participations`
- Frontend `src/api/academics/types/groups/competitions.ts:25-32` defines `GroupCompetitionHistoryResponseDTO` with matching fields: `participations`, `total_participations`, `active_participations`, `completed_participations`

**Resolution**: ✅ Frontend aligned to doc. Legacy fields (`competitions[]`, `wins`, `runner_ups`) removed during dead code elimination. Verify against live backend in Phase 1.

---

### U7: Undocumented endpoints (removed from frontend)

**Decision**: These undocumented endpoints were consumed by the frontend but have been removed during dead code elimination. The frontend now only uses documented endpoints.

**Status**: ✅ Resolved. The following were removed:
- `GET /competitions/{competitionId}/categories/{categoryId}/teams` — removed (no documented equivalent)
- `POST /competitions/register-team` — removed (frontend uses `POST /teams` per docs)
- `POST /competitions/team-members/{teamMemberId}/mark-paid` — removed (no documented equivalent)
- `GET /competitions/{competitionId}/stats` — removed (zero usage)

**Impact**: None — these function calls were dead code.

---

## Summary of All Findings

| # | Endpoint | Doc Says | Frontend Now | Status |
|---|----------|----------|--------------|--------|
| 1 | `GET /competitions` | `list[CompetitionDTO]`, param `include_deleted` | Flat `Competition[]`, param `include_deleted` | ✅ Resolved in code |
| 2 | Team registration | `POST /teams`, flat `RegisterTeamInput` | `POST /teams`, flat `RegisterTeamInput` | ✅ Resolved in code |
| 3 | `GET /competitions/{id}/categories` | `CategoryResponse` (strings) | `CategoryResponse` (strings) | ✅ Resolved in code |
| 4 | `GET /competitions/{id}/stats` | Not documented | Removed (dead code) | ✅ Resolved |
| 5 | `GET .../categories/{catId}/teams` | Not documented | Removed (dead code) | ✅ Resolved |
| 6 | `POST .../team-members/{id}/mark-paid` | Not documented | Removed (dead code) | ✅ Resolved |
| 7 | Team field name | `team_name` | `team_name` | ✅ Resolved in code |
| 8 | History DTO field | `participations[]`, `total_participations` | `participations[]`, `total_participations` | ✅ Resolved in code |
| 9 | List response format | Flat `list[CompetitionDTO]` | Flat `Competition[]` | ✅ Resolved in code |
| 10 | Student competitions | `GET /students/{id}/competitions` | `GET /crm/students/{id}/competitions` (stub) | ❌ Stub — backend not implemented |

**Note**: Rows 1-9 are resolved in the frontend code. They must still be **verified against the live backend** in Phase 1 (tasks T002-T006).
