import { useTranslation } from 'react-i18next'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useNavDirection } from '../../hooks/useNavDirection'

interface DaySelectorBarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

export function DaySelectorBar({ selectedDate, onSelectDate }: DaySelectorBarProps) {
  const isMobile = useIsMobile()
  const { getNextIndex } = useNavDirection()
  const { t } = useTranslation('dashboard')

  // Day keys in order starting from Saturday (week starts Saturday in Egypt)
  const DAY_KEYS = [
    { full: 'days.saturday', short: 'days.saturday_short' },
    { full: 'days.sunday',   short: 'days.sunday_short'   },
    { full: 'days.monday',   short: 'days.monday_short'   },
    { full: 'days.tuesday',  short: 'days.tuesday_short'  },
    { full: 'days.wednesday',short: 'days.wednesday_short'},
    { full: 'days.thursday', short: 'days.thursday_short' },
    { full: 'days.friday',   short: 'days.friday_short'   },
  ]

  const toLocalISODate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Get current week's dates starting from Saturday
  const getWeekDates = () => {
    // Parse date without timezone shift to avoid UTC issues (BUG-05 fix)
    const [y, m, d] = selectedDate.split('-').map(Number)
    const today = new Date(y, m - 1, d) // local date, no UTC shift
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    
    // Find Saturday of current week
    const saturday = new Date(today)
    saturday.setDate(today.getDate() - ((dayOfWeek + 1) % 7))
    
    return DAY_KEYS.map((keys, index) => {
      const date = new Date(saturday)
      date.setDate(saturday.getDate() + index)
      return {
        dayName: t(isMobile ? keys.short : keys.full),
        date: toLocalISODate(date),
        isToday: date.toDateString() === new Date().toDateString(),
      }
    })
  }

  const weekDates = getWeekDates()

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    const buttons = Array.from(target.parentElement?.querySelectorAll('[role="tab"]') ?? [])
    const currentIndex = buttons.indexOf(target)
    if (currentIndex === -1) return

    const nextIndex = getNextIndex(e, currentIndex, buttons.length)
    if (nextIndex === null) return

    e.preventDefault()
    ;(buttons[nextIndex] as HTMLElement).focus()
    onSelectDate(weekDates[nextIndex].date)
  }

  return (
    <section className="w-full pb-4">
      
      <div className="overflow-x-auto">
        <div role="tablist" aria-label={t('days.select_day')} className="flex min-w-[320px] lg:min-w-[680px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1" onKeyDown={handleTablistKeyDown}>
          {weekDates.map(({ dayName, date }) => (
            <button
              key={date}
              role="tab"
              aria-selected={date === selectedDate}
              tabIndex={date === selectedDate ? 0 : -1}
              className={`flex-1 px-2 lg:px-5 py-2 rounded-md font-headline text-xs lg:text-sm font-medium transition-all ${
                date === selectedDate
                  ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              }`}
              onClick={() => onSelectDate(date)}
            >
              {dayName}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
