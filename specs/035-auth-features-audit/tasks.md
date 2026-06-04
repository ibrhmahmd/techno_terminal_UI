# Tasks: Auth Features Audit & Completion

**Input**: Design documents from `specs/035-auth-features-audit/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api-endpoints.md ✅

**Scope**: 2 remaining gaps — (1) `/reset-password` page (FR-003/004) and (2) MFA status in ProfileTab (FR-005).  
**Already done**: Invite flow and admin force-reset are confirmed implemented in `UsersTab.tsx`.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: User story label — [US3] = Reset Password flow, [US4] = MFA status
- Exact file paths in every task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and cache keys — shared by both user stories. Must complete first.

- [x] T001 [P] Add `MfaStatus` interface (`enrolled: boolean`, `method: string | null`) to `src/api/auth/types.ts`
- [x] T002 [P] Add `mfa: ['auth', 'mfa'] as const` to the `auth` namespace in `src/hooks/queryKeys.ts`

**Checkpoint**: Types and cache keys ready — both user stories can proceed.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer functions shared by both user stories. Both can be written in parallel since they touch different function bodies in the same file.

- [x] T003 [P] Add `getMfaStatus(): Promise<MfaStatus>` function calling `GET /auth/me/mfa/status` to `src/api/auth/auth.ts`
- [x] T004 [P] Add `resetPasswordWithToken(recoveryToken, request): Promise<void>` function calling `POST /auth/reset-password-confirm` with custom `Authorization` header override to `src/api/auth/auth.ts`
- [x] T005 [P] Add `useMfaStatus()` hook (query, `staleTime: 300_000`, `retry: false`) to `src/hooks/useAuthQueries.ts`
- [x] T006 [P] Add `useResetPasswordWithToken()` mutation hook to `src/hooks/useAuthQueries.ts` — add required imports (`getMfaStatus`, `resetPasswordWithToken`, `ResetPasswordWithTokenRequest`) at the top of the file
- [x] T007 [P] Export `ResetPasswordWithTokenRequest` interface from `src/api/auth/auth.ts` (co-located with `resetPasswordWithToken`)

**Checkpoint**: API layer and hooks complete — both user stories can implement their UI independently.

---

## Phase 3: User Story 3 — Forgotten Password Reset Flow (Priority: P2) 🎯 MVP

> *Spec uses US1–US4 numbering; task labels use US3/US4 to match the spec user story numbers.*

**Goal**: A user who follows a Supabase password-reset email link lands on `/reset-password`, enters a new password, and completes the reset cycle without hitting a blank route.

**Independent Test**: Navigate to `/reset-password#access_token=FAKE&type=recovery` — the form renders. Submit with a valid password — success state shows. Navigate to `/reset-password` with no hash — invalid state shows with a link to `/forgot-password`.

### Implementation for User Story 3

- [x] T008 [US3] Create `src/pages/ResetPasswordPage.tsx` with three phase states: `invalid` (no/bad token in hash), `form` (new + confirm password inputs), `success` (confirmation + "Back to Login" link). Parse recovery token using `new URLSearchParams(window.location.hash.slice(1))` in a `useMemo`. Style to match `ForgotPasswordPage` (centred card, `min-h-screen bg-surface`, `rounded-xl shadow-lg border border-slate-100`). Wire `useResetPasswordWithToken` mutation — on 401 show "link expired" message + link to `/forgot-password`, on success set phase to `success`.
- [x] T009 [US3] Register `/reset-password` route in `src/App.tsx` inside the `<Route element={<PublicRoute />}>` block (after `/forgot-password`), import `ResetPasswordPage` with existing auth page imports.

**Checkpoint**: The full forgotten-password cycle is functional. Authenticated users hitting `/reset-password` redirect to `/dashboard` (via existing `PublicRoute`). Invalid/expired links show actionable error. SC-003 met.

---

## Phase 4: User Story 4 — MFA Status in Profile (Priority: P3)

**Goal**: A logged-in user sees their MFA enrollment status in `Settings → Profile` — currently "Not enrolled / Coming soon" since the backend stub always returns `enrolled: false`.

**Independent Test**: Open `Settings → Profile` — an "MFA" card appears below the Change Password card, showing "Not Enrolled" badge and "Coming soon" notice. No error is thrown even if the endpoint returns an error (graceful degradation).

### Implementation for User Story 4

