# Implementation Plan: Auth Features Audit & Completion

**Branch**: `035-auth-features-audit` | **Date**: 2026-06-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/035-auth-features-audit/spec.md`

---

## Summary

Close the two remaining frontend auth gaps: (1) add a `/reset-password` page to handle Supabase's password-reset email callback — currently falling through the wildcard route to `/login`; (2) add an MFA status card to the `ProfileTab` backed by the existing stub endpoint. Two other originally-identified gaps (invite flow, admin reset password) are **already implemented** in `UsersTab.tsx` and require no work.

---

## Technical Context

**Language/Version**: TypeScript ~5.9  
**Framework**: React 19 + Vite 8  
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1, Recharts 3  
**Styling**: Tailwind CSS v3.4 (v3 config, despite `@tailwindcss/postcss` v4 in package.json)  
**Testing**: Vitest 4.1 + happy-dom (not jsdom) — test files in `src/tests/`, setup in `src/test/setup.ts`  
**Target Platform**: Browser (modern Chrome, Firefox, Safari, Edge)  
**Project Type**: Frontend SPA (React single-page application)  
**API**: Axios client at `src/api/client.ts`, base URL `/api/v1`, JWT Bearer auth with auto-refresh  
**Icons**: Material Symbols (`material-symbols-outlined` CSS class) + Lucide React components  
**Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body text  
**Performance Goals**: <1s initial load, <200ms navigation, 60fps animations  
**Constraints**: Frontend-only — no backend code. Strict TS (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`). Build must pass `tsc -b && vite build`.  
**Scale/Scope**: Single-page CRM with 18 pages, ~13 API domain modules

---

## Constitution Check

*GATE: Evaluated against `.specify/memory/constitution.md` — all gates pass.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Frontend-Only Scope | ✅ Pass | All changes in `src/`. Backend dependency flagged separately in contracts/. |
| II. Server State Discipline | ✅ Pass | `getMfaStatus` and `resetPasswordWithToken` go through React Query mutations/queries. No raw `fetch()` or direct `useEffect` API calls. |
| III. Global State Minimalism | ✅ Pass | No new Zustand state. Recovery token lives in local `useState` on the page, not the auth store. |
| IV. TypeScript Strict Mode | ✅ Pass | All new types are explicit. `import type` used for type-only imports. No `any`. |
| V. Component Naming Convention | ✅ Pass | `ResetPasswordPage.tsx` → `pages/`. No new modals/tabs needed (MFA section is inline card in ProfileTab). |

---

## Project Structure

### Documentation (this feature)

```text
specs/035-auth-features-audit/
├── plan.md              ← This file
├── research.md          ← Phase 0 (complete)
├── data-model.md        ← Phase 1 (complete)
├── contracts/
│   └── api-endpoints.md ← Phase 1 (complete)
└── tasks.md             ← Phase 2 (/speckit.tasks)
```

### Source Code (changes)

```text
src/
├── api/auth/
│   ├── auth.ts              ← [MODIFY] add getMfaStatus, resetPasswordWithToken
│   └── types.ts             ← [MODIFY] add MfaStatus interface
├── hooks/
│   ├── queryKeys.ts         ← [MODIFY] add queryKeys.auth.mfa
│   └── useAuthQueries.ts    ← [MODIFY] add useMfaStatus, useResetPasswordWithToken
├── pages/
│   └── ResetPasswordPage.tsx ← [NEW]
├── components/settings/
│   └── ProfileTab.tsx        ← [MODIFY] add MFA status card
└── App.tsx                   ← [MODIFY] add /reset-password route
```

---

## Proposed Changes

### Component A — Type Definitions

#### [MODIFY] [types.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/api/auth/types.ts)

Add `MfaStatus` interface (4 lines):

```ts
export interface MfaStatus {
  enrolled: boolean
  method: string | null
}
```

No changes to `User`, `Session`, or `AuditLogEntry`.

