import { useNavigate } from 'react-router-dom'
import { Edit2, Trash2, Eye } from 'lucide-react'
import type { Parent } from '../../api/crm'
import { LoadingState } from '../common/LoadingState'
import { EmptyState } from '../common/EmptyState'
import { DataTableContainer } from '../common/DataTableContainer'

interface ParentListProps {
  parents: Parent[]
  isLoading?: boolean
  emptyMessage?: string
  onEdit?: (parent: Parent) => void
  onDelete?: (parent: Parent) => void
}

export function ParentList({ 
  parents, 
  isLoading, 
  emptyMessage = 'No parents found',
  onEdit,
  onDelete
}: ParentListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return <LoadingState message="Loading parents..." fullHeight />
  }

  if (parents.length === 0) {
    return (
      <EmptyState
        title="No parents found"
        message={emptyMessage}
        icon="search"
      />
    )
  }

  return (
    <DataTableContainer>
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Relation</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500 w-32">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {parents.map((parent) => (
            <tr
              key={parent.id}
              className="group/row hover:bg-slate-50/50 transition-colors"
            >
              <td 
                className="px-6 py-4 font-semibold text-on-surface cursor-pointer"
                onClick={() => navigate(`/parents/${parent.id}`)}
              >
                {parent.full_name}
              </td>
              <td className="px-6 py-4 text-slate-500">{parent.phone_primary || '-'}</td>
              <td className="px-6 py-4 text-slate-500">{parent.email || '-'}</td>
              <td className="px-6 py-4 text-slate-500">{parent.relation || '-'}</td>
              <td className="px-6 py-4">
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
              <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/parents/${parent.id}`)
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                    aria-label={`View details for ${parent.full_name}`}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(parent)
                      }}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit Parent"
                      aria-label={`Edit ${parent.full_name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(parent)
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Parent"
                      aria-label={`Delete ${parent.full_name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableContainer>
  )
}
