# Data Model: Competitions & Team Management Feature Complete

## Overview

This feature bridges the gap between backend API capabilities and frontend UI coverage for competitions and team management. **No new entities or API endpoints are required** — all changes are frontend-only additions to expose existing backend fields.

## Existing Entities

### Competition
- **Type at**: `src/api/competitions/types.ts`
- **Fields**: `id`, `name`, `edition?`, `edition_year?`, `competition_date?`, `location`, `notes?`, `fee_per_student`, `created_at`
- **Notes**: Two duplicate type blocks exist in the file (lines 18-36 and 71-89) that must be consolidated.

### Team
- **Type at**: `src/api/teams/types.ts` (definitive); `src/api/competitions/types.ts` (re-exported duplicates)
- **Fields**: `id`, `competition_id`, `team_name`, `category`, `subcategory?`, `group_id?`, `coach_id?`, `project_name?`, `project_description?`, `placement_rank?`, `placement_label?`, `notes?`, `created_at`
- **Gap**: `coach_id` is never set or displayed in the UI. In the UI, this is referred to as "instructor" (backend field name stays `coach_id`).

### Team Member
- **Type at**: `src/api/teams/types.ts`
- **Fields**: `id`, `team_id`, `student_id`, `amount_due`, `amount_paid`
- **Gap**: Payment status derived from `amount_due` vs `amount_paid` is only visible on team detail page, not in category/team list views

### Team Registration Input
- **Type at**: `src/api/teams/types.ts` (`RegisterTeamInput`)
- **Fields**: `competition_id`, `team_name`, `category`, `subcategory?`, `project_name?`, `project_description?`, `student_ids[]`, `student_fees?`, `coach_id?`, `group_id?`, `notes?`
- **Gap**: `coach_id` (instructor in UI) not exposed; group mode sends `student_ids: []` instead of omitting it

### UpdateTeamInput
- **Type at**: `src/api/teams/types.ts`
- **Fields**: `team_name?`, `category?`, `subcategory?`, `project_name?`, `project_description?`, `group_id?`, `coach_id?`, `notes?`
- **Gap**: No UI to call `PATCH /teams/{id}` despite the hook existing

### Payment Input
- **Type at**: `src/api/teams/types.ts` (`PayCompetitionFeeInput`)
- **Fields**: `amount`, `parent_id?`
- **Gap**: `parent_id` not exposed in the pay fee modal

## New Components Needed

### TeamEditModal
- **Path**: `src/components/teams/TeamEditModal.tsx`
- **Input**: `teamId`, `initialData: UpdateTeamInput`, `isOpen`, `onClose`, `onSubmit`
- **Fields**: team_name, category, subcategory, project_name, project_description, instructor (mapped to `coach_id`), notes
- **Validation**: team_name required, category required
- **UX**: Modal on team detail page, inline error banner on failure

### InstructorCombobox
- **Path**: `src/components/common/combobox/InstructorCombobox.tsx`
- **Input**: `value`, `onChange`, matching `GroupCombobox` pattern
- **Data source**: `getEmployees` from `src/api/hr/employees.ts` via `useEmployees` hook
- **UX**: SpyCombobox-based searchable combobox, term "instructor" throughout UI
- **Backend mapping**: Field is `coach_id` on the API, mapped as "instructor" in the UI

### ParentCombobox
- **Path**: `src/components/common/ParentCombobox.tsx`
- **Input**: `value`, `onChange`, matching `StudentMultiSelector` search pattern
- **Data source**: `searchParents` from `src/api/crm/parents/search.ts`

## State Transitions

- Team Edit: Existing team → Open edit modal → Modify fields → `PATCH /teams/{id}` → Invalidate `['teams', id]` → Close modal
- Instructor Assignment: Registration/Edit → Select instructor → Include `coach_id` in payload → Display instructor name on team detail
- Payment with Parent: Open pay modal → (optional) Select parent → Include `parent_id` in payload → Submit payment
