# Research Findings: Auth Pages & Logic Audit Fix

**Date**: 2026-06-29

---

## 1. ErrorBoundary Component

| Question | Finding |
|----------|---------|
| Does it exist? | Yes, at `src/components/common/ErrorBoundary.tsx` |
| Import path | `import { ErrorBoundary } from '../components/common/ErrorBoundary'` |
| Props | `children?: ReactNode`, `fallback?: ReactNode` |
| Type | Class component extending `Component<Props, State>` |
| Default fallback | Red error card with Material Symbol `error` icon, "Something went wrong" heading, error message, "Try again" button that resets state |
| Custom fallback? | Yes — pass `fallback` prop to override entirely |

**Decision**: Use `ErrorBoundary` wrapping `<Routes>` in `App.tsx` for auth routes. Use default fallback initially (can be customized later).

---

## 2. Glassmorphism Design Pattern

**Canonical pattern** (from StudentCombobox, SpyCombobox, InstructorCombobox, GroupCombobox):

```tsx
bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl
```

**Variants across codebase**:
- `bg-white/95 backdrop-blur-sm` — sticky headers/footers
- `bg-white/90 backdrop-blur shadow-sm` — hover-reveal bars
- `bg-white/60` / `bg-white/50` — EntityDetailCard semi-transparent sections

**Decision**: Auth card uses `bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl` for consistency with existing combobox panels.

---

## 3. Ghost Input Design Pattern

**Canonical pattern** (from StudentForm, LogActivityModal, ProfileTab, UsersTab):

```tsx
w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors
```

**Variant with disabled** (StudentForm):
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

**Variant with left icon padding** (ParentSearchDropdown):
```tsx
w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 pl-10 pr-4 py-2.5 text-sm rounded-none outline-none transition-colors
```

**Alternate pattern** (EditGroupDialog, ProgressLevelDialog — `border-b-2`):
```tsx
w-full px-3 py-2 bg-transparent border-0 border-b-2 border-surface-container-high focus:ring-0 focus:border-secondary outline-none transition-all rounded-none
```

**Decision**: Use Pattern A (`border-b`, `border-slate-300`) for auth inputs — matches StudentForm which is the primary form pattern in the codebase. Apply consistently across all 4 auth pages.

---

## 4. Motion-Safe Animation Patterns

**Skeleton loading**:
```tsx
motion-safe:animate-pulse
```
Used in: StudentCombobox, SpyCombobox, CardSkeleton, WaitingListPanel

**Transitions/hover**:
```tsx
motion-safe:transition-all motion-safe:duration-200
```
Used in: AdvancedSearchPanel

**Decision**: Add `motion-safe:` prefix to all `animate-pulse` and `animate-spin` instances in auth files. AuthLayout skeleton, LoadingSpinner, and all 4 skeleton blocks.

---

## 5. useLogin Hook Design

**Current state**: LoginPage calls `login()` from `api/auth/auth.ts` directly with raw try/catch. No `useLogin` hook exists.

**Existing pattern** (from `useRegister` in `useAuthQueries.ts`):
```typescript
export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
  })
}
```

**Auth store integration**: LoginPage calls `useAuthStore.getState().login(...)` (aliased as `storeLogin`). This should happen inside the mutation's `onSuccess` callback.

**Query key**: `queryKeys.auth.all` for invalidation.

**Decision**: Add `useLogin` hook in `useAuthQueries.ts` following the `useRegister` pattern:
- Input: `LoginCredentials`
- `mutationFn`: calls `login()` from API
- `onSuccess`: calls `useAuthStore.getState().login(access_token, refresh_token, user)`, invalidates `queryKeys.auth.all`
- Expose `mutate`, `isPending`, `error` via standard `useMutation` return

---

## 6. refreshSubscribers Drain Pattern

**Current behavior** (`client.ts:141-145`):
```typescript
catch (refreshError) {
  await state.logout()
  window.location.replace("/login")
  return Promise.reject(refreshError)
}
```
Bug: `refreshSubscribers` queue is never drained — pending promises hang indefinitely.

**Fix**: Create `onTokenRefreshFailed()` function that drains all subscribers with empty token (or rejects), then call it in the catch block.

**Decision**:
1. Add `onTokenRefreshFailed()` function:
   ```typescript
   function onTokenRefreshFailed() {
     refreshSubscribers.forEach((callback) => callback(''))
     refreshSubscribers = []
   }
   ```
2. Call `onTokenRefreshFailed()` at the start of the `catch` block (before `state.logout()`).

---

## 7. noBearerEndpoints Gap

**Current list** in `client.ts`: `['/auth/login', '/auth/refresh']`

**Missing**: `/auth/reset-password-confirm` — this endpoint sends the recovery token in the Authorization header directly. If auth store has a stale token, the interceptor overwrites it.

**Decision**: Add `/auth/reset-password-confirm` to both `noBearerEndpoints` and `noRefreshEndpoints` in `client.ts`.

---

## 8. Spacing Scale Alignment

**Codebase standard**: 4px spacing scale (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-5` = 20px, `p-6` = 24px).

**Violations found**: `gap-1.5` (6px) and `py-2.5` (10px) on LoginPage.

**Decision**: Replace `gap-1.5` → `gap-2` (8px), replace `py-2.5` → `py-2` (8px).

---

## 9. Token Null-Safety

**Violations**: `RegisterPage.tsx:43` and `ResetPasswordPage.tsx:37` use `token!` non-null assertions.

**Fix**: Add runtime guard before mutation:
```typescript
const token = /* ... extract from URL params ... */
if (!token) {
  setError('Invalid or missing reset token.')
  return
}
```
Then use `token` (not `token!`) in the mutation call.

---

## 10. Storage Event Listener

**Current** (`authStore.ts:55`): reads `localStorage.getItem('auth-storage')` directly.

**Fix**: Use `(e as StorageEvent).newValue` — the event object carries the new value, no need to re-read localStorage.

```typescript
if (e.key === 'auth-storage') {
  const newValue = (e as StorageEvent).newValue
  // use newValue instead of re-reading localStorage
}
```

---

## 11. React.lazy() for Page Imports

**Current**: All 25 pages statically imported in `App.tsx` — entire module graph in initial chunk.

**Risk**: Minimal — React.lazy is a well-established pattern. Each page component receives no props from the router (they use hooks internally). Route-level splitting is standard React practice.

**Fix**: Convert all page imports in `App.tsx` from static to lazy:
```typescript
const LoginPage = React.lazy(() => import('../pages/LoginPage'))
```
Wrap routes in `<Suspense fallback={<PageSkeleton />}>`.

**Performance impact**: Reduces initial chunk size significantly. Users see a short skeleton while the page chunk loads (typically <100ms for cacheable chunks).
