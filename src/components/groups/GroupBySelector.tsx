import type { ReactNode } from 'react'
import type { GroupByField } from '../../api/academics'

interface GroupBySelectorProps {
  value: GroupByField
  onChange: (field: GroupByField) => void
  rightSlot?: ReactNode
}

const OPTIONS: Array<{ value: GroupByField; label: string; icon: string }> = [
  { value: null,          label: 'All',         icon: 'grid_view'      },
  { value: 'day',         label: 'Day',          icon: 'calendar_today' },
  { value: 'course',      label: 'Course',       icon: 'menu_book'      },
  { value: 'instructor',  label: 'Instructor',   icon: 'person'         },
  { value: 'status',      label: 'Status',       icon: 'toggle_on'      },
  { value: 'competition', label: 'Competition',  icon: 'emoji_events'   },
]

export function GroupBySelector({ value, onChange, rightSlot }: GroupBySelectorProps) {
  return (
    <section className="w-full pb-4">
      <div className="overflow-x-auto">
        <div className="flex min-w-[560px] items-center gap-1 rounded-lg bg-slate-100 p-1">
          {OPTIONS.map(({ value: optVal, label, icon }) => {
            const isActive = value === optVal
            return (
              <button
                key={String(optVal)}
                onClick={() => onChange(optVal)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white text-secondary shadow-sm font-bold'
                    : 'text-slate-500 hover:text-secondary hover:bg-white/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{icon}</span>
                {label}
              </button>
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
