import { useIsMobile } from '../../hooks/useIsMobile'

interface DaySelectorBarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const DAY_NAMES_SHORT = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export function DaySelectorBar({ selectedDate, onSelectDate }: DaySelectorBarProps) {
  const isMobile = useIsMobile()
  const namesToUse = isMobile ? DAY_NAMES_SHORT : DAY_NAMES

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
    
    return namesToUse.map((dayName, index) => {
      const date = new Date(saturday)
      date.setDate(saturday.getDate() + index)
      return {
        dayName,
        date: toLocalISODate(date),
        isToday: date.toDateString() === new Date().toDateString(),
      }
    })
  }

  const weekDates = getWeekDates()

  return (
    <section className="w-full pb-4">
      
      <div className="overflow-x-auto">
        <div role="tablist" aria-label="Select day" className="flex min-w-[320px] lg:min-w-[680px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1">
          {weekDates.map(({ dayName, date }) => (
            <button
              key={date}
              role="tab"
              aria-selected={date === selectedDate}
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
