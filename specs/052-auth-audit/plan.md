# Implementation Plan: Auth Pages & Logic Audit Fix

**Branch**: `051-login-page-redesign` | **Date**: 2026-06-29 | **Spec**: `specs/052-auth-audit/spec.md`
**Input**: Feature specification from `/specs/052-auth-audit/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix 65 audit findings (17 high, 20 medium, 28 low) across 15 auth-related files: runtime bugs, security issues, dead code, design system violations, accessibility gaps, data-fetching anti-patterns, and performance regressions. All changes are frontend-only, confined to `src/`.

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
**Scale/Scope**: 15 files across auth pages, hooks, API, store, components, and App.

### Resolved Research Items

- **ErrorBoundary**: Exists at `src/components/common/ErrorBoundary.tsx` — class component, accepts `children` and optional `fallback` props. Used in 11 existing pages.
- **Glassmorphism pattern**: `bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl` (from StudentCombobox, SpyCombobox, etc.)
- **Ghost input pattern**: `w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors` (from StudentForm, LogActivityModal)
- **Motion-safe animations**: `motion-safe:animate-pulse` on skeletons (used in comboboxes), `motion-safe:transition-all motion-safe:duration-200` on hover effects
- **useLogin hook**: Does not exist — needs to be created following `useRegister` pattern in `useAuthQueries.ts`
- **Refresh drain pattern**: No existing pattern. `refreshSubscribers` queue is only drained on success (`onTokenRefreshed`); no `onTokenRefreshFailed` function exists. Fix: reject all subscribers in the catch block.
- **Query keys auth**: `queryKeys.auth.all`, `.sessions`, `.activity`, `.users`, `.auditLogins`, `.auditPasswordChanges`, `.auditFailedAttempts`, `.mfa`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I — Frontend-Only Scope
**PASS** — All changes are in `src/`. No backend code, no database schemas, no server logic.

### Principle II — Server State Discipline
**PASS** — Fixes strengthen React Query discipline (adding missing `enabled` guards, consistent `staleTime`, proper `invalidateQueries`, replacing raw hook `window.location.replace` with `navigate()`). The `useLogin` hook aligns with the mutation pattern.

### Principle III — Global State Minimalism
**PASS** — No new Zustand stores. authStore changes are bug fixes (storage event listener).

### Principle IV — TypeScript Strict Mode
**PASS** — Fixes remove `token!` non-null assertions, add proper runtime guards. All changes comply with `verbatimModuleSyntax`, `erasableSyntaxOnly`, and `noUnusedLocals`.

### Principle V — Component Naming Convention
**PASS** — No new components. No naming violations.

### Cache & API Discipline — Query Keys
**PASS** — All changes use factory functions from `queryKeys.ts`.

### Build Gates
**PASS** — All changes must pass `npm run build` (tsc -b && vite build). Lint must pass `npm run lint`.

### Testing
**PASS** — Fixing broken test imports (AccessDenied, User type). No new test files needed.

**Gate result**: ALL CLEAR — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code

```text
src/
├── api/                  # Domain-based Axios modules
│   ├── client.ts         # Axios instance with JWT interceptor
│   ├── auth/
│   ├── academics/        # groups, courses, schedule
│   ├── crm/              # students, parents
│   ├── finance/
│   ├── dashboard/
│   ├── competitions/
│   ├── enrollments/
│   ├── attendance/
│   ├── hr/
│   ├── analytics/
│   └── notifications/
├── components/
│   ├── common/           # Modal, DataTable, Toast, SearchBar, Pagination
│   ├── layout/           # AppLayout, Sidebar
│   └── {domain}/         # Feature-specific components
├── hooks/                # React Query hooks per domain
│   ├── queryKeys.ts      # Centralized cache keys
│   ├── dashboard/
│   ├── students/
│   ├── notifications/
│   └── finance/
├── pages/                # 18 route page components
├── store/                # Zustand stores (authStore, groupingSettingsStore)
├── lib/                  # queryClient.ts
├── types/                # Global TS interfaces (api.ts, pagination.ts)
├── utils/                # colors.ts, formatting.ts, date.ts, etc.
├── config/               # studentGrouping.ts
├── test/                 # setup.ts (Vitest setup)
└── tests/                # *.test.{ts,tsx} test files
```

**Structure Decision**: Frontend-only SPA. All feature code lives under `src/` organized by domain. No backend, no monorepo packages. New features add files to the appropriate domain under `api/`, `components/`, `hooks/`, and `pages/` as needed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
