import { useState } from 'react'

interface ReportWeekSelectorBarProps {
  date: string
  onDateChange: (date: string) => void
}

function getRecentWeeks() {
  const now = new Date()

  const weeks = []
  
  for (let i = 0; i < 4; i++) {
    const weekDate = new Date(now)
    weekDate.setDate(now.getDate() - (i * 7))
    
    // Calculate week start (Monday) and end (Sunday) for label
    const dayOfWeek = weekDate.getDay() || 7 // 1-7 (Mon-Sun)
    const weekStart = new Date(weekDate)
    weekStart.setDate(weekDate.getDate() - dayOfWeek + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    
    const isoDate = `${weekDate.getFullYear()}-${String(weekDate.getMonth() + 1).padStart(2, '0')}-${String(weekDate.getDate()).padStart(2, '0')}`
    
    let label = ''
    if (i === 0) label = 'This Week'
    else if (i === 1) label = 'Last Week'
    else label = `${i} Weeks Ago`
    
    const subtitle = `${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1}`

    weeks.push({ label, subtitle, date: isoDate, isCurrent: i === 0 })
  }
  
  return weeks.reverse()
}

export function ReportWeekSelectorBar({ date, onDateChange }: ReportWeekSelectorBarProps) {
  const [showCustomDate, setShowCustomDate] = useState(false)
  const recentWeeks = getRecentWeeks()

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[500px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1">
          {recentWeeks.map(({ label, subtitle, date: d, isCurrent }) => (
            <button
              key={d}
              className={`flex-1 px-3 py-2 rounded-md font-headline text-sm font-medium transition-all ${
                Math.abs(new Date(d).getTime() - new Date(date).getTime()) < 7 * 24 * 60 * 60 * 1000 // roughly selected
                  ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              } ${isCurrent ? 'ring-1 ring-secondary/20' : ''}`}
              onClick={() => { onDateChange(d); setShowCustomDate(false) }}
            >
              <div>{label}</div>
              <div className="text-xs opacity-70 font-normal">{subtitle}</div>
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
            <div className="text-xs opacity-70">Custom Date</div>
            <div className="material-symbols-outlined text-base" aria-hidden="true">calendar_month</div>
          </button>
        </div>
      </div>

      {showCustomDate && (
        <div className="flex items-center gap-3 pt-4">
          <label htmlFor="report-week-selector-custom-date" className="text-sm text-slate-600">
            Select a date in the target week:
          </label>
          <input
            id="report-week-selector-custom-date"
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
