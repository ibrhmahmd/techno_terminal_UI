import { useState, useMemo } from 'react'
import { useEmployees } from '../../../hooks/useStaff'
import type { EmployeeListItem } from '../../../api/hr'
import { SpyCombobox } from '../SpyCombobox'
import type { SpyCategory } from '../SpyCombobox'
import { getRecentItems, addRecentItem, type RecentItem } from '../../../utils/recentCache'

export interface InstructorComboboxProps {
  value: EmployeeListItem | null
  onChange: (instructor: EmployeeListItem | null) => void
}

export function InstructorCombobox({ value, onChange }: InstructorComboboxProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useEmployees(search, 1, 50)
  const [recentInstructors, setRecentInstructors] = useState<RecentItem[]>(() => getRecentItems('techno_recent_instructors'))

  const categories = useMemo<SpyCategory<EmployeeListItem>[]>(() => {
    const instructorsList = data?.items ?? []
    if (search.length >= 2) {
      const active = instructorsList.filter(i => i.is_active)
      const grouped: Record<string, EmployeeListItem[]> = {}
      active.forEach(i => {
        const key = i.full_name.charAt(0).toUpperCase()
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(i)
      })

      return Object.keys(grouped)
        .sort()
        .map(k => ({
          id: k,
          title: k,
          icon: 'sort_by_alpha',
          items: grouped[k],
        }))
    } else {
      const itemsToShow = search.length === 1
        ? recentInstructors.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
        : recentInstructors

      if (itemsToShow.length === 0) return []

      const mapped = itemsToShow.map(r => {
        const fullInstructor = instructorsList.find(i => String(i.id) === String(r.id))
        return fullInstructor || ({
          id: Number(r.id),
          full_name: r.name,
          job_title: 'Recently Used',
          is_active: true
        } as EmployeeListItem)
      })

      return [{
        id: 'recents',
        title: 'Recently Used',
        isSpecial: true,
        items: mapped
      }]
    }
  }, [data?.items, search, recentInstructors])

  if (value) {
    return (
      <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
        <div>
          <span className="font-medium text-on-surface">{value.full_name}</span>
          <p className="text-xs text-slate-500 mt-0.5">{value.job_title}</p>
        </div>
        <button
          type="button"
          onClick={() => { onChange(null); setSearch('') }}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Change
        </button>
      </div>
    )
  }

  const totalCount = categories.reduce((sum, c) => sum + c.items.length, 0)

  return (
    <SpyCombobox<EmployeeListItem>
      search={search}
      onSearchChange={setSearch}
      placeholder="Search instructor by name..."
      isLoading={isLoading}
      noResultsText={
        search.length === 0
          ? "No recently used instructors. Type to search."
          : search.length === 1
            ? "No matching recently used instructors. Type at least 2 chars to search."
            : `No instructors found matching "${search}"`
      }
      categories={categories}
      totalItemsCount={totalCount}
      onSelect={(instructor) => {
        addRecentItem('techno_recent_instructors', { id: instructor.id, name: instructor.full_name })
        setRecentInstructors(getRecentItems('techno_recent_instructors'))
        onChange(instructor)
        setSearch('')
      }}
      renderItem={(i, isHighlighted) => (
        <div
          className={`w-full px-4 py-2.5 text-left cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
            isHighlighted ? 'bg-secondary/10' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex justify-between items-center mb-0.5">
            <p className="font-medium text-sm text-on-surface leading-tight flex items-center gap-2">
              {i.full_name}
              {recentInstructors.some(r => String(r.id) === String(i.id)) && (
                <span className="material-symbols-outlined text-[14px] text-yellow-500 font-bold" aria-hidden="true">history</span>
              )}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-sm ${
              i.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {i.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-slate-500">{i.job_title}</p>
        </div>
      )}
    />
  )
}
