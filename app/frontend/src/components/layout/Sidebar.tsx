import { NavLink } from 'react-router-dom'

const navSections = [
  {
    title: 'Core Operations',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/groups', label: 'Groups', icon: 'group' },
      { path: '/directory', label: 'Directory', icon: 'person_search' },
      { path: '/students', label: 'Students', icon: 'school' },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/enrollments', label: 'Enrollments', icon: 'assignment_ind' },
      { path: '/finance', label: 'Finance', icon: 'payments' },
      { path: '/attendance', label: 'Attendance', icon: 'check_circle' },
    ],
  },
  {
    title: 'Programs',
    items: [
      { path: '/competitions', label: 'Competitions', icon: 'emoji_events' },
      { path: '/reports', label: 'Reports', icon: 'assessment' },
    ],
  },
  {
    title: 'Resources',
    items: [{ path: '/staff', label: 'Staff', icon: 'people' }],
  },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <NavLink to="/dashboard">
          <h1>Techno Terminal</h1>
          <p>CRM</p>
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        {navSections.map((section) => (
          <div key={section.title} className="sidebar-section">
            <p className="sidebar-section-title">{section.title}</p>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/logout">
          <span className="material-symbols-outlined">logout</span>
          <span>Sign Out</span>
        </NavLink>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: var(--sidebar-width);
          background-color: var(--sidebar-bg);
          border-right: 1px solid var(--sidebar-border);
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sidebar-brand {
          padding: var(--space-6);
          border-bottom: 1px solid var(--sidebar-border);
        }
        .sidebar-brand a {
          display: block;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .sidebar-brand a:hover {
          opacity: 0.8;
        }
        .sidebar-brand h1 {
          font-family: var(--font-headline);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--sidebar-brand-text);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }
        .sidebar-brand p {
          font-size: 0.625rem;
          font-weight: 500;
          color: var(--sidebar-accent);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: var(--space-1);
        }
        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4) 0;
        }
        .sidebar-section {
          margin-bottom: var(--space-2);
        }
        .sidebar-section-title {
          padding: var(--space-2) var(--space-6);
          font-size: 0.625rem;
          font-weight: 600;
          color: var(--sidebar-text);
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-6);
          margin: 0 var(--space-2);
          border-radius: var(--radius-md);
          color: var(--sidebar-text);
          text-decoration: none;
          font-size: var(--text-sm);
          font-weight: 500;
          transition: all 0.2s ease;
          border-right: 2px solid transparent;
        }
        .nav-item:hover {
          background-color: var(--sidebar-bg-hover);
          color: #e2e8f0;
        }
        .nav-item.active {
          background-color: rgba(20, 184, 166, 0.1);
          color: var(--sidebar-text-active);
          border-right-color: var(--sidebar-accent);
        }
        .nav-item .material-symbols-outlined {
          font-size: 1.25rem;
        }
        .sidebar-footer {
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--sidebar-border);
        }
        .sidebar-footer a {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          font-weight: 500;
          color: var(--sidebar-text);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .sidebar-footer a:hover {
          color: var(--sidebar-accent);
        }
      `}</style>
    </aside>
  )
}
