# Feature Specification: Login Page Redesign — Visual Polish & UX Enhancement

**Feature Branch**: `051-login-page-redesign`
**Created**: 2026-06-25
**Status**: Draft
**Input**: "lets open a spec to upgrade the login page"

---

## Current State Assessment

The login page (`src/pages/LoginPage.tsx`) is functionally complete but visually minimal. It shares a common card layout pattern with three sibling pages (`ForgotPasswordPage`, `RegisterPage`, `ResetPasswordPage`) that all use the same centered-card-on-surface structure.

### What exists now

| Aspect | Current implementation |
|--------|----------------------|
| Layout | Centered white card on `bg-surface`, `max-w-md`, `rounded-xl` |
| Branding | Text-only "TechnoTerminal" heading + "CRM Sign In" subtitle |
| Fields | Email + Password with standard input styling |
| Primary action | Full-width "Sign In" button (`bg-secondary`) |
| Secondary actions | "Forgot Password?" link below button |
| Error handling | Inline alert banners for errors + rate-limit countdown |
| Loading state | `LoadingSpinner` inside the submit button |
| Redirect | `<Navigate to="/dashboard">` if already authenticated |
| Sibling pages | ForgotPassword, Register, ResetPassword — same exact card structure |

### Pain points

1. **No visual identity** — entirely text-based branding, no logo or illustration
2. **Sibling pages don't share a layout component** — each page duplicates the card wrapper markup (`min-h-screen flex items-center justify-center bg-surface px-4` + card + form)
3. **No loading skeleton** — during initial auth check (before redirect), the page flashes empty
4. **No "Remember Me" checkbox** — common UX pattern for session persistence
5. **No password visibility toggle** — common password field UX
6. **No social/SSO login options** — even if backend doesn't support it, the UI pattern could be designed for future extension
7. **Sibling pages feel disconnected** — Register, ForgotPassword, ResetPassword don't share visual DNA beyond the card shape

### Design tokens already used (keep)

| Token | Usage |
|-------|-------|
| `bg-surface` | Page background |
| `font-headline` | Brand name typography |
| `text-on-surface` | Primary text (title, labels) |
| `text-on-surface-variant` | Subtitle, secondary text |
| `bg-secondary` | Primary button |
| `text-secondary` | Links (Forgot Password) |
| `rounded-xl` | Card container |
| `shadow-lg` | Card shadow |
| `border-slate-200` | Input borders |
| `focus:ring-2 focus:ring-secondary/20` | Input focus ring |

---

## User Scenarios & Testing

### User Story 1 — Login Page Has a Distinct Visual Identity (P1)

An admin navigates to the login page and sees a polished, branded experience that reflects the TechnoTerminal identity — not just a generic card on a flat background.

**Acceptance Scenarios**:
1. **Given** the login page loads, **When** viewing the page, **Then** there is a visible brand element beyond plain text (logo, illustration, or background graphic)
2. **Given** the login page loads, **When** viewing on desktop, **Then** the layout uses the full viewport with visual depth (background gradient, pattern, or illustration)
3. **Given** the login page loads, **When** viewing on mobile (< 640px), **Then** the layout remains usable with no horizontal scroll

### User Story 2 — Auth Pages Share a Common Layout Shell (P2)

All four auth pages (Login, ForgotPassword, Register, ResetPassword) use a shared `AuthLayout` component that provides consistent branding and structure, reducing code duplication.

**Acceptance Scenarios**:
1. **Given** any auth page is rendered, **When** inspecting the DOM, **Then** it uses a shared `AuthLayout` wrapper component
2. **Given** the user navigates from Login → ForgotPassword, **When** the page transitions, **Then** the background/branding remains consistent (no visual jump)
3. **Given** any auth page, **When** viewing the page, **Then** the brand name "TechnoTerminal" appears in the same position and styling across all pages

### User Story 3 — Login UX Includes Standard Convenience Features (P2)

The login form includes common UX patterns that reduce friction.

**Acceptance Scenarios**:
1. **Given** the login form, **When** the user types a password, **Then** there is a visibility toggle (eye icon) to show/hide the password
2. **Given** the login form, **When** the user fills in credentials, **Then** pressing Enter submits the form (already works — confirm preserved)
3. **Given** the auth check is in progress (checking if already logged in), **When** the page first loads, **Then** a skeleton or spinner is shown instead of a blank/flashing page
4. **Given** the login form, **When** the page renders, **Then** the email field is auto-focused for immediate typing

