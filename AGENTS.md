# Techno Terminal UI - Agent Instructions

## 1. Developer Commands

```bash
npm run dev      # Start dev server (proxies /api to leapcell.dev)
npm run build   # Build: tsc -b && vite build
npm run lint   # ESLint
npm run test    # Vitest
npm run preview # Preview production build
```

Dev server proxy in `vite.config.ts`:
- `/api` → `https://techno-terminal-ibrhmahmd2165-00zb1kxm.leapcell.dev`

---

## 2. Pages & Routes

Client-side routing in `src/App.tsx`:

| Route | Page | Protection |
|-------|------|------------|
| `/login` | LoginPage | PublicRoute |
| `/dashboard` | DashboardPage | ProtectedRoute |
| `/groups` | GroupsPage | ProtectedRoute |
| `/groups/:id` | GroupDetailPage | ProtectedRoute |
| `/students/:id` | StudentDetailPage | ProtectedRoute |
| `/parents/:id` | ParentDetailPage | ProtectedRoute |
| `/courses` | CoursesPage | ProtectedRoute |
| `/courses/:id` | CourseDetailPage | ProtectedRoute |
| `/directory` | DirectoryPage | ProtectedRoute |
| `/enrollments` | EnrollmentsPage | ProtectedRoute |
| `/finance` | FinancePage | ProtectedRoute |
| `/competitions` | CompetitionsPage | ProtectedRoute |
| `/competitions/:id` | CompetitionDetailPage | ProtectedRoute |
| `/teams/:id` | TeamDetailPage | ProtectedRoute |
| `/reports` | ReportsPage | ProtectedRoute |
| `/staff` | StaffPage | ProtectedRoute |
| `/settings` | SettingsPage | ProtectedRoute |
| `/notifications` | NotificationsPage | RoleBasedRoute (admin) |

Protection patterns:
- `<PublicRoute />`: Only unauthenticated users
- `<ProtectedRoute />`: Authenticated users
- `<RoleBasedRoute allowedRoles={['admin', 'system_admin']} />`: Role-restricted

---

## 3. Cache Management

### Query Key Pattern
All React Query keys follow: `['resource', id?, 'nested?']`

### Centralized Keys (`src/hooks/queryKeys.ts`)
```typescript
export const queryKeys = {
  groups: ['groups'],
  group: (id: number) => ['groups', id],
  groupHistory: (id: number) => ['groups', id, 'history'],
  students: ['students'],
  student: (id: number) => ['students', id],
  courses: ['courses'],
  competitions: ['competitions'],
  teams: ['teams'],
  receipts: ['finance', 'receipts'],
  dashboard: ['dashboard'],
  // ...
}
```

### Domain-Specific Keys
| Domain | Location | Keys |
|--------|----------|------|
| Groups | `hooks/useGroupQueries.ts` | `groupKeys.flat`, `groupKeys.grouped(field)` |
| Dashboard | `hooks/dashboard/useDashboard.ts` | `dashboardKeys.overview(date)`, `dashboardKeys.schedule(date)` |
| Directory | `hooks/useDirectory.ts` | `directoryKeys.students.all`, `directoryKeys.parents.all` |
| Notifications | `hooks/notifications/*.ts` | `notificationKeys.templates`, `notificationKeys.logs` |
| Teams | `hooks/teams/*.ts` | `queryKeys.team(id)`, `queryKeys.teamMembers(id)` |

### staleTime by Data Volatility
| Data Type | staleTime | Example |
|----------|-----------|---------|
| Real-time | 0 min | Bulk messaging job status |
| Frequently changing | 1 min | Attendance |
| Dynamic | 2-3 min | Directory, waiting list, teams |
| Normal | 5 min | Dashboard, courses, students |
| Static | 10 min | Groups (flat), templates |

