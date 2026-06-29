# Tasks: Auth Pages & Logic Audit Fix

**Input**: Design documents from `specs/052-auth-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in spec — test tasks omitted. Only fixing broken test imports.

**Organization**: Tasks grouped by user story for independent implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths

---

## Phase 1: Setup

**Purpose**: Verify baseline and prepare branch

- [x] T001 Verify `npm run build` passes on current branch (baseline before changes)
- [x] T002 Read existing source files to warm cache: `src/api/client.ts`, `src/hooks/useAuthQueries.ts`, `src/pages/LoginPage.tsx`, `src/pages/ForgotPasswordPage.tsx`, `src/pages/RegisterPage.tsx`, `src/pages/ResetPasswordPage.tsx`, `src/components/auth/AuthLayout.tsx`, `src/store/authStore.ts`, `src/App.tsx`, `src/api/auth/auth.ts`, `src/api/auth/admin.ts`, `src/components/common/RoleBasedRoute.tsx`, `src/components/common/InstructorBlockedRoute.tsx`, `src/components/common/LoadingSpinner.tsx`

**Checkpoint**: Baseline verified — all source files ready for modification

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fixes that MUST be in place before user stories can be safely implemented

**⚠️ CRITICAL**: The client.ts and auth.ts fixes are runtime-critical — incomplete tokens or hanging promises affect all subsequent work

- [x] T003 [P] Fix `refreshSubscribers` not drained on failure in `src/api/client.ts` catch block — add `onTokenRefreshFailed()` function that drains all subscribers with empty token callback, then resets the array; call it before `state.logout()` in the catch handler
- [x] T004 [P] Add `/auth/reset-password-confirm` to both `noBearerEndpoints` and `noRefreshEndpoints` arrays in `src/api/client.ts`
- [x] T005 [P] Guard `token!` non-null assertion in `src/pages/RegisterPage.tsx` — add runtime null check before mutation, set error state if missing
- [x] T006 [P] Guard `token!` non-null assertion in `src/pages/ResetPasswordPage.tsx` — add runtime null check before mutation, set error state if missing; also replace `window.location.hash` with `useLocation()` and fix `useMemo` empty deps array to include location dependency
- [x] T007 [P] Fix `ForgotPasswordPage.tsx` dead `error` state — wire up the declared `error` variable so it's actually set on API failure
- [x] T008 [P] Fix `authStore.ts` storage event listener — replace `localStorage.getItem('auth-storage')` with `(e as StorageEvent).newValue`

**Checkpoint**: Core runtime bugs fixed — token refresh, password reset, and cross-tab sync now reliable

---

## Phase 3: User Story 1 — Fix Runtime Bugs & Security Issues (Priority: P1) 🎯 MVP

**Goal**: Auth runtime bugs fixed so password reset works reliably, token refresh doesn't leak hanging promises, and edge cases don't crash the app.

**Independent Test**: Manually test: (1) trigger 401 + failed refresh → verify no hanging promises in browser console Network tab; (2) navigate to `/reset-password#token=abc` (valid + invalid token) → verify recovery token isn't overwritten; (3) check Remember Me checkbox → verify email persisted immediately (not just on submit)

- [x] T009 [P] [US1] Fix Remember Me persistence on checkbox change in `src/pages/LoginPage.tsx` — save email to `localStorage` in the checkbox `onChange` handler, not just on submit

**Checkpoint**: US1 complete — all runtime bugs fixed and independently verifiable

---

## Phase 4: User Story 2 — Remove Dead Code (Priority: P2)

**Goal**: Unused hooks, API functions, and broken test imports cleaned up.

**Independent Test**: Run `npm run build` and `npm run test` — should pass with zero errors.

- [x] T010 [P] [US2] Remove `useCurrentUser` hook from `src/hooks/useAuthQueries.ts` (definition only — verify zero production importers via grep)
- [x] T011 [P] [US2] Remove `useDeleteUser` hook from `src/hooks/useAuthQueries.ts` (definition only — verify zero production importers via grep)
- [x] T012 [P] [US2] Remove `getUser()` export from `src/api/auth/admin.ts` (verify zero importers via grep across `src/`)
- [x] T013 [P] [US2] Fix `AccessDenied` import in `src/tests/auth/RoleBasedRoute.test.tsx` — import from correct source path or remove if component doesn't exist
- [x] T014 [P] [US2] Fix `User` type import in `src/tests/auth/LoginPage.test.tsx` — import from `src/api/auth/types.ts` instead of incorrect module

**Checkpoint**: US2 complete — dead code removed, test imports fixed, build+tests pass

---

## Phase 5: User Story 3 — Align Auth UI with Design System (Priority: P2)

**Goal**: Auth pages follow same design patterns as the rest of the app — glassmorphism cards, ghost inputs, no-line rule, reduced-motion support.

