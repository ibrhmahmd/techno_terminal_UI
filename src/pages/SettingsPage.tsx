import { useState, useMemo } from 'react'
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
import { MetricsStripCards } from '../components/common/MetricsStripCards'

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
        <div className="bg-white rounded-[6px] shadow-sm p-8 text-center">
          <p className="font-body text-slate-500">Specify a start date filter to retrieve failed authentication logs.</p>
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

  const metricItems = useMemo(() => {
    const items: {
      label: string
      value: string
      icon: string
      color: 'secondary' | 'emerald' | 'amber' | 'blue' | 'slate'
      onClick: () => void
    }[] = [
      {
        label: 'Profile',
        value: 'User',
        icon: 'person',
        color: 'secondary',
        onClick: () => setActiveTab('profile'),
      },
      {
        label: 'Sessions & Activity',
        value: 'Devices',
        icon: 'devices',
        color: 'emerald',
        onClick: () => setActiveTab('sessions-activity'),
      },
    ]

    if (canManageUsers) {
      items.push({
        label: 'Users',
        value: 'Accounts',
        icon: 'group',
        color: 'blue',
        onClick: () => setActiveTab('users'),
      })
    }

    if (isSystemAdmin) {
      items.push(
        {
          label: 'Login Logs',
          value: 'Access',
          icon: 'login',
          color: 'amber',
          onClick: () => setActiveTab('audit-logins'),
        },
        {
          label: 'Password Changes',
          value: 'Security',
          icon: 'lock',
          color: 'slate',
          onClick: () => setActiveTab('audit-password-changes'),
        },
        {
          label: 'Failed Attempts',
          value: 'Alerts',
          icon: 'warning',
          color: 'slate',
          onClick: () => setActiveTab('audit-failed-attempts'),
        }
      )
    }

    return items
  }, [canManageUsers, isSystemAdmin])

  const activeIndex = useMemo(() => {
    return metricItems.findIndex((item) => {
      if (activeTab === 'profile') return item.label === 'Profile'
      if (activeTab === 'sessions-activity') return item.label === 'Sessions & Activity'
      if (activeTab === 'users') return item.label === 'Users'
      if (activeTab === 'audit-logins') return item.label === 'Login Logs'
      if (activeTab === 'audit-password-changes') return item.label === 'Password Changes'
      if (activeTab === 'audit-failed-attempts') return item.label === 'Failed Attempts'
      return false
    })
  }, [metricItems, activeTab])

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

      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-[1400px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

      <PageSection maxWidth="1400">
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

