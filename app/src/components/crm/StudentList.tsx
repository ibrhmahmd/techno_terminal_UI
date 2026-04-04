import { useNavigate } from 'react-router-dom'
import type { Student } from '../../api/crm'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { memo } from 'react'

interface StudentListProps {
  students: Student[]
  isLoading?: boolean
  emptyMessage?: string
}

function StudentListComponent({ students, isLoading, emptyMessage = 'No students found' }: StudentListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-3 opacity-50">school</span>
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gender</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {students.map((student) => (
            <tr
              key={student.id}
              onClick={() => navigate(`/students/${student.id}`)}
              className="hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 font-semibold text-on-surface">{student.full_name}</td>
              <td className="px-4 py-3 text-slate-500 capitalize">{student.gender || '-'}</td>
              <td className="px-4 py-3 text-slate-500">{student.phone || '-'}</td>
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
              <td className="px-4 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/students/${student.id}`)
                  }}
                  className="px-3 py-1 text-xs font-medium text-secondary border border-secondary rounded hover:bg-secondary-container transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const StudentList = memo(StudentListComponent)
