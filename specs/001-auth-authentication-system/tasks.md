# Tasks: Auth Authentication System

## Phase 1: Setup

- [X] **T001 Create auth test directory** — Create `src/tests/auth/` directory structure
- [X] **T002 [P] Add autocomplete attributes to LoginPage** — Add `autocomplete="email"` and `autocomplete="current-password"` to form inputs in `src/pages/LoginPage.tsx`
- [X] **T003 [P] Sanitize debug logging** — Mask Bearer token in `src/api/client.ts` debug output via `sanitizedHeaders()` helper

## Phase 2: User Story 1 — Login with Email/Password (P1)

**Independent test**: Load `/login`, submit valid credentials, verify redirect to `/dashboard` with tokens stored.

- [X] **T101 [P] [US1] authStore — login sets state** — Unit test: `login()` sets token, refreshToken, user, isAuthenticated in `src/tests/auth/authStore.test.ts`
- [X] **T102 [P] [US1] authStore — initial state** — Unit test: initial state has null tokens, null user, isAuthenticated false in `src/tests/auth/authStore.test.ts`
- [X] **T103 [P] [US1] LoginPage — renders form** — Component test: email input, password input, submit button render in `src/tests/auth/LoginPage.test.tsx`
- [X] **T104 [P] [US1] LoginPage — submit disabled when empty** — Component test: button disabled when email or password empty in `src/tests/auth/LoginPage.test.tsx`
- [X] **T105 [P] [US1] LoginPage — loading state** — Component test: shows LoadingSpinner during submission in `src/tests/auth/LoginPage.test.tsx`
- [X] **T106 [P] [US1] LoginPage — calls login on submit** — Component test: form submit invokes `login()` with credentials in `src/tests/auth/LoginPage.test.tsx`
- [X] **T107 [P] [US1] LoginPage — success redirects** — Component test: successful login stores tokens + navigates to /dashboard in `src/tests/auth/LoginPage.test.tsx`
- [X] **T108 [P] [US1] LoginPage — error message** — Component test: failed login shows error text in `src/tests/auth/LoginPage.test.tsx`
- [X] **T109 [P] [US1] LoginPage — authenticated redirect** — Component test: if authenticated, login form not rendered in `src/tests/auth/LoginPage.test.tsx`
- [X] **T110 [P] [US1] LoginPage — inputs disabled during loading** — Component test: inputs have `disabled` attribute when isLoading in `src/tests/auth/LoginPage.test.tsx`
- [X] **T111 [P] [US1] LoginPage — autocomplete attributes** — Component test: email input has `autocomplete="email"`, password has `autocomplete="current-password"` in `src/tests/auth/LoginPage.test.tsx`
- [X] **T112 [P] [US1] client — Bearer injection for non-auth** — Unit test: request interceptor adds Bearer for non-auth endpoints in `src/tests/auth/client.test.ts`
- [X] **T113 [P] [US1] client — skip Bearer for login/refresh** — Unit test: request interceptor skips Bearer for `/auth/login` and `/auth/refresh` in `src/tests/auth/client.test.ts`
- [X] **T114 [P] [US1] client — no token skips header** — Unit test: request interceptor works when store has no token in `src/tests/auth/client.test.ts`
- [X] **T115 [P] [US1] login API call** — Unit test: `login()` calls `POST /auth/login` with credentials
- [X] **T116 [US1] Add 429 rate limit handling to LoginPage** — Parse `Retry-After` header from 429 response and display countdown timer to user in `src/pages/LoginPage.tsx`

## Phase 3: User Story 2 — Session Persistence (P1)

**Independent test**: Log in, refresh page, verify user remains authenticated on same route.

- [X] **T201 [P] [US2] authStore — setTokens** — Unit test: `setTokens()` updates token and refreshToken only in `src/tests/auth/authStore.test.ts`
- [X] **T202 [P] [US2] authStore — login then logout resets** — Unit test: login then logout resets state correctly in `src/tests/auth/authStore.test.ts`
- [X] **T203 [US2] Add storage event listener for cross-tab sync** — Listen for `storage` events in `src/store/authStore.ts` — when auth tokens cleared in another tab, update local state to stay consistent

## Phase 4: User Story 3 — Automatic Token Refresh (P1)

**Independent test**: Simulate 401 response, verify `/auth/refresh` called transparently, original request retried.

