import { useState, useMemo } from 'react'
import type { StudentListItem } from '../../../api/crm'
import { SpyCombobox } from '../SpyCombobox'
import type { SpyCategory } from '../SpyCombobox'
import { getRecentItems, addRecentItem, type RecentItem } from '../../../utils/recentCache'

export interface StudentComboboxProps {
  value: StudentListItem | null
  onChange: (student: StudentListItem | null) => void
  search: string
  setSearch: (search: string) => void
  students: StudentListItem[]
  isLoading: boolean
}

export function StudentCombobox({ 
  value, 
  onChange, 
  search, 
  setSearch, 
  students, 
  isLoading 
}: StudentComboboxProps) {
  const [groupByMode, setGroupByMode] = useState<'alphabetical' | 'status' | 'gender'>('alphabetical')
  const [recentStudents, setRecentStudents] = useState<RecentItem[]>(() => getRecentItems('techno_recent_students'))

  const categories = useMemo<SpyCategory<StudentListItem>[]>(() => {
    const grouped: Record<string, StudentListItem[]> = {}
    if (!students) return []
    
    students.forEach(s => {
      let groupKey = 'Other'
      if (groupByMode === 'alphabetical') {
        groupKey = s.full_name ? s.full_name.charAt(0).toUpperCase() : '?'
        if (!/[A-Z]/.test(groupKey)) groupKey = '#'
      } else if (groupByMode === 'status') {
        const statuses: Record<string, string> = {
          'active': 'Active',
          'inactive': 'Inactive',
          'pending': 'Waitlisted'
        }
        groupKey = statuses[s.status] || 'Unknown Status'
      } else if (groupByMode === 'gender') {
        groupKey = s.gender ? (s.gender.charAt(0).toUpperCase() + s.gender.slice(1)) : 'Unspecified'
      }

      if (!grouped[groupKey]) grouped[groupKey] = []
      grouped[groupKey].push(s)
    })

    const sortedKeys = Object.keys(grouped).sort()
    return sortedKeys.map(k => ({
      id: k,
      title: k,
      icon: groupByMode === 'alphabetical' ? 'sort_by_alpha' : groupByMode === 'status' ? 'info' : 'group',
      items: grouped[k]
    }))
  }, [students, groupByMode])

  // Compute active categories for empty/focus/1-char browse mode
  const activeCategories = useMemo<SpyCategory<StudentListItem>[]>(() => {
    if (search.length >= 2) {
      return categories
    }
    
    const itemsToShow = search.length === 1
      ? recentStudents.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))
      : recentStudents

    if (itemsToShow.length === 0) return []

    return [{
      id: 'recent',
      title: 'Recently Selected',
      icon: 'history',
      items: itemsToShow.map(r => ({
        id: Number(r.id),
        full_name: r.name,
        status: 'active' as const,
        phone: 'Recently Selected'
      } as StudentListItem)),
      isSpecial: true
    }]
  }, [search, recentStudents, categories])

  const totalItemsCount = useMemo(() => {
    if (search.length >= 2) {
      return students.length
    }
    return activeCategories.length > 0 ? activeCategories[0].items.length : 0
  }, [search, students, activeCategories])

  if (value) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <span className="font-medium text-on-surface">{value.full_name}</span>
        <button 
          type="button"
          onClick={() => { onChange(null); setSearch(''); setGroupByMode('alphabetical') }}
          className="text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-100 rounded"
        >
          Change
        </button>
      </div>
    )
  }

  return (
    <SpyCombobox<StudentListItem>
      search={search}
      onSearchChange={setSearch}
      placeholder="Search student (min 2 chars)..."
      isLoading={isLoading}
      noResultsText={
        search.length === 0
          ? "No recently selected students. Type to search."
          : search.length === 1
            ? "No matching recently selected students. Type at least 2 chars to search."
            : `No students found matching "${search}"`
      }
      modes={search.length >= 2 ? ['alphabetical', 'status', 'gender'] : undefined}
      activeMode={groupByMode}
      onModeChange={(mode) => setGroupByMode(mode as 'alphabetical' | 'status' | 'gender')}
      categories={activeCategories}
      totalItemsCount={totalItemsCount}
      onSelect={(student) => {
        addRecentItem('techno_recent_students', { id: student.id, name: student.full_name })
        setRecentStudents(getRecentItems('techno_recent_students'))
        onChange(student)
        setSearch('')
      }}
      renderItem={(s, isHighlighted) => (
        <div
          className={`w-full px-4 py-2.5 text-left cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
            isHighlighted ? 'bg-secondary/10' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex justify-between items-center mb-0.5">
            <p className="font-medium text-sm text-on-surface leading-tight flex items-center gap-1.5">
              {s.full_name}
              {s.has_unpaid_balance && (
                <span 
                  className="material-symbols-outlined text-[16px] text-amber-500 font-bold" 
                  title="Has unpaid balance"
                >
                  warning
                </span>
              )}
            </p>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-sm ${
              s.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
              s.status === 'inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' :
              'bg-yellow-50 text-yellow-700 border-yellow-200'
            }`}>
              {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Unknown'}
            </span>
          </div>
          <p className="text-xs text-slate-500">{s.phone || 'No phone'}</p>
        </div>
      )}
    />
  )
}
