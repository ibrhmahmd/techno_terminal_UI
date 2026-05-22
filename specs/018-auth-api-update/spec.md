# Feature Specification: Auth API Update

**Feature Branch**: `018-auth-api-update`  
**Created**: 2026-05-21  
**Status**: Draft  
**Input**: User description: "backend updated auth API with new endpoints and features per auth-api.md"

## Clarifications

### Session 2026-05-21

- Q: Should admin-role users retain the ability to create users and reset passwords under the new API, or should all user management move to system_admin only? → A: `admin` retains create + reset password only; `system_admin` exclusively gets new admin CRUD, invite, and audit endpoints.
- Q: What routes/features should instructor users have access to? → A: Instructor gets teaching scope (courses, groups, students, attendance, competitions, teams) but NOT finance, staff, settings, notifications, or directory.
- Q: What data volumes should the system expect for users, audit entries, and sessions? → A: Small institution scale — up to 500 users, up to 10K audit entries/month, sessions per user rarely exceed 5.
- Q: What user lifecycle states should the UI represent? → A: Three states: Active / Invited (pending registration) / Deactivated (was active, soft-deleted). Each state has distinct visual treatment and action availability.

## User Scenarios & Testing

### User Story 1 - Self-Service Profile & Password Management (Priority: P1)

Any authenticated user can update their own profile (username, email), change their password, and manage their active sessions.

**Why this priority**: These are the most commonly used daily interactions — users need to update profiles and manage passwords without admin intervention.

**Independent Test**: Can be verified by logging in as any user, updating profile fields, changing password, and viewing/revoking sessions.

**Acceptance Scenarios**:

1. **Given** a user is authenticated, **When** they submit a new username, **Then** the profile is updated and the new username is reflected immediately
2. **Given** a user submits a new username that is already taken, **When** they attempt to save, **Then** they see a conflict error with a clear message
3. **Given** a user knows their current password, **When** they submit a change with current + new password, **Then** the password is updated and subsequent logins require the new password
4. **Given** a user submits a wrong current password, **When** they attempt to change password, **Then** they receive an authentication error
5. **Given** a user has multiple active sessions, **When** they request to log out all other sessions, **Then** all sessions except their current one are revoked

---

### User Story 2 - Invite Registration (Priority: P1)

A new user receives an invite token and completes their registration by setting a username and password.

**Why this priority**: Enables the full user lifecycle — admins invite, users self-register. Critical for onboarding.

**Independent Test**: An admin generates an invite, the invite link with token is opened, and the new user completes registration with valid credentials.

**Acceptance Scenarios**:

1. **Given** a user has a valid invite token, **When** they submit it with a username and password, **Then** their account is activated and they are logged in
2. **Given** a user submits an expired or invalid token, **When** they attempt to register, **Then** they receive a 400 error with a clear message
3. **Given** a user submits a password shorter than 8 characters, **When** they attempt to register, **Then** they receive a validation error

---

### User Story 3 - Admin User Management (Priority: P2)

System admins can list, search, filter, update roles, deactivate, and invite users from an admin panel.

**Why this priority**: Enables administrators to manage the user base efficiently. Still important but less frequent than self-service operations.

**Independent Test**: A system admin logs in, views the user list with filters, updates a user's role, deactivates an account, and sends a new invite.

**Acceptance Scenarios**:

1. **Given** a system admin views the user list, **When** they apply filters by role or active status, **Then** the list updates to show matching users only
2. **Given** a system admin searches by username, **When** they type a search query, **Then** results narrow to matching usernames
3. **Given** a system admin updates a user's role, **When** they save changes, **Then** the user's permissions reflect the new role immediately
4. **Given** a system admin deactivates a user, **When** confirmed, **Then** the user is soft-deactivated and cannot log in
5. **Given** a system admin attempts to deactivate their own account, **When** they submit, **Then** they receive a conflict error

---

### User Story 4 - Activity & Audit Logs (Priority: P3)

System admins can view audit trails for login events, password changes, and failed authentication attempts.

**Why this priority**: Important for compliance and security monitoring but a background operation not on the critical user path.

**Independent Test**: A system admin navigates to audit logs, applies date filters, and views paginated results for each audit type.

**Acceptance Scenarios**:

1. **Given** a system admin views login audit logs, **When** they apply date range filters, **Then** results are scoped to that period
2. **Given** a system admin views the failed attempts log, **When** no start date is provided, **Then** they are prompted to provide one
3. **Given** a system admin pages through audit results, **When** they navigate to the next page, **Then** the next set of records is loaded

---

### User Story 5 - Forgot Password Flow (Priority: P3)

An unauthenticated user can request a password reset email and reset their password.

**Why this priority**: Important for user recovery but happens infrequently.

