# Tasks: Complete i18n Translations

**Input**: Design documents from `/specs/071-i18n-complete-translations/`
**Prerequisites**: plan.md, spec.md, research.md

**Tests**: Not requested — this is string extraction work with no new logic.

**Organization**: Tasks grouped by user story. Each story is independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Foundational (Namespace Registration)

**Purpose**: Register new `courses` namespace before any story touches courses files.

- [X] T001 [P] Create EN locale file at `src/locales/en/courses.json` with empty `{}` placeholder
- [X] T002 [P] Create AR locale file at `src/locales/ar/courses.json` with empty `{}` placeholder
- [X] T003 Register `courses` namespace in `src/i18n/index.ts` (add to resources, ns array, and imports)

**Checkpoint**: New namespace ready — US1-US5 can now reference courses keys.

---

## Phase 2: User Story 1 - Complete Auth Flow Translation (Priority: P1) 🎯 MVP

**Goal**: All auth screens (forgot password, reset password, register) fully translated.

**Independent Test**: Navigate to `/forgot-password`, `/reset-password`, `/register` in Arabic mode — all text in Arabic.

### Implementation for User Story 1

- [X] T004 [US1] Add auth keys to `src/locales/en/common.json` under `auth.forgotPassword.*`, `auth.resetPassword.*`, `auth.register.*`
- [X] T005 [US1] Add Egyptian Arabic translations to `src/locales/ar/common.json` for the same keys
- [X] T006 [US1] Update `src/pages/ForgotPasswordPage.tsx` — add `useTranslation('common')`, replace ~10 hardcoded strings with `t()` calls
- [X] T007 [US1] Update `src/pages/ResetPasswordPage.tsx` — add `useTranslation('common')`, replace ~15 hardcoded strings with `t()` calls
- [X] T008 [US1] Update `src/pages/RegisterPage.tsx` — add `useTranslation('common')`, replace ~12 hardcoded strings with `t()` calls
- [X] T009 [US1] Verify `tsc -b` passes after US1 changes

**Checkpoint**: Auth pages fully bilingual. Test by toggling language in Settings and visiting each auth page.

---

## Phase 3: User Story 2 - Complete Detail Pages Translation (Priority: P2)

**Goal**: All detail pages (team, student, parent, course, competition) fully translated.

**Independent Test**: Open each detail page in Arabic mode — all headings, labels, buttons, dialogs in Arabic.

### Implementation for User Story 2

- [X] T010 [US2] Add keys to `src/locales/en/groups.json` for team-related strings (~70 keys)
- [X] T011 [US2] Add Egyptian Arabic translations to `src/locales/ar/groups.json` for team keys
- [X] T012 [US2] Update `src/pages/TeamDetailPage.tsx` — add `useTranslation('groups')`, replace ~70 hardcoded strings with `t()` calls
- [X] T013 [US2] [P] Add keys to `src/locales/en/common.json` for student detail strings (~30 keys)
- [X] T014 [US2] [P] Add Egyptian Arabic translations to `src/locales/ar/common.json` for student detail keys
- [X] T015 [US2] Update `src/pages/StudentDetailPage.tsx` — add `useTranslation('common')`, replace ~30 hardcoded strings with `t()` calls
- [X] T016 [US2] [P] Add keys to `src/locales/en/common.json` for parent detail strings (~25 keys)
- [X] T017 [US2] [P] Add Egyptian Arabic translations to `src/locales/ar/common.json` for parent detail keys
- [X] T018 [US2] Update `src/pages/ParentDetailPage.tsx` — add `useTranslation('common')`, replace ~25 hardcoded strings with `t()` calls
- [X] T019 [US2] [P] Add keys to `src/locales/en/courses.json` for course detail strings (~35 keys)
- [X] T020 [US2] [P] Add Egyptian Arabic translations to `src/locales/ar/courses.json` for course detail keys
- [X] T021 [US2] Update `src/pages/CourseDetailPage.tsx` — add `useTranslation('courses')`, replace ~35 hardcoded strings with `t()` calls
- [X] T022 [US2] [P] Add keys to `src/locales/en/competitions.json` for competition detail/edit strings (~35 keys)
- [X] T023 [US2] [P] Add Egyptian Arabic translations to `src/locales/ar/competitions.json` for competition detail/edit keys
- [X] T024 [US2] Update `src/pages/CompetitionDetailPage.tsx` — add `useTranslation('competitions')`, replace ~30 hardcoded strings with `t()` calls
- [X] T025 [US2] Update `src/pages/CompetitionEditPage.tsx` — add `useTranslation('competitions')`, replace ~5 hardcoded strings with `t()` calls
- [X] T026 [US2] Verify `tsc -b` passes after US2 changes

