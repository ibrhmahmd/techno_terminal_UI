# Research: Auth Authentication System

## Technical Decisions

### Decision 1: Zustand with persist middleware for auth state

| Aspect | Detail |
|--------|--------|
| **Decision** | Use Zustand + `persist` middleware to store auth tokens/user in localStorage |
| **Rationale** | Auth state is truly global (every component needs access). Zustand persist automatically serializes to localStorage and rehydrates on load. Must avoid React Query for auth since token injection needs to happen in Axios interceptors (outside React tree) |
| **Alternatives considered** | React Query (rejected: cannot access tokens synchronously in Axios interceptors), Context API (rejected: re-render overhead, no built-in persistence), Redux (rejected: too much boilerplate for this scope), localStorage directly (rejected: no reactivity) |

### Decision 2: Axios response interceptor for token refresh

| Aspect | Detail |
|--------|--------|
| **Decision** | Implement token refresh in Axios response interceptor with a subscriber/queue pattern |
| **Rationale** | Axios interceptors can intercept 401 responses before they reach React components. The subscriber pattern ensures multiple concurrent 401s result in only one refresh call — all queued requests retry with the new token. Dynamic import of `refreshToken` breaks the circular dependency between `client.ts` and `auth.ts` |
| **Alternatives considered** | Per-request retry logic (rejected: code duplication), React Query retry (rejected: auth requests bypass React Query), Service Worker (rejected: overengineered) |

### Decision 3: `ProtectedRoute` waits for Zustand hydration

| Aspect | Detail |
|--------|--------|
| **Decision** | `ProtectedRoute` and `PublicRoute` use a `useHasHydrated()` hook that returns null until Zustand finishes rehydration |
| **Rationale** | Without waiting for hydration, the initial render would see `isAuthenticated: false` (the default before rehydration), causing a flash redirect to `/login` even for authenticated users |
| **Alternatives considered** | Setting default to `true` (rejected: security — would briefly expose protected routes), Using a loading spinner unconditionally (rejected: unnecessary delay for non-auth pages) |

### Decision 4: Role-based route guard as a wrapper component

| Aspect | Detail |
|--------|--------|
| **Decision** | `RoleBasedRoute` component checks `user.role` against an `allowedRoles` array and redirects unauthorized users |
| **Rationale** | Composability: can wrap `<Route>` groups in `App.tsx`. Decoupled from `ProtectedRoute` — role check is a separate concern from auth check |
| **Alternatives considered** | Single guard combining auth + role (rejected: separation of concerns), Permission-based system (rejected: overengineered for current role count) |

### Decision 5: Refresh token handling falls back to logout

| Aspect | Detail |
|--------|--------|
| **Decision** | If refresh fails (no refresh token, network error, or API returns error), the user is logged out and redirected to `/login` |
| **Rationale** | An expired/revoked refresh token means the server cannot issue new tokens. The only safe action is to force re-authentication. The `_retry` flag prevents infinite retry loops |
| **Alternatives considered** | Retry refresh with backoff (rejected: refresh failure is terminal), Silently fail and show stale data (rejected: security risk) |

## Existing Implementation Coverage

| Feature | Status | Files |
|---------|--------|-------|
| Login with email/password | ✅ Implemented | `src/api/auth/auth.ts:31-34`, `src/pages/LoginPage.tsx:20-42` |
| Zustand auth store with persistence | ✅ Implemented | `src/store/authStore.ts` |
| Bearer token injection | ✅ Implemented | `src/api/client.ts:34-51` |
| 401 → token refresh with queue | ✅ Implemented | `src/api/client.ts:88-134` |
| Logout (API + local clear) | ✅ Implemented | `src/store/authStore.ts:36-46` |
| ProtectedRoute (hydration-aware) | ✅ Implemented | `src/App.tsx:39-44` |
| PublicRoute (hydration-aware) | ✅ Implemented | `src/App.tsx:46-51` |
| RoleBasedRoute guard | ✅ Implemented | `src/components/common/RoleBasedRoute.tsx` |
| Create user API | ✅ Implemented | `src/api/auth/auth.ts:65-68` |
| Reset password API | ✅ Implemented | `src/api/auth/auth.ts:70-72` |
| Auth tests | ❌ Not implemented | — |
| Token expiry display (UI) | ❌ Not implemented | — |

## Gaps and Recommendations

| Gap | Severity | Recommendation |
|-----|----------|---------------|
| No auth tests | MEDIUM | Add unit tests for `authStore` (login/logout), `client.ts` interceptor (401 handling, queue), `LoginPage` (form submit, error states), and `RoleBasedRoute` (role checks) |
| Refresh token in localStorage | MEDIUM | XSS-vulnerable by design. Document as accepted risk. Future: migrate to HttpOnly cookie for refresh token |
| No client-side expiry check | LOW | Currently relies on server 401 to trigger refresh. Acceptable for now — token lifetime is a server concern |
| Role type limited to `'admin' \| 'system_admin'` | LOW | `CreateUserRequest` role field is narrow. May need expansion if staff-creation endpoints are added |
| No loading state between hydration and render | LOW | Returns `null` (blank screen) briefly during hydration. Acceptable — hydration completes in <50ms |

## Dependencies

- Backend API at `/api/v1/auth/*` (external dependency — contract-driven)
- `POST /auth/login` — must return `access_token`, `refresh_token`, and `user` object
- `POST /auth/refresh` — must accept `refresh_token` and return new token pair
- `POST /auth/logout` — invalidates refresh token server-side
- `GET /auth/me` — returns current user profile
