# Feature Specification: Auth Pages & Logic Audit Fix

**Feature Branch**: `052-auth-audit`
**Created**: 2026-06-29
**Status**: Draft
**Input**: `/audit-feature AUTH related pages and logic`

---

## Audit Overview

Full feature audit of the auth domain (pages, components, hooks, API functions, store, route guards, and client). 65 findings across 8 phases — 17 high, 20 medium, 28 low. Zero critical.

### Files Scoped

| Category | Files |
|----------|-------|
| Pages | `LoginPage.tsx`, `RegisterPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` |
| Components | `AuthLayout.tsx`, `RoleBasedRoute.tsx`, `InstructorBlockedRoute.tsx`, `LoadingSpinner.tsx` |
| Hooks | `useAuthQueries.ts` |
| API | `client.ts`, `auth/index.ts`, `auth/auth.ts`, `auth/admin.ts`, `auth/types.ts` |
| Store | `authStore.ts` |
| App | `App.tsx` |
| Tests | `authStore.test.ts`, `authApi.test.ts`, `client.test.ts`, `LoginPage.test.tsx`, `RoleBasedRoute.test.tsx` |

---

## Findings by Severity

### 🔴 Critical (0)
None.

### 🟧 High (17)
| Phase | File:Line | Finding | Risk |
|-------|-----------|---------|------|
| Bug | `client.ts:123` | `refreshSubscribers` queue never drained on token refresh failure — pending promises hang indefinitely | breaking |
| Bug | `auth.ts:136` | `/auth/reset-password-confirm` missing from `noBearerEndpoints` — recovery token overwritten by interceptor | moderate |
| Bug | `useAuthQueries.ts:56` | `window.location.replace` inside React hook destroys all client state; should use `navigate()` | moderate |
| DeadCode | `useAuthQueries.ts:44` | `useCurrentUser` hook defined but never imported by any production component | safe |
| DeadCode | `useAuthQueries.ts:162` | `useDeleteUser` hook defined but never imported | safe |
| DeadCode | `admin.ts:18` | `getUser()` exported but never imported anywhere | safe |
| DeadCode | `RoleBasedRoute.test.tsx:4` | `AccessDenied` imported but not exported from source — test would fail at runtime | breaking |
| A11y | `LoginPage.tsx:128` | Contradictory `role="alert"` + `aria-live="polite"` causes assertive announcements every second | safe |
| A11y | `ForgotPasswordPage.tsx:26` | Focus not moved on success phase transition — screen reader users disoriented | safe |
| A11y | `ResetPasswordPage.tsx:61` | Focus not moved on success/invalid phase transition | safe |
| A11y | `App.tsx:61` | No skip-to-content link — violates WCAG 2.4.1 Bypass Blocks | moderate |
| Perf | `App.tsx:6` | All 25 pages statically imported — entire module graph in initial chunk | moderate |
| UI | `AuthLayout.tsx:95` | Auth card uses solid `bg-white` instead of glassmorphism (`bg-white/70 backdrop-blur-xl`) | moderate |
| UI | `LoginPage.tsx:149` | Inputs use full border instead of ghost inputs (`border-0 border-b`) | moderate |
| UI | `RegisterPage.tsx:72` | Same ghost input violation | moderate |
| UI | `ForgotPasswordPage.tsx:66` | Same ghost input violation | moderate |
| UI | `ResetPasswordPage.tsx:100` | Same ghost input violation | moderate |

### 🟨 Medium (20)
| Phase | File:Line | Finding |
|-------|-----------|---------|
| Bug | `ForgotPasswordPage.tsx:11` | Error state variable declared, initialized, but never set — dead code |
| Bug | `RegisterPage.tsx:43` | `token!` non-null assertion without runtime guard before mutation |
| Bug | `ResetPasswordPage.tsx:37` | `token!` non-null assertion without runtime guard |
| Bug | `ResetPasswordPage.tsx:10` | `window.location.hash` instead of `useLocation()` |
| Bug | `ResetPasswordPage.tsx:18` | `useMemo` with empty deps doesn't react to URL hash changes |
| Bug | `LoginPage.tsx:58` | Remember Me email only persisted on submit, not on checkbox change |
| Bug | `authStore.ts:55` | Storage event listener reads `localStorage` directly instead of `e.newValue` |
| DataFetch | `useAuthQueries.ts:147` | `useUsers` sets `staleTime: 0` disabling cache entirely |
| A11y | `LoginPage.tsx:119` | Error rendered but focus not moved to it |
| A11y | `App.tsx:66` | Auth routes not wrapped in `ErrorBoundary` |
| A11y | `AuthLayout.tsx:18` | Skeleton `animate-pulse` without `motion-safe:` guard |
| A11y | `LoginPage.tsx:128` | `text-amber-700` on `bg-amber-50` fails WCAG AA (~3.07:1) |
| A11y | `LoadingSpinner.tsx:20` | `animate-spin` without `motion-safe:` guard |
| Perf | `App.tsx:35` | `useState` eager evaluation instead of function-initializer form |
| Arch | `LoginPage.tsx:5` | `login` API called directly from page instead of through hook |
| UI | `AuthLayout.tsx:19,23,29,39` | 4 `animate-pulse` instances without `motion-safe:` guard |
| UI | `LoginPage.tsx:135` | `gap-1.5` not in 4px spacing scale |
| UI | `LoginPage.tsx:149` | `py-2.5` not in 4px spacing scale |

