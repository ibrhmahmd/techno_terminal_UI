# Feature Specification: Auth Audit Fix

**Feature Branch**: `019-auth-audit`
**Created**: 2026-05-22
**Status**: Draft
**Input**: Audit of the auth feature produced 54 findings (1 critical, 8 high, 16 medium, 9 low) across 23 files.

## Summary

Fix 54 issues discovered in the auth feature audit: 1 critical runtime bug (RegisterPage fabricates auth tokens), 8 high-severity accessibility violations, 5 dead exports, 2 manual API calls not using React Query mutations, 2 router-link regressions, 1 queryFn with side effects, 2 type safety issues, and numerous missing `aria-hidden` attributes and raw error message leaks.

## User Stories

### User Story 1 - Critical Bug & Runtime Fixes (Priority: P1)

Fix the RegisterPage token fabrication bug, replace `<a href>` with `<Link>` for client-side routing, guard `console.warn` behind DEV check, and fix `getCurrentUser` queryFn side effects.

**Acceptance Scenarios**:
1. **Given** a user registers with a valid invite token, **When** they submit username and password, **Then** `register()` returns valid auth tokens from the server (not a fabricated user ID) and the user is logged in without subsequent 401 errors
2. **Given** an unauthenticated user on the RoleBasedRoute access denied page, **When** they click "Back to Dashboard", **Then** it uses client-side navigation (no full page reload)
3. **Given** a user is on the Settings page, **When** they click the "Notifications" link, **Then** it uses client-side navigation (no full page reload)
4. **Given** a user with a deactivated account has React Query retry their current user fetch, **When** the queryFn detects `is_active === false`, **Then** the logout API is called only once and the redirect is safe

### User Story 2 - Dead Code Removal (Priority: P2)

Remove unused exports: `AccessDenied` component, `useMfaStatus` hook, `useUser` hook, `enrollMfa` function, `AuditUserFilter` component. Remove unnecessary `export` from local-only interfaces. Extract `EVENT_LABELS` constant to shared location.

**Acceptance Scenarios**:
1. **Given** the codebase, **When** grepping for `AccessDenied`, `useMfaStatus`, `useUser`, `enrollMfa`, or `AuditUserFilter` across `src/`, **Then** no imports exist outside the defining file
2. **Given** the `EVENT_LABELS` constant, **When** the backend adds a new event type, **Then** only one file needs to be updated

### User Story 3 - TypeScript & Code Quality (Priority: P2)

Replace unsafe `as { response?: ... }` assertion with `isAxiosError` guard in LoginPage. Replace unsafe `as typeof role` casts on `select` onChange with validation. Change `export default client` to named export.

**Acceptance Scenarios**:
1. **Given** a non-Axios error thrown during login, **When** the catch clause runs, **Then** it uses `isAxiosError` narrowing instead of blind type assertion
2. **Given** a `<select>` dropdown for user roles, **When** an unexpected value appears, **Then** it's caught by validation rather than silently cast

### User Story 4 - React Query & Cache Patterns (Priority: P3)

Migrate manual `createUser` and `resetPassword` calls in UsersTab to React Query mutations with cache invalidation. Move auth keys from local `authKeys` factory to centralized `queryKeys.ts`. Broaden invalidation for `useUpdateUser` and `useDeactivateUser`. Remove redundant `useEffect` sync from ProfileTab.

**Acceptance Scenarios**:
1. **Given** an admin creates a new user, **When** the creation succeeds, **Then** the user list cache is invalidated and the new user appears without manual refresh
2. **Given** the centralized `queryKeys` factory, **When** any domain needs to invalidate auth caches, **Then** it can reference `queryKeys.auth.*` from the shared file

### User Story 5 - Accessibility & UX Polish (Priority: P3)

Add `aria-hidden="true"` to all Material Symbol icons. Add `aria-label` to search input and filter dropdowns in UsersTab. Add `role="dialog"`, `aria-modal`, and focus trapping to all modals. Add `role="tablist"`, `role="tab"`, `aria-selected`, `role="tabpanel"` to Settings page tabs. Replace raw error messages with user-friendly text. Replace generic "Loading..." text with LoadingSpinner.

