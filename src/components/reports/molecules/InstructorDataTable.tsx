import type { InstructorPerformanceDTO } from '../../../api/analytics'

interface InstructorDataTableProps {
  instructors: InstructorPerformanceDTO[]
  isLoading?: boolean
  error?: string
}

export function InstructorDataTable({ instructors, isLoading, error }: InstructorDataTableProps) {
  if (isLoading) {
    return (
      <div className="mt-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Instructor</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Groups</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Students</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(4)].map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="py-3 px-4"><div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div></td>
                <td className="py-3 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto animate-pulse"></div></td>
                <td className="py-3 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-8 mx-auto animate-pulse"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
        Failed to load instructor data: {error}
      </div>
    )
  }

  if (!instructors || instructors.length === 0) {
    return (
      <div className="mt-8 p-8 text-center text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-2">school</span>
        <p>No instructor data available</p>
      </div>
    )
  }

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Instructor</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Groups</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-slate-500">Students</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr key={instructor.instructor_name} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-3 px-4 font-medium text-on-surface">{instructor.instructor_name}</td>
              <td className="py-3 px-4 text-center text-slate-600">{instructor.active_groups}</td>
              <td className="py-3 px-4 text-center text-slate-600">{instructor.active_students}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
