import { FileText, GraduationCap, Users, MapPin, User, School, Clock, CheckCircle2, XCircle, AlertCircle, Calendar } from 'lucide-react'
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
                <p className="text-xs text-slate-500 uppercase tracking-wide">School</p>
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
                <p className="text-xs text-amber-700 uppercase tracking-wide">Waiting List</p>
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
            title="Current Enrollment"
            subtitle={`Level ${details.current_enrollment.level_number}`}
            icon={<GraduationCap className="w-5 h-5" />}
            variant="hero"
            status="active"
            details={[
              { label: 'Group', value: details.current_enrollment.group_name, icon: <Users className="w-3 h-3" />, link: `/groups/${details.current_enrollment.group_id}` },
              { label: 'Course', value: details.current_enrollment.course_name, icon: <MapPin className="w-3 h-3" />, link: `/courses/${details.current_enrollment.course_id}` },
              { label: 'Instructor', value: details.current_enrollment.instructor_name && details.current_enrollment.instructor_name !== 'null' ? details.current_enrollment.instructor_name : 'Not assigned', icon: <User className="w-3 h-3" /> },
              ...(details.last_session_attended ? [{ label: 'Last Session', value: new Date(details.last_session_attended).toLocaleDateString(), icon: <Calendar className="w-3 h-3" /> }] : [])
            ]}
          />
        )}

        {/* Notes */}
        {student.notes && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" />
              Notes
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
            title="Attendance Summary"
            icon={<CheckCircle2 className="w-5 h-5" />}
            status="neutral"
            details={[
              { label: 'Present', value: String(details.attendance_stats.attended || 0), icon: <CheckCircle2 className="w-3 h-3 text-green-500" /> },
              { label: 'Absent', value: String(details.attendance_stats.absent || 0), icon: <XCircle className="w-3 h-3 text-red-500" /> },
              { label: 'Late', value: String(details.attendance_stats.late || 0), icon: <AlertCircle className="w-3 h-3 text-amber-500" /> }
            ]}
          />
        )}

        {/* Balance */}
        <MetricSummaryCard
          label="Balance"
          value={balance?.net_balance || 0}
          currency="EGP"
          status={balance && balance.net_balance < 0 ? 'negative' : balance && balance.net_balance > 0 ? 'positive' : 'neutral'}
          statusLabel={balance && balance.net_balance < 0 ? 'Due' : balance && balance.net_balance > 0 ? 'Credit' : undefined}
          breakdown={balance ? [
            { label: 'Paid', value: balance.total_paid.toLocaleString(), status: 'positive' },
            { label: 'Due', value: balance.total_amount_due.toLocaleString(), status: 'neutral' }
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
