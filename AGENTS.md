# Techno Terminal UI - Agent Instructions

## 1. Developer Commands

```bash
npm run dev      # Vite dev server with /api proxy
npm run build    # tsc -b && vite build
npm run lint     # ESLint
npm run test     # Vitest
npm run preview  # Vite preview (production build)
npm run test -- src/tests/Foo.test.tsx  # single test file
```

**Build caveat**: `tsc -b` uses `tsconfig.app.json` which **excludes** `src/tests/` and `*.test.{ts,tsx}` — test files are not typechecked during build.

### Dev proxy (`vite.config.ts`)
```
/api → https://techno-terminal-5c255cfe.fastapicloud.dev/
```

### Production (Vercel, `vercel.json`)
- `/api/*` → same fastapicloud.dev backend
- All other routes → `/index.html` (SPA fallback)

---

## 2. Route Protection (`src/App.tsx`)

| Guard | Access | Routes |
|-------|--------|--------|
| `<PublicRoute />` | Unauthenticated only | `/login` |
| `<ProtectedRoute />` | Authenticated | `/dashboard`, `/groups/*`, `/students/:id`, `/parents/:id`, `/courses/*`, `/directory`, `/enrollments`, `/finance`, `/competitions/*`, `/teams/:id`, `/reports`, `/staff`, `/settings` |
| `<RoleBasedRoute allowedRoles={['admin', 'system_admin']} />` | Admin only | `/notifications` |

- `/` redirects to `/dashboard`, wildcard `*` redirects to `/login`
- `ProtectedRoute` waits for Zustand `persist` rehydration before deciding
- `/attendance` route exists but renders `<div>Attendance</div>` placeholder

---

## 3. Framework & Toolchain Quirks

- **TypeScript strict mode**: `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` — must use `import type` for type-only imports
- **`erasableSyntaxOnly: true`**: enums, namespaces, and parameter properties are **forbidden** — use const objects or union types instead
- **Tailwind v3** (despite `@tailwindcss/postcss` v4 in package.json; `postcss.config.js` uses v3 plugin, `tailwind.config.js` is v3 format)
- **Fonts**: Space Grotesk (headlines, `font-headline`), Inter (body, `font-body`) — loaded from Google Fonts in `index.html`
- **Icons**: Lucide React (component) + Google Material Symbols (CSS class `material-symbols-outlined`)
- **Zustand persist**: Auth store persisted under localStorage key `auth-storage`; also syncs across tabs via `storage` event listener
- **Vercel Speed Insights**: `<SpeedInsights />` in `App.tsx`

---

## 4. Testing (`vitest.config.ts`)

- **Environment**: `happy-dom` (not jsdom)
- **Setup**: `src/test/setup.ts` (just `import '@testing-library/jest-dom'`)
- **Test files**: Convention is `src/tests/` with `*.test.{ts,tsx}` pattern (vitest config also accepts `*.spec.*` and subdirectories under `src/`)
- **Vitest globals** enabled (`describe`, `it`, `expect`, `vi` — no import needed)
- **Run single file**: `npm run test -- src/tests/GroupsHeader.test.tsx`

---

## 5. API Layer (`src/api/`)

- **Base**: Axios client at `src/api/client.ts`, base URL `/api/v1`
- **Request interceptor**: Injects `Bearer` token from `authStore` (skips `/auth/*` endpoints)
- **Response interceptor**: On 401 → queues concurrent requests, calls `POST /auth/refresh`, retries with new token. Falls back to logout if refresh fails or no refresh token.
- **Debug mode**: `localStorage.setItem('api_debug', 'true')` logs all requests/responses/errors to console; also auto-enabled in `import.meta.env.DEV`
- **API response envelope**: `ApiResponse<T>` (single) / `PaginatedApiResponse<T>` (paginated) in `src/types/api.ts`

### API Domain Folders
```
api/auth/         api/academics/     api/crm/          api/finance/
api/dashboard/    api/hr/            api/analytics/     api/notifications/
api/competitions/ api/attendance/    api/enrollments/   api/teams/
```

---

## 6. Cache Management

### React Query client (`src/lib/queryClient.ts`)
- Default `staleTime`: 5 min | `gcTime`: 30 min | `retry`: 1 | `refetchOnWindowFocus`: false
- Mutations never auto-retry (`retry: 0`)

### staleTime Overrides by Data Volatility
| staleTime | Data |
|-----------|------|
| 0 min | Bulk messaging job status |
| 1 min | Attendance |
| 2-3 min | Directory, waiting list, teams |
| 5 min (default) | Dashboard, courses, students |
| 10 min | Groups flat list, templates |

### Centralized query keys (`src/hooks/queryKeys.ts`)
Pattern: `['resource', id?, 'nested?']`. Always use via the exported factory.
```typescript
queryKeys.group(id)   // → ['groups', id]
queryKeys.student(id) // → ['students', id]
```

### Domain-specific keys
| Domain | File | Keys |
|--------|------|------|
| Groups | `hooks/useGroupQueries.ts` | `groupKeys.flat`, `groupKeys.grouped(field)` |
| Dashboard | `hooks/dashboard/useDashboard.ts` | `dashboardKeys.overview(date)` |
| Notifications | `hooks/notifications/queryKeys.ts` | `notificationKeys.templates`, etc. |

### Cross-domain invalidation (non-obvious)
After creating a group, `useGroupQueries.ts` also invalidates dashboard cache for upcoming dates:
```typescript
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

### Folder organization
```
src/components/
├── common/          # Modal, DataTable, Pagination, Toast, SearchBar, etc.
├── layout/          # AppLayout, Sidebar
├── {domain}/        # groups/, crm/, finance/, courses/, etc.
└── {domain}/detail/ # Domain-specific detail sub-panels
```

### Data flow
Page → custom hook (React Query) → API function (Axios) → server → cache → render

---

## 8. Config & Environment

- **ESLint**: Flat config at `eslint.config.js` (not `.eslintrc`). Ignores `dist/`.
- **No `.env` files** in repo — no local env setup required.
- **No CI workflows** (no `.github/`) and **no pre-commit hooks** (no `.husky/`).
- **Specs**: Read `specs/<NNN>-<name>/plan.md` for active feature plans and context. Multiple specs exist (001–013); check `specs/` directory for the most recent.

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/026-finance-ui-tweaks/plan.md`
<!-- SPECKIT END -->

## Active Plan (2026-06-02 Update)

This feature branch (`026-finance-ui-tweaks`) modifies the previous `025-finance-ui-ux` implementation with:
- **Metrics strip cards kept, labels updated**: Keep `MetricsStripCards` component, update card labels to "Today's Receipts", "Create Receipt", "Unpaid", "Refunds"
- **Payment pills updated**: 4 options (Cash, E-Wallet, instaPay, Other) each with unique color and icon; payment method is now required
- **Line item layout**: Two-column layout — Student + Enrollment left, Amount + Discount + Payment Type right
- **Contracts**: See `specs/026-finance-ui-tweaks/contracts/` for component prop contracts
