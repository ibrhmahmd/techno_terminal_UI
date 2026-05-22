import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function InstructorBlockedRoute() {
  const { user } = useAuthStore()

  if (user?.role === 'instructor') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
