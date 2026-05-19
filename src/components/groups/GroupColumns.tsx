import type { DataTableColumn } from '../common/datatable'
import type { EnrichedGroupPublic } from '../../api/academics'

// Column configuration for Groups DataTable
export const groupColumns: DataTableColumn<EnrichedGroupPublic>[] = [
  {
    key: 'name',
    header: 'Group Name',
    sortable: true,
    cell: (group) => <span className="font-semibold text-slate-900">{group.name}</span>
  },
  {
    key: 'course_name',
    header: 'Course',
    sortable: true,
    cell: (group) => (
      <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
        {group.course_name}
      </span>
    )
  },
  {
    key: 'instructor_name',
    header: 'Instructor',
    sortable: true,
    cell: (group) => (
      <span className="text-sm text-slate-600 font-medium">
        {group.instructor_name || <span className="text-slate-400 italic">Unassigned</span>}
      </span>
    )
  },
  {
    key: 'schedule',
    header: 'Schedule',
    cell: (group) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-slate-900">{group.schedule?.day ?? '--'}</span>
        <span className="text-[10px] text-slate-500">
          {group.schedule?.start_time?.slice(0, 5) ?? '--:--'} - {group.schedule?.end_time?.slice(0, 5) ?? '--:--'}
        </span>
      </div>
    )
  },
  {
    key: 'capacity',
    header: 'Capacity',
    sortable: true,
    align: 'center',
    cell: (group) => (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
        <span className="material-symbols-outlined text-xs" aria-hidden="true">group</span>
        {group.capacity}
      </span>
    )
  },
  {
    key: 'status',
    header: 'Status',
    cell: (group) => {
      const statusConfig = {
        active: { label: 'Active', className: 'bg-green-100 text-green-700' },
        inactive: { label: 'Inactive', className: 'bg-slate-100 text-slate-600' },
        archived: { label: 'Archived', className: 'bg-amber-100 text-amber-700' },
        completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
      }
      const config = statusConfig[group.status] || statusConfig.inactive
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${config.className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {config.label}
        </span>
      )
    }
  }
]
