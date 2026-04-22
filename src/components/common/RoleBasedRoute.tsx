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

/**
 * AccessDenied - Component shown when user lacks permissions
 */
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-red-600">block</span>
      </div>
      <h1 className="text-2xl font-bold text-on-surface mb-2">Access Denied</h1>
      <p className="text-slate-500 text-center max-w-md mb-6">
        You don't have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
      <a 
        href="/dashboard" 
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Return to Dashboard
      </a>
    </div>
  )
}
