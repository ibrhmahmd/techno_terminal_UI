# Research: Auth API Update

**Phase**: 0 — Design Decisions | **Date**: 2026-05-21

## 1. Route Protection Model for Instructor Role

**Decision**: Add a new route wrapper `<TeachingScopeRoute />` (or extend `RoleBasedRoute` with a deny-list) that restricts instructor access to courses, groups, students, attendance, competitions, and teams.

**Rationale**: The current `ProtectedRoute` grants access to all authenticated routes, which would expose finance, staff, settings, and directory to instructors. The new API introduces the `instructor` role, and route protection must be scoped. Rather than modifying every route, wrap the restricted routes in a secondary guard.

**Alternatives considered**:
- Server-side enforcement only (backend returns 403) — rejected because it exposes navigation links users can't use, creating poor UX.
- Per-page role checks — rejected due to boilerplate duplication across 6+ pages.

## 2. API Domain Organization

**Decision**: Keep all authentication endpoints in `src/api/auth/auth.ts` (single file). Add new functions for admin endpoints under a second file `src/api/auth/admin.ts`.

**Rationale**: The auth API file is already 82 lines. Adding 17 more functions would push it past 250 lines, reducing readability. Admin endpoints (`/admin/users/*`, `/admin/audit/*`) are conceptually a separate domain. Self-service and auth endpoints stay in `auth.ts`.

**Alternatives considered**:
- Single file — rejected for maintainability at projected ~300 lines.
- Split into `auth.ts`, `users.ts`, `audit.ts` — over-engineering for this scale.

## 3. React Query Cache Strategy

**Decision**: Use staleTime 0 for user list (admin users tab — needs to reflect role/status changes immediately) and staleTime 2 min for audit logs.

**Rationale**: User management operations (create, update role, deactivate) require immediate cache invalidation for correct UX. Audit logs are read-only historical data where 2 min staleness is acceptable.

**Alternatives considered**:
- `staleTime: 0` for everything — unnecessary network churn for audit logs.
- `staleTime: 5 min` default — acceptable for audit, but user list needs faster refresh.

## 4. Invite Registration UX Flow

**Decision**: Landing page at `/register?token=xxx` — a standalone page (not a modal) that validates the token on load and presents username/password fields.

**Rationale**: Invite links are typically sent via email. Opening to a clean page with the token pre-filled from the URL is the industry standard pattern. Modals cause issues with email clients and mobile.

**Alternatives considered**:
- Inline in Settings page — requires the user to be authenticated (impossible for new users).
- Separate tab in Login page — login flow would need complex state management for invite mode.

## 5. Password Change Fix

**Decision**: Replace the current `resetPassword()` call in ProfileTab (which uses the admin force-reset endpoint) with `changePassword()` (the self-service endpoint that requires current password verification).

**Rationale**: The existing implementation incorrectly calls `POST /auth/users/{id}/reset-password` (admin endpoint) for self-service password change. The new API provides `POST /auth/change-password` with `{current_password, new_password}` for authenticated users. This is a security fix — users should verify their current password before changing it.

## 6. Audit Logs UI Approach

**Decision**: Add three separate tabs under Settings for audit logs (logins, password changes, failed attempts), visible only to `system_admin`. Each uses the existing `DataTable` pagination pattern.

**Rationale**: The three audit endpoints have different required/optional query parameters (failed-attempts requires `from` date). Combining them into one view would create a confusing filter interface. Separate tabs are straightforward.

## 7. New Auth Store Action

**Decision**: Add `updateUser(user: Partial<User>)` action to the Zustand auth store to handle `PATCH /auth/me` responses without a full page reload.

**Rationale**: When a user updates their profile (username/email), the store's `user` object becomes stale. Adding a lightweight action avoids requiring a full token refresh or logout/login cycle.

## 8. CreateUserRequest Role Update

**Decision**: Update `CreateUserRequest.role` type from `'admin' | 'system_admin'` to `'admin' | 'system_admin' | 'instructor'` and add invite endpoint support.

**Rationale**: The API now supports creating users with the `instructor` role, matching the expanded role hierarchy.
