import { useNavigate } from 'react-router-dom'
import { UserPlus, UserMinus } from 'lucide-react'
import type { Student } from '../../api/crm'
import { EmptyState } from '../common/EmptyState'

interface RosterTabProps {
  students: Student[]
  maxCapacity?: number
  onEnrollStudent?: () => void
  onRemoveStudent?: (studentId: number) => void
  isLoading?: boolean
}

export function RosterTab({ 
  students, 
  maxCapacity, 
  onEnrollStudent, 
  onRemoveStudent,
  isLoading 
}: RosterTabProps) {
  const navigate = useNavigate()
  const capacityPercent = maxCapacity ? (students.length / maxCapacity) * 100 : 0

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading roster...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Group Roster</h2>
          <p className="text-sm text-slate-500 mt-1">
            {students.length} {students.length === 1 ? 'student' : 'students'} enrolled
            {maxCapacity && ` of ${maxCapacity} capacity`}
          </p>
        </div>
        {onEnrollStudent && (
          <button
            onClick={onEnrollStudent}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Enroll Student
          </button>
        )}
      </div>

      {/* Capacity Bar */}
      {maxCapacity && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-on-surface">Capacity</span>
            <span className={`text-sm font-medium ${
              capacityPercent >= 100 ? 'text-red-600' :
              capacityPercent >= 80 ? 'text-amber-600' :
              'text-green-600'
            }`}>
              {students.length} / {maxCapacity}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                capacityPercent >= 100 ? 'bg-red-500' :
                capacityPercent >= 80 ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <EmptyState
            title="No students enrolled"
            message="This group currently has no students enrolled."
            actionLabel={onEnrollStudent ? "Enroll Student" : undefined}
            onAction={onEnrollStudent || undefined}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student) => (
              <div 
                key={student.id} 
                className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {student.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">{student.full_name}</p>
                    <p className="text-sm text-slate-500">{student.phone || 'No phone'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {student.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {onRemoveStudent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRemoveStudent(student.id)
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from group"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RosterTab
