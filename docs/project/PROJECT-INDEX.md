# TechnoTerminal CRM Project Index & Navigation Map

**Project**: TechnoTerminal CRM - Robotics Center Management Platform
**Version**: 1.0
**Date**: April 2, 2026  
**Framework**: Tailwind CSS + HTML5 + Vanilla JavaScript
**Design System**: Precision Engine

---

## Project Structure

```
build/
├── index.html                    ← Main Hub / Entry Point
├── dashboard.html                ← Operations Dashboard
├── groups.html                   ← Group/Class Management  
├── directory.html                ← Student/Parent Directory
├── enrollments.html              ← Enrollment Operations
├── finance.html                  ← Finance & Receipts
├── reports.html                  ← Analytics & Reports
├── staff.html                    ← Staff Management
├── attendance.html               ← Attendance Tracking
├── competitions.html             ← Competitions/Events
├── students.html                 ← Student Profiles
├── shared/                       ← Shared Components
│   ├── nav.html                  (Navigation Template)
│   └── styles.css                (Global Styles)
└── docs/                         ← Documentation
    ├── index.md                  ← Getting Started
    ├── design-system.html        ← Design Specifications
    └── api-reference.html        ← API Documentation
```

---

## Navigation Map

### Main Hub (index.html)
**Purpose**: Central entry point with comprehensive module overview
**Links To**:
- [Dashboard](dashboard.html)
- [Groups](groups.html)
- [Directory](directory.html)
- [Enrollments](enrollments.html)
- [Finance](finance.html)
- [Reports](reports.html)
- [Staff](staff.html)
- [Attendance](attendance.html)
- [Competitions](competitions.html)
- [Students](students.html)
- [Design System](docs/design-system.html)
- [API Reference](docs/api-reference.html)

---

## Core Modules

### 1. Dashboard (dashboard.html)
**Module Type**: Operations Hub
**Icon**: dashboard
**Description**: Real-time operations overview, attendance tracking, daily scheduling
**Contains**:
- System Overview Header
- Day Selector
- Groups Stack with Attendance Grids
- Interactive Session Tracking
- Enrollment Actions

**Navigation Links**:
- [Home](index.html)
- [Groups](groups.html)
- [Directory](directory.html)
- [Enrollments](enrollments.html)
- [Finance](finance.html)
- [Reports](reports.html)

---

### 2. Groups (groups.html)
**Module Type**: Class/Group Management
**Icon**: group
**Description**: Manage classes, sessions, schedules, and group-level settings
**Contains**:
- Group Detail Header (Robotics A Example)
- Attendance Grid per Group
- Session Management
- Module Progress Tracking
- Student Roster with Billing Status

**Navigation Links**:
- [Home](index.html)
- [Dashboard](dashboard.html)
- [Directory](directory.html)
- [Enrollments](enrollments.html)
- [Finance](finance.html)
- [Reports](reports.html)

---

### 3. Directory (directory.html)
**Module Type**: Lookup & Registration
**Icon**: person_search
**Description**: Comprehensive students and parents lookup, registration, and profiles
**Contains**:
- Family Directory Search
- Student Listings
- Registration Status
- Contact Information
- Quick Stats

**Navigation Links**:
- [Home](index.html)
- [Dashboard](dashboard.html)
- [Groups](groups.html)
- [Enrollments](enrollments.html)
- [Finance](finance.html)
- [Reports](reports.html)

---

### 4. Enrollments (enrollments.html)
**Module Type**: Student-Group Mapping
**Icon**: assignment_ind
**Description**: Student-group mapping, enrollment status, and management
**Contains**:
- Enrollment Operations Panel
- Pending Transfers Queue
- Enrollment Ledger
- Status Tracking
- Bulk Actions

**Navigation Links**:
- [Home](index.html)
- [Dashboard](dashboard.html)
- [Groups](groups.html)
- [Directory](directory.html)
- [Finance](finance.html)
- [Reports](reports.html)

---

### 5. Finance (finance.html)
**Module Type**: Payment Management
**Icon**: payments
**Description**: Receipts, payments, and financial transaction management
**Contains**:
- Receipt Creation Interface
- Payment Processing
- Transaction History
- Wallet Balance
- Financial Reports

**Navigation Links**:
- [Home](index.html)
- [Dashboard](dashboard.html)
- [Groups](groups.html)
- [Directory](directory.html)
- [Enrollments](enrollments.html)
- [Reports](reports.html)

---

### 6. Reports (reports.html)
**Module Type**: Analytics & Insights
**Icon**: assessment
**Description**: Analytics, insights, and comprehensive reporting dashboard
**Contains**:
- Financial Metrics Dashboard
- Revenue Analytics
- Enrollment Statistics
- Attendance Reports
- User Demographics

