# Feature Specification: Auth Authentication System

**Feature Branch**: `001-auth-authentication-system`
**Created**: 2026-05-11
**Status**: Draft
**Input**: User description: "Implement JWT-based authentication with login, token refresh, session persistence, role-based route protection, and admin user management"

## User Scenarios & Testing

### User Story 1 - Login with Email/Password (Priority: P1)

An admin or staff member navigates to the app and is presented with a login form. They enter their email and password, submit, and upon successful authentication are redirected to the dashboard.

**Why this priority**: Without login, no user can access any protected functionality. This is the entry gate to the entire application.

**Independent Test**: Can be fully tested by loading `/login`, submitting valid credentials, and verifying redirect to `/dashboard` with auth tokens stored.

**Acceptance Scenarios**:

1. **Given** the user is unauthenticated, **When** they navigate to any protected route, **Then** they are redirected to `/login`
2. **Given** the user is on `/login`, **When** they submit valid email + password, **Then** they receive JWT tokens and are redirected to `/dashboard`
3. **Given** the user is on `/login`, **When** they submit invalid credentials, **Then** they see an error message and stay on `/login`
4. **Given** the user is on `/login`, **When** they submit with empty fields, **Then** the form prevents submission (HTML5 validation)

---

### User Story 2 - Session Persistence Across Reloads (Priority: P1)

A user logs in, then refreshes the page or closes and reopens the browser. Their authenticated session persists without requiring re-login.

**Why this priority**: Without persistence, every page reload would force re-authentication, making the app unusable.

**Independent Test**: Can be tested by logging in, refreshing the page, and verifying the user remains on the current page without redirect to `/login`.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they refresh the page, **Then** they remain authenticated and on the same route
2. **Given** the user is authenticated, **When** they close and reopen the browser, **Then** they remain authenticated until tokens expire

---

### User Story 3 - Automatic Token Refresh (Priority: P1)

An authenticated user has been working for an extended period. Their access token expires, but the system silently refreshes it without interrupting their workflow.

**Why this priority**: Access tokens have short lifetimes. Without automatic refresh, users would be logged out mid-session, destroying the user experience.

**Independent Test**: Can be tested by waiting for token expiry (or simulating a 401 response) and verifying the next API call succeeds and a new access token is stored.

**Acceptance Scenarios**:

1. **Given** the user has an expired access token but a valid refresh token, **When** any API request returns 401, **Then** the system silently calls `/auth/refresh`, retries the original request, and the user sees no interruption
2. **Given** multiple API requests fail with 401 concurrently, **When** the refresh completes, **Then** all queued requests retry with the new token
3. **Given** the refresh token is also expired or invalid, **When** refresh fails, **Then** the user is logged out and redirected to `/login`

---

### User Story 4 - Logout (Priority: P2)

An authenticated user clicks a logout button. Their session is terminated server-side and local state is cleared.

**Why this priority**: Logout is a standard security requirement but does not block initial access.

**Independent Test**: Can be tested by logging in, logging out, and verifying the user cannot access protected routes and redirected to `/login`.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they call logout, **Then** a `POST /auth/logout` request is sent and local tokens are cleared
2. **Given** the logout API call fails (network error), **When** the user logs out, **Then** local state is still cleared (degraded but safe)

---

### User Story 5 - Role-Based Route Protection (Priority: P2)

An admin attempts to access the notifications admin panel. A non-admin staff member attempts the same URL and is redirected to the dashboard.

**Why this priority**: Role-based access is a security requirement but the base app functions without it (all routes would be accessible to any authenticated user).

**Independent Test**: Can be tested by authenticating as a non-admin user, navigating to an admin-only route, and verifying redirect to `/dashboard`.

**Acceptance Scenarios**:

1. **Given** the user has role `admin` or `system_admin`, **When** they navigate to `/notifications`, **Then** the page renders normally
2. **Given** the user has role `staff` or other non-admin role, **When** they navigate to `/notifications`, **Then** they are redirected to `/dashboard`
3. **Given** the user is unauthenticated, **When** they navigate to any protected route, **Then** they are redirected to `/login` (handled by `ProtectedRoute`)

