# Data Model: Auth API Update

**Phase**: 1 — Design & Contracts | **Date**: 2026-05-21

## Entities

### User

Represents a person with access to the system.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| `id` | `number` | Primary key | API |
| `employee_id` | `number \| null` | `>= 1` | API |
| `username` | `string` | 3-50 chars, unique | API |
| `email` | `string` | Valid email format | API |
| `role` | `'system_admin' \| 'admin' \| 'instructor'` | Must be valid role | API |
| `is_active` | `boolean` | Determines account state | API |
| `last_login` | `string \| null` | ISO 8601 | API |
| `created_at` | `string \| null` | ISO 8601 | API |

**Lifecycle States**:
- `invited` → user created via invite, `is_active: false`, has pending invite token
- `active` → user completed registration or was created directly, `is_active: true`
- `deactivated` → soft-deleted by admin, `is_active: false`, `supabase_uid` cleared

### Session

An authentication session tied to a user.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| `id` | `string` | UUID | API |
| `created_at` | `string` | ISO 8601 | API |
| `last_active_at` | `string` | ISO 8601 | API |
| `ip` | `string` | IP address | API |
| `user_agent` | `string` | Browser UA string | API |

### Audit Log Entry

A record of a security-relevant event.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| `id` | `number` | Primary key | API |
| `user_id` | `number \| null` | FK to User | API |
| `event_type` | `string` | One of enumerated types | API |
| `ip_address` | `string \| null` | IP address | API |
| `user_agent` | `string \| null` | Browser UA | API |
| `details` | `object \| null` | Event-specific payload | API |
| `created_at` | `string` | ISO 8601 | API |

**Event Types**: `login_success`, `login_failure`, `password_change`, `account_deactivated`, `account_reactivated`, `user_created`, `user_invited`, `invite_completed`, `email_changed`, `role_changed`

### Invite Token

A one-time token generated when an admin invites a user.

| Field | Type | Constraints | Source |
|-------|------|-------------|--------|
| `token` | `string` | UUID, one-time use | API (via email link) |
| `expires_at` | `string` | ISO 8601, time-limited | API |
| `email` | `string` | Target user email | API (in invite request) |
| `role` | `string` | Role assigned on completion | API |
| `employee_id` | `number` | Employee ID to assign | API |

## Validation Rules

| Rule | Applies To | Condition |
|------|-----------|-----------|
| Password min length | User creation, registration, password change/reset | `>= 8` characters |
| Usame uniqueness | User creation, profile update | Must not conflict with existing username |
| Self-deactivation block | Admin user deactivation | `current_user.id !== target_user.id` |
| Required start date | Failed attempts audit | Must provide `from` ISO date |
| Pagination limits | All list endpoints | `limit <= 100`, `skip >= 0` |
| Role validity | User creation, role update | Must be one of `system_admin`, `admin`, `instructor` |

## API Response Envelopes

### Single Resource
```typescript
interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}
```

### Paginated List
```typescript
interface PaginatedApiResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  limit: number
}
```

### Error
```typescript
interface ApiError {
  success: false
  error: string   // e.g. "AuthError", "NotFoundError", "ConflictError", "ValidationError"
  message: string // User-friendly message
}
```
