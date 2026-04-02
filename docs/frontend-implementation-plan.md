# Frontend Implementation Plan

**Project:** Techno Terminal CRM React Frontend  
**Source:** Migration from existing HTML prototype (`app/` directory)  
**Target:** React + TypeScript + Vite application (`app/frontend/`)

---

## Executive Summary

This document maps all existing HTML pages to the new React frontend structure, organized by implementation phases. Each phase is independently deployable and builds upon the previous.

**Source Documents:**
- `docs/FRONTEND_PLAN.md` - Technical stack and build order
- `docs/frontend_handover.md` - Product specification and API mapping
- `app/*.html` - Existing HTML prototypes
- `app/shared/styles.css` - Shared CSS variables and components

---

## Phase 0: Scaffold + Foundation (1.5h)

**Goal:** Project setup, API client, auth store, layout shell

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `vite.config.ts` | `app/frontend/` | Vite configuration with API proxy | Entry config |
| `tsconfig.json` | `app/frontend/` | TypeScript configuration | Entry config |
| `index.html` | `app/frontend/` | HTML entry point | Entry point |
| `src/index.css` | `app/frontend/src/` | Global CSS variables + design tokens | Imported by `main.tsx` |
| `src/main.tsx` | `app/frontend/src/` | React app bootstrap | Entry point |
| `src/App.tsx` | `app/frontend/src/` | Router + protected routes | Uses `ProtectedRoute`, renders `AppLayout` |
| `src/api/client.ts` | `app/frontend/src/api/` | Axios instance with JWT interceptor | Used by all API modules |
| `src/store/authStore.ts` | `app/frontend/src/store/` | Zustand auth store (JWT + user) | Used by `client.ts`, `ProtectedRoute`, `LoginPage` |
| `src/components/layout/AppLayout.tsx` | `app/frontend/src/components/layout/` | Layout wrapper with sidebar | Renders `Sidebar`, wraps page content |
| `src/components/layout/Sidebar.tsx` | `app/frontend/src/components/layout/` | Navigation sidebar | Used by `AppLayout` |
| `src/components/common/LoadingSpinner.tsx` | `app/frontend/src/components/common/` | Loading state UI | Used by async components |
| `src/components/common/ErrorMessage.tsx` | `app/frontend/src/components/common/` | Error display UI | Used by async components |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/shared/styles.css:1-100` | `src/index.css` | CSS variables (--color-bg, --color-surface, etc.) |
| `app/groups.html:60-165` | `Sidebar.tsx` | Cleanest sidebar structure (dark theme, nav items) |
| `app/groups.html:170-175` | `AppLayout.tsx` | Main content wrapper pattern (`ml-64 flex-1`) |

---

## Phase 1: Login Page (30m)

**Goal:** Authentication entry point

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/LoginPage.tsx` | `app/frontend/src/pages/` | Login form + auth flow | Uses `authStore.login()`, redirects to `/dashboard` |
| `src/api/auth.ts` | `app/frontend/src/api/` | Auth API functions (`login`) | Uses `client.ts`, called by `LoginPage` |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| *None* | `LoginPage.tsx` | New page - no HTML equivalent exists |
| Design system | `LoginPage.tsx` | Dark centered card using CSS variables |

---

## Phase 2: Dashboard Page (2h)

**Goal:** Daily operations "war room" - most important page

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/DashboardPage.tsx` | `app/frontend/src/pages/` | Main dashboard view | Renders `DaySelectorBar`, `GroupSessionCard` list |
| `src/components/dashboard/DaySelectorBar.tsx` | `app/frontend/src/components/dashboard/` | Day filter pills (Mon-Sun) | Used by `DashboardPage` |
| `src/components/dashboard/GroupSessionCard.tsx` | `app/frontend/src/components/dashboard/` | Group card with attendance | Uses `AttendanceGrid`, used by `DashboardPage` |
| `src/api/academics.ts` | `app/frontend/src/api/` | Academic API functions | `getDailySchedule()`, `getGroupSessions()` |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/dashboard.html:178-220` | `DashboardPage.tsx` | Header with day selector |
| `app/dashboard.html:228-390` | `GroupSessionCard.tsx` | Group section cards pattern |
| `app/dashboard.html` structure | `DaySelectorBar.tsx` | 7-day pill buttons |

---

## Phase 3: Group Management + Attendance Grid (2.5h)

