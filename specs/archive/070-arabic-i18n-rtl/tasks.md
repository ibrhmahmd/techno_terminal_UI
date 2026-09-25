# Tasks: Arabic i18n/RTL Support

**Input**: Design documents from `/specs/070-arabic-i18n-rtl/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Hooks: `src/hooks/`
  - Pages: `src/pages/`
  - Store: `src/store/`
  - i18n: `src/i18n/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, create i18n configuration, create locale store

- [X] T001 Install i18n dependencies: `npm install react-i18next i18next i18next-browser-languagedetector`
- [X] T002 [P] Create i18n initialization file at `src/i18n/index.ts` — configure i18next with react-i18next plugin, browser language detector, fallback language `en`, default namespace `common`, interpolation syntax `{{key}}`
- [X] T003 [P] Create English translation skeleton at `src/locales/en/common.json` — populate with common buttons (save, cancel, delete, confirm, close, search, filter, clear, back, next, previous), common labels (name, email, status, date, time, amount, notes, description, type, action), common messages (loading, error, success, no_data, confirm_delete, unsaved_changes), and validation messages (required, invalid_email, min_length, max_length)
- [X] T004 [P] Create Arabic translation file at `src/locales/ar/common.json` — empty object `{}` (placeholder, populated incrementally in US1)
- [X] T005 [P] Create locale Zustand store at `src/store/settingsStore.ts` — fields: `locale: 'en'`, `direction: 'ltr'` (computed). Methods: `setLocale('en' | 'ar')` that updates locale + direction + calls `i18next.changeLanguage()` + sets `document.documentElement.dir` + sets `document.documentElement.lang`. Persist to `settings-storage` key. Cross-tab sync via `storage` event listener (same pattern as `authStore`)
- [X] T006 Import i18n config in `src/main.tsx` — add `import './i18n'` before App import
- [X] T007 Add `useEffect` in `src/App.tsx` to sync HTML `lang` and `dir` attributes from `useSettingsStore` on mount and locale change
- [X] T008 Add Suspense boundary in `src/App.tsx` around routes for async i18n namespace loading

**Checkpoint**: i18n infrastructure ready — language toggle can now be wired up

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Font loading, common translations, settings page language section

- [X] T009 Add Noto Sans Arabic Google Fonts `<link>` to `index.html` — add to existing font loading section
- [X] T010 Update `tailwind.config.js` font-family fallback — add `'Noto Sans Arabic'` after `'Inter'` in the `body` font family array
- [X] T011 [P] Create `LanguageSettings` component at `src/components/settings/LanguageSettings.tsx` — radio toggle for English / العربية, reads locale from `useSettingsStore`, calls `setLocale` on change
- [X] T012 [US1] Add language settings section to `src/components/settings/` — integrate `LanguageSettings` into the existing Settings page tabs
- [X] T013 [P] Populate `src/locales/en/common.json` with complete common translations — all buttons, labels, messages, navigation terms, form validation, error messages, empty states, pagination labels used across the app (extract from `src/components/common/`, `src/components/layout/`, `src/pages/`)
- [X] T014 [P] Populate `src/locales/ar/common.json` with Arabic translations for all common keys

**Checkpoint**: Foundation ready — Settings page shows language toggle, common UI strings translated

---

## Phase 3: User Story 1 - Language Switching (Priority: P1) 🎯 MVP

**Goal**: User can toggle EN/AR in Settings, UI re-renders instantly, preference persists and syncs across tabs

**Independent Test**: Navigate to Settings, toggle to Arabic, verify UI switches and persists on reload. Open second tab, verify sync.

### Implementation for User Story 1

- [ ] T015 [US1] Wire `LanguageSettings` component to `useSettingsStore` — verify toggle triggers instant `i18next.changeLanguage()` and HTML attribute updates
- [ ] T016 [US1] Test persistence — select Arabic, close tab, reopen, verify Arabic still selected
- [ ] T017 [US1] Test cross-tab sync — select Arabic in tab 1, verify tab 2 updates automatically
- [ ] T018 [US1] Verify English mode regression — toggle back to English, verify all UI text renders correctly