**Independent Test**: Visually inspect all 4 auth pages at various viewport sizes. Verify card has `bg-white/70 backdrop-blur-xl`, inputs have `border-0 border-b`, no motion animations play with `prefers-reduced-motion: reduce`.

- [x] T015 [US3] Update auth card in `src/components/auth/AuthLayout.tsx` — replace `bg-white` with `bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl`
- [x] T016 [P] [US3] Update inputs in `src/pages/LoginPage.tsx` — replace full input borders with ghost input classes: `w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors`
- [x] T017 [P] [US3] Update inputs in `src/pages/RegisterPage.tsx` — same ghost input transformation
- [x] T018 [P] [US3] Update inputs in `src/pages/ForgotPasswordPage.tsx` — same ghost input transformation
- [x] T019 [P] [US3] Update inputs in `src/pages/ResetPasswordPage.tsx` — same ghost input transformation
- [x] T020 [P] [US3] Add `motion-safe:` prefix to `animate-pulse` on all 4 skeleton instances in `src/components/auth/AuthLayout.tsx`
- [x] T021 [P] [US3] Add `motion-safe:` prefix to `animate-spin` in `src/components/common/LoadingSpinner.tsx`
- [x] T022 [P] [US3] Replace `gap-1.5` with `gap-2` in `src/pages/LoginPage.tsx` for 4px spacing compliance
- [x] T023 [P] [US3] Replace `py-2.5` with `py-2` in `src/pages/LoginPage.tsx` for 4px spacing compliance
- [x] T024 [P] [US3] Ensure consistent error banner styling across all 4 auth pages — verify `ErrorMessage` or `ErrorState` component used, same spacing/margin/color tokens
- [x] T025 [P] [US3] Replace `text-slate-500` with `text-on-surface-variant` in all auth page templates where applicable

**Checkpoint**: US3 complete — all 4 auth pages visually aligned with design system

---

## Phase 6: User Story 4 — Improve Accessibility (Priority: P2)

**Goal**: Screen reader users get proper focus management, skip-to-content navigation, and no contradictory ARIA attributes.

**Independent Test**: Tab through auth pages with screen reader. Verify: (1) no "alert" + "polite" conflict on countdown; (2) focus lands on error banner after submit failure; (3) focus lands on success heading after phase transition; (4) Tab key at top of page reveals "Skip to content" link.

- [x] T026 [US4] Add skip-to-content link at top of `<Routes>` in `src/App.tsx` — first focusable element, hidden until focused, targets `#main-content` anchor
- [x] T027 [US4] Wrap auth routes in `<ErrorBoundary>` in `src/App.tsx` — wrap `<PublicRoute>` children within the `<Routes>` block
- [x] T028 [P] [US4] Fix contradictory ARIA in `src/pages/LoginPage.tsx` — remove `aria-live="polite"` from rate-limit countdown, keep only `role="alert"`
- [x] T029 [P] [US4] Move focus to error banner on submit failure in `src/pages/LoginPage.tsx` — use `useRef` + `.focus()` on the error container after error state is set
- [x] T030 [P] [US4] Move focus to success heading on phase transition in `src/pages/ForgotPasswordPage.tsx` — use `useRef` + `.focus()` when transitioning from email submission to confirmation message
- [x] T031 [P] [US4] Move focus to success/invalid heading on phase transition in `src/pages/ResetPasswordPage.tsx` — use `useRef` + `.focus()` on success and invalid states
- [x] T032 [P] [US4] Fix amber contrast in `src/pages/LoginPage.tsx` — replace `text-amber-700` with `text-amber-800` (and verify contrast against `bg-amber-50` passes WCAG AA)

**Checkpoint**: US4 complete — accessibility verified with keyboard + screen reader

---

## Phase 7: User Story 5 — Optimize Data Fetching (Priority: P3)

**Goal**: Consistent cache configuration and proper query guards across all auth hooks.

**Independent Test**: Run `npm run build`, verify no TS errors. Run app, verify auth-related data loads correctly. Check React Query DevTools for correct staleTime values.

- [x] T033 [US5] Change `useUsers` staleTime from `0` to `30_000` in `src/hooks/useAuthQueries.ts`
- [ ] T034 [P] [US5] Add `enabled` guard to `useMyActivity` query in `src/hooks/useAuthQueries.ts` — N/A: no search term in ActivityQuery
- [x] T035 [P] [US5] Add `enabled` guard to `useUsers` query in `src/hooks/useAuthQueries.ts` — `enabled: !query?.q || query.q.length >= 2`
- [ ] T036 [P] [US5] Add `enabled` guard to `useAuditLogins` query in `src/hooks/useAuthQueries.ts` — N/A: no search term in AuditQuery
- [ ] T037 [P] [US5] Add `enabled` guard to `useAuditPasswordChanges` query in `src/hooks/useAuthQueries.ts` — N/A: no search term in AuditQuery
- [x] T038 [P] [US5] Fix `useRegister` — add `queryClient.invalidateQueries({ queryKey: queryKeys.auth.users })` in mutation's `onSuccess` callback
- [x] T039 [P] [US5] Fix `useUpdateProfile` — change `onSettled` to `onSuccess` for invalidation (avoid unnecessary refetch on error)

