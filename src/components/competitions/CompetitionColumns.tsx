import { type DataTableColumn } from '../common'
import type { Competition } from '../../api/competitions'
import { formatDate } from '../../utils/formatting'

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
    cell: (row) => row.location ?? '—',
  },
  {
    key: 'competition_date',
    header: 'Date',
    cell: (row) =>
      row.competition_date
        ? formatDate(row.competition_date)
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
]
