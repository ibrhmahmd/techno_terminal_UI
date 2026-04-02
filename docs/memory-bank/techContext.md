# Technical Context - TechnoTerminal CRM

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| HTML5 | - | Structure and semantics |
| Tailwind CSS | CDN Latest | Styling and layout |
| JavaScript | ES6+ | Interactivity |
| Material Icons | CDN | Iconography |

### Fonts
- **Space Grotesk** (Google Fonts) - Display/Headlines
- **Inter** (Google Fonts) - Body/Labels

### No Backend (Current)
- Static HTML files only
- No database required
- No server-side processing

## Development Setup

### Prerequisites
- Web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- Local server (optional, for testing)

### File Structure
```
stitch_techno_terminal_crm_prd/
├── build/                    # Production files
│   ├── index.html           # Main hub
│   ├── *.html               # Module pages
│   ├── shared/              # Shared components
│   │   ├── nav.html
│   │   └── styles.css
│   └── docs/                # Documentation
│       ├── design-system.html
│       └── api-reference.html
├── kinetic_logic/           # Design specs
│   └── DESIGN.md
├── memory-bank/             # Project context
│   ├── projectbrief.md
│   ├── productContext.md
│   ├── activeContext.md
│   ├── systemPatterns.md
│   ├── techContext.md
│   └── progress.md
└── product_requirements_document.md
```

### Running Locally

#### Option 1: Direct File Open
Simply open `build/index.html` in any browser.

#### Option 2: Local Server (Recommended)
```bash
# Python 3
python -m http.server 8000 --directory build

# Node.js (http-server)
npx http-server build -p 8000

# PHP
php -S localhost:8000 -t build
```

Then navigate to `http://localhost:8000`

## Dependencies

### CDN Resources
All dependencies loaded via CDN (no package.json needed):

```html
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Material Icons -->
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Build Process

### Current: No Build Required
- No npm, webpack, or bundler needed
- Direct HTML/CSS/JS deployment
- Copy `/build/` folder to any web server

### Future Considerations
If build process added later:
- Vite (recommended for speed)
- Tailwind CSS CLI for production purging
- PostCSS for processing

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

### Potential Endpoints
```
GET  /api/students          # List all students
GET  /api/students/:id      # Student details
POST /api/students          # Create student
PUT  /api/students/:id      # Update student

GET  /api/groups            # List groups
GET  /api/groups/:id        # Group details

GET  /api/attendance        # Attendance records
POST /api/attendance        # Record attendance

GET  /api/finance/receipts  # Financial records
POST /api/finance/receipts  # Create receipt
```

### Recommended Backend Stack
- **Node.js + Express** (JavaScript ecosystem)
- **PostgreSQL** (relational data)
- **Prisma** (ORM)
- **JWT** (authentication)
