# Implementation Plan: Auth Authentication System

**Branch**: `001-auth-authentication-system` | **Date**: 2026-05-11 | **Spec**: [spec.md](spec.md) | **Clarifications**: Completed 2026-05-11 (5 items)
**Input**: Feature specification from `/specs/001-auth-authentication-system/spec.md`

## Summary

Implement JWT-based authentication for the TechnoTerminal CRM SPA. The system provides email/password login, token persistence via Zustand, automatic silent token refresh via Axios interceptor, role-based route protection, and admin user management. All auth code is client-side only — the backend (FastAPI + PostgreSQL) is operated independently.

## Technical Context

**Language/Version**: TypeScript ~5.9
**Framework**: React 19 + Vite 8
**Primary Dependencies**: React Router DOM 7, TanStack React Query 5, Zustand 5, Axios 1, Tailwind CSS 3.4, Lucide React 1
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

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Frontend-Only Scope** | ✅ PASS | All auth code lives in `src/` — no backend code, no database schemas |
| **II. Server State Discipline** | ✅ PASS | Auth does not use React Query — this is intentional and justified (see Complexity Tracking). Auth tokens are global UI state, not server data. The Axios interceptor reads from Zustand synchronously, which React Query cannot provide |
| **III. Global State Minimalism** | ✅ PASS | Auth tokens and user info are truly global state (needed everywhere). Sidebar visibility is also in Zustand — acceptable per principle. No API data or form state in Zustand |
| **IV. TypeScript Strict Mode** | ✅ PASS | `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` enforced. `import type` used correctly. Checking pending for `any` usage |
| **V. Component Naming Convention** | ✅ PASS | `LoginPage.tsx` → `pages/`, `RoleBasedRoute.tsx` → `components/common/` |
| **Cache & API Discipline** | ✅ PASS | Axios instance from `client.ts` used for all auth API calls. Token injected via request interceptor |

### Justified Exceptions

| Principle | Violation | Justification |
|-----------|-----------|---------------|
| II. Server State Discipline | Auth tokens bypass React Query | Tokens are needed in the Axios interceptor (outside React tree) synchronously. React Query's async nature makes it impossible to inject tokens before requests fire. Additionally, auth is not "server data" — it is client credential state. The constitution explicitly reserves Zustand for "truly global UI state — authentication tokens" |

## Project Structure

### Documentation (this feature)

```
specs/001-auth-authentication-system/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (/speckit.plan output)
├── data-model.md        # Phase 1 output (/speckit.plan output)
├── quickstart.md        # Phase 1 output (/speckit.plan output)
├── contracts/           # Phase 1 output (/speckit.plan output)
│   └── auth-api.md
├── tasks.md             # Phase 2 output (/speckit.tasks output)
└── checklists/
    ├── requirements.md  # Spec quality checklist
    ├── security.md      # Security-focused QA checklist
    └── test.md          # Test coverage checklist
```

### Source Code

```
src/
├── api/
│   ├── client.ts         # Axios with JWT interceptor (existing)
│   └── auth/
│       ├── index.ts      # Re-exports (existing)
│       └── auth.ts       # Login, refresh, logout, user mgmt (existing)
├── store/
│   └── authStore.ts      # Zustand persist store (existing)
├── components/
│   ├── common/
│   │   └── RoleBasedRoute.tsx  # Role guard + AccessDenied (existing)
│   └── layout/
│       └── AppLayout.tsx       # Sidebar + main content wrapper (existing)
├── pages/
│   └── LoginPage.tsx     # Login form page (existing)
├── App.tsx               # Route config with guards (existing)
└── tests/
    └── auth/             # NEW: auth test suite
        ├── authStore.test.ts
        ├── client.test.ts
        ├── LoginPage.test.tsx
        └── RoleBasedRoute.test.tsx
```

## Phases

### Phase 0: Research & Analysis (COMPLETE — see research.md)

Research existing auth implementation patterns, resolve unknowns, document architectural decisions. Output: `research.md`.

### Phase 1: Design & Contracts

1. **Data Model** → `data-model.md`: Document User entity, AuthTokens pair, API response/request types
2. **API Contracts** → `contracts/auth-api.md`: Full OpenAPI-style documentation of all auth endpoints
3. **Quickstart** → `quickstart.md`: End-to-end integration walkthrough for developers

### Phase 2: Task Generation

Break remaining work (test coverage, gap fixes) into executable tasks → `tasks.md`.

### Phase 3: Implementation

Execute tasks from `tasks.md`:
1. Write auth tests
2. Address research gaps
3. Add `storage` event listener for cross-tab auth sync
4. Parse `Retry-After` header on 429 and display countdown in login form
5. Detect `is_active: false` on `/auth/me` response and force logout
6. Verify build gates pass

## Complexity Tracking

> *No constitution violations to justify. All exceptions are documented above with rationale.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Auth tokens bypass React Query | Axios interceptor needs synchronous token access outside React tree | Wrapping interceptor with React Query hooks creates circular dependency and async timing issues |
