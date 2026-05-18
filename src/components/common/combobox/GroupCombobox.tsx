import { useState, useMemo } from 'react'
import type { EnrichedGroupPublic } from '../../../api/academics'
import { SpyCombobox } from '../SpyCombobox'
import type { SpyCategory } from '../SpyCombobox'

export interface GroupComboboxProps {
  value: EnrichedGroupPublic | null
  onChange: (group: EnrichedGroupPublic | null) => void
  search: string
  setSearch: (search: string) => void
  groups: EnrichedGroupPublic[]
  isLoading: boolean
  recentGroupIds: number[]
}

export function GroupCombobox({
  value,
  onChange,
  search,
  setSearch,
  groups,
  isLoading,
  recentGroupIds
}: GroupComboboxProps) {
  const [groupByMode, setGroupByMode] = useState<'course' | 'instructor' | 'day'>('course')

  const categories = useMemo<SpyCategory<EnrichedGroupPublic>[]>(() => {
    let filtered = groups || []
    if (!filtered) return []

    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(g => 
        g.name?.toLowerCase().includes(searchLower) ||
        g.course_name?.toLowerCase().includes(searchLower) ||
        g.instructor_name?.toLowerCase().includes(searchLower)
      )
    }

    const recents = filtered.filter(g => recentGroupIds.includes(g.id))
    recents.sort((a, b) => recentGroupIds.indexOf(a.id) - recentGroupIds.indexOf(b.id))

    const othersRaw = filtered.filter(g => !recentGroupIds.includes(g.id)).slice(0, 50)
    
    const othersGrouped: Record<string, EnrichedGroupPublic[]> = {}
    othersRaw.forEach(g => {
      let groupKey = 'Others'
      if (groupByMode === 'course') {
        groupKey = g.course_name || 'Uncategorized Course'
      } else if (groupByMode === 'instructor') {
        groupKey = g.instructor_name || 'No Instructor'
      } else if (groupByMode === 'day') {
        groupKey = g.schedule?.day || 'No Specific Day'
      }
      
      if (!othersGrouped[groupKey]) {
        othersGrouped[groupKey] = []
      }
      othersGrouped[groupKey].push(g)
    })

    const sortedOtherKeys = Object.keys(othersGrouped).sort((a, b) => {
      if (groupByMode === 'day') {
        const dayOrder: Record<string, number> = { 'Saturday': 1, 'Sunday': 2, 'Monday': 3, 'Tuesday': 4, 'Wednesday': 5, 'Thursday': 6, 'Friday': 7 }
        const aVal = dayOrder[a] || 99
        const bVal = dayOrder[b] || 99
        if (aVal !== bVal) return aVal - bVal
      }
      return a.localeCompare(b)
    })
    
    const iconMap = { course: 'menu_book', instructor: 'person', day: 'calendar_today' }
    
    const catArray: SpyCategory<EnrichedGroupPublic>[] = []
    
    if (recents.length > 0) {
      catArray.push({
        id: 'recents',
        title: 'Recently Used',
        isSpecial: true,
        items: recents
      })
    }

    sortedOtherKeys.forEach(k => {
      catArray.push({
        id: k,
        title: k,
        icon: iconMap[groupByMode],
        items: othersGrouped[k]
      })
    })

    return catArray
  }, [groups, search, groupByMode, recentGroupIds])

  if (value) {
    return (
      <div className="flex items-center justify-between p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
        <div>
          <span className="font-medium text-on-surface">{value.name}</span>
          <p className="text-xs text-slate-500 mt-0.5">{value.course_name}</p>
        </div>
        <button 
          type="button"
          onClick={() => { onChange(null); setSearch(''); setGroupByMode('course') }}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Change
        </button>
      </div>
    )
  }

  const totalCount = categories.reduce((sum, cat) => sum + cat.items.length, 0)

  return (
    <SpyCombobox<EnrichedGroupPublic>
      search={search}
      onSearchChange={setSearch}
      placeholder="Search groups by name, course, or instructor..."
      isLoading={isLoading}
      modes={['course', 'instructor', 'day']}
      activeMode={groupByMode}
      onModeChange={(mode) => setGroupByMode(mode as any)}
      categories={categories}
      totalItemsCount={totalCount}
      onSelect={(group) => {
        onChange(group)
        setSearch('')
      }}
      renderCategoryHeader={(cat) => {
        if (cat.id === 'recents') {
          return (
            <div className="px-4 py-1.5 bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-100">
              {cat.title}
            </div>
          )
        }
        return (
          <div 
            data-category-id={cat.id}
            className="spy-category-header sticky top-0 z-10 px-4 py-1.5 bg-white/95 backdrop-blur-sm border-b border-slate-100 text-[11px] font-bold text-slate-800 flex items-center gap-1.5 shadow-sm"
          >
            {cat.icon && <span className="material-symbols-outlined text-[14px] text-secondary/70">{cat.icon as React.ReactNode}</span>}
            {cat.title}
          </div>
        )
      }}
      renderItem={(g, isHighlighted) => (
        <div
          className={`w-full px-4 py-2.5 text-left cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
            isHighlighted ? 'bg-secondary/10' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex justify-between items-start mb-0.5">
            <div>
              <p className="font-medium text-sm text-on-surface leading-tight flex items-center gap-2">
                {g.name}
                {categories.find(c => c.id === 'recents')?.items.some(r => r.id === g.id) && (
                   <span className="material-symbols-outlined text-[14px] text-yellow-500">history</span>
                )}
              </p>
            </div>
            {g.schedule?.day && (
              <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-semibold border border-slate-200/60 shadow-sm">
                {g.schedule.day}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {g.schedule?.start_time && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] opacity-70">schedule</span>
                {g.schedule.start_time.slice(0, 5)} - {g.schedule.end_time?.slice(0, 5)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px] opacity-70">person</span>
              {g.instructor_name || 'TBA'}
            </span>
          </div>
        </div>
      )}
    />
  )
}
