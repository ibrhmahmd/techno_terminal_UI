import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />

      <main className="ml-0 lg:ml-64 flex-1 min-h-screen pb-16 lg:pb-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}