**Checkpoint**: Language switching fully functional — MVP delivers bilingual toggle with persistence

---

## Phase 4: User Story 2 - Finance Receipts Bilingual Support (Priority: P2)

**Goal**: All finance receipt creation strings translate to Arabic, RTL layout works in receipt flow

**Independent Test**: Toggle to Arabic, open Create Receipt, verify all labels/buttons/messages in Arabic. Create a receipt end-to-end.

### Implementation for User Story 2

- [x] T019 [P] [US2] Create `src/locales/en/finance.json` — extract all strings from `src/components/finance/CreateReceiptPanel.tsx`, `src/components/finance/CreateReceipt/EnrollmentSelection.tsx`, `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx`, `src/components/finance/CreateReceipt/SlideToConfirm.tsx`, `src/components/finance/PaymentMethodPills.tsx`
- [x] T020 [P] [US2] Create `src/locales/ar/finance.json` — translate all finance keys, using existing ad-hoc Arabic strings as source
- [x] T021 [US2] Update `src/components/finance/CreateReceiptPanel.tsx` — replace hardcoded strings with `useTranslation('finance')` + `t()` calls
- [x] T022 [US2] Update `src/components/finance/CreateReceipt/EnrollmentSelection.tsx` — replace hardcoded strings + remove ad-hoc `dir="rtl"` attributes
- [x] T023 [US2] Update `src/components/finance/CreateReceipt/ReceiptLineItemRow.tsx` — replace hardcoded strings with `t()` calls
- [x] T024 [US2] Update `src/components/finance/CreateReceipt/SlideToConfirm.tsx` — replace hardcoded strings + convert directional CSS (no hardcoded strings — receives label via props)
- [x] T025 [US2] Update `src/components/finance/PaymentMethodPills.tsx` — replace hardcoded strings with `t()` calls (no hardcoded strings — receives options/label via props)
- [x] T026 [US2] Convert directional Tailwind classes in finance files — `ml-*` → `ms-*`, `mr-*` → `me-*`, `pl-*` → `ps-*`, `pr-*` → `pe-*`, `left-*` → `start-*`, `right-*` → `end-*`, `text-left` → `text-start`, `text-right` → `text-end`
- [x] T027 [US2] Register `finance` namespace in `src/i18n/index.ts` — add lazy loading for finance namespace
- [ ] T028 [US2] Test finance flow end-to-end in Arabic — create receipt, verify all text translates, layout mirrors

**Checkpoint**: Finance receipts fully bilingual — proves i18n infrastructure works end-to-end

---

## Phase 5: User Story 3 - Full App Translation (Priority: P3)

**Goal**: All ~1,490 strings across all pages and components translate to Arabic

**Independent Test**: Navigate through every page in Arabic mode — no hardcoded English strings (except brand names).

### Implementation for User Story 3

#### Layout & Navigation
- [x] T029 [P] [US3] Create `src/locales/en/layout.json` + `src/locales/ar/layout.json` — extract strings from `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/BottomNav.tsx`, `src/components/layout/MobileNavSheet.tsx`, `src/components/layout/TopNavbar.tsx` (if exists)
- [x] T030 [US3] Update layout components to use `useTranslation('layout')` + `t()` calls
- [x] T031 [P] [US3] Create `src/locales/en/dashboard.json` + `src/locales/ar/dashboard.json` — extract strings from `src/pages/DashboardPage.tsx` and `src/components/dashboard/` (9 files)
- [x] T032 [US3] Update dashboard components to use `t()` calls

