# Technical Context - TechnoTerminal CRM

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | 6.x | Build tool & dev server |
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Styling and layout |
| React Router | 7.x | Client-side routing |
| Zustand | 5.x | State management |
| Axios | 1.x | HTTP client |
| Material Symbols | - | Iconography |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | Python web framework |
| PostgreSQL | Latest | Relational database |
| JWT | - | Authentication tokens |
| Python 3.x | - | Backend runtime |

### Fonts
- **Space Grotesk** (Google Fonts) - Display/Headlines
- **Inter** (Google Fonts) - Body/Labels

### Backend Integration
- **Hosted Backend**: `https://techno-terminal-ibrhmahmd2165-00zb1kxm.leapcell.dev/`
- **Local Backend** (optional): `http://localhost:8000`
- JWT Bearer token authentication
- API proxy via Vite dev server (`/api` → configured backend URL)

## Development Setup

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local server (optional, for testing)

### File Structure
```
src/
├── api/                          # Domain-based API modules
│   ├── client.ts                # Axios instance with JWT interceptor
│   ├── auth.ts                  # Authentication endpoints
│   ├── academics/               # Courses, groups, sessions, schedule (29 files)
│   ├── analytics/               # BI data, metrics (10 files)
│   ├── attendance/              # Attendance tracking (3 files)
│   ├── auth/                    # Authentication (2 files)
│   ├── competitions/            # Competition management (3 files)
│   ├── crm/                     # CRM - modular students, parents
│   │   ├── students/            # Modular student API
│   │   │   ├── index.ts         # Public exports
│   │   │   ├── core.ts          # CRUD operations
│   │   │   ├── finance.ts       # Balance queries
│   │   │   ├── status.ts        # Status management
│   │   │   ├── history.ts       # History records
│   │   │   ├── siblings.ts      # Sibling relationships
│   │   │   ├── search.ts        # Search operations
│   │   │   ├── utils.ts         # Helper functions
│   │   │   └── types/           # Type definitions
│   │   └── parents.ts           # Parent API
│   ├── enrollments/             # Enrollment operations (3 files)
│   ├── finance/                 # Receipts, refunds, balance (10 files)
│   ├── hr/                      # Staff management (5 files)
│   └── reports/                 # Report generation (3 files)
├── components/                  # React components (117+ items)
│   ├── attendance/              # 9 items - grids, editing
│   ├── common/                  # 22 items - LoadingSpinner, Modal, SearchBar, DataTable
│   ├── competitions/            # 4 items - cards, forms, categories
│   ├── courses/                 # 3 items
│   ├── crm/                     # 6 items - StudentList, ParentList, StudentForm
│   ├── dashboard/               # 7 items - DaySelectorBar, GroupSessionCard
│   ├── enrollments/             # 3 items - EnrollPanel, TransferPanel, DropPanel
│   ├── finance/                 # 2 items - CreateReceiptPanel, SearchReceiptsPanel
│   ├── groups/                  # 31 items - GroupHeader, TabNavigation, AttendanceGrid
│   ├── layout/                  # 2 items - AppLayout, Sidebar
│   ├── reports/                 # 19 items - charts, tables, hooks
│   └── student/                 # 7 items - OverviewTab, PaymentsTab, EnrollmentsTab, StudentTabs
├── hooks/                       # Custom React hooks (22 items)
│   ├── competitions/            # 5 items - useCompetitions, useCompetition, etc.
│   ├── finance/                   # 5 items - Finance operation hooks
│   ├── students/                  # 3 items - useStudentDetail, useStudentHistory, index
│   ├── useCourses.ts             # Course management
│   ├── useGroups.ts              # Group listing with pagination
│   ├── useGroupDetail.ts         # Group detail fetching
│   ├── useGroupHistory.ts        # Group history
│   ├── useGroupMutations.ts      # Group CRUD operations
│   ├── useGroupStudents.ts       # Group student management
│   ├── usePagination.ts          # Pagination utilities
│   └── useSearch.ts              # Search functionality
├── pages/                       # Route pages (15 components)
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CoursesPage.tsx           # NEW
│   ├── CourseDetailPage.tsx      # NEW
│   ├── GroupsPage.tsx
│   ├── GroupDetailPage.tsx
│   ├── DirectoryPage.tsx
│   ├── StudentDetailPage.tsx
│   ├── ParentDetailPage.tsx
│   ├── EnrollmentsPage.tsx
│   ├── FinancePage.tsx
│   ├── ReportsPage.tsx
│   ├── CompetitionsPage.tsx
│   ├── CompetitionDetailPage.tsx
│   └── StaffPage.tsx
├── utils/                       # Utility functions
│   ├── colors.ts                 # Color constants
│   ├── competition.ts            # Competition-specific utilities
│   └── formatting.ts             # Date/formatting utilities
├── store/                       # Zustand stores
│   └── authStore.ts             # JWT + user state
├── types/                       # Shared TypeScript types
│   ├── api.ts                   # ApiResponse, PaginatedApiResponse
│   └── pagination.ts            # Pagination types
├── App.tsx                      # Router + routes
├── main.tsx                     # React entry
└── index.css                    # Tailwind imports
```

