import { useState, useEffect } from 'react'
import { getDailySchedule, type DailySchedule } from '../api/academics'
import { DaySelectorBar } from '../components/dashboard/DaySelectorBar'
import { GroupSessionCard } from '../components/dashboard/GroupSessionCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorMessage } from '../components/common/ErrorMessage'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getDailySchedule(selectedDate)
        setSchedule(data)
      } catch (err) {
        setError('Failed to load daily schedule. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadSchedule()
  }, [selectedDate])

  const getSessionsForGroup = (groupId: number) => {
    if (!schedule) return []
    return schedule.sessions.filter((s) => s.group_id === groupId)
  }

  return (
    <div className="dashboard-page">
      <header className="page-header-compact">
        <h1>System Overview</h1>
        <div className="header-actions">
          <button className="btn-secondary">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
          <button className="btn-secondary">
            <span className="material-symbols-outlined">language</span>
            AR / EN
          </button>
        </div>
      </header>

      <DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h2 className="section-title">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <p className="section-subtitle">
              {schedule?.sessions.length || 0} sessions scheduled across {schedule?.groups.length || 0} groups
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : schedule?.groups.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">event_busy</span>
            <p>No groups scheduled for this day</p>
          </div>
        ) : (
          <div className="groups-grid">
            {schedule?.groups.map((group) => (
              <GroupSessionCard
                key={group.id}
                group={group}
                sessions={getSessionsForGroup(group.id)}
                selectedDate={selectedDate}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-page {
          min-height: 100vh;
          background-color: var(--surface);
        }
        .page-header-compact {
          position: sticky;
          top: 0;
          z-index: 40;
          height: var(--header-height);
          background-color: var(--surface-container-lowest);
          border-bottom: 1px solid rgba(198, 198, 205, 0.15);
          padding: 0 var(--space-8);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .page-header-compact h1 {
          font-family: var(--font-headline);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--primary);
          margin: 0;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--on-surface);
          background-color: transparent;
          border: 1px solid var(--outline-variant);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .btn-secondary:hover {
          background-color: var(--surface-container-low);
        }
        .btn-secondary .material-symbols-outlined {
          font-size: 1.25rem;
        }
        .dashboard-content {
          padding: var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
        }
        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: var(--space-6);
        }
        .section-title {
          font-family: var(--font-headline);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--primary);
          margin: 0 0 var(--space-1) 0;
        }
        .section-subtitle {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          color: var(--on-surface-variant);
        }
        .empty-state .material-symbols-outlined {
          font-size: 3rem;
          margin-bottom: var(--space-4);
          opacity: 0.5;
        }
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: var(--space-6);
        }
      `}</style>
    </div>
  )
}
