# TechnoTerminal CRM — Project Index

**Project**: TechnoTerminal CRM — Robotics Center Management Platform
**Framework**: React 19 + Vite 8 + TypeScript
**Design System**: Precision Engine
**Last Updated**: August 2026

---

## Application Structure

### Entry & Routing

```
src/main.tsx          → StrictMode + QueryClientProvider + i18n import
src/App.tsx           → BrowserRouter, 25 lazy-loaded routes, Suspense, ErrorBoundary
src/lib/queryClient.ts → React Query defaults (staleTime: 5min, gcTime: 30min)
```

### Route Map

| Path | Component | Guard |
|------|-----------|-------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/reset-password` | ResetPasswordPage | Public |
| `/dashboard` | DashboardPage | Protected |
| `/courses` | CoursesPage | Protected |
| `/courses/:id` | CourseDetailPage | Protected |
| `/groups` | GroupsPage | Protected |
| `/groups/:id` | GroupDetailPage | Protected |
| `/students/:id` | StudentDetailPage | Protected |
| `/parents/:id` | ParentDetailPage | Protected |
| `/capabilities` | CapabilitiesPage | Protected |
| `/competitions` | CompetitionsPage | Protected |
| `/competitions/:id` | CompetitionDetailPage | Protected |
| `/competitions/:id/edit` | CompetitionEditPage | Protected |
| `/teams/:id` | TeamDetailPage | Protected |
| `/certificates` | CertificatesPage | Protected |
| `/directory` | DirectoryPage | Instructor-blocked |
| `/enrollments` | EnrollmentsPage | Instructor-blocked |
| `/finance` | FinancePage | Instructor-blocked |
| `/reports` | ReportsPage | Instructor-blocked |
| `/staff` | StaffPage | Instructor-blocked |
| `/tasks` | TasksPage | Instructor-blocked |
| `/settings` | SettingsPage | Instructor-blocked |
| `/notifications` | NotificationsPage | Admin-only |
| `/attendance` | Placeholder `<div>` | Protected |

---

## Module Map

### Core Operations

| Module | Page | Components | API Domain |
|--------|------|------------|------------|
| Dashboard | `DashboardPage` | `dashboard/` (10 files) | `dashboard/` |
| Groups | `GroupsPage`, `GroupDetailPage` | `groups/` (20+ files) | `academics/groups/` |
| Courses | `CoursesPage`, `CourseDetailPage` | `courses/` (6 files) | `academics/courses/` |
| Directory | `DirectoryPage` | `directory/` (7 files) | `crm/students/`, `crm/parents.ts` |
| Student Detail | `StudentDetailPage` | `student/` (10 files) | `crm/students/` (12 sub-modules) |
| Parent Detail | `ParentDetailPage` | `crm/` | `crm/parents.ts` |

### Operations

| Module | Page | Components | API Domain |
|--------|------|------------|------------|
| Enrollments | `EnrollmentsPage` | `enrollments/` (4 files) | `enrollments/` |
| Finance | `FinancePage` | `finance/` (12 files) | `finance/` (7 sub-modules) |
| Attendance | Grid on GroupDetail/Dashboard | `attendance/` (12 files) | `attendance/` |
| Reports | `ReportsPage` | `reports/` (atomic design) | `reports/`, `analytics/` |
| Staff | `StaffPage` | `staff/` (6 files) | `hr/` |
| Tasks | `TasksPage` | `tasks/` (8 files) | `tasks/` |
| Settings | `SettingsPage` | `settings/` (5 files) | `auth/` |

### Events

| Module | Page | Components | API Domain |
|--------|------|------------|------------|
| Competitions | `CompetitionsPage`, `CompetitionDetailPage`, `CompetitionEditPage` | `competitions/` (12 files) | `competitions/` |
| Teams | `TeamDetailPage` | `teams/` | `teams/` |

### Communications

| Module | Page | Components | API Domain |
|--------|------|------------|------------|
| Notifications | `NotificationsPage` | `notifications/` (5 files) | `notifications/` |
| Certificates | `CertificatesPage` | `certificates/` (4 files) | `certificates/` (separate backend) |

---

## Key Files Reference

### State Management

| File | Store | Purpose |
|------|-------|---------|
| `src/store/authStore.ts` | `useAuthStore` | JWT, user, isAuthenticated |
| `src/store/settingsStore.ts` | `useSettingsStore` | Locale (en/ar), direction (ltr/rtl) |
| `src/store/groupingSettingsStore.ts` | `useGroupingSettingsStore` | Age buckets for student grouping |

### API Layer

| File | Purpose |
|------|---------|
| `src/api/client.ts` | Shared Axios instance, Bearer injection, 401 refresh queue |
| `src/api/certificates/certificates.ts` | Separate `certsClient` for certificates backend |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/queryKeys.ts` | Centralized React Query key factories |
| `src/hooks/usePaginatedList.ts` | Server-side pagination |
| `src/hooks/usePagination.ts` | Client-side pagination |
| `src/hooks/useSearch.ts` | Debounced search |
| `src/hooks/useIsMobile.ts` | Mobile breakpoint detection (1023px) |

### Utilities

| File | Purpose |
|------|---------|
| `src/utils/formatting.ts` | `formatTime` (12h format) |
| `src/utils/colors.ts` | Status color maps |
| `src/utils/attendanceTransforms.ts` | Bridges API DTOs for attendance |
| `src/utils/egyptianValidators.ts` | Egyptian phone/national-ID validation |

### i18n

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | i18next initialization |
| `src/locales/en/*.json` | English translations (14 namespaces) |
| `src/locales/ar/*.json` | Arabic translations (14 namespaces) |

---

## Design System

- **Primary**: `#000000` (Black)
- **Primary Container**: `#131b2e` (Dark Navy)
- **Secondary**: `#006a61` (Teal)
- **Surface**: `#f8f9ff` (Light Blue-Tinted)
- **Headlines**: Space Grotesk (`font-headline`)
- **Body**: Inter (`font-body`)
- **Border Radius**: Non-standard — `rounded` = `0.125rem`, `rounded-full` = `0.75rem`

See `docs/design/DESIGN.md` for full design system documentation.

---

## Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview, tech stack, quick start |
| `ARCHITECTURE.md` | Detailed architecture, data flow, patterns |
| `docs/api/README.md` | Complete API endpoint reference (146 endpoints) |
| `docs/design/DESIGN.md` | Precision Engine design system |
| `docs/grouping_pattern_guide.md` | Student grouping pattern guide |
| `AGENTS.md` | Agent instructions for AI assistants |

---

**Status**: React SPA deployed on Vercel, connected to FastAPI backend.