### Development Server (Vite)
```bash
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` with API proxy to configured backend.

### Build for Production
```bash
npm run build
```

Output goes to `dist/` for deployment.

## Dependencies

```json
{
  "dependencies": {
    "axios": "^1.8.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.4.1",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.2",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.1",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^6.2.5"
  }
}
```

## Build Process

### Development
```bash
cd app/frontend
npm run dev
```

### Production Build
```bash
cd app/frontend
npm run build
```

- Vite bundles React + TypeScript
- Tailwind CSS purged for production
- Output in `dist/` folder
- Ready for static hosting

## Deployment

### Static Hosting Options
1. **Netlify**: Drag-and-drop `/build/` folder
2. **Vercel**: Connect repository
3. **GitHub Pages**: Push `/build/` to `gh-pages` branch
4. **Traditional Hosting**: FTP/SFTP upload
5. **AWS S3**: Static website hosting

### Deployment Checklist
- [ ] All source files in `/src/`
- [ ] Build succeeds (`npm run build`)
- [ ] `dist/` folder generated
- [ ] Navigation links tested
- [ ] API proxy configured (Vite) or environment variables set
- [ ] Fonts loading correctly
- [ ] Icons displaying properly

## Technical Constraints

### Current Limitations
1. **Partial Backend**: Groups, Competitions, Auth, Students, Reports use real API; others use mock data
2. **Desktop Only**: Not optimized for mobile
3. **No Real-time**: No WebSocket updates for live data
4. **Single User Role**: No role-based access control yet

### Browser Requirements
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- ES6+ JavaScript support required

## Performance Considerations

### Current Optimizations
- Vite bundler = fast HMR and optimized builds
- Modular code splitting by domain
- CDN resources = cached assets (fonts, icons)

### Future Optimizations
- Lazy loading for data-heavy modules
- Code splitting if framework added
- Image optimization (when images added)
- Service worker for offline access

## Security (Current)

### Authentication Security
- JWT tokens stored in memory (Zustand)
- HTTPS enforced in production
- Token refresh mechanism ready for implementation
- XSS protection: sanitize user inputs

### Future Security Needs
- HTTPS enforcement
- Authentication system
- API security (CORS, tokens)
- Data validation and sanitization

## API Architecture

### Domain-Based API Client Structure
API clients are organized by domain/feature for maintainability:
- `academics/` - Groups, sessions, progress levels
- `competitions/` - Competitions, categories, teams
- `crm/` - Modular students, parents (following modular pattern)
- `enrollments.ts` - Enrollment operations
- `finance.ts` - Receipts, balance

### TypeScript Patterns for API Integration

#### Handling Multiple Response Formats
```typescript
// Backend uses inconsistent response wrappers
// Pattern 1: { success, data }
// Pattern 2: { data, total, skip, limit } (paginated)
// Pattern 3: { data } (single item)

export async function getCompetitions(): Promise<PaginatedCompetitionsResponse> {
  const response = await client.get<PaginatedCompetitionsResponse>('/competitions')
  return {
    data: response.data.data || [],
    total: response.data.total || 0,
    skip: response.data.skip || 0,
    limit: response.data.limit || 50,
  }
}
```

