import { useState } from 'react'

interface ReportDaySelectorBarProps {
  date: string
  onDateChange: (date: string) => void
}

const DAY_NAMES = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

function getWeekDates(selectedDate: string) {
  const [y, m, d] = selectedDate.split('-').map(Number)
  const today = new Date(y, m - 1, d)
  const dayOfWeek = today.getDay()
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - ((dayOfWeek + 1) % 7))
  const now = new Date()
  const todayISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return DAY_NAMES.map((dayName, index) => {
    const date = new Date(saturday)
    date.setDate(saturday.getDate() + index)
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return { dayName, date: isoDate, isToday: isoDate === todayISO }
  })
}

export function ReportDaySelectorBar({ date, onDateChange }: ReportDaySelectorBarProps) {
  const [showCustomDate, setShowCustomDate] = useState(false)
  const weekDates = getWeekDates(date)

  return (
    <div>
      {/* Week-day strip */}
      <div className="overflow-x-auto">
        <div className="flex min-w-[500px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1">
          {weekDates.map(({ dayName, date: d, isToday }) => (
            <button
              key={d}
              className={`flex-1 px-3 py-2 rounded-md font-headline text-sm font-medium transition-all ${
                d === date
                  ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              } ${isToday ? 'ring-1 ring-secondary/20' : ''}`}
              onClick={() => { onDateChange(d); setShowCustomDate(false) }}
            >
              <div className="text-xs opacity-70">{dayName.slice(0, 3)}</div>
              <div>{d.split('-')[2]}</div>
            </button>
          ))}

          {/* Custom date toggle */}
          <button
            className={`flex-1 px-3 py-2 rounded-md font-headline text-sm font-medium transition-all ${
              showCustomDate
                ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                : 'text-slate-600 hover:text-secondary hover:bg-white/70'
            }`}
            onClick={() => setShowCustomDate(!showCustomDate)}
          >
            <div className="text-xs opacity-70">Custom</div>
            <div className="material-symbols-outlined text-base" aria-hidden="true">calendar_month</div>
          </button>
        </div>
      </div>

      {/* Jump-to-date input (hidden by default) */}
      {showCustomDate && (
        <div className="flex items-center gap-3 pt-4">
          <label htmlFor="report-day-selector-custom-date" className="text-sm text-slate-600">
            Jump to date:
          </label>
          <input
            id="report-day-selector-custom-date"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          />
        </div>
      )}
    </div>
  )
}
