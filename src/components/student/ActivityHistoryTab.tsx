// Activity History Tab Component
// Displays student activity timeline, enrollment history, and status changes

import { useState } from 'react'
import { Clock, Calendar, User, BookOpen, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { EmptyState } from '../common/EmptyState'
import { useActivityHistory, useActivitySummary, useEnrollmentHistory } from '../../hooks/useStudentActivity'
import type { ActivityLogResponseDTO, ActivitySummaryItem } from '../../api/crm'

type TabType = 'timeline' | 'enrollments' | 'summary'

interface ActivityHistoryTabProps {
  studentId: number
}

export function ActivityHistoryTab({ studentId }: ActivityHistoryTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline')
  const [dateFilter, setDateFilter] = useState<{ from?: string; to?: string }>({})

  const { data: history, isLoading: loadingHistory } = useActivityHistory(studentId, {
    date_from: dateFilter.from,
    date_to: dateFilter.to,
    limit: 50,
    enabled: activeTab === 'timeline',
  })

  const { data: summary, isLoading: loadingSummary } = useActivitySummary(
    studentId,
    { date_from: dateFilter.from, date_to: dateFilter.to },
    activeTab === 'summary'
  )

  const { data: enrollments, isLoading: loadingEnrollments } = useEnrollmentHistory(
    studentId,
    20,
    activeTab === 'enrollments'
  )

  const isLoading = loadingHistory || loadingSummary || loadingEnrollments

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFilter.from || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, from: e.target.value }))}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
            placeholder="From"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateFilter.to || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, to: e.target.value }))}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg"
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
          {activeTab === 'timeline' && <TimelineView history={history || []} />}
          {activeTab === 'enrollments' && <EnrollmentsView enrollments={enrollments || []} />}
          {activeTab === 'summary' && <SummaryView summary={summary || []} />}
        </>
      )}
    </div>
  )
}

// Timeline View Component
function TimelineView({ history }: { history: ActivityLogResponseDTO[] }) {
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
          <div className="space-y-3 ml-7">
            {items.map((item, idx) => (
              <TimelineItem key={idx} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Single Timeline Item
function TimelineItem({ item }: { item: ActivityLogResponseDTO }) {
  const getIcon = () => {
    switch (item.activity_type) {
      case 'enrollment':
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
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface capitalize">
            {item.activity_type.replace(/_/g, ' ')}
          </span>
          {item.activity_subtype && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
              {item.activity_subtype}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-slate-600 mt-1">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          <span>{new Date(item.created_at).toLocaleTimeString()}</span>
          {item.performed_by_name && <span>by {item.performed_by_name}</span>}
        </div>
      </div>
    </div>
  )
}

// Enrollments View Component
function EnrollmentsView({ enrollments }: { enrollments: any[] }) {
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
              {enrollment.group_name || 'Unknown Group'}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              enrollment.status === 'active'
                ? 'bg-green-100 text-green-700'
                : enrollment.status === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {enrollment.status}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {enrollment.enrolled_date
                ? new Date(enrollment.enrolled_date).toLocaleDateString()
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
