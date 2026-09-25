# Feature Specification: Competitions & Team Management Feature Complete

**Feature Branch**: `016-competitions-team-management`
**Created**: 2026-05-19
**Status**: Draft
**Input**: Manual UI/UX audit of CompetitionDetailPage and team management features against backend API capabilities.

## Clarifications

### Session 2026-05-19
- Q: What is explicitly out of scope? → A: Exclude bulk operations (batch placement, multi-delete, bulk pay), student competition history UI (backend stubbed), and coach CRUD management (separate feature). Keep focused on individual team management gaps.
- Q: Team edit UX pattern — modal or separate page? → A: Modal on the team detail page, matching existing patterns (CategoryTeamsModal, TeamRegistrationModal).
- Q: Instructor (coach) selector UX and data source? → A: Use SpyCombobox-based searchable combobox (following GroupCombobox pattern), powered by `getEmployees` from `src/api/hr/employees.ts`. Use term "instructor" not "coach".
- Q: Error handling strategy for team edit modal? → A: Inline error banner (matches TeamRegistrationModal pattern). No concurrent-edit detection — backend uses last-write-wins.
- Q: What data to show in team list cards for placement/fee status? → A: Placement rank badge + member count + "X of Y paid" fee summary.

## Out of Scope

The following are explicitly excluded from this feature:
- Bulk operations: batch placement updates, multi-delete teams, bulk fee payments
- Student competition history UI (`GET /students/{id}/competitions` and `GET /students/{id}/teams` — backend stubbed)
- Coach CRUD management (creating/editing/deactivating coaches)
- Edit competition edition_year field in CompetitionForm (not user-facing critical)
- Parent CRUD management (creating/editing parents)

## User Scenarios & Testing

### User Story 1 — Edit Team After Registration (Priority: P1)

As an admin who registered a team, I can edit the team's name, category, subcategory, project info, instructor, and notes after creation so I don't need to delete and re-create the team when details change.

**Why this priority**: The backend supports `PATCH /teams/{id}` with `UpdateTeamInput` and the `useTeam` hook exposes `update`, but there is zero UI to edit a team. Users are forced to delete and re-register, which loses placement, member payments, and history.

**Independent Test**: Navigate to `/teams/:id`, click "Edit Team" button, edit modal opens pre-filled with current data, modify fields, save, verify the page reflects changes.

**UX Pattern**: Edit is a **modal** on the team detail page (not a separate page), matching existing patterns like `CategoryTeamsModal` and `TeamRegistrationModal`.

**Acceptance Scenarios**:

1. **Given** a team exists, **When** I click "Edit" on the team detail page, **Then** a modal opens pre-filled with current team data
2. **Given** the edit modal is open, **When** I change the team name and category, **Then** the form validates and submits correctly
3. **Given** the edit modal is open, **When** I clear a required field and submit, **Then** a validation error is shown
4. **Given** the edit succeeds, **When** the API responds, **Then** the team detail page updates to show the new values without page reload, and the modal closes

---

### User Story 2 — Instructor Assignment (Priority: P2)

As an admin registering or editing a team, I can assign an instructor to the team using a searchable instructor selector so the team knows who is responsible for mentoring.

**Why this priority**: `RegisterTeamInput` and `TeamDTO` already support `instructor_id` (backend field is `coach_id` but mapped as instructor in the UI), and instructors are managed in the HR system. The gap means instructors cannot be associated with teams through the UI, limiting reporting and accountability.

**UX Pattern**: Searchable `SpyCombobox`-based instructor selector (following `GroupCombobox` pattern), powered by `getEmployees` from `src/api/hr/employees.ts`. Uses the term "Instructor" throughout the UI.

**Independent Test**: Open the team registration modal, search and select an instructor from the combobox, submit, verify the instructor appears on the team detail page.

**Acceptance Scenarios**:

1. **Given** the team registration modal is open, **When** I type in the instructor search field, **Then** matching employees appear in the combobox
2. **Given** I select an instructor, **When** the team is created, **Then** the instructor name appears on the team detail page
3. **Given** the team edit modal is open, **When** I change the instructor, **Then** the update saves correctly and the detail page reflects the change
4. **Given** the instructor field is optional, **When** I submit without selecting an instructor, **Then** the team is created without `instructor_id`

---

### User Story 3 — Payment Parent Association (Priority: P2)

As an admin processing a competition fee payment, I can optionally select a parent to associate with the payment so financial records are complete.

**Why this priority**: `PayCompetitionFeeInput.parent_id` exists in the API but the pay modal has no parent selector. This limits financial tracking and receipt generation.

**Independent Test**: Open the pay fee modal on a team member, select a parent, submit, verify the payment succeeds.

**Acceptance Scenarios**:

1. **Given** the pay fee modal is open, **When** I see the payment form, **Then** there is an optional parent selector
2. **Given** I select a parent, **When** I submit payment, **Then** the parent_id is included in the API call
3. **Given** I do not select a parent, **When** I submit payment, **Then** the payment succeeds without parent_id

---

### User Story 4 — Placement & Fee Status in Team Lists (Priority: P3)

