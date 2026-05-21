import { useState, useMemo } from 'react'
import { useEmployees } from '../../../hooks/useStaff'
import type { EmployeeListItem } from '../../../api/hr'
import { SpyCombobox } from '../SpyCombobox'
import type { SpyCategory } from '../SpyCombobox'

export interface InstructorComboboxProps {
  value: EmployeeListItem | null
  onChange: (instructor: EmployeeListItem | null) => void
}

export function InstructorCombobox({ value, onChange }: InstructorComboboxProps) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useEmployees(search, 1, 50)

  const instructors = data?.items ?? []

  const categories = useMemo<SpyCategory<EmployeeListItem>[]>(() => {
    const active = instructors.filter(i => i.is_active)
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
  }, [instructors])

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
      noResultsText={search.length < 2 ? 'Type at least 2 characters to search' : `No instructors found matching "${search}"`}
      categories={search.length >= 2 ? categories : []}
      totalItemsCount={search.length >= 2 ? totalCount : 0}
      onSelect={(instructor) => {
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
            <p className="font-medium text-sm text-on-surface leading-tight">{i.full_name}</p>
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
