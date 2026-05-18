# Competitions API Documentation

**Base URL**: `/api/v1`  
**Auth**: Bearer JWT (Supabase)  
**Response Envelope**: All responses follow `ApiResponse<T>` format.

---

## Response Envelope

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Human-readable detail"
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `NotFoundError` | 404 | Resource not found |
| `ValidationError` | 422 | Invalid request body |
| `BusinessRuleError` | 409 | Business rule violation |
| `ConflictError` | 409 | Duplicate/conflicting data |
| `AuthError` | 401 | Missing or invalid JWT |

---

## Authentication

| Role | Access |
|------|--------|
| `admin` / `system_admin` | Full read + write |
| `coach` | Read-only (own teams only) |
| Any authenticated user | Read competitions, categories, student competitions |

Include JWT in header: `Authorization: Bearer <token>`

---

## Competitions

### 1. List All Competitions

```
GET /competitions
```

**Auth**: Any authenticated user

**Response**: `ApiResponse<CompetitionDTO[]>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "FIRST LEGO League",
      "edition": null,
      "edition_year": 2025,
      "competition_date": "2025-06-15",
      "location": "Cairo",
      "notes": null,
      "fee_per_student": 500.0,
      "created_at": "2025-01-10T10:00:00"
    }
  ]
}
```

---

### 2. Create Competition

```
POST /competitions
```

**Auth**: Admin only

**Body**: `CreateCompetitionInput`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes | 1-200 chars, non-empty |
| `edition` | string | No | Max 100 chars (deprecated) |
| `competition_date` | date | No | ISO 8601 (`YYYY-MM-DD`) |
| `location` | string | No | Max 200 chars |
| `notes` | string | No | Max 1000 chars |
| `fee_per_student` | number | No | Default `0.0`, >= 0 |

**Request**:
```json
{
  "name": "WRO 2025",
  "competition_date": "2025-09-20",
  "location": "Alexandria",
  "fee_per_student": 750.00
}
```

**Response**: `ApiResponse<CompetitionDTO>` (201)

---

### 3. Get Competition by ID

```
GET /competitions/{competition_id}
```

**Auth**: Any authenticated user

**Response**: `ApiResponse<CompetitionDTO>`

**Errors**: 404 if not found

---

### 4. Update Competition (Full)

```
PUT /competitions/{competition_id}
```

**Auth**: Admin only

**Body**: `UpdateCompetitionInput` — all fields optional, but at least one required.

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | 1-200 chars |
| `edition` | string | Max 100 chars |
| `edition_year` | int | 2000-2100 |
| `competition_date` | date | ISO 8601 |
| `location` | string | Max 200 chars |
| `fee_per_student` | number | >= 0, 2 decimal places |
| `notes` | string | Max 1000 chars |

**Response**: `ApiResponse<CompetitionDTO>`

**Errors**: 404 if not found, 400 if no fields provided

---

### 5. Update Competition (Partial)

```
PATCH /competitions/{competition_id}
```

Same as PUT. Only provided fields are updated.

---

### 6. Delete Competition (Hard Delete)

```
DELETE /competitions/{competition_id}
```

**Auth**: Admin only

**Response**: `ApiResponse<boolean>`

**Business Rules**:
- Cannot delete if teams are registered (409)

**Errors**: 404 if not found, 409 if has teams

---

### 7. Get Competition Summary

```
GET /competitions/{competition_id}/summary
```

**Auth**: Any authenticated user

**Response**: `ApiResponse<CompetitionSummaryResponse>`

```json
{
  "success": true,
  "data": {
    "competition": { "id": 1, "name": "...", ... },
    "categories": [
      {
        "category": "Robotics",
        "subcategory": "Advanced",
        "teams": [
          {
            "team": { "id": 5, "team_name": "Team Alpha", ... },
            "members": [
              { "id": 10, "team_id": 5, "student_id": 42, "amount_due": 500.0, "amount_paid": 500.0 }
            ]
          }
        ]
      }
    ],
    "total_teams": 12,
    "total_participants": 48
  }
}
```

**Errors**: 404 if competition not found

---

### 8. List Competition Categories

```
GET /competitions/{competition_id}/categories
```

**Auth**: Any authenticated user

**Response**: `ApiResponse<CategoryResponse[]>`