#### Groups & Attendance
- [x] T033 [P] [US3] Create `src/locales/en/groups.json` + `src/locales/ar/groups.json` — extract strings from `src/pages/GroupsPage.tsx`, `src/pages/GroupDetailPage.tsx`, and `src/components/groups/` (20 files)
- [ ] T034 [US3] Update groups components to use `t()` calls
- [ ] T035 [P] [US3] Create `src/locales/en/attendance.json` + `src/locales/ar/attendance.json` — extract strings from `src/components/attendance/` (11 files)
- [ ] T036 [US3] Update attendance components to use `t()` calls

#### Directory & Student/Parent
- [ ] T037 [P] [US3] Create `src/locales/en/directory.json` + `src/locales/ar/directory.json` — extract strings from `src/pages/DirectoryPage.tsx`, `src/pages/StudentDetailPage.tsx`, `src/pages/ParentDetailPage.tsx`, and `src/components/directory/` (7 files), `src/components/student/` (10 files), `src/components/crm/` (9 files)
- [ ] T038 [US3] Update directory/student/parent components to use `t()` calls

#### Staff & HR
- [ ] T039 [P] [US3] Create `src/locales/en/staff.json` + `src/locales/ar/staff.json` — extract strings from `src/pages/StaffPage.tsx` and `src/components/staff/` (8 files)
- [ ] T040 [US3] Update staff components to use `t()` calls

#### Reports & Analytics
- [ ] T041 [P] [US3] Create `src/locales/en/reports.json` + `src/locales/ar/reports.json` — extract strings from `src/pages/ReportsPage.tsx` and `src/components/reports/` (16 files)
- [ ] T042 [US3] Update reports components to use `t()` calls

#### Competitions & Teams
- [ ] T043 [P] [US3] Create `src/locales/en/competitions.json` + `src/locales/ar/competitions.json` — extract strings from `src/pages/CompetitionsPage.tsx`, `src/pages/CompetitionDetailPage.tsx`, `src/pages/CompetitionEditPage.tsx`, `src/pages/TeamDetailPage.tsx`, and `src/components/competitions/` (10 files), `src/components/teams/` (1 file)
- [ ] T044 [US3] Update competitions/teams components to use `t()` calls

#### Tasks
- [ ] T045 [P] [US3] Create `src/locales/en/tasks.json` + `src/locales/ar/tasks.json` — extract strings from `src/pages/TasksPage.tsx` and `src/components/tasks/` (8 files)
- [ ] T046 [US3] Update tasks components to use `t()` calls

#### Notifications
- [ ] T047 [P] [US3] Create `src/locales/en/notifications.json` + `src/locales/ar/notifications.json` — extract strings from `src/pages/NotificationsPage.tsx` and `src/components/notifications/` (5 files)
- [ ] T048 [US3] Update notifications components to use `t()` calls

#### Settings & Certificates
- [ ] T049 [P] [US3] Create `src/locales/en/settings.json` + `src/locales/ar/settings.json` — extract strings from `src/pages/SettingsPage.tsx` and `src/components/settings/` (4 files)
- [ ] T050 [US3] Update settings components to use `t()` calls
- [ ] T051 [P] [US3] Create `src/locales/en/certificates.json` + `src/locales/ar/certificates.json` — extract strings from `src/pages/CertificatesPage.tsx` and `src/components/certificates/` (4 files)
- [ ] T052 [US3] Update certificates components to use `t()` calls

#### Auth Pages
- [ ] T053 [P] [US3] Create `src/locales/en/auth.json` + `src/locales/ar/auth.json` — extract strings from `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/ForgotPasswordPage.tsx`, `src/pages/ResetPasswordPage.tsx`
- [ ] T054 [US3] Update auth pages to use `t()` calls

#### Common Components
- [ ] T055 [P] [US3] Create `src/locales/en/common.json` updates — extract remaining strings from `src/components/common/` (48 files): Modal, DataTable, Toast, SearchBar, Pagination, LoadingSpinner, ErrorBoundary, etc.
- [ ] T056 [US3] Update common components to use `t()` calls

