# Feature Audit Report: Auth Pages & Logic
Generated: 2026-06-29 | Phases: bug, dead-code, ts-quality, data-fetch, a11y-ux, react-perf, arch-compliance, ui-polish | Mode: standard

## Severity Heatmap
🟥 Critical: 0 — 🟧 High: 15 — 🟨 Medium: 20 — 🟩 Low: 16

## Breakdown by Phase
| Phase | Critical | High | Medium | Low | Total |
|-------|----------|------|--------|-----|-------|
| Bug | 0 | 3 | 6 | 6 | 15 |
| DeadCode | 0 | 3 | 1 | 2 | 6 |
| TSQuality | 0 | 0 | 0 | 1 | 1 |
| DataFetch | 0 | 0 | 1 | 12 | 13 |
| A11yUX | 0 | 4 | 5 | 0 | 9 |
| ReactPerf | 0 | 1 | 1 | 0 | 2 |
| Arch | 0 | 0 | 1 | 3 | 4 |
| UIPolish | 0 | 6 | 5 | 4 | 15 |
| **Total** | **0** | **17** | **20** | **28** | **65** |

## Top Findings (Critical & High)

### 🟧 Bug: `src/hooks/useAuthQueries.ts:56`
**Rule**: `raw-window-location` | **Risk**: moderate
`useCurrentUser` uses `window.location.replace('/login')` inside a React hook where `useNavigate()` is available. Causes full page reload, destroying all React Query cache, component state, and store state.
**Before**: `window.location.replace('/login')`
**After**: `navigate('/login', { replace: true })`

### 🟧 Bug: `src/api/client.ts:123`
**Rule**: `error-handling-gap` | **Risk**: breaking
On token refresh failure, `refreshSubscribers` queue is never drained — all queued requests hang indefinitely. Stale callbacks accumulate and fire on the next successful refresh, retrying stale requests with stale configs.

### 🟧 Bug: `src/pages/ResetPasswordPage.tsx:37`
**Rule**: `missing-null-check` | **Risk**: moderate
`token!` non-null assertion bypasses TypeScript safety. If URL hash changes between render and mutation execution, `token` could be null at call time. Same issue on `RegisterPage.tsx:43`.

### 🟧 Bug: `src/api/auth/auth.ts:136`
**Rule**: `error-handling-gap` | **Risk**: moderate
`/auth/reset-password-confirm` is NOT in `client.ts`'s `noBearerEndpoints` exclusion list. If the auth store has a token (race condition), the interceptor overwrites the recovery Bearer token with the store's auth token, silently breaking password reset.

### 🟧 Bug: `src/store/authStore.ts:55`
**Rule**: `error-handling-gap` | **Risk**: moderate
Storage event listener re-reads `localStorage.getItem('auth-storage')` instead of using `e.newValue` from the event. Race condition on rapid cross-tab writes.

### 🟧 DeadCode: `src/hooks/useAuthQueries.ts:44`
**Rule**: `unused-hook` | **Risk**: safe
`useCurrentUser` is defined but never imported by any production component. Its query key `queryKeys.auth.all` is invalidated by mutations but has no subscriber — those invalidations are no-ops.

### 🟧 DeadCode: `src/hooks/useAuthQueries.ts:162`
**Rule**: `unused-hook` | **Risk**: safe
`useDeleteUser` is defined but never imported. The underlying API function `deleteUser` is also effectively dead.

### 🟧 DeadCode: `src/api/auth/admin.ts:18`
**Rule**: `unused-export` | **Risk**: safe
`getUser()` is exported but never imported anywhere in the codebase (including tests).

### 🟧 DeadCode: `src/tests/auth/RoleBasedRoute.test.tsx:4`
**Rule**: `unused-component` | **Risk**: breaking
Test imports `AccessDenied` from `RoleBasedRoute.tsx` but the component does not export it. The test suite would fail at runtime.

### 🟧 A11y: `LoginPage.tsx:128`
**Rule**: `aria-live-missing` | **Risk**: safe
Rate-limit countdown has contradictory `role="alert"` + `aria-live="polite"`. The role overrides the explicit value, causing the countdown to be announced assertively every second — highly disruptive for screen reader users.

### 🟧 A11y: `ForgotPasswordPage.tsx:26`
**Rule**: `focus-management` | **Risk**: safe
Page content changes on success (form → success message) but focus is not moved. Screen reader users are dropped at the top of the page without context.

### 🟧 A11y: `ResetPasswordPage.tsx:61`
**Rule**: `focus-management` | **Risk**: safe
Phase transitions to 'success'/'invalid' but focus not moved to new content heading.

### 🟧 A11y: `App.tsx:61`
**Rule**: `focus-management` | **Risk**: moderate
No skip-to-content navigation link exists anywhere in the app. Violates WCAG 2.4.1 (Bypass Blocks).

### 🟧 ReactPerf: `src/App.tsx:6`
**Rule**: `bundle-dynamic` | **Risk**: moderate
All 25 page-level components are statically imported at the top of App.tsx. Every page's module graph is included in the initial chunk, even though only one route renders at a time. Should use `React.lazy()` + `Suspense`.

### 🟧 UIPolish: `AuthLayout.tsx:95`
**Rule**: `glassmorphism-pattern` | **Risk**: moderate
Auth card uses solid `bg-white` instead of the design system's glassmorphism pattern (`bg-white/70 backdrop-blur-xl`). Other components (StudentCombobox, SpyCombobox, EditGroupDialog) use the correct pattern.