```json
{
  "success": true,
  "data": [
    {
      "category": "Robotics",
      "subcategories": ["Advanced", "Beginner"]
    },
    {
      "category": "Programming",
      "subcategories": []
    }
  ]
}
```

**Errors**: 404 if competition not found

---

## Teams

### 9. List Teams

```
GET /teams?competition_id={id}&category={cat}&subcategory={sub}&include_members=true
```

**Auth**: Any authenticated user  
**Coach**: Only sees their own teams

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `competition_id` | int | Yes | Filter by competition |
| `category` | string | No | Filter by category |
| `subcategory` | string | No | Filter by subcategory |
| `include_members` | bool | No | Default `true`. Include team members in response |

**Response**: `ApiResponse<TeamWithMembersDTO[]>` (if `include_members=true`) or `ApiResponse<TeamDTO[]>`

```json
{
  "success": true,
  "data": [
    {
      "team": {
        "id": 5,
        "competition_id": 1,
        "category": "Robotics",
        "subcategory": "Advanced",
        "group_id": null,
        "team_name": "Team Alpha",
        "coach_id": 3,
        "project_name": "Mars Rover",
        "project_description": "Autonomous rover for Mars terrain",
        "placement_rank": 1,
        "placement_label": "Gold",
        "notes": null,
        "created_at": "2025-02-01T10:00:00"
      },
      "members": [
        {
          "id": 10,
          "team_id": 5,
          "student_id": 42,
          "amount_due": 500.0,
          "amount_paid": 500.0
        }
      ]
    }
  ]
}
```

---

### 10. Register Team

```
POST /teams
```

**Auth**: Admin only

**Body**: `RegisterTeamInput`

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `competition_id` | int | Yes | Must exist |
| `team_name` | string | Yes | 1-200 chars, unique within competition |
| `category` | string | Yes | Non-empty |
| `subcategory` | string | No | Required if category has subcategories |
| `project_name` | string | No | Max 500 chars |
| `project_description` | string | No | Max 5000 chars |
| `student_ids` | int[] | Yes | At least 1 student |
| `student_fees` | `{student_id: fee}` | No | Per-student fees, missing defaults to 0 |
| `coach_id` | int | No | Must be valid employee |
| `group_id` | int | No | Must be valid group |
| `notes` | string | No | Max 1000 chars |

**Request**:
```json
{
  "competition_id": 1,
  "team_name": "Team Alpha",
  "category": "Robotics",
  "subcategory": "Advanced",
  "student_ids": [42, 43, 44],
  "student_fees": { "42": 500.0, "43": 500.0 },
  "project_name": "Mars Rover",
  "coach_id": 3
}
```

**Response**: `ApiResponse<TeamRegistrationResultDTO>` (201)

```json
{
  "success": true,
  "data": {
    "team": { "id": 5, "team_name": "Team Alpha", ... },
    "members_added": 3
  },
  "message": "Team registered successfully."
}
```

**Business Rules**:
- One student can only be in one team per competition (409)
- Team name must be unique within the competition (409)
- If category has subcategories, subcategory must be specified (400)

**Errors**: 400 for validation, 404 for missing competition/student, 409 for duplicates

---

### 11. Get Team by ID

```
GET /teams/{team_id}
```

**Auth**: Admin or team coach (via `require_coach_or_admin`)

**Response**: `ApiResponse<TeamDTO>`

**Errors**: 404 if not found, 403 if not admin/coach of this team

---

### 12. Update Team (Full)

```
PUT /teams/{team_id}
```

**Auth**: Admin only

**Body**: `UpdateTeamInput` — all fields optional, at least one required.

| Field | Type | Constraints |
|-------|------|-------------|
| `team_name` | string | 1-200 chars |
| `category` | string | Max 100 chars |
| `subcategory` | string | Max 100 chars |
| `project_name` | string | Max 500 chars |
| `project_description` | string | Max 5000 chars |
| `group_id` | int | Must be valid |
| `coach_id` | int | Must be valid employee |
| `notes` | string | Max 1000 chars |

**Response**: `ApiResponse<TeamDTO>`

---

### 13. Update Team (Partial)

```
PATCH /teams/{team_id}
```

Same as PUT. Only provided fields are updated.

---

### 14. Delete Team (Hard Delete)

```
DELETE /teams/{team_id}
```

**Auth**: Admin only

**Response**: `ApiResponse<boolean>`

**Business Rules**:
- Cannot delete team with paid members (409)

