interface DaySelectorBarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export function DaySelectorBar({ selectedDate, onSelectDate }: DaySelectorBarProps) {
  // Get current week's dates starting from Saturday
  const getWeekDates = () => {
    const today = new Date(selectedDate)
    const dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
    
    // Find Saturday of current week
    const saturday = new Date(today)
    saturday.setDate(today.getDate() - ((dayOfWeek + 1) % 7))
    
    return DAY_NAMES.map((dayName, index) => {
      const date = new Date(saturday)
      date.setDate(saturday.getDate() + index)
      return {
        dayName,
        date: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString(),
      }
    })
  }

  const weekDates = getWeekDates()

  return (
    <section className="px-8 pb-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {weekDates.map(({ dayName, date }) => (
          <button
            key={date}
            className={`px-5 py-1.5 rounded-md font-headline text-sm font-medium transition-all ${
              date === selectedDate
                ? 'bg-white text-secondary shadow-sm font-bold'
                : 'text-slate-500 hover:text-secondary hover:bg-white/50'
            }`}
            onClick={() => onSelectDate(date)}
          >
            {dayName}
          </button>
        ))}
      </div>
    </section>
  )
}