- [X] **T301 [P] [US3] client — pass through non-401 errors** — Unit test: response interceptor rejects non-401 errors in `src/tests/auth/client.test.ts`
- [X] **T302 [P] [US3] client — login 401 passes through** — Unit test: 401 from `/auth/login` passes through without redirect in `src/tests/auth/client.test.ts`
- [X] **T303 [P] [US3] client — Bearer for /auth/me** — Unit test: request interceptor adds Bearer for `/auth/me` in `src/tests/auth/client.test.ts`
- [X] **T304 [P] [US3] client — Bearer for /auth/users** — Unit test: request interceptor adds Bearer for `/auth/users` in `src/tests/auth/client.test.ts`
- [X] **T305 [P] [US3] client — Bearer for /auth/logout** — Unit test: request interceptor adds Bearer for `/auth/logout` in `src/tests/auth/client.test.ts`
- [X] **T306 [US3] Detect inactive account on /auth/me** — After `GET /auth/me` returns user data, check `is_active` field — if false, force logout via `authStore.logout()` and redirect to `/login` in `src/api/auth/auth.ts`

## Phase 5: User Story 4 — Logout (P2)

**Independent test**: Log in, log out, verify cannot access protected routes and redirected to `/login`.

- [X] **T401 [P] [US4] authStore — logout clears state** — Unit test: `logout()` clears all fields to null/false in `src/tests/auth/authStore.test.ts`
- [X] **T402 [P] [US4] authStore — logout handles API failure** — Unit test: `logout()` clears local state even when API call fails in `src/tests/auth/authStore.test.ts`
- [X] **T403 [P] [US4] logout API call** — Unit test: `logout()` calls `POST /auth/logout`
- [X] **T404 [P] [US4] refreshToken API call** — Unit test: `refreshToken()` calls `POST /auth/refresh` with refresh_token
- [X] **T405 [P] [US4] getCurrentUser API call** — Unit test: `getCurrentUser()` calls `GET /auth/me`

## Phase 6: User Story 5 — Role-Based Route Protection (P2)

**Independent test**: Authenticate as non-admin, navigate to `/notifications`, verify redirect to `/dashboard`.

- [X] **T501 [P] [US5] RoleBasedRoute — authorized role renders outlet** — Component test in `src/tests/auth/RoleBasedRoute.test.tsx`
- [X] **T502 [P] [US5] RoleBasedRoute — unauthorized role redirects** — Component test in `src/tests/auth/RoleBasedRoute.test.tsx`
- [X] **T503 [P] [US5] RoleBasedRoute — unauthenticated passes through** — Component test in `src/tests/auth/RoleBasedRoute.test.tsx`
- [X] **T504 [P] [US5] RoleBasedRoute — custom redirectTo** — Component test in `src/tests/auth/RoleBasedRoute.test.tsx`
- [X] **T505 [P] [US5] AccessDenied renders** — Component test in `src/tests/auth/RoleBasedRoute.test.tsx`

## Phase 7: User Story 6 — Admin User Management (P3)

**Independent test**: Call `POST /auth/users` with admin credentials, verify new user created.

- [X] **T601 [P] [US6] createUser API call** — Unit test: `createUser()` calls `POST /auth/users` with user data
- [X] **T602 [P] [US6] resetPassword API call** — Unit test: `resetPassword()` calls `POST /auth/users/:id/reset-password`

## Phase 8: Polish & Cross-Cutting

- [X] **T801 Run full test suite** — Run `npm run test` — all auth tests pass (57/57). 2 pre-existing test files (`GroupsTable.test.tsx`, `useGroups.test.ts`) fail due to broken import paths unrelated to auth.
- [X] **T802 Verify AGENTS.md** — SPECKIT markers correctly point to `specs/001-auth-authentication-system/plan.md`
- [ ] **T803 Add login flow performance benchmark test** — Measure login-to-dashboard timing under simulated network conditions; verify <2s on standard connection (defined as ≥5 Mbps simulated bandwidth)

## Legend

| Marker | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[X]` | Completed |
| `[P]` | Parallel task — can run concurrently with other `[P]` tasks in the same phase |
| Tasks without `[P]` are sequential — must complete before next task in phase |

## Dependency Graph

```
Phase 1 (Setup) ────────────────────────────────────────────┐
                                                             │
Phase 2 (US1: Login) ──────> Phase 4 (US3: Token Refresh) ──┤
                                 │                           ├──> Phase 8 (Polish)
Phase 3 (US2: Persistence) ────┘                           │
                                                             │
Phase 5 (US4: Logout) ──────── independent ────────────────┘
                                                             
Phase 6 (US5: Role Guard) ──── independent
Phase 7 (US6: Admin Mgmt) ──── independent
```

Phases 5–7 are independent of each other and can be worked in any order. Phase 2 and 3 are independent of each other but both feed into Phase 4 (refresh flow depends on login existing).
