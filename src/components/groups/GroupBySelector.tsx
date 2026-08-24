import type { ReactNode } from 'react'
import type { GroupByField } from '../../api/academics'
import { useNavDirection } from '../../hooks/useNavDirection'

type GroupBySelectorValue = GroupByField | 'search'

interface GroupBySelectorProps {
  value: GroupByField | 'search'
  onChange: (field: GroupBySelectorValue) => void
  rightSlot?: ReactNode
}

const OPTIONS: Array<{ value: GroupBySelectorValue; label: string; icon: string }> = [
  { value: null,          label: 'All',          icon: 'grid_view'      },
  { value: 'day',         label: 'Day',          icon: 'calendar_today' },
  { value: 'course',      label: 'Course',       icon: 'menu_book'      },
  { value: 'instructor',  label: 'Instructor',   icon: 'person'         },
  { value: 'search',      label: 'Filter Groups', icon: 'manage_search'  },
]

export function GroupBySelector({ value, onChange, rightSlot }: GroupBySelectorProps) {
  const { getNextIndex } = useNavDirection()

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    if (OPTIONS.length === 0) return
    let next = index
    const navIndex = getNextIndex(e, index, OPTIONS.length)
    if (navIndex !== null) {
      next = navIndex
    } else if (e.key === 'Home') {
      next = 0
    } else if (e.key === 'End') {
      next = OPTIONS.length - 1
    } else {
      return
    }
    const option = OPTIONS[next]
    if (!option) return
    e.preventDefault()
    onChange(option.value)
  }

  return (
    <section className="w-full">
      <div className="flex w-full items-stretch gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1" role="radiogroup" aria-label="Group by">
        {OPTIONS.map(({ value: optVal, label, icon }, index) => {
          const isActive = value === optVal
          const isSearch = optVal === 'search'

          return (
            <div
              key={String(optVal)}
              className={`flex-1 flex items-center ${isSearch && index > 0 ? 'border-l border-blue-200/40 ps-1' : ''}`}
            >
              <button
                onClick={() => onChange(optVal)}
                onKeyDown={handleKeyDown(index)}
                role="radio"
                aria-checked={isActive}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none ${
                  isActive
                    ? isSearch
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 font-bold shadow-sm'
                      : 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                    : 'text-slate-500 hover:text-secondary hover:bg-white/70'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">{icon}</span>
                {label}
              </button>
            </div>
          )
        })}
        {rightSlot && (
          <div className="ms-auto shrink-0 ps-1 border-l border-slate-200 flex items-stretch">
            {rightSlot}
          </div>
        )}
      </div>
    </section>
  )
}
