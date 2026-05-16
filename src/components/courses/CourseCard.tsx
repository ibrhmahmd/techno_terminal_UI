import type { Course } from '../../api/academics'
import { RowActions } from '../common/RowActions'
import { CardSkeleton } from '../directory/shared/CardSkeleton'

interface CourseCardActions {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export interface CourseCardProps {
  course: Course
  actions: CourseCardActions
  loading?: boolean
}

const categoryColors: Record<string, string> = {
  software: 'bg-blue-100 text-blue-700',
  hardware: 'bg-purple-100 text-purple-700',
  steam: 'bg-green-100 text-green-700',
  other: 'bg-slate-100 text-slate-600',
}

export function CourseCard({ course, actions, loading = false }: CourseCardProps) {
  if (loading) return <CardSkeleton />

  const catColor = categoryColors[course.category?.toLowerCase() ?? ''] ?? categoryColors.other

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface text-base truncate">
            {course.name}
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium mt-1 ${catColor}`}>
            {course.category || 'Uncategorised'}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
          course.is_active
            ? 'bg-green-100 text-green-700'
            : 'bg-slate-100 text-slate-600'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {course.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">payments</span>
          {course.price_per_level?.toLocaleString() ?? '0'} EGP / level
        </span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          {course.sessions_per_level} sessions / level
        </span>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            ...(actions.onView ? [{ icon: 'visibility' as const, label: 'View' as const, onClick: () => actions.onView!(), variant: 'primary' as const }] : []),
            ...(actions.onEdit ? [{ icon: 'edit' as const, label: 'Edit' as const, onClick: () => actions.onEdit!() }] : []),
            ...(actions.onDelete ? [{ icon: 'delete' as const, label: 'Delete' as const, onClick: () => actions.onDelete!(), variant: 'danger' as const }] : []),
          ]}
        />
      </div>
    </div>
  )
}
