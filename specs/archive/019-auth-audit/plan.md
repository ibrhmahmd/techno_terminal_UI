# Implementation Plan: Auth Audit Fix

**Branch**: `019-auth-audit` | **Date**: 2026-05-22 | **Spec**: `specs/019-auth-audit/spec.md`
**Input**: Feature specification from `specs/019-auth-audit/spec.md`

## Summary

Fix 54 audit findings across the auth feature: 1 critical registration bug, 8 accessibility violations, 5 dead exports, 2 manual API calls to migrate to React Query, 2 router-link regressions, 2 type safety issues, and ~30 minor issues (missing `aria-hidden`, raw error messages, "Loading..." text). All changes are frontend-only.

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

### Feature-Specific Context

- **No new files needed** — all changes modify existing files
- **Affected files**: 14 files across `src/api/auth/`, `src/components/settings/`, `src/components/common/`, `src/hooks/`, `src/pages/`, `src/store/`
- **Register API**: returns `Promise<User>` (no auth tokens) → fix redirects to `/login` after registration
- **Focus trapping**: no existing project utility → implement native focus trapping
- **Auth keys**: currently in local `authKeys` factory → move to centralized `queryKeys.ts`
- **Quickest wins**: `aria-hidden` attributes (~15 instances), raw error message replacements (~5 instances), dead export removal (~5 exports)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Evaluation

| Principle | Status | Rationale |
|-----------|--------|-----------|
| I. Frontend-Only Scope | ✅ PASS | All changes in `src/`. No backend code, schemas, or server logic. |
| II. Server State Discipline (NON-NEGOTIABLE) | ✅ PASS | Changes improve React Query compliance — migrating manual API calls to mutations, broadening cache invalidation. |
| III. Global State Minimalism | ✅ PASS | No new Zustand stores. Removing redundant `useEffect` → store sync. |
| IV. TypeScript Strict Mode | ✅ PASS | Removing `as any` patterns, adding `isAxiosError` guard, adding select value validation. |
| V. Component Naming Convention | ✅ PASS | No new components. Modifying existing files only. |
| Cache & API Discipline | ✅ PASS | Moving auth keys to centralized `queryKeys.ts`. Adding proper cache invalidation to mutations. |
| Build Gates | ✅ PASS | Low-risk changes (aria attributes, dead code removal, type guard additions). Build must pass. |

**Gate Result**: ✅ PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/019-auth-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output — design decisions
├── spec.md              # Feature specification — 5 user stories, 19 FRs
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code — Modified Files Only

```text
src/api/auth/
├── auth.ts              # Remove enrollMfa export, remove export from LoginResponse/RefreshRequest, guard console.warn
├── admin.ts             # Remove export from InviteResponse
└── index.ts             # Remove enrollMfa from re-exports

src/components/
├── common/
│   ├── RoleBasedRoute.tsx       # <a> → <Link>, aria-hidden on icons, remove AccessDenied export
│   └── InstructorBlockedRoute.tsx  # No changes
├── settings/
│   ├── ProfileTab.tsx           # Remove useEffect sync, add LoadingSpinner, aria-hidden, raw error → friendly
│   ├── SessionsTab.tsx          # aria-hidden on icons, modal role/aria-modal/focus-trap
│   ├── ActivityTab.tsx          # Import EVENT_LABELS from shared location
│   ├── UsersTab.tsx             # React Query mutations, aria-labels, modal ARIA, raw errors → friendly, select validation
│   └── AuditLogTable.tsx        # Remove AuditUserFilter export, LoadingSpinner, aria-hidden

src/hooks/
├── useAuthQueries.ts   # Remove useMfaStatus/useUser, move keys to centralized queryKeys, broaden invalidation
└── queryKeys.ts         # Add auth sub-keys

src/pages/
├── RegisterPage.tsx     # Fix token fabrication — redirect to /login after registration
├── LoginPage.tsx        # isAxiosError guard
├── SettingsPage.tsx     # <a> → <Link>, tab ARIA roles, aria-hidden

src/store/
├── authStore.ts         # Guard console.warn behind DEV check
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations found. Section intentionally left empty.

## Phase 0: Research

**Status**: ✅ Complete — `specs/019-auth-audit/research.md`

### Unknowns Resolved

| Unknown | Decision |
|---------|----------|
| Register API returns tokens? | `register()` returns `Promise<User>` only. Fix: redirect to `/login` after registration (no auto-login). |
| Focus trapping utility? | No existing utility. Implement native focus trapping: cycle through focusable elements on Tab/Shift+Tab, close on Escape, trap within modal overlay. |
| Modal pattern consistency | All 4 modals in UsersTab + 1 in SessionsTab follow same pattern — use reusable focus-trapping wrapper or inline implementation. |

## Phase 1: Design & Contracts

**Status**: ✅ Complete

| Artifact | Description |
|----------|-------------|
| `spec.md` | 5 user stories, 19 FRs, 6 SCs, edge cases documented |
| `checklists/requirements.md` | Spec quality checklist with 2 pending clarifications |

### Agent Context Update

Update `AGENTS.md` SPECKIT markers to point to this plan file:

```
`specs/019-auth-audit/plan.md`
```

## Verification

```bash
npm run build      # tsc -b && vite build must pass
npm run lint       # Zero new errors

# Verify no remaining issues in modified files:
rg ': any' src/components/settings/ src/hooks/useAuthQueries.ts src/api/auth/
rg 'console\.(log|warn)' src/components/settings/ src/pages/RegisterPage.tsx src/store/authStore.ts
rg 'export default' src/api/client.ts
rg 'useEffect.*get' src/hooks/useAuthQueries.ts
```
