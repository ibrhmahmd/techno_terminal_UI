# Feature Specification: Competitions Feature Audit & Fix (Phase 3)

**Feature Branch**: `024-competitions-audit`
**Created**: 2026-05-24
**Status**: Draft
**Input**: Comprehensive 6-phase audit (runtime bugs, dead code, TypeScript violations, data fetching anti-patterns, accessibility gaps, API coverage gaps) of the competitions feature post-spec-016/017 changes.

## User Scenarios & Testing

### User Story 1 — Fix Runtime Bugs (Priority: P1)

As a user viewing competition details and teams, I want the application to not crash on null API responses and to properly handle all user input without silent failures.

**Why this priority**: These are active crash and data-loss bugs. The null crash on competition summary blocks the entire detail page. Silent error swallowing on team registration means users think they registered when they didn't.

**Independent Test**: Navigate to a competition whose API returns `summary: null`, then register a team — verify no crash and error feedback.

**Acceptance Scenarios**:

1. **Given** a competition whose `/summary` endpoint returns `null` for `data`, **When** I navigate to the competition detail page, **Then** the Overview tab renders gracefully without a TypeError crash.
2. **Given** I am on the Team Detail page and I type in the parent search field, **When** the input changes within 300ms, **Then** only one API call is made (debounced), not one per keystroke.
3. **Given** a team registration fails on the server (e.g., 400 or 500), **When** I submit the registration form, **Then** the error is propagated to the UI with a user-visible message instead of being silently swallowed.
4. **Given** I register a team with category_id=0 or an empty string, **When** the form submits, **Then** the API receives a valid numeric ID or the request is rejected before sending.

---

### User Story 2 — Fix Cache Invalidation Gaps (Priority: P1)

As a user performing CRUD operations on competitions and teams, I want the UI to reflect my changes immediately after saving, without requiring a manual page refresh.

**Why this priority**: Stale data after mutations is a critical UX failure — users see outdated teams, missing competitions, or incorrect status after their actions.

**Independent Test**: Create a new competition, then navigate back to the list — verify it appears without manual refresh.

**Acceptance Scenarios**:

1. **Given** I create a new competition, **When** I return to the competitions list, **Then** the new competition appears without manual refresh.
2. **Given** I update a competition's details, **When** I navigate away and back, **Then** the updated details are shown.
3. **Given** I delete a competition, **When** I return to the competitions list, **Then** the deleted competition is no longer listed.
4. **Given** I add or remove a team member, **When** I view the team detail, **Then** the member list reflects the change.
5. **Given** I update a team's placement or fee payment, **When** I view the team detail, **Then** the updated data is shown.
6. **Given** I register a new team, **When** I view the competition's teams tab, **Then** the new team appears without manual refresh.

---

### User Story 3 — Remove Dead Code (Priority: P2)

As a developer maintaining the competitions feature, I want all unused API functions, hooks, types, and components removed so the codebase is easier to navigate and understand.

**Why this priority**: Dead code clutters the codebase, creates false signals for grep searches, and increases the surface area for bugs during refactoring.

**Independent Test**: After removal, `tsc -b && vite build` passes with zero errors and no dead exports remain.

**Acceptance Scenarios**:

1. **Given** the `getTeamsWithMembers` API function exists in `src/api/teams/teams.ts`, **When** the codebase is inspected, **Then** either it has at least one consumer or it is removed.
2. **Given** `CategoryList` component exists, **When** the codebase is inspected, **Then** it is either consumed by another component or removed.
3. **Given** `getCompetitionFeeSummary` API function exists in `src/api/analytics/competition.ts`, **When** the codebase is inspected, **Then** it either has a frontend consumer or is removed.
4. **Given** `useCompetitionFees` and `useCompetitionHistory` hooks exist, **When** the codebase is inspected, **Then** each is either consumed or removed.
5. **Given** `getRecentActivities` and `searchActivities` API functions exist, **When** the codebase is inspected, **Then** each is either consumed or removed.
6. **Given** the `.update` mutation exists on the `useCompetition()` hook, **When** the codebase is inspected, **Then** it is either used by `CompetitionEditPage` or removed.
7. **Given** student enrollment stubs (`getStudentCompetitions`, `getStudentTeams`, `getStudentCourses`) exist, **When** the codebase is inspected, **Then** they either return real data or are removed.

---

### User Story 4 — Consume Unused API Endpoints (Priority: P2)

As a user, I want the analytics data (fee summary) to be visible on the competition detail page, and I want the student profile to show their actual competition/team participation data instead of empty sections.

**Why this priority**: The analytics API already exists on the backend but has no UI. Student profiles show blank sections for competitions/teams despite data being available.

**Independent Test**: Navigate to a student's profile and verify their teams appear; view a competition and see the fee summary.

**Acceptance Scenarios**:

