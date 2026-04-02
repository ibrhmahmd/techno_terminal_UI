import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getGroupSessions, type Group, type Session } from '../api/academics'
import { getSessionAttendance, markAttendance, type AttendanceRecord, type AttendanceUpdate } from '../api/attendance'
import { AttendanceGrid } from '../components/attendance/AttendanceGrid'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ErrorMessage } from '../components/common/ErrorMessage'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const groupId = Number(id)

  const [group, setGroup] = useState<Group | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGroupData() {
      setIsLoading(true)
      setError(null)
      try {
        // For now, get sessions from daily schedule
        // In a real implementation, you'd have a dedicated endpoint
        const allSessions = await getGroupSessions(groupId)
        setSessions(allSessions)

        // Create a mock group object since we don't have a direct endpoint
        // In real implementation, call getGroup(groupId)
        setGroup({
          id: groupId,
          name: `Group ${groupId}`,
          course_name: 'Loading...',
          instructor_name: 'Loading...',
          student_count: 0,
        })

        if (allSessions.length > 0) {
          setSelectedSession(allSessions[0])
        }
      } catch (_err) {
        setError('Failed to load group details. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    if (groupId) {
      loadGroupData()
    }
  }, [groupId])

  useEffect(() => {
    async function loadAttendance() {
      if (!selectedSession) return

      setIsLoading(true)
      try {
        const data = await getSessionAttendance(selectedSession.id)
        setAttendance(data.students)
      } catch (_err) {
        setError('Failed to load attendance data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAttendance()
  }, [selectedSession])

  const handleSaveAttendance = async (updates: AttendanceUpdate[]) => {
    if (!selectedSession) return

    setIsSaving(true)
    try {
      await markAttendance(selectedSession.id, updates)
      // Refresh attendance data
      const data = await getSessionAttendance(selectedSession.id)
      setAttendance(data.students)
    } catch (_err) {
      setError('Failed to save attendance. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="group-detail-page">
      <header className="page-header">
        <div className="page-header-content">
          <div>
            <button className="back-link" onClick={() => navigate('/groups')}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Groups
            </button>
            <h1 className="page-title">{group?.name || 'Group Details'}</h1>
            <p className="page-subtitle">
              {group?.course_name} • {group?.instructor_name} • {group?.student_count} students
            </p>
          </div>
        </div>
      </header>

      <section className="content-wrapper">
        {isLoading && !attendance.length ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <>
            <div className="session-selector">
              <label>Select Session:</label>
              <select
                value={selectedSession?.id || ''}
                onChange={(e) => {
                  const session = sessions.find((s) => s.id === Number(e.target.value))
                  setSelectedSession(session || null)
                }}
              >
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.date} {session.start_time} - {session.end_time}
                  </option>
                ))}
              </select>
            </div>

            {selectedSession && (
              <div className="attendance-section">
                <div className="section-header">
                  <h2>Attendance</h2>
                  <span className="session-info">
                    {selectedSession.date} • {selectedSession.start_time} - {selectedSession.end_time}
                  </span>
                </div>

                <AttendanceGrid
                  students={attendance}
                  onSave={handleSaveAttendance}
                  isSaving={isSaving}
                />
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        .group-detail-page {
          min-height: 100vh;
          background-color: var(--surface);
        }
        .page-header {
          position: sticky;
          top: 0;
          z-index: 40;
          background-color: var(--surface-container-lowest);
          border-bottom: 1px solid rgba(198, 198, 205, 0.15);
          padding: var(--space-6) var(--space-8);
        }
        .page-header-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-sm);
          color: var(--secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          margin-bottom: var(--space-2);
          padding: 0;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .back-link .material-symbols-outlined {
          font-size: 1.25rem;
        }
        .page-title {
          font-family: var(--font-headline);
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--primary);
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin: 0;
        }
        .page-subtitle {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
          margin-top: var(--space-2);
        }
        .content-wrapper {
          padding: var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
        }
        .session-selector {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
          padding: var(--space-4);
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(198, 198, 205, 0.15);
        }
        .session-selector label {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--on-surface);
        }
        .session-selector select {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          border: 1px solid var(--outline-variant);
          border-radius: var(--radius-md);
          background-color: var(--surface-container-lowest);
          color: var(--on-surface);
          min-width: 250px;
        }
        .attendance-section {
          margin-top: var(--space-6);
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }
        .section-header h2 {
          font-family: var(--font-headline);
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--primary);
          margin: 0;
        }
        .session-info {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
        }
      `}</style>
    </div>
  )
}
