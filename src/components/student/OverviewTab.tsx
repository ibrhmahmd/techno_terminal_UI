import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Users, Wallet, FileText, UsersRound } from 'lucide-react'
import type { Student, StudentBalance, SiblingInfo, Parent } from '../../api/crm/students/'
import { getStatusColorClass, getStatusLabel } from '../../api/crm/students/utils'

interface OverviewTabProps {
  student: Student
  balance: StudentBalance | null
  siblings: SiblingInfo[]
  parents: Parent[]
  onLinkParent?: () => void
}

export function OverviewTab({ student, balance, siblings, parents, onLinkParent }: OverviewTabProps) {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Personal Info & Enrollments */}
      <div className="lg:col-span-2 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-500" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500">Full Name</label>
              <p className="font-medium text-on-surface">{student.full_name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Phone</label>
              <p className="font-medium text-on-surface flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                {student.phone || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Date of Birth</label>
              <p className="font-medium text-on-surface flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {student.date_of_birth || '-'}
              </p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Gender</label>
              <p className="font-medium text-on-surface capitalize">{student.gender || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Status</label>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(student.status)}`}>
                {getStatusLabel(student.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Current Enrollment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-500" />
            Current Enrollment
          </h3>
          {/* Current enrollment info would come from enrollments tab or separate fetch */}
          <div className="text-center py-6 bg-slate-50 rounded-lg">
            <p className="text-slate-500">View enrollments in the Enrollments tab</p>
          </div>
        </div>

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

      {/* Right Column: Balance & Parents */}
      <div className="space-y-6">
        {/* Account Balance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-lg text-on-surface mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-slate-500" />
            Account Balance
          </h3>
          <div className="text-center py-4">
            {balance ? (
              <>
                <p className={`text-4xl font-bold ${balance.net_balance < 0 ? 'text-red-600' : balance.net_balance > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                  {Math.abs(balance.net_balance).toLocaleString()} EGP
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  {balance.net_balance < 0 ? 'Outstanding balance' : balance.net_balance > 0 ? 'Credit balance' : 'No balance due'}
                </p>
                {/* Enrollment breakdown summary */}
                {balance.enrollments?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {balance.enrollments.filter(e => e.remaining_balance > 0).slice(0, 3).map(enrollment => (
                      <div key={enrollment.enrollment_id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{enrollment.group_name}</span>
                        <span className="text-red-600">{enrollment.remaining_balance.toLocaleString()} EGP</span>
                      </div>
                    ))}
                    {balance.enrollments.filter(e => e.remaining_balance > 0).length > 3 && (
                      <p className="text-xs text-slate-400">
                        +{balance.enrollments.filter(e => e.remaining_balance > 0).length - 3} more
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-400">Loading balance...</p>
            )}
          </div>
        </div>

        {/* Parents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-on-surface flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-500" />
              Parents
            </h3>
            {onLinkParent && (
              <button
                onClick={onLinkParent}
                className="text-sm text-secondary hover:text-secondary/80 font-medium"
              >
                + Link Parent
              </button>
            )}
          </div>
          
          {parents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No parents linked</p>
              {onLinkParent && (
                <button
                  onClick={onLinkParent}
                  className="mt-2 text-sm text-secondary hover:text-secondary/80"
                >
                  Link a parent
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {parents.map((parent: Parent) => (
                <div
                  key={parent.id}
                  className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => navigate(`/parents/${parent.id}`)}
                >
                  <p className="font-medium text-on-surface">{parent.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    {parent.phone_primary && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {parent.phone_primary}
                      </span>
                    )}
                    {parent.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {parent.email}
                      </span>
                    )}
                  </div>
                  {parent.relation && (
                    <p className="text-xs text-slate-400 mt-1">{parent.relation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Siblings Section */}
        {siblings.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-on-surface flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-slate-500" />
                Siblings
              </h3>
              <span className="text-sm text-slate-500">{siblings.length} sibling(s)</span>
            </div>
            <div className="space-y-3">
              {siblings.map((sibling: SiblingInfo) => (
                <div
                  key={sibling.id}
                  className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => navigate(`/students/${sibling.id}`)}
                >
                  <p className="font-medium text-on-surface">{sibling.full_name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <span>Age {sibling.age}</span>
                    <span>•</span>
                    <span>Same parent: {sibling.parent_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OverviewTab
