import { useState } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DaySelectorBarProps {
  selectedDate: string
  onSelectDate: (date: string) => void
}

export function DaySelectorBar({ selectedDate, onSelectDate }: DaySelectorBarProps) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - today.getDay() + 1)
    return monday
  })

  const getWeekDates = (monday: Date) => {
    return DAYS.map((day, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return {
        day,
        date: date.toISOString().split('T')[0],
        dayNum: date.getDate(),
      }
    })
  }

  const weekDates = getWeekDates(currentWeek)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  return (
    <div className="day-selector">
      <button
        className="nav-button"
        onClick={() => navigateWeek('prev')}
        title="Previous week"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      <div className="days-container">
        {weekDates.map(({ day, date, dayNum }) => (
          <button
            key={date}
            className={`day-pill ${date === selectedDate ? 'active' : ''}`}
            onClick={() => onSelectDate(date)}
          >
            <span className="day-name">{day}</span>
            <span className="day-number">{dayNum}</span>
          </button>
        ))}
      </div>

      <button
        className="nav-button"
        onClick={() => navigateWeek('next')}
        title="Next week"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <style>{`
        .day-selector {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
          background-color: var(--surface-container-lowest);
          border-bottom: 1px solid rgba(198, 198, 205, 0.15);
        }
        .nav-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border: none;
          background: transparent;
          color: var(--on-surface-variant);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: background-color 0.2s ease;
        }
        .nav-button:hover {
          background-color: var(--surface-container-low);
        }
        .nav-button .material-symbols-outlined {
          font-size: 1.25rem;
        }
        .days-container {
          display: flex;
          gap: var(--space-2);
          flex: 1;
          justify-content: center;
        }
        .day-pill {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-4);
          min-width: 3.5rem;
          border: 1px solid var(--outline-variant);
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .day-pill:hover {
          background-color: var(--surface-container-low);
          border-color: var(--outline);
        }
        .day-pill.active {
          background-color: var(--secondary);
          border-color: var(--secondary);
          color: var(--on-secondary);
        }
        .day-name {
          font-size: var(--text-xs);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .day-number {
          font-size: var(--text-lg);
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
