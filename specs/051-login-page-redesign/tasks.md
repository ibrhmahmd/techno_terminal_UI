---

description: "Task list for Login Page Redesign feature implementation"

---

# Tasks: Login Page Redesign — Visual Polish & UX Enhancement

**Input**: Design documents from `specs/051-login-page-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested — no test tasks generated. Implementation is UI-only with no new business logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **This project**: Frontend-only SPA. All source in `src/`. No backend.
  - Components: `src/components/{domain}/`
  - Pages: `src/pages/`
  - Tests: `src/tests/`
- Path examples assume this pattern; adjust domain folder as needed.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create auth components directory at `src/components/auth/`
- [x] T002 [P] Create `src/components/auth/AuthLayout.tsx` — shared layout wrapper with `title`, `subtitle`, `children`, `showBranding`, `showSkeleton` props (terminal dot pattern background, brand header, card container)
- [x] T003 [P] Create `src/components/auth/AuthLayoutSkeleton.tsx` — branded card skeleton mimicking login card layout (placeholder blocks for brand area, 2 fields, button), using CSS `animate-pulse`

**Checkpoint**: AuthLayout renders correctly with children and in skeleton mode

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [US1] Add terminal/grid dot pattern background to `AuthLayout.tsx` via CSS `background-image: radial-gradient(circle, rgba(...) 1px, transparent 1px)` with secondary color accent at low opacity and `background-size: 24px 24px`
- [x] T005 [US1] Add brand header ("TechnoTerminal" heading with `font-headline` + "CRM Sign In" tagline) to `AuthLayout.tsx` — controlled by `showBranding` prop (default `true`)
- [x] T006 [US1] Add responsive card sizing in `AuthLayout.tsx`: `max-w-md` centered on desktop, full-width with `px-4` on mobile (< 640px)

**Checkpoint**: AuthLayout displays terminal pattern background, brand header, and responsive card

---

## Phase 3: User Story 1 — Visual Identity (Priority: P1) 🎯 MVP

**Goal**: Login page has a polished, branded visual identity with terminal pattern background and consistent responsive layout

**Independent Test**: Render `AuthLayout` with children — verify terminal dot pattern renders (CSS `background-image` visible), brand header shows "TechnoTerminal", card is `max-w-md` centered on desktop and full-width on mobile viewport

### Implementation for User Story 1

- [x] T007 [US1] Integrate `AuthLayout` into `src/pages/LoginPage.tsx` — replace the existing card wrapper markup with `<AuthLayout title="..." subtitle="...">` wrapping the form
- [x] T008 [US1] Integrate `AuthLayoutSkeleton` into `LoginPage.tsx` — add auth-check loading state: show `<AuthLayout showSkeleton>` while `isAuthenticated` is being determined (before redirect)

**Checkpoint**: Login page shows terminal pattern background, brand header, responsive card, and branded skeleton during auth check. Build passes.

---

## Phase 4: User Story 2 — Shared AuthLayout (Priority: P2)

**Goal**: All four auth pages share the same AuthLayout component for consistent branding and reduced code duplication

**Independent Test**: Navigate to each auth page — Login, ForgotPassword, Register, ResetPassword. All display the same background pattern, brand header position, and card styling with no visual jump.

### Implementation for User Story 2

- [x] T009 [P] [US2] Migrate `src/pages/ForgotPasswordPage.tsx` to use `AuthLayout` — replace card wrapper markup with `<AuthLayout title="Reset Password" subtitle="...">`, ensure error banners match LoginPage pattern (FR-012)
- [x] T010 [P] [US2] Migrate `src/pages/RegisterPage.tsx` to use `AuthLayout` — replace card wrapper markup with `<AuthLayout title="Complete Registration" subtitle="...">`, ensure error banners match LoginPage pattern (FR-012)
- [x] T011 [P] [US2] Migrate `src/pages/ResetPasswordPage.tsx` to use `AuthLayout` — replace card wrapper markup with `<AuthLayout title="..." subtitle="...">`, ensure error banners match LoginPage pattern (FR-012)

**Checkpoint**: All 4 auth pages render consistently with the same AuthLayout. No duplicated card wrapper markup remains in any page.

---

## Phase 5: User Story 3 — Login UX Convenience (Priority: P2)

**Goal**: Login form includes password visibility toggle, auto-focused email input, auth-check branded skeleton, and Remember Me checkbox

**Independent Test**: Open login page — email field is auto-focused. Type password, click eye icon — password becomes visible, icon toggles. Reload page with Remember Me checked from previous session — email is pre-filled, checkbox is checked.

### Implementation for User Story 3

- [x] T012 [P] [US3] Add password visibility toggle to `LoginPage.tsx` — inline `<button>` inside a relative-positioned wrapper around the password input, toggles `type="password"`/`"text"`, uses `material-symbols-outlined: visibility`/`visibility_off`, `aria-label="Show password"`/`"Hide password"`
- [x] T013 [P] [US3] Add auto-focus on email input in `LoginPage.tsx` — use `useRef` + `useEffect` to call `emailRef.current.focus()` on mount
- [x] T014 [P] [US3] Add "Remember Me" checkbox to `LoginPage.tsx` below password field — stores email in `localStorage` key `tt_remember_email`, pre-fills email on return, password is NEVER stored. First visit (no stored email): checkbox unchecked by default, email field empty. localStorage unavailable (private browsing): login works, Remember Me silently skipped.
- [x] T015 [US3] Wire auth-check loading skeleton into `LoginPage.tsx` — show `AuthLayoutSkeleton` while `useAuthStore` is rehydrating and `isAuthenticated` is undetermined (before redirect decision)

**Checkpoint**: All login UX features work — password toggle toggles visibility, email auto-focuses, Remember Me persists email across sessions, auth check shows skeleton

---

## Phase 6: User Story 4 — Error States (Priority: P3)

**Goal**: Login errors are visually clear with distinct network vs auth messages, rate-limit countdown in submit button, and WCAG 2.1 AA compliance

**Independent Test**: Submit with wrong credentials — see "Invalid email or password." Submit repeatedly to trigger rate limit — see countdown in both banner and button text. Disconnect network and submit — see connection error message. All error banners have `role="alert"`.

### Implementation for User Story 4

- [x] T016 [P] [US4] Add network error detection in `LoginPage.tsx` — check `isAxiosError(err) && !err.response` and display "Unable to connect. Please check your internet connection and try again."
- [x] T017 [P] [US4] Add rate-limit countdown to submit button text in `LoginPage.tsx` — when `retryAfter` is active, show "Try again in {countdown}s" inside the button (replacing "Sign In")
- [x] T018 [US4] Add WCAG 2.1 AA accessibility checkpoints to auth components:
  - Error banners: confirm `role="alert"` on error and rate-limit banners
  - Password toggle: confirm `aria-label` toggles between "Show password" / "Hide password"
  - Auth skeleton: add `role="status"` with `aria-live="polite"`
  - Countdown text: wrap in `aria-live="polite"` container
  - Tab order: confirm email → password → toggle → submit → forgot password link

**Checkpoint**: Network errors show distinct message, rate-limit countdown appears in button, aXe audit passes with zero critical/serious violations

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 Run `npm run lint` and fix all errors in modified files
- [x] T020 Run `npm run build` (`tsc -b && vite build`) and verify zero errors
- [x] T021 [P] Visual verification: login page renders with terminal pattern, branded skeleton, password toggle, Remember Me, correct error states on all viewport sizes
- [x] T022 Code cleanup — remove any leftover duplicated card wrapper markup from migrated pages, verify no dead code

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3, P1)**: Depends on Phases 1-2 — MVP scope
- **US2 (Phase 4, P2)**: Depends on Phases 1-2 — can run parallel with US1 after AuthLayout exists
- **US3 (Phase 5, P2)**: Depends on US1 (LoginPage has AuthLayout) — partially parallel with US2
- **US4 (Phase 6, P3)**: Depends on US1 (LoginPage exists) — partially parallel with US2, US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1) Visual Identity**: Can start after Foundational — terminal pattern, brand header, responsive card all in AuthLayout
- **US2 (P2) Shared AuthLayout**: Can start after Foundational — sibling page migration is independent
- **US3 (P2) Login UX**: Depends on US1 (uses LoginPage with AuthLayout) — LoginPage must exist
- **US4 (P3) Error States**: Depends on US1 (uses LoginPage) — error handling is LoginPage-specific

### Parallel Opportunities

- T002 (AuthLayout) and T003 (AuthLayoutSkeleton) can run in parallel
- T009, T010, T011 (sibling page migrations) can all run in parallel
- T012 (password toggle), T013 (auto-focus), T014 (Remember Me) can run in parallel
- T016 (network error) and T017 (rate-limit button) can run in parallel
- US1 and US2 can be worked on in parallel after AuthLayout exists

---

## Parallel Example: User Story 3

```bash
# All US3 Login UX tasks can run in parallel (different concerns, same file):
Task: "Add password visibility toggle to LoginPage.tsx"
Task: "Add auto-focus on email input in LoginPage.tsx"
Task: "Add Remember Me checkbox to LoginPage.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — create auth directory
2. Complete Phase 2: Foundational — AuthLayout + skeleton + terminal pattern + brand header + responsive (blocking)
3. Complete Phase 3: US1 Visual Identity — LoginPage uses AuthLayout, auth-check skeleton
4. **STOP and VALIDATE**: Login page looks branded with terminal pattern, responsive, and shows skeleton on auth check
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → AuthLayout ready with terminal pattern, brand header, responsive card
2. Add US1 Visual Identity → branded login page with skeleton (MVP!)
3. Add US2 Shared AuthLayout → all auth pages consistent
4. Add US3 Login UX → password toggle, remember me, auto-focus, skeleton
5. Add US4 Error States → network errors, rate-limit, a11y compliance
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks — tests not requested in this feature
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
