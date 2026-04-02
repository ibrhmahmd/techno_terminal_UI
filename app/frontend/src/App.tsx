import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AppLayout } from './components/layout/AppLayout'

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Login Page (Phase 1)</div>} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<div>Dashboard (Phase 2)</div>} />
            <Route path="/groups" element={<div>Groups (Phase 3)</div>} />
            <Route path="/directory" element={<div>Directory (Phase 4)</div>} />
            <Route path="/students" element={<div>Students (Phase 4)</div>} />
            <Route path="/enrollments" element={<div>Enrollments (Phase 5)</div>} />
            <Route path="/finance" element={<div>Finance (Phase 6)</div>} />
            <Route path="/attendance" element={<div>Attendance (Phase 3)</div>} />
            <Route path="/competitions" element={<div>Competitions</div>} />
            <Route path="/reports" element={<div>Reports (Phase 7)</div>} />
            <Route path="/staff" element={<div>Staff</div>} />
          </Route>
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
