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

### 2. CompetitionCategory

**Source**: `schemas.md` `CategoryResponse`

| Field | Doc Type (CategoryResponse) | Frontend Type (CompetitionCategory) | Status |
|-------|----------------------------|-------------------------------------|--------|
| `category` | string | `name` | ❌ Field name mismatch |
| `subcategories` | string[] | — | ❌ Missing in frontend |
| — | — | `id` | ❌ Extra (not in response) |
| — | — | `competition_id` | ❌ Extra |
| — | — | `description` | ❌ Extra |
| — | — | `min_age`, `max_age` | ❌ Extra |
| — | — | `max_team_size` | ❌ Extra |
| — | — | `registered_teams` | ❌ Extra |

**Fix**: **Critical** — frontend `CompetitionCategory` is completely misaligned. Either:
- Backend provides a full entity endpoint, or
- Frontend adapts `CategoryList` to render from `CategoryResponse` (category name + subcategories only)

---

### 3. Team / TeamRegistration

**Source**: `schemas.md` `TeamDTO`, `RegisterTeamInput`, `TeamRegistrationResultDTO`

**Backend `TeamDTO`:**
| Field | Type | Frontend Match |
|-------|------|----------------|
| `id` | int | ✅ (as `team_id`) |
| `competition_id` | int | ✅ |
| `team_name` | string | ✅ (as `team_name`) |
| `category` | string | ❌ Frontend uses `category_id` |
| `subcategory` | string? | ❌ Missing in frontend |
| `group_id` | int? | ❌ Missing |
| `coach_id` | int? | ❌ Missing |
| `fee` | number? | ❌ Frontend uses `total_fee` |
| `placement_rank` | int? | ❌ Missing |
| `placement_label` | string? | ❌ Missing |
| `notes` | string? | ❌ Missing |
| `created_at` | string | ✅ |

**Backend `RegisterTeamInput` vs Frontend:**
| Field | Doc (Backend) | Frontend | Status |
|-------|--------------|----------|--------|
| `competition_id` | int, required | `string` | ❌ Type mismatch |
| `team_name` | string, required | `team_name` | ✅ |
| `category` | string, required | `category_id` (string) | ❌ Field name |
| `subcategory` | string? | — | ❌ Missing |
| `student_ids` | list[int], required | `members: [{student_id, role}]` | ❌ **Complete structure mismatch** |
| `coach_id` | int? | — | ❌ Missing |
| `group_id` | int? | — | ❌ Missing |
| `fee` | number? | — | ❌ Missing |
| `notes` | string? | — | ❌ Missing |

**Backend `TeamRegistrationResultDTO`:**
| Field | Doc | Frontend `TeamRegistration` | Status |
|-------|-----|---------------------------|--------|
| `team` | TeamDTO | `id`, `team_id`, `team_name`, ... | ❌ Flattened |
| `members_added` | int | `members[]`, `members_count` | ❌ Different |

**Fix**: **Critical** — complete mismatch in registration payload. Must align frontend to backend or vice versa.

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

### 5. CompetitionParticipation (Group)

**Source**: `group_competitions.md` `GroupCompetitionParticipationDTO` vs Frontend `CompetitionParticipationDTO`

| Field | Doc | Frontend | Status |
|-------|-----|----------|--------|
| `participation_id` | int | `id` | ✅ (name diff) |
| `competition_id` | int | `competition_id` | ✅ |
| `competition_name` | string | `competition_name` | ✅ |
| `category_id` | int? | — | ❌ Missing |
| `category_name` | string? | — | ❌ Missing |
| `team_id` | int? | — | ❌ Missing |
| `team_name` | string? | — | ❌ Missing |
| `entered_at` | string | — | ❌ Missing |
| `left_at` | string? | — | ❌ Missing |
| `is_active` | bool | — | ❌ Missing |
| `final_placement` | int? | — | ❌ Missing |
| `notes` | string? | `notes` | ✅ |
| — | — | `level_at_time` | ⚠️ Extra |
| — | — | `event_date` | ⚠️ Extra |
| — | — | `result` | ⚠️ Extra |
| — | — | `score` | ⚠️ Extra |

**Fix**: These are structurally different DTOs — frontend likely calls a different endpoint or expects a simplified history view.

---

### 6. GroupCompetitionHistoryResponseDTO

**Source**: `group_competitions.md`

| Field | Doc | Frontend | Status |
|-------|-----|----------|--------|
| `group_id` | int | `group_id` | ✅ |
| `group_name` | string | `group_name` | ✅ |
| `participations[]` | list | `competitions[]` | ❌ Field name |
| `total_participations` | int | `total_competitions` | ❌ Field name |
| `active_participations` | int | — | ❌ Missing |
| `completed_participations` | int | — | ❌ Missing |
| — | — | `wins` | ⚠️ Extra |
| — | — | `runner_ups` | ⚠️ Extra |

**Fix**: Align field names between frontend and backend response.

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