**Errors**: 404 if not found, 409 if has paid members

---

## Team Members

### 15. List Team Members

```
GET /teams/{team_id}/members
```

**Auth**: Admin or team coach

**Response**: `ApiResponse<TeamMemberListResponse>`

```json
{
  "success": true,
  "data": {
    "team_id": 5,
    "team_name": "Team Alpha",
    "members": [
      {
        "team_member_id": 10,
        "team_id": 5,
        "team_name": "Team Alpha",
        "student_id": 42,
        "student_name": "Ahmed Hassan",
        "amount_due": 500.0,
        "amount_paid": 500.0
      }
    ]
  }
}
```

**Errors**: 404 if team not found, 403 if not authorized

---

### 16. Add Team Member

```
POST /teams/{team_id}/members
```

**Auth**: Admin only

**Body**: `AddTeamMemberInput`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `student_id` | int | Yes | Must be active student |
| `amount_due` | number | No | Default `0.0` |

**Request**:
```json
{
  "student_id": 45,
  "amount_due": 500.0
}
```

**Response**: `ApiResponse<AddTeamMemberResultDTO>` (201)

```json
{
  "success": true,
  "data": {
    "team_member_id": 11,
    "student_id": 45,
    "student_name": "Sara Ali"
  },
  "message": "Member added successfully."
}
```

**Business Rules**:
- Student cannot already be in another team for this competition (409)
- Student must be active (400)

---

### 17. Remove Team Member

```
DELETE /teams/{team_id}/members/{student_id}
```

**Auth**: Admin only

**Response**: `ApiResponse<boolean>`

**Business Rules**:
- Cannot remove a member who has already paid (`amount_paid > 0`) (400)

**Errors**: 400 if paid member, 404 if team/member not found

---

### 18. Pay Competition Fee

```
POST /teams/{team_id}/members/{student_id}/pay
```

**Auth**: Admin only

**Body**: `PayCompetitionFeeInput`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Payment amount (> 0). Supports partial payments |
| `parent_id` | int | No | Parent ID for receipt |

**Request**:
```json
{
  "amount": 250.0,
  "parent_id": 10
}
```

**Response**: `ApiResponse<PayCompetitionFeeResponseDTO>`

```json
{
  "success": true,
  "data": {
    "receipt_number": "REC-2025-0042",
    "payment_id": 15,
    "amount": 250.0,
    "amount_paid": 250.0,
    "amount_due": 500.0
  },
  "message": "Payment processed successfully."
}
```

**Business Rules**:
- Payment amount must be > 0 (400)
- Payment is atomic (receipt + fee recording)
- On failure, payment is automatically rolled back (no orphan receipts)

**Errors**: 400 for invalid amount, 404 if team/member not found

---

### 19. Update Team Placement

```
PATCH /teams/{team_id}/placement
```

**Auth**: Admin only

**Body**: `PlacementUpdateInput`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `placement_rank` | int | Yes | >= 1 (1 = 1st place) |
| `placement_label` | string | No | Max 100 chars (e.g., "Gold", "3rd Place") |

**Request**:
```json
{
  "placement_rank": 1,
  "placement_label": "Gold"
}
```

**Response**: `ApiResponse<TeamDTO>`

**Business Rules**:
- Cannot set placement before competition date has passed (400)

---

## Student Competitions

### 20. Get Student's Competitions

```
GET /students/{student_id}/competitions
```

**Auth**: Any authenticated user

**Response**: `ApiResponse<StudentCompetitionsResponse>`

```json
{
  "success": true,
  "data": {
    "student_id": 42,
    "competitions": [
      {
        "membership": {
          "id": 10,
          "team_id": 5,
          "student_id": 42,
          "amount_due": 500.0,
          "amount_paid": 500.0
        },
        "team": {
          "id": 5,
          "team_name": "Team Alpha",
          "category": "Robotics",
          "subcategory": "Advanced",
          ...
        },
        "category": "Robotics",
        "subcategory": "Advanced",
        "competition": {
          "id": 1,
          "name": "FIRST LEGO League",
          "edition_year": 2025,
          ...
        }
      }
    ]
  }
}
```

**Errors**: 404 if student not found

---

## DTO Reference

