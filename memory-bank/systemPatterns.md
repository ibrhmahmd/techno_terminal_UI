# System Patterns - TechnoTerminal CRM

## Architecture Overview

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Hub Layer                            │
│                    index.html (Entry)                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌────────▼────────┐   ┌────────▼────────┐
│  Core Modules  │   │ Extended Modules│   │ Documentation │
├────────────────┤   ├─────────────────┤   ├─────────────────┤
│ dashboard.html │   │   staff.html    │   │ design-system   │
│  groups.html   │   │ attendance.html │   │  api-reference  │
│ directory.html │   │ competitions    │   └─────────────────┘
│enrollments.html│   │  students.html  │
│ finance.html   │   └─────────────────┘
│  reports.html  │
└────────────────┘
```

## Design Patterns

### 1. Precision Engine Design System
**Pattern**: High-density, tonal-layered interface

**Key Elements**:
- **Background Shifts**: Surface colors create hierarchy without borders
- **Stacking Order**: `surface` → `surface_container_low` → `surface_container_lowest`
- **Active States**: Teal (#006a61) background with right border indicator

**Implementation**:
```html
<!-- Sidebar Active State -->
<a class="bg-secondary/5 text-secondary border-r-2 border-secondary">
```

### 2. Navigation Architecture
**Pattern**: Hub-and-Spoke with Full Cross-Module Access

**Rules**:
- Every page links to every other module via sidebar
- Hub (`index.html`) provides visual module overview
- Active state visually indicates current location
- Home link always accessible

**Coverage Matrix**:
- 13 total pages
- 6 primary navigation links per page
- 100% accessibility from any module

### 3. Component Patterns

#### Sidebar Navigation (Standardized)
**Implementation**: All module pages use consistent sidebar structure

```html
<aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-outline-variant/15 z-50 flex flex-col overflow-hidden">
  <!-- Brand Header -->
  <div class="p-6 border-b border-outline-variant/15">
    <a href="index.html">
      <h1 class="text-xl font-bold font-headline text-primary">TechnoTerminal</h1>
      <p class="text-[10px] text-secondary uppercase tracking-[0.15em]">Control Center</p>
    </a>
  </div>
  
  <!-- Navigation Sections -->
  <nav class="flex-1 overflow-y-auto py-4">
    <div class="px-3 space-y-1">
      <!-- Core Operations -->
      <p class="px-3 py-2 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Core Operations</p>
      <a href="dashboard.html" class="nav-item...">Dashboard</a>
      <a href="groups.html" class="nav-item...">Groups</a>
      <a href="directory.html" class="nav-item...">Directory</a>
      <a href="students.html" class="nav-item...">Students</a>
      
      <!-- Management -->
      <p class="px-3 py-2 mt-6 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Management</p>
      <a href="enrollments.html" class="nav-item...">Enrollments</a>
      <a href="finance.html" class="nav-item...">Finance</a>
      <a href="attendance.html" class="nav-item...">Attendance</a>
      
      <!-- Programs -->
      <p class="px-3 py-2 mt-6 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Programs</p>
      <a href="competitions.html" class="nav-item...">Competitions</a>
      <a href="reports.html" class="nav-item...">Reports</a>
      
      <!-- Resources -->
      <p class="px-3 py-2 mt-6 text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Resources</p>
      <a href="staff.html" class="nav-item...">Staff</a>
    </div>
  </nav>
  
  <!-- Footer -->
  <div class="p-4 border-t border-outline-variant/15">
    <a href="index.html" class="flex items-center gap-2 text-xs text-on-surface-variant hover:text-secondary">
      <span class="material-symbols-outlined text-base">home</span>
      <span>Back to Hub</span>
    </a>
  </div>
