import React from 'react'
import type { EnrichedGroupPublic } from '../../api/academics'
import type { SortField, SortDirection } from '../../hooks/useGroups'

interface GroupsTableProps {
  groups: EnrichedGroupPublic[]
  sortField: SortField
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onView: (id: number) => void
  onEdit: (group: EnrichedGroupPublic) => void
  onDelete: (id: number) => void
}

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

export function GroupsTable({ 
  groups, 
  sortField, 
  sortDirection, 
  onSort, 
  onView, 
  onEdit, 
  onDelete 
}: GroupsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left" aria-label="Groups Table">
          <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer group select-none"
                  onClick={() => onSort('name')}>
                <div className="flex items-center gap-2">
                  <span>Group Name</span>
                  <SortIndicator field="name" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer group select-none"
                  onClick={() => onSort('course_name')}>
                <div className="flex items-center gap-2">
                  <span>Course</span>
                  <SortIndicator field="course_name" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer group select-none"
                  onClick={() => onSort('instructor_name')}>
                <div className="flex items-center gap-2">
                  <span>Instructor</span>
                  <SortIndicator field="instructor_name" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Schedule</span>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer group select-none"
                  onClick={() => onSort('max_capacity')}>
                <div className="flex items-center gap-2">
                  <span>Capacity</span>
                  <SortIndicator field="max_capacity" sortField={sortField} sortDirection={sortDirection} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                <span>Status</span>
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {groups.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-slate-200">group_off</span>
                    <p className="text-slate-500">No groups matched your selection</p>
                  </div>
                </td>
              </tr>
            ) : (groups.map((group) => (
              <tr 
                key={group.id} 
                className="group/row hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => onView(group.id)}
              >
                <td className="px-6 py-4 font-semibold text-slate-900">{group.name}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
                    {group.course_name}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                  {group.instructor_name || <span className="text-slate-400 italic">Unassigned</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-slate-900">{group.default_day}</span>
                    <span className="text-[10px] text-slate-500">{group.default_time_start.slice(0, 5)} - {group.default_time_end.slice(0, 5)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                    <span className="material-symbols-outlined text-xs">group</span>
                    {group.max_capacity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    group.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {group.is_active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onView(group.id)}
                      title="View Details"
                      aria-label={`View group ${group.name} details`}
                      className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-secondary-container transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                    <button 
                      onClick={() => onEdit(group)}
                      title="Edit Group"
                      aria-label={`Edit group ${group.name}`}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(group.id)}
                      title="Delete (Archive)"
                      aria-label={`Delete group ${group.name}`}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all text-destructive"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