**Checkpoint**: All detail pages fully bilingual. Test by navigating to each detail page in Arabic mode.

---

## Phase 4: User Story 3 - Complete Shared Components Translation (Priority: P3)

**Goal**: All shared/common components (pagination, error states, empty states, confirm dialog, loading) fully translated.

**Independent Test**: Trigger pagination, error states, empty states, and confirm dialogs in Arabic mode — all text in Arabic.

### Implementation for User Story 3

- [X] T027 [US3] Add keys to `src/locales/en/common.json` for pagination strings (~15 keys under `pagination.*`)
- [X] T028 [US3] Add Egyptian Arabic translations to `src/locales/ar/common.json` for pagination keys
- [X] T029 [US3] Update `src/components/common/Pagination.tsx` — add `useTranslation('common')`, replace ~15 hardcoded strings with `t()` calls
- [X] T030 [US3] [P] Add keys to `src/locales/en/common.json` for error/empty/loading states (~10 keys)
- [X] T031 [US3] [P] Add Egyptian Arabic translations to `src/locales/ar/common.json` for error/empty/loading keys
- [X] T032 [US3] Update `src/components/common/ErrorBoundary.tsx` — add `useTranslation('common')`, replace 3 hardcoded strings
- [X] T033 [US3] [P] Update `src/components/common/ErrorState.tsx` — add `useTranslation('common')`, replace 3 default strings
- [X] T034 [US3] [P] Update `src/components/common/EmptyState.tsx` — add `useTranslation('common')`, replace 2 default strings
- [X] T035 [US3] [P] Update `src/components/common/ConfirmDialog.tsx` — add `useTranslation('common')`, replace 2 default strings
- [X] T036 [US3] [P] Update `src/components/common/LoadingState.tsx` — add `useTranslation('common')`, replace 1 default string
- [X] T037 [US3] [P] Update `src/components/finance/ComingSoonPlaceholder.tsx` — add `useTranslation('common')`, replace 2 default strings
- [X] T038 [US3] Verify `tsc -b` passes after US3 changes

**Checkpoint**: All shared components bilingual. Test by triggering error/empty/pagination states in Arabic mode.

---

## Phase 5: User Story 4 - Complete Feature & Domain Components Translation (Priority: P4)

**Goal**: All domain-specific components (dashboard widgets, CRM forms, enrollment panels, task modals, group tools, staff forms, etc.) fully translated.

**Independent Test**: Use Quick Register, create enrollment, create task, manage groups in Arabic mode — all text in Arabic.

### Implementation for User Story 4

#### Dashboard Components
- [X] T039 [US4] [P] Add keys to `src/locales/en/dashboard.json` for quick actions and mobile group card strings (~15 keys)
- [X] T040 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/dashboard.json` for those keys
- [X] T041 [US4] Update `src/components/dashboard/QuickActionsGrid.tsx` — add `useTranslation('dashboard')`, replace ~12 hardcoded strings
- [X] T042 [US4] [P] Update `src/components/dashboard/MobileGroupCard.tsx` — add `useTranslation('dashboard')`, replace 3 hardcoded strings

#### CRM Components
- [X] T043 [US4] [P] Add keys to `src/locales/en/directory.json` for CRM form placeholders (~10 keys)
- [X] T044 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/directory.json` for those keys
- [X] T045 [US4] [P] Update `src/components/crm/StudentForm.tsx` — add `useTranslation('directory')`, replace 3 placeholder strings
- [X] T046 [US4] [P] Update `src/components/crm/ParentForm.tsx` — add `useTranslation('directory')`, replace 2 placeholder strings
- [X] T047 [US4] [P] Update `src/components/crm/LogActivityModal.tsx` — add `useTranslation('directory')`, replace 7 strings
- [X] T048 [US4] [P] Update `src/components/crm/LinkParentModal.tsx` — add `useTranslation('directory')`, replace 2 strings
- [X] T049 [US4] [P] Update `src/components/crm/WaitingListPanel.tsx` — add `useTranslation('directory')`, replace 1 placeholder

