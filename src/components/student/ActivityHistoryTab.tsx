// Activity History Tab Component
// Displays student activity timeline, enrollment history, and status changes
// @see docs/api/crm/student_history.md

import { useState } from 'react'
import { Clock, Calendar, User, BookOpen, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import {
  useActivityHistory,
  useActivitySummary,
  useEnrollmentHistory,
  useDeleteActivity,
} from '../../hooks/useStudentActivity'
import type { ActivityLogResponseDTO, ActivitySummaryItem, EnrollmentHistoryEntry } from '../../api/crm'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../common/Toast'
import { LogActivityModal } from '../crm/LogActivityModal'
import { ConfirmDialog } from '../common/ConfirmDialog'

type TabType = 'timeline' | 'enrollments' | 'summary'

interface ActivityHistoryTabProps {
  studentId: number
}

export function ActivityHistoryTab({ studentId }: ActivityHistoryTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline')
  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string }>({})

  // Modals & Confirmation state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<ActivityLogResponseDTO | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<ActivityLogResponseDTO | null>(null)

  const user = useAuthStore((state) => state.user)
  const { showToast } = useToast()
  const deleteMutation = useDeleteActivity()

  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin'

  const { data: history, isLoading: loadingHistory, refetch: refetchHistory } = useActivityHistory(studentId, {
    date_from: dateFilter.from,
    date_to: dateFilter.to,
    limit: 50,
    enabled: activeTab === 'timeline',
  })

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useActivitySummary(
    studentId,
    { date_from: dateFilter.from, date_to: dateFilter.to },
    activeTab === 'summary'
  )

  const { data: enrollmentData, isLoading: loadingEnrollments } = useEnrollmentHistory(
    studentId,
    { skip: 0, limit: 20 },
    activeTab === 'enrollments'
  )
  const enrollments = enrollmentData?.data || []

  const isLoading = loadingHistory || loadingSummary || loadingEnrollments

  const handleDeleteConfirm = async () => {
    if (!activityToDelete) return
    try {
      await deleteMutation.mutateAsync({
        studentId,
        activityId: activityToDelete.id,
      })
      showToast('Activity log deleted successfully', 'success')
      setActivityToDelete(null)
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete activity log', 'error')
    }
  }

  const handleEditActivity = (item: ActivityLogResponseDTO) => {
    setSelectedActivity(item)
    setIsLogModalOpen(true)
  }

  const handleSuccess = () => {
    refetchHistory()
    refetchSummary()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {[
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'enrollments', label: 'Enrollments', icon: BookOpen },
              { id: 'summary', label: 'Summary', icon: FileText },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-white text-on-surface shadow-sm'
                    : 'text-slate-600 hover:text-on-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {isAdmin && activeTab === 'timeline' && (
            <button
              onClick={() => {
                setSelectedActivity(null)
                setIsLogModalOpen(true)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/95 rounded-lg shadow-sm hover:shadow transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Log Activity
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter.from || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
            className="px-3 py-1.5 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateFilter.to || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
            className="px-3 py-1.5 text-sm border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
            placeholder="To"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {activeTab === 'timeline' && (
            <TimelineView
              history={history || []}
              isAdmin={isAdmin}
              onEditActivity={handleEditActivity}
              onDeleteActivity={setActivityToDelete}
              onLogActivity={() => {
                setSelectedActivity(null)
                setIsLogModalOpen(true)
              }}
            />
          )}
          {activeTab === 'enrollments' && <EnrollmentsView enrollments={enrollments || []} />}
          {activeTab === 'summary' && <SummaryView summary={summary || []} />}
        </>
      )}

      {/* Modals & Dialogs */}
      <LogActivityModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        studentId={studentId}
        activity={selectedActivity}
        onSuccess={handleSuccess}
      />

      <ConfirmDialog
        isOpen={activityToDelete !== null}
        title="Delete Activity Log"
        message="Are you sure you want to delete this activity log? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setActivityToDelete(null)}
      />
    </div>
  )
}

// Timeline View Component
function TimelineView({
  history,
  isAdmin,
  onEditActivity,
  onDeleteActivity,
  onLogActivity,
}: {
  history: ActivityLogResponseDTO[]
  isAdmin: boolean
  onEditActivity: (item: ActivityLogResponseDTO) => void
  onDeleteActivity: (item: ActivityLogResponseDTO) => void
  onLogActivity: () => void
}) {
  if (history.length === 0) {
    return (
      <EmptyState
        title="No activity history"
        message="No activities have been recorded for this student yet."
        icon="history"
      />
    )
  }

  // Group by date
  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {} as Record<string, ActivityLogResponseDTO[]>)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="relative">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-medium text-slate-600">{date}</h4>
          </div>
          <div className="space-y-3 ms-7">
            {items.map((item, idx) => (
              <TimelineItem
                key={idx}
                item={item}
                isAdmin={isAdmin}
                onLogNew={onLogActivity}
                onEdit={() => onEditActivity(item)}
                onDelete={() => onDeleteActivity(item)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Single Timeline Item
function TimelineItem({
  item,
  isAdmin,
  onLogNew,
  onEdit,
  onDelete,
}: {
  item: ActivityLogResponseDTO
  isAdmin: boolean
  onLogNew: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const getIcon = () => {
    switch (item.activity_type) {
      case 'enrollment':
      case 'enrollment_change':
        return <BookOpen className="w-4 h-4 text-blue-500" />
      case 'status_change':
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'payment':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <User className="w-4 h-4 text-slate-500" />
    }
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/70 rounded-lg transition-colors group relative">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface capitalize">
            {item.activity_type.replace(/_/g, ' ')}
          </span>
          {item.activity_subtype && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 font-medium">
              {item.activity_subtype}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>
        )}
        {typeof item.metadata?.changes_summary === 'string' ? (
          <div className="mt-2 text-xs text-slate-600 font-mono bg-white border border-slate-200 p-2 rounded whitespace-pre-wrap">
            {item.metadata.changes_summary as string}
          </div>
        ) : null}
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span>{new Date(item.created_at).toLocaleTimeString()}</span>
          {item.performed_by_name && <span>by {item.performed_by_name}</span>}
        </div>
      </div>

      {/* Admin Actions */}
      {isAdmin && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-start ms-2 bg-white/90 backdrop-blur shadow-sm border border-slate-200 rounded-lg p-0.5">
          <button
            onClick={onLogNew}
            title="Log New Activity"
            className="p-1 text-slate-500 hover:text-primary hover:bg-slate-50 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] block">add</span>
          </button>
          <button
            onClick={onEdit}
            title="Edit Log"
            className="p-1 text-slate-500 hover:text-secondary hover:bg-slate-50 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] block">edit</span>
          </button>
          <button
            onClick={onDelete}
            title="Delete Log"
            className="p-1 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] block">delete</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Enrollments View Component
function EnrollmentsView({ enrollments }: { enrollments: EnrollmentHistoryEntry[] }) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        title="No enrollment history"
        message="This student has no enrollment history recorded."
        icon="none"
      />
    )
  }

  return (
    <div className="space-y-3">
      {enrollments.map((enrollment, idx) => (
        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <p className="font-medium text-on-surface">
              {enrollment.course_name || 'Unknown Course'}
            </p>
            <p className="text-sm text-slate-500">
              {enrollment.group_name || 'Unknown Group'} • Level {enrollment.level_number}
            </p>
            {enrollment.previous_group_id && (
              <p className="text-xs text-slate-400">
                Transferred from group {enrollment.previous_group_id}
              </p>
            )}
          </div>
          <div className="text-end">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              enrollment.action === 'enrolled'
                ? 'bg-green-100 text-green-700'
                : enrollment.action === 'transferred'
                ? 'bg-blue-100 text-blue-700'
                : enrollment.action === 'dropped'
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {enrollment.action}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {enrollment.action_date
                ? new Date(enrollment.action_date).toLocaleDateString()
                : 'Date unknown'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Summary View Component
function SummaryView({ summary }: { summary: ActivitySummaryItem[] }) {
  if (summary.length === 0) {
    return (
      <EmptyState
        title="No activity summary"
        message="No activity data available for the selected period."
        icon="none"
      />
    )
  }

  const total = summary.reduce((acc, item) => acc + item.count, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((item) => (
          <div key={item.activity_type} className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-500 capitalize">
              {item.activity_type.replace('_', ' ')}
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">
              {item.count}
            </p>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
              <div
                className="bg-secondary h-1.5 rounded-full"
                style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