### 🟧 UIPolish: `LoginPage.tsx:149`, `RegisterPage.tsx:72`, `ForgotPasswordPage.tsx:66`, `ResetPasswordPage.tsx:100`
**Rule**: `glassmorphism-pattern` | **Risk**: moderate
All auth input fields use full border (`border border-slate-200 rounded-lg`) instead of the design system's ghost inputs (`border-0 border-b`). The rest of the codebase (StudentForm, EditGroupDialog, LogActivityModal) uses the correct ghost input pattern.

### 🟧 UIPolish: `AuthLayout.tsx:95`
**Rule**: `glassmorphism-pattern` (no-line) | **Risk**: moderate
Card and auth pages use `border-slate-100` / `border-slate-200`, violating the design system's "No-line rule: tonal layering, not borders."

## File-by-File Summary
| File | Bugs | DeadCode | TS | Fetch | A11y | Perf | Arch | UI | Score |
|------|------|----------|----|-------|------|------|------|----|-------|
| LoginPage.tsx | 2 | 0 | 0 | 1 | 3 | 0 | 1 | 5 | 🟧 12 |
| ResetPasswordPage.tsx | 4 | 0 | 1 | 0 | 1 | 0 | 0 | 3 | 🟧 9 |
| useAuthQueries.ts | 1 | 2 | 0 | 13 | 0 | 0 | 1 | 0 | 🟧 17 |
| AuthLayout.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 6 | 🟧 7 |
| ForgotPasswordPage.tsx | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 3 | 🟨 5 |
| client.ts | 2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟨 2 |
| App.tsx | 2 | 0 | 0 | 0 | 2 | 2 | 0 | 0 | 🟧 6 |
| authStore.ts | 1 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 🟨 2 |
| RegisterPage.tsx | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 🟨 3 |
| auth.ts | 1 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 🟨 2 |
| admin.ts | 0 | 1 | 0 | 0 | 0 | 0 | 1 | 0 | 🟨 2 |
| RoleBasedRoute.tsx | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |
| InstructorBlockedRoute.tsx | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |
| LoadingSpinner.tsx | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 🟩 1 |
| RoleBasedRoute.test.tsx | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |
| LoginPage.test.tsx | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 🟩 1 |

Score legend:
- 🟩 0-2 findings — Clean
- 🟨 3-5 findings — Needs attention
- 🟧 6-10 findings — Needs significant work
- 🟥 10+ findings — Needs rewrite

## Design System Compliance
- ✅ Font tokens: 2 violations (text-slate-500 should be text-on-surface-variant)
- ✅ Spacing rhythm: 2 violations (gap-1.5, py-2.5 not in 4px scale)
- ✅ Color contrast: 3 violations (amber-700 on amber-50 ~3.07:1, text-slate-500 borderline)
- ✅ Glassmorphism: 6 violations (card bg-white, inputs full border, no-line rule)
- ✅ Ghost inputs: 10 violations across all auth pages
- ✅ Reduced motion: 5 violations (4 skeleton + 1 spinner without motion-safe:)
- ✅ Error boundaries: 1 violation (auth routes not wrapped)

## Priority Recommendations

### Must Fix (Blocking / Breaking)
1. **client.ts:123** — Drain `refreshSubscribers` on refresh failure (hanging promises)
2. **auth.ts:136 + client.ts:44** — Add `/auth/reset-password-confirm` to `noBearerEndpoints`
3. **RoleBasedRoute.test.tsx:4** — Export `AccessDenied` or remove the test suite
4. **LoginPage.test.tsx:5** — Fix `User` type import from wrong module

### Should Fix (High Impact)
5. **useAuthQueries.ts:56** — Replace `window.location.replace` with `navigate()`
6. **useAuthQueries.ts:44,162** — Remove unused `useCurrentUser` and `useDeleteUser`
7. **admin.ts:18** — Remove unused `getUser` export
8. **ResetPasswordPage.tsx, RegisterPage.tsx** — Add runtime guard before `token!`
9. **ForgotPasswordPage.tsx:11** — Fix dead `error` state, handle actual API errors
10. **LoginPage.tsx:128** — Fix contradictory `role="alert"` + `aria-live="polite"`
11. **App.tsx:61** — Add skip-to-content link (WCAG 2.4.1)
12. **Focus management** — Move focus on phase transitions in ForgotPasswordPage, ResetPasswordPage

### Design System Alignment
13. **AuthLayout.tsx** — Convert card to glassmorphism (`bg-white/70 backdrop-blur-xl`)
14. **All auth pages** — Convert inputs to ghost inputs (`border-0 border-b`)
15. **All auth pages** — Apply no-line rule (tonal layering, remove borders)
16. **AuthLayout.tsx** — Add `motion-safe:` prefix to all `animate-pulse` instances

### Data Fetching
17. **useAuthQueries.ts** — Fix `useUsers` staleTime: 0 (use 30_000)
18. **useAuthQueries.ts** — Add `enabled` guards to 4 optional-param queries
19. **useAuthQueries.ts** — Add `onSuccess` invalidation to `useRegister`
20. **useAuthQueries.ts** — Change `useUpdateProfile` from `onSettled` to `onSuccess`
