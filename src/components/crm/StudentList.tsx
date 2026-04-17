import { useNavigate } from 'react-router-dom'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import type { StudentListItem } from '../../api/crm'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import { DataTableContainer } from '../common/DataTableContainer'

interface StudentListProps {
  students: StudentListItem[]
  isLoading?: boolean
  emptyMessage?: string
  onEdit?: (student: StudentListItem) => void
  onDelete?: (student: StudentListItem) => void
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
    <DataTableContainer>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-32">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr
              key={student.id}
              className="group/row hover:bg-slate-50/50 transition-colors"
            >
              <td 
                className="px-6 py-4 font-semibold text-on-surface cursor-pointer"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                {student.full_name}
              </td>
              <td className="px-6 py-4 text-slate-500">{student.phone || '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  student.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : student.status === 'waiting'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {student.status === 'active' ? 'check_circle' : student.status === 'waiting' ? 'schedule' : 'cancel'}
                  </span>
                  {student.status === 'active' ? 'Active' : student.status === 'waiting' ? 'Waiting' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/students/${student.id}`)
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
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
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    </DataTableContainer>
  )
}

export default StudentList
