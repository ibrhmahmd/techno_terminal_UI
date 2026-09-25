# Quickstart: Auth API Update

**Phase**: 1 — Design & Contracts | **Date**: 2026-05-21

## Implementation Order (by User Story Priority)

### Sprint 1: Self-Service (P1)

1. **Fix `ProfileTab.tsx`** — Replace admin `resetPassword()` call with `changePassword()` (requires `current_password`). Add `PATCH /auth/me` profile editing. Add session list and "logout all" button.
2. **Add `/register` page** — Standalone page at `/register?token=xxx` with username/password form. Calls `POST /auth/register`.
3. **Add `/forgot-password` page** — Simple email form. Calls `POST /auth/forgot-password`.

### Sprint 2: Admin User Management (P2)

4. **Replace mock data in `UsersTab.tsx`** — Wire to `GET /admin/users` with search/filter. Add invite modal (`POST /admin/users/invite`). Add deactivate button (`DELETE /admin/users/{id}`). Add inline role editing.
5. **Add `instructor` role** to `CreateUserRequest` type and dropdown.
6. **Add `SessionsTab.tsx`** and **`ActivityTab.tsx`** — New Settings tabs for session management and activity log.

### Sprint 3: Audit & Role Protection (P3)

7. **Add audit log pages/tabs** — Three separate tabs under Settings (system_admin only) for login, password-change, and failed-attempts audits.
8. **Route protection update** — Add instructor role guard restricting access to teaching-scope routes.
9. **Auth store update** — Add `updateUser` action.

## Files to Create

| File | Purpose |
|------|---------|
| `src/api/auth/admin.ts` | Admin user management & audit API functions |
| `src/pages/RegisterPage.tsx` | Invite registration page |
| `src/pages/ForgotPasswordPage.tsx` | Forgot password page |
| `src/components/settings/SessionsTab.tsx` | Session list & revoke UI |
| `src/components/settings/ActivityTab.tsx` | Activity log tab |
| `src/hooks/useAuthQueries.ts` | React Query hooks for auth domain |

## Files to Modify

| File | Change |
|------|--------|
| `src/api/auth/auth.ts` | Add 11 new API functions + update `CreateUserRequest` role type |
| `src/store/authStore.ts` | Add `updateUser` action |
| `src/components/settings/ProfileTab.tsx` | Replace password reset with change-password, add profile editing, sessions, activity |
| `src/components/settings/UsersTab.tsx` | Replace mock data with real API, add invite/deactivate/role-edit |
| `src/pages/SettingsPage.tsx` | Add Sessions, Activity, Audit tabs (conditionally by role) |
| `src/pages/LoginPage.tsx` | Add "Forgot Password?" link |
| `src/App.tsx` | Add `/register` route, add `/forgot-password` route, update instructor role protection |
| `src/components/common/RoleBasedRoute.tsx` | Support instructor role restrictions if needed |

## Verification

```bash
npm run lint      # Zero errors
npm run build     # tsc -b && vite build must succeed
npm run test      # Pass all tests
```

## Key Decisions

- **`instructor` role** gets teaching scope: courses, groups, students, attendance, competitions, teams. No access to finance, staff, settings, notifications, or directory.
- **User lifecycle states**: Active / Invited(pending) / Deactivated — displayed with distinct badges.
- **Data volume**: Small institution (≤500 users, ≤10K audit entries/month).
- **Cache**: `staleTime: 0` for user list, `staleTime: 120s` for audit logs.
- **New Zustand action**: `updateUser` on auth store for immediate profile update reflection.