#### Groups Components
- [X] T050 [US4] [P] Add keys to `src/locales/en/groups.json` for group component strings (~40 keys)
- [X] T051 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/groups.json` for those keys
- [X] T052 [US4] [P] Update `src/components/groups/GroupsHeader.tsx` — add `useTranslation('groups')`, replace 1 placeholder
- [X] T053 [US4] [P] Update `src/components/groups/GroupForm.tsx` — add `useTranslation('groups')`, replace 2 placeholders
- [X] T054 [US4] [P] Update `src/components/groups/GroupCombobox.tsx` — add `useTranslation('groups')`, replace 2 strings
- [X] T055 [US4] [P] Update `src/components/groups/ViewToggle.tsx` — add `useTranslation('groups')`, replace 2 title attributes
- [X] T056 [US4] [P] Update `src/components/groups/LevelsTab.tsx` — add `useTranslation('groups')`, replace 4 strings
- [X] T057 [US4] [P] Update `src/components/groups/HistoryTab.tsx` — add `useTranslation('groups')`, replace 2 title attributes
- [X] T058 [US4] [P] Update `src/components/groups/detail/AddSessionDialog.tsx` — add `useTranslation('groups')`, replace 2 strings
- [X] T059 [US4] [P] Update `src/components/groups/detail/GroupInfoCard.tsx` — add `useTranslation('groups')`, replace 1 placeholder
- [X] T060 [US4] [P] Update `src/components/groups/detail/EditGroupDialog.tsx` — add `useTranslation('groups')`, replace 3 placeholders
- [X] T061 [US4] [P] Update `src/components/groups/detail/EditGroupLevelDialog.tsx` — add `useTranslation('groups')`, replace 2 placeholders
- [X] T062 [US4] [P] Update `src/components/groups/detail/ProgressLevelDialog.tsx` — add `useTranslation('groups')`, replace 1 placeholder

#### Tasks Components
- [X] T063 [US4] [P] Add keys to `src/locales/en/tasks.json` for task component strings (~10 keys)
- [X] T064 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/tasks.json` for those keys
- [X] T065 [US4] [P] Update `src/components/tasks/CreateTaskModal.tsx` — add `useTranslation('tasks')`, replace 5 strings
- [X] T066 [US4] [P] Update `src/components/tasks/CommentsFeed.tsx` — add `useTranslation('tasks')`, replace 1 placeholder
- [X] T067 [US4] [P] Update `src/components/tasks/TimeLogPanel.tsx` — add `useTranslation('tasks')`, replace 2 placeholders
- [X] T068 [US4] [P] Update `src/components/tasks/SubtaskChecklist.tsx` — add `useTranslation('tasks')`, replace 1 placeholder
- [X] T069 [US4] [P] Update `src/components/tasks/TaskListTable.tsx` — add `useTranslation('tasks')`, replace 1 title attribute

#### Staff Components
- [X] T070 [US4] [P] Add keys to `src/locales/en/staff.json` for staff component strings (~8 keys)
- [X] T071 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/staff.json` for those keys
- [X] T072 [US4] [P] Update `src/components/staff/EmployeeForm/PersonalInfoSection.tsx` — add `useTranslation('staff')`, replace 3 placeholders
- [X] T073 [US4] [P] Update `src/components/staff/InstructorCombobox.tsx` — add `useTranslation('staff')`, replace 2 strings
- [X] T074 [US4] [P] Update `src/components/staff/CreateAccountModal.tsx` — add `useTranslation('staff')`, replace 2 placeholders
- [X] T075 [US4] [P] Update `src/components/staff/EmployeeDetailModal.tsx` — add `useTranslation('staff')`, replace 2 strings

#### Enrollments Components
- [X] T076 [US4] [P] Add keys to `src/locales/en/enrollments.json` for enrollment component strings (~15 keys)
- [X] T077 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/enrollments.json` for those keys
- [X] T078 [US4] [P] Update `src/components/enrollments/EnrollPanel.tsx` — add `useTranslation('enrollments')`, replace 5 strings
- [X] T079 [US4] [P] Update `src/components/enrollments/ModifyEnrollmentPanel.tsx` — add `useTranslation('enrollments')`, replace 4 strings
- [X] T080 [US4] [P] Update `src/components/enrollments/DropEnrollmentPanel.tsx` — add `useTranslation('enrollments')`, replace 5 strings
- [X] T081 [US4] [P] Update `src/components/enrollments/EditEnrollmentModal.tsx` — add `useTranslation('enrollments')`, replace 3 strings

