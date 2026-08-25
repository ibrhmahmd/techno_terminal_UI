import { FileText, GraduationCap, Users, MapPin, User, School, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Student, StudentBalance, SiblingInfo, ParentInfo, StudentWithDetails } from '../../api/crm/students/'
import { EntityDetailCard, MetricSummaryCard, FamilyCard, StatusDataCard } from '../common'

interface OverviewTabProps {
  student: Student
  details?: StudentWithDetails | null
  balance: StudentBalance | null
  siblings: SiblingInfo[]
  primaryParent?: ParentInfo | null
  onLinkParent?: () => void
}

export function OverviewTab({ student, details, balance, siblings, primaryParent, onLinkParent }: OverviewTabProps) {
  const { t } = useTranslation('common')
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* School Info */}
        {details?.school_name && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <School className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">{t('overviewTab.school')}</p>
                <p className="font-medium text-on-surface">{details.school_name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Waiting List Info */}
        {student.status === 'waiting' && details?.waiting_since && (
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="text-xs text-amber-700 uppercase tracking-wide">{t('overviewTab.waiting_list')}</p>
                <p className="font-medium text-amber-900">
                  Since {new Date(details.waiting_since).toLocaleDateString()}
                  {details.waiting_priority && ` • Priority #${details.waiting_priority}`}
                </p>
                {details.waiting_notes && (
                  <p className="text-sm text-amber-700 mt-1">{details.waiting_notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Current Enrollment */}
        {details?.current_enrollment && (
          <EntityDetailCard
            title={t('overviewTab.current_enrollment')}
            subtitle={t('overviewTab.level', { number: details.current_enrollment.level_number })}
            icon={<GraduationCap className="w-5 h-5" />}
            variant="hero"
            status="active"
            details={[
              { label: t('overviewTab.group'), value: details.current_enrollment.group_name, icon: <Users className="w-3 h-3" />, link: `/groups/${details.current_enrollment.group_id}` },
              { label: t('overviewTab.course'), value: details.current_enrollment.course_name, icon: <MapPin className="w-3 h-3" />, link: `/courses/${details.current_enrollment.course_id}` },
              { label: t('overviewTab.instructor'), value: details.current_enrollment.instructor_name && details.current_enrollment.instructor_name !== 'null' ? details.current_enrollment.instructor_name : t('overviewTab.not_assigned'), icon: <User className="w-3 h-3" /> },
              ...(details.last_session_attended ? [{ label: t('overviewTab.last_session'), value: new Date(details.last_session_attended).toLocaleDateString(), icon: <Calendar className="w-3 h-3" /> }] : [])
            ]}
          />
        )}

        {/* Notes */}
        {student.notes && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              {t('overviewTab.notes')}
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{student.notes}</p>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        {/* Attendance Summary */}
        {details?.attendance_stats && (
          <StatusDataCard
            title={t('overviewTab.attendance_summary')}
            icon={<CheckCircle2 className="w-5 h-5" />}
            status="neutral"
            details={[
              { label: t('overviewTab.present'), value: String(details.attendance_stats.attended || 0), icon: <CheckCircle2 className="w-3 h-3 text-green-500" /> },
              { label: t('overviewTab.absent'), value: String(details.attendance_stats.absent || 0), icon: <XCircle className="w-3 h-3 text-red-500" /> },
              { label: t('overviewTab.late'), value: String(details.attendance_stats.late || 0), icon: <AlertCircle className="w-3 h-3 text-amber-500" /> }
            ]}
          />
        )}

        {/* Balance */}
        <MetricSummaryCard
          label={t('overviewTab.balance')}
          value={balance?.net_balance || 0}
          currency="EGP"
          status={balance && balance.net_balance < 0 ? 'negative' : balance && balance.net_balance > 0 ? 'positive' : 'neutral'}
          statusLabel={balance && balance.net_balance < 0 ? t('overviewTab.due') : balance && balance.net_balance > 0 ? t('overviewTab.credit') : undefined}
          breakdown={balance ? [
            { label: t('overviewTab.paid'), value: balance.total_paid.toLocaleString(), status: 'positive' },
            { label: t('overviewTab.due'), value: balance.total_amount_due.toLocaleString(), status: 'neutral' }
          ] : undefined}
        />

        {/* Family Card - Parent + Siblings */}
        <FamilyCard
          parent={primaryParent ? {
            name: primaryParent.full_name,
            phone: primaryParent.phone || undefined,
            email: primaryParent.email || undefined,
            relationship: primaryParent.relationship || undefined
          } : null}
          siblings={siblings.map(s => ({
            id: s.id,
            name: s.full_name,
            age: s.age,
            link: `/students/${s.id}`
          }))}
          onLinkParent={onLinkParent}
        />
      </div>
    </div>
  )
}

export default OverviewTab