</aside>
```

**Navigation Item States:**
- **Default**: `bg-transparent text-on-surface-variant border-r-2 border-transparent hover:bg-surface-container-low hover:text-secondary`
- **Active**: `bg-secondary/10 text-secondary border-r-2 border-secondary`

**Specifications:**
- Fixed 256px width (`w-64`), full viewport height (`h-screen`)
- White background (`bg-white`) with right border
- Z-index 50 for overlay priority
- 4 categorized sections with uppercase headers
- Material Symbols Outlined icons
- "Back to Hub" footer link

#### Module Cards (Hub)
- 3-column responsive grid
- Icon + title + description
- Click navigates to module
- Hover state with subtle lift

#### Data Tables
- No horizontal borders ("No-Line" rule)
- Header on `surface_container_low`
- Alternating row backgrounds
- High-density with `spacing-3` padding

### 4. Color Architecture

**Semantic Color Usage**:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | #000000 | Text, headlines |
| Secondary | #006a61 | Active states, CTAs |
| Background | #f8f9ff | Page background |
| Surface | #ffffff | Card backgrounds |
| Error | #ba1a1a | Error states |

**Background Stack**:
1. Page: `surface` (#f8f9ff)
2. Section: `surface_container_low` (#eff4ff)
3. Card: `surface_container_lowest` (#ffffff)

### 5. Typography Hierarchy

**Font Pairing**:
- **Display**: Space Grotesk (futuristic, wide apertures)
- **Body**: Inter (utility, high legibility)

**Scale System**:
```
display-lg:    3.5rem   (hero metrics)
headline-sm:   1.5rem   (section titles)
title-lg:      1.25rem  (card headers)
body-md:       0.875rem (data tables)
label-sm:      0.75rem  (captions, meta)
```

## File Organization Pattern

```
techno_terminal_UI/
├── app/                          # Application code
│   ├── index.html               # Hub/Entry point
│   ├── {module}.html            # Module pages (one per module)
│   └── shared/                  # Shared components
│       ├── page-template.html
│       ├── precision-engine.css
│       ├── sidebar-component.html
│       ├── sidebar-nav.html
│       └── tailwind-config.js
├── docs/                         # All documentation
│   ├── api/                     # API documentation
│   │   └── api-reference.html
│   ├── design/                  # Design specifications
│   │   ├── design-system.html
│   │   └── DESIGN.md
│   ├── memory-bank/             # Project context & memory
│   │   ├── activeContext.md
│   │   ├── productContext.md
│   │   ├── progress.md
│   │   ├── projectbrief.md
│   │   ├── systemPatterns.md
│   │   └── techContext.md
│   └── project/                 # Project reports
│       ├── COMPLETION-REPORT.md
│       └── PROJECT-INDEX.md
├── product_requirements_document.md  # PRD (root)
└── techno_terminal_crm_prd.html      # Landing page (root)
```

**Naming Convention**:
- **Module pages**: `{module-name}.html` (kebab-case) in `app/`
- **Shared assets**: `app/shared/{name}.{ext}`
- **Documentation HTML**: `docs/{category}/{topic}.html`
- **Documentation MD**: `docs/{category}/{name}.md`
- **Memory Bank**: `docs/memory-bank/{context}.md`

**Separation of Concerns**:
- `app/` - Application code only (HTML, CSS, JS components)
- `docs/` - All documentation (design specs, API docs, project reports, memory bank)
- Root level - Entry points and PRD only

## Technical Patterns

### Static Site Architecture
- No build process required
- Pure HTML + Tailwind CSS CDN
- Client-side JavaScript for interactivity
- Ready for any static hosting

### Tailwind Configuration
- Using Tailwind CDN (no custom config)
- Standard utility classes only
- Custom colors via arbitrary values (e.g., `bg-[#006a61]`)

### Responsive Strategy
- Desktop-first design (current)
- `ml-64` offset for sidebar on all pages
- Future: Add mobile breakpoints

## Data Flow (Future Backend)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Static HTML │────▶│  REST API    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                        │
                                               ┌────────▼────────┐
                                               │   Database      │
                                               │ (PostgreSQL/    │
                                               │   MongoDB)      │
                                               └─────────────────┘
```

## Extension Points

### Adding New Modules
1. Create `{module}.html` in `app/`
2. Copy sidebar from existing module in `app/`
3. Add card to `app/index.html` hub
4. Update navigation in all existing pages
5. Document in `docs/project/PROJECT-INDEX.md`

### Future Patterns to Implement
- Authentication gates
- API integration layer
- State management (if needed)
- Mobile responsive layouts