**Goal:** Group list, detail view, and the critical Attendance Grid component

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/GroupsPage.tsx` | `app/frontend/src/pages/` | Groups list view | Table with search, links to `GroupDetailPage` |
| `src/pages/GroupDetailPage.tsx` | `app/frontend/src/pages/` | Single group detail | Roster + `AttendanceGrid`, edit modals |
| `src/components/attendance/AttendanceGrid.tsx` | `app/frontend/src/components/attendance/` | **Critical** - attendance table | Uses local state, batch save, used by Dashboard + Group Detail |
| `src/components/attendance/EditSessionPopup.tsx` | `app/frontend/src/components/attendance/` | Session edit modal | Triggered from `AttendanceGrid` headers |
| `src/components/attendance/SessionHeader.tsx` | `app/frontend/src/components/attendance/` | Grid column header | Part of `AttendanceGrid` |
| `src/components/common/Modal.tsx` | `app/frontend/src/components/common/` | Reusable modal shell | Used by `EditSessionPopup`, forms |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/groups.html:170-220` | `GroupsPage.tsx` | Groups list table |
| `app/groups.html:228-390` | `GroupDetailPage.tsx` | Group detail + roster |
| Attendance table structure | `AttendanceGrid.tsx` | Grid with student rows, session columns |
| Session edit popup | `EditSessionPopup.tsx` | Date picker, instructor dropdown |

---

## Phase 4: Directory (Students + Parents) (2h)

**Goal:** CRM directory with search-first design

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/DirectoryPage.tsx` | `app/frontend/src/pages/` | Directory with tabs (Parents/Students) | Renders tabs, search, tables |
| `src/pages/StudentDetailPage.tsx` | `app/frontend/src/pages/` | Student profile view | Enrollments, parents, balance, competition history |
| `src/pages/ParentDetailPage.tsx` | `app/frontend/src/pages/` | Parent profile view | Linked students table |
| `src/components/common/SearchBar.tsx` | `app/frontend/src/components/common/` | Type-ahead search input | Used by Directory, Enrollments, Finance |
| `src/components/common/DataTable.tsx` | `app/frontend/src/components/common/` | Reusable data table | Used across all list views |
| `src/api/crm.ts` | `app/frontend/src/api/` | CRM API functions | `searchStudents()`, `searchParents()`, `getStudent()`, `getParent()` |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/directory.html:160-250` | `DirectoryPage.tsx` | Directory tabs + search + tables |
| `app/students.html:152-280` | `StudentDetailPage.tsx` | Student profile layout |
| `app/students.html:280-400` | `StudentDetailPage.tsx` | Enrollments section |
| Table styling | `DataTable.tsx` | Consistent table pattern |

---

## Phase 5: Enrollments (1h)

**Goal:** Enroll, transfer, drop workflows

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/EnrollmentsPage.tsx` | `app/frontend/src/pages/` | Three-panel page | Renders `EnrollPanel`, `TransferPanel`, `DropPanel` |
| `src/components/enrollments/EnrollPanel.tsx` | `app/frontend/src/components/enrollments/` | New enrollment form | Student search, group search |
| `src/components/enrollments/TransferPanel.tsx` | `app/frontend/src/components/enrollments/` | Transfer workflow | Select enrollment → select new group |
| `src/components/enrollments/DropPanel.tsx` | `app/frontend/src/components/enrollments/` | Drop confirmation | Confirm dialog |
| `src/api/enrollments.ts` | `app/frontend/src/api/` | Enrollment API | `createEnrollment()`, `transferEnrollment()`, `dropEnrollment()` |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/enrollments.html:153-200` | `EnrollPanel.tsx` | Enroll form fields |
| `app/enrollments.html:200-240` | `TransferPanel.tsx` | Transfer selection |
| `app/enrollments.html:240-270` | `DropPanel.tsx` | Drop confirmation |

---

## Phase 6: Finance & Receipts (1.5h)

