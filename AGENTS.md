# Techno Terminal UI — Agent Instructions

## 1. Commands
```bash
npm run dev                    # Vite dev (proxy /api → http://0.0.0.0:8000)
npm run build                  # tsc -b && vite build — must pass before commits
npm run lint                   # ESLint (flat config at eslint.config.js)
npm run test                   # Vitest
npm run test -- src/tests/Foo.test.tsx  # single file
```
No formatter configured — lint only.

**Build caveat**: `tsc -b` uses `tsconfig.app.json` which **excludes** `src/tests/` and `*.test.*` — test files not typechecked during build.

---

## 2. TS & Toolchain Quirks
- `verbatimModuleSyntax` → must `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, namespaces, parameter properties; use const objects or union types
- `noUncheckedSideEffectImports: true` in both tsconfigs
- **Tailwind**: v3 config (`tailwind.config.js`, `postcss.config.js` uses `tailwindcss` v3 plugin) despite `@tailwindcss/postcss` v4 installed — don't use v4 syntax
- **Fonts**: Space Grotesk (`font-headline`) headings, Inter (`font-body`) body — Google Fonts in `index.html`
- **Icons**: Lucide React components + Google Material Symbols (CSS class `material-symbols-outlined`)
- **Time formatting**: Use `formatTime` from `src/utils/formatting.ts` (12h), not inline formatting
- **Charts**: recharts in `src/components/reports/` for `StudentProgressChart` and `RevenueChart`
- **`@vercel/speed-insights`**: wired in `src/App.tsx`

---

## 3. Architecture

### Entrypoint & Routing
- `src/lib/queryClient.ts` → `src/main.tsx` (StrictMode + QueryClientProvider) → `src/App.tsx`
- `src/App.tsx`: BrowserRouter, 23 lazy-loaded pages (named exports from `src/pages/`), Suspense + ErrorBoundary
- Route guards: `ProtectedRoute` (auth), `PublicRoute` (unauthenticated + branded skeleton during hydration), `InstructorBlockedRoute` (blocks instructor role), `RoleBasedRoute allowedRoles` (admin-only)
- Wildcard (`*`) → `/login` (not dashboard) to avoid redirect loops

### API & State
- `src/api/client.ts`: Axios, base `/api/v1`, Bearer token injection, 401 refresh queue with request queuing → logout on failure. Dynamic import of `./auth` in interceptor to break circular dependency.
- 14 API domain modules under `src/api/` (academics, analytics, attendance, auth, competitions, crm, dashboard, enrollments, finance, hr, notifications, reports, teams)
- `src/hooks/queryKeys.ts`: centralized React Query key factories — use these, never inline arrays
- `src/store/authStore.ts`: Zustand, persist key `auth-storage`, cross-tab sync via `storage` event
- React Query defaults: `staleTime: 5min`, `gcTime: 30min`, `retry: 1`, `refetchOnWindowFocus: false`; mutations `retry: 0`
- API envelopes: `ApiResponse<T>` / `PaginatedApiResponse<T>` in `src/types/api.ts`

### Route Protection
- `ProtectedRoute` — unauthenticated → `/login`. Waits for Zustand persist rehydration.
- `PublicRoute` — authenticated → `/dashboard`. Shows branded skeleton during hydration.
- `InstructorBlockedRoute` — instructors → `/dashboard`. Blocks `/directory`, `/enrollments`, `/finance`, `/reports`, `/staff`, `/settings`.
- `RoleBasedRoute allowedRoles={['admin','system_admin']}` — non-admins → `/dashboard`. Used for `/notifications`.

---

## 4. Mobile Layout

**Breakpoint**: `lg` = 1024px. `useIsMobile` hook matches `(max-width: 1023px)`.

- **Sidebar**: `hidden lg:flex`, fixed left `w-64`. Hidden on mobile.
- **`<main>`**: `lg:ml-64`, `pb-16 lg:pb-0` (BottomNav clearance auto-in `AppLayout`). Pages outside `AppLayout` must add their own `pb-16`.
- **BottomNav**: `lg:hidden`, fixed bottom, `z-50`. 4 primary tabs + "More" → `MobileNavSheet`.
- **Top bar**: `MobileTopBar` (sticky `top-0 z-30 lg:hidden`) on some pages; `TopNavbar` (desktop only) in `src/components/dashboard/`.
- **Bottom sheets**: `z-[60]` (above BottomNav `z-50`), backdrop `fixed inset-0 bg-black/60 z-[60]`, dismiss on backdrop click / Escape / close button. `MobileNavSheet` auto-closes on `location.pathname` change via `useEffect`.

---

## 5. Testing (Vitest)
- Environment: `happy-dom`. Setup: `src/test/setup.ts` (`@testing-library/jest-dom`)
- Globals enabled: `describe`, `it`, `expect`, `vi` — no import needed
- Convention: `src/tests/*.{test,spec}.{ts,tsx}` (vitest config: `src/**/*.{test,spec}.{ts,tsx}`)

---

## 6. Common Pitfalls

- **Query `enabled` guard blocking initial load**: Setting `enabled: term.length >= 2` on a hook that serves both listing and search (like `useEmployees`) prevents unfiltered load. Use `enabled: term.length === 0 || term.length >= 2` for dual-purpose hooks. Purely search hooks (`useStudentsSearch`, `useParentsSearch`) are safe because a separate list query handles initial load.
- **Query key duplication**: `queryKeys.employeesAll` in `queryKeys.ts` is unused — staff hooks define their own `staffKeys` in `useStaff.ts`. Invalidating via `queryKeys.employeesAll` misses staff caches.
- **Bottom sheet z-index**: sheets need `z-[60]` (above BottomNav `z-50`); backdrop must use same layer.
- **Route-sheet double-close**: `MobileNavSheet` watches `location.pathname` and auto-closes on navigation — don't add redundant `onClose` calls.
- **API debug**: `localStorage.setItem('api_debug', 'true')` logs all requests; auto-enabled in DEV.

---

## 7. Deploy & Config
- **Vercel**: `vercel.json` rewrites `/api/*` → FastAPI backend, all other routes → `/index.html`
- **No `.env` files** (gitignored), no CI (`.github/`), no pre-commit hooks (`.husky/`)
- **No `opencode.json`** — this file (`AGENTS.md`) is the primary instruction source
- **Docs**: `docs/api/README.md` (endpoint reference by page), `ARCHITECTURE.md`, `docs/design/DESIGN.md`
- **Specs**: `specs/<NNN>-<name>/plan.md` for active feature plans
- **Designs**: `designs/` directory for `.pen` files (Pencil CLI)
- **Gitignored**: `.opencode/*` (includes Speckit workflow commands), `.specify/*`
- **Audit artifacts**: `.feature-audit.json`, `src/audit-findings.json`

<!-- SPECKIT START -->
Active plan: `specs/053-disable-scroll-money-inputs/plan.md`
<!-- SPECKIT END -->
