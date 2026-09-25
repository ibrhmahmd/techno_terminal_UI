# Test Coverage Checklist: Auth Authentication System

**Purpose**: Track test implementation for auth modules
**Created**: 2026-05-11
**Feature**: [spec.md](../spec.md)

## Unit Tests

### authStore

- [ ] `login()` sets token, refreshToken, user, isAuthenticated
- [ ] `logout()` clears all state
- [ ] `logout()` calls API even if API fails (doesn't throw)
- [ ] `setTokens()` updates token and refreshToken only
- [ ] Initial state has all null/false values
- [ ] State persists correctly (localStorage round-trip)
- [ ] State is immutable (setters create new objects, don't mutate)

### API Client (Axios Interceptors)

- [ ] Request interceptor injects Bearer token for non-auth endpoints
- [ ] Request interceptor skips Bearer injection for `/auth/*` endpoints
- [ ] Request interceptor works when no token exists (skips auth header)
- [ ] Response interceptor passes through non-401 errors
- [ ] Response interceptor logs out when 401 + no refresh token
- [ ] Response interceptor calls refresh on 401 + valid refresh token
- [ ] Response interceptor queues concurrent 401s and retries after refresh
- [ ] Response interceptor handles refresh failure (logs out)
- [ ] Response interceptor uses `_retry` flag (doesn't retry retried requests)
- [ ] Debug logging triggers in DEV mode or when `api_debug` is set

### Auth API Functions

- [ ] `login()` calls `POST /auth/login` with credentials
- [ ] `refreshToken()` calls `POST /auth/refresh` with refresh_token
- [ ] `logout()` calls `POST /auth/logout`
- [ ] `getCurrentUser()` calls `GET /auth/me`
- [ ] `createUser()` calls `POST /auth/users` with user data
- [ ] `resetPassword()` calls `POST /auth/users/:id/reset-password`

## Component Tests

### LoginPage

- [ ] Renders email and password inputs
- [ ] Submit button disabled when fields empty
- [ ] Shows loading spinner during submission
- [ ] Calls `login()` on form submit
- [ ] Calls `storeLogin()` on success
- [ ] Navigates to `/dashboard` on success
- [ ] Shows error message on failed login
- [ ] Redirects to `/dashboard` if already authenticated (token exists)
- [ ] Inputs disabled during loading

### RoleBasedRoute

- [ ] Renders `<Outlet />` for authorized roles
- [ ] Redirects unauthorized roles to `/dashboard`
- [ ] Renders `<Outlet />` if not authenticated (let ProtectedRoute handle it)
- [ ] Accepts custom `redirectTo` prop
- [ ] `AccessDenied` component renders correctly

### ProtectedRoute / PublicRoute (App.tsx)

- [ ] Returns null during hydration (before rehydration)
- [ ] Redirects unauthenticated to `/login`
- [ ] Renders `<Outlet />` when authenticated
- [ ] PublicRoute redirects authenticated to `/dashboard`
- [ ] PublicRoute renders `<Outlet />` when unauthenticated

## Integration Tests

- [ ] Full login flow: render → fill form → submit → store tokens → redirect
- [ ] Token refresh flow: expired token → 401 → refresh → retry → success
- [ ] Concurrent 401s: 3 simultaneous requests → 1 refresh → 3 retries
- [ ] Route protection: unauthenticated → navigate to `/groups` → redirect to `/login`
- [ ] Role protection: staff role → navigate to `/notifications` → redirect to `/dashboard`

## Summary

| Area | Total Tests | Status |
|------|-------------|--------|
| authStore | 7 | ❌ Not implemented |
| API Client | 10 | ❌ Not implemented |
| Auth API | 6 | ❌ Not implemented |
| LoginPage | 9 | ❌ Not implemented |
| RoleBasedRoute | 4 | ❌ Not implemented |
| Route Guards | 5 | ❌ Not implemented |
| Integration | 5 | ❌ Not implemented |
| **Total** | **46** | **0% complete** |