### User Story 4 — Error States Are Visually Clear (P3)

Login errors (invalid credentials, rate limiting, network failure) are displayed with clear visual hierarchy and actionable messaging.

**Acceptance Scenarios**:
1. **Given** the user submits invalid credentials, **When** the error appears, **Then** it uses a distinct visual style (icon + colored background) and the form fields do not clear (user can fix and resubmit)
2. **Given** the user is rate-limited (429), **When** the countdown appears, **Then** the submit button shows the remaining wait time, not just a disabled state

---

## Requirements

### Functional Requirements

- **FR-001**: Create a shared `AuthLayout` component in `src/components/auth/AuthLayout.tsx` that wraps all auth pages with consistent branding (logo/wordmark, background treatment, card positioning)
- **FR-002**: Login page MUST include a password visibility toggle (`material-symbols-outlined: visibility` / `visibility_off`)
- **FR-003**: Login page MUST auto-focus the email input on mount
- **FR-004**: Auth check loading state (before redirect) MUST show a skeleton or branded loading screen, not a blank page
- **FR-005**: ForgotPassword, Register, and ResetPassword pages MUST be migrated to use `AuthLayout`
- **FR-006**: Login form MUST preserve input values on error (do not clear fields on failed submit)
- **FR-007**: Rate-limit countdown MUST be reflected in the submit button text (e.g., "Try again in 45s") in addition to the banner
- **FR-008**: All auth pages MUST remain fully responsive (mobile-first)
- **FR-009**: Login page MUST support "Remember Me" checkbox (stored in localStorage, pre-fills email on return)

### Design Token Migration

No token migration needed — login page already uses design tokens. The focus is on layout abstraction and visual enhancement.

### Shared AuthLayout Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Page heading |
| `subtitle` | string | required | Page description |
| `children` | ReactNode | required | Form content |
| `showBranding` | boolean | `true` | Show/hide the brand header |

### Success Criteria

- **SC-001**: `AuthLayout` is used by all 4 auth pages; no duplicated card wrapper markup remains
- **SC-002**: Login page has a visible brand identity element (logo/illustration/graphic) beyond plain text
- **SC-003**: Password field has a working visibility toggle
- **SC-004**: Auth check loading shows a non-blank state
- **SC-005**: Login form maintains input values on error

### Non-Goals

- No backend changes (no new endpoints, no remember-me token backend)
- No social/SSO login implementation (UI placeholder for future only if desired)
- No changes to auth store or token management logic
- No changes to password reset flow or API integration
- No changes to the dashboard or any page outside the `/login`, `/register`, `/forgot-password`, `/reset-password` routes

### Entities

- **AuthLayout**: New shared layout component for all auth pages
- **LoginPage**: Existing page — extract card wrapper into AuthLayout, add password toggle, remember-me, loading skeleton, visual polish
- **ForgotPasswordPage**: Existing page — extract card wrapper into AuthLayout
- **RegisterPage**: Existing page — extract card wrapper into AuthLayout
- **ResetPasswordPage**: Existing page — extract card wrapper into AuthLayout

---

## Implementation Plan

### Phase 1 — AuthLayout Component

1. Create `src/components/auth/AuthLayout.tsx`
2. Move the shared `min-h-screen flex items-center justify-center bg-surface px-4` + card wrapper markup into it
3. Support `title`, `subtitle`, `children`, `showBranding` props
4. Include brand header ("TechnoTerminal" heading + tagline) in the layout

### Phase 2 — Login Page Enhancements

1. Add password visibility toggle (eye icon button inside password field)
2. Add auto-focus on email input (`ref` + `useEffect`)
3. Add auth-check loading skeleton (show branded skeleton while checking `isAuthenticated`)
4. Add "Remember Me" checkbox (persist email in localStorage)
5. Rate-limit countdown in submit button text
6. Visual polish — background gradient or subtle pattern
7. Brand illustration or logo placeholder

### Phase 3 — Sibling Page Migration

1. Migrate `ForgotPasswordPage` to use `AuthLayout`
2. Migrate `RegisterPage` to use `AuthLayout`
3. Migrate `ResetPasswordPage` to use `AuthLayout`
4. Verify all pages render correctly with no regressions
