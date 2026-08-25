import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useAuthStore } from './store/authStore'
import { useSettingsStore } from './store/settingsStore'
import { useEffect, useState, lazy, Suspense } from 'react'
import { AppLayout } from './components/layout/AppLayout'
import { AuthLayout } from './components/auth/AuthLayout'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { RoleBasedRoute } from './components/common/RoleBasedRoute'
import { InstructorBlockedRoute } from './components/common/InstructorBlockedRoute'

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const GroupsPage = lazy(() => import('./pages/GroupsPage').then(m => ({ default: m.GroupsPage })))
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage').then(m => ({ default: m.GroupDetailPage })))
const DirectoryPage = lazy(() => import('./pages/DirectoryPage').then(m => ({ default: m.DirectoryPage })))
const StudentDetailPage = lazy(() => import('./pages/StudentDetailPage').then(m => ({ default: m.StudentDetailPage })))
const ParentDetailPage = lazy(() => import('./pages/ParentDetailPage').then(m => ({ default: m.ParentDetailPage })))
const EnrollmentsPage = lazy(() => import('./pages/EnrollmentsPage').then(m => ({ default: m.EnrollmentsPage })))
const FinancePage = lazy(() => import('./pages/FinancePage').then(m => ({ default: m.FinancePage })))
const CompetitionsPage = lazy(() => import('./pages/CompetitionsPage').then(m => ({ default: m.CompetitionsPage })))
const CompetitionDetailPage = lazy(() => import('./pages/CompetitionDetailPage').then(m => ({ default: m.CompetitionDetailPage })))
const CompetitionEditPage = lazy(() => import('./pages/CompetitionEditPage').then(m => ({ default: m.CompetitionEditPage })))
const TeamDetailPage = lazy(() => import('./pages/TeamDetailPage').then(m => ({ default: m.TeamDetailPage })))
const CoursesPage = lazy(() => import('./pages/CoursesPage').then(m => ({ default: m.CoursesPage })))
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage').then(m => ({ default: m.CourseDetailPage })))
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const StaffPage = lazy(() => import('./pages/StaffPage').then(m => ({ default: m.StaffPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const TasksPage = lazy(() => import('./pages/TasksPage').then(m => ({ default: m.TasksPage })))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const CapabilitiesPage = lazy(() => import('./pages/CapabilitiesPage').then(m => ({ default: m.CapabilitiesPage })))
const CertificatesPage = lazy(() => import('./pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })))

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
  if (!hydrated) return <AuthLayout title="" subtitle="" showBranding /> // branded skeleton during hydration
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
  const { locale, direction } = useSettingsStore()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = direction
  }, [locale, direction])

  return (
    <BrowserRouter>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-secondary focus:rounded-lg focus:shadow-lg">
        Skip to content
      </a>
      <div id="main-content">
      <Suspense fallback={<LoadingSpinner size="lg" variant="default" />}>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
          <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
          <Route path="/forgot-password" element={<ErrorBoundary><ForgotPasswordPage /></ErrorBoundary>} />
          <Route path="/reset-password" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/students/:id" element={<StudentDetailPage />} />
            <Route path="/parents/:id" element={<ParentDetailPage />} />
            <Route path="/attendance" element={<div>Attendance</div>} />
            <Route path="/capabilities" element={<CapabilitiesPage />} />
            <Route path="/competitions" element={<CompetitionsPage />} />
            <Route path="/competitions/:id/edit" element={<CompetitionEditPage />} />
            <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
            <Route path="/teams/:id" element={<TeamDetailPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
          </Route>

          {/* Instructor-restricted Routes */}
          <Route element={<InstructorBlockedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/directory" element={<DirectoryPage />} />
              <Route path="/enrollments" element={<EnrollmentsPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
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
      </Suspense>
      </div>
      <SpeedInsights />
    </BrowserRouter>
  )
}

export default App