**Checkpoint**: US5 complete — consistent cache configuration across all auth hooks

---

## Phase 8: User Story 6 — Architecture & Performance (Priority: P3)

**Goal**: LoginPage uses a custom hook instead of direct API call; App.tsx uses `React.lazy()` for page imports.

**Independent Test**: Run `npm run build` and verify zero errors. Verify login flow still works end-to-end. Check Network tab for chunk splitting (separate JS files per page).

- [x] T040 [US6] Create `useLogin` mutation hook in `src/hooks/useAuthQueries.ts` — input: `LoginCredentials`; `mutationFn`: calls `login()` from API; `onSuccess`: calls `useAuthStore.getState().login(access_token, refresh_token, user)` and invalidates `queryKeys.auth.all`
- [x] T041 [US6] Refactor `src/pages/LoginPage.tsx` to use `useLogin` hook — replace direct `login()` import and raw try/catch with `useMutation` result (`mutate`, `isPending`, `error`)
- [x] T042 [US6] Convert all page imports in `src/App.tsx` from static to `React.lazy(() => import(...))` and wrap routes in `<Suspense>` with appropriate fallback

**Checkpoint**: US6 complete — performance improved via code splitting, architecture aligned

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that everything compiles, lints, and tests pass

- [ ] T043 Run `npm run lint` — fix any lint errors
- [ ] T044 Run `npm run build` — verify `tsc -b && vite build` passes with zero errors
- [ ] T045 Run `npm run test` — verify all tests pass
- [ ] T046 Final review — verify all 65 audit findings from `findings-report.md` are addressed per their severity

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories (runtime-critical fixes)
- **US1 (Phase 3)**: Depends on Foundational — no dependency on other user stories 🎯 MVP
- **US2 (Phase 4)**: Depends on Foundational — independent of other stories
- **US3 (Phase 5)**: Depends on Foundational — independent of other stories
- **US4 (Phase 6)**: Depends on Foundational — independent of other stories
- **US5 (Phase 7)**: Depends on Foundational — independent of other stories
- **US6 (Phase 8)**: Depends on Foundational — independent of other stories
- **Polish (Phase 9)**: Depends on all desired user stories

### User Story Dependencies

- All stories are independent of each other (different files, no cross-story conflicts)
- US1 (P1) is the MVP — everything else can wait
- US2-P4, US3-P4, US4-P4 are same priority — any can be done first after US1
- US5-P3, US6-P3 are lower priority — do after all P2s

### Within Each Phase

- Tasks marked [P] within a phase can run in parallel
- Non-[P] tasks within a phase must run sequentially

### Parallel Opportunities

- Phase 2: All 6 tasks (T003-T008) can run in parallel (different files)
- Phase 4: All 5 tasks (T010-T014) can run in parallel (dead code removal)
- Phase 5: T016-T025 are mostly parallel (different pages/components)
- Phase 6: T028-T032 can run in parallel (different pages)
- Phase 7: T034-T039 can run in parallel (different hooks in same file)
- Phase 8: T040 and T042 can run in parallel (different files); T041 depends on T040

---

## Parallel Example: Phase 2 — Foundational

```
# All foundational fixes are independent (different files):
Task: "Fix refreshSubscribers drain in src/api/client.ts"
Task: "Add /auth/reset-password-confirm to exclusion lists in src/api/client.ts"
Task: "Guard token! in src/pages/RegisterPage.tsx"
Task: "Guard token! in src/pages/ResetPasswordPage.tsx"
Task: "Fix dead error state in src/pages/ForgotPasswordPage.tsx"
Task: "Fix storage event listener in src/store/authStore.ts"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Setup
2. Phase 2: Foundational (CRITICAL — blocks all stories)
3. Phase 3: User Story 1 (runtime bug fixes)
4. **STOP and VALIDATE**: Test US1 independently (token refresh, password reset, Remember Me)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (P1) → Runtime bugs fixed → Deploy/Demo (MVP!)
3. US2 (P2) → Dead code removed → Deploy/Demo
4. US3 (P2) → Design system aligned → Deploy/Demo
5. US4 (P2) → Accessibility improved → Deploy/Demo
6. US5 (P3) → Data fetching optimized → Deploy/Demo
7. US6 (P3) → Architecture/performance → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: US1 runtime bugs
   - Developer B: US2 dead code + US4 accessibility
   - Developer C: US3 design system
   - Developer D: US5 data fetching + US6 architecture
3. All stories independent — no integration conflicts

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story independently completable and testable
- Commit after each logical task or group
- Stop at any checkpoint to validate story independently
- This is an audit-fix feature — no new components, no new API endpoints, no new pages
- All 65 findings from `findings-report.md` are covered across the 6 user stories
