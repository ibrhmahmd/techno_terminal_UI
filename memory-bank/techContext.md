# Technical Context - TechnoTerminal CRM

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | 6.x | Build tool & dev server |
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4.x | Styling and layout |
| React Router | 6.x | Client-side routing |
| Zustand | 4.x | State management |
| Axios | 1.x | HTTP client |
| Material Symbols | - | Iconography |

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
app/frontend/
├── src/
│   ├── api/                 # API clients per domain
│   │   ├── client.ts       # Axios instance with JWT
│   │   ├── auth.ts         # Authentication API
│   │   ├── academics.ts    # Groups, sessions, schedule
│   │   ├── attendance.ts   # Attendance marking
│   │   ├── crm.ts          # Students, parents
│   │   ├── enrollments.ts  # Enrollment management
│   │   ├── finance.ts      # Receipts, payments
│   │   └── analytics.ts    # Reports & dashboards
│   ├── components/         # React components
│   │   ├── layout/        # AppLayout, Sidebar
│   │   ├── dashboard/     # DaySelectorBar, GroupSessionCard
│   │   ├── groups/        # GroupHeader, TabNavigation
│   │   ├── crm/           # StudentList, ParentList
│   │   ├── enrollments/   # EnrollPanel, TransferPanel, DropPanel
│   │   ├── finance/       # CreateReceiptPanel, SearchReceiptsPanel
│   │   ├── attendance/    # AttendanceGrid, EditSessionPopup
│   │   └── common/        # LoadingSpinner, Modal, SearchBar, DataTable
│   ├── pages/             # Route pages
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GroupsPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   ├── DirectoryPage.tsx
│   │   ├── StudentDetailPage.tsx
│   │   ├── ParentDetailPage.tsx
│   │   ├── EnrollmentsPage.tsx
│   │   ├── FinancePage.tsx
│   │   └── ReportsPage.tsx
│   ├── store/             # Zustand stores
│   │   └── authStore.ts   # JWT + user state
│   ├── App.tsx            # Router + routes
│   ├── main.tsx           # React entry
│   └── index.css          # Tailwind imports
├── index.html             # HTML entry
├── vite.config.ts         # Vite config + proxy
├── tailwind.config.js    # Tailwind theme
└── package.json           # Dependencies

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

## API Considerations (Future)

## API Endpoints Implemented

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

### Recommended Backend Stack
- **Node.js + Express** (JavaScript ecosystem)
- **PostgreSQL** (relational data)
- **Prisma** (ORM)
- **JWT** (authentication)