### 🟩 Low (28)
Includes: 6 stale-time deviations (intentional, sub-30s), 3 barrel bypass imports, 4 missing `enabled` guards on optional-param queries, 2 missing `invalidateQueries` on mutations, 1 raw `axios` import (`isAxiosError`), 1 unsafe type cast (`token!`), 1 zustand hydration guard missing (safe behind ProtectedRoute), 1 attendance route stub, 1 error styling inconsistency, 2 contrast issues, 2 font token omissions.

---

## User Stories

### US1 — Fix Runtime Bugs & Security Issues (P1)
As a developer, I want auth runtime bugs fixed so that password reset works reliably, token refresh doesn't leak hanging promises, and the app doesn't crash on edge cases.
**Acceptance**: `client.ts` drains `refreshSubscribers` on failure; `/auth/reset-password-confirm` added to `noBearerEndpoints`; `token!` assertions guarded; `ForgotPasswordPage` error state works; `authStore` storage event uses `e.newValue`; Remember Me persists on checkbox change.

### US2 — Remove Dead Code (P2)
As a developer, I want unused hooks (`useCurrentUser`, `useDeleteUser`) and API functions (`getUser`) removed, and broken test imports fixed.
**Acceptance**: `useCurrentUser` and `useDeleteUser` removed from `useAuthQueries.ts`; `getUser` removed from `admin.ts`; `AccessDenied` test fixed; `User` type import fixed in `LoginPage.test.tsx`.

### US3 — Align Auth UI with Design System (P2)
As a user, I want auth pages to follow the same design patterns as the rest of the app — glassmorphism cards, ghost inputs, no-line rule, reduced-motion support.
**Acceptance**: Auth card uses `bg-white/70 backdrop-blur-xl`; all inputs use `border-0 border-b` (ghost); skeleton uses `motion-safe:animate-pulse`; spacing uses 4px multiples; error banners consistent across all 4 pages; `text-on-surface-variant` used instead of `text-slate-500`.

### US4 — Improve Accessibility (P2)
As a screen reader user, I want proper focus management on phase transitions, a skip-to-content link, and non-contradictory ARIA attributes.
**Acceptance**: Rate-limit countdown uses `role="alert"` only (not `aria-live="polite"`); focus moved to error messages on submit failure; focus moved to success headings on phase transitions; skip-to-content link added to `App.tsx`; auth routes wrapped in `ErrorBoundary`; `text-amber-800` used instead of `text-amber-700`.

### US5 — Optimize Data Fetching (P3)
As a developer, I want consistent cache configuration and proper query guards across all auth hooks.
**Acceptance**: `useUsers` staleTime changed from 0 to `30_000`; `enabled` guards added to `useMyActivity`, `useUsers`, `useAuditLogins`, `useAuditPasswordChanges`; `useRegister` invalidates `queryKeys.auth.users` on success; `useUpdateProfile` uses `onSuccess` instead of `onSettled`.

### US6 — Architecture & Performance (P3)
As a developer, I want `LoginPage` to use a custom hook instead of calling the API directly, and `App.tsx` to use `React.lazy()` for page components.
**Acceptance**: `useLogin` hook created and used by `LoginPage`; `LoginPage` imports consolidated through barrel; `App.tsx` uses `React.lazy()` + `Suspense` for all page imports.

---

## Boundaries

### Frontend only
All fixes are in `src/` TypeScript/TSX files. No new API endpoints, no new Zustand stores, no backend changes.

### No speculative refactoring
Do not rewrite working code beyond the specific scope of each finding. Fix the bug, remove the dead code, align with design system — don't restructure.

### Changes must pass build
All changes must pass `npm run build` (tsc -b && vite build) with zero errors.

---

## Dependencies & Assumptions
- The glassmorphism card styling matches patterns in `StudentCombobox.tsx`, `SpyCombobox.tsx`, `EditGroupDialog.tsx`
- Ghost input styling matches `StudentForm.tsx`, `EditGroupDialog.tsx`, `LogActivityModal.tsx`
- `ErrorBoundary` component exists at `src/components/common/ErrorBoundary.tsx`
- `formatTime` utility exists at `src/utils/formatting.ts` (no inline time formatting found, but pattern should be maintained)
