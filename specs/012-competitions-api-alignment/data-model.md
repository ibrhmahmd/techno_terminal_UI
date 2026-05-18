# Data Model: Competitions API Alignment

## Entities

### Competition

Represents a contest/event that students can participate in.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | number | No | Primary key |
| `name` | string | No | 1-200 chars |
| `edition` | string | Yes | Deprecated, max 100 chars |
| `edition_year` | number | Yes | 2000-2100 |
| `competition_date` | string | Yes | ISO 8601 (`YYYY-MM-DD`) |
| `location` | string | Yes | Max 200 chars (was required, now nullable) |
| `notes` | string | Yes | Max 1000 chars |
| `fee_per_student` | number | No | Default 0.0, >= 0 |
| `created_at` | string | Yes | ISO datetime |

**Changes from previous**: `location` now nullable. `deleted_at` removed (hard delete).

### Team

A group of students registered for a specific competition.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | number | No | Primary key |
| `competition_id` | number | No | FK to Competition |
| `category` | string | No | Category name |
| `subcategory` | string | Yes | Optional subcategory |
| `group_id` | number | Yes | FK to Group |
| `team_name` | string | No | 1-200 chars, unique within competition |
| `coach_id` | number | Yes | FK to Employee |
| `project_name` | string | Yes | NEW, max 500 chars |
| `project_description` | string | Yes | NEW, max 5000 chars |
| `placement_rank` | number | Yes | >= 1 (1 = 1st place) |
| `placement_label` | string | Yes | Max 100 chars (e.g., "Gold") |
| `notes` | string | Yes | Max 1000 chars |
| `created_at` | string | Yes | ISO datetime |

**Changes from previous**: `fee` field removed. `project_name` and `project_description` added. `deleted_at` removed (hard delete).

### TeamMember

A student's membership in a team, tracking fee obligations.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | number | No | Primary key (team_member_id) |
| `team_id` | number | No | FK to Team |
| `student_id` | number | No | FK to Student |
| `amount_due` | number | No | Fee amount owed (replaces `member_share`) |
| `amount_paid` | number | No | Running total of payments (replaces `fee_paid` boolean) |

**Changes from previous**: `member_share` → `amount_due`. `fee_paid` (boolean) → `amount_paid` (decimal running total). `payment_id` removed.

### TeamMemberRoster

Extended team member info for display (includes names).

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `team_member_id` | number | No | Team member ID |
| `team_id` | number | No | Team ID |
| `team_name` | string | No | Team name |
| `student_id` | number | No | Student ID |
| `student_name` | string | No | Student full name |
| `amount_due` | number | No | Fee amount owed |
| `amount_paid` | number | No | Running total of payments |

**Changes from previous**: `member_share` → `amount_due`. `fee_paid` (boolean) → `amount_paid` (decimal). `payment_id` removed.

### Payment

An atomic transaction recording a fee payment.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `receipt_number` | string | No | Receipt reference (e.g., "REC-2025-0042") |
| `payment_id` | number | No | Payment record ID |
| `amount` | number | No | Amount paid in this transaction |
| `amount_paid` | number | No | Running total after this payment |
| `amount_due` | number | No | Original amount due |

### CategoryWithTeams

A category (optionally with subcategory) containing teams.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `category` | string | No | Category name |
| `subcategory` | string | Yes | Subcategory name (or null for category-level) |
| `teams` | TeamWithMembers[] | No | Teams in this category/subcategory |

**Changes from previous**: Replaced `CompetitionSummaryCategory` which had `category_id` and `category_name`. Now uses `subcategory` for grouping.

### TeamWithMembers

A team with its member roster nested.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `team` | TeamDTO | No | Team details |
| `members` | TeamMemberDTO[] | No | Team members |

### CategoryResponse

Available categories for a competition.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `category` | string | No | Category name |
| `subcategories` | string[] | No | List of subcategory names (empty array if none) |

## Relationships

```
Competition 1 ─── * Team
Team 1 ─── * TeamMember
TeamMember * ─── 1 Student
Team * ─── 1 Coach (Employee)
Team * ─── 1 Group (optional)
```

## Validation Rules

- Competition `name`: 1-200 chars, non-empty
- Competition `edition_year`: 2000-2100
- Competition `fee_per_student`: >= 0
- Team `team_name`: 1-200 chars, unique within competition
- Team `project_name`: max 500 chars
- Team `project_description`: max 5000 chars
- Team `placement_rank`: >= 1
- Team member: student cannot be in multiple teams for same competition
- Team member removal: blocked if `amount_paid > 0`
- Competition deletion: blocked if any teams registered
- Team deletion: blocked if any member has `amount_paid > 0`
- Payment `amount`: must be > 0
- Placement update: blocked if competition date has not passed
