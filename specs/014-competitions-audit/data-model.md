# Data Model: Competitions Feature Audit & Quality Fix

## Overview

This feature is a **remediation audit** — it fixes bugs, removes dead code, improves type safety, migrates data fetching patterns, and enhances accessibility. **No new entities, API endpoints, or database schema changes are required.**

## Existing Entities (Unchanged)

### Competition
- **Fields**: `id`, `name`, `edition`, `edition_year`, `competition_date`, `location`, `notes`, `fee_per_student`, `created_at`
- **Relationships**: Has many Teams, has many Categories
- **Validation**: Name required (1-200 chars), fee >= 0

### Team
- **Fields**: `id`, `competition_id`, `team_name`, `category`, `subcategory`, `group_id`, `coach_id`, `project_name`, `project_description`, `placement_rank`, `placement_label`, `notes`, `created_at`
- **Relationships**: Belongs to Competition, has many Team Members
- **Validation**: Team name unique within competition, category required

### Team Member
- **Fields**: `id`, `team_id`, `student_id`, `amount_due`, `amount_paid`
- **Relationships**: Belongs to Team, references Student
- **Validation**: Student cannot be in multiple teams per competition

### Category
- **Fields**: `category` (string), `subcategories` (string[])
- **Relationships**: Classification for Teams within a Competition
- **Note**: Categories are auto-generated from team registrations, not a separate database table

## State Transitions (Unchanged)

- Competition: Created → Active → (optional) Deleted
- Team: Created → Active → (optional) Deleted
- Team Member: Created → (optional) Payment Applied → (optional) Removed

## Data Fetching Changes

### Before Audit
| Hook | Pattern | Issue |
|------|---------|-------|
| `useCompetitionFees` | Manual useState + useCallback | Violates Constitution Principle II |
| `useTeams` | React Query with inline key | Not using centralized factory |
| `useTeamsWithMembers` | React Query with inline key | Not using centralized factory |
| `useStudentCompetitions` | React Query with inline key | Not using centralized factory |

### After Audit
| Hook | Pattern | Status |
|------|---------|--------|
| `useCompetitionFees` | React Query with `queryKeys.competitionFees` | Migrated |
| `useTeams` | React Query with `queryKeys.teamsByCompetition` | Fixed |
| `useTeamsWithMembers` | React Query with `queryKeys.teamsWithMembers` | Fixed |
| `useStudentCompetitions` | React Query with `queryKeys.studentCompetitions` | Fixed |

## Type Safety Changes

### Before Audit
- 6 unsafe type casts (`as CreateCompetitionInput`, `as UpdateCompetitionInput`, `err as {...}`)
- 1 implicit `any` in catch clause
- 5 missing return type annotations on exported hooks
- 1 redundant default export

### After Audit
- All casts replaced with proper typing or type guards
- All catch clauses use `unknown` with type guards
- All exported hooks have explicit return types
- Redundant default export removed
