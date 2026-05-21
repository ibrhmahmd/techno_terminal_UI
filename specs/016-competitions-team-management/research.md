# Research: Competitions & Team Management Feature Complete

## API Gap Analysis

### Backend Endpoints vs UI Coverage

| Endpoint | UI Coverage | Status |
|----------|-------------|--------|
| `GET /competitions` | `CompetitionsPage` — list | ✅ Covered |
| `POST /competitions` | `CompetitionForm` create | ✅ Covered |
| `GET /competitions/{id}` | `CompetitionDetailPage` | ✅ Covered |
| `PATCH /competitions/{id}` | `CompetitionEditPage` | ✅ Covered |
| `DELETE /competitions/{id}` | Header + list level, 409 handled | ✅ Covered |
| `GET /competitions/{id}/categories` | Categories tab via `useCompetitionCategories` | ✅ Covered |
| `GET /competitions/{id}/summary` | Overview + Summary tabs | ✅ Covered |
| `GET /teams?competition_id` | Teams tab via `useTeams` | ✅ Covered |
| `GET /teams?include_members=true` | `useTeamsWithMembers` hook exists but **never called** | ❌ Dead code |
| `POST /teams` | `TeamRegistrationModal` | ✅ Covered |
| `GET /teams/{id}` | `TeamDetailPage` | ✅ Covered |
| `PATCH /teams/{id}` | `useTeam.update` exists but **no UI** | ❌ Missing feature |
| `DELETE /teams/{id}` | `TeamDetailPage` with 409 handling | ✅ Covered |
| `GET /teams/{id}/members` | `TeamDetailPage` member list | ✅ Covered |
| `POST /teams/{id}/members` | `TeamDetailPage` add member modal | ✅ Covered |
| `DELETE /teams/{id}/members/{student_id}` | `TeamDetailPage` remove member | ✅ Covered |
| `POST /teams/{id}/members/{student_id}/pay` | `TeamDetailPage` pay fee modal | ✅ Covered (no parent selector) |
| `PATCH /teams/{id}/placement` | `TeamDetailPage` placement form | ✅ Covered |

### Type Fields Not Exposed in UI

| Type | Field | Where Missed |
|------|-------|-------------|
| `RegisterTeamInput` / `TeamDTO` | `coach_id` (UI: instructor) | Team registration modal + team detail/edit |
| `PayCompetitionFeeInput` | `parent_id` | Pay fee modal |
| `UpdateTeamInput` | All fields | No edit UI exists |
| `TeamDTO` | `placement_rank` | Teams tab list cards |
| `TeamDTO` | `placement_label` | Teams tab list cards |
| `TeamMemberDTO` | `amount_paid`, `amount_due` | CategoryTeamsModal |

## File Inventory

### Files to Modify
- `src/components/competitions/TeamRegistrationModal.tsx` — add coach selector
- `src/components/competitions/TeamRegistrationModal.tsx` — fix group mode payload (omit `student_ids` when `group_id` set)
- `src/components/teams/` — team edit form/modal (new or in TeamDetailPage)
- `src/components/teams/TeamDetailPage.tsx` — add edit button + coach display + parent selector in pay modal
- `src/pages/CompetitionDetailPage.tsx` — add placement/fee status to Teams tab list
- `src/components/competitions/CategoryTeamsModal.tsx` — add fee status column
- `src/api/competitions/types.ts` — remove duplicate type definitions

### Files to Delete/Simplify
- `src/hooks/teams/useTeams.ts` — remove `useTeamsWithMembers` export + `getTeamsWithMembers` if unused
- `src/api/teams/teams.ts` — consider removing `getTeamsWithMembers` if unused

### Files to Update (Barrel)
- `src/components/competitions/index.ts` — add missing exports

### Files to Create
- `src/components/common/combobox/InstructorCombobox.tsx` — SpyCombobox-based searchable instructor selector
- `src/components/common/ParentCombobox.tsx` — searchable parent selector (SpyCombobox-based)
- `src/components/teams/TeamEditModal.tsx`
- `src/tests/CompetitionDetailPage.test.tsx`
- `src/tests/TeamRegistrationModal.test.tsx`
- `src/tests/CategoryList.test.tsx`

## Existing Components That Can Be Reused

- **Instructor selector**: SpyCombobox-based, powered by `getEmployees` from `src/api/hr/employees.ts`. Existing `useEmployees` hook provides cached (5 min staleTime) data.
- **Parent selector**: Reuse `searchParents` pattern from `src/api/crm/parents/search.ts` — SpyCombobox-based matching `StudentMultiSelector` pattern. Check `searchParents` function signature.
- **Edit modal**: Pattern from `CategoryTeamsModal` or other edit modals in the codebase (e.g., `CompetitionForm`)
- **Placement badge**: Reuse `GroupStatusBadge` pattern for placement display

## Key Design Decisions (from Clarifications)

- **Terminology**: Use "instructor" throughout the UI (backend field is `coach_id`)
- **Instructor UX**: SpyCombobox-based searchable combobox (like `GroupCombobox`), not a plain `<select>`
- **Team edit UX**: Modal on team detail page, not a separate route
- **Error handling**: Inline error banner matching `TeamRegistrationModal` pattern; no concurrent-edit detection
- **Team list cards**: Placement rank badge + member count + "X of Y paid" fee summary
- **Out of scope**: Bulk operations, student competition history, coach CRUD, competition edition_year field, parent CRUD
