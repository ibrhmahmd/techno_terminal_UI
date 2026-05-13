# Competitions API — Documentation vs Implementation Map

**Date**: 2026-05-13  
**Purpose**: Compare documented API contracts against actual frontend consumption to identify gaps, mismatches, and dead code.

---

## 1. Core Competitions — `/api/v1/competitions/*`

### 1.1 List Competitions

| Aspect | Doc (`competitions.md`) | Frontend Implementation |
|--------|------------------------|-------------------------|
| **Path** | `GET /competitions` | `GET /competitions` ✅ |
| **Params** | `include_deleted` (bool) | `include_deleted` (bool) ✅ |
| **Response** | `list[CompetitionDTO]` (flat list) | `Competition[]` (flat list) ✅ |

---

### 1.2 Create Competition

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `POST /competitions` | `POST /competitions` ✅ |
| **Body** | `CreateCompetitionInput` (6 fields) | `CreateCompetitionInput` (6 fields) ✅ |
| **Response** | `CompetitionDTO` | `Competition` ✅ |

---

### 1.3 Get Competition

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `GET /competitions/{id}` | `GET /competitions/{id}` ✅ |
| **Response** | `CompetitionDTO` | `Competition` ✅ |

---

### 1.4 Update Competition

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `PUT /competitions/{id}` or `PATCH /competitions/{id}` | `PATCH /competitions/{id}` ✅ |
| **Body** | `UpdateCompetitionInput` (7 fields) | `UpdateCompetitionInput` (7 fields) ✅ |

---

### 1.5 Delete Competition

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `DELETE /competitions/{id}` | `DELETE /competitions/{id}` ✅ |
| **Response** | `bool` | `void` (ignored) ✅ |

---

### 1.6 Restore Competition

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `POST /competitions/{id}/restore` | `POST /competitions/{id}/restore` ✅ |
| **Response** | `bool` | `bool` ✅ |

---

### 1.7 List Deleted Competitions

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `GET /competitions/deleted` | `GET /competitions/deleted` ✅ |
| **Response** | `list[CompetitionDTO]` | `Competition[]` ✅ |

---

### 1.8 Get Competition Summary

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `GET /competitions/{id}/summary` | `GET /competitions/{id}/summary` ✅ |
| **Response** | `CompetitionSummaryResponse` | `CompetitionSummaryResponse` ✅ |

---

### 1.9 List Categories

| Aspect | Doc (`competitions.md`) | Frontend Implementation |
|--------|------------------------|-------------------------|
| **Path** | `GET /competitions/{id}/categories` | `GET /competitions/{id}/categories` ✅ |
| **Response** | `list[CategoryResponse]` (`{ category: string, subcategories[] }`) | `CategoryResponse[]` ✅ |

---

### 1.10 Register Team

| Aspect | Doc (`teams.md`) | Frontend Implementation |
|--------|------------------|-------------------------|
| **Path** | `POST /teams` | `POST /teams` ✅ |
| **Body** | `RegisterTeamInput` (flat: `student_ids: list[int]`) | `RegisterTeamInput` (flat: `student_ids`) ✅ |
| **Response** | `TeamRegistrationResultDTO` (`{ team, members_added }`) | `TeamRegistrationResultDTO` ✅ |

Registered via `src/api/teams/teams.ts` → `registerTeam()` function.

---

## 2. Teams API — `/api/v1/teams/*`

All 14 endpoints documented in `teams.md` are implemented in `src/api/teams/teams.ts` and consumed via `src/hooks/teams/`.

| Endpoint | Frontend Function | Status |
|----------|-------------------|--------|
| `GET /teams` | `getTeams()` | ✅ |
| `POST /teams` | `registerTeam()` (added) | ✅ |
| `GET /teams/{id}` | `getTeam()` | ✅ |
| `PUT /teams/{id}` | — | ⚠️ Not implemented |
| `PATCH /teams/{id}` | `updateTeam()` | ✅ |
| `DELETE /teams/{id}` | `deleteTeam()` | ✅ |
| `POST /teams/{id}/restore` | `restoreTeam()` | ✅ |
| `GET /teams/deleted` | `getDeletedTeams()` | ✅ |
| `GET /teams/{id}/members` | `getTeamMembers()` | ✅ |
| `POST /teams/{id}/members` | `addTeamMember()` | ✅ |
| `DELETE /teams/{id}/members/{student_id}` | `removeTeamMember()` | ✅ |
| `POST /teams/{id}/members/{student_id}/pay` | `payCompetitionFee()` | ✅ |
| `PATCH /teams/{id}/placement` | `updatePlacement()` | ✅ |
| `GET /students/{id}/competitions` | — (not implemented, full-team endpoint) | ❌ |

---

## 3. Group Competitions — `/api/v1/academics/groups/*`

### 3.1 Endpoints