### Query Client Config (`src/lib/queryClient.ts`)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min default
      gcTime: 30 * 60 * 1000,    // 30 min garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,  // Never auto-retry
    },
  },
})
```

### Cache Invalidation Patterns

**Single-domain (from `src/hooks/useGroupMutations.ts`):**
```typescript
await queryClient.invalidateQueries({ queryKey: queryKeys.groups })
await queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) })
```

**Cross-domain example (from `src/hooks/useGroupQueries.ts`):**
```typescript
// After creating group
qc.invalidateQueries({ queryKey: groupKeys.all })

// ALSO invalidate dashboard for upcoming dates
const upcomingDates = getUpcomingDates(7)
upcomingDates.forEach(date => {
  qc.invalidateQueries({ queryKey: dashboardKeys.overview(date) })
})
```

**Parent-child invalidation (from `src/hooks/useStudentActivity.ts`):**
```typescript
// Update activity → invalidate related caches
queryClient.invalidateQueries({ queryKey: queryKeys.student(studentId) })
queryClient.invalidateQueries({ queryKey: queryKeys.studentDetails(studentId) })
queryClient.invalidateQueries({ queryKey: queryKeys.studentBalance(studentId) })
```

---

## 4. Component Patterns

### Naming Conventions
| Suffix | Example | Location |
|--------|---------|----------|
| Page | `GroupsPage.tsx` | `pages/` |
| Tab | `AttendanceTab.tsx` | `components/groups/` |
| Modal | `CreateAccountModal.tsx` | `components/staff/` |
| Dialog | `ProgressLevelDialog.tsx` | `components/groups/detail/` |
| Form | `GroupForm.tsx` | `components/groups/` |
| List | `StudentList.tsx` | `components/crm/` |
| Table | `GroupsTable.tsx` | `components/groups/` |
| Card | `GroupSessionCard.tsx` | `components/dashboard/` |
| Panel | `CreateReceiptPanel.tsx` | `components/finance/` |
| Badge | `GroupStatusBadge.tsx` | `components/groups/shared/` |
| Header | `GroupsHeader.tsx` | `components/groups/` |

### Folder Organization
```
src/components/
├── common/          # Reusable: Modal, DataTable, Pagination, Toast
├── layout/         # AppLayout, Sidebar
├── dashboard/       # TopNavbar, DashboardHeader, GroupSessionCard
├── groups/          # GroupForm, GroupsTable, AttendanceTab, LevelsTab
│   ├── detail/     # GroupInfoCard, LevelSelector, ProgressLevelDialog
│   ├── shared/     # GroupStatusBadge, LevelBadge
│   └── history/    # EnrollmentHistoryTable, CoursesHistoryTable
├── student/         # OverviewTab, PaymentsTab, EnrollmentsTab
├── crm/             # StudentForm, StudentList, ParentForm, WaitingListPanel
├── finance/        # CreateReceiptPanel, UnpaidEnrollmentsPanel
├── courses/         # CourseForm, CourseInfoCard
├── competitions/    # CompetitionForm, CategoryList, TeamRegistrationModal
├── staff/          # EmployeeForm, CreateAccountModal, AttendanceLog
├── reports/        # RevenueChart, EnrollmentTrendsChart
│   ├── atoms/      # MetricCard
│   ├── molecules/  # TabNavigation, InstructorDataTable
│   └── organisms/ # OverviewTab, RevenueTab, EnrollmentTab
├── settings/       # ProfileTab, UsersTab, SecurityTab
├── notifications/ # templates/, tabs/
└── directory/     # AlphabetSlider, AdvancedSearchPanel
```

### Component → Page → Hook → API Flow
```
Page (GroupsPage.tsx)
  ├── useGroups() hook
  │     └── useGroupsFlat() / useGroupsGrouped()
  │           └── getEnrichedGroups() / getGroupsGrouped()
  │                 └── API client → /api/v1/academics/groups
  ├── GroupForm component
  │     └── useCreateGroup() mutation
  │           └── createGroup() API → POST /academics/groups
  │                 └── onSuccess → qc.invalidateQueries()
  └── GroupsTable component
        └── Renders columns from groupColumns
