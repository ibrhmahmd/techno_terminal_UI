# Feature Specification: Auth Features Audit & Completion

**Feature Branch**: `035-auth-features-audit`  
**Created**: 2026-06-04  
**Status**: Draft  
**Input**: User description: "open a new spec for the development of auth features of invitation and reseting passwords and other auth features in this application — start from the frontend auth and review its implementation and make sure its implementing the features the backend provides, then discuss missing auth features"

---

## Background & Audit Findings

The backend provides a full authentication surface. The frontend has partial coverage. This spec closes the gap.

### Backend Auth Surface (fully implemented)

| Endpoint | Method | Auth | Status |
|---|---|---|---|
| `/auth/login` | POST | Public | ✅ Frontend covered |
| `/auth/refresh` | POST | Public | ✅ Frontend covered |
| `/auth/logout` | POST | Bearer | ✅ Frontend covered |
| `/auth/me` | GET | Bearer | ✅ Frontend covered |
| `/auth/me` | PATCH | Bearer | ✅ API layer only (ProfileTab uses it) |
| `/auth/me/sessions` | GET | Bearer | ✅ SessionsActivityTab |
| `/auth/me/sessions/logout-all` | POST | Bearer | ✅ SessionsActivityTab |
| `/auth/me/activity` | GET | Bearer | ✅ SessionsActivityTab |
| `/auth/change-password` | POST | Bearer | ✅ ProfileTab |
| `/auth/forgot-password` | POST | Public | ✅ ForgotPasswordPage |
| `/auth/register` | POST | Public (invite token) | ✅ RegisterPage |
| `/auth/users` | POST | Admin | ✅ CreateAccountModal (legacy) |
| `/auth/users/{id}/reset-password` | POST | Admin | ⚠️ API layer exists, no UI surface |
| `/admin/users` | GET | Admin | ✅ UsersTab |
| `/admin/users/{id}` | GET/PATCH/DELETE | Admin | ✅ UsersTab |
| `/admin/users/invite` | POST | Admin | ⚠️ API layer exists, no dedicated UI in UsersTab |
| `/admin/audit/logins` | GET | Admin | ✅ SettingsPage audit tabs |
| `/admin/audit/password-changes` | GET | Admin | ✅ SettingsPage audit tabs |
| `/admin/audit/failed-attempts` | GET | Admin | ✅ SettingsPage audit tabs |
| `/auth/me/mfa/status` | GET | Bearer | ❌ No frontend surface |
| `/auth/me/mfa/enroll` | POST | Bearer | ❌ No frontend surface (stub on backend) |

### Identified Gaps

1. **Invite flow in UsersTab**: The `inviteUser` API function (`/admin/users/invite`) exists but is unused in the UI. `UsersTab` uses `createUser` (the legacy `POST /auth/users`), not the invite flow. The invite approach is the intended path — it sends an email token and the new user completes registration via `RegisterPage`.
2. **Admin password reset**: `resetPassword` (`POST /auth/users/{id}/reset-password`) API function exists but no button/modal in the admin user management UI to trigger it.
3. **MFA surface**: Both MFA endpoints exist on the backend (as stubs). No frontend display of MFA status or enrollment button.
4. **RegisterPage UX**: Token-expiry handling is a generic error message; users have no way to request a new invite without contacting admin directly.
5. **ForgotPasswordPage dead-end**: After a reset email is sent, Supabase sends a link. The app has no `/reset-password` route to handle the link's deep-link redirect with the recovery token, meaning users following the email link land on an unhandled route (`*` → `/login`).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Admin Sends an Invite to a New Staff Member (Priority: P1)

A system admin or admin wants to onboard a new employee by sending them an invite email. The admin selects an employee from the Staff or Users tab, chooses their role, and triggers an invite. The new employee receives an email with a registration link and completes setup by choosing a username and password via the `RegisterPage`.

**Why this priority**: This is the primary onboarding flow for the product. The legacy "Create Account" flow (direct password creation by admin) bypasses the invite system and is lower security. The invite flow is the intended path and is already backend-complete.

**Independent Test**: Admin can invite a user from `Settings → Users`, the invited user receives a token-linked URL, and they complete registration end-to-end.

**Acceptance Scenarios**:

1. **Given** an admin is on the Settings → Users tab, **When** they click "Invite User" and fill in email + role, **Then** the backend creates a pending user and sends an invite email, and the UI shows a success confirmation.
2. **Given** an invited user clicks the link in their email (`/register?token=...`), **When** they fill in username and password, **Then** their account is activated and they are redirected to `/login`.
3. **Given** an invite token is expired or already used, **When** the user submits the registration form, **Then** the UI shows a clear error explaining the link is invalid and advises them to contact their admin.
4. **Given** an admin sends an invite to an already-active user's email, **When** the backend rejects the request, **Then** the UI shows an appropriate conflict message.

---

### User Story 2 — Admin Force-Resets a User's Password (Priority: P2)

A system admin needs to reset a specific user's password (e.g., the user is locked out and the self-service forgot-password flow is not accessible). The admin locates the user in the Users tab and triggers a force-reset, providing a temporary new password.

**Why this priority**: Currently the `resetPassword` API is implemented but completely unreachable from the UI. This is a critical admin capability, especially for a closed system where users cannot self-serve email resets.

**Independent Test**: Admin can reset a target user's password from `Settings → Users`, and the target user can immediately log in with the new password.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a user's details in the Users tab, **When** they click "Reset Password" and provide a new password, **Then** the backend updates the password and the UI shows a success message.
2. **Given** the admin provides a password that fails validation (e.g., too short), **When** they submit, **Then** the UI shows an inline validation error before submission.
3. **Given** an admin attempts to reset a `system_admin` account's password while being a regular `admin`, **When** they submit, **Then** the request is rejected with a permission error shown in the UI.

