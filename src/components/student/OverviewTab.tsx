import { FileText, GraduationCap, Users, MapPin, User } from 'lucide-react'
import type { Student, StudentBalance, SiblingInfo, ParentInfo, StudentWithDetails } from '../../api/crm/students/'
import { EntityDetailCard, MetricSummaryCard, FamilyCard } from '../common'

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
              { label: 'Instructor', value: details.current_enrollment.instructor_name || '-', icon: <User className="w-3 h-3" /> }
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
