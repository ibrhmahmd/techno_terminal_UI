import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
import { LanguageSettings } from '../components/settings/LanguageSettings'
import { useAuditLogins, useAuditPasswordChanges, useAuditFailedAttempts } from '../hooks/useAuthQueries'
import { MetricsStripCards } from '../components/common/MetricsStripCards'

type TabType = 'profile' | 'sessions-activity' | 'users' | 'audit-logins' | 'audit-password-changes' | 'audit-failed-attempts' | 'language'

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
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const limit = 50
  const hasFrom = from !== ''
  const { data, isLoading, error } = useAuditFailedAttempts(
    { from: from, to: to || undefined, skip: page * limit, limit },
  )
  return (
    <>
      <div className="mb-4"><AuditDateFilter from={from} to={to} onFromChange={(v) => { setFrom(v); setPage(0) }} onToChange={(v) => { setTo(v); setPage(0) }} /></div>
      {!hasFrom ? (
        <div className="bg-white rounded-[6px] shadow-sm p-8 text-center">
          <p className="font-body text-slate-500">{t('settings.specify_start_date')}</p>
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
  const { t } = useTranslation()

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
        label: t('labels.name'),
        value: t('labels.name'),
        icon: 'person',
        color: 'secondary',
        onClick: () => setActiveTab('profile'),
      },
      {
        label: t('navigation.sessions_activity'),
        value: t('navigation.devices'),
        icon: 'devices',
        color: 'emerald',
        onClick: () => setActiveTab('sessions-activity'),
      },
      {
        label: t('navigation.settings'),
        value: t('navigation.language'),
        icon: 'language',
        color: 'slate',
        onClick: () => setActiveTab('language'),
      },
    ]

    if (canManageUsers) {
      items.push({
        label: t('navigation.users'),
        value: t('navigation.accounts'),
        icon: 'group',
        color: 'blue',
        onClick: () => setActiveTab('users'),
      })
    }

    if (isSystemAdmin) {
      items.push(
        {
          label: t('navigation.login_logs'),
          value: t('navigation.access'),
          icon: 'login',
          color: 'amber',
          onClick: () => setActiveTab('audit-logins'),
        },
        {
          label: t('navigation.password_changes'),
          value: t('navigation.security'),
          icon: 'lock',
          color: 'slate',
          onClick: () => setActiveTab('audit-password-changes'),
        },
        {
          label: t('navigation.failed_attempts'),
          value: t('navigation.alerts'),
          icon: 'warning',
          color: 'slate',
          onClick: () => setActiveTab('audit-failed-attempts'),
        }
      )
    }

    return items
  }, [canManageUsers, isSystemAdmin, t])

  const activeIndex = useMemo(() => {
    return metricItems.findIndex((item) => {
      if (activeTab === 'profile') return item.label === t('labels.name')
      if (activeTab === 'sessions-activity') return item.label === t('navigation.sessions_activity')
      if (activeTab === 'language') return item.label === t('navigation.settings')
      if (activeTab === 'users') return item.label === t('navigation.users')
      if (activeTab === 'audit-logins') return item.label === t('navigation.login_logs')
      if (activeTab === 'audit-password-changes') return item.label === t('navigation.password_changes')
      if (activeTab === 'audit-failed-attempts') return item.label === t('navigation.failed_attempts')
      return false
    })
  }, [metricItems, activeTab, t])

  const headerActions = canManageUsers ? (
    <ActionButton
      variant="primary"
      icon="notifications"
      onClick={() => navigate('/notifications')}
    >
      {t('navigation.notifications')}
    </ActionButton>
  ) : undefined

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('navigation.settings')} />
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={headerActions}
        sticky={false}
      />

      <section className="px-8 pt-6">
        <div className="max-w-[1680px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

      <PageSection>
        <div role="tabpanel" aria-label={`${t('settings.title')} - ${activeTab.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}>
          <ErrorBoundary>
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'sessions-activity' && <SessionsActivityTab />}
            {activeTab === 'language' && <LanguageSettings />}
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

