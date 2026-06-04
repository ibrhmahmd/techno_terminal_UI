// Admin Settings Tab
// Manage personal notification preferences and additional recipients

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAdminSettings } from '../../../hooks/notifications'
import { useAdditionalRecipients, useAddRecipient, useUpdateRecipient, useDeleteRecipient } from '../../../hooks/notifications'
import { toggleNotification } from '../../../api/notifications'
import { notificationKeys } from '../../../hooks/notifications/queryKeys'
import { LoadingSpinner } from '../../common/LoadingSpinner'
import { Modal } from '../../common/Modal'
import { DataTableContainer } from '../../common/DataTableContainer'
import type { NotificationType, AdditionalRecipientDTO } from '../../../api/notifications'

const NOTIFICATION_GROUPS = {
  enrollment: {
    label: 'Enrollment',
    types: ['enrollment_created', 'enrollment_completed', 'enrollment_dropped', 'enrollment_transferred'] as NotificationType[],
    icon: 'school',
  },
  reports: {
    label: 'Reports',
    types: ['daily_report', 'weekly_report', 'monthly_report'] as NotificationType[],
    icon: 'assessment',
  },
  payments: {
    label: 'Payments',
    types: ['payment_received', 'payment_reminder'] as NotificationType[],
    icon: 'payments',
  },
  competitions: {
    label: 'Competitions',
    types: ['competition_team_registration', 'competition_fee_payment', 'competition_placement'] as NotificationType[],
    icon: 'emoji_events',
  },
  progression: {
    label: 'Progression',
    types: ['level_progression'] as NotificationType[],
    icon: 'trending_up',
  },
  security: {
    label: 'Security & Auth',
    types: ['admin_login_alert'] as NotificationType[],
    icon: 'security',
  },
} as const

const TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  enrollment_created: 'When a new enrollment is created',
  enrollment_completed: 'When an enrollment is marked complete',
  enrollment_dropped: 'When a student drops an enrollment',
  enrollment_transferred: 'When a student transfers groups',
  level_progression: 'When a student advances to next level',
  payment_received: 'When a payment is received',
  payment_reminder: 'Scheduled payment reminders',
  daily_report: 'Daily summary of activities',
  weekly_report: 'Weekly summary of activities',
  monthly_report: 'Monthly summary of activities',
  competition_team_registration: 'When a team registers for competition',
  competition_fee_payment: 'When competition fees are paid',
  competition_placement: 'When competition results are published',
  admin_login_alert: 'When an admin logs in from a new IP or device',
}