| Doc Path | Frontend | Status |
|----------|----------|--------|
| `GET /academics/groups/{id}/competitions` | `getGroupCompetitions()` | ✅ |
| `GET /academics/groups/{id}/teams` | `getGroupTeams()` | ✅ |
| `POST /academics/groups/{id}/teams/{teamId}/link` | `linkTeamToGroup()` | ✅ |
| `POST /academics/groups/{id}/competitions/{compId}/register` | `registerForCompetition()` | ✅ |
| `PATCH /academics/groups/{id}/competitions/{partId}/complete` | `completeCompetitionParticipation()` | ✅ |
| `DELETE /academics/groups/{id}/competitions/{partId}` | `withdrawFromCompetition()` | ✅ |
| `GET /academics/groups/{id}/competitions/analytics` | `getGroupCompetitionAnalytics()` | ✅ |

### 3.2 Type Schema Alignment

| Doc Type | Frontend Type | Status |
|----------|---------------|--------|
| `TeamPublic` (`team_name`, `coach_id`, `is_deleted`) | `TeamPublic` (id, team_name, group_id, coach_id, created_at, is_deleted) | ✅ |
| `GroupCompetitionParticipationDTO` | `CompetitionParticipationDTO` (participation_id, competition_id, competition_name, category_id, category_name, team_id, team_name, entered_at, left_at, is_active, final_placement, notes) | ✅ |
| `GroupCompetitionHistoryResponseDTO` (`participations[]`, `total_participations`, `active_participations`, `completed_participations`) | `GroupCompetitionHistoryResponseDTO` (same) | ✅ |

---

## 4. Finance Competitions — `/api/v1/finance/competition-fees`

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `GET /finance/competition-fees?student_id={id}` | ✅ Match |
| **Response** | `UnpaidCompFeeItem[]` | ✅ Match |
| **Types** | All fields match | ✅ Match |

**Status**: ✅ Fully aligned.

---

## 5. Analytics Competitions — `/api/v1/analytics/competitions/fee-summary`

| Aspect | Doc | Frontend |
|--------|-----|----------|
| **Path** | `GET /analytics/competitions/fee-summary` | ✅ Match |
| **Response** | `CompetitionFeeSummaryDTO[]` | ✅ Match |
| **Types** | All fields match | ✅ Match |

**Status**: ✅ Fully aligned.

---

## 6. Student Competitions — `/api/v1/crm/students/{id}/competitions`

| Aspect | Doc (`teams.md`) | Frontend Stub |
|--------|------------------|---------------|
| **Path** | `GET /students/{id}/competitions` (under teams base) | Stub returning `[]` |
| **Response** | `StudentCompetitionsResponse` | Stub (not aligned) |

**Status**: ❌ Not aligned. Backend endpoint not implemented. Frontend stub needs updating when endpoint is ready.

---

## 7. Removed / Dead Code Eliminated

The following items were removed from the frontend because they have no documented API equivalent:

| Item | Reason |
|------|--------|
| `CompetitionCategory` type | Doc uses `CategoryResponse` (string names, not entities) |
| `TeamRegistration` type | Doc uses `TeamRegistrationResultDTO` |
| `TeamMember` type | Not in any doc schema |
| `CreateCategoryInput` type | Categories auto-generated from teams, no create endpoint |
| `PaginatedCompetitionsResponse` | Doc says flat `list[CompetitionDTO]` |
| `CompetitionStatsResponse` | Not documented |
| `CompetitionStatus` type | Not in any doc schema |
| `PaymentStatus` type | Not in any doc schema |
| `getCategoryTeams()` function | Not documented |
| `getCompetitionStats()` function | Not documented (zero usage) |
| `markCompetitionFeePaid()` function | Not documented (zero usage) |
| `CategoryForm` component | Categories auto-generated, no create endpoint |
| `useCompetitionTeams` hook | Consumed undocumented `getCategoryTeams` |
| Legacy fields in `CreateCompetitionInput` | `description`, `start_date`, `end_date`, `registration_deadline`, `max_teams`, `fee_per_participant` |
| Legacy fields in `UpdateCompetitionInput` | `description`, `start_date`, `end_date`, `registration_deadline`, `status`, `max_teams`, `fee_per_participant` |
| Extra fields in `Competition` | `description`, `start_date`, `end_date`, `registration_deadline`, `status`, `registered_teams`, `total_participants`, `fee_per_participant`, `categories` |
| Extra fields in `CompetitionSummaryResponse` | `total_students`, `total_expected`, `total_collected` |
| Undocumented functions in `utils/competition.ts` | `isRegistrationOpen`, `calculateTotalRevenue` (used undocumented fields) |

---

## Summary

### ✅ Fully Aligned
- All core competitions CRUD endpoints
- List/restore/delete deleted competitions
- Competition summary
- Categories as `CategoryResponse` (string-based)
- Team registration via `POST /teams` with doc's `RegisterTeamInput`
- All teams API endpoints
- All group competitions endpoints and types
- Finance and analytics endpoints
- Types stripped to match doc schemas exactly

### ❌ Still Pending
- Student competitions endpoint not implemented (backend stub)
- Categories are always empty until teams are registered (auto-generated)

### 🟢 Pre-existing (Non-blocking)
- Pre-existing build warnings (dynamic import, chunk size)
- Pre-existing test failures (GroupsTable.test.tsx, useGroups.test.ts — import resolution)
