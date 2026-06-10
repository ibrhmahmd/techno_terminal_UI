import type { ReactNode } from 'react'

export type LogsGroupByField = 'date' | 'recipient' | null

export type LogsGroupBySelectorValue = LogsGroupByField | 'search'

interface LogsGroupBySelectorProps {
  value: LogsGroupBySelectorValue
  onChange: (field: LogsGroupBySelectorValue) => void
  rightSlot?: ReactNode
}

const OPTIONS: Array<{ value: LogsGroupBySelectorValue; label: string; icon: string }> = [
  { value: null,          label: 'Flat List',          icon: 'grid_view'      },
  { value: 'date',        label: 'By Date',          icon: 'calendar_today' },
  { value: 'recipient',   label: 'By Recipient',   icon: 'person'         },
  { value: 'search',      label: 'Filter Logs', icon: 'manage_search'  },
]

export function LogsGroupBySelector({ value, onChange, rightSlot }: LogsGroupBySelectorProps) {
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
    <section className="w-full">
      <div className="flex w-full items-stretch gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1" role="tablist" aria-label="Group by">
        {OPTIONS.map(({ value: optVal, label, icon }, index) => {
          const isActive = value === optVal
          const isSearch = optVal === 'search'

          return (
            <div
              key={String(optVal)}
              className={`flex-1 flex items-center ${isSearch && index > 0 ? 'border-l border-blue-200/40 pl-1' : ''}`}
            >
              <button
                onClick={() => onChange(optVal)}
                onKeyDown={handleKeyDown(index)}
                role="tab"
                aria-selected={isActive}
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
          <div className="ml-auto shrink-0 pl-1 border-l border-slate-200 flex items-stretch">
            {rightSlot}
          </div>
        )}
      </div>
    </section>
  )
}
