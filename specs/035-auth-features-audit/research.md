# Research: Auth Features Audit & Completion

**Phase 0 Output** | Spec: `specs/035-auth-features-audit/spec.md`  
**Date**: 2026-06-04

---

## Critical Finding: Spec Gaps Already Closed

After full source-code review, two of the four spec gaps are **already implemented**:

| Spec Gap | Status | Evidence |
|----------|--------|----------|
| FR-001 — Invite flow in UsersTab | ✅ **Already done** | `InviteModal` component at UsersTab.tsx:194–291, "Invite User" button at :402, `useInviteUser` wired at :195 |
| FR-002 — Admin force-reset password | ✅ **Already done** | Reset modal at UsersTab.tsx:583–607, "Reset" button per card at :509, `useResetPassword` wired at :310 |
| FR-003/004 — `/reset-password` route | ❌ **Missing** | App.tsx has no `/reset-password` route; wildcard `*` → `/login` catches it |
| FR-005 — MFA status in ProfileTab | ❌ **Missing** | No MFA API function, no hook, no UI section in ProfileTab.tsx |

**Scope adjustment**: This plan covers FR-003/004 and FR-005 only.

---

## Decision 1: Supabase Reset Callback URL Format

**Decision**: Parse the recovery token from the **URL hash fragment** (`window.location.hash`).

**Rationale**: Supabase's implicit/magic-link flow appends the token as a hash:
```
/reset-password#access_token=TOKEN&token_type=bearer&type=recovery&refresh_token=RTOKEN
```
Hash fragments are not sent to the server (safe), already used by Supabase in all non-PKCE flows, and consistent with the existing backend which issues implicit JWTs.

**Alternatives considered**:
- PKCE flow (`?code=...`): Requires Supabase SDK and a backend token exchange — not present in this app.
- Query params: Would expose tokens in server logs and referrer headers.

**Implementation**: `new URLSearchParams(window.location.hash.slice(1))` parses the fragment correctly.

---

## Decision 2: Backend Endpoint for Self-Service Password Reset

**Decision**: Use **`POST /auth/change-password`** with the recovery `access_token` as Bearer, but with an adapted request body that omits `current_password`.

**Rationale**: The recovery `access_token` from Supabase is a fully valid Supabase JWT — the backend's `get_current_user()` auth middleware will accept it as Bearer. The backend's `POST /auth/change-password` currently requires `current_password`. However, for the recovery flow, Supabase itself considers the possession of the recovery token sufficient proof of identity.

**Dependency flag ⚠️**: The backend endpoint `POST /auth/change-password` currently has the signature `{ current_password, new_password }` (both required). For the recovery flow, `current_password` is not available. **One of the following must be true for this to work**:
- Option A: The backend already handles a missing/empty `current_password` when the token type is `recovery`. ← *Verify with backend team.*
- Option B: The backend exposes a separate `POST /auth/reset-password-confirm` endpoint that accepts just `{ new_password }` with a recovery Bearer token.

**Frontend plan**: Add `resetPasswordWithToken(newPassword, recoveryToken)` → calls `POST /auth/reset-password-confirm` with `{ new_password }`. This is the endpoint name expected from the backend. The frontend type is clean regardless of which option the backend implements.

**Fallback**: If backend Option A is confirmed, the function can be simplified to call `POST /auth/change-password` with `current_password: ""`.

---

## Decision 3: MFA Status Display Strategy

**Decision**: Show a **read-only status card** in ProfileTab with a "Not enrolled" badge and a "Coming soon" notice. No enroll button.

**Rationale**: The backend stubs `GET /auth/me/mfa/status` and `POST /auth/me/mfa/enroll` — both exist but the enroll endpoint is non-functional. Spec FR-005 explicitly says "coming soon indicator when the backend stub returns `enrolled: false`." Rendering an enroll button that fails would be a worse UX than a clear coming-soon state.

**Alternatives considered**:
- Show enroll button + disable it: Confusing — users may wonder why it's disabled.
- Hide MFA section entirely: Loses the scaffolding value for when MFA goes live.
- Full TOTP flow: Out of scope per spec assumptions.

---

## Decision 4: `/reset-password` Route Guard

**Decision**: Place `/reset-password` under `<PublicRoute>` so authenticated users are redirected to `/dashboard`.

**Rationale**: A logged-in user following a stale reset link should land safely on the dashboard, not see a confusing "set new password" form. `PublicRoute` already handles this redirect (App.tsx:50–55). The spec edge case confirms this behavior is expected.

**Note**: The `access_token` in the hash is ephemeral and single-use — Supabase invalidates it after first use. No special token revocation logic is needed on the frontend.

---

## Decision 5: Error Message Differentiation in RegisterPage

**Finding**: RegisterPage already renders `err.message` directly from the server response — server returns specific messages for expired/used tokens. No frontend change needed. Spec FR-006 ("specific, actionable error") is effectively already met by the server messages passing through.

**Verdict**: RegisterPage is out of scope for this implementation.

---

## Summary: Actual Work Needed

| Task | File(s) | Size |
|------|---------|------|
| New `ResetPasswordPage` | `src/pages/ResetPasswordPage.tsx` | ~120 lines |
| New API function `resetPasswordWithToken` | `src/api/auth/auth.ts` | +5 lines |
| New hook `useResetPasswordWithToken` | `src/hooks/useAuthQueries.ts` | +8 lines |
| Register route in App.tsx | `src/App.tsx` | +2 lines |
| New `getMfaStatus` API function | `src/api/auth/auth.ts` | +5 lines |
| New type `MfaStatus` | `src/api/auth/types.ts` | +4 lines |
| New hook `useMfaStatus` | `src/hooks/useAuthQueries.ts` | +8 lines |
| Add MFA cache key | `src/hooks/queryKeys.ts` | +1 line |
| MFA status card in ProfileTab | `src/components/settings/ProfileTab.tsx` | +30 lines |

**Backend dependency**: Confirm or add `POST /auth/reset-password-confirm` endpoint accepting `{ new_password }` with recovery Bearer.