**Goal:** Payment processing and receipt management

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/FinancePage.tsx` | `app/frontend/src/pages/` | Finance main page | Create receipt + search receipts |
| `src/components/finance/ReceiptForm.tsx` | `app/frontend/src/components/finance/` | Create receipt form | Dynamic line items, overpayment preview |
| `src/components/finance/ReceiptLineItem.tsx` | `app/frontend/src/components/finance/` | Single line item row | Add/remove from `ReceiptForm` |
| `src/components/finance/ReceiptSearch.tsx` | `app/frontend/src/components/finance/` | Search + filter UI | Date range, payer, student ID |
| `src/components/finance/ReceiptTable.tsx` | `app/frontend/src/components/finance/` | Receipt results table | Links to detail/PDF |
| `src/api/finance.ts` | `app/frontend/src/api/` | Finance API | `createReceipt()`, `searchReceipts()`, `getReceiptPDF()` |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/finance.html:107-160` | `ReceiptForm.tsx` | Receipt creation form |
| `app/finance.html:160-220` | `ReceiptTable.tsx` | Transaction table |
| `app/finance.html` styling | `FinancePage.tsx` | Layout structure |

---

## Phase 7: Reports (Stub) (30m)

**Goal:** Analytics placeholder (partial API)

### Files to Create

| File | Location | Purpose | Relationships |
|------|----------|---------|---------------|
| `src/pages/ReportsPage.tsx` | `app/frontend/src/pages/` | Reports placeholder | Cards with "Coming Soon" |
| `src/api/analytics.ts` | `app/frontend/src/api/` | Analytics API stubs | `getDashboardSummary()` (ready), others TBD |

### Source Migration

| Source File | Target | Notes |
|-------------|--------|-------|
| `app/reports.html:107-140` | `ReportsPage.tsx` | Basic layout structure |

---

## Shared Components Summary

| Component | Created In | Used By |
|-----------|------------|---------|
| `Sidebar` | Phase 0 | All pages (via `AppLayout`) |
| `AppLayout` | Phase 0 | All pages (wraps content) |
| `LoadingSpinner` | Phase 0 | All async components |
| `ErrorMessage` | Phase 0 | All error states |
| `Modal` | Phase 3 | `EditSessionPopup`, forms |
| `SearchBar` | Phase 4 | `DirectoryPage`, `EnrollmentsPage`, `FinancePage` |
| `DataTable` | Phase 4 | `DirectoryPage`, `GroupsPage`, `FinancePage` |

---

## API Module Organization

```
src/api/
├── client.ts      # Axios instance (Phase 0)
├── auth.ts        # POST /auth/login (Phase 1)
├── academics.ts   # Groups, sessions, courses (Phase 2, 3)
├── attendance.ts  # Attendance marking (Phase 3)
├── crm.ts         # Students, parents (Phase 4)
├── enrollments.ts # Enroll, transfer, drop (Phase 5)
├── finance.ts     # Receipts, refunds (Phase 6)
└── analytics.ts   # Reports (Phase 7)
```

---

## Page-to-File Mapping

| HTML Page | React Page File | Phase |
|-----------|-----------------|-------|
| *None* | `LoginPage.tsx` | 1 |
| `dashboard.html` | `DashboardPage.tsx` | 2 |
| `groups.html` | `GroupsPage.tsx` + `GroupDetailPage.tsx` | 3 |
| `directory.html` | `DirectoryPage.tsx` | 4 |
| `students.html` | `StudentDetailPage.tsx` | 4 |
| *Partial in directory* | `ParentDetailPage.tsx` | 4 |
| `enrollments.html` | `EnrollmentsPage.tsx` | 5 |
| `finance.html` | `FinancePage.tsx` | 6 |
| `reports.html` | `ReportsPage.tsx` | 7 |
| `attendance.html` | *Absorbed into Dashboard/GroupDetail* | 2, 3 |
| `staff.html` | *Out of MVP scope* | - |
| `competitions.html` | *Out of MVP scope* | - |

---

## CSS Variable Mapping

| HTML Class/Value | CSS Variable | Usage |
|------------------|--------------|-------|
| `#1a1d27` (sidebar bg) | `--color-surface` | Sidebar, cards |
| `#0f1117` (page bg) | `--color-bg` | Page background |
| `#94a3b8` (muted text) | `--color-text-muted` | Secondary text |
| `#e2e8f0` (primary text) | `--color-text` | Primary text |
| `#6366f1` (indigo accent) | `--color-accent` | Buttons, active states |
| `#22c55e` (green) | `--color-success` | Success states |
| `#ef4444` (red) | `--color-danger` | Errors, deletions |
| `#f59e0b` (amber) | `--color-warning` | Warnings |
| `#2e3245` (borders) | `--color-border` | Dividers, outlines |

---

*Document Version: 1.0*  
*Created: 2026-04-02*  
*Status: Ready for Phase 0 implementation*