#### Competitions Components
- [X] T082 [US4] [P] Add keys to `src/locales/en/competitions.json` for competition component strings (~8 keys)
- [X] T083 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/competitions.json` for those keys
- [X] T084 [US4] [P] Update `src/components/competitions/CompetitionForm.tsx` — add `useTranslation('competitions')`, replace 3 placeholders
- [X] T085 [US4] [P] Update `src/components/competitions/TeamRegistrationModal.tsx` — add `useTranslation('competitions')`, replace 5 strings

#### Student Tab Components
- [X] T086 [US4] [P] Add keys to `src/locales/en/common.json` for student tab strings (~10 keys)
- [X] T087 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/common.json` for those keys
- [X] T088 [US4] [P] Update `src/components/student/OverviewTab.tsx` — add `useTranslation('common')`, replace 2 title attributes
- [X] T089 [US4] [P] Update `src/components/student/EnrollmentsTab.tsx` — add `useTranslation('common')`, replace 3 title attributes
- [X] T090 [US4] [P] Update `src/components/student/CoursesTab.tsx` — add `useTranslation('common')`, replace 1 title attribute
- [X] T091 [US4] [P] Update `src/components/student/CompetitionsTab.tsx` — add `useTranslation('common')`, replace 1 title attribute
- [X] T092 [US4] [P] Update `src/components/student/TeamsTab.tsx` — add `useTranslation('common')`, replace 1 title attribute

