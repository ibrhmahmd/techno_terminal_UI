# Feature Specification: Groups Feature Audit & Fix

**Feature Branch**: `015-groups-audit-fix`  
**Created**: 2026-05-19  
**Status**: Draft  
**Input**: User description: "read the results of the feature review founds bugs, open a spec for it for all of it any missing finding will not be tolrated"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fix Critical Runtime Bugs (Priority: P1)

As a user navigating the groups feature, I expect all status badges, data transformations, and form submissions to work correctly without errors, incorrect mappings, or stale data.

**Why this priority**: These bugs directly impact data accuracy and user trust. Missing status mappings, broken cache invalidation, and form submission errors cause visible failures.

**Independent Test**: Can be fully tested by navigating to each affected page (Groups list, Group detail, Students tab, Attendance tab) and verifying correct behavior for each bug fix.

**Acceptance Scenarios**:

1. **Given** a group with status "archived", **When** viewing it in the groups list columns, **Then** it displays "Archived" with amber colors (not "Inactive" with slate colors)
2. **Given** a student enrolled in a group, **When** deleting that enrollment from the Students tab, **Then** the student disappears from the list immediately without page refresh
3. **Given** the GroupForm is opened in edit mode with existing schedule data, **When** switching between different groups to edit, **Then** the form fields update to reflect the currently selected group's data
4. **Given** an empty time field in EditGroupDialog, **When** saving the form, **Then** the schedule is omitted from the API request rather than sending invalid empty strings
5. **Given** a group with a price_override value, **When** opening the ProgressLevelDialog, **Then** the price override field is pre-filled with the group's actual value
6. **Given** the StudentsTab receives a new activeLevelId from parent navigation, **When** the prop changes, **Then** the tab updates its displayed data to match the new level

---

### User Story 2 - Remove Dead Code (Priority: P2)

As a developer maintaining the codebase, I expect unused components, hooks, API functions, types, and test files to be removed so the codebase remains clean and maintainable.

**Why this priority**: Dead code increases bundle size, confuses developers, and creates maintenance burden. Removing it has no user-facing risk.

**Independent Test**: Can be fully tested by verifying the application builds and runs correctly after deletion, and that no import errors occur.

**Acceptance Scenarios**:

1. **Given** the GroupsTable.test.tsx references a non-existent component, **When** running the test suite, **Then** the test file is removed and no test failures occur
2. **Given** 5 dead history components (CoursesHistoryTable, HistoryStats, EnrollmentHistoryTable, InstructorHistoryTable, GroupHeader), **When** they are deleted, **Then** the application builds and runs without errors
3. **Given** 8 dead API functions (getGroupDetails, getGroups, getGroupsPaginated, getGroupLevel, completeGroupLevel, cancelGroupLevel, getGroupEnrollmentAnalytics, deleteGroupLevel) and 4 dead types (GroupListItem, ProgressLevel, CancelLevelInput, CreateNewLevelInput), **When** they are removed, **Then** the application builds and all imports remain valid
4. **Given** the empty utils.ts file, **When** it is deleted, **Then** no import errors occur
5. **Given** the unused useGroupsByType hook, **When** it is removed, **Then** no consumers break

---

### User Story 3 - Fix TypeScript Quality Issues (Priority: P2)

As a developer, I expect the groups feature code to use proper TypeScript types without unsafe `as any` casts, ensuring type safety catches errors at compile time.

**Why this priority**: Unsafe type casts bypass TypeScript's safety net, allowing runtime errors that could have been caught during development.

**Independent Test**: Can be fully tested by running `tsc --noEmit` and verifying zero type errors, and by running `npm run lint` with zero `@typescript-eslint/no-explicit-any` warnings.

**Acceptance Scenarios**:

1. **Given** the useGroupQueries hook uses `as any` on the search status parameter, **When** the cast is replaced with a proper union type, **Then** TypeScript compiles without errors
2. **Given** GroupsPage.tsx uses `as any` on selectedGroup for the edit modal, **When** a proper type transformation is applied, **Then** the edit modal receives correctly typed data
3. **Given** useGroupMutations casts errors `as Error`, **When** a proper type guard function is used, **Then** error messages are extracted safely without type assertions

---

### User Story 4 - Fix Data Fetching & Cache Patterns (Priority: P3)

As a user, I expect the groups detail page to load quickly without unnecessary API requests, and I expect all mutations to properly refresh related data.

