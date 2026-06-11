import { useMemo } from 'react'
import type { StudentGroupBy, WaitingGroupBy, GroupOption } from '../../config/studentGrouping'

interface StudentGroupBySelectorProps {
  value: StudentGroupBy | WaitingGroupBy
  onChange: (value: StudentGroupBy | WaitingGroupBy) => void
  mode: 'students' | 'waiting'
  disabled?: boolean
}

const STUDENT_VALUES: readonly string[] = ['none', 'status', 'age', 'competition', 'deleted']
const WAITING_VALUES: readonly string[] = ['none', 'age', 'competition']

function isValidGroupBy(v: string): v is StudentGroupBy | WaitingGroupBy {
  return STUDENT_VALUES.includes(v) || WAITING_VALUES.includes(v)
}

export function StudentGroupBySelector({
  value,
  onChange,
  mode,
  disabled = false,
}: StudentGroupBySelectorProps) {
  const options: GroupOption[] = useMemo(() =>
    mode === 'students'
      ? [
          { value: 'none', label: 'All', icon: 'grid_view' },
          { value: 'status', label: 'Status', icon: 'flag' },
          { value: 'age', label: 'Age', icon: 'cake' },
          { value: 'competition', label: 'Competition', icon: 'emoji_events', disabled: true },
          { value: 'deleted', label: 'Deleted', icon: 'delete', accent: 'red' },
        ]
      : [
          { value: 'none', label: 'All', icon: 'grid_view' },
          { value: 'age', label: 'Age', icon: 'cake' },
          { value: 'competition', label: 'Competition', icon: 'emoji_events', disabled: true },
        ],
    [mode]
  )

  return (
    <section className="w-full pb-4">
      <div className="overflow-x-auto">
        <div
          className={`flex min-w-[560px] items-center gap-1 rounded-lg bg-slate-100 p-1 ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {options.map(({ value: optVal, label, icon, disabled: optDisabled, accent }) => {
            const isActive = value === optVal
            const isDisabled = disabled || optDisabled
            const isRedAccent = accent === 'red'

            return (
              <button
                key={optVal}
                onClick={() => {
                  if (!isDisabled && isValidGroupBy(optVal)) {
                    onChange(optVal)
                  }
                }}
                disabled={isDisabled}
                title={optDisabled ? 'Coming soon' : undefined}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-cyan-400/70 ${
                  isActive
                    ? isRedAccent
                      ? 'bg-red-50 text-red-600 shadow-sm font-bold border border-red-200'
                      : 'bg-white text-secondary shadow-sm font-bold'
                    : isDisabled
                        ? 'text-slate-500 cursor-not-allowed'
                      : isRedAccent
                        ? 'text-red-500 hover:text-red-600 hover:bg-red-50/50'
                        : 'text-slate-500 hover:text-secondary hover:bg-white/50'
                }`}
              >
                <span aria-hidden="true" className={`material-symbols-outlined text-[16px] ${isActive && isRedAccent ? 'text-red-500' : ''}`}>{icon}</span>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
