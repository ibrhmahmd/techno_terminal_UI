import type { ReactNode } from 'react'
import type { GroupByField } from '../../api/academics'

type GroupBySelectorValue = GroupByField | 'search'

interface GroupBySelectorProps {
  value: GroupByField
  onChange: (field: GroupBySelectorValue) => void
  rightSlot?: ReactNode
}

const OPTIONS: Array<{ value: GroupBySelectorValue; label: string; icon: string }> = [
  { value: null,          label: 'All',          icon: 'grid_view'      },
  { value: 'day',         label: 'Day',          icon: 'calendar_today' },
  { value: 'course',      label: 'Course',       icon: 'menu_book'      },
  { value: 'instructor',  label: 'Instructor',   icon: 'person'         },
  { value: 'status',      label: 'Status',       icon: 'toggle_on'      },
  { value: 'search',      label: 'Group Search', icon: 'manage_search'  },
]

export function GroupBySelector({ value, onChange, rightSlot }: GroupBySelectorProps) {
  const handleKeyDown = (index: number) => (e: React.KeyboardEvent) => {
    let next = index
    if (e.key === 'ArrowRight') next = (index + 1) % OPTIONS.length
    else if (e.key === 'ArrowLeft') next = (index - 1 + OPTIONS.length) % OPTIONS.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = OPTIONS.length - 1
    else return
    e.preventDefault()
    onChange(OPTIONS[next].value)
  }

  return (
    <section className="w-full pb-4">
      <div className="overflow-x-auto">
        <div className="flex w-full items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1" role="tablist" aria-label="Group by">
          {OPTIONS.map(({ value: optVal, label, icon }, index) => {
            const isActive = value === optVal
            const isSearch = optVal === 'search'

            return (
              <div key={String(optVal)} className="flex items-center gap-1">
                {isSearch && index > 0 && (
                  <div className="w-px h-6 bg-blue-200/60 mx-1 shrink-0" />
                )}
                <button
                  onClick={() => onChange(optVal)}
                  onKeyDown={handleKeyDown(index)}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all ${
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
            <div className="ml-auto shrink-0 pl-1 border-l border-slate-200">
              {rightSlot}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