**Why this priority**: Unnecessary requests slow down page load and waste server resources. Incomplete cache invalidation causes stale data to persist after mutations.

**Independent Test**: Can be fully tested by monitoring network requests in browser dev tools and verifying cache behavior after mutations.

**Acceptance Scenarios**:

1. **Given** the GroupDetailPage is loaded, **When** viewing the Attendance tab, **Then** only group details, levels, sessions, and attendance data are fetched (not enrollments or payments)
2. **Given** the user switches to the Students tab, **When** the tab becomes active, **Then** enrollment data is fetched and displayed
3. **Given** the user switches to the Payments tab, **When** the tab becomes active, **Then** payment data is fetched and displayed
4. **Given** a group mutation completes (update, delete, archive, level up), **When** the mutation succeeds, **Then** all related caches (group, levels, sessions, enrollments, payments, attendance) are invalidated
5. **Given** sessions are generated for a level, **When** the generation completes, **Then** both group levels and sessions caches are invalidated

---

### User Story 5 - Improve Accessibility (Priority: P3)

As a user who relies on keyboard navigation or screen readers, I expect all interactive elements in the groups feature to be fully accessible, including dialogs, tabs, forms, and cards.

**Why this priority**: Accessibility is a legal requirement and ensures all users can use the application. Missing focus traps, keyboard navigation, and ARIA attributes exclude users with disabilities.

**Independent Test**: Can be fully tested by navigating the entire groups feature using only keyboard (Tab, Enter, Space, Arrow keys) and verifying screen reader announcements.

**Acceptance Scenarios**:

1. **Given** a dialog is opened (EditGroupDialog or ProgressLevelDialog), **When** pressing Tab, **Then** focus cycles within the dialog and cannot escape to background content
2. **Given** a dialog is closed, **When** it closes, **Then** focus returns to the element that triggered it
3. **Given** a tab navigation component (TabNavigation, GroupCategoryTabs, GroupBySelector), **When** using Arrow Left/Right keys, **Then** focus moves between tabs
4. **Given** a GroupCard has an onClick handler, **When** focusing the card with Tab, **Then** pressing Enter or Space activates the click handler
5. **Given** any Material Symbols icon span, **When** rendered, **Then** it has `aria-hidden="true"` so screen readers skip it
6. **Given** any form input (select, input, textarea), **When** rendered, **Then** it has an associated label via `htmlFor`/`id` or `aria-label`
7. **Given** the GroupForm time selects (hour, minute, period for start and end times), **When** rendered, **Then** each has a descriptive `aria-label`

---

### User Story 6 - Polish UX & Code Quality (Priority: P4)

As a user and developer, I expect consistent status icons, proper error boundaries per tab, optimized rendering, and clean code conventions.

**Why this priority**: These improvements enhance user experience and developer productivity without changing core functionality.

**Independent Test**: Can be fully tested by visual inspection of status icons, crashing individual tabs to verify ErrorBoundary isolation, and reviewing code for conventions.

**Acceptance Scenarios**:

1. **Given** a level with "active" status in LevelsTab, **When** rendered, **Then** it shows a positive/check icon (not a warning icon)
2. **Given** one tab crashes with an error, **When** the error occurs, **Then** other tabs remain functional and accessible
3. **Given** the LevelSelector component renders levels, **When** displaying level labels, **Then** the current level index is computed once (not recomputed per item)
4. **Given** the scheduleTransform utility exports scheduleToForm, **When** no consumer imports it, **Then** it is removed to reduce bundle size

---

### Edge Cases

