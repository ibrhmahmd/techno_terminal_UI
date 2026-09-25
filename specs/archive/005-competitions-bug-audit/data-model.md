# Data Model: Competitions Domain

**Date**: 2026-05-13  
**Source**: API documentation (`docs/api/competitions/`) + Frontend types (`src/api/competitions/types.ts`, `src/api/academics/types/groups/competitions.ts`)

## Entity Alignment Status

Each entity below identifies the source of truth (backend doc) and the frontend type. Where they diverge, the fix direction is noted.

---

### 1. Competition

**Source**: `schemas.md` `CompetitionDTO`

| Field | Doc Type | Frontend Type | Status |
|-------|----------|---------------|--------|
| `id` | int | `number` | ✅ |
| `name` | string | `string` | ✅ |
| `edition` | string? | `string \| null` | ✅ |
| `edition_year` | int? | `number \| null` | ✅ |
| `competition_date` | date? | `string \| null` | ✅ |
| `location` | string | `string` | ✅ |
| `notes` | string? | `string \| null` | ✅ |
| `fee_per_student` | number | `number` | ✅ |
| `created_at` | string | `string` | ✅ |
| — | — | `deleted_at?: string \| null` | ⚠️ Extra (soft-delete) |
| — | — | `description?: string` | ⚠️ Extra (legacy) |
| — | — | `status?: 'upcoming' \| 'active' \| ...` | ⚠️ Extra (not in doc) |

**Fix**: Extra fields are backward-compatible — no change needed unless they cause confusion.

---

### 2. CompetitionCategory (CategoryResponse)

**Source**: `schemas.md` `CategoryResponse`  
**Frontend type**: `CategoryResponse` in `src/api/competitions/types.ts:39-42`

| Field | Doc Type | Frontend Type | Status |
|-------|----------|---------------|--------|
| `category` | string | `category` | ✅ |
| `subcategories` | string[]? | `subcategories` | ✅ |

**Status**: ✅ Fully aligned. The frontend `CompetitionCategory` entity type was removed during dead code elimination. `CategoryList` renders from `CategoryResponse` (string-based).

---

### 3. Team / TeamRegistration

**Source**: `schemas.md` `TeamDTO`, `RegisterTeamInput`, `TeamRegistrationResultDTO`  
**Frontend type**: `TeamDTO` in `src/api/competitions/types.ts:64-77`, `RegisterTeamInput` in `src/api/teams/types.ts`, `registerTeam()` calls `POST /teams`

**Status**: ✅ Fully aligned. Frontend uses the documented `team_name`, flat `RegisterTeamInput` with `student_ids`, and `POST /teams` endpoint. Legacy `TeamRegistration` type removed during dead code elimination. `TeamRegistrationModal` sends `{ competition_id, team_name, category, student_ids }`.

**Note**: Some optional fields (`subcategory`, `coach_id`, `group_id`) are not sent by the frontend form — this is acceptable as they are optional per the doc schema.

---

### 4. TeamMember

**Source**: `schemas.md` `TeamMemberDTO`, `TeamMemberRosterDTO`, `AddTeamMemberInput`

| Field | Doc (TeamMemberDTO) | Frontend | Status |
|-------|--------------------|----------|--------|
| `id` | int | `id` | ✅ |
| `team_id` | int | — | ❌ Missing |
| `student_id` | int | `student_id` | ✅ (string in frontend) |
| `member_share` | number | — | ❌ Missing |
| `fee_paid` | bool | `fee_paid` | ✅ |
| `payment_id` | int? | — | ❌ Missing |
| — | — | `student_name` | ⚠️ Extra |
| — | — | `role` ('leader' \| 'member') | ⚠️ Extra |

---

### 5. CompetitionParticipationDTO (Group)

**Source**: `group_competitions.md` `GroupCompetitionParticipationDTO`  
**Frontend type**: `CompetitionParticipationDTO` in `src/api/academics/types/groups/competitions.ts:1-14`

| Field | Doc | Frontend | Status |
|-------|-----|----------|--------|
| `participation_id` | int | `participation_id` | ✅ |
| `competition_id` | int | `competition_id` | ✅ |
| `competition_name` | string | `competition_name` | ✅ |
| `category_id` | int? | `category_id` | ✅ |
| `category_name` | string? | `category_name` | ✅ |
| `team_id` | int | `team_id` | ✅ |
| `team_name` | string | `team_name` | ✅ |
| `entered_at` | string | `entered_at` | ✅ |
| `left_at` | string? | `left_at` | ✅ |
| `is_active` | bool | `is_active` | ✅ |
| `final_placement` | int? | `final_placement` | ✅ |
| `notes` | string? | `notes` | ✅ |

**Status**: ✅ Fully aligned. Frontend DTO mirrors the documented DTO exactly.

---

### 6. GroupCompetitionHistoryResponseDTO

**Source**: `group_competitions.md`  
**Frontend type**: `GroupCompetitionHistoryResponseDTO` in `src/api/academics/types/groups/competitions.ts:25-32`

| Field | Doc | Frontend | Status |
|-------|-----|----------|--------|
| `group_id` | int | `group_id` | ✅ |
| `group_name` | string | `group_name` | ✅ |
| `participations[]` | list | `participations[]` | ✅ |
| `total_participations` | int | `total_participations` | ✅ |
| `active_participations` | int | `active_participations` | ✅ |
| `completed_participations` | int | `completed_participations` | ✅ |

**Status**: ✅ Fully aligned. Frontend mirrors the documented DTO exactly. Legacy fields (`wins`, `runner_ups`) removed during dead code elimination.

---

### 7. CompetitionRecord (Student)

**Source**: `teams.md` `GET /students/{id}/competitions` → `StudentCompetitionsResponse`, Frontend `CompetitionRecord`

| Field | Doc (StudentCompetitionDTO) | Frontend (CompetitionRecord) | Status |
|-------|----------------------------|------------------------------|--------|
| Nested structure | `{ membership, team, category, competition }` | Flat: `id, competition_name, date, result, achievement, notes` | ❌ Completely different |

**Fix**: Backend endpoint not yet implemented (stub returns `[]`). When implemented, response shape must match what the frontend `CompetitionTab` renders.

---

### 8. UnpaidCompFeeItem

**Source**: `finance/competition.md` + Frontend `finance/types/competition.ts`

**Status**: ✅ Fully aligned. All fields match.

### 9. CompetitionFeeSummaryDTO

**Source**: `analytics/competition.md` + Frontend `analytics/types/competition.ts`

**Status**: ✅ Fully aligned. All fields match.