---

### Component B — API Layer

#### [MODIFY] [auth.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/api/auth/auth.ts)

Add two new exported functions at the end of the file:

**`getMfaStatus`** — calls stub `GET /auth/me/mfa/status`:
```ts
export async function getMfaStatus(): Promise<MfaStatus> {
  const response = await client.get<ApiResponse<MfaStatus>>('/auth/me/mfa/status')
  return response.data.data
}
```

**`resetPasswordWithToken`** — calls `POST /auth/reset-password-confirm` with recovery Bearer:
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

The custom `headers` object overrides the Axios interceptor's token injection for this single call — valid Axios behavior, no interceptor changes needed.

> ⚠️ **Backend dependency**: `POST /auth/reset-password-confirm` must exist. See `contracts/api-endpoints.md`. If the backend uses a different endpoint name, update only this function.

---

### Component C — Cache Keys

#### [MODIFY] [queryKeys.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/hooks/queryKeys.ts)

Add `mfa` key to the `auth` namespace:
```ts
auth: {
  all: ['auth'] as const,
  sessions: ['auth', 'sessions'] as const,
  activity: ['auth', 'activity'] as const,
  users: ['auth', 'admin', 'users'] as const,
  auditLogins: ['auth', 'admin', 'audit', 'logins'] as const,
  auditPasswordChanges: ['auth', 'admin', 'audit', 'password-changes'] as const,
  auditFailedAttempts: ['auth', 'admin', 'audit', 'failed-attempts'] as const,
  mfa: ['auth', 'mfa'] as const,   // ← NEW
},
```

---

### Component D — React Query Hooks

#### [MODIFY] [useAuthQueries.ts](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/hooks/useAuthQueries.ts)

Add required imports at the top of the file:
```ts
import {
  // ...existing imports...
  getMfaStatus,
  resetPasswordWithToken,
  type ResetPasswordWithTokenRequest,
} from '../api/auth'
```

Add two new hooks in the appropriate sections:

**After `useChangePassword`** (password section):
```ts
export function useResetPasswordWithToken() {
  return useMutation({
    mutationFn: ({ recoveryToken, data }: { recoveryToken: string; data: ResetPasswordWithTokenRequest }) =>
      resetPasswordWithToken(recoveryToken, data),
  })
}
```

**After `useCurrentUser`** (profile section):
```ts
export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.auth.mfa,
    queryFn: getMfaStatus,
    staleTime: 300_000,
    retry: false,
  })
}
```

`retry: false` is intentional — the MFA stub may error in some backend configurations; graceful degradation is preferred over repeated retries.

---

### Component E — New Page

#### [NEW] [ResetPasswordPage.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/pages/ResetPasswordPage.tsx)

Full page component. Key design decisions:
- Styled to match `ForgotPasswordPage` and `LoginPage` (centred card, same CSS classes, same font/icon patterns).
- Token parsed from hash on initial render via `useMemo` — not in `useEffect` (avoids flash).
- Three visual states: `invalid` (bad/missing token), `form` (enter new password), `success` (redirect notice with countdown).
- Password confirm field required — frontend-only check before submit.
- On 401 from backend → shows "link expired" message with link back to `/forgot-password`.
- On success → shows success message + "Back to Login" link (no automatic redirect — avoids confusion).

```tsx
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useResetPasswordWithToken } from '../hooks/useAuthQueries'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

type Phase = 'invalid' | 'form' | 'success'

function parseRecoveryToken(): { token: string; valid: true } | { token: null; valid: false } {
  const params = new URLSearchParams(window.location.hash.slice(1))
  const token = params.get('access_token')
  const type = params.get('type')
  if (token && type === 'recovery') return { token, valid: true }
  return { token: null, valid: false }
}

export function ResetPasswordPage() {
  const { token, valid } = useMemo(parseRecoveryToken, [])
  const [phase, setPhase] = useState<Phase>(valid ? 'form' : 'invalid')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const resetMutation = useResetPasswordWithToken()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    try {
      await resetMutation.mutateAsync({ recoveryToken: token!, data: { new_password: newPassword } })
      setPhase('success')
    } catch {
      setError('This link has expired or has already been used. Please request a new reset link.')
    }
  }

  // ... render per phase (see implementation tasks)
}
```