#### ID Type Conversion Pattern
```typescript
// URL params are strings, backend uses numbers
export function useCompetition(id: number | string) {
  const fetchCompetition = useCallback(async () => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id
    const data = await getCompetition(numericId)
    // ...
  }, [id])
}
```

#### Error Handling Pattern
```typescript
try {
  const data = await apiCall()
  setData(data)
} catch (err) {
  setError(err instanceof Error ? err.message : 'Failed to load data')
  setData([])
} finally {
  setIsLoading(false)
}
```

### API Endpoints Status

### Authentication
- `POST /api/v1/auth/login` - JWT login

### Academics
- `GET /api/v1/academics/sessions/daily-schedule` - Daily schedule
- `GET /api/v1/academics/groups` - List groups
- `GET /api/v1/academics/groups/{id}` - Group details
- `GET /api/v1/academics/groups/{id}/sessions` - Group sessions
- `GET /api/v1/academics/groups/{id}/progress-level` - Progress data

### Attendance
- `GET /api/v1/attendance/session/{id}` - Session attendance
- `POST /api/v1/attendance/session/{id}/mark` - Mark attendance

### CRM
- `GET /api/v1/crm/students` - List/search students (paginated)
- `GET /api/v1/crm/students/{id}` - Student details
- `POST /api/v1/crm/students` - Create student
- `PATCH /api/v1/crm/students/{id}` - Update student
- `GET /api/v1/crm/students/{id}/balance` - Student balance
- `GET /api/v1/crm/students/{id}/siblings` - Student siblings
- `GET /api/v1/crm/students/{id}/status-history` - Status history
- `PATCH /api/v1/crm/students/{id}/status` - Update status
- `GET /api/v1/crm/parents` - List/search parents
- `GET /api/v1/crm/parents/{id}` - Parent details
- `POST /api/v1/crm/parents` - Create parent

### Enrollments
- `GET /api/v1/enrollments/student/{id}` - Student enrollments
- `POST /api/v1/enrollments` - Create enrollment
- `POST /api/v1/enrollments/transfer` - Transfer enrollment
- `DELETE /api/v1/enrollments/{id}` - Drop enrollment

### Finance
- `GET /api/v1/finance/balance/student/{id}` - Student balance
- `GET /api/v1/finance/receipts` - Search receipts
- `POST /api/v1/finance/receipts` - Create receipt
- `POST /api/v1/finance/receipts/preview-risk` - Check overpayment
- `GET /api/v1/finance/receipts/{id}/pdf` - Download PDF

### Analytics
- `GET /api/v1/analytics/dashboard-summary` - Dashboard stats
- `GET /api/v1/analytics/attendance` - Attendance report
- `GET /api/v1/analytics/enrollment-trends` - Enrollment trends

### Competitions (Newly Integrated)
- `GET /api/v1/competitions` - List competitions (paginated)
- `GET /api/v1/competitions/{id}` - Get competition details
- `POST /api/v1/competitions` - Create competition
- `PATCH /api/v1/competitions/{id}` - Update competition
- `DELETE /api/v1/competitions/{id}` - Delete competition
- `GET /api/v1/competitions/{id}/categories` - List categories
- `POST /api/v1/competitions/{id}/categories` - Add category
- `DELETE /api/v1/competitions/{id}/categories/{catId}` - Delete category

### Current Backend Stack
- **FastAPI** (Python) - Active backend implementation
- **PostgreSQL** (relational database)
- **JWT** (authentication via Bearer tokens)
- **SQLAlchemy** (ORM)

### Known API Contract Issues (Resolved)
1. **Competitions Field Names**: Frontend expected `start_date`, `fee_per_participant`, `description` - Backend returns `competition_date`, `fee_per_student`, `notes`
2. **ID Types**: Frontend assumed UUID strings - Backend uses integer IDs
3. **Response Wrappers**: Inconsistent patterns across endpoints - Standardized in client layer

See `apiContracts.md` for detailed field mappings and type definitions.
