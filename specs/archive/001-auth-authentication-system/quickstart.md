# Quickstart: Auth Authentication System

## Integration Walkthrough

This guide explains how the auth system works end-to-end for developers working on the TechnoTerminal CRM frontend.

### Architecture Overview

```
User → LoginPage → auth.login() → POST /api/v1/auth/login
                                       ↓
                              Backend returns {access_token, refresh_token, user}
                                       ↓
                              authStore.login(token, refreshToken, user)
                                       ↓
                              Zustand persist → localStorage key 'auth-storage'
                                       ↓
                              Navigate to /dashboard
```

### Adding a New Protected Page

1. Create your page component in `src/pages/`
2. In `src/App.tsx`, add a route inside the `<ProtectedRoute>` wrapper section:

```typescript
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    {/* ... existing routes ... */}
    <Route path="/your-new-route" element={<YourNewPage />} />
  </Route>
</Route>
```

### Adding Role-Based Access for a Route

Wrap with `RoleBasedRoute`:

```typescript
<Route element={<RoleBasedRoute allowedRoles={['admin', 'system_admin']} />}>
  <Route element={<AppLayout />}>
    <Route path="/admin-panel" element={<AdminPanelPage />} />
  </Route>
</Route>
```

### Calling Authenticated APIs

All API functions automatically include the Bearer token via the Axios interceptor. Just use the `client` imported from `src/api/client.ts`:

```typescript
import client from '../api/client'

async function fetchData() {
  const response = await client.get('/some/endpoint')
  return response.data
}
```

Or use domain-specific API functions:

```typescript
import { someApiCall } from '../api/some-domain'
const data = await someApiCall()
```

### Handling Auth in Components

Access the current user or auth state:

```typescript
import { useAuthStore } from '../store/authStore'

function MyComponent() {
  const { user, isAuthenticated, token } = useAuthStore()
  // ...
}
```

### Testing Considerations

- Auth state is persisted to localStorage. In tests, reset before each test:
  ```typescript
  beforeEach(() => {
    localStorage.clear()
    // Reset Zustand store state
    useAuthStore.setState({ token: null, refreshToken: null, user: null, isAuthenticated: false })
  })
  ```
- To simulate an authenticated user in tests:
  ```typescript
  useAuthStore.setState({
    token: 'mock-token',
    refreshToken: 'mock-refresh',
    user: { id: 1, email: 'test@test.com', role: 'admin', /* ... */ },
    isAuthenticated: true,
  })
  ```
- Axios interceptor tests should use `axios.create` with a mock adapter

### Debug Mode

Enable verbose API logging:

```typescript
localStorage.setItem('api_debug', 'true')
```

This logs all requests, responses, and errors to console. Auto-enabled in `import.meta.env.DEV`.

### Common Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| Route guard shows blank screen briefly | Zustand hydration not complete | `ProtectedRoute` handles this via `useHasHydrated()` hook |
| Token refresh fails silently | No refresh token in store | `client.ts` interceptor handles this — logs out user |
| 401 loop | `_retry` flag not set | Each retry sets `originalRequest._retry = true` to prevent infinite loop |
| ESLint noUnusedLocals on store | Destructuring unused fields | Remove unused fields from `useAuthStore()` destructuring |

### Files Reference

| File | Purpose |
|------|---------|
| `src/api/client.ts` | Axios instance with JWT injection + 401 refresh |
| `src/api/auth/auth.ts` | Auth API functions (login, refresh, logout, etc.) |
| `src/store/authStore.ts` | Zustand store with persist for auth state |
| `src/App.tsx` | Route guards (ProtectedRoute, PublicRoute) |
| `src/components/common/RoleBasedRoute.tsx` | Role-based access guard |
| `src/pages/LoginPage.tsx` | Login form page |