```

---

## 5. API Organization

### Domain Folders (`src/api/`)
| Domain | Path | Key Modules |
|--------|------|-------------|
| Auth | `api/auth/` | JWT token management |
| Academics | `api/academics/` | groups/, courses/, sessions/ |
| CRM | `api/crm/` | students/, parents/ |
| Finance | `api/finance/` | receipts, refunds, reporting |
| Dashboard | `api/dashboard/` | daily overview |
| HR | `api/hr/` | employees, attendance |
| Analytics | `api/analytics/` | academic, financial |
| Notifications | `api/notifications/` | templates, logs, bulk |

### Axios Client (`src/api/client.ts`)
```typescript
const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})
```

**Request interceptor**: Injects JWT from `authStore`
**Response interceptor**: Handles 401 → token refresh → retry queue

### Debug Mode
```typescript
// Enable API debugging
localStorage.setItem('api_debug', 'true')
// Logs all requests/responses to console
```

---

## 6. Data Flow

### Standard Query Flow
```
Page Component
  ↓ calls
useHook()         (e.g., useGroups, useDashboard)
  ↓ calls
API function     (e.g., getEnrichedGroups, getDashboardOverview)
  ↓ calls
axios client     (src/api/client.ts)
  ↓ HTTP request
Server          (/api/v1/academics/groups, etc.)
  ↓ response
React Query     (caches with queryKey)
  ↓ returns data
Page renders   (displays via components)
```

### Mutation Flow
```
User action → Component
  ↓ calls
useMutation()    (e.g., useCreateGroup)
  ↓ calls
API function    (e.g., createGroup)
  ↓ POST/PATCH/DELETE
Server
  ↓ onSuccess
qc.invalidateQueries({ queryKey: [...] })
  ↓ triggers refetch
Related queries refresh
  ↓ UI updates
Page re-renders with fresh data
```

---

## 7. Testing

### Configuration
- Framework: Vitest
- Environment: `happy-dom` (not jsdom)
- Setup file: `src/test/setup.ts`

### Test Locations
- Tests: `src/tests/` or alongside components
- Pattern: `*.test.tsx` or `*.test.ts`

### Running Tests
```bash
npm run test        # Run all tests
npm run test -- --watch  # Watch mode
```

---

## 8. Quick Reference

| Page | Primary Hooks | Key API Endpoints |
|------|--------------|------------------|
| DashboardPage | useDashboard | GET /dashboard/overview |
| GroupsPage | useGroups, useGroupQueries | GET /groups/enriched, GET /groups/grouped |
| GroupDetailPage | useGroupDetail, useGroupAttendance | GET /groups/{id}, GET /groups/{id}/levels |
| StudentDetailPage | useStudentCore, useStudentActivity | GET /students/{id}, GET /students/{id}/activity |
| DirectoryPage | useDirectory | GET /crm/students, GET /crm/parents |
| FinancePage | useReceipts, useRefunds | GET /finance/receipts, GET /finance/refunds |
| CoursesPage | useCourses | GET /academics/courses |
| CompetitionsPage | useCompetitions | GET /competitions |
| TeamDetailPage | useTeam, useTeamMembers | GET /teams/{id}, GET /teams/{id}/members |
| EnrollmentsPage | useEnrollments | GET /enrollments |
| ReportsPage | useReportsSummary | GET /analytics/reports |
| StaffPage | useEmployees | GET /hr/employees |
| SettingsPage | useSettings | GET /settings |
| NotificationsPage | useNotificationLogs | GET /notifications/logs |
| LoginPage | useLogin | POST /auth/login |
| ParentDetailPage | useParentStudents | GET /crm/parents/{id}/students |

---

## 9. References

- Full architecture: `docs/ARCHITECTURE.md`
- API documentation: `docs/api/` (domain-specific MD files)
- Component docs: Inline TypeScript interfaces

### Key Source Files
| File | Purpose |
|------|---------|
| `src/App.tsx` | Routing configuration |
| `src/api/client.ts` | Axios with JWT refresh |
| `src/lib/queryClient.ts` | React Query config |
| `src/hooks/queryKeys.ts` | Global cache keys |
| `src/store/authStore.ts` | Auth state (Zustand) |