### CompetitionDTO

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key |
| `name` | string | Competition name |
| `edition` | string \| null | Deprecated |
| `edition_year` | int | Year of this edition |
| `competition_date` | date \| null | Competition date |
| `location` | string \| null | Venue |
| `notes` | string \| null | Additional notes |
| `fee_per_student` | number | Default fee per student |
| `created_at` | datetime \| null | Creation timestamp |

### TeamDTO

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key |
| `competition_id` | int | FK to competition |
| `category` | string | Category name |
| `subcategory` | string \| null | Optional subcategory |
| `group_id` | int \| null | FK to group |
| `team_name` | string | Team name |
| `coach_id` | int \| null | FK to employee (coach) |
| `project_name` | string \| null | Project name |
| `project_description` | string \| null | Project description |
| `placement_rank` | int \| null | Competition placement (1 = 1st) |
| `placement_label` | string \| null | Label like "Gold" |
| `notes` | string \| null | Additional notes |
| `created_at` | datetime \| null | Creation timestamp |

### TeamMemberDTO

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Primary key (team_member_id) |
| `team_id` | int | FK to team |
| `student_id` | int | FK to student |
| `amount_due` | number | Fee amount due |
| `amount_paid` | number | Fee amount paid (running total) |

### TeamMemberRosterDTO

| Field | Type | Description |
|-------|------|-------------|
| `team_member_id` | int | Team member ID |
| `team_id` | int | Team ID |
| `team_name` | string | Team name |
| `student_id` | int | Student ID |
| `student_name` | string | Student full name |
| `amount_due` | number | Fee amount due |
| `amount_paid` | number | Fee amount paid |

### PayCompetitionFeeResponseDTO

| Field | Type | Description |
|-------|------|-------------|
| `receipt_number` | string | Receipt reference |
| `payment_id` | int | Payment record ID |
| `amount` | number | Amount paid in this transaction |
| `amount_paid` | number | Running total after this payment |
| `amount_due` | number | Original amount due |

### TeamRegistrationResultDTO

| Field | Type | Description |
|-------|------|-------------|
| `team` | TeamDTO | Created team |
| `members_added` | int | Number of members added |

### AddTeamMemberResultDTO

| Field | Type | Description |
|-------|------|-------------|
| `team_member_id` | int | New member ID |
| `student_id` | int | Student ID |
| `student_name` | string | Student full name |

### CategoryResponse

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Category name |
| `subcategories` | string[] | List of subcategory names |

### CompetitionSummaryResponse

| Field | Type | Description |
|-------|------|-------------|
| `competition` | CompetitionDTO | Competition details |
| `categories` | CategoryWithTeamsDTO[] | Categories with nested teams and members |
| `total_teams` | int | Total team count |
| `total_participants` | int | Total participant count |

### CategoryWithTeamsDTO

| Field | Type | Description |
|-------|------|-------------|
| `category` | string | Category name |
| `subcategory` | string \| null | Subcategory name |
| `teams` | TeamWithMembersDTO[] | Teams in this category |

### TeamWithMembersDTO

| Field | Type | Description |
|-------|------|-------------|
| `team` | TeamDTO | Team details |
| `members` | TeamMemberDTO[] | Team members |

### StudentCompetitionDTO

| Field | Type | Description |
|-------|------|-------------|
| `membership` | TeamMemberDTO | Student's team membership |
| `team` | TeamDTO | Team details |
| `category` | string | Category name |
| `subcategory` | string \| null | Subcategory name |
| `competition` | CompetitionDTO \| null | Competition details |

---

## Key Changes from Previous Version

1. **Hard Delete**: Competitions and teams are permanently deleted (no `deleted_at`/`deleted_by` fields). Delete endpoints return `ApiResponse<boolean>`.

2. **Payment Model**: `team_members` now uses `amount_due` (decimal) and `amount_paid` (decimal) instead of boolean `fee_paid`/`member_share`. Payments support partial amounts and atomic receipt creation.

3. **Project Tracking**: Teams now have `project_name` (string, max 500) and `project_description` (string, max 5000) fields.

4. **Coach Read-Only**: Coaches can only read their own teams. `GET /teams` filters by coach's `employee_id`. `GET /teams/{team_id}` and `GET /teams/{team_id}/members` require admin or team coach.

5. **Removed**: `GroupCompetitionParticipation` table and all related endpoints. Teams now directly reference `competition_id`.

6. **Category/Subcategory Filter**: `GET /teams` supports `category` and `subcategory` query parameters for filtering.
