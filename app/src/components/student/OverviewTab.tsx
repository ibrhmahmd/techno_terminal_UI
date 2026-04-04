import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Calendar, Users, Wallet, FileText } from 'lucide-react'
import type { StudentWithDetails, Parent } from '../../api/crm'

interface OverviewTabProps {
  student: StudentWithDetails
  onLinkParent?: () => void
}

export function OverviewTab({ student, onLinkParent }: OverviewTabProps) {
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
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                student.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {student.is_active ? 'Active' : 'Inactive'}
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
          {student.current_group_name ? (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{student.current_group_name}</p>
                  {student.current_group_id && (
                    <button
                      onClick={() => navigate(`/groups/${student.current_group_id}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline mt-1"
                    >
                      View Group Details →
                    </button>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-lg">
              <p className="text-slate-500">Not currently enrolled in any group</p>
            </div>
          )}
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
            <p className={`text-4xl font-bold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {student.balance} EGP
            </p>
            <p className="text-sm text-slate-500 mt-2">
              {student.balance > 0 ? 'Outstanding balance' : 'No balance due'}
            </p>
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
          
          {student.parents?.length === 0 ? (
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
              {student.parents?.map((parent: Parent) => (
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
      </div>
    </div>
  )
}

export default OverviewTab
