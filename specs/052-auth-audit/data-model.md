# Data Model: Auth Domain

**Feature**: Auth Pages & Logic Audit Fix
**Date**: 2026-06-29

---

## Overview

No new data entities. This feature fixes existing types/implementations. Documented below are the existing types relevant to the fix.

---

## Existing Types

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | Primary key |
| `employee_id` | `number | null` | Links to employee record |
| `username` | `string` | Login username |
| `email` | `string` | Login email |
| `role` | `string` | `"admin"`, `"system_admin"`, `"instructor"`, etc. |
| `is_active` | `boolean` | Account active flag |
| `last_login` | `string | null` | ISO timestamp |
| `created_at` | `string | null` | ISO timestamp |

**Source**: `src/api/auth/types.ts:1-10`

---

### LoginCredentials
| Field | Type |
|-------|------|
| `email` | `string` |
| `password` | `string` |

**Source**: `src/api/auth/auth.ts:6-9`

---

### LoginResponse
| Field | Type |
|-------|------|
| `success` | `boolean` |
| `data` | `{ access_token, refresh_token, token_type, user: User }` |
| `message` | `string` |

**Source**: `src/api/auth/auth.ts:11-17`

---

### Token Pair
| Field | Type | Notes |
|-------|------|-------|
| `access_token` | `string` | JWT, short-lived (15-30 min) |
| `refresh_token` | `string` | Long-lived (7-30 days) |
| `token_type` | `string` | Always `"bearer"` |

---

## State Transitions (Auth Store)

```
Unauthenticated
    │
    ├─ login(credentials) ──► Authenticated (tokens set)
    ├─ register(data) ──────► Redirect to login
    └─ reset password ──────► Authenticated via recovery token

Authenticated
    │
    ├─ logout() ────────────► Unauthenticated (tokens cleared)
    ├─ 401 + refresh fail ──► Unauthenticated (redirect to /login)
    └─ cross-tab event ─────► Synced from storage event
```

## Affected Data Flow

```
User enters credentials
    → LoginPage (currently direct API call)
    → api/auth/auth.ts: login()
    → client.ts (Bearer interceptor)
    → POST /api/v1/auth/login
    → Response tokens stored in authStore (Zustand)
    → Redirect to /dashboard
```