export function AdminSettingsTab() {
  const queryClient = useQueryClient()
  const { data: settings, isLoading: settingsLoading } = useAdminSettings()
  const { data: recipients, isLoading: recipientsLoading } = useAdditionalRecipients()
  const addRecipient = useAddRecipient()
  const updateRecipient = useUpdateRecipient()
  const deleteRecipient = useDeleteRecipient()

  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState<AdditionalRecipientDTO | null>(null)
  const [togglingType, setTogglingType] = useState<NotificationType | null>(null)

  const isLoading = settingsLoading || recipientsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  const handleToggle = async (type: NotificationType, enabled: boolean) => {
    setTogglingType(type)
    try {
      await toggleNotification(type, { is_enabled: enabled })
      await queryClient.invalidateQueries({ queryKey: notificationKeys.admin.all })
    } catch (error) {
      console.error('Failed to toggle notification:', error)
    } finally {
      setTogglingType(null)
    }
  }

  const getSetting = (type: NotificationType) => {
    return settings?.settings.find(s => s.notification_type === type)?.is_enabled ?? false
  }

  return (
    <div className="space-y-8">
      {/* Personal Preferences */}
      <section className="bg-white rounded-[6px] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">notifications</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">Personal Preferences</h3>
              <p className="font-body text-sm text-slate-500">Configure notification flags for direct activities</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(NOTIFICATION_GROUPS).map(([key, group]) => (
            <div key={key} className="pb-6 last:pb-0">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-slate-400">{group.icon}</span>
                <h4 className="font-headline font-semibold text-sm text-slate-700">{group.label}</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.types.map(type => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 rounded-[6px] bg-slate-50/50 hover:bg-slate-50 transition-colors duration-120"
                  >
                    <div>
                      <p className="font-body text-sm font-medium text-slate-700">
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="font-body text-xs text-slate-500">{TYPE_DESCRIPTIONS[type]}</p>
                    </div>
                    <label className={`relative inline-flex items-center ${togglingType === type ? 'cursor-wait' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={getSetting(type)}
                        onChange={(e) => handleToggle(type, e.target.checked)}
                        disabled={togglingType === type}
                      />
                      <div className={`w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary ${togglingType === type ? 'opacity-50' : ''}`}></div>
                      {togglingType === type && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-slate-500 animate-spin">sync</span>
                        </span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Additional Recipients */}
      <section className="bg-white rounded-[6px] shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">people</span>
            </div>
            <div>
              <h3 className="font-headline text-lg font-semibold text-on-surface">Additional Recipients</h3>
              <p className="font-body text-sm text-slate-500">Register extra notification channels</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingRecipient(null)
              setIsRecipientModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-[6px] text-sm font-medium hover:opacity-95 transition-opacity"
          >
            <span className="material-symbols-outlined">add</span>
            Add Recipient
          </button>
        </div>

        <DataTableContainer>
          <table className="w-full text-left font-body">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Label</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Types</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipients?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    <span className="material-symbols-outlined text-3xl mb-1 block">inbox</span>
                    No active channels defined.
                  </td>
                </tr>
              ) : (
                recipients?.map(recipient => (
                  <tr key={recipient.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-2 text-sm text-slate-900 font-mono">{recipient.email}</td>
                    <td className="px-4 py-2 text-sm text-slate-600">{recipient.label || '\u2014'}</td>
                    <td className="px-4 py-2">
                      {recipient.notification_types ? (
                        <span className="text-xs px-2 py-0.5 bg-slate-500/10 rounded-[6px] text-slate-600">
                          {recipient.notification_types.length} channels
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-secondary/15 text-secondary rounded-[6px]">
                          All channels
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-[6px] font-medium ${recipient.is_active ? 'bg-secondary/15 text-secondary' : 'bg-slate-500/10 text-slate-600'}`}>
                        {recipient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingRecipient(recipient)
                            setIsRecipientModalOpen(true)
                          }}
                          className="p-1 text-slate-400 hover:text-secondary transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => deleteRecipient.mutate(recipient.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </DataTableContainer>
      </section>

      {/* Recipient Modal */}
      <RecipientModal
        isOpen={isRecipientModalOpen}
        onClose={() => setIsRecipientModalOpen(false)}
        recipient={editingRecipient}
        onSave={(data) => {
          if (editingRecipient) {
            updateRecipient.mutate({ id: editingRecipient.id, request: data })
          } else {
            addRecipient.mutate(data)
          }
          setIsRecipientModalOpen(false)
        }}
      />
    </div>
  )
}

// Recipient Modal Component
interface RecipientModalProps {
  isOpen: boolean
  onClose: () => void
  recipient: AdditionalRecipientDTO | null
  onSave: (data: { email: string; label?: string; notification_types?: NotificationType[]; is_active?: boolean }) => void
}

function RecipientModal({ isOpen, onClose, recipient, onSave }: RecipientModalProps) {
  const [email, setEmail] = useState(recipient?.email || '')
  const [label, setLabel] = useState(recipient?.label || '')
  const [isActive, setIsActive] = useState(recipient?.is_active ?? true)
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>(
    recipient?.notification_types || []
  )
  const [useAllTypes, setUseAllTypes] = useState(!recipient?.notification_types)

  const allTypes = Object.values(NOTIFICATION_GROUPS).flatMap(g => g.types)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      email,
      label: label || undefined,
      notification_types: useAllTypes ? undefined : selectedTypes,
      is_active: isActive,
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recipient ? 'Edit Recipient' : 'Add Recipient'}
      size="lg"
      footer={
        <div className="flex justify-end gap-3 font-body">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!email}
            className="px-4 py-2 bg-secondary text-white rounded-[6px] hover:opacity-90 disabled:opacity-50 transition-opacity duration-120 text-sm font-medium"
          >
            {recipient ? 'Save Changes' : 'Add Recipient'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 font-body">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
            placeholder="recipient@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Label (Optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1.5 text-sm rounded-none outline-none transition-colors"
            placeholder="e.g., Finance Manager"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-secondary rounded-[4px] border-slate-300 focus:ring-secondary/20"
            />
            <span className="text-sm text-slate-600">Active</span>
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notification Types</label>
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={useAllTypes}
              onChange={(e) => setUseAllTypes(e.target.checked)}
              className="w-4 h-4 text-secondary rounded-[4px] border-slate-300 focus:ring-secondary/20"
            />
            <span className="text-sm text-slate-600">Receive all notification types</span>
          </label>

          {!useAllTypes && (
            <div className="bg-slate-50/50 rounded-[6px] p-3 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {allTypes.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypes([...selectedTypes, type])
                        } else {
                          setSelectedTypes(selectedTypes.filter(t => t !== type))
                        }
                      }}
                      className="w-4 h-4 text-secondary rounded-[4px] border-slate-300 focus:ring-secondary/20"
                    />
                    <span className="text-sm text-slate-600">
                      {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
  )
}
