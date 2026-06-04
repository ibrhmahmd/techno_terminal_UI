import { useState } from 'react'

interface ReportMonthSelectorBarProps {
  date: string
  onDateChange: (date: string) => void
}

function getRecentMonths() {
  const now = new Date()
  
  const months = []
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  
  for (let i = 0; i < 4; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 15) // Use 15th to avoid end-of-month issues
    
    const isoDate = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(monthDate.getDate()).padStart(2, '0')}`
    
    let label = ''
    if (i === 0) label = 'This Month'
    else if (i === 1) label = 'Last Month'
    else label = `${i} Months Ago`
    
    const subtitle = `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`

    months.push({ label, subtitle, date: isoDate, isCurrent: i === 0 })
  }
  
  return months.reverse()
}

export function ReportMonthSelectorBar({ date, onDateChange }: ReportMonthSelectorBarProps) {
  const [showCustomDate, setShowCustomDate] = useState(false)
  const recentMonths = getRecentMonths()

  // Determine which month button is active based on the selected year and month
  const selectedYearMonth = date.substring(0, 7) // "YYYY-MM"

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="flex min-w-[500px] items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1">
          {recentMonths.map(({ label, subtitle, date: d, isCurrent }) => {
            const isSelected = d.substring(0, 7) === selectedYearMonth
            return (
              <button
                key={d}
                className={`flex-1 px-3 py-2 rounded-md font-headline text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
                    : 'text-slate-600 hover:text-secondary hover:bg-white/70'
                } ${isCurrent ? 'ring-1 ring-secondary/20' : ''}`}
                onClick={() => { onDateChange(d); setShowCustomDate(false) }}
              >
                <div>{label}</div>
                <div className="text-xs opacity-70 font-normal">{subtitle}</div>
              </button>
            )
          })}

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
          <label htmlFor="report-month-selector-custom-date" className="text-sm text-slate-600">
            Select a date in the target month:
          </label>
          <input
            id="report-month-selector-custom-date"
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
