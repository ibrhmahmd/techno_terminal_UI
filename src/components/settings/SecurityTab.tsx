import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { getCurrentUser } from '../../api/auth'

export function SecurityTab() {
  const { user } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const handleRefreshProfile = async () => {
    setIsRefreshing(true)
    try {
      await getCurrentUser()
      setLastRefreshed(new Date())
    } catch (err) {
      console.error('Failed to refresh profile:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Session Information
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-on-surface">Current Session</p>
              <p className="text-xs text-slate-500 mt-1">
                Logged in as {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-green-600">Active</span>
            </div>
          </div>

          {lastRefreshed && (
            <p className="text-xs text-slate-500">
              Profile last refreshed: {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span className="material-symbols-outlined text-base">refresh</span>
            )}
            Refresh Profile
          </button>
        </div>
      </div>

      {/* Password Change Notice */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">
          Password Management
        </h2>

        <p className="text-sm text-slate-600 mb-4">
          To change your password, please contact a system administrator. 
          Administrators can reset your password from the Users tab.
        </p>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom text-base">
              info
            </span>
            For security reasons, password changes must be performed by an administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