- [x] T010 [US4] Add `useMfaStatus` import to `src/components/settings/ProfileTab.tsx`. Add an inline `MfaStatusCard` sub-component (within the same file) that renders:
  - Loading: small `<LoadingSpinner />` 
  - Error: subtle grey "Status unavailable" text (no alarming red — it's a stub)
  - `enrolled: false` → amber "Not Enrolled" badge + italic "MFA enrollment is coming soon" notice
  - `enrolled: true` → green "Enrolled" badge + `data.method` string
  - No enroll button in any state
  Wrap in a `<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">` card identical in structure to the existing Change Password card, with heading "Multi-Factor Authentication".
- [x] T011 [US4] Render the MFA card **after** the Change Password card in `ProfileTab.tsx`'s return JSX. Verify no TypeScript errors — `useMfaStatus` must be called at the top of `ProfileTab` (not inside `MfaStatusCard`) to satisfy React hooks rules; pass result as props to `MfaStatusCard`.

**Checkpoint**: Profile tab shows MFA section. SC-004 met (no orphaned API functions). SC-005 met (all error states are human-readable).

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 [P] Run `npm run lint` and fix all errors (likely: unused imports or missing type annotations)
- [x] T013 Run `npm run build` (`tsc -b && vite build`) and verify zero TypeScript or bundle errors
- [x] T014 [P] Manual verification checklist:
  - `/reset-password` with no hash → invalid state ✓
  - `/reset-password#access_token=X&type=signup` (wrong type) → invalid state ✓
  - Authenticated user → `/reset-password` → redirected to `/dashboard` ✓
  - `Settings → Profile` → MFA card visible, no error ✓
  - `Settings → Users → Invite User` → InviteModal opens (regression check) ✓
  - `Settings → Users → hover card → Reset` → Reset modal opens (regression check) ✓

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Types + Keys)
    └── Phase 2 (API + Hooks)
            ├── Phase 3: US3 — ResetPasswordPage + Route
            └── Phase 4: US4 — MFA card in ProfileTab
                    └── Phase 5: Polish
```

### User Story Dependencies

- **US3 (P2)**: Depends on Phase 1 + Phase 2. Independent of US4.
- **US4 (P3)**: Depends on Phase 1 + Phase 2. Independent of US3.
- US3 and US4 can be implemented in **parallel** after Phase 2 completes.

### Within Each User Story

- API functions (Phase 2) before UI (Phase 3/4)
- `useMfaStatus` hook (T005) before ProfileTab MFA card (T010)
- `useResetPasswordWithToken` hook (T006) before `ResetPasswordPage` (T008)
- `ResetPasswordPage` (T008) before route registration (T009)

---

## Parallel Execution Example

```bash
# Phase 1 — run simultaneously:
Task T001: Add MfaStatus type to src/api/auth/types.ts
Task T002: Add mfa key to src/hooks/queryKeys.ts

# Phase 2 — run simultaneously across files:
Task T003: getMfaStatus() in src/api/auth/auth.ts
Task T004: resetPasswordWithToken() in src/api/auth/auth.ts  ← same file, different function
Task T005: useMfaStatus() hook in src/hooks/useAuthQueries.ts
Task T006: useResetPasswordWithToken() hook in src/hooks/useAuthQueries.ts  ← same file, different hook

# After Phase 2 — run simultaneously:
Task T008+T009: ResetPasswordPage + route (US3)
Task T010+T011: MFA card in ProfileTab (US4)

# Polish — run simultaneously:
Task T012: npm run lint
Task T014: Manual verification
```

---

## Implementation Strategy

### MVP First (US3 — most critical)

1. Complete Phase 1 (T001–T002) — ~5 min
2. Complete Phase 2 for US3 only (T004, T006, T007) — ~10 min
3. Complete Phase 3 (T008, T009) — ~30 min
4. **STOP and VALIDATE**: Test `/reset-password` route manually
5. Then continue with US4 if desired

### Full Delivery (Both Stories)

1. Phase 1 → Phase 2 (all tasks, many in parallel) — ~15 min
2. Phase 3 (US3) in parallel with Phase 4 (US4) — ~45 min
3. Phase 5 (polish) — ~10 min
4. Total estimated: ~1 hour

---

## Notes

- [P] tasks touch different files or different non-conflicting sections — safe to parallelize
- T003 and T004 both modify `src/api/auth/auth.ts` — sequential within that file, but the file is small enough to handle both in one edit
- T005 and T006 both modify `src/hooks/useAuthQueries.ts` — sequential within that file; add both hooks in one edit pass
- `ResetPasswordPage` **cannot** test form submission E2E until `POST /auth/reset-password-confirm` exists on the backend — hash parsing and invalid-state rendering can be verified without it
- No Vitest tests are requested in spec — T012/T014 cover validation via lint, build, and manual checks