#### Capabilities
- [ ] T057 [P] [US3] Create `src/locales/en/capabilities.json` + `src/locales/ar/capabilities.json` — extract strings from `src/pages/CapabilitiesPage.tsx`
- [ ] T058 [US3] Update capabilities page to use `t()` calls

#### Enrollment & Courses
- [ ] T059 [P] [US3] Create `src/locales/en/enrollments.json` + `src/locales/ar/enrollments.json` — extract strings from `src/pages/EnrollmentsPage.tsx` and `src/components/enrollments/` (4 files)
- [ ] T060 [US3] Update enrollments components to use `t()` calls
- [ ] T061 [P] [US3] Create `src/locales/en/courses.json` + `src/locales/ar/courses.json` — extract strings from `src/pages/CoursesPage.tsx`, `src/pages/CourseDetailPage.tsx`, and `src/components/courses/` (5 files)
- [ ] T062 [US3] Update courses components to use `t()` calls

#### Register all namespaces
- [ ] T063 [US3] Register all feature namespaces in `src/i18n/index.ts` — add lazy loading configuration for finance, groups, attendance, dashboard, directory, staff, reports, competitions, tasks, notifications, settings, certificates, auth, capabilities, enrollments, courses

**Checkpoint**: All ~1,490 strings extracted and translatable — full bilingual support

---

## Phase 6: User Story 4 - RTL Layout Correctness (Priority: P4)

**Goal**: Layout mirrors correctly in RTL — sidebar right, text right-aligned, icons flipped, keyboard handlers swapped

**Independent Test**: Toggle to Arabic, compare screenshots of key pages in EN vs AR — margins, padding, alignment, positioning mirrored.

### Implementation for User Story 4

#### Sidebar & Layout
- [ ] T064 [US4] Convert `src/components/layout/Sidebar.tsx` directional classes — `fixed left` → `start-0` (with RTL flip), `lg:ml-64` → `lg:ms-64`, verify sidebar appears on right in RTL
- [ ] T065 [US4] Convert `src/components/layout/AppLayout.tsx` directional classes — `lg:ml-64` → `lg:ms-64`, `pb-16` unchanged

#### Navigation & Pages
- [ ] T066 [P] [US4] Convert directional classes in `src/components/common/` files — `text-left` → `text-start`, `text-right` → `text-end`, `ml-*` → `ms-*`, `mr-*` → `me-*`, `pl-*` → `ps-*`, `pr-*` → `pe-*` (~48 files)
- [ ] T067 [P] [US4] Convert directional classes in `src/components/groups/` files — `ml-*` → `ms-*`, `pl-*` → `ps-*`, `left-*` → `start-*`, `right-*` → `end-*` (~20 files)
- [ ] T068 [P] [US4] Convert directional classes in `src/components/dashboard/` files (~9 files)
- [ ] T069 [P] [US4] Convert directional classes in `src/components/directory/` files (~7 files)
- [ ] T070 [P] [US4] Convert directional classes in `src/components/staff/` files (~8 files)
- [ ] T071 [P] [US4] Convert directional classes in `src/components/reports/` files (~16 files)
- [ ] T072 [P] [US4] Convert directional classes in `src/components/competitions/` files (~10 files)
- [ ] T073 [P] [US4] Convert directional classes in remaining component files — `src/components/tasks/`, `src/components/notifications/`, `src/components/settings/`, `src/components/certificates/`, `src/components/courses/`, `src/components/enrollments/`, `src/components/student/`, `src/components/crm/`

#### Directional Icons
- [ ] T074 [P] [US4] Create `src/components/common/DirectionalIcon.tsx` — wrapper component that flips Lucide icons in RTL mode using `[dir='rtl']:-scale-x-100` or conditional `className`
- [ ] T075 [US4] Apply `DirectionalIcon` to `ArrowLeft`, `ArrowRight`, `ArrowRightCircle`, `ArrowUpRight`, `ArrowUpCircle` in all files that use them (~6 files)
- [ ] T076 [US4] Flip Material Symbols directional icons — `arrow_back`, `chevron_right`, `chevron_left` — add `rtl:rotate-180` or conditional rendering based on locale (~13 files)

