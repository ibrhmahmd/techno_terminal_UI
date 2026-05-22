// RoleBasedRoute - Route guard for role-based access control
// Restricts access to users with specific roles

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface RoleBasedRouteProps {
  /** Allowed roles for this route */
  allowedRoles: string[]
  /** Optional redirect path for unauthorized users */
  redirectTo?: string
}

/**
 * RoleBasedRoute - Protects routes by user role
 * 
 * Usage:
 * <Route element={<RoleBasedRoute allowedRoles={['admin', 'system_admin']} />}>
 *   <Route path="/notifications" element={<NotificationsPage />} />
 * </Route>
 */
export function RoleBasedRoute({ 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RoleBasedRouteProps) {
  const { user, isAuthenticated } = useAuthStore()

  // Not authenticated - let ProtectedRoute handle this
  if (!isAuthenticated) {
    return <Outlet />
  }

  // Check if user has required role
  const hasRequiredRole = user && allowedRoles.includes(user.role)

  if (!hasRequiredRole) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}



