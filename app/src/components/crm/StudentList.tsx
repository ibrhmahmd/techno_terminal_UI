import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Eye } from 'lucide-react'
import type { Student } from '../../api/crm'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'

interface StudentListProps {
  students: Student[]
  isLoading?: boolean
  emptyMessage?: string
  onEdit?: (student: Student) => void
  onDelete?: (student: Student) => void
}

export function StudentList({ 
  students, 
  isLoading, 
  emptyMessage = 'No students found',
  onEdit,
  onDelete
}: StudentListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return <LoadingState message="Loading students..." fullHeight />
  }

  if (students.length === 0) {
    return (
      <EmptyState
        title="No students found"
        message={emptyMessage}
        icon="search"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Current Group</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr
              key={student.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td 
                className="px-4 py-3 font-semibold text-on-surface cursor-pointer"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                {student.full_name}
              </td>
              <td className="px-4 py-3 text-slate-500">{student.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-500">
                {student.current_group_name ? (
                  <span 
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => student.current_group_id && navigate(`/groups/${student.current_group_id}`)}
                  >
                    <span className="material-symbols-outlined text-sm">group</span>
                    {student.current_group_name}
                  </span>
                ) : (
                  <span className="text-slate-400 text-xs">Not enrolled</span>
                )}
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  student.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {student.is_active ? 'check_circle' : 'cancel'}
                  </span>
                  {student.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{student.notes || '-'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/students/${student.id}`)
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                    aria-label={`View details for ${student.full_name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(student)
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="Edit Student"
                      aria-label={`Edit ${student.full_name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(student)
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete Student"
                      aria-label={`Delete ${student.full_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StudentList