#### Keyboard Handlers
- [ ] T077 [US4] Update keyboard arrow handlers in `src/components/` — swap `ArrowRight`/`ArrowLeft` semantics based on locale in ~28 occurrences across ~12 files

#### Table Alignment
- [ ] T078 [US4] Verify data table text alignment — `text-left` → `text-start` for text columns, ensure numeric columns remain left-aligned in RTL (special handling if needed)

**Checkpoint**: RTL layout correct on all pages — sidebar mirrors, icons flip, keyboard handlers swap

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass, build gates, regression testing

- [ ] T079 Run `npm run lint` and fix all ESLint errors
- [ ] T080 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [ ] T081 Run `npm run test` and verify all existing tests pass
- [ ] T082 Manual regression test — toggle EN ↔ AR across all pages, verify no broken layouts or missing strings
- [ ] T083 Verify language preference persists across browser sessions (close + reopen)
- [ ] T084 Verify cross-tab sync works (select Arabic in tab 1, verify tab 2 updates)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — language switching must work before translations
- **US2 (Phase 4)**: Depends on US1 — finance strings need working i18n infrastructure
- **US3 (Phase 5)**: Depends on US1 — bulk extraction needs working i18n infrastructure
- **US4 (Phase 6)**: Depends on US1 — RTL conversion needs working locale store
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation — must complete first
- **US2 (P2)**: Can start after US1 — independent of US3/US4
- **US3 (P3)**: Can start after US1 — independent of US2/US4
- **US4 (P4)**: Can start after US1 — independent of US2/US3

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005 can all run in parallel (different files)
- **Phase 2**: T009, T010, T011 can run in parallel
- **Phase 4**: T019, T020 can run in parallel (EN + AR translation files)
- **Phase 5**: All translation file creation tasks (T029, T031, T033, T035, T037, T039, T041, T043, T045, T047, T049, T051, T053, T055, T057, T059, T061) can run in parallel
- **Phase 6**: All directional class conversion tasks (T066-T073) can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all translation file creation together:
Task: "Create layout translations in src/locales/en/layout.json + src/locales/ar/layout.json"
Task: "Create dashboard translations in src/locales/en/dashboard.json + src/locales/ar/dashboard.json"
Task: "Create groups translations in src/locales/en/groups.json + src/locales/ar/groups.json"
Task: "Create attendance translations in src/locales/en/attendance.json + src/locales/ar/attendance.json"
Task: "Create directory translations in src/locales/en/directory.json + src/locales/ar/directory.json"
Task: "Create staff translations in src/locales/en/staff.json + src/locales/ar/staff.json"
Task: "Create reports translations in src/locales/en/reports.json + src/locales/ar/reports.json"
# ... etc
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Language Switching)
4. **STOP and VALIDATE**: Test language toggle, persistence, cross-tab sync
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Deploy/Demo (MVP!)
3. Add US2 → Test independently → Deploy/Demo (Finance bilingual)
4. Add US3 → Test independently → Deploy/Demo (Full translation)
5. Add US4 → Test independently → Deploy/Demo (RTL layout)
6. Polish → Final quality pass

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once US1 is done:
   - Developer A: US2 (Finance Receipts)
   - Developer B: US3 (Bulk Translation — Layout + Groups + Dashboard)
   - Developer C: US4 (RTL Layout Conversion)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total tasks: 84
- US1 tasks: 4 (MVP)
- US2 tasks: 10
- US3 tasks: 35 (bulk extraction)
- US4 tasks: 15 (RTL conversion)
- Setup/Foundational: 13
- Polish: 6
