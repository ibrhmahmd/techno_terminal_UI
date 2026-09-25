# Research: Auth Audit Fix

**Phase**: 0 — Design Decisions | **Date**: 2026-05-22

## 1. Register API Token Behavior

**Decision**: After successful registration, redirect to `/login` instead of attempting auto-login with fabricated tokens.

**Rationale**: The `register()` API function returns `Promise<User>` (just the user object, not auth tokens). Calling `login(user.id.toString(), '', user)` passes a fake JWT (the user ID) to the auth store. Every subsequent API call sends this fake token as the Bearer header, causing the server to reject with 401. The 401 interceptor finds no refresh token, calls `logout()`, and redirects to `/login`.

**Alternatives considered**:
- Update backend to return tokens — violates frontend-only scope, requires backend deployment
- Generate a fake token — fragile, no way to create a valid JWT without server secret

## 2. Focus Trapping Implementation

**Decision**: Implement native focus trapping inline in modal components (no library).

**Rationale**: The project has no focus trapping utility. Using a library would add an unnecessary dependency for a feature needed in only 5 modals. Native implementation: `useEffect` with `keydown` listener for Escape (close) and Tab/Shift+Tab (cycle through focusable elements within the modal). Focusable selectors: `a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])`.

**Alternatives considered**:
- `focus-trap-react` library — adds dependency, overkill for 5 modals
- Reusable `FocusTrap` component — good pattern but no shared Modal base component exists; inline is simpler

## 3. Auth Query Keys Integration

**Decision**: Move auth keys from local `authKeys` factory in `useAuthQueries.ts` to `queryKeys.ts` centralized factory.

**Rationale**: Currently auth keys cannot be referenced cross-domain (e.g., a group mutation can't invalidate dashboard cache). Moving to `queryKeys.ts` enables any mutation in the app to invalidate auth caches.

## 4. Mutation Cache Invalidation Strategy

**Decision**: `useUpdateUser` invalidates `authKeys.users`, `authKeys.user(id)`, and `authKeys.all`. `useDeactivateUser` invalidates `authKeys.users` and `authKeys.all`.

**Rationale**: Updating a user affects the list view, the single-user detail view (if used), and potentially the current user cache (if admin updates own profile). Deactivating a user also affects the list and current user cache.

## 5. Register Page Post-Fix Flow

**Decision**: On successful registration, show success message, then redirect to `/login` after a short delay.

**Rationale**: User needs to authenticate with their newly set credentials. Redirect to login with a success message banner (via URL state or localStorage flag).

## 6. Select onChange Validation Pattern

**Decision**: Validate `<select>` values against the union before setting state, using an inline check.

**Rationale**: Replace `as typeof role` asserts with `if (['admin', 'system_admin', 'instructor'].includes(v)) setRole(v as ...)` — the cast is still needed for TypeScript but only after runtime validation.
