# Techno Terminal UI

Modern single-page CRM for managing an educational center — groups, students, enrollments, finance, attendance, competitions, and reporting.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite 8 |
| Language | TypeScript (strict mode) |
| Routing | React Router DOM v7 |
| Server State | TanStack React Query 5 |
| Global State | Zustand 5 |
| API Client | Axios (JWT auth, 401 auto-refresh) |
| Styling | Tailwind CSS v3.4 |
| Icons | Lucide React + Google Material Symbols |
| Fonts | Inter (body), Space Grotesk (headings) |
| Testing | Vitest 4 + happy-dom + Testing Library |
| Linting | ESLint (flat config) |

## Quick Start

```bash
npm install
npm run dev          # Vite dev — proxies /api → http://0.0.0.0:8000
npm run build        # tsc -b && vite build — must pass before commits
npm run lint         # ESLint
npm run test         # Vitest
```

## Project Structure

```
src/
├── api/              # Axios client + domain API functions
├── components/
│   ├── common/       # Reusable UI (Modal, DataTable, Pagination, etc.)
│   └── {domain}/     # Feature components (groups, finance, crm, etc.)
├── hooks/            # React Query hooks + shared utilities
├── pages/            # Route-level page components
├── store/            # Zustand stores (auth, etc.)
├── types/            # Shared TypeScript types
├── utils/            # Helpers & formatting
└── test/             # Test setup
```

## Key Patterns

- **Server state**: Every API call goes through React Query — no raw `fetch` or `useEffect` for data.
- **Global state**: Zustand reserved for auth + truly cross-cutting UI (sidebar, etc.).
- **Query keys**: Centralized factory functions in `src/hooks/queryKeys.ts`.
- **API layer**: Axios at `src/api/client.ts` with Bearer token injection and 401 refresh queue.
- **Auth guard**: Route wrappers (`ProtectedRoute`, `PublicRoute`, `RoleBasedRoute`) wait for Zustand rehydration.

## Deployment

Vercel SPA — `vercel.json` rewrites `/api/*` to the FastAPI backend, all other routes to `/index.html`.

## Architecture

See `ARCHITECTURE.md` for detailed data flow, component hierarchy, and coding standards.
