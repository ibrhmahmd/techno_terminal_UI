# Auth API Contracts

**Base URL**: `/api/v1`
**Auth**: All endpoints except `/auth/login` require `Authorization: Bearer <access_token>` header.
**Content-Type**: `application/json`

---

## POST /auth/login

Authenticate a user with email and password.

### Request

```json
{
  "email": "admin@techno.com",
  "password": "user-password"
}
```

### Response: 200 Success

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "employee_id": 1001,
      "username": "admin",
      "email": "admin@techno.com",
      "role": "admin",
      "is_active": true,
      "last_login": "2026-05-11T10:30:00Z",
      "created_at": "2026-01-15T08:00:00Z"
    }
  },
  "message": "Login successful"
}
```

### Response: 401 Unauthorized

```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Frontend Handler

- `LoginPage.tsx` calls `login(credentials)` → on success, stores tokens + user via `authStore.login()` → navigates to `/dashboard`
- On failure, displays error message in form

---

## POST /auth/refresh

Obtain a new access token using a refresh token.

### Request

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response: 200 Success

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "employee_id": 1001,
      "username": "admin",
      "email": "admin@techno.com",
      "role": "admin",
      "is_active": true,
      "last_login": "2026-05-11T10:35:00Z",
      "created_at": "2026-01-15T08:00:00Z"
    }
  },
  "message": "Token refreshed successfully"
}
```

### Response: 401 Invalid/Expired Refresh Token

```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

### Frontend Handler

- `client.ts` response interceptor automatically calls this on 401
- If success → `authStore.setTokens(newAccessToken, newRefreshToken)` → retry original request
- If failure → `authStore.logout()` → redirect to `/login`

---

## POST /auth/logout

Invalidate the current refresh token server-side.

### Request

Empty body. Auth via Bearer token.

### Response: 200 Success

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Frontend Handler

- `authStore.logout()` calls this API, then clears local state regardless of success/failure

---

## GET /auth/me

Get the currently authenticated user's profile.

### Request

Auth via Bearer token.

### Response: 200 Success

```json
{
  "success": true,
  "data": {
    "id": 1,
    "employee_id": 1001,
    "username": "admin",
    "email": "admin@techno.com",
    "role": "admin",
    "is_active": true,
    "last_login": "2026-05-11T10:30:00Z",
    "created_at": "2026-01-15T08:00:00Z"
  },
  "message": "User retrieved successfully"
}
```

### Frontend Handler

- Available for future use (e.g., token validation on app load, profile page)

---

## POST /auth/users (Admin)

Create a new user account.

### Request

```json
{
  "employee_id": 1002,
  "username": "newadmin",
  "password": "secure-password",
  "role": "admin"
}
```

### Response: 201 Created

```json
{
  "success": true,
  "data": {
    "id": 2,
    "employee_id": 1002,
    "username": "newadmin",
    "email": "newadmin@techno.com",
    "role": "admin",
    "is_active": true,
    "last_login": null,
    "created_at": "2026-05-11T12:00:00Z"
  },
  "message": "User created successfully"
}
```

### Frontend Handler

- Available for future admin panel integration

---

## POST /auth/users/:id/reset-password (Admin)

Reset another user's password.

### Request

```json
{
  "new_password": "new-secure-password"
}
```

### Response: 200 Success

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Frontend Handler

- Available for future admin panel integration

---

## Error Responses (All Endpoints)

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 422 Validation Error

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

## Sequence: Token Refresh Flow

```
Client                    Axios                   Backend
  │                         │                        │
  │── request ─────────────→│                        │
  │                         │── request ────────────→│
  │                         │←─ 401 Unauthorized ────│
  │                         │                        │
  │                         │── POST /auth/refresh ─→│
  │                         │←─ new tokens ──────────│
  │                         │                        │
  │── retry original ──────→│                        │
  │                         │── retry ──────────────→│
  │                         │←─ 200 Success ─────────│
  │←─ response ────────────│                        │
```

For concurrent 401s:
```
Client 1 ──→ 401 ──┐
Client 2 ──→ 401 ──┼──→ refresh ──→ new tokens ──→ retry both
Client 3 ──→ 401 ──┘
```