1. **Given** a competition with registered teams and payments, **When** I view the competition detail, **Then** a fee summary section shows total fees, collected, and outstanding amounts.
2. **Given** a student with active teams, **When** I view their profile's Competitions or Teams tab, **Then** their actual data is shown instead of an empty section.
3. **Given** I edit a competition, **When** I save changes via the edit page, **Then** the `.update` mutation from `useCompetition()` is used (with proper cache invalidation) instead of a direct API call.
4. **Given** a `CompetitionFeeSummary` of zero fees, **When** the fee summary section renders on the competition detail, **Then** it shows a graceful empty state (e.g., "No fee data available") instead of zero-only stats.

---

### User Story 5 — Fix TypeScript Violations (Priority: P2)

As a developer, I want zero unsafe type casts, zero inline query key definitions, and zero unsafe type assertions in the competitions feature so the TypeScript compiler can catch real bugs.

**Why this priority**: Unsafe `as` casts defeat TypeScript's purpose. Inline query keys risk cache collisions. These violations accumulate and erode trust in the type system.

**Independent Test**: After fixes, `tsc -b` produces zero errors and zero warnings across all competition-related files.

**Acceptance Scenarios**:

1. **Given** `localStorage.getItem('teamsGroupBy')` returns a string, **When** it is used in `TeamsTab.tsx` and `TeamGroupBySelector.tsx`, **Then** the value is validated against the allowed `TeamGroupByField` union before use (no raw `as` cast).
2. **Given** `TeamRegistrationModal` constructs a payload from form state, **When** it submits, **Then** the payload is validated against `RegisterTeamInput` before the cast.
3. **Given** `groupTeams.ts` mutates grouped results, **When** it assigns to an aggregation object, **Then** no unsafe `as TeamGroup` cast is used.
4. **Given** `TeamsTab.tsx` destructures grouped team data, **When** accessing subgroups, **Then** the type is properly narrowed without inline `as { subgroups }` casts.
5. **Given** a competition/team page uses tab IDs, **When** mapping tabs, **Then** the type is properly specified without unsafe casts.
6. **Given** `CompetitionsPage` receives form data, **When** passing to `createCompetition`, **Then** the data shape is validated before the `as CreateCompetitionInput` cast.
7. **Given** `CompetitionEditPage` receives form data, **When** passing to `updateCompetition`, **Then** the data shape is validated before the `as UpdateCompetitionInput` cast.
8. **Given** the student's TeamsTab or CompetitionsTab uses query keys, **When** defining the key, **Then** the centralized `queryKeys` factory from `src/hooks/queryKeys.ts` is used instead of inline array literals.

---

### User Story 6 — UX/Accessibility Gap Fixes (Priority: P3)

As a user relying on assistive technology or keyboard navigation, I want loading indicators, error boundaries, and icons to be properly accessible.

**Why this priority**: Missing ARIA attributes and error boundaries create barriers for users with disabilities and cause silent UI failures.

**Independent Test**: Navigate the competition pages with a screen reader and verify loading states are announced, custom icons are hidden from screen readers, and errors in one tab don't crash the whole page.

**Acceptance Scenarios**:

1. **Given** a loading spinner is shown on any competition-related page, **When** a screen reader encounters it, **Then** the spinner has `role="status"` and `aria-live="polite"` so the loading state is announced.
2. **Given** the student profile's CompetitionsTab or TeamsTab encounters an error, **When** the tab renders, **Then** the error is caught by an ErrorBoundary and shown inline rather than crashing the entire student profile page.
3. **Given** the student profile's CompetitionsTab or TeamsTab is still loading data, **When** the tab renders, **Then** it shows a visible loading state (spinner/skeleton) instead of an empty section that flashes data later.
4. **Given** a Lucide icon is used decoratively in the student's TeamsTab, **When** a screen reader encounters it, **Then** the icon has `aria-hidden={true}` so it is skipped.
5. **Given** I am on the TeamDetail page parent search field, **When** a screen reader encounters it, **Then** the input has a visible label or `aria-label` describing its purpose.
6. **Given** a `parseInt` on an optional competition fee string produces `NaN`, **When** the fee value is displayed, **Then** `NaN` is never rendered — a fallback (empty string or "—") is shown instead.

## Requirements

### Functional Requirements

