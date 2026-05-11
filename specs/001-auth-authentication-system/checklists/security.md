# Security Checklist: Auth Authentication System

**Purpose**: Verify auth implementation meets security requirements
**Created**: 2026-05-11
**Feature**: [spec.md](../spec.md)

## Token Management

- [X] Access tokens are sent as `Bearer` header, never in URL params or body
- [X] Refresh tokens are stored in localStorage (documented XSS risk — accepted for v1)
- [X] Token refresh uses a subscriber/queue pattern (prevents concurrent refresh storms)
- [X] Failed refresh triggers logout (no stale session)
- [X] `_retry` flag prevents infinite 401 retry loops
- [X] Auth endpoints (`/auth/*`) skip Bearer injection (pre-token requests work)

## Authentication

- [X] Login form has required field validation (HTML5 `required` attribute)
- [X] Submit button disabled during loading (prevents double submit)
- [ ] Password field uses `type="password"` (masked input) — **❌ Missing: should verify input `type="password"`**
- [ ] Login page does not cache credentials in browser — **❌ Missing: add `autocomplete` attributes**

## Route Protection

- [X] ProtectedRoute waits for Zustand hydration before deciding (prevents flash redirect)
- [X] Unauthenticated users redirected to `/login`
- [X] Authenticated users on `/login` redirected to `/dashboard`
- [X] RoleBasedRoute checks `user.role` against allowedRoles array
- [X] Wildcard route `*` redirects to `/login` (prevents unhandled routes)

## Session Management

- [ ] Client-side token expiry check — **❌ Missing: no proactive expiry detection, relies on server 401**
- [X] Logout calls server API then clears local state
- [X] Logout API failure still clears local state (degraded but safe)
- [ ] Refresh token rotation — **❌ Unknown: depends on backend implementation**
- [ ] Session timeout UI notification — **❌ Missing: user is abruptly logged out when refresh fails**

## Data Handling

- [X] No hardcoded credentials in source code
- [X] API error responses display generic messages to users ("Invalid email or password")
- [ ] Auth tokens not logged in debug output — **⚠️ Needs check: `api_debug` logs headers which may include token**

## Summary

| Severity | Open Items |
|----------|------------|
| HIGH | 0 |
| MEDIUM | 2: `autocomplete` attributes, token in debug logs |
| LOW | 3: client-side expiry, session timeout UX, refresh rotation (backend-dependent) |

**Recommendation**: Address MEDIUM items before production deployment.
