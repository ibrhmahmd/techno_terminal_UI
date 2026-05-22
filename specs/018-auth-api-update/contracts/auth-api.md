# Auth API Client Contracts

**Phase**: 1 — Design & Contracts | **Date**: 2026-05-21

## Existing Endpoints (unchanged)

### `POST /auth/login`

```typescript
interface LoginCredentials { email: string; password: string }
interface LoginResponse {
  success: boolean
  data: { access_token: string; refresh_token: string; token_type: string; user: User }
  message: string
}
login(creds: LoginCredentials): Promise<LoginResponse>
```

### `POST /auth/refresh`

```typescript
interface RefreshRequest { refresh_token: string }
refreshToken(req: RefreshRequest): Promise<LoginResponse>
```

### `POST /auth/logout`

```typescript
logout(): Promise<void>
```

### `GET /auth/me`

```typescript
getCurrentUser(): Promise<User>
// Throws if user.is_active === false (triggers client-side logout)
```

### `POST /auth/users`

```typescript
interface CreateUserRequest {
  employee_id: number
  username: string
  password: string
  role: 'admin' | 'system_admin' | 'instructor'  // ← added 'instructor'
}
createUser(req: CreateUserRequest): Promise<User>
```

### `POST /auth/users/{id}/reset-password`

```typescript
interface ResetPasswordRequest { new_password: string }
resetPassword(userId: number, req: ResetPasswordRequest): Promise<void>
```

## New Endpoints

### `POST /auth/register`

Complete invite registration.

```typescript
interface RegisterRequest { token: string; username: string; password: string }
register(req: RegisterRequest): Promise<User>
```

### `PATCH /auth/me`

Update own username/email.

```typescript
interface UpdateProfileRequest { username?: string; email?: string }
updateProfile(req: UpdateProfileRequest): Promise<User>
// 409 = username taken
```

### `GET /auth/me/sessions`

List active sessions.

```typescript
interface Session { id: string; created_at: string; last_active_at: string; ip: string; user_agent: string }
getSessions(): Promise<Session[]>
```

### `POST /auth/me/sessions/logout-all`

Revoke all other sessions.

```typescript
revokeAllSessions(): Promise<void>
```

### `GET /auth/me/activity`

Paginated own activity log.

```typescript
interface ActivityQuery { skip?: number; limit?: number }
getMyActivity(query?: ActivityQuery): Promise<PaginatedApiResponse<AuditLogEntry>>
```

### `GET /auth/me/mfa/status`

```typescript
interface MfaStatus { enrolled: boolean }
getMfaStatus(): Promise<MfaStatus>
```

### `POST /auth/me/mfa/enroll`

```typescript
enrollMfa(): Promise<void>  // stub — returns 200 "coming soon"
```

### `POST /auth/change-password`

Self-service password change.

```typescript
interface ChangePasswordRequest { current_password: string; new_password: string }
changePassword(req: ChangePasswordRequest): Promise<void>
// 401 = wrong current password
```

### `POST /auth/forgot-password`

Trigger reset email.

```typescript
interface ForgotPasswordRequest { email: string }
forgotPassword(req: ForgotPasswordRequest): Promise<void>
// Always returns 200 regardless of email existence
```

## Admin Endpoints (`src/api/auth/admin.ts`)

### `GET /admin/users`

List users with filtering.

```typescript
interface AdminUserQuery {
  skip?: number
  limit?: number
  is_active?: boolean
  role?: string
  q?: string  // search username
}
getUsers(query?: AdminUserQuery): Promise<PaginatedApiResponse<User>>
```

### `GET /admin/users/{id}`

```typescript
getUser(id: number): Promise<User>
```

### `PATCH /admin/users/{id}`

Update role / active status.

```typescript
interface UpdateUserRequest { role?: string; is_active?: boolean }
updateUser(id: number, req: UpdateUserRequest): Promise<User>
// 409 = cannot deactivate self
```

### `DELETE /admin/users/{id}`

Soft-deactivate.

```typescript
deactivateUser(id: number): Promise<void>
// Cannot delete own account
```

### `POST /admin/users/invite`

Send invite.

```typescript
interface InviteUserRequest { email: string; role: string; employee_id: number }
interface InviteResponse { id: number; username: string; role: string; is_active: false; invite_expires_at: string }
inviteUser(req: InviteUserRequest): Promise<InviteResponse>
```

### `GET /admin/audit/logins`

```typescript
interface AuditQuery { user_id?: number; from?: string; to?: string; skip?: number; limit?: number }
getAuditLogins(query?: AuditQuery): Promise<PaginatedApiResponse<AuditLogEntry>>
```

### `GET /admin/audit/password-changes`

```typescript
getAuditPasswordChanges(query?: AuditQuery): Promise<PaginatedApiResponse<AuditLogEntry>>
```

### `GET /admin/audit/failed-attempts`

```typescript
interface FailedAttemptsQuery { from: string; to?: string; skip?: number; limit?: number }
getAuditFailedAttempts(query: FailedAttemptsQuery): Promise<PaginatedApiResponse<AuditLogEntry>>
```

## Shared Types

```typescript
interface User {
  id: number
  employee_id: number | null
  username: string
  email: string
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string | null
}

interface AuditLogEntry {
  id: number
  user_id: number | null
  event_type: string
  ip_address: string | null
  user_agent: string | null
  details: object | null
  created_at: string
}
```

## Error Handling

| HTTP Status | Client Handling |
|-------------|-----------------|
| 401 | Response interceptor auto-refreshes token. If refresh fails → logout. Login/refresh errors shown inline. |
| 403 | Show role-based access error toast/alert. Not visible to unauthorized roles (route-guarded). |
| 404 | Show "Resource not found" message. |
| 409 | Show conflict message (username taken, self-deactivation). |
| 422 | Show validation errors inline on form fields. |
| 429 | Already handled in LoginPage with Retry-After countdown. |
