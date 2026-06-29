# Quickstart: Auth Audit Fix

**Branch**: `051-login-page-redesign` | **Spec**: `specs/052-auth-audit/spec.md`

---

## Files to modify (17 files)

### Runtime Bugs
1. `src/api/client.ts` — add `onTokenRefreshFailed()`, drain subscribers in catch block; add `/auth/reset-password-confirm` to both exclusion lists
2. `src/pages/LoginPage.tsx` — fix Remember Me persistence on checkbox change
3. `src/pages/ForgotPasswordPage.tsx` — wire up dead `error` state variable
4. `src/pages/RegisterPage.tsx` — guard `token!` with runtime check
5. `src/pages/ResetPasswordPage.tsx` — guard `token!`, use `useLocation()` instead of `window.location.hash`
6. `src/store/authStore.ts` — use `(e as StorageEvent).newValue` instead of `localStorage.getItem()`

### Dead Code
7. `src/hooks/useAuthQueries.ts` — remove `useCurrentUser`, `useDeleteUser`; add `useLogin`
8. `src/api/auth/admin.ts` — remove `getUser()` export

### Design System Alignment
9. `src/components/auth/AuthLayout.tsx` — glassmorphism card, motion-safe skeleton
10. `src/pages/LoginPage.tsx` — ghost inputs, fix spacing scale
11. `src/pages/RegisterPage.tsx` — ghost inputs
12. `src/pages/ForgotPasswordPage.tsx` — ghost inputs
13. `src/pages/ResetPasswordPage.tsx` — ghost inputs, consistent error styling

### Accessibility
14. `src/App.tsx` — add skip-to-content link, wrap auth routes in ErrorBoundary
15. `src/pages/LoginPage.tsx` — fix ARIA contradiction, focus management, amber contrast
16. `src/pages/ForgotPasswordPage.tsx` — focus management on phase transitions
17. `src/pages/ResetPasswordPage.tsx` — focus management on phase transitions

### Data Fetching
18. `src/hooks/useAuthQueries.ts` — fix staleTime (0 → 30_000), add `enabled` guards, fix invalidations

### Architecture & Performance
19. `src/pages/LoginPage.tsx` — use new `useLogin` hook instead of direct API call
20. `src/App.tsx` — React.lazy() for all page imports + Suspense

### Tests
21. `src/tests/auth/RoleBasedRoute.test.tsx` — fix AccessDenied import
22. `src/tests/auth/LoginPage.test.tsx` — fix User type import path

---

## Build & Verify

```bash
npm run build   # tsc -b && vite build — must pass with zero errors
npm run lint    # ESLint — zero errors
npm run test    # Vitest — all passing
```

---

## Design Reference Patterns

| Pattern | Tailwind Classes |
|---------|-----------------|
| Glassmorphism card | `bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl` |
| Ghost input | `w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors` |
| Motion-safe skeleton | `motion-safe:animate-pulse` |
| Motion-safe spinner | `motion-safe:animate-spin` |
