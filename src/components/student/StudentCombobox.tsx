import { useState, useMemo, useEffect, useRef, memo } from 'react'
import type { StudentListItem } from '../../api/crm'
import { getRecentItems, addRecentItem, type RecentItem } from '../../utils/recentCache'

export interface StudentComboboxProps {
  value: StudentListItem | null
  onChange: (student: StudentListItem | null) => void
  search: string
  setSearch: (search: string) => void
  students: StudentListItem[]
  isLoading: boolean
}

export function StudentComboboxInner({ 
  value, 
  onChange, 
  search, 
  setSearch, 
  students, 
  isLoading 
}: StudentComboboxProps) {
  const [groupByMode, setGroupByMode] = useState<'alphabetical' | 'status' | 'gender'>('alphabetical')
  const [recentStudents, setRecentStudents] = useState<RecentItem[]>(() =>
    getRecentItems('techno_recent_students')
  )
  const recentIdSet = useMemo(() => new Set(recentStudents.map(r => r.id)), [recentStudents])
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownAbove, setDropdownAbove] = useState(false)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('')

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Smart viewport flip when dropdown opens or search results change
  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 350 && rect.top > spaceBelow) {
        setDropdownAbove(true)
      } else {
        setDropdownAbove(false)
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      const handle = requestAnimationFrame(() => {
        updatePosition()
      })
      return () => cancelAnimationFrame(handle)
    }
  }, [isOpen, search, students])

  // Get categories and their items
  const groupedData = useMemo(() => {
    // Search length < 2: show recents only
    if (search.length < 2) {
      let list = recentStudents.map(r => ({
        id: Number(r.id),
        full_name: r.name,
        status: 'active' as const,
        phone: 'Recently Selected',
        has_unpaid_balance: false,
        gender: null,
      }))

      if (search.length === 1) {
        const query = search.toLowerCase()
        list = list.filter(s => s.full_name.toLowerCase().includes(query))
      }

      return [{
        key: 'recents',
        label: 'Recently Selected',
        groups: list,
      }]
    }

    // Search length >= 2: group students by active mode
    if (!students || students.length === 0) return []

    const grouped: Record<string, StudentListItem[]> = {}
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
      key: k,
      label: k,
      groups: grouped[k],
    }))
  }, [students, search, groupByMode, recentStudents])

  // Automatically pick the first category key as active if current one doesn't exist
  const categories = useMemo(() => {
    return groupedData.map(g => ({
      key: g.key,
      label: g.label,
      count: g.groups.length
    }))
  }, [groupedData])

  const activeCategoryKey = useMemo(() => {
    if (categories.length === 0) return ''
    const exists = categories.some(c => c.key === selectedCategoryKey)
    return exists ? selectedCategoryKey : categories[0].key
  }, [categories, selectedCategoryKey])

  // Get students in active category
  const activeCategoryStudents = useMemo(() => {
    const matched = groupedData.find(g => g.key === activeCategoryKey)
    return matched ? matched.groups : []
  }, [groupedData, activeCategoryKey])

  // ── Selected state ─────────────────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50/50 border border-green-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">person</span>
          </div>
          <div>
            <a
              href={`/students/${value.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-headline font-bold text-base md:text-lg text-slate-800 hover:text-secondary hover:underline flex items-center gap-1.5"
            >
              {value.full_name}
              <span className="material-symbols-outlined text-[16px] text-slate-400 select-none">open_in_new</span>
              {value.has_unpaid_balance && (
                <span className="material-symbols-outlined text-[16px] text-amber-500 font-bold" aria-hidden="true" title="Has unpaid balance">warning</span>
              )}
            </a>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 mt-1">
              <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">#ID: {value.id}</span>
              <span>•</span>
              <span>{value.phone || 'No phone'}</span>
              <span>•</span>
              <span className="capitalize">{value.status}</span>
              {value.gender && (
                <>
                  <span>•</span>
                  <span className="capitalize">{value.gender}</span>
                </>
              )}
              {value.grade && (
                <>
                  <span>•</span>
                  <span>{value.grade}</span>
                </>
              )}
              {value.current_group_name && (
                <>
                  <span>•</span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-medium">Group: {value.current_group_name}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setSearch('')
            setGroupByMode('alphabetical')
          }}
          aria-label={`Change student selection (currently ${value.full_name})`}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Change
        </button>
      </div>
    )
  }

  const isSearching = search.length >= 2

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input Trigger */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-slate-400" aria-hidden="true">search</span>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search student (min 2 chars)..."
          aria-label="Search student"
          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20 focus-visible:border-secondary transition-colors placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setIsOpen(true)
            }}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Student results"
          className={`absolute z-50 left-0 right-0 md:w-[550px] w-screen max-w-[calc(100vw-2rem)] bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl p-4 flex flex-col gap-3 ${
            dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* GroupBy Options Selector (Only when searching) */}
          {isSearching && (
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-blue-50/50 border border-blue-100/50 text-[11px] w-fit">
              <span className="text-slate-400 px-2 font-medium">Group by:</span>
              {(['alphabetical', 'status', 'gender'] as const).map((mode) => {
                const isActive = groupByMode === mode
                const labels = { alphabetical: 'A-Z', status: 'status', gender: 'gender' }
                const icons = { alphabetical: 'sort_by_alpha', status: 'info', gender: 'group' }
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGroupByMode(mode)}
                    className={`px-2.5 py-1 rounded-md font-headline font-semibold capitalize flex items-center gap-1 transition-all ${
                      isActive
                        ? 'bg-white text-secondary shadow-sm border border-blue-100'
                        : 'text-slate-500 hover:bg-white/50 hover:text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]" aria-hidden="true">{icons[mode]}</span>
                    {labels[mode]}
                  </button>
                )
              })}
            </div>
          )}

          {/* Category Tabs (Always show if > 0) */}
          {categories.length > 0 && (
            <div role="tablist" className="flex items-center gap-1 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none py-1">
              {categories.map((cat) => {
                const isActive = cat.key === activeCategoryKey
                return (
                  <button
                    key={cat.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedCategoryKey(cat.key)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                  >
                    <span className="font-headline">{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Shimmer/Loader State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto py-1">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="motion-safe:animate-pulse border border-slate-100 rounded-xl p-4 flex flex-col gap-2 bg-slate-50/50">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="flex gap-2 mt-1">
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center text-slate-400 gap-1.5">
              <span className="material-symbols-outlined text-4xl text-slate-200" aria-hidden="true">grid_view</span>
              <p className="text-sm font-medium">
                {search.length === 0
                  ? "No recently selected students. Type to search."
                  : search.length === 1
                    ? "Type at least 2 characters to search students."
                    : `No students found matching "${search}"`}
              </p>
            </div>
          ) : (
            /* Results Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto py-1 scrollbar-thin">
              {activeCategoryStudents.map((s) => {
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Select student ${s.full_name}`}
                    onClick={() => {
                      addRecentItem('techno_recent_students', { id: s.id, name: s.full_name })
                      setRecentStudents(getRecentItems('techno_recent_students'))
                      onChange(s)
                      setSearch('')
                      setIsOpen(false)
                    }}
                    className="border border-slate-200 bg-white hover:border-secondary/40 hover:bg-secondary/[0.02] active:bg-secondary/[0.04] p-4 rounded-xl cursor-pointer transition-colors flex flex-col justify-between gap-2 shadow-sm hover:shadow-md text-left w-full"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-headline font-semibold text-slate-800 text-sm leading-tight line-clamp-1 flex items-center gap-1.5">
                          {s.full_name}
                          {s.has_unpaid_balance && (
                            <span className="material-symbols-outlined text-[16px] text-amber-500 font-bold" aria-hidden="true" title="Has unpaid balance">warning</span>
                          )}
                        </h4>
                        {recentIdSet.has(s.id) && (
                          <span className="material-symbols-outlined text-[15px] text-amber-500 font-bold font-headline" aria-hidden="true" title="Recently used">history</span>
                        )}
                      </div>
                      {s.phone && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">phone</span>
                          <span className="truncate">{s.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100/60">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-sm ${
                        s.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        s.status === 'inactive' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}>
                        {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Unknown'}
                      </span>
                      {s.gender && (
                        <span className="text-[10px] text-slate-400 capitalize">{s.gender}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const StudentCombobox = memo(StudentComboboxInner)