- **FR-001**: Competition summary data with null safety MUST not crash the Overview tab (`summary?.categories?.find(...)` safe chaining).
- **FR-002**: Parent search on TeamDetailPage MUST debounce API calls by at least 300ms.
- **FR-003**: Team registration error responses MUST be propagated to the UI — empty catch blocks are forbidden.
- **FR-004**: Team registration payload MUST validate `category_id` is a valid number before sending.
- **FR-005**: Competition creation, update, and deletion MUST invalidate the `queryKeys.competitions.all` cache.
- **FR-006**: Team member add/remove MUST invalidate the team members cache key.
- **FR-007**: Team placement and fee mutations MUST invalidate both team payments and team detail cache keys.
- **FR-008**: New team registration MUST invalidate the competition's teams list cache.
- **FR-009**: All un-awaited query invalidation promises MUST be either awaited or explicitly voided.
- **FR-010**: Dead code (functions, hooks, types, components with zero consumers) MUST be removed.
- **FR-011**: Unused API endpoints with existing backend support MUST get frontend consumers or be removed.
- **FR-012**: Student profile competition/team tabs MUST load real data via properly implemented API calls.
- **FR-013**: All `localStorage` reads with `as TeamGroupByField` MUST validate the value against the allowed union before use.
- **FR-014**: All `as RegisterTeamInput`, `as TeamGroup`, `as CreateCompetitionInput`, `as UpdateCompetitionInput` casts MUST include runtime validation or type narrowing.
- **FR-015**: Inline query keys (`['teams', ...]`, `['students', id, 'teams']`) MUST be migrated to the centralized `queryKeys` factory.
- **FR-016**: Loading spinners MUST include `role="status"` and `aria-live="polite"` attributes.
- **FR-017**: Student tabs (CompetitionsTab, TeamsTab) MUST include ErrorBoundary wrappers and explicit loading states.
- **FR-018**: Decorative Lucide icons MUST have `aria-hidden={true}`.
- **FR-019**: The `useCompetition().update` mutation MUST be wired into `CompetitionEditPage` or removed.

### Key Entities

- **Competition**: Event with categories, teams, fees, and summary data.
- **Team**: Group of students registered under a competition category with members, payments, and placement.
- **TeamCardData**: Transformed team representation used in TeamsTab cards.
- **TeamGroupByField**: Union type for group-by options (Instructor, Category, Subcategory, PaymentStatus, Placement, Alphabetical).
- **RegisterTeamInput**: API input shape for team registration.
- **CompetitionFeeSummary**: Analytics data about total/collected/outstanding fees for a competition.
- **StudentEnrollments**: Student-level data including competitions, teams, and courses.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero runtime crashes from null summary or missing competition data across all competition pages.
- **SC-002**: All mutation operations (create/update/delete competition, add/remove member, update placement/fee, register team) result in accurate cache state without manual refresh.
- **SC-003**: All dead code (functions, hooks, types, components with zero consumers) is removed — `tsc -b` passes with zero unused export warnings.
- **SC-004**: All previously unused API endpoints have frontend consumers or are removed from the API module.
- **SC-005**: Zero unsafe `as` type assertions remain in competition-related files (validated by grep for `as (TeamGroupByField|RegisterTeamInput|CreateCompetitionInput|UpdateCompetitionInput|TeamGroup)`).
- **SC-006**: Zero inline query key arrays remain in competition-related hooks — all use centralized `queryKeys` factory.
- **SC-007**: All competition/team loading spinners have `role="status"` and `aria-live="polite"`.
- **SC-008**: All student profile competition/team tabs have ErrorBoundaries and loading states.
- **SC-009**: All decorative icons in competition-related components have `aria-hidden={true}`.

## Assumptions

- All changes are frontend-only — no backend API modifications required.
- Route structure (`/competitions`, `/competitions/:id`, `/teams/:id`) remains unchanged.
- Existing authentication and role-based access control remains unchanged.
- The existing React Query cache invalidation patterns (queryClient.invalidateQueries) will be reused.
- The centralized `queryKeys` factory at `src/hooks/queryKeys.ts` is the canonical source for query key definitions — no new factories needed.
- The `StudentCombobox` component is the canonical student selector — the TeamDetailPage Add Member modal migration to it is already complete.
- The `EmptyState` component from `src/components/common/` is the canonical empty state component.
- The `ErrorBoundary` component from `src/components/common/` is the canonical error boundary component.
- Loading spinners follow the existing pattern in `LoadingSpinner.tsx` from `src/components/common/`.
- Team registration and editing modals (`TeamRegistrationModal`, `TeamEditModal`, `TeamPaymentModal`) remain architecturally unchanged — only fixing their data fetching, cache invalidation, and type safety.
- All findings are verified against the actual codebase as of 2026-05-24.

## Clarifications

### Session 2026-05-24

- Q: What about the `useCompetition().update` mutation — should we wire it to CompetitionEditPage or remove it? → A: Wire it to CompetitionEditPage with proper cache invalidation. CompetitionEditPage should use the hook instead of calling `updateCompetition()` directly from the API module.
- Q: Should `getCompetitionFeeSummary` get a UI on the competition detail page? → A: Yes — add a fee summary section to the Overview tab, below the category grid. Use a simple card showing total/collected/outstanding. If zero, show "No fee data available".
- Q: Should we implement `getStudentCompetitions` and `getStudentTeams` for real or remove them? → A: Implement them properly — query the backend endpoints (`/students/{id}/competitions` and `/students/{id}/teams`). These are valuable data for student profiles.
- Q: What about the `.update` mutation on `useCompetition` — is it dead code? → A: Yes, it was used by a previous version of CompetitionEditPage but that page now calls `updateCompetition()` directly. The mutation hook should be wired back in.
- Q: What validation should `localStorage` reads use? → A: A type guard function that checks the string against the allowed `TeamGroupByField` values. If invalid, fall back to the default ("Instructor").