#### Courses & Certificates Components
- [X] T093 [US4] [P] Add keys to `src/locales/en/courses.json` for course form/header strings (~4 keys)
- [X] T094 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/courses.json` for those keys
- [X] T095 [US4] [P] Update `src/components/courses/CourseForm.tsx` — add `useTranslation('courses')`, replace 2 placeholders
- [X] T096 [US4] [P] Update `src/components/courses/CoursesHeader.tsx` — add `useTranslation('courses')`, replace 1 placeholder
- [X] T097 [US4] [P] Add keys to `src/locales/en/common.json` for certificate component strings (~5 keys)
- [X] T098 [US4] [P] Add Egyptian Arabic translations to `src/locales/ar/common.json` for those keys
- [X] T099 [US4] [P] Update `src/components/certificates/CertificatesHeader.tsx` — add `useTranslation('common')`, replace 2 strings
- [X] T100 [US4] [P] Update `src/components/certificates/CertificateForm.tsx` — add `useTranslation('common')`, replace 2 placeholders
- [X] T101 [US4] [P] Update `src/components/certificates/CertificateDetailModal.tsx` — add `useTranslation('common')`, replace 1 title

#### Teams Component
- [X] T102 [US4] [P] Update `src/components/teams/TeamEditModal.tsx` — add `useTranslation('competitions')`, replace 5 strings

- [X] T103 [US4] Verify `tsc -b` passes after US4 changes

**Checkpoint**: All domain components bilingual. Test by using each feature area in Arabic mode.

---

## Phase 6: User Story 5 - Locale File Cleanup (Priority: P5)

**Goal**: Add 11 missing navigation keys, translate remaining partial pages, remove dead keys.

**Independent Test**: Grep codebase for every key in locale files — each must have at least one `t()` reference. Grep for remaining hardcoded English — should find zero user-facing strings.

### Implementation for User Story 5

- [X] T104 [US5] Add 11 missing `common.navigation.*` keys to `src/locales/en/common.json` (sessions_activity, devices, language, users, accounts, login_logs, access, password_changes, security, failed_attempts, alerts)
- [X] T105 [US5] Add Egyptian Arabic translations for those 11 keys to `src/locales/ar/common.json`
- [X] T106 [US5] Update `src/pages/SettingsPage.tsx` — remove `defaultValue` fallbacks, use `t()` with proper keys
- [X] T107 [US5] Update `src/pages/DirectoryPage.tsx` — add remaining ~25 hardcoded strings to `t()` calls
- [X] T108 [US5] Update `src/pages/StaffPage.tsx` — add remaining ~4 hardcoded strings to `t()` calls
- [X] T109 [US5] Update `src/pages/GroupsPage.tsx` — add remaining ~2 hardcoded strings to `t()` calls
- [X] T110 [US5] Update `src/pages/TasksPage.tsx` — add remaining ~5 hardcoded strings to `t()` calls
- [X] T111 [US5] Update `src/pages/NotificationsPage.tsx` — translate 3 tab labels
- [X] T112 [US5] Update `src/pages/LoginPage.tsx` — translate aria-label for show/hide password
- [X] T113 [US5] Remove 273 dead keys from `src/locales/en/common.json` (buttons.*, labels.*, messages.*, auth.*, validation.*, navigation.*, empty.*, pagination.* unused sections)
- [X] T114 [US5] Remove 273 dead keys from `src/locales/ar/common.json` (matching keys)
- [X] T115 [US5] Remove dead keys from `src/locales/en/directory.json`, `reports.json`, `staff.json`, `dashboard.json`, `tasks.json` (matching unused keys)
- [X] T116 [US5] Remove dead keys from `src/locales/ar/directory.json`, `reports.json`, `staff.json`, `dashboard.json`, `tasks.json`
- [X] T117 [US5] Verify `tsc -b` passes after US5 changes

**Checkpoint**: All locale files clean — every key referenced, no dead keys, no hardcoded English.

---

## Phase 7: Polish & Verification

**Purpose**: Final validation across all stories.

- [X] T118 Run `npm run test` — verify all 127 tests still pass
- [X] T119 Run `npm run lint` — verify zero lint errors
- [X] T120 Run `npm run build` — verify `tsc -b && vite build` succeeds
- [X] T121 Final grep audit: search all `src/pages/` and `src/components/` for remaining hardcoded English strings — should find zero user-facing strings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — can start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion (courses namespace)
- **Phase 3 (US2)**: Independent of US1 — can start after Phase 1
- **Phase 4 (US3)**: Independent of US1/US2 — can start after Phase 1
- **Phase 5 (US4)**: Independent of US1-US3 — can start after Phase 1
- **Phase 6 (US5)**: Should run AFTER US1-US4 complete (cleanup needs all active keys present)
- **Phase 7 (Polish)**: Depends on all stories complete

### User Story Dependencies

- **US1 (Auth)**: No dependencies on other stories
- **US2 (Detail Pages)**: No dependencies on other stories
- **US3 (Common Components)**: No dependencies on other stories
- **US4 (Feature & Domain)**: No dependencies on other stories
- **US5 (Cleanup)**: Depends on US1-US4 complete

### Within Each User Story

1. Add EN locale keys
2. Add AR locale keys
3. Update component files
4. Verify `tsc -b` passes

### Parallel Opportunities

- US1, US2, US3, US4 can all run in parallel after Phase 1 completes
- Within US4, all domain groups (Dashboard, CRM, Groups, Tasks, Staff, Enrollments, Competitions, Student tabs, Courses, Certificates, Teams) can run in parallel
- All locale file updates within a story can be parallelized (different namespace files)
- All component updates within a story can be parallelized (different component files)

---

## Parallel Example: User Story 4

```bash
# Launch all domain groups in parallel:
Task: "Update dashboard components (QuickActionsGrid, MobileGroupCard)"
Task: "Update CRM components (StudentForm, ParentForm, LogActivityModal, etc.)"
Task: "Update groups components (GroupsHeader, GroupForm, etc.)"
Task: "Update tasks components (CreateTaskModal, CommentsFeed, etc.)"
Task: "Update staff components (PersonalInfoSection, InstructorCombobox, etc.)"
Task: "Update enrollments components (EnrollPanel, ModifyEnrollmentPanel, etc.)"
Task: "Update competitions components (CompetitionForm, TeamRegistrationModal)"
Task: "Update student tabs (OverviewTab, EnrollmentsTab, etc.)"
Task: "Update courses components (CourseForm, CoursesHeader)"
Task: "Update certificates components (CertificatesHeader, CertificateForm, etc.)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (courses namespace)
2. Complete Phase 2: User Story 1 (auth pages)
3. **STOP and VALIDATE**: Test auth pages in Arabic mode
4. Continue to other stories

### Incremental Delivery

1. Phase 1 → Foundation ready
2. US1 → Auth pages bilingual → Test → Continue
3. US2 → Detail pages bilingual → Test → Continue
4. US3 → Shared components bilingual → Test → Continue
5. US4 → All domain components bilingual → Test → Continue
6. US5 → Cleanup complete → Final verification
7. Phase 7 → Polish and sign-off

### Parallel Team Strategy

With multiple developers:
1. Complete Phase 1 together
2. Once done:
   - Developer A: US1 (auth pages)
   - Developer B: US2 (detail pages)
   - Developer C: US3 (common components)
   - Developer D: US4 (domain components)
3. All converge for US5 (cleanup) and Phase 7 (polish)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Dead key removal (US5) MUST happen after all active keys are in place
- Egyptian Arabic for all AR translations (matching existing convention)
- Use i18next `{{variable}}` interpolation for all dynamic strings