Visual layout mirrors `ForgotPasswordPage`: full-screen centered card, `bg-surface`, white card with `rounded-xl shadow-lg border border-slate-100`.

---

### Component F — Routing

#### [MODIFY] [App.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/App.tsx)

Add import and route in `<PublicRoute>` block:

```tsx
// Import (with existing auth page imports)
import { ResetPasswordPage } from './pages/ResetPasswordPage'

// Route (inside <Route element={<PublicRoute />}>)
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

Placement: after `/forgot-password` route, before the closing `</Route>`. This ensures authenticated users are redirected to `/dashboard` via `PublicRoute`.

---

### Component G — MFA Status UI

#### [MODIFY] [ProfileTab.tsx](file:///e:/Users/ibrahim/Desktop/techno_terminal_UI/src/components/settings/ProfileTab.tsx)

Add `useMfaStatus` import and a new MFA status card **after** the Change Password card.

The MFA card:
- Shows a shield icon + "Multi-Factor Authentication" heading.
- If `isLoading` → shows a small spinner.
- If `isError` → shows a subtle "Status unavailable" message (no alarming red — it's a stub).
- If `data.enrolled === false` → shows amber "Not enrolled" badge + "MFA enrollment is coming soon" notice.
- If `data.enrolled === true` → shows green "Enrolled" badge + method name.
- No enroll button — per spec FR-005 and research Decision 3.

```tsx
{/* MFA Status */}
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
  <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
    Multi-Factor Authentication
  </h2>
  <MfaStatusCard />
</div>
```

`MfaStatusCard` is a small sub-component defined within `ProfileTab.tsx` (not a separate file — too small to warrant its own file per the naming convention).

---

## Backend Dependency

> ⚠️ **Block for FR-003**: `POST /auth/reset-password-confirm` must be available on the backend before `ResetPasswordPage` can be end-to-end tested. The frontend implementation can be built and code-reviewed without it, but E2E testing of the actual form submission is blocked.

**Mitigation**: The `ResetPasswordPage` can be verified independently by:
1. Manually setting `window.location.hash` in browser dev tools to a mock recovery token.
2. Mocking the API call in a Vitest test.

---

## Verification Plan

### Build Gate
```bash
npm run lint    # zero errors
npm run build   # tsc -b && vite build must succeed
```

### Manual Verification

| Scenario | Steps | Expected |
|----------|-------|----------|
| No token in URL | Navigate to `/reset-password` | "Invalid link" state with `/forgot-password` link |
| Wrong `type` in hash | `/reset-password#access_token=X&type=signup` | "Invalid link" state |
| Already authenticated | Log in, then navigate to `/reset-password` | Redirect to `/dashboard` |
| MFA card — load | Open Settings → Profile | MFA card appears below Change Password |
| MFA card — stub | Card shows "Not enrolled" + "Coming soon" | No error, no enroll button |
| Invite flow | Settings → Users → Invite User | InviteModal opens, form submits (already working ✅) |
| Admin reset | Settings → Users → hover card → Reset | Reset modal opens (already working ✅) |

### Automated Tests (optional — no CI required)

```bash
npm run test -- src/tests/ResetPasswordPage.test.tsx
```

Test cases to cover:
- Renders invalid state when hash is empty.
- Renders invalid state when `type !== "recovery"`.
- Renders form when valid recovery hash is present.
- Shows password mismatch error without calling API.
- Shows success state on mutation success.
- Shows expired-link error on 401 response.

---

## Complexity Tracking

No constitution violations. No complexity exceptions needed.
