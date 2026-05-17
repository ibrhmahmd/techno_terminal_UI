# Feature Specification: Groups Page Audit & Fixes

**Feature Branch**: `010-groups-page-audit`  
**Created**: 2026-05-17  
**Status**: Draft  
**Input**: User description: "open a new spec that focuses on the groups page related logic and implementation that will look through it identifying any potential bugs and errors, inconsistincies, constitution violations and frontend best bractices violations"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Eliminate Runtime Bugs and Logic Errors (Priority: P1)

A staff member uses the Groups page and its detail views without encountering incorrect data display, broken functionality, or unexpected behavior caused by logic errors in the existing code.

**Why this priority**: Bugs directly impact user experience and data integrity. Incorrect status labels, bitwise operators instead of nullish coalescing, and stub functionality undermine trust in the system.

**Independent Test**: Load the Groups page and Group Detail page — verify all group statuses display correctly, student counts render accurately, schedule times format consistently, and all CRUD actions (view, edit, delete, drop student) function as intended without console errors.

**Acceptance Scenarios**:

1. **Given** a group with `status: 'inactive'`, **When** viewed in table or card view, **Then** the status displays as "Inactive" (not "Archived")
2. **Given** a group with `current_student_count: 0`, **When** viewed on the detail page, **Then** the count displays as `0` (not undefined or incorrect value)
3. **Given** a group with no schedule time set, **When** viewed anywhere in the UI, **Then** the time displays consistently as `--:--` (not empty string)
4. **Given** a staff member clicks "Drop Student" in the Students tab, **Then** a proper confirmation dialog appears (not native `confirm()`), and confirming removes the student
5. **Given** a staff member navigates back from Group Detail, **Then** client-side navigation is used (no full page reload)

---

### User Story 2 — Remove Dead Code and Unused Components (Priority: P2)

A developer maintains the Groups feature and finds no unused components, hooks, or exports cluttering the codebase.

**Why this priority**: Dead code increases bundle size, confuses developers, and creates maintenance burden. Removing it improves code clarity and reduces cognitive load.

**Independent Test**: Run a search for unused components and hooks — verify all listed dead code items (`RosterTab`, `RosterPlaceholder`, `HistoryPlaceholder`, `ProgressSection`, `GroupPricingCard`, `AddSessionModal`, `SessionsList`, `useGroupLevels`, `useRecentGroups`, `useStudentsGrouped`, `GroupsTable.tsx`) are either removed or integrated into the active codebase.

**Acceptance Scenarios**:

1. **Given** the codebase is scanned for unused group components, **When** the audit is complete, **Then** zero unused component files remain in `src/components/groups/`
2. **Given** the codebase is scanned for unused hooks, **When** the audit is complete, **Then** zero unused hook files remain in `src/hooks/` related to groups
3. **Given** a developer searches for `GroupsTable.tsx`, **When** they find it, **Then** it is either removed or actively used (not duplicated by `DataTable` + `groupColumns`)

---

### User Story 3 — Enforce TypeScript Strict Mode and Code Quality (Priority: P2)

A developer works on the Groups feature and encounters zero `any` types, zero `console.*` statements in production code, and consistent export patterns across all files.

**Why this priority**: `any` types bypass TypeScript's safety net, `console.*` statements leak debug output to production, and inconsistent exports (named + default) create confusion about import conventions.

**Independent Test**: Run `npm run lint` and `npm run build` — verify zero `any` types in groups-related code, zero `console.log`/`console.error` statements, and consistent named-only exports across all group components.

**Acceptance Scenarios**:

1. **Given** the build runs, **When** TypeScript compiles groups-related code, **Then** zero `any` type usages exist (replaced with proper types)
2. **Given** the Groups feature is loaded in production, **When** the browser console is open, **Then** no `console.log` or `console.error` output appears from groups components or hooks
3. **Given** a developer imports from any group component, **When** they check the export style, **Then** only named exports are used (no redundant `export default`)

---

