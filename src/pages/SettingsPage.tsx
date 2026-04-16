import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { ProfileTab } from '../components/settings/ProfileTab'
import { SecurityTab } from '../components/settings/SecurityTab'
import { UsersTab } from '../components/settings/UsersTab'

type TabType = 'profile' | 'security' | 'users'

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { user } = useAuthStore()

  // Only admin and system_admin can see users tab
  const canManageUsers = user?.role === 'admin' || user?.role === 'system_admin'

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'security', label: 'Security', icon: 'security' },
    ...(canManageUsers ? [{ id: 'users' as TabType, label: 'Users', icon: 'group' }] : []),
  ]

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Settings</h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Manage your account and system preferences
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="px-8 pt-4 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-on-surface'
                    : 'text-slate-400 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="p-8 max-w-[1400px] mx-auto">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'users' && canManageUsers && <UsersTab />}
      </section>
    </div>
  )
}
