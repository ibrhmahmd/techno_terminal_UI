# Techno Terminal UI — Agent Instructions

## 1. Developer Commands

```bash
npm run dev      # Vite dev server (proxy /api → http://0.0.0.0:8000)
npm run build    # tsc -b && vite build
npm run lint     # ESLint (flat config at eslint.config.js)
npm run test     # Vitest (happy-dom, globals enabled)
npm run preview  # Vite preview of production build
npm run test -- src/tests/Foo.test.tsx  # single test file
```

**Build caveat**: `tsc -b` uses `tsconfig.app.json` which **excludes** `src/tests/` and `*.test.*` — test files are not typechecked during build.

**Vercel prod** (`vercel.json`): `/api/*` → `https://techno-terminal-5c255cfe.fastapicloud.dev/api/*`, all other routes → `/index.html` (SPA fallback). Build command is `npm run build`, output is `dist/`.

---

## 2. Route Protection (`src/App.tsx`)

| Guard | Access | Routes |
|-------|--------|--------|
| `<PublicRoute />` | Unauthenticated only | `/login`, `/register`, `/forgot-password` |
| `<ProtectedRoute />` | Authenticated | `/dashboard`, `/courses`, `/courses/:id`, `/groups`, `/groups/:id`, `/students/:id`, `/parents/:id`, `/attendance`, `/competitions`, `/competitions/:id`, `/competitions/:id/edit`, `/teams/:id` |
| `<InstructorBlockedRoute />` | Block instructors | `/directory`, `/enrollments`, `/finance`, `/reports`, `/staff`, `/settings` |
| `<RoleBasedRoute allowedRoles={['admin','system_admin']} />` | Admin only | `/notifications` |

- `/` → `/dashboard`, wildcard `*` → `/login`
- `ProtectedRoute` waits for Zustand `persist` rehydration before deciding
- `/attendance` is a `<div>Attendance</div>` placeholder

---

## 3. Framework & Toolchain Quirks

- **TS strict**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — must `import type` for type-only imports
- **`erasableSyntaxOnly: true`**: enums, namespaces, parameter properties **forbidden** — use const objects or union types
- **Tailwind v3** config (`tailwind.config.js`, `postcss.config.js` uses `tailwindcss` v3 plugin) despite `@tailwindcss/postcss` v4 in package.json
- **Fonts**: Space Grotesk (`font-headline`) for headings, Inter (`font-body`) for body — loaded from Google Fonts in `index.html`
- **Icons**: Lucide React (component) + Google Material Symbols (CSS class `material-symbols-outlined`)
- **Zustand persist**: Auth store key `auth-storage` in localStorage; cross-tab sync via `storage` event listener
- **Vercel Speed Insights**: `<SpeedInsights />` in `App.tsx`

---

## 4. Testing (`vitest.config.ts`)

- **Environment**: `happy-dom` (not jsdom). Setup: `src/test/setup.ts` (just `@testing-library/jest-dom`).
- **Globals enabled**: `describe`, `it`, `expect`, `vi` — no import needed.
- **Pattern**: `src/**/*.{test,spec}.{ts,tsx}` — convention is `src/tests/*.test.{ts,tsx}`.

---

## 5. API Layer (`src/api/`)

- **Axios client** at `src/api/client.ts`, base URL `/api/v1`
- **Request interceptor**: injects `Bearer` token from `authStore` (skips `/auth/login`, `/auth/refresh`)
- **Response interceptor**: On 401 → queues concurrent requests, calls `POST /auth/refresh`, retries. Falls back to logout + redirect to `/login` on failure.
- **Debug mode**: `localStorage.setItem('api_debug', 'true')` logs all requests/responses/errors; auto-enabled in `import.meta.env.DEV`
- **API envelopes**: `ApiResponse<T>` (single) / `PaginatedApiResponse<T>` (paginated) in `src/types/api.ts`

### Domain API folders
```
api/auth/         api/academics/     api/crm/          api/finance/
api/dashboard/    api/hr/            api/analytics/     api/notifications/
api/competitions/ api/attendance/    api/enrollments/   api/teams/
```

---

## 6. Cache Management

### React Query client (`src/lib/queryClient.ts`)
- Defaults: `staleTime: 5min`, `gcTime: 30min`, `retry: 1`, `refetchOnWindowFocus: false`
- Mutations never auto-retry (`retry: 0`)

### staleTime Overrides by Data Volatility
| staleTime | Data |
|-----------|------|
| 0 min | Bulk messaging job status |
| 1 min | Attendance |
| 2-3 min | Directory, waiting list, teams |
| 5 min (default) | Dashboard, courses, students |
| 10 min | Groups flat list, templates |

### Centralized keys (`src/hooks/queryKeys.ts`)
Pattern: `['resource', id?, 'nested?']`. Use via exported factory:
```ts
queryKeys.group(id)   // → ['groups', id]
queryKeys.student(id) // → ['students', id]
```

### Domain-specific keys
| Domain | File | Keys |
|--------|------|------|
| Groups | `hooks/useGroupQueries.ts` | `groupKeys.flat`, `groupKeys.grouped(field)` |
| Dashboard | `hooks/dashboard/useDashboard.ts` | `dashboardKeys.overview(date)` |
| Notifications | `hooks/notifications/queryKeys.ts` | `notificationKeys.templates`, etc. |

### Cross-domain invalidation
After creating a group, `useGroupQueries.ts` also invalidates dashboard cache for upcoming dates:
```ts
const upcomingDates = getUpcomingDates(7)
upcomingDates.forEach(date =>
  qc.invalidateQueries({ queryKey: dashboardKeys.overview(date) })
)
```

---

## 7. Component Conventions

### Naming suffix → location
| Suffix | Directory | Example |
|--------|-----------|---------|
| Page | `pages/` | `GroupsPage.tsx` |
| Tab | `components/{domain}/` | `AttendanceTab.tsx` |
| Modal/Dialog | `components/{domain}/` | `CreateAccountModal.tsx` |
| Form | `components/{domain}/` | `GroupForm.tsx` |
| Table | `components/{domain}/` | `GroupsTable.tsx` |
| Card | `components/{domain}/` | `GroupSessionCard.tsx` |
| Shared | `components/{domain}/shared/` | `GroupStatusBadge.tsx` |

### Folder layout
```
src/components/
├── common/          # Modal, DataTable, Pagination, Toast, SearchBar, etc.
├── layout/          # AppLayout, Sidebar
├── {domain}/        # groups/, crm/, finance/, courses/, student/, etc.
└── {domain}/detail/ # Domain-specific detail sub-panels
```

### Data flow
Page → custom hook (React Query) → API function (Axios) → server → cache → render

**Reusable hooks**: `usePaginatedList`, `usePagination`, `useSearch`, `useDebounce` in `src/hooks/`.

---

## 8. Config & Environment

- **ESLint**: Flat config `eslint.config.js` (not `.eslintrc`). Ignores `dist/`.
- **No `.env` files** in repo — no local env setup required.
- **No CI** (no `.github/`) and **no pre-commit hooks** (no `.husky/`).
- **Gitignored**: `.opencode/*` and `.specify/*` are gitignored.
- **Specs**: `specs/<NNN>-<name>/plan.md` for active feature plans. Current highest: `029-*`. Active branch: `029-groups-filter-ui`.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/030-groups-ui-redesign/plan.md`
<!-- SPECKIT END -->
