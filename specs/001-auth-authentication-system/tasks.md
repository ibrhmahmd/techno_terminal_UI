# Tasks: Auth Authentication System

## Phase 0: Setup

- [ ] **T-001: Create auth test directory** — Create `src/tests/auth/` directory structure
- [ ] **T-002: Add autocomplete attributes to LoginPage** — Add `autocomplete="email"` and `autocomplete="current-password"` to form inputs (security checklist MEDIUM item)
- [ ] **T-003: Sanitize debug logging** — Ensure `api_debug` does not leak Bearer token in logged headers (security checklist item)

## Phase 1: Core Tests — Auth Store

- [P] **T-101: authStore — login sets state** — Unit test: `login()` sets token, refreshToken, user, isAuthenticated
- [P] **T-102: authStore — logout clears state** — Unit test: `logout()` clears all fields to null/false
- [P] **T-103: authStore — logout handles API failure** — Unit test: `logout()` clears local state even when API call fails
- [P] **T-104: authStore — setTokens** — Unit test: `setTokens()` updates token and refreshToken only (user unchanged)
- [P] **T-105: authStore — initial state** — Unit test: initial state has null tokens, null user, isAuthenticated false
- [P] **T-106: authStore — state immutability** — Unit test: setters produce new state objects, don't mutate previous state

## Phase 2: Core Tests — API Client

- [P] **T-201: client — Bearer injection for non-auth** — Unit test: request interceptor adds `Authorization: Bearer <token>` for non-auth endpoints
- [P] **T-202: client — skip Bearer for /auth/** — Unit test: request interceptor does not add Bearer header for `/auth/*` endpoints
- [P] **T-203: client — no token skips auth header** — Unit test: request interceptor works when store has no token
- [P] **T-204: client — pass through non-401 errors** — Unit test: response interceptor rejects non-401 errors without refresh
- [P] **T-205: client — 401 + no refresh token logs out** — Unit test: 401 with no refresh token calls logout + redirect
- [P] **T-206: client — 401 triggers refresh** — Unit test: 401 with valid refresh token calls `/auth/refresh`
- [P] **T-207: client — concurrent 401 queue** — Unit test: multiple simultaneous 401s trigger exactly one refresh, all retried
- [P] **T-208: client — refresh failure logs out** — Unit test: when refresh fails, logout is called and user redirected
- [P] **T-209: client — _retry flag prevents loops** — Unit test: already-retried requests are not retried again
- [P] **T-210: client — debug logging** — Unit test: debug logging enabled in DEV mode

## Phase 3: Core Tests — Auth API Functions

- [P] **T-301: login API call** — Unit test: `login()` calls `POST /auth/login` with credentials
- [P] **T-302: refreshToken API call** — Unit test: `refreshToken()` calls `POST /auth/refresh` with refresh_token
- [P] **T-303: logout API call** — Unit test: `logout()` calls `POST /auth/logout`
- [P] **T-304: getCurrentUser API call** — Unit test: `getCurrentUser()` calls `GET /auth/me`
- [P] **T-305: createUser API call** — Unit test: `createUser()` calls `POST /auth/users`
- [P] **T-306: resetPassword API call** — Unit test: `resetPassword()` calls `POST /auth/users/:id/reset-password`

## Phase 4: Component Tests

- [P] **T-401: LoginPage — renders form** — Component test: email input, password input, submit button render
- [P] **T-402: LoginPage — submit disabled when empty** — Component test: button disabled when email or password empty
- [P] **T-403: LoginPage — loading state** — Component test: shows LoadingSpinner during submission
- [P] **T-404: LoginPage — calls login on submit** — Component test: form submit invokes `login()` with credentials
- [P] **T-405: LoginPage — success redirects** — Component test: successful login stores tokens + navigates to /dashboard
- [P] **T-406: LoginPage — error message** — Component test: failed login shows error text
- [P] **T-407: LoginPage — already authenticated redirect** — Component test: if token exists, renders `<Navigate to="/dashboard">`
- [P] **T-408: LoginPage — inputs disabled during loading** — Component test: inputs have `disabled` attribute when isLoading
- [P] **T-409: LoginPage — autocomplete attributes** — Component test: email input has `autocomplete="email"`, password has `autocomplete="current-password"`

## Phase 5: Route Guard Tests

- [P] **T-501: RoleBasedRoute — authorized role renders outlet** — Component test: user with allowed role renders `<Outlet />`
- [P] **T-502: RoleBasedRoute — unauthorized role redirects** — Component test: user without allowed role redirects to /dashboard
- [P] **T-503: RoleBasedRoute — unauthenticated passes through** — Component test: not authenticated renders `<Outlet />` (delegates to ProtectedRoute)
- [P] **T-504: RoleBasedRoute — custom redirectTo** — Component test: unauthorized user redirected to custom path
- [P] **T-505: AccessDenied renders** — Component test: AccessDenied component displays correct content
- [P] **T-506: ProtectedRoute — null during hydration** — Component test: before hydration, returns null
- [P] **T-507: ProtectedRoute — redirects unauthenticated** — Component test: unauthenticated after hydration → `/login`
- [P] **T-508: ProtectedRoute — renders outlet when authenticated** — Component test: authenticated after hydration → `<Outlet />`
- [P] **T-509: PublicRoute — redirects authenticated** — Component test: authenticated user on `/login` → redirect to `/dashboard`
- [P] **T-510: PublicRoute — renders outlet when unauthenticated** — Component test: unauthenticated on `/login` → `<Outlet />`

## Phase 6: Integration Tests

- [P] **T-601: Full login flow** — Integration test: render LoginPage → fill form → mock API success → verify store updated → verify navigation
- [P] **T-602: Token refresh flow** — Integration test: mock expired token → 401 from API → verify refresh called → retry succeeds
- [P] **T-603: Concurrent 401 flow** — Integration test: 3 simultaneous requests all 401 → exactly 1 refresh call → all 3 retried
- [P] **T-604: Route protection flow** — Integration test: unauthenticated → navigate to `/groups` → redirect to `/login`
- [P] **T-605: Role protection flow** — Integration test: staff role → navigate to `/notifications` → redirect to `/dashboard`

## Phase 7: Polish

- [ ] **T-701: Verify lint passes** — Run `npm run lint` — zero errors
- [ ] **T-702: Verify build passes** — Run `npm run build` — `tsc -b && vite build` succeeds
- [ ] **T-703: Run auth tests** — Run targeted test: `npm run test -- src/tests/auth/` — all pass
- [ ] **T-704: Verify AGENTS.md** — Confirm SPECKIT markers point to correct plan path

## Legend

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[P]` | Parallel task — can run concurrently with other [P] tasks in the same phase |
| Tasks without `[P]` are sequential — must complete before next task in phase |
