# API Endpoint Contracts: Auth Features Audit

**Phase 1 Output** | Spec: `specs/035-auth-features-audit/spec.md`  
**Date**: 2026-06-04

This document describes the backend API endpoints consumed by the new/modified frontend code in this feature. Existing endpoints are marked ✅. New endpoints required from the backend are marked ⚠️.

---

## Endpoints Consumed

### 1. Password Reset with Recovery Token ⚠️ (New backend endpoint)

**Backend dependency — verify/implement before frontend can ship FR-003.**

| Field | Value |
|-------|-------|
| Method | `POST` |
| Path | `/api/v1/auth/reset-password-confirm` |
| Auth | `Bearer <recovery_access_token>` (Supabase recovery JWT) |
| Body | `{ "new_password": "string (min 8 chars)" }` |
| Success | `200 { success: true, data: null, message: "Password reset successful" }` |
| Error — bad token | `401 { success: false, error: "AuthError", message: "..." }` |
| Error — weak password | `422 { success: false, error: "ValidationError", message: "..." }` |

**Behavior contract**: The recovery Bearer token is a Supabase-issued JWT with `type=recovery`. The backend must accept it via the standard `get_current_user()` middleware, then update the user's password without requiring `current_password`. Supabase considers possession of the recovery token as sufficient proof of identity.

**Alternative (if backend confirms)**: If `POST /auth/change-password` can accept a recovery token with an omitted/empty `current_password`, update `resetPasswordWithToken` in `auth.ts` to use that endpoint instead.

---

### 2. MFA Status ✅ (Stub — already exists)

| Field | Value |
|-------|-------|
| Method | `GET` |
| Path | `/api/v1/auth/me/mfa/status` |
| Auth | `Bearer <access_token>` |
| Success | `200 { success: true, data: { enrolled: false, method: null } }` |

Current stub always returns `enrolled: false`. Frontend handles both states.

---

### 3. MFA Enroll ✅ (Stub — exists but not consumed by this feature)

| Field | Value |
|-------|-------|
| Method | `POST` |
| Path | `/api/v1/auth/me/mfa/enroll` |
| Status | Stub only — **not called** by this feature implementation |

The frontend will display a "coming soon" notice instead of wiring this endpoint. It will be connected in a future feature when the backend stub becomes functional.

---

## Routing Contract

### New Frontend Route

| Route | Guard | Component |
|-------|-------|-----------|
| `/reset-password` | `<PublicRoute>` (unauthenticated only) | `ResetPasswordPage` |

**URL parameter**: Recovery token arrives in the hash fragment — not a query param, not a path param.  
Format: `#access_token=TOKEN&type=recovery&...`

**Authenticated access**: An already-logged-in user hitting `/reset-password` is redirected to `/dashboard` by `PublicRoute` — consistent with `/login`, `/register`, `/forgot-password`.
