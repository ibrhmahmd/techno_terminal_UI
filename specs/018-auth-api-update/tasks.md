---

description: "Task list for Auth API Update feature implementation"

---

# Tasks: Auth API Update

**Input**: Design documents from `specs/018-auth-api-update/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Manual verification per user story independent test criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - API functions: `src/api/auth/` (self-service), `src/api/auth/admin.ts` (admin)
  - Components: `src/components/settings/`
  - Hooks: `src/hooks/useAuthQueries.ts`
  - Pages: `src/pages/{Name}Page.tsx`
  - Store: `src/store/authStore.ts`
  - Routes: `src/App.tsx`
- No backend code, database schemas, or server logic.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — directory structure already exists, no new directories needed.

**No tasks required — feature directory `specs/018-auth-api-update/` already created with all design artifacts.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API functions and shared infrastructure that MUST be complete before ANY user story can begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add self-service API functions to `src/api/auth/auth.ts` — register(), updateProfile(), getSessions(), revokeAllSessions(), getMyActivity(), getMfaStatus(), enrollMfa(), changePassword(), forgotPassword() with all corresponding TypeScript interfaces from `contracts/auth-api.md`
- [X] T002 [P] Create `src/api/auth/admin.ts` with admin API functions — getUsers(), getUser(), updateUser(), deactivateUser(), inviteUser(), getAuditLogins(), getAuditPasswordChanges(), getAuditFailedAttempts() with all TypeScript interfaces
- [X] T003 [P] Update `CreateUserRequest.role` type in `src/api/auth/auth.ts` from `'admin' | 'system_admin'` to `'admin' | 'system_admin' | 'instructor'`
- [X] T004 [P] Add `updateUser(user: Partial<User>)` action to `src/store/authStore.ts` for immediate profile update reflection after PATCH /auth/me

**Checkpoint**: Foundation ready — all API functions callable, store updated. User story implementation can now begin.

---

## Phase 3: User Story 1 — Self-Service Profile & Password Management (Priority: P1) 🎯 MVP

**Goal**: Any authenticated user can update their profile (username, email), change their password (with current password verification), view active sessions, and revoke all other sessions.

**Independent Test**: Login as any user, navigate to Settings > Profile, update username, change password with current+new, view sessions list, click "Logout All Other Sessions", verify only current session remains active.

### Implementation for User Story 1

- [X] T005 [P] [US1] Create `src/hooks/useAuthQueries.ts` with React Query hooks — useUpdateProfile(), useChangePassword(), useSessions(), useRevokeAllSessions(), useMyActivity()
- [X] T006 [P] [US1] Refactor `src/components/settings/ProfileTab.tsx` — replace admin `resetPassword()` call with self-service `changePassword()` requiring `current_password` + `new_password` fields; add inline profile editing (username/email) with save/cancel; wire to `useUpdateProfile()` and `useChangePassword()`
- [X] T007 [P] [US1] Create `src/components/settings/SessionsTab.tsx` — display session list (created_at, last_active_at, ip, user_agent) in a table/card format; add "Logout All Other Sessions" button with confirmation dialog; wire to `useSessions()` and `useRevokeAllSessions()`
- [X] T008 [US1] Create `src/components/settings/ActivityTab.tsx` — display paginated activity log table (event_type, ip_address, user_agent, created_at) using existing Pagination component; wire to `useMyActivity()`
- [X] T009 [US1] Update `src/pages/SettingsPage.tsx` — add Sessions and Activity tabs (visible to all authenticated users); reorganize tab order to: Profile, Sessions, Activity, and (conditional) Users

**Checkpoint**: US1 fully functional — profile editing, password change, session management, and activity log all work independently.

---

## Phase 4: User Story 2 — Invite Registration (Priority: P1)

**Goal**: A new user with an invite token can complete their registration by setting a username and password.

**Independent Test**: Open `/register?token=<valid-uuid>` in an incognito browser, submit username and password, verify account is created and user is redirected to dashboard.

### Implementation for User Story 2

- [X] T010 [P] [US2] Create `src/pages/RegisterPage.tsx` — read `token` from URL query params; display username + password form with min 8-char validation; call `register()` on submit; on success call store `login()` with returned tokens+user and redirect to `/dashboard`; on 400 show token expired/invalid message
- [X] T011 [US2] Add `/register` route to `src/App.tsx` inside a `<PublicRoute>` wrapper (unauthenticated users only)
- [X] T012 [US2] Add invite flow support to `src/components/settings/UsersTab.tsx` — add "Invite User" modal with email, role dropdown (including `instructor`), and employee_id fields; wire to `inviteUser()` and show invite_expires_at confirmation

**Checkpoint**: US2 fully functional — invite registration and admin invite UI both work independently.

---

## Phase 5: User Story 5 — Forgot Password Flow (Priority: P3)

**Goal**: An unauthenticated user can request a password reset email.

**Independent Test**: Go to `/forgot-password`, submit an email address, verify 200 response with success message. Test with both registered and unregistered emails — both show the same success message.

### Implementation for User Story 5

- [X] T013 [P] [US5] Create `src/pages/ForgotPasswordPage.tsx` — email input form with submit button; call `forgotPassword()` on submit; show success message regardless of response; add "Back to Login" link
- [X] T014 [P] [US5] Add "Forgot Password?" link to `src/pages/LoginPage.tsx` below the sign-in button, linking to `/forgot-password`
- [X] T015 [US5] Add `/forgot-password` route to `src/App.tsx` inside a `<PublicRoute>` wrapper

**Checkpoint**: US5 fully functional — forgot password flow works independently.

---

## Phase 6: User Story 3 — Admin User Management (Priority: P2)

**Goal**: System admins can list, search, filter, update roles, deactivate, and invite users from an admin panel.

**Independent Test**: Login as system_admin, navigate to Settings > Users, search by username, filter by role/status, update a user's role, deactivate a user (non-self), invite a new user. Verify role changes immediately reflect in the list.

### Implementation for User Story 3

- [X] T016 [P] [US3] Create React Query hooks for admin user management in `src/hooks/useAuthQueries.ts` — useUsers(query), useUser(id), useUpdateUser(), useDeactivateUser(), useInviteUser()
- [X] T017 [US3] Refactor `src/components/settings/UsersTab.tsx` — replace all mock data with real `useUsers()` query; implement search input (q parameter) with debounce; add role filter dropdown and active status filter; replace "Create User" button with invite+create modals
- [X] T018 [US3] Add user detail view modal/card to `UsersTab.tsx` — show all user fields (employee_id, username, email, role, is_active status with lifecycle state badge, last_login, created_at); implement role inline editing via dropdown; implement deactivate button with confirmation dialog (disabled for own account)
- [X] T019 [P] [US3] Add "Invite User" modal to `UsersTab.tsx` — form with email, role (system_admin/admin/instructor), employee_id; wire to `useInviteUser()`; show success with invite_expires_at
- [X] T020 [US3] Update `CreateUserModal` in `UsersTab.tsx` — add `instructor` role option to role dropdown

**Checkpoint**: US3 fully functional — admin user management works independently with real API data.

---

## Phase 7: User Story 4 — Activity & Audit Logs (Priority: P3)

**Goal**: System admins can view audit trails for login events, password changes, and failed authentication attempts.

**Independent Test**: Login as system_admin, navigate to Settings > Audit > Login Logs, apply date filter, see paginated results. Navigate to Failed Attempts tab, see date range picker, enter required start date, see results.

### Implementation for User Story 4

- [X] T021 [P] [US4] Create React Query hooks for audit logs in `src/hooks/useAuthQueries.ts` — useAuditLogins(query), useAuditPasswordChanges(query), useAuditFailedAttempts(query) with `staleTime: 120000` (2 min)
- [X] T022 [US4] Add audit log tabs to `src/pages/SettingsPage.tsx` — three tabs: Login Logs, Password Changes, Failed Attempts; visible only to `system_admin` role; each tab renders a table with pagination
- [X] T023 [P] [US4] Create audit log components in `src/components/settings/` — AuditLogTable (reusable table for all three audit types); AuditDateFilter (date range picker); AuditUserFilter (user_id dropdown)
- [X] T024 [US4] Wire audit tabs to their respective hooks with proper query parameter handling — Failed Attempts tab must require `from` date (show disabled state until provided)

**Checkpoint**: US4 fully functional — audit log views work independently.

---

## Phase 8: Route Protection for Instructor Role (Cross-Cutting)

**Purpose**: Restrict `instructor` role access to teaching-scope routes only (courses, groups, students, attendance, competitions, teams). No access to finance, staff, settings, notifications, or directory.

- [X] T025 [P] Create `src/components/common/InstructorBlockedRoute.tsx` — route wrapper that redirects instructor users to `/dashboard` when they access restricted routes
- [X] T026 Update `src/App.tsx` — wrap finance, staff, settings, directory, notifications, reports, and enrollments routes with the InstructorBlockedRoute guard
- [X] T027 Update `src/components/layout/Sidebar.tsx` — hide restricted routes (directory, enrollments, finance, reports, staff, settings) from instructor users

**Checkpoint**: Instructor role correctly scoped — no cross-role access leaks.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T028 Run `npm run lint` and fix all errors
- [X] T029 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [X] T030 Code cleanup — remove unused imports, ensure `import type` for type-only imports, verify no `any` types

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on Foundational — independent from US1
- **User Story 5 (Phase 5)**: Depends on Foundational — independent from US1/US2
- **User Story 3 (Phase 6)**: Depends on Foundational (T002 admin.ts)
- **User Story 4 (Phase 7)**: Depends on Foundational (T002 audit functions)
- **Route Protection (Phase 8)**: Depends on Foundational — can run in parallel with user stories
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories — can start after Foundational
- **US2 (P1)**: No dependencies on other stories — can start after Foundational
- **US5 (P3)**: No dependencies on other stories — can start after Foundational
- **US3 (P2)**: No dependencies on other stories — can start after Foundational (uses only its own hooks)
- **US4 (P3)**: No dependencies on other stories — can start after Foundational
- **Phase 8 (Route Protection)**: No dependency on any user story — can start after Foundational

### Within Each User Story

- API functions and types before hooks
- Hooks before components
- Components before page/tab assembly
- Layout and routing last
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks T001–T004 marked [P] can run in parallel
- US1, US2, US3, US4, US5, and Phase 8 can all proceed in parallel after Foundational phase
- Within each user story, all [P] tasks can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all UI components for User Story 1 together:
Task: "Refactor ProfileTab.tsx with change-password and profile editing"
Task: "Create SessionsTab.tsx with session list and revoke button"
Task: "Create ActivityTab.tsx with paginated activity log"

# Launch hooks in parallel:
Task: "Create useAuthQueries.ts with all self-service hooks"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001–T004)
2. Complete Phase 3: User Story 1 (T005–T009)
3. **STOP and VALIDATE**: Test US1 independently — profile editing, password change, sessions, activity log
4. Deploy/demo if ready

### Incremental Delivery

1. Foundational complete → API layer ready
2. Add US1 (Self-Service) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Invite Registration) → Test independently → Deploy/Demo
4. Add US5 (Forgot Password) → Test independently → Deploy/Demo
5. Add US3 (Admin User Management) → Test independently → Deploy/Demo
6. Add US4 (Audit Logs) → Test independently → Deploy/Demo
7. Add Phase 8 (Route Protection) → Final deploy
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Complete Phase 2: Foundational together (4 parallel tasks)
2. Once Foundational is done:
   - Developer A: US1 (Self-Service)
   - Developer B: US2 (Invite) + US5 (Forgot Password)
   - Developer C: US3 (Admin User Management)
   - Developer D: US4 (Audit Logs) + Phase 8 (Route Protection)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- After each phase: run `npm run lint && npm run build` to catch TS errors early
