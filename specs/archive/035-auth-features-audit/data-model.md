# Data Model: Auth Features Audit & Completion

**Phase 1 Output** | Spec: `specs/035-auth-features-audit/spec.md`  
**Date**: 2026-06-04

---

## Existing Types (unchanged)

### `User` (`src/api/auth/types.ts`)

```ts
interface User {
  id: number
  employee_id: number | null
  username: string
  email: string
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string | null
}
```

No changes needed. `invite_expires_at` is on the `InviteResponse` (already in `admin.ts`), not on `User`.

---

## New Types

### `MfaStatus` → add to `src/api/auth/types.ts`

```ts
export interface MfaStatus {
  enrolled: boolean
  method: string | null   // e.g. "totp" | null — stub returns null
}
```

**Validation rules**: `enrolled` is always boolean; `method` is null when not enrolled.  
**State transitions**: `enrolled: false` (current stub) → `enrolled: true` (future, when backend enables TOTP).

---

## URL Contract: Recovery Callback

The Supabase password-reset email callback arrives at `/reset-password` with tokens in the **hash fragment**:

```
/reset-password#access_token=TOKEN&token_type=bearer&type=recovery&refresh_token=RTOKEN&expires_in=3600
```

### Parsed fields (via `new URLSearchParams(window.location.hash.slice(1))`)

| Field | Type | Usage |
|-------|------|-------|
| `access_token` | `string` | Recovery JWT; passed as Bearer to `POST /auth/reset-password-confirm` |
| `type` | `string` | Must equal `"recovery"` to confirm this is a password-reset callback |
| `refresh_token` | `string` | Not used by the reset page (single-use session) |
| `expires_in` | `string` | Not displayed; token is ephemeral |

### Guard conditions

| State | Condition | UI Response |
|-------|-----------|-------------|
| Valid reset link | `type === "recovery"` && `access_token` present | Show new-password form |
| Missing token | `access_token` absent or hash empty | Show error + link to `/forgot-password` |
| Expired token | Backend returns 401 on submit | Show "link expired" message + link to `/forgot-password` |
| Already used | Backend returns 401 on submit | Same as expired |

---

## New API Functions

### `resetPasswordWithToken` → `src/api/auth/auth.ts`

```ts
export interface ResetPasswordWithTokenRequest {
  new_password: string
}

export async function resetPasswordWithToken(
  recoveryToken: string,
  request: ResetPasswordWithTokenRequest
): Promise<void> {
  await client.post('/auth/reset-password-confirm', request, {
    headers: { Authorization: `Bearer ${recoveryToken}` },
  })
}
```

> **Note**: Overrides the Axios interceptor's token with the recovery token for this single call.
> **Backend dependency**: `POST /auth/reset-password-confirm` endpoint must exist and accept `{ new_password }` with a Supabase recovery Bearer token, without requiring `current_password`.

### `getMfaStatus` → `src/api/auth/auth.ts`

```ts
export async function getMfaStatus(): Promise<MfaStatus> {
  const response = await client.get<ApiResponse<MfaStatus>>('/auth/me/mfa/status')
  return response.data.data
}
```

---

## New Query Keys

### Addition to `queryKeys.auth` → `src/hooks/queryKeys.ts`

```ts
auth: {
  // ... existing keys ...
  mfa: ['auth', 'mfa'] as const,
}
```

---

## New React Query Hooks

### `useResetPasswordWithToken` → `src/hooks/useAuthQueries.ts`

```ts
export function useResetPasswordWithToken() {
  return useMutation({
    mutationFn: ({ recoveryToken, data }: { recoveryToken: string; data: ResetPasswordWithTokenRequest }) =>
      resetPasswordWithToken(recoveryToken, data),
  })
}
```

No cache invalidation — recovery sessions are ephemeral; the user navigates to `/login` on success.

### `useMfaStatus` → `src/hooks/useAuthQueries.ts`

```ts
export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.auth.mfa,
    queryFn: getMfaStatus,
    staleTime: 300_000,  // 5 min — same as current user
    retry: false,        // Graceful fallback if stub errors
  })
}
```

`retry: false` is intentional — if the MFA stub errors, the ProfileTab degrades gracefully rather than hammering the endpoint.

---

## Component State Model: `ResetPasswordPage`

```ts
// Local state (no server state needed until submit)
type ResetPageState =
  | { phase: 'loading' }          // parsing hash on mount
  | { phase: 'invalid' }          // no/bad token in hash
  | { phase: 'form'; recoveryToken: string }   // show new-password form
  | { phase: 'success' }          // submitted OK → show redirect notice

// Form fields (phase: 'form')
newPassword: string       // controlled input, minLength 8
confirmPassword: string   // controlled input, must match newPassword
error: string | null      // server error or client validation
```
