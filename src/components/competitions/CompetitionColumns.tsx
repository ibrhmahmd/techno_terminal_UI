import { type DataTableColumn } from '../common'
import type { Competition } from '../../api/competitions'

export const competitionColumns: DataTableColumn<Competition>[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    cell: (row) => (
      <div>
        <p className="font-medium text-on-surface">{row.name}</p>
        {row.edition && (
          <p className="text-xs text-slate-500">{row.edition}</p>
        )}
      </div>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    cell: (row) => row.location,
  },
  {
    key: 'competition_date',
    header: 'Date',
    cell: (row) =>
      row.competition_date
        ? new Date(row.competition_date).toLocaleDateString()
        : '—',
  },
  {
    key: 'edition',
    header: 'Edition',
    cell: (row) => row.edition || '—',
  },
  {
    key: 'fee_per_student',
    header: 'Fee/Student',
    align: 'center',
    cell: (row) => `${row.fee_per_student.toLocaleString()} EGP`,
  },
  {
    key: 'deleted_at',
    header: 'Status',
    cell: (row) =>
      row.deleted_at ? (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
          Deleted
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
          Active
        </span>
      ),
  },
]
