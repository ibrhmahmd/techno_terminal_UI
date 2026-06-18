import { useState, useMemo, useEffect, useRef } from 'react'
import { useEmployees } from '../../../hooks/useStaff'
import type { EmployeeListItem } from '../../../api/hr'
import { getRecentItems, addRecentItem, type RecentItem } from '../../../utils/recentCache'

export interface InstructorComboboxProps {
  value: EmployeeListItem | null
  onChange: (instructor: EmployeeListItem | null) => void
}

export function InstructorCombobox({ value, onChange }: InstructorComboboxProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownAbove, setDropdownAbove] = useState(false)
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('')

  const { data, isLoading } = useEmployees(search, 1, 50)
  const [recentInstructors, setRecentInstructors] = useState<RecentItem[]>(() =>
    getRecentItems('techno_recent_instructors')
  )

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
  }, [isOpen, search, data?.items])

  // Get categories and their items
  const groupedData = useMemo(() => {
    const instructorsList = data?.items ?? []

    // Search length < 2: show recents only
    if (search.length < 2) {
      let list = recentInstructors.map(r => {
        const fullInstructor = instructorsList.find(i => String(i.id) === String(r.id))
        return fullInstructor || ({
          id: Number(r.id),
          full_name: r.name,
          job_title: 'Recently Used',
          is_active: true
        } as EmployeeListItem)
      })

      if (search.length === 1) {
        const query = search.toLowerCase()
        list = list.filter(i => i.full_name.toLowerCase().includes(query))
      }

      return [{
        key: 'recents',
        label: 'Recently Used',
        groups: list,
      }]
    }

    // Search length >= 2: group active instructors alphabetically
    const active = instructorsList.filter(i => i.is_active)
    if (active.length === 0) return []

    const grouped: Record<string, EmployeeListItem[]> = {}
    active.forEach(i => {
      const key = i.full_name.charAt(0).toUpperCase()
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(i)
    })

    const sortedKeys = Object.keys(grouped).sort()
    return sortedKeys.map(k => ({
      key: k,
      label: k,
      groups: grouped[k],
    }))
  }, [data?.items, search, recentInstructors])

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

  // Get instructors in active category
  const activeCategoryInstructors = useMemo(() => {
    const matched = groupedData.find(g => g.key === activeCategoryKey)
    return matched ? matched.groups : []
  }, [groupedData, activeCategoryKey])

  // ── Selected state ─────────────────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">person</span>
          </div>
          <div>
            <span className="font-headline font-semibold text-slate-800 text-sm">{value.full_name}</span>
            <p className="text-xs text-slate-500 mt-0.5">{value.job_title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setSearch('')
          }}
          aria-label={`Change instructor selection (currently ${value.full_name})`}
          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          Change
        </button>
      </div>
    )
  }

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
          placeholder="Search instructor by name..."
          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setIsOpen(true)
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 md:w-[500px] w-screen max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col gap-3 ${
            dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* Category Tabs (Always show if > 0) */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none py-1">
              {categories.map((cat) => {
                const isActive = cat.key === activeCategoryKey
                return (
                  <button
                    key={cat.key}
                    type="button"
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
                <div key={n} className="animate-pulse border border-slate-100 rounded-xl p-3.5 flex flex-col gap-2 bg-slate-50/50">
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
                  ? "No recently used instructors. Type to search."
                  : search.length === 1
                    ? "Type at least 2 characters to search instructors."
                    : `No instructors found matching "${search}"`}
              </p>
            </div>
          ) : (
            /* Results Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto py-1 scrollbar-thin">
              {activeCategoryInstructors.map((i) => {
                return (
                  <div
                    key={i.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      addRecentItem('techno_recent_instructors', { id: i.id, name: i.full_name })
                      setRecentInstructors(getRecentItems('techno_recent_instructors'))
                      onChange(i)
                      setSearch('')
                      setIsOpen(false)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        addRecentItem('techno_recent_instructors', { id: i.id, name: i.full_name })
                        setRecentInstructors(getRecentItems('techno_recent_instructors'))
                        onChange(i)
                        setSearch('')
                        setIsOpen(false)
                      }
                    }}
                    className="border border-slate-200 bg-white hover:border-secondary/40 hover:bg-secondary/[0.02] active:bg-secondary/[0.04] p-3.5 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-2 shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-headline font-semibold text-slate-800 text-sm leading-tight line-clamp-1">{i.full_name}</h4>
                        {recentInstructors.some(r => String(r.id) === String(i.id)) && (
                          <span className="material-symbols-outlined text-[15px] text-amber-500 font-bold" aria-hidden="true" title="Recently used">history</span>
                        )}
                      </div>
                      {i.job_title && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">work</span>
                          <span className="truncate">{i.job_title}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/60">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border shadow-sm ${
                        i.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {i.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