---

### User Story 6 - Admin User Management (Priority: P3)

A system admin creates a new admin user or resets an existing user's password via the API.

**Why this priority**: User management is needed for onboarding new admins but is an infrequent operation and not part of the primary login flow.

**Independent Test**: Can be tested by calling the user creation API with valid admin credentials and verifying the new user can log in.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they create a new user with employee_id, username, password, and role, **Then** the user is created and can log in
2. **Given** an authenticated admin user, **When** they reset another user's password, **Then** the user can log in with the new password

---

### Edge Cases

- What happens when a user with an active session navigates to `/login`? → Redirected to `/dashboard`
- What happens when the refresh token API itself returns 401? → Logout + redirect to `/login`
- What happens when multiple concurrent requests trigger simultaneous 401s? → Only one refresh request is made; others are queued and retried with the new token
- What happens when the token is missing from localStorage? → User is treated as unauthenticated
- What happens when the app loads before Zustand has rehydrated from localStorage? → Components wait for hydration before rendering auth-dependent UI

## Requirements

### Functional Requirements

- **FR-001**: System MUST authenticate users via email and password against the `/auth/login` endpoint
- **FR-002**: System MUST return JWT access token and refresh token on successful login
- **FR-003**: System MUST persist auth tokens to localStorage via Zustand persist middleware
- **FR-004**: System MUST rehydrate auth state from localStorage on page load
- **FR-005**: System MUST include the access token as a `Bearer` header on all non-auth API requests
- **FR-006**: System MUST intercept 401 responses and attempt silent token refresh via `/auth/refresh`
- **FR-007**: System MUST queue concurrent 401 requests and retry them after a single refresh
- **FR-008**: System MUST log the user out and redirect to `/login` if refresh fails
- **FR-009**: System MUST protect all non-login routes behind an authentication guard
- **FR-010**: System MUST redirect authenticated users away from `/login` to `/dashboard`
- **FR-011**: System MUST restrict admin-only routes (`/notifications`) by user role
- **FR-012**: System MUST call `POST /auth/logout` before clearing local state
- **FR-013**: System MUST support admin creation of new users via `POST /auth/users`
- **FR-014**: System MUST support admin password reset via `POST /auth/users/:id/reset-password`

### Key Entities

- **User**: Person with access to the CRM system. Attributes: id, employee_id, username, email, role (admin/system_admin/staff), is_active, last_login, created_at. Identified by email during login.
- **AuthTokens**: Pair of JWT strings (access_token + refresh_token) returned by login and refresh endpoints. Access token is short-lived (minutes/hours), refresh token is long-lived (days). Access token included in API requests; refresh token used only for `/auth/refresh`.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can complete login and reach the dashboard in under 2 seconds on a standard connection
- **SC-002**: Page reloads do not require re-authentication — the session persists across refreshes
- **SC-003**: Expired access tokens are silently refreshed without any visible error or interruption to the user
- **SC-004**: Unauthenticated users are always redirected to `/login` regardless of which protected URL they attempt
- **SC-005**: Users without admin role cannot access the `/notifications` page
- **SC-006**: Concurrent 401 errors (within 500ms of each other) result in exactly one refresh request, not multiple
- **SC-007**: Logout clears all local auth state and the user cannot access protected routes afterward

## Assumptions

- **Email/password is the sole authentication method** — no SSO, OAuth2, MFA, or magic link support for v1
- **JWT tokens are managed server-side** — the frontend only stores and transmits them; expiry times are determined by the backend
- **localStorage is the sole persistence mechanism** — no cookie-based auth, no HttpOnly cookies
- **Role set is fixed to `admin`, `system_admin`, `staff`** — new roles would require code changes
- **The backend refresh endpoint accepts the same `refresh_token` used in login** — the API contract assumes this
- **Network connectivity is generally reliable** — the refresh queue does not implement exponential backoff for retries