**Acceptance Scenarios**:
1. **Given** a screen reader user navigates the Settings page, **When** they encounter the tab bar, **Then** it has correct `role="tablist"`/`role="tab"`/`aria-selected` semantics
2. **Given** a screen reader user opens any modal, **When** focus enters the modal, **Then** `role="dialog"` and `aria-modal="true"` are present and focus is trapped
3. **Given** an API error occurs, **When** it's displayed to the user, **Then** it shows a generic user-friendly message (no server-side error text leaked)

## Requirements

### Functional Requirements

- **FR-001**: RegisterPage MUST return valid auth tokens from the register API response and pass them to `authStore.login()`
- **FR-002**: All `<a href>` external-style links to internal routes MUST use React Router `<Link>` component
- **FR-003**: `console.warn()` MUST be guarded by `import.meta.env.DEV` check
- **FR-004**: `getCurrentUser` queryFn MUST NOT have side effects (logout API call, `window.location.replace`)
- **FR-005**: `AccessDenied` component, `useMfaStatus`, `useUser`, `enrollMfa`, `AuditUserFilter` — all unused exports MUST be removed
- **FR-006**: `EVENT_LABELS` constant MUST be extracted to a shared module
- **FR-007**: LoginPage catch clause MUST use `isAxiosError` narrowing instead of type assertion
- **FR-008**: All `as TypeName` casts on `<select>` onChange values MUST include runtime validation
- **FR-009**: `client.ts` MUST use named export instead of `export default`
- **FR-010**: All manual API calls (`createUser`, `resetPassword`) in UsersTab MUST use React Query mutations with cache invalidation
- **FR-011**: Auth query keys MUST be integrated into centralized `queryKeys.ts`
- **FR-012**: `useUpdateUser` and `useDeactivateUser` mutations MUST invalidate all affected cache keys
- **FR-013**: Redundant `useEffect` sync from React Query to Zustand store MUST be removed from ProfileTab
- **FR-014**: All Material Symbol icons MUST have `aria-hidden="true"`
- **FR-015**: All form inputs and filter selects MUST have `aria-label` or associated `<label>`
- **FR-016**: All modals MUST have `role="dialog"`, `aria-modal="true"`, and focus trapping
- **FR-017**: Settings page tab navigation MUST have `role="tablist"`, `role="tab"`, `aria-selected`; tab panels MUST have `role="tabpanel"` and `aria-labelledby`
- **FR-018**: All raw error messages MUST be replaced with user-friendly fallback text
- **FR-019**: Generic "Loading..." text MUST be replaced with `LoadingSpinner` component

### Key Entities

- **Audit Finding**: A discrete issue identified during audit. Has type (bug, dead code, type, fetch, a11y), severity (critical/high/medium/low), file path, line number, description, and remediation.

## Edge Cases

- The RegisterPage currently passes `user.id.toString()` as token — after fix, the `register()` API must actually return tokens. If the backend does not return tokens, the fallback should redirect to `/login` instead
- `getCurrentUser` queryFn side effect: React Query retry mechanism could call `logout()` API multiple times and race with `window.location.replace`
- `as typeof role` cast on select values: an unexpected `<option>` value passed by future code would bypass TypeScript checks
- Focus trapping for modals must handle escape key and tab cycling in both directions
- Tab panel `aria-labelledby` must reference a unique `id` on each tab button

## Success Criteria

- **SC-001**: Post-registration navigation works without 401 errors
- **SC-002**: Lighthouse Accessibility score improves by at least 10 points on Settings page
- **SC-003**: `npm run build` passes with zero errors
- **SC-004**: `npm run lint` passes with zero new errors
- **SC-005**: Zero `: any` or `as any` in modified files
- **SC-006**: All modified forms/inputs are navigable via keyboard only

## Assumptions

- The register API endpoint will be updated to return auth tokens (or the fix will redirect to login)
- Focus trapping library not available — will implement native focus trapping
- No breaking changes to existing accessibility patterns outside the auth feature
