// Logs Tab
// View notification history and audit logs

import { useState } from 'react'
import { useNotificationLogs, useNotificationLog, useLogRecipients, useRetryFailed } from '../../../hooks/notifications'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import { DataTableContainer } from '../../common/DataTableContainer'
import type { LogStatus, NotificationType } from '../../../api/notifications'

const STATUS_COLORS: Record<LogStatus, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'schedule' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'sync' },
  completed: { bg: 'bg-green-100', text: 'text-green-700', icon: 'check_circle' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', icon: 'error' },
  partial: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'warning' },
}

const NOTIFICATION_TYPE_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'enrollment_created', label: 'Enrollment Created' },
  { value: 'enrollment_completed', label: 'Enrollment Completed' },
  { value: 'enrollment_dropped', label: 'Enrollment Dropped' },
  { value: 'enrollment_transferred', label: 'Enrollment Transferred' },
  { value: 'level_progression', label: 'Level Progression' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'payment_reminder', label: 'Payment Reminder' },
  { value: 'daily_report', label: 'Daily Report' },
  { value: 'weekly_report', label: 'Weekly Report' },
  { value: 'monthly_report', label: 'Monthly Report' },
  { value: 'competition_team_registration', label: 'Competition Registration' },
  { value: 'competition_fee_payment', label: 'Competition Payment' },
  { value: 'competition_placement', label: 'Competition Placement' },
]

export function LogsTab() {
  const [filters, setFilters] = useState<{ notification_type?: NotificationType; status?: LogStatus }>({})
  const { data: logs, isLoading } = useNotificationLogs(filters)
  const retryFailed = useRetryFailed()

  const [selectedLog, setSelectedLog] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-orange-600">history</span>
          </div>
          <div>
            <h3 className="font-medium text-on-surface">Notification Logs</h3>
            <p className="text-sm text-slate-500">History of sent notifications</p>
          </div>
        </div>
        <button
          onClick={() => setFilters({})}
          className="text-sm text-slate-600 hover:text-secondary transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Notification Type</label>
          <select
            value={filters.notification_type || ''}
            onChange={(e) => setFilters({ ...filters, notification_type: e.target.value as NotificationType || undefined })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All Types</option>
            {NOTIFICATION_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as LogStatus || undefined })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="partial">Partial</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <DataTableContainer>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Recipients</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sent At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                  No notification logs found
                </td>
              </tr>
            ) : (
              logs?.map(log => {
                const statusStyle = STATUS_COLORS[log.status]
                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 text-sm">
                        {log.notification_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-xs text-slate-500">via {log.channel}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{log.recipient_count} total</span>
                        {log.failure_count > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                            {log.failure_count} failed
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className="material-symbols-outlined text-sm">{statusStyle.icon}</span>
                        {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedLog(log.id)
                            setIsDetailModalOpen(true)
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        {log.failure_count > 0 && (
                          <button
                            onClick={() => retryFailed.mutate(log.id)}
                            className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                            title="Retry failed"
                          >
                            <span className="material-symbols-outlined">refresh</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </DataTableContainer>

      {/* Detail Modal */}
      <LogDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        logId={selectedLog}
      />
    </div>
  )
}

// Log Detail Modal Component
interface LogDetailModalProps {
  isOpen: boolean
  onClose: () => void
  logId: number | null
}

function LogDetailModal({ isOpen, onClose, logId }: LogDetailModalProps) {
  const { data: log, isLoading: logLoading } = useNotificationLog(logId || 0)
  const { data: recipients, isLoading: recipientsLoading } = useLogRecipients(logId || 0)
  const retryFailed = useRetryFailed()

  const isLoading = logLoading || recipientsLoading

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Log Details" size="lg">
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </div>
      </Modal>
    )
  }

  if (!log) return null

  const statusStyle = STATUS_COLORS[log.status]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Log Details"
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          {log.failure_count > 0 && (
            <button
              onClick={() => {
                retryFailed.mutate(log.id)
                onClose()
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry Failed ({log.failure_count})
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">Type</p>
            <p className="font-medium text-slate-900">
              {log.notification_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">Status</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              <span className="material-symbols-outlined text-sm">{statusStyle.icon}</span>
              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">Recipients</p>
            <p className="font-medium text-slate-900">{log.recipient_count}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-xs text-slate-500">Success Rate</p>
            <p className="font-medium text-slate-900">
              {log.recipient_count > 0 ? Math.round((log.success_count / log.recipient_count) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Recipients Table */}
        <div>
          <h4 className="font-medium text-slate-700 mb-3">Recipients</h4>
          <DataTableContainer hasShadow={false}>
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Email</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recipients?.map(recipient => (
                  <tr key={recipient.id}>
                    <td className="px-3 py-2 text-sm text-slate-900">{recipient.recipient_email}</td>
                    <td className="px-3 py-2 text-sm text-slate-600 capitalize">{recipient.recipient_type}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        recipient.status === 'sent' ? 'bg-green-100 text-green-700' :
                        recipient.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {recipient.status.charAt(0).toUpperCase() + recipient.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableContainer>
        </div>

        {log.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-700 mb-1">Error</h4>
            <p className="text-sm text-red-600">{log.error_message}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