### User Story 4 — Standardize Data Fetching and Cache Patterns (Priority: P3)

A developer extends the Groups feature and finds all data fetching follows the established React Query pattern with centralized query keys and consistent `staleTime` values.

**Why this priority**: Mixed data fetching patterns (React Query + manual `useEffect`/`useState`) create inconsistency, duplicate caching logic, and make invalidation harder to reason about.

**Independent Test**: Review all group-related hooks — verify each uses React Query (`useQuery`/`useMutation`) instead of manual `useEffect` fetches, query keys use the centralized `queryKeys` factory, and `staleTime` values follow the documented conventions.

**Acceptance Scenarios**:

1. **Given** a group-related hook is reviewed, **When** its data fetching is examined, **Then** it uses React Query (`useQuery`/`useMutation`) — not manual `useEffect` + `useState` + `fetch`
2. **Given** a query key is defined in a group hook, **When** it is checked, **Then** it uses the centralized `queryKeys` factory from `src/hooks/queryKeys.ts`
3. **Given** a group query's `staleTime` is reviewed, **When** compared to AGENTS.md conventions, **Then** it matches the documented standard (5 min default, 10 min for flat groups list)

---

### User Story 5 — Improve Accessibility and UX Polish (Priority: P3)

A staff member using assistive technology can navigate the Groups page, interact with tabs and toggles, and understand all UI elements without visual cues.

**Why this priority**: Missing ARIA attributes and keyboard navigation exclude users who rely on screen readers and keyboard-only navigation, creating accessibility compliance gaps.

**Independent Test**: Navigate the Groups page using only keyboard tab/arrow keys — verify all interactive elements (view toggle, group-by selector, category tabs, detail page tabs) are focusable and operable. Run a screen reader — verify all icons, buttons, and inputs have accessible labels.

**Acceptance Scenarios**:

1. **Given** a keyboard-only user navigates the Groups page, **When** they reach the view toggle, **Then** they can switch between table and card views using keyboard
2. **Given** a screen reader user encounters a Material Symbols icon, **When** the icon is rendered, **Then** it is marked `aria-hidden="true"` (not read aloud)
3. **Given** a user interacts with the GroupBySelector or GroupCategoryTabs, **When** they focus a tab button, **Then** `aria-pressed` or `aria-selected` reflects the active state
4. **Given** a user focuses the search input in GroupsHeader, **When** the screen reader announces it, **Then** an `aria-label` describes its purpose

---

### Edge Cases

- What happens when a group has no instructor assigned? Should display "Unassigned" consistently across all views (table, card, detail)
- How does the detail page handle an invalid group ID in the URL (e.g., `/groups/abc`)? Should show an error state, not attempt a fetch with `id: 0`
- What happens when the notes field in GroupInfoCard is edited rapidly? Should debounce API calls to prevent excessive requests
- How does the edit dialog handle time input format? Should normalize to `HH:MM:00` format consistently (not `H:MM:00`)
- What happens when the attendance tab loads with hardcoded `gender: 'male'`? Should either omit gender or fetch it from the API

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display group status labels correctly — `active` → "Active", `inactive` → "Inactive", `archived` → "Archived", `completed` → "Completed" — consistently across table view, card view, and detail page
- **FR-002**: System MUST use nullish coalescing (`??`) instead of bitwise OR (`|`) for default value fallbacks on numeric fields
- **FR-003**: System MUST display schedule times consistently as `--:--` when no time is set, across all views (table, card, detail, columns)
- **FR-004**: System MUST use client-side navigation (`navigate()`) for all intra-app routing — no `window.location.href` full page reloads
- **FR-005**: System MUST use a custom confirmation dialog (not native `confirm()`) for destructive actions like dropping a student from a group
- **FR-006**: System MUST debounce notes field changes in GroupInfoCard to prevent excessive API calls (minimum 300ms delay)
- **FR-007**: System MUST normalize time input in edit dialogs to `HH:MM:00` format (zero-padded hours)
- **FR-008**: System MUST remove all unused component files, hook files, and exports from the groups feature
- **FR-009**: System MUST use zero `any` types in groups-related TypeScript code — all variables, parameters, and catch clauses must have proper types
- **FR-010**: System MUST produce zero `console.log` or `console.error` output in production builds from groups components and hooks
- **FR-011**: System MUST use only named exports for all group components — no redundant `export default` statements
- **FR-012**: System MUST use React Query (`useQuery`/`useMutation`) for all group-related data fetching — no manual `useEffect` + `useState` fetch patterns
- **FR-013**: System MUST use the centralized `queryKeys` factory for all group-related query keys
- **FR-014**: System MUST mark all Material Symbols icons with `aria-hidden="true"` to prevent screen readers from reading icon ligatures
- **FR-015**: System MUST provide `aria-label` or `aria-pressed`/`aria-selected` attributes on all interactive tab-like controls (ViewToggle, GroupBySelector, GroupCategoryTabs, TabNavigation, LevelSelector)
- **FR-016**: System MUST validate the group ID parameter on the detail page before attempting to fetch — show error state for invalid IDs
- **FR-017**: System MUST share employee/instructor fetching logic between GroupForm and EditGroupDialog — no duplicated pagination loops
- **FR-018**: System MUST fetch group competitions in batch (not one API call per group) to avoid N+1 request patterns