**Independent Test**: An unauthenticated user submits their email on the forgot password page and receives a reset email.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user submits a registered email, **When** they request a password reset, **Then** a reset email is sent (response is 200 regardless)
2. **Given** an unauthenticated user submits an unregistered email, **When** they request a password reset, **Then** they still receive a 200 response to avoid leaking account existence

---

### Edge Cases

- Token expiry during a session management operation (renewal should work transparently)
- Attempting self-service endpoints (PATCH /auth/me) without authentication
- Admin deactivating their own account (should be blocked)
- User with deactivated account attempting to use a valid JWT from before deactivation
- Concurrent session revocation race conditions
- Invite token expiry during registration
- Creating a user with a role that doesn't exist in the hierarchy
- Invited user never completes registration before token expiry
- Reactivating a previously deactivated user (POST /admin/users/invite should resend invite)

## Requirements

### Functional Requirements

- **FR-001**: Users MUST be able to complete invite registration using a one-time token, setting username and password
- **FR-002**: Users MUST be able to update their own username and/or email
- **FR-003**: Users MUST be able to view their active authentication sessions
- **FR-004**: Users MUST be able to revoke all other authentication sessions while keeping their current session active
- **FR-005**: Users MUST be able to view a paginated audit trail of their own account activity
- **FR-006**: System MUST provide a way to check MFA enrollment status (stub returning false)
- **FR-007**: Users MUST be able to change their password by providing current password and a new one
- **FR-008**: Unauthenticated users MUST be able to request a password reset email
- **FR-009**: Users with `admin` or `system_admin` roles MUST be able to create new users and reset other users' passwords
- **FR-010**: System administrators (`system_admin` role) MUST be able to list users with filtering by role, active status, and username search
- **FR-011**: System administrators (`system_admin` role) MUST be able to view a single user's details
- **FR-012**: System administrators (`system_admin` role) MUST be able to update a user's role and active status
- **FR-013**: System administrators (`system_admin` role) MUST be able to soft-deactivate a user (except their own account)
- **FR-014**: System MUST prevent a user from deactivating their own account
- **FR-015**: System administrators (`system_admin` role) MUST be able to invite new users via email with a role and employee ID
- **FR-016**: System administrators (`system_admin` role) MUST be able to view paginated login audit logs with optional user and date filters
- **FR-017**: System administrators (`system_admin` role) MUST be able to view paginated password change audit logs
- **FR-018**: System administrators (`system_admin` role) MUST be able to view paginated failed authentication attempt logs with a required start date
- **FR-019**: System MUST enforce role hierarchy: `system_admin` > `admin` > `instructor` when authorizing endpoints. `admin` can create users and reset passwords. `system_admin` additionally manages users (list/view/update/deactivate/invite) and views audit logs.
- **FR-020**: System MUST handle 401 errors for expired/invalid tokens and 403 errors for role violations with distinct user-visible messages

### Key Entities

- **User**: A person with access to the system. Has id, employee_id, username, email, role (system_admin/admin/instructor), lifecycle state (Active / Invited / Deactivated), timestamps.
- **Session**: An authentication session tied to a user. Has id, creation timestamp, last activity, IP, user agent.
- **Audit Log Entry**: A record of a security-relevant event. Has id, user_id, event_type, IP, user agent, details, timestamp. Event types include login_success, login_failure, password_change, account_deactivated/reactivated, user_created/invited, invite_completed, email_changed, role_changed.
- **Invite Token**: A one-time token generated when an admin invites a user. Has an expiration timestamp, associated email, role, and employee_id.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete invite registration in under 30 seconds from receiving the token
- **SC-002**: Users can change their password in under 1 minute with no more than 2 clicks
- **SC-003**: Admins can find and update any user in under 30 seconds using search and filters
- **SC-004**: Audit log pages load within 2 seconds for any filter combination
- **SC-005**: All API error responses include a user-friendly message alongside the technical error code
- **SC-006**: 100% of protected endpoints return the correct HTTP status code for unauthorized, forbidden, and conflict scenarios as documented

## Assumptions

- Users have stable internet connectivity and a modern browser
- Data volume assumes small institution scale: up to 500 users, up to 10K audit entries per month, average sessions per user ≤ 5
- The existing API communication layer and token refresh mechanism will be reused
- The invite flow includes an external email delivery mechanism (out of scope for this spec)
- MFA features are stubs — actual MFA enrollment is out of scope
- The existing pagination patterns (skip/limit) used elsewhere in the app will be followed for admin lists and audit logs
- The `instructor` role has teaching scope: access to courses, groups, students, attendance, competitions, and teams. Does NOT access finance, staff, settings, notifications, or directory
- Session management UI will display session info (created date, last active, IP, user agent) in a list format
