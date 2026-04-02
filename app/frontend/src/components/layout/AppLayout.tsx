import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
        }
        .main-content {
          margin-left: var(--sidebar-width);
          flex: 1;
          min-height: 100vh;
          background-color: var(--surface);
        }
      `}</style>
    </div>
  )
}
