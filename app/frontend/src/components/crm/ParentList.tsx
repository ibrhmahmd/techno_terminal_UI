import { useNavigate } from 'react-router-dom'
import type { Parent } from '../../api/crm'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface ParentListProps {
  parents: Parent[]
  isLoading?: boolean
  emptyMessage?: string
}

export function ParentList({ parents, isLoading, emptyMessage = 'No parents found' }: ParentListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (parents.length === 0) {
    return (
      <div className="p-12 text-center text-slate-500">
        <span className="material-symbols-outlined text-4xl mb-3 opacity-50">family_restroom</span>
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
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parents.map((parent) => (
            <tr
              key={parent.id}
              onClick={() => navigate(`/parents/${parent.id}`)}
              className="hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3 font-semibold text-on-surface">{parent.full_name}</td>
              <td className="px-4 py-3 text-slate-500">{parent.phone || '-'}</td>
              <td className="px-4 py-3 text-slate-500">{parent.email || '-'}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  parent.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {parent.is_active ? 'check_circle' : 'cancel'}
                  </span>
                  {parent.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/parents/${parent.id}`)
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
