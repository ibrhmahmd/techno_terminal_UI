import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/formatting'

export function ProfileTab() {
  const { user } = useAuthStore()

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
        <p className="text-slate-500">Loading user information...</p>
      </div>
    )
  }

  const profileFields = [
    { label: 'Username', value: user.username || 'N/A' },
    { label: 'Email', value: user.email || 'N/A' },
    { label: 'Employee ID', value: user.employee_id?.toString() || 'N/A' },
    { label: 'Role', value: user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A' },
    { label: 'Account Status', value: user.is_active ? 'Active' : 'Inactive' },
    { label: 'Last Login', value: user.last_login ? formatDate(user.last_login) : 'N/A' },
    { label: 'Account Created', value: user.created_at ? formatDate(user.created_at) : 'N/A' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">
          Profile Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profileFields.map((field) => (
            <div key={field.label} className="space-y-1">
              <label className="text-sm font-medium text-slate-500">{field.label}</label>
              <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-on-surface">
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            <span className="material-symbols-outlined inline-block mr-2 align-text-bottom text-base">
              info
            </span>
            Profile information is managed by system administrators. Contact an admin to update your details.
          </p>
        </div>
      </div>
    </div>
  )
}