---

### User Story 3 — User Completes a Forgotten Password Reset (Priority: P2)

A user who has forgotten their password clicks "Forgot Password" on the login page, receives an email, clicks the link, and is taken to a page within the app to set their new password. Currently the app has no `/reset-password` route, so the deep-link from Supabase's password-reset email is unhandled.

**Why this priority**: The `ForgotPasswordPage` exists and the backend endpoint fires the Supabase reset email — but the callback URL lands on `*` → `/login`, silently breaking the flow. This is a broken user journey.

**Independent Test**: A user entering their email on `ForgotPasswordPage` can complete the full reset cycle — including the new-password form — without leaving the application.

**Acceptance Scenarios**:

1. **Given** a user receives a Supabase password-reset email and clicks the link, **When** the app handles the callback URL (e.g., `/reset-password?access_token=...`), **Then** they are shown a form to set a new password.
2. **Given** the user fills in a new password and confirms it, **When** they submit, **Then** the password is updated and they are redirected to `/login` with a success message.
3. **Given** the reset token in the URL is expired, **When** the page loads, **Then** the UI informs the user the link has expired and offers a link back to `ForgotPasswordPage`.

---

### User Story 4 — MFA Status Visibility in Profile (Priority: P3)

A logged-in user can see their MFA enrollment status in their Profile tab within Settings. Since the backend stub always returns `enrolled: false`, the UI should accurately reflect the "not enrolled" state and display a clear explanation that MFA is coming soon (or offer an enroll button once the backend supports it).

**Why this priority**: The backend exposes the MFA endpoints; showing "coming soon" state prevents confusion and establishes the UI scaffolding for when MFA becomes fully functional.

**Independent Test**: A logged-in user can navigate to `Settings → Profile` and see their MFA enrollment status without error.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on the Profile tab, **When** the MFA status section loads, **Then** it shows whether the user is enrolled or not, and a note that full MFA enrollment is coming.
2. **Given** the MFA status API call fails, **When** the profile tab loads, **Then** the MFA section shows an unobtrusive error or falls back gracefully without breaking the rest of the profile.

---

### Edge Cases

- What happens when an invite token URL is opened in a browser where the user is already logged in? (Should redirect to `/dashboard` — already handled by `PublicRoute`, but needs verification.)
- What happens if the `/reset-password` callback arrives without a valid `access_token` parameter?
- What if an admin tries to invite a user whose email is already associated with an active account?
- What if the admin force-resets their own password via the Users tab?
- What if the registration form is submitted with the correct token but the username is already taken?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `Settings → Users` tab MUST expose an "Invite User" action that collects an email address and role, calls `POST /admin/users/invite`, and shows success/failure feedback.
- **FR-002**: The `Settings → Users` tab MUST expose a "Reset Password" action on each user row/detail, that calls `POST /auth/users/{id}/reset-password` with a new password supplied by the admin.
- **FR-003**: The app MUST handle the Supabase password-reset callback URL by routing it to a `/reset-password` page where the user can enter and confirm a new password.
- **FR-004**: The `/reset-password` page MUST validate that a recovery token is present; if absent or expired, it MUST display a clear error and link back to the forgot-password flow.
- **FR-005**: The `Settings → Profile` tab MUST display a MFA status section showing the current enrollment state and a "coming soon" indicator when the backend stub returns `enrolled: false`.
- **FR-006**: The `RegisterPage` MUST show a specific, actionable error message when registration fails due to an expired or already-used token, distinct from other failure modes.
- **FR-007**: All admin-facing password operations (invite, force-reset) MUST be gated by the existing role check (`canManageUsers`) before rendering action buttons.
- **FR-008**: The invite flow in `UsersTab` MUST display the generated invite expiry date/time (`invite_expires_at`) in the success state so the admin knows the time window.

### Key Entities

- **User**: System account linked to an employee; has `id`, `username`, `email`, `role`, `is_active`, `invite_expires_at`.
- **Invite Token**: A time-limited token sent via email that links an invited user to the registration endpoint.
- **Recovery Token**: A Supabase-issued token embedded in the password-reset email link, consumed by the `/reset-password` page.
- **MFA Enrollment**: A future state associated with a user indicating whether multi-factor authentication is configured.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can complete the full invite-to-active-account cycle (invite → user receives email → user registers → user logs in) without any manual workarounds or direct DB access.
- **SC-002**: An admin can force-reset any non-system-admin user's password in under 60 seconds from the Users tab.
- **SC-003**: A user following a valid Supabase password-reset email link can set a new password and log in within 3 minutes, with no route errors or blank pages.
- **SC-004**: 100% of auth-related UI actions that the backend supports are reachable from the frontend (no orphaned API functions).
- **SC-005**: All error states in the auth flows present a human-readable message with a next action — zero "something went wrong" dead ends.

---

## Assumptions

- The Supabase password-reset redirect URL in Supabase project settings will be updated to point to the app's `/reset-password` route; this is a configuration task outside the UI scope.
- The legacy `POST /auth/users` (direct account creation) flow via `CreateAccountModal` in `StaffPage` will be left in place as a fallback; this spec does not remove it.
- The MFA backend stubs (`/auth/me/mfa/status`, `/auth/me/mfa/enroll`) will remain stubs; the frontend need only display their current state and not implement full TOTP/SMS flows.
- Role-based visibility rules remain unchanged: `admin` and `system_admin` can manage users; `instructor` cannot see `Settings`.
- Password strength rules are enforced by the backend (Supabase); the frontend enforces the minimum 8-character client-side check already in place, and does not need to add additional rules.
- Invite emails are sent by Supabase on the backend side; this spec does not require the frontend to configure email templates.