**Navigation Links**:
- [Home](index.html)
- [Dashboard](dashboard.html)
- [Groups](groups.html)
- [Directory](directory.html)
- [Enrollments](enrollments.html)
- [Finance](finance.html)

---

## Extended Modules

### 7. Staff (staff.html)
**Module Type**: Personnel Management
**Icon**: people
**Description**: Personnel administration, HR data, and staff profiles
**Contains**:
- Staff Directory
- Attendance Check-in
- Role Management
- Employment Status
- Staff Statistics

---

### 8. Attendance (attendance.html)
**Module Type**: Tracking
**Icon**: check_circle
**Description**: Detailed staff and student attendance tracking and records
**Contains**:
- Real-time Attendance Grid
- Check-in/Check-out Interface
- Attendance History
- Late/Absence Tracking
- Shift Duration Tracking

---

### 9. Competitions (competitions.html)
**Module Type**: Event Management
**Icon**: emoji_events
**Description**: Event management, competition tracking, and results
**Contains**:
- Active Competition Cards
- Team Registration
- Results Tracking
- Event Calendar
- Participation Records

---

### 10. Students (students.html)
**Module Type**: Student Profiles
**Icon**: school
**Description**: Individual student profiles, progress, and performance data
**Contains**:
- Student Profile Header
- Enrollment Status
- Skills Matrix
- Balance Due
- Curriculum Progress

---

## Documentation

### Design System (docs/design-system.html)
**Purpose**: Design specifications and component library
**Contains**:
- Precision Engine Overview
- Color Palette Specifications
- Typography Guidelines
- Elevation & Depth Rules
- Component Specifications

---

### API Reference (docs/api-reference.html)
**Purpose**: Technical integration guide and API documentation
**Contains**:
- Base URL Information
- Authentication Details
- Core Endpoints
- Role-Based Access Control
- Response Formats

---

## Navigation Hierarchy

Each page includes a **sidebar navigation bar** with:
- **Logo/Branding** - Links to home
- **Main Nav** - Primary modules (Dashboard, Groups, Directory, Enrollments, Finance, Reports)
- **Secondary Nav** - Extended modules & settings
- **Bottom Nav** - Home, Documentation links

**Active State**: The current page is highlighted with:
- `bg-secondary/5` background color
- `text-secondary` text color  
- `border-r-2 border-secondary` right border

---

## Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #000000 | Text, Headlines |
| Secondary | #006a61 | Active states, CTAs, Highlights |
| Background | #f8f9ff | Page background |
| Surface | #f8f9ff | Card backgrounds |
| Error | #ba1a1a | Error states, Warnings |
| Surface Dim | #cbdbf5 | Subtle dividers |
| On-Surface | #0b1c30 | Primary text |

---

## Key Navigation Patterns

### Pattern 1: Main Hub Entry
User enters through **index.html** and selects desired module

### Pattern 2: Module Navigation
Within any module, user can navigate to any other module via sidebar

### Pattern 3: Documentation Access
User can reach docs from hub or via sidebar "Settings" menu

### Pattern 4: Breadcrumb Navigation
Header shows current page location in hierarchy

---

## File Naming Convention

- **Main Pages**: `{module-name}.html` (all lowercase)
- **Documentation**: `docs/{topic}.html`
- **Components**: `shared/{component}.html`
- **Shared Utilities**: `shared/{utility}.{ext}`

---

## Testing Navigation

To verify all links are working:

1. **From Hub**:  
   - Click each module card  
   - Verify landing on correct page  
   - Verify sidebar highlights correct module

2. **From Module Pages**:
   - Click each sidebar link  
   - Verify navigation to correct page  
   - Verify new page is highlighted in sidebar

3. **Documentation**:
   - From hub, click Design System → Should load docs/design-system.html
   - From hub, click API Reference → Should load docs/api-reference.html

---

## Deployment Instructions

1. Copy all files from `/build/` to web server root
2. Ensure all `.html` files are in root directory
3. Ensure `/docs/` subdirectory exists with documentation
4. No build process required - static files only
5. All styling is inline Tailwind CSS

---

## Future Enhancements

- [ ] Add shared navigation component as include
- [ ] Implement user authentication
- [ ] Add backend API integration
- [ ] Create responsive mobile layouts
- [ ] Add advanced search functionality
- [ ] Implement dashboard interactivity
- [ ] Add real data connectivity
- [ ] Create admin settings page

---

**Last Updated**: April 2, 2026  
**Project Manager**: GitHub Copilot  
**Status**: ✅ Core navigation structure complete and wired
