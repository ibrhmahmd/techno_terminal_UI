// RoleBasedRoute - Route guard for role-based access control
// Restricts access to users with specific roles

import { Navigate, Outlet, Link } from 'react-router-dom'
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

export function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-5xl text-red-500 mb-4" aria-hidden="true">block</span>
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">Access Denied</h1>
        <p className="text-on-surface-variant mb-6">You do not have permission to access this page.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-lg hover:opacity-90 transition-all"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">home</span>
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}

