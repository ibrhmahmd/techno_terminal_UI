# Verified API Contracts: Competitions Domain

**Date**: 2026-05-13  
**Purpose**: Source-of-truth API contracts for competitions after resolving doc/frontend mismatches.

---

## 1. Core Competitions — `/api/v1/competitions/*`

### 1.1 List Competitions
```
GET /competitions
```
**Params**: `include_deleted` (bool, optional)  
**Response**: `list[CompetitionDTO]` (flat array)
```
⚠️ Frontend currently sends: { status?, skip?, limit?, search? }
⚠️ Frontend currently expects: { data[], total, skip, limit }
★ Must align either frontend params/response handling or backend to match.
```

### 1.2 Get Competition
```
GET /competitions/{id}
```
**Response**: `CompetitionDTO` (wrapped in `ApiResponse`)
```
✅ Frontend GET /competitions/{id} → response.data.data
```

### 1.3 Create Competition
```
POST /competitions
```
**Body**: `CreateCompetitionInput` — `{ name (req), edition?, competition_date?, location?, notes?, fee_per_student? }`  
**Response**: `CompetitionDTO`
```
⚠️ Frontend sends extra legacy fields (description, start_date, end_date, etc.)
★ Backward compatible — backend ignores unknown fields.
```

### 1.4 Update Competition
```
PATCH /competitions/{id}
```
**Body**: `UpdateCompetitionInput` — all fields optional  
**Response**: `CompetitionDTO`
```
✅ Frontend uses PATCH (documented as "Same as PUT")
```

### 1.5 Delete Competition
```
DELETE /competitions/{id}
```
**Errors**: 409 if teams are registered  
**Response**: `bool`
```
⚠️ Frontend returns void (response not consumed)
```

### 1.6 Restore Competition
```
POST /competitions/{id}/restore
```
**Response**: `bool`
```
✅ Frontend POST /competitions/{id}/restore → response.data.data
```

### 1.7 List Deleted Competitions
```
GET /competitions/deleted
```
**Response**: `list[CompetitionDTO]`
```
✅ Frontend GET /competitions/deleted → response.data.data || []
```

### 1.8 Get Competition Summary
```
GET /competitions/{id}/summary
```
**Response**: `CompetitionSummaryResponse`
```
✅ Frontend GET /competitions/{id}/summary → response.data.data
```

### 1.9 List Categories
```
GET /competitions/{id}/categories
```
**Response**: `list[CategoryResponse]` — `{ category: string, subcategories: string[] }`
```
❌ Frontend expects CompetitionCategory[] (entity objects)
★ CRITICAL MISMATCH — must align.
```

---

## 2. Teams — `/api/v1/teams/*`

**Status**: All endpoints documented in `docs/api/competitions/teams.md` are NOT consumed by the frontend. The frontend uses:
- `POST /competitions/register-team` instead of `POST /teams`
- `GET /competitions/{id}/categories/{catId}/teams` instead of `GET /teams`
- `POST /competitions/team-members/{id}/mark-paid` instead of `POST /teams/{id}/members/{sid}/pay`

**Action needed**: Determine which routing the backend actually supports.

---

## 3. Group Competitions — `/api/v1/academics/groups/*`

### 3.1 List Participations
```
GET /academics/groups/{group_id}/competitions
```
**Params**: `is_active` (bool, optional)  
**Response**: `ApiResponse<list<GroupCompetitionParticipationDTO>>`
```
❌ Frontend expects CompetitionParticipationDTO[] (different schema)
```

### 3.2 List Teams
```
GET /academics/groups/{group_id}/teams
```
**Params**: `include_inactive` (bool, optional), `skip`, `limit`  
**Response**: `PaginatedResponse<TeamPublic>`
```
❌ Frontend expects TeamPublic with name field (doc has team_name)
⚠️ Frontend ignores pagination wrapper
```

### 3.3 Link Team
```
POST /academics/groups/{group_id}/teams/{team_id}/link
```
**Response**: `ApiResponse<LinkTeamResponse>`
```
✅ Frontend matches
```

### 3.4 Register for Competition
```
POST /academics/groups/{group_id}/competitions/{competition_id}/register
```
**Params**: `team_id` (req), `category_id` (opt)  
**Response**: `ApiResponse<CompetitionRegistrationResponse>`
```
✅ Frontend matches
```

### 3.5 Complete Participation
```
PATCH /academics/groups/{group_id}/competitions/{participation_id}/complete
```
**Params**: `final_placement` (opt)  
**Response**: `ApiResponse<CompleteParticipationResponse>`
```
✅ Frontend matches
```

### 3.6 Withdraw
```
DELETE /academics/groups/{group_id}/competitions/{participation_id}
```
**Params**: `reason` (opt)  
**Response**: `ApiResponse<WithdrawParticipationResponse>`
```
✅ Frontend matches
```

### 3.7 Analytics
```
GET /academics/groups/{group_id}/competitions/analytics
```
**Response**: `ApiResponse<GroupCompetitionHistoryResponseDTO>`
```
❌ Frontend expects different field names (competitions[] vs participations[], etc.)
```

---

## 4. Finance — `/api/v1/finance/competition-fees`

### Get Unpaid Fees
```
GET /finance/competition-fees?student_id={student_id}
```
**Response**: `ApiResponse<list[UnpaidCompFeeItem]>`
```
✅ Fully aligned
```

---

## 5. Analytics — `/api/v1/analytics/competitions/fee-summary`

### Get Fee Summary
```
GET /analytics/competitions/fee-summary
```
**Response**: `ApiResponse<list[CompetitionFeeSummaryDTO]>`
```
✅ Fully aligned
```

---

## 6. Student Competitions

**Doc path**: `GET /students/{id}/competitions` (under `/teams` base)  
**Frontend stub path**: `GET /crm/students/{id}/competitions` (under CRM base, not yet implemented)

```
❌ Not implemented — stub returns [].
★ Future backend endpoint must match one path.
```
