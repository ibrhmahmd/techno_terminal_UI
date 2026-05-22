import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader } from '../components/common/PageHeader'
import { PageSection } from '../components/common/PageSection'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { ActionButton } from '../components/common/ActionButton'
import { ProfileTab } from '../components/settings/ProfileTab'
import { SessionsActivityTab } from '../components/settings/SessionsActivityTab'
import { UsersTab } from '../components/settings/UsersTab'
import { AuditLogTable, AuditDateFilter } from '../components/settings/AuditLogTable'
import { useAuditLogins, useAuditPasswordChanges, useAuditFailedAttempts } from '../hooks/useAuthQueries'

type TabType = 'profile' | 'sessions-activity' | 'users' | 'audit-logins' | 'audit-password-changes' | 'audit-failed-attempts'

function AuditLoginSection() {
  const [page, setPage] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const limit = 50
  const { data, isLoading, error } = useAuditLogins({ from: from || undefined, to: to || undefined, skip: page * limit, limit })
  return (
    <>
      <div className="mb-4"><AuditDateFilter from={from} to={to} onFromChange={(v) => { setFrom(v); setPage(0) }} onToChange={(v) => { setTo(v); setPage(0) }} /></div>
      <AuditLogTable data={data?.data ?? []} total={data?.total ?? 0} page={page} pageSize={limit} onPageChange={setPage} isLoading={isLoading} error={!!error} />
    </>
  )
}

function AuditPasswordChangeSection() {
  const [page, setPage] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const limit = 50
  const { data, isLoading, error } = useAuditPasswordChanges({ from: from || undefined, to: to || undefined, skip: page * limit, limit })
  return (
    <>
      <div className="mb-4"><AuditDateFilter from={from} to={to} onFromChange={(v) => { setFrom(v); setPage(0) }} onToChange={(v) => { setTo(v); setPage(0) }} /></div>
      <AuditLogTable data={data?.data ?? []} total={data?.total ?? 0} page={page} pageSize={limit} onPageChange={setPage} isLoading={isLoading} error={!!error} />
    </>
  )
}

function AuditFailedAttemptsSection() {
  const [page, setPage] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const limit = 50
  const hasFrom = from !== ''
  const { data, isLoading, error } = useAuditFailedAttempts(
    { from, to: to || undefined, skip: page * limit, limit },
  )
  return (
    <>
      <div className="mb-4"><AuditDateFilter from={from} to={to} onFromChange={(v) => { setFrom(v); setPage(0) }} onToChange={(v) => { setTo(v); setPage(0) }} /></div>
      {!hasFrom ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-slate-500">Please select a start date to view failed attempts.</p>
        </div>
      ) : (
        <AuditLogTable data={data?.data ?? []} total={data?.total ?? 0} page={page} pageSize={limit} onPageChange={setPage} isLoading={isLoading} error={!!error} />
      )}
    </>
  )
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const canManageUsers = user?.role === 'admin' || user?.role === 'system_admin'
  const isSystemAdmin = user?.role === 'system_admin'

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'sessions-activity', label: 'Sessions & Activity', icon: 'devices' },
    ...(canManageUsers ? [{ id: 'users' as TabType, label: 'Users', icon: 'group' }] : []),
    ...(isSystemAdmin ? [
      { id: 'audit-logins' as TabType, label: 'Login Logs', icon: 'login' },
      { id: 'audit-password-changes' as TabType, label: 'Password Changes', icon: 'lock' },
      { id: 'audit-failed-attempts' as TabType, label: 'Failed Attempts', icon: 'warning' },
    ] : []),
  ]

  const headerActions = canManageUsers ? (
    <ActionButton
      variant="primary"
      icon="notifications"
      onClick={() => navigate('/notifications')}
    >
      Notifications
    </ActionButton>
  ) : undefined

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Settings" />
      <PageHeader
        title="Settings"
        subtitle="Manage your account and system preferences"
        actions={headerActions}
        sticky={false}
      />

      <div className="border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto" role="tablist" aria-orientation="horizontal">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={"tab-"+tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === tab.id
                    ? 'text-secondary border-secondary'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <PageSection>
        <div role="tabpanel" aria-labelledby={"tab-"+activeTab}>
          <ErrorBoundary>
            {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'sessions-activity' && <SessionsActivityTab />}
            {activeTab === 'users' && canManageUsers && <UsersTab />}
            {activeTab === 'audit-logins' && <AuditLoginSection />}
            {activeTab === 'audit-password-changes' && <AuditPasswordChangeSection />}
            {activeTab === 'audit-failed-attempts' && <AuditFailedAttemptsSection />}
          </ErrorBoundary>
        </div>
      </PageSection>
    </div>
  )
}