### Key Entities

- **Group**: Core entity with fields `group_name`, `course_name`, `instructor_name`, `status`, `default_day`, `default_time_start`, `default_time_end`, `current_student_count`, `max_capacity`
- **GroupDetail**: Extended group data including levels, enrollments, payments, attendance, and competition history
- **GroupStatus**: Enum-like value with four valid states: `active`, `inactive`, `archived`, `completed`
- **ScheduleTime**: Time string in `HH:MM:SS` format, displayed as `HH:MM` (first 5 characters)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero runtime bugs identified in the audit are present after fixes — verified by manual testing of all acceptance scenarios
- **SC-002**: Zero `any` type usages remain in groups-related source files — verified by `grep -r ': any' src/components/groups/ src/pages/GroupsPage.tsx src/pages/GroupDetailPage.tsx src/hooks/useGroup*.ts`
- **SC-003**: Zero `console.log` or `console.error` statements remain in production groups code — verified by `grep -r 'console\.' src/components/groups/ src/hooks/useGroup*.ts` (excluding test files)
- **SC-004**: All 7 dead component files and 3 dead hook files are removed — verified by file existence check
- **SC-005**: `npm run build` (`tsc -b && vite build`) passes with zero errors and zero warnings related to groups code
- **SC-006**: `npm run lint` passes with zero errors and zero warnings related to groups code
- **SC-007**: All group-related hooks use React Query — verified by absence of `useEffect` + `fetch`/`axios` patterns in group hooks
- **SC-008**: All interactive controls have proper ARIA attributes — verified by accessibility audit (manual or automated tool)
- **SC-009**: Notes field API calls are debounced — verified by network tab showing ≤1 request per 300ms during rapid typing
- **SC-010**: Group Detail page navigation uses client-side routing — verified by network tab showing no full page reload on back navigation

## Assumptions

- The existing API endpoints remain unchanged — all fixes are frontend-only
- The `EnrichedGroupPublic` type definition is the source of truth for group data shape
- The AGENTS.md constitution (TypeScript strict mode, React Query patterns, component naming conventions) is the standard to enforce
- Removing dead code will not break any external consumers (no other features import the unused components/hooks)
- The `DataTable` + `groupColumns` pattern is the preferred table implementation — `GroupsTable.tsx` is redundant and safe to remove
- The `ConfirmDialog` component from `src/components/common/` is the standard for confirmation prompts
- Backend API for fetching competitions does not support batch requests — the N+1 fix must be implemented client-side (e.g., parallel requests with `Promise.all` is acceptable if no batch endpoint exists)
