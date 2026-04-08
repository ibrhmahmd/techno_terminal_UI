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
- REST API at `http://localhost:8000`
- JWT Bearer token authentication
- API proxy via Vite dev server (`/api` → `http://localhost:8000`)

## Development Setup

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local server (optional, for testing)

### File Structure
```
app/src/
├── api/                    # API clients per domain
│   ├── client.ts          # Axios instance with JWT interceptor
│   ├── auth.ts            # Authentication endpoints
│   ├── academics/         # Groups, sessions, schedule
│   │   ├── index.ts
│   │   ├── groups.ts
│   │   ├── lifecycle.ts   # Group levels API
│   │   └── types.ts
│   ├── competitions/      # Competitions API
│   │   ├── index.ts
│   │   ├── competitions.ts
│   │   └── types.ts
│   ├── crm.ts             # Students, parents
│   ├── enrollments.ts     # Enrollment management
│   ├── finance.ts         # Receipts, payments
│   ├── attendance.ts      # Attendance marking
│   └── analytics.ts       # Reports & dashboards
├── components/            # React components
│   ├── common/           # Shared: LoadingSpinner, Modal, SearchBar
│   ├── layout/           # AppLayout, Sidebar, TopNavbar
│   ├── dashboard/        # DaySelectorBar, GroupSessionCard
│   ├── groups/           # GroupHeader, TabNavigation, AttendanceGrid
│   ├── crm/              # StudentList, ParentList
│   ├── competitions/     # CompetitionCard, CompetitionForm, CategoryList
│   ├── enrollments/      # EnrollPanel, TransferPanel, DropPanel
│   ├── finance/          # CreateReceiptPanel, SearchReceiptsPanel
│   └── attendance/       # AttendanceGrid, EditSessionPopup
├── hooks/                # Custom React hooks
│   ├── competitions/   # Competition data fetching hooks
│   │   ├── useCompetitions.ts
│   │   ├── useCompetition.ts
│   │   ├── useCompetitionCategories.ts
│   │   ├── useCompetitionTeams.ts
│   │   └── index.ts
│   ├── useGroups.ts
│   ├── useGroupDetail.ts
│   └── ...
├── pages/                # Route pages
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── GroupsPage.tsx
│   ├── GroupDetailPage.tsx
│   ├── DirectoryPage.tsx
│   ├── StudentDetailPage.tsx
│   ├── ParentDetailPage.tsx
│   ├── EnrollmentsPage.tsx
│   ├── FinancePage.tsx
│   ├── ReportsPage.tsx
│   ├── CompetitionsPage.tsx
│   └── CompetitionDetailPage.tsx
├── utils/               # Utility functions
│   ├── formatting.ts   # Date/formatting utilities
│   ├── colors.ts       # Color constants
│   └── competition.ts  # Competition-specific utilities
├── store/              # Zustand stores
│   └── authStore.ts   # JWT + user state
├── App.tsx            # Router + routes
├── main.tsx           # React entry
└── index.css          # Tailwind imports
```

### Development Server (Vite)
```bash
cd app/frontend
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` with API proxy to `http://localhost:8000`.

### Build for Production
```bash
cd app/frontend
npm run build
```

Output goes to `app/frontend/dist/` for deployment.

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
- [ ] All 13 HTML files in place
- [ ] `/docs/` subdirectory exists
- [ ] `/shared/` subdirectory exists
- [ ] Navigation links tested
- [ ] Fonts loading correctly
- [ ] Icons displaying properly

## Technical Constraints

### Current Limitations
1. **No Persistence**: Data resets on page reload
2. **No Authentication**: All data visible to everyone
3. **No Backend**: Cannot process payments or send notifications
4. **Desktop Only**: Not optimized for mobile
5. **Single User**: No multi-user support

### Browser Requirements
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- ES6+ JavaScript support required

## Performance Considerations

### Current Optimizations
- Static files = fast load times
- CDN resources = cached assets
- No JavaScript frameworks = minimal overhead

### Future Optimizations
- Lazy loading for data-heavy modules
- Code splitting if framework added
- Image optimization (when images added)
- Service worker for offline access

## Security (Current)

### Static Site Security
- No server-side vulnerabilities
- No database to protect
- No authentication to bypass
- XSS protection: sanitize any user input (when added)

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
- `crm.ts` - Students, parents
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
- `GET /api/v1/crm/students` - List/search students
- `GET /api/v1/crm/students/{id}` - Student details
- `POST /api/v1/crm/students` - Create student
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
