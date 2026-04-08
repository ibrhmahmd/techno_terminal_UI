import type { Course, CourseStats } from '../../api/academics'

interface CourseInfoCardProps {
  course: Course
  stats?: CourseStats | null
  onEdit: () => void
  onDelete: () => void
}

export function CourseInfoCard({ course, stats, onEdit, onDelete }: CourseInfoCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{course.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                course.is_active 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {course.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            {course.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-secondary/10 text-secondary rounded-lg">
                <span className="material-symbols-outlined text-xs">folder</span>
                {course.category}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 border-b border-slate-200">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <p className="text-2xl font-bold text-slate-900">{stats.total_groups}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total Groups</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats.active_groups}</p>
            <p className="text-xs text-green-600 uppercase tracking-wide mt-1">Active Groups</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{stats.total_students_ever}</p>
            <p className="text-xs text-blue-600 uppercase tracking-wide mt-1">Total Students</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{stats.active_students}</p>
            <p className="text-xs text-purple-600 uppercase tracking-wide mt-1">Active Students</p>
          </div>
        </div>
      )}

      {/* Course Details */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Price Per Level</p>
            <p className="text-lg font-semibold text-slate-900">
              {course.price_per_level?.toLocaleString() ?? '0'} EGP
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Sessions Per Level</p>
            <p className="text-lg font-semibold text-slate-900">
              {course.sessions_per_level} sessions
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Course ID</p>
            <p className="text-lg font-semibold text-slate-900">#{course.id}</p>
          </div>
        </div>
        
        {course.description && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
