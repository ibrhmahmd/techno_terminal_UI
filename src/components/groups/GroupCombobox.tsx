import { useState, useMemo, useEffect, useRef, memo } from 'react'
import type { EnrichedGroupPublic } from '../../api/academics'
import { getRecentItems, addRecentItem, type RecentItem } from '../../utils/recentCache'
import { useGroupSearch } from '../../hooks/useGroupSearch'

export interface GroupComboboxProps {
  value: EnrichedGroupPublic | null
  onChange: (group: EnrichedGroupPublic | null) => void
  search: string
  setSearch: (search: string) => void
  excludeGroupIds?: number[]
}

const DAY_ORDER: Record<string, number> = {
  Saturday: 1, Sunday: 2, Monday: 3,
  Tuesday: 4, Wednesday: 5, Thursday: 6, Friday: 7,
}

export function GroupComboboxInner({
  value,
  onChange,
  search,
  setSearch,
  excludeGroupIds,
}: GroupComboboxProps) {
  const [groupByMode, setGroupByMode] = useState<'course' | 'instructor' | 'day'>('course')
  const [recentGroups, setRecentGroups] = useState<RecentItem[]>(() =>
    getRecentItems('techno_recent_groups')
  )
  const recentIdSet = useMemo(() => new Set(recentGroups.map(r => r.id)), [recentGroups])
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownAbove, setDropdownAbove] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounce the search before firing server request
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  // Server-side search (only fires when debouncedSearch >= 2 chars)
  const { data: searchResult, isLoading, isFetching } = useGroupSearch(debouncedSearch)
  const serverGroups = useMemo(() => searchResult?.items ?? [], [searchResult?.items])

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
  }, [isOpen, search, serverGroups])

  // Filter searchResult items based on excludeGroupIds
  const excludeSet = useMemo(() => new Set(excludeGroupIds), [excludeGroupIds])
  const filteredSearchGroups = useMemo(() => {
    if (excludeSet.size === 0) return serverGroups
    return serverGroups.filter(g => !excludeSet.has(g.id))
  }, [serverGroups, excludeSet])

  // Get categories and their items
  const groupedData = useMemo(() => {
    // Search length < 2: show recents only
    if (search.length < 2) {
      let list: EnrichedGroupPublic[] = recentGroups.map(r => ({
        id: Number(r.id),
        name: r.name,
        course_name: 'Recently Used',
        status: 'active',
        capacity: 0,
        current_level: 1,
        instructor_name: '',
      } satisfies EnrichedGroupPublic))

      if (excludeSet.size > 0) {
        list = list.filter(g => !excludeSet.has(g.id))
      }

      if (search.length === 1) {
        const query = search.toLowerCase()
        list = list.filter(g => g.name.toLowerCase().includes(query))
      }

      return [{
        key: 'recents',
        label: 'Recently Used',
        groups: list,
      }]
    }

    // Search length >= 2: group server results by active mode
    if (filteredSearchGroups.length === 0) return []

    const grouped: Record<string, EnrichedGroupPublic[]> = {}
    filteredSearchGroups.forEach(g => {
      let key = 'Others'
      if (groupByMode === 'course') key = g.course_name || 'Uncategorized Course'
      else if (groupByMode === 'instructor') key = g.instructor_name || 'No Instructor'
      else if (groupByMode === 'day') key = g.schedule?.day || 'No Specific Day'

      if (!grouped[key]) grouped[key] = []
      grouped[key].push(g)
    })

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      if (groupByMode === 'day') {
        const diff = (DAY_ORDER[a] ?? 99) - (DAY_ORDER[b] ?? 99)
        if (diff !== 0) return diff
      }
      return a.localeCompare(b)
    })

    return sortedKeys.map(k => ({
      key: k,
      label: k,
      groups: grouped[k],
    }))
  }, [filteredSearchGroups, search, groupByMode, recentGroups, excludeSet])

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('')

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

  // Get groups in active category
  const activeCategoryGroups = useMemo(() => {
    const matched = groupedData.find(g => g.key === activeCategoryKey)
    return matched ? matched.groups : []
  }, [groupedData, activeCategoryKey])

  // ── Selected state ─────────────────────────────────────────────────────────
  if (value) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">group</span>
          </div>
          <div>
            <span className="font-headline font-semibold text-slate-800 text-sm">{value.name}</span>
            <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">menu_book</span>
                {value.course_name}
              </span>
              {value.instructor_name && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[14px]" aria-hidden="true">person</span>
                  {value.instructor_name}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setSearch('')
            setGroupByMode('course')
          }}
          aria-label={`Change group selection (currently ${value.name})`}
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
          placeholder="Search groups by name, course, or instructor..."
          aria-label="Search group"
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
          aria-label="Group results"
          className={`absolute z-50 left-0 right-0 md:w-[600px] w-screen max-w-[calc(100vw-2rem)] bg-white/70 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl p-4 flex flex-col gap-3 ${
            dropdownAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {/* GroupBy Options Selector (Only when searching) */}
          {isSearching && (
            <div className="flex items-center gap-1.5 p-0.5 rounded-lg bg-blue-50/50 border border-blue-100/50 text-[11px] w-fit">
              <span className="text-slate-400 px-2 font-medium">Group by:</span>
              {(['course', 'instructor', 'day'] as const).map((mode) => {
                const isActive = groupByMode === mode
                const icons = { course: 'menu_book', instructor: 'person', day: 'calendar_today' }
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
                    {mode}
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
          {(isLoading || (isFetching && isSearching)) ? (
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
                  ? "No recently used groups. Type to search."
                  : search.length === 1
                    ? "Type at least 2 characters to search groups."
                    : `No groups found matching "${search}"`}
              </p>
            </div>
          ) : (
            /* Results Card Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto py-1 scrollbar-thin">
              {activeCategoryGroups.map((g) => {
                const hasTime = g.schedule?.start_time && g.schedule?.end_time
                const scheduleDisplay = g.schedule 
                  ? `${g.schedule.day} ${hasTime ? `${g.schedule.start_time.slice(0, 5)}-${g.schedule.end_time.slice(0, 5)}` : ''}`
                  : null

                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-label={`Select group ${g.name}`}
                    onClick={() => {
                      addRecentItem('techno_recent_groups', { id: g.id, name: g.name })
                      setRecentGroups(getRecentItems('techno_recent_groups'))
                      onChange(g)
                      setSearch('')
                      setIsOpen(false)
                    }}
                    className="border border-slate-200 bg-white hover:border-secondary/40 hover:bg-secondary/[0.02] active:bg-secondary/[0.04] p-4 rounded-xl cursor-pointer transition-colors flex flex-col justify-between gap-2 shadow-sm hover:shadow-md text-left w-full"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-headline font-semibold text-slate-800 text-sm leading-tight line-clamp-1">{g.name}</h4>
                        {recentIdSet.has(g.id) && (
                          <span className="material-symbols-outlined text-[15px] text-amber-500 font-bold" aria-hidden="true" title="Recently used">history</span>
                        )}
                      </div>
                      {g.course_name && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]" aria-hidden="true">menu_book</span>
                          <span className="truncate">{g.course_name}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-slate-500 pt-2 border-t border-slate-100/60">
                      {g.instructor_name && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">person</span>
                          <span className="truncate">{g.instructor_name}</span>
                        </div>
                      )}
                      {scheduleDisplay && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">calendar_today</span>
                          <span className="truncate">{scheduleDisplay}</span>
                        </div>
                      )}
                      {g.capacity > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]" aria-hidden="true">group</span>
                          <span>{(g.current_student_count ?? 0)} / {g.capacity} students</span>
                        </div>
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

export const GroupCombobox = memo(GroupComboboxInner)
