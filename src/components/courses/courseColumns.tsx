import type { DataTableColumn } from '../common'
import type { Course } from '../../api/academics'

export const courseColumns: DataTableColumn<Course>[] = [
  {
    key: 'name',
    header: 'Course Name',
    sortable: true,
    cell: (course) => <span className="font-semibold text-slate-900">{course.name}</span>
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    cell: (course) => (
      <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
        {course.category || 'Uncategorized'}
      </span>
    )
  },
  {
    key: 'price_per_level',
    header: 'Price/Level',
    sortable: true,
    align: 'center',
    cell: (course) => (
      <span className="text-sm font-medium text-slate-700">
        {course.price_per_level?.toLocaleString() ?? '0'} EGP
      </span>
    )
  },
  {
    key: 'sessions_per_level',
    header: 'Sessions/Level',
    sortable: true,
    align: 'center',
    cell: (course) => (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
        <span className="material-symbols-outlined text-xs">schedule</span>
        {course.sessions_per_level}
      </span>
    )
  },
  {
    key: 'is_active',
    header: 'Status',
    cell: (course) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
        course.is_active
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {course.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  }
]
