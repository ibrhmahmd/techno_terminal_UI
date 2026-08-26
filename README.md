# Techno Terminal UI

Modern single-page CRM for managing an educational center — groups, students, enrollments, finance, attendance, competitions, reporting, staff, tasks, and certificates.

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
| Charts | recharts (AreaChart, PieChart) |
| i18n | i18next + react-i18next (English, Arabic) |
| Analytics | @vercel/speed-insights |
| Testing | Vitest 4 + happy-dom + Testing Library |
| Linting | ESLint (flat config) |

## Quick Start

```bash
npm install
npm run dev          # Vite dev — proxies /api → FastAPI backend
npm run build        # tsc -b && vite build — must pass before commits
npm run lint         # ESLint
npm run test         # Vitest
```

## Project Structure

```
src/
├── api/              # Axios client + 16 domain API modules
├── assets/           # Static assets (images, PDFs)
├── components/
│   ├── attendance/   # Attendance grid system (12 components)
│   ├── auth/         # Auth layout
│   ├── certificates/ # Certificate management
│   ├── common/       # Reusable UI (Modal, DataTable, Pagination, etc.)
│   ├── competitions/ # Competition & team management
│   ├── courses/      # Course management
│   ├── crm/          # Student & parent CRUD
│   ├── dashboard/    # Dashboard widgets & mobile cards
│   ├── directory/    # Student/parent directory
│   ├── enrollments/  # Enrollment operations
│   ├── finance/      # Receipts, payments, balances
│   ├── groups/       # Group management & detail
│   ├── layout/       # App shell, sidebar, bottom nav, mobile top bar
│   ├── notifications/# Notification admin & logs
│   ├── reports/      # Reports (atomic design: atoms, molecules, organisms)
│   ├── settings/     # Profile, users, audit, language
│   ├── staff/        # Employee management
│   ├── student/      # Student detail tabs
│   ├── tasks/        # Task management
│   └── teams/        # Team management
├── config/           # App configuration (student grouping)
├── constants/        # Audit labels, etc.
├── hooks/            # React Query hooks + shared utilities (~70 files)
├── i18n/             # i18next setup
├── lib/              # Query client config
├── locales/          # en/ and ar/ translation files (14 namespaces each)
├── pages/            # 25 route-level page components
├── store/            # 3 Zustand stores (auth, settings, grouping)
├── types/            # Shared TypeScript types
├── utils/            # Helpers & formatting
├── test/             # Test setup
└── tests/            # Test files
```

## Key Patterns

- **Server state**: Every API call goes through React Query — no raw `fetch` or `useEffect` for data.
- **Global state**: Zustand for auth, settings (locale/direction), and grouping preferences — all with persist middleware and cross-tab sync.
- **Query keys**: Centralized factory functions in `src/hooks/queryKeys.ts`.
- **API layer**: Axios at `src/api/client.ts` with Bearer token injection and 401 refresh queue.
- **Two backends**: Main API (`/api/v1`) and Certificates API (separate backend, no auth interceptor).
- **Auth guard**: Route wrappers (`ProtectedRoute`, `PublicRoute`, `InstructorBlockedRoute`, `RoleBasedRoute`) wait for Zustand rehydration.
- **i18n**: 14 namespace JSON files per language (en, ar) via i18next. Language persisted in settings store. RTL support via direction state.
- **Mobile-first**: Bottom nav, mobile top bar, bottom sheets for complex interactions. `useIsMobile` hook (breakpoint: 1023px).
- **Attendance grid**: 12-component system with batch save, per-session retry, mobile two-step flow.
- **Charts**: recharts for revenue (AreaChart) and student progress (PieChart) in reports.

## Pages (25)

| Page | Route | Guard |
|------|-------|-------|
| Dashboard | `/dashboard` | Protected |
| Courses | `/courses` | Protected |
| Course Detail | `/courses/:id` | Protected |
| Groups | `/groups` | Protected |
| Group Detail | `/groups/:id` | Protected |
| Student Detail | `/students/:id` | Protected |
| Parent Detail | `/parents/:id` | Protected |
| Directory | `/directory` | Instructor-blocked |
| Enrollments | `/enrollments` | Instructor-blocked |
| Finance | `/finance` | Instructor-blocked |
| Reports | `/reports` | Instructor-blocked |
| Staff | `/staff` | Instructor-blocked |
| Tasks | `/tasks` | Instructor-blocked |
| Settings | `/settings` | Instructor-blocked |
| Competitions | `/competitions` | Protected |
| Competition Detail | `/competitions/:id` | Protected |
| Competition Edit | `/competitions/:id/edit` | Protected |
| Team Detail | `/teams/:id` | Protected |
| Certificates | `/certificates` | Protected |
| Notifications | `/notifications` | Admin-only |
| Capabilities | `/capabilities` | Protected |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Forgot Password | `/forgot-password` | Public |
| Reset Password | `/reset-password` | Public |

## Deployment

Vercel SPA — `vercel.json` rewrites `/api/*` to the FastAPI backend, all other routes to `/index.html`. The certificates API is proxied via Vite in dev (`/certs-api`) and hit directly in production.

## Architecture

See `ARCHITECTURE.md` for detailed data flow, component hierarchy, and coding standards.
