# Implementation Plan: Login Page Redesign — Visual Polish & UX Enhancement

**Branch**: `051-login-page-redesign` | **Date**: 2026-06-25 | **Spec**: `specs/051-login-page-redesign/spec.md`
**Input**: Feature specification from `specs/051-login-page-redesign/spec.md`

## Summary

Redesign the login page and all auth pages (ForgotPassword, Register, ResetPassword) with a shared `AuthLayout` component, terminal/grid dot pattern background, password visibility toggle, Remember Me checkbox, auth-check branded skeleton, WCAG 2.1 AA a11y, and distinct network error messages. Frontend-only — no backend changes.

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

**Known unknowns resolved by clarifications**:
- Background: terminal/grid dot pattern via CSS `background-image: radial-gradient()` with secondary color accent
- Auth loading: full-page branded card skeleton via AuthLayout
- Network errors: distinguish from auth errors with different messages
- Mobile: card goes full-width at <640px, pattern scales
- A11y: WCAG 2.1 AA — `role="alert"`, `aria-label`, focus indicators, logical tab order

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Frontend-Only Scope | ✅ PASS | All changes in `src/`, no backend code |
| Server State (React Query) | ✅ PASS | No new data fetching; existing `useUsers`, `useAuthStore` patterns preserved |
| Global State Minimalism | ✅ PASS | Remember Me uses `localStorage`, no new Zustand stores |
| TypeScript Strict Mode | ✅ PASS | All new code must pass `tsc -b` with `verbatimModuleSyntax` |
| Component Naming | ✅ PASS | `AuthLayout.tsx` in `components/auth/`, `LoginPage.tsx` in `pages/` |

## Project Structure

### Documentation (this feature)

```text
specs/051-login-page-redesign/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code

```text
src/
├── api/                  # No new API modules needed
├── components/
│   ├── auth/
│   │   ├── AuthLayout.tsx    # NEW — shared layout wrapper
│   │   └── AuthLayoutSkeleton.tsx  # NEW — loading skeleton
│   └── common/           # LoadingSpinner (existing)
├── pages/
│   ├── LoginPage.tsx          # MODIFIED — use AuthLayout, password toggle, remember-me
│   ├── ForgotPasswordPage.tsx # MODIFIED — use AuthLayout
│   ├── RegisterPage.tsx       # MODIFIED — use AuthLayout
│   └── ResetPasswordPage.tsx  # MODIFIED — use AuthLayout
└── hooks/                # No new hooks needed
```

## Complexity Tracking

None — no constitution violations.

## Research Summary

See `research.md` for detailed findings. Key decisions:

- **Terminal dot grid**: CSS `background-image` with `radial-gradient(circle, ...) 1px 1px` + `background-size` — no SVG/image dependency, scales naturally
- **Password visibility toggle**: Inline button inside the input using `position: relative` + absolute positioning — standard pattern, no third-party dep
- **Auth skeleton**: Full-height viewport skeleton mirroring card structure using same Token/breakpoints — no animation library needed (CSS-only pulse)
- **Remember Me**: `localStorage.setItem('tt_remember_email', email)` — email-only, no password stored
- **Network error detection**: Check `isAxiosError(err) && !err.response` — no response body means network failure, different from 4xx/5xx
