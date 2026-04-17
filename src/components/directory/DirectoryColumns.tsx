import type { DataTableColumn } from '../common/datatable'
import type { StudentListItem, ParentListItem } from '../../api/crm'

export const studentColumns: DataTableColumn<StudentListItem>[] = [
  {
    key: 'full_name',
    header: 'Name',
    cell: (student) => <span className="font-semibold text-slate-900">{student.full_name}</span>
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (student) => <span className="text-slate-600">{student.phone || '-'}</span>
  },
  {
    key: 'status',
    header: 'Status',
    cell: (student) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
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
    )
  },
]

export const parentColumns: DataTableColumn<ParentListItem>[] = [
  {
    key: 'full_name',
    header: 'Name',
    cell: (parent) => <span className="font-semibold text-slate-900">{parent.full_name}</span>
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (parent) => <span className="text-slate-600">{parent.phone_primary || '-'}</span>
  }
]
