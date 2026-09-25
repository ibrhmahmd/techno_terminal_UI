# Auth API Contracts

**Feature**: Auth Pages & Logic Audit Fix (specs/052-auth-audit)
**Date**: 2026-06-29

This feature does not define new API contracts. All auth endpoints are documented in:

-> `specs/001-auth-authentication-system/contracts/auth-api.md`

---

## Relevant Endpoints (for this fix)

| Endpoint | Method | Purpose | No Bearer? |
|----------|--------|---------|------------|
| `/auth/login` | POST | Authenticate user | ✅ |
| `/auth/refresh` | POST | Refresh token pair | ✅ |
| `/auth/reset-password-confirm` | POST | Complete password reset with recovery token | ✅ (was missing) |

## Fix Notes

### `/auth/reset-password-confirm`
- **Missing from `noBearerEndpoints`** — fix by adding to both exclusion lists in `client.ts`
- Sends recovery token as Bearer token in the Authorization header
- Auth store's stale token must not overwrite the recovery token

### `/auth/login`
- Called by `login()` in `src/api/auth/auth.ts`
- Currently called directly from `LoginPage` — fix by creating `useLogin` hook
- Response: `LoginResponse` containing `{ access_token, refresh_token, token_type, user }`

### `/auth/refresh`
- Called by response interceptor in `client.ts` on 401
- The `refreshSubscribers` queue pattern needs a drain-on-failure function