- What happens when a group has no schedule data and the edit form is opened?
- How does the system handle rapid tab switching before data loads?
- What happens when the backend returns unexpected status values not in the enum?
- How does the attendance transform handle missing gender data from the API?
- What happens when a mutation fails mid-invalidation — is cache state consistent?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all four group statuses (active, inactive, completed, archived) with correct labels and color schemes in the groups list columns
- **FR-002**: System MUST invalidate the group enrollments cache immediately after a successful enrollment deletion
- **FR-003**: System MUST sync the StudentsTab's selected level state with parent prop changes
- **FR-004**: System MUST preserve actual gender data in attendance roster transformations instead of hardcoding 'male'
- **FR-005**: System MUST pass the group's actual price_override value to the ProgressLevelDialog
- **FR-006**: System MUST validate time fields before submission in EditGroupDialog and omit schedule when times are empty
- **FR-007**: System MUST provide a default option in the EditGroupDialog instructor select to prevent submitting invalid instructor ID 0
- **FR-008**: System MUST update GroupForm schedule fields when initialData changes (edit mode switching between groups)
- **FR-009**: System MUST remove all dead components, hooks, API functions, types, and test files identified in the audit
- **FR-010**: System MUST replace all `as any` type assertions with proper TypeScript types in the groups feature
- **FR-011**: System MUST use proper type guards for error extraction in useGroupMutations instead of `as Error` casts
- **FR-012**: System MUST gate enrollments and payments queries by active tab to avoid unnecessary network requests on GroupDetailPage mount
- **FR-013**: System MUST invalidate all related caches (levels, sessions, enrollments, payments, attendance) after group mutations
- **FR-014**: System MUST migrate generateSessions from a plain async function to a useMutation with proper cache invalidation
- **FR-015**: System MUST add focus traps to EditGroupDialog and ProgressLevelDialog
- **FR-016**: System MUST return focus to trigger element when dialogs close
- **FR-017**: System MUST add keyboard arrow-key navigation to all tab navigation components (TabNavigation, GroupCategoryTabs, GroupBySelector)
- **FR-018**: System MUST make GroupCard keyboard-focusable and activatable with Enter/Space keys
- **FR-019**: System MUST add `aria-hidden="true"` to all Material Symbols icon spans
- **FR-020**: System MUST add `aria-label` to all form inputs without visible labels (time selects, expand/collapse buttons)
- **FR-021**: System MUST associate all form labels with their inputs via `htmlFor`/`id` attributes
- **FR-022**: System MUST add per-tab ErrorBoundaries so one tab crash doesn't affect others
- **FR-023**: System MUST fix the status icon in LevelsTab to use a positive icon for 'active' status
- **FR-024**: System MUST hoist redundant computations outside of map functions in LevelSelector
- **FR-025**: System MUST remove the unused scheduleToForm function from scheduleTransform.ts
- **FR-026**: System MUST fix the GroupsTable.test.tsx test that references a non-existent component
- **FR-027**: System MUST fix the useGroups.test.ts test that sorts by invalid 'max_capacity' field
- **FR-028**: System MUST add fallback default for current_student_count in normalizeEnrichedGroup to prevent undefined values

### Key Entities

- **Group**: Core entity with status (active, inactive, completed, archived), schedule, capacity, instructor, and course relationships
- **Enrollment**: Links students to groups with status (active, completed, dropped) and payment information
- **Level**: Hierarchical progression within a group with sessions, completions, and enrollment migration
- **Session**: Individual class meeting with date, time, attendance records, and instructor assignment
- **Payment**: Financial transaction linked to enrollments with amount, method, and status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero TypeScript errors after all fixes (`tsc --noEmit` passes with 0 errors)
- **SC-002**: Zero ESLint errors related to groups feature (`npm run lint` passes with 0 feature-related errors)
- **SC-003**: All 68 audit findings resolved (verified by re-running audit checks)
- **SC-004**: GroupDetailPage makes 4 or fewer API requests on initial load (down from 8+)
- **SC-005**: All dialogs trap focus and return focus on close (verified by keyboard navigation test)
- **SC-006**: All tab components support arrow-key navigation (verified by keyboard navigation test)
- **SC-007**: All form inputs have programmatic label associations (verified by screen reader test)
- **SC-008**: Zero `as any` type assertions remain in groups feature code
- **SC-009**: Zero dead components, hooks, or API functions remain (verified by import grep)
- **SC-010**: All mutations invalidate complete related cache set (verified by cache inspection after mutation)
- **SC-011**: Production build succeeds with zero errors (`npm run build` passes)
- **SC-012**: All existing tests pass after dead code removal and test fixes

## Assumptions

- The backend API contract remains unchanged; all fixes are frontend-only
- React Query v5 is used with the existing query client configuration
- Tailwind CSS v3 styling conventions are maintained
- The existing centralized queryKeys factory in `src/hooks/queryKeys.ts` is the source of truth for query keys
- Material Symbols icons are loaded via CSS class `material-symbols-outlined` from Google Fonts
- The `happy-dom` test environment is used for Vitest
- TypeScript strict mode is enabled with `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, and `erasableSyntaxOnly`
- Existing component naming conventions (Page, Tab, Modal, Form, Table, Card suffixes) are preserved
- The `Schedule` type (response) uses `start_time`/`end_time` while `ScheduleInput` (request) uses `time_start`/`time_end` per API contract
