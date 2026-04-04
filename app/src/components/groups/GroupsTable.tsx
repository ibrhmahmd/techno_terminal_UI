import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { EnrichedGroupPublic } from '../../api/academics'

export type SortField = 'name' | 'course_name' | 'instructor_name' | 'max_capacity'
export type SortDirection = 'asc' | 'desc'

const SortIndicator = ({ field, sortField, sortDirection }: { field: SortField, sortField: SortField, sortDirection: SortDirection }) => {
  if (sortField !== field) {
    return <span className="material-symbols-outlined text-slate-300 text-sm">swap_vert</span>
  }
  return (
    <span className="material-symbols-outlined text-secondary text-sm">
      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
    </span>
  )
}

interface GroupsTableProps {
  groups: EnrichedGroupPublic[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
}

export function GroupsTable({ groups, sortField, sortDirection, onSort }: GroupsTableProps) {
  const navigate = useNavigate()

  return (
    <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('name')}>
              <div className="flex items-center gap-1">Group Name<SortIndicator field="name" sortField={sortField} sortDirection={sortDirection} /></div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('course_name')}>
              <div className="flex items-center gap-1">Course<SortIndicator field="course_name" sortField={sortField} sortDirection={sortDirection} /></div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('instructor_name')}>
              <div className="flex items-center gap-1">Instructor<SortIndicator field="instructor_name" sortField={sortField} sortDirection={sortDirection} /></div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                onClick={() => onSort('max_capacity')}>
              <div className="flex items-center gap-1">Capacity<SortIndicator field="max_capacity" sortField={sortField} sortDirection={sortDirection} /></div>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {groups.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">No groups found</td></tr>
          ) : (groups.map((group) => (
            <tr key={group.id} onClick={() => navigate(`/groups/${group.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
              <td className="px-4 py-3 font-semibold text-on-surface">{group.name}</td>
              <td className="px-4 py-3 text-on-surface-variant">{group.course_name}</td>
              <td className="px-4 py-3 text-on-surface-variant">{group.instructor_name || 'Unassigned'}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-on-surface">
                  <span className="material-symbols-outlined text-sm">group</span>{group.max_capacity}
                </span>
              </td>
              <td className="px-4 py-3">
                <button onClick={(e) => { e.stopPropagation(); navigate(`/groups/${group.id}`) }}
                  className="px-3 py-1 text-xs font-medium text-secondary border border-secondary rounded hover:bg-secondary-container transition-colors">View</button>
              </td>
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  )
}
