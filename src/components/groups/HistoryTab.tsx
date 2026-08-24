import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  DataTable,
  type DataTableColumn,
  PillSelector,
  LoadingState,
  ErrorState,
  EmptyState,
} from '../common'
import { MetricsStripCards } from '../common/MetricsStripCards'
import { useGroupHistory } from '../../hooks/useGroupHistory'
import { formatDate } from '../../utils/formatting'
import type { EnrollmentHistoryItem, InstructorHistoryItem } from '../../api/academics/groups/newEndpoints'

interface HistoryTabProps {
  groupId: number
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-blue-100 text-blue-800',
    dropped: 'bg-red-100 text-red-800',
    transferred: 'bg-amber-100 text-amber-800',
  }[status] || 'bg-slate-100 text-slate-800'

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(amount)
}

export function HistoryTab({ groupId }: HistoryTabProps) {
  const { t } = useTranslation('groups')
  const {
    enrollmentHistory,
    instructorHistory,
    isLoadingEnrollments,
    isLoadingInstructors,
    enrollmentError,
    instructorError
  } = useGroupHistory(groupId)

  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all')

  const filteredEnrollments = useMemo(() => {
    if (!enrollmentHistory?.enrollments) return []
    if (enrollmentStatusFilter === 'all') return enrollmentHistory.enrollments
    return enrollmentHistory.enrollments.filter(e => e.status === enrollmentStatusFilter)
  }, [enrollmentHistory, enrollmentStatusFilter])

  const enrollmentColumns: DataTableColumn<EnrollmentHistoryItem>[] = [
    {
      key: 'student_name' as const,
      header: t('historyTab.student'),
      cell: (student) => (
        <div>
          <Link to={`/students/${student.student_id}`} className="font-medium text-secondary hover:underline">
            {student.student_name}
          </Link>
          {student.student_phone && (
            <div className="text-xs text-slate-500">{student.student_phone}</div>
          )}
        </div>
      )
    },
    {
      key: 'level_number_at_enrollment' as const,
      header: t('historyTab.level_enrolled'),
      cell: (row) => `Level ${row.level_number_at_enrollment}`
    },
    {
      key: 'enrolled_at' as const,
      header: t('historyTab.enrolled_at'),
      cell: (row) => row.enrolled_at ? formatDate(row.enrolled_at) : '—'
    },
    {
      key: 'status' as const,
      header: t('historyTab.status'),
      cell: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'balance_remaining' as const,
      header: t('historyTab.balance'),
      cell: (row) => {
        const balance = row.balance_remaining
        return (
          <span className={`font-medium ${balance > 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {formatCurrency(balance)}
          </span>
        )
      }
    }
  ]

  const isLoading = isLoadingEnrollments || isLoadingInstructors
  const error = enrollmentError || instructorError

  if (isLoading) return <LoadingState message={t('historyTab.loading')} />
  if (error) return <ErrorState message={error} />
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Enrollment History Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-headline font-semibold text-slate-800">{t('historyTab.enrollment_history')}</h3>
        </div>

        {enrollmentHistory && (
          <MetricsStripCards
            items={[
              { label: t('historyTab.total_enrollments'), value: String(enrollmentHistory.total_enrollments), icon: 'groups', color: 'secondary' },
              { label: t('historyTab.active'), value: String(enrollmentHistory.active_enrollments), icon: 'check_circle', color: 'emerald' },
              { label: t('historyTab.completed'), value: String(enrollmentHistory.completed_enrollments), icon: 'workspace_premium', color: 'blue' },
              { label: t('historyTab.dropped_transferred'), value: String(enrollmentHistory.dropped_enrollments), icon: 'cancel', color: 'amber' },
            ]}
          />
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <PillSelector
              options={[
                { value: 'all', label: t('historyTab.all_enrollments') },
                { value: 'active', label: t('historyTab.active') },
                { value: 'completed', label: t('historyTab.completed') },
                { value: 'dropped', label: t('historyTab.dropped') },
                { value: 'transferred', label: t('historyTab.transferred') },
              ]}
              value={enrollmentStatusFilter}
              onChange={setEnrollmentStatusFilter}
            />
          </div>
          
          {filteredEnrollments.length > 0 ? (
            <DataTable
              data={filteredEnrollments}
              columns={enrollmentColumns}
              keyExtractor={(row) => row.enrollment_id.toString()}
            />
          ) : (
            <EmptyState
              icon="history"
              title={t('historyTab.no_enrollments')}
              message={enrollmentStatusFilter === 'all' 
                ? t('historyTab.no_enrollments_desc')
                : t('historyTab.no_enrollments_filtered', { status: enrollmentStatusFilter })}
            />
          )}
        </div>
      </section>

      {/* Instructor History Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-headline font-semibold text-slate-800">{t('historyTab.instructor_history')}</h3>
        
        {instructorHistory?.instructors && instructorHistory.instructors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {instructorHistory.instructors.map((instructor: InstructorHistoryItem) => (
              <div key={instructor.instructor_id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
                {instructor.is_current && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg">
                    {t('historyTab.current')}
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium
                    ${instructor.is_current ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    <span className="material-symbols-outlined" aria-hidden="true">school</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{instructor.instructor_name}</h4>
                    <p className="text-sm text-slate-500">{t('historyTab.levels_taught', { count: instructor.levels_taught_count, plural: instructor.levels_taught_count !== 1 ? 's' : '' })}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('historyTab.first_assigned')}</span>
                    <span className="font-medium">{formatDate(instructor.first_assigned_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t('historyTab.last_assigned')}</span>
                    <span className="font-medium">{instructor.is_current ? t('historyTab.present') : formatDate(instructor.last_assigned_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="school"
            title={t('historyTab.no_instructor_history')}
            message={t('historyTab.no_instructor_history_desc')}
          />
        )}
      </section>
    </div>
  )
}