As an admin viewing teams, I can see placement ranks, member counts, and fee payment status in the team list and category views so I don't have to open each team individually.

**Why this priority**: The Teams tab and CategoryTeamsModal only show team name and category/member count. `TeamDTO.placement_rank` and `TeamMemberDTO.amount_paid` are available from the API but not surfaced.

**Independent Test**: Navigate to the Teams tab of a competition, verify placement ranks, member count, and fee summary are visible in the list.

**UI Details**: Team cards in the Teams tab show: team name, category, placement rank badge (when set), member count, and "X of Y paid" fee summary. CategoryTeamsModal similarly shows member count + fee summary per team.

**Acceptance Scenarios**:

1. **Given** teams have placement ranks, **When** viewing the Teams tab, **Then** each team card shows its placement rank badge
2. **Given** teams have members with fee data, **When** viewing the Teams tab, **Then** each team card shows "X of Y paid"
3. **Given** teams have members, **When** viewing the CategoryTeamsModal, **Then** member count and "X of Y paid" are visible per team
4. **Given** a team has no placement, **When** viewing the list, **Then** no rank badge is shown

---

### User Story 5 — Code Quality: Remove Duplicate Types (Priority: P3)

As a developer, I can rely on a single source of truth for Competition and Team types so the codebase remains maintainable and type-safe.

**Why this priority**: `src/api/competitions/types.ts` defines `CreateCompetitionInput`, `UpdateCompetitionInput`, `CategoryWithTeamsDTO`, `CompetitionSummaryResponse`, and `CategoryResponse` twice each (lines 18-36 and 71-89). This causes confusion and potential drift.

**Independent Test**: Run `tsc -b` and verify zero type errors after deduplication.

**Acceptance Scenarios**:

1. **Given** the duplicate type blocks exist, **When** the second block is removed, **Then** all imports remain valid and the build passes
2. **Given** types are deduplicated, **When** a developer adds a new field, **Then** they only need to edit one location

---

### User Story 6 — Code Quality: Complete Barrel Exports & Remove Dead Props (Priority: P3)

As a developer, I can import any competition component through the barrel file and trust that component props match actual usage.

**Why this priority**: `src/components/competitions/index.ts` only exports `CompetitionsTable`, missing 5 components. `CompetitionsTable` has `onRestore` and `actionLabels` props that are never used (restore is not supported per spec 012).

**Independent Test**: Verify imports work and no TypeScript errors occur after changes.

**Acceptance Scenarios**:

1. **Given** the barrel file, **When** I import `CompetitionForm`, **Then** the import resolves correctly
2. **Given** the barrel file, **When** I import `TeamRegistrationModal`, **Then** the import resolves correctly
3. **Given** `CompetitionsTable` has unused props, **When** they are removed, **Then** all consumers compile without errors

---

### User Story 7 — Clean Up Dead Code: `useTeamsWithMembers` (Priority: P3)

As a developer, I expect unused code to be removed so the codebase stays clean and search results are relevant.

**Why this priority**: `useTeamsWithMembers` hook exists at `src/hooks/teams/useTeams.ts` but is never called anywhere. Its API counterpart `getTeamsWithMembers` is used nowhere.

**Independent Test**: After removal, run `tsc -b && vite build` and verify zero errors.

**Acceptance Scenarios**:

1. **Given** `useTeamsWithMembers` exists, **When** it is removed, **Then** no import errors occur
2. **Given** `getTeamsWithMembers` depends on the same file, **When** the function is removed, **Then** no consumers are affected

---

### User Story 8 — Fix `registerTeam` Payload for Group Mode (Priority: P3)

As an admin registering a team from a group, I expect only `group_id` to be sent in the API request (not `student_ids: []`), matching the backend's expected contract.

**Why this priority**: The current implementation in `TeamRegistrationModal.tsx` sends `student_ids: []` alongside `group_id`. While the backend may handle this gracefully, it is semantically incorrect and could cause issues if the backend validates both fields.

**Independent Test**: Register a team using "From Group" mode, inspect the network request, verify `student_ids` is not present.

**Acceptance Scenarios**:

1. **Given** I select "From Group" mode, **When** I submit the form, **Then** the API payload contains `group_id` and does NOT contain `student_ids`
2. **Given** I select "Select Students" mode, **When** I submit the form, **Then** the API payload contains `student_ids` and does NOT contain `group_id`

---

### User Story 9 — Add Test Coverage for Competitions/Teams (Priority: P4)

As a developer, I can run tests for competitions and team components with confidence that core flows are covered.

**Why this priority**: Zero test files exist for competitions or teams (`src/tests/*competition*` and `src/tests/*team*` both return empty). This creates risk for regressions.

**Independent Test**: Run `npm run test` and verify new competition/team tests pass.

**Acceptance Scenarios**:

1. **Given** the team registration modal, **When** rendered with valid props, **Then** it displays all required form fields
2. **Given** the team registration modal, **When** submitted without a team name, **Then** a validation error appears
3. **Given** the CategoryList component, **When** rendered with categories, **Then** each category card is displayed
