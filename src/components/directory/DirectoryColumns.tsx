import type { DataTableColumn } from '../common/datatable'
import type { Student, Parent } from '../../api/crm'

export const studentColumns: DataTableColumn<Student>[] = [
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
    key: 'current_group',
    header: 'Current Group',
    cell: (student) => (
      student.current_group_name ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">group</span>
          {student.current_group_name}
        </span>
      ) : (
        <span className="text-slate-400 text-xs">Not enrolled</span>
      )
    )
  },
  {
    key: 'status',
    header: 'Status',
    cell: (student) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        student.is_active
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="material-symbols-outlined text-sm">
          {student.is_active ? 'check_circle' : 'cancel'}
        </span>
        {student.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    key: 'notes',
    header: 'Notes',
    cell: (student) => <span className="text-slate-600 max-w-xs truncate">{student.notes || '-'}</span>
  }
]

export const parentColumns: DataTableColumn<Parent>[] = [
  {
    key: 'full_name',
    header: 'Name',
    cell: (parent) => <span className="font-semibold text-slate-900">{parent.full_name}</span>
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (parent) => <span className="text-slate-600">{parent.phone_primary || '-'}</span>
  },
  {
    key: 'email',
    header: 'Email',
    cell: (parent) => <span className="text-slate-600">{parent.email || '-'}</span>
  },
  {
    key: 'relation',
    header: 'Relation',
    cell: (parent) => <span className="text-slate-600">{parent.relation || '-'}</span>
  },
  {
    key: 'status',
    header: 'Status',
    cell: (parent) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        parent.is_active
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="material-symbols-outlined text-sm">
          {parent.is_active ? 'check_circle' : 'cancel'}
        </span>
        {parent.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  }
]
