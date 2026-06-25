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

**Build caveat**: `tsc -b` uses `tsconfig.app.json` which **excludes** `src/tests/` and `*.test.*` — test files are not typechecked during build.

---

## 2. TS & Toolchain Quirks
- `verbatimModuleSyntax` → must `import type` for type-only imports
- `erasableSyntaxOnly: true` → no enums, namespaces, parameter properties; use const objects or union types
- `noUncheckedSideEffectImports: true` in both tsconfigs
- **Tailwind**: v3 config (`tailwind.config.js`, `postcss.config.js` uses `tailwindcss` v3 plugin) despite `@tailwindcss/postcss` v4 installed — don't use v4 syntax
- **Fonts**: Space Grotesk (`font-headline`) headings, Inter (`font-body`) body — Google Fonts in `index.html`
- **Icons**: Lucide React components + Google Material Symbols (CSS class `material-symbols-outlined`)
- **Time formatting**: Use `formatTime` from `src/utils/formatting.ts` (12h), not inline formatting

---

## 3. Route Protection (`src/App.tsx`)
| Guard | Access | Routes |
|-------|--------|--------|
| `<PublicRoute />` | Unauthenticated only | `/login`, `/register`, `/forgot-password`, `/reset-password` |
| `<ProtectedRoute />` | Authenticated | `/dashboard`, `/courses`, `/courses/:id`, `/groups`, `/groups/:id`, `/students/:id`, `/parents/:id`, `/attendance`, `/capabilities`, `/competitions`, `/competitions/:id`, `/competitions/:id/edit`, `/teams/:id` |
| `<InstructorBlockedRoute />` | Block instructors | `/directory`, `/enrollments`, `/finance`, `/reports`, `/staff`, `/settings` |
| `<RoleBasedRoute allowedRoles={['admin','system_admin']} />` | Admin only | `/notifications` |

Guards wait for Zustand persist rehydration before deciding auth state.

---

## 4. API & State Management
- **Global state**: Zustand (`src/store/authStore.ts`, persist key `auth-storage`, cross-tab sync via `storage` event)
- **Server state**: React Query (`src/lib/queryClient.ts`): `staleTime: 5min`, `gcTime: 30min`, `retry: 1`, `refetchOnWindowFocus: false`; mutations `retry: 0`
- **Query keys**: Centralized in `src/hooks/queryKeys.ts` — use factory functions, never inline arrays
- **Query key duplication**: `queryKeys.employeesAll` in `queryKeys.ts` is unused; staff hooks define their own `staffKeys` in `useStaff.ts`. Invalidation via `queryKeys.employeesAll` will miss staff caches.
- **API client**: `src/api/client.ts` (Axios, base `/api/v1`); Bearer token from `authStore` (skips `/auth/login`, `/auth/refresh`)
- **401 handling**: Queues concurrent requests → `POST /auth/refresh` → retries. Falls back to logout + redirect to `/login`
- **Debug**: `localStorage.setItem('api_debug', 'true')` logs all requests; auto-enabled in DEV
- **Envelopes**: `ApiResponse<T>` / `PaginatedApiResponse<T>` in `src/types/api.ts`

---

## 5. Component Conventions
| Suffix | Directory | Example |
|--------|-----------|---------|
| Page | `pages/` | `GroupsPage.tsx` |
| Tab/Modal/Form/Table/Card | `components/{domain}/` | `AttendanceTab.tsx` |
| Shared | `components/{domain}/shared/` | `GroupStatusBadge.tsx` |

Data flow: Page → custom hook (React Query) → API fn → server → cache → render

Reusable hooks: `usePaginatedList`, `usePagination`, `useSearch`, `useDebounce` in `src/hooks/`.

**Hooks structure**: `src/hooks/useStaff.ts` — implements its own `staffKeys` + all employee hooks. `src/hooks/useDirectory.ts` — base queries for students/parents; `src/hooks/directory/` — composed hooks (`useDirectoryData`, `useAdvancedSearch`, `useStudentActions`).

---

## 6. Testing (Vitest)
- Environment: `happy-dom` (not jsdom). Setup: `src/test/setup.ts` (`@testing-library/jest-dom`)
- Globals enabled: `describe`, `it`, `expect`, `vi` — no import needed
- Convention: `src/tests/*.test.{ts,tsx}` (config: `src/**/*.{test,spec}.{ts,tsx}`)

---

## 7. Common Pitfalls

- **Query `enabled` guard blocking initial load**: Setting `enabled: term.length >= 2` on a listing query that also serves as the unfiltered page load (like `useEmployees`) prevents the query from ever firing when search is empty. If the hook serves double duty (listing + search), allow empty strings: `enabled: term.length === 0 || term.length >= 2`. Purely search-only hooks (`useStudentsSearch`, `useParentsSearch`) are safe because a separate list query handles initial load.

---

## 8. Vercel Deploy
- `vercel.json`: `/api/*` → `https://techno-terminal-5c255cfe.fastapicloud.dev/api/*`, all other routes → `/index.html` (SPA fallback)
- Build: `npm run build`, output `dist/`

---

## 9. Config & Specs
- ESLint: flat config `eslint.config.js`, ignores `dist/`
- No `.env`, no CI (`.github/`), no pre-commit hooks (`.husky/`)
- Gitignored: `.opencode/*`, `.specify/*`
- Specs: `specs/<NNN>-<name>/plan.md` for active feature plans. Highest: `050-*`
- Supplementary docs: `ARCHITECTURE.md`, `auth-spec.md`, `competitions-api.md`, `daily-reports.md`, `enrollments-spec.md`, `docs/`

<!-- SPECKIT START -->
Active plan: `specs/050-staff-page-redesign/plan.md`
<!-- SPECKIT END -->

---
**Note**: The frontend-feature-audit skill development has moved to its own repo:
→ `~/Desktop/frontend-feature-audit/` — https://github.com/YOUR_USER/frontend-feature-audit
