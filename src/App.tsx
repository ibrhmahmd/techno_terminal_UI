import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAuthStore } from './store/authStore'
import { useEffect, useState } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { GroupsPage } from './pages/GroupsPage'
import { GroupDetailPage } from './pages/GroupDetailPage'
import { DirectoryPage } from './pages/DirectoryPage'
import { StudentDetailPage } from './pages/StudentDetailPage'
import { ParentDetailPage } from './pages/ParentDetailPage'
import { EnrollmentsPage } from './pages/EnrollmentsPage'
import { FinancePage } from './pages/FinancePage'
import { CompetitionsPage } from './pages/CompetitionsPage'
import { CompetitionDetailPage } from './pages/CompetitionDetailPage'
import { CompetitionEditPage } from './pages/CompetitionEditPage'
import { TeamDetailPage } from './pages/TeamDetailPage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { ReportsPage } from './pages/ReportsPage'
import { StaffPage } from './pages/StaffPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { RoleBasedRoute } from './components/common/RoleBasedRoute'

function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(
    useAuthStore.persist.hasHydrated()
  )
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    return unsub
  }, [])
  return hasHydrated
}

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  const hydrated = useHasHydrated()
  if (!hydrated) return null // wait for localStorage rehydration before deciding
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  const hydrated = useHasHydrated()
  if (!hydrated) return null // wait for localStorage rehydration before deciding
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route path="/parents/:id" element={<ParentDetailPage />} />
            <Route path="/enrollments" element={<EnrollmentsPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/attendance" element={<div>Attendance</div>} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/competitions/:id/edit" element={<CompetitionEditPage />} />
            <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          
          {/* Admin-only Routes */}
          <Route element={<RoleBasedRoute allowedRoles={['admin', 'system_admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        {/* Wildcard: send unknown routes to login, not dashboard, to avoid redirect loops */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <SpeedInsights />
    </BrowserRouter>
  )
}

export default App
