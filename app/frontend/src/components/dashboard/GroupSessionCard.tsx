import { useNavigate } from 'react-router-dom'
import type { Session, Group } from '../../api/academics'

interface GroupSessionCardProps {
  group: Group
  sessions: Session[]
  selectedDate: string
}

export function GroupSessionCard({ group, sessions, selectedDate }: GroupSessionCardProps) {
  const navigate = useNavigate()

  const handleCardClick = () => {
    navigate(`/groups/${group.id}`)
  }

  const handleAttendanceClick = (sessionId: number) => {
    navigate(`/attendance?session=${sessionId}`)
  }

  return (
    <div className="group-session-card">
      <div className="card-header" onClick={handleCardClick}>
        <div className="header-main">
          <h3 className="group-name">{group.name}</h3>
          <span className="course-name">{group.course_name}</span>
        </div>
        <div className="header-meta">
          <span className="instructor">{group.instructor_name}</span>
          <span className="student-count">
            <span className="material-symbols-outlined">group</span>
            {group.student_count} students
          </span>
        </div>
      </div>

      <div className="sessions-list">
        {sessions.length === 0 ? (
          <div className="no-sessions">No sessions scheduled for this day</div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-row ${session.attendance_marked ? 'marked' : ''}`}
            >
              <div className="session-time">
                <span className="time">{session.start_time}</span>
                <span className="duration">{session.start_time} - {session.end_time}</span>
              </div>
              <div className="session-status">
                {session.status === 'completed' && (
                  <span className="status completed">Completed</span>
                )}
                {session.status === 'cancelled' && (
                  <span className="status cancelled">Cancelled</span>
                )}
                {session.status === 'scheduled' && (
                  <span className="status scheduled">Scheduled</span>
                )}
              </div>
              <button
                className={`attendance-button ${session.attendance_marked ? 'marked' : ''}`}
                onClick={() => handleAttendanceClick(session.id)}
                disabled={session.status === 'cancelled'}
              >
                {session.attendance_marked ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Marked
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">edit_note</span>
                    Attendance
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      <style>{`
        .group-session-card {
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(198, 198, 205, 0.15);
          overflow: hidden;
        }
        .card-header {
          padding: var(--space-4) var(--space-6);
          background-color: var(--surface-container-low);
          border-bottom: 1px solid rgba(198, 198, 205, 0.1);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .card-header:hover {
          background-color: var(--surface-container);
        }
        .header-main {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-2);
        }
        .group-name {
          font-family: var(--font-headline);
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--primary);
          margin: 0;
        }
        .course-name {
          font-size: var(--text-xs);
          color: var(--on-surface-variant);
          background-color: var(--surface-container-high);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-sm);
        }
        .header-meta {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
        }
        .student-count {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }
        .student-count .material-symbols-outlined {
          font-size: 1rem;
        }
        .sessions-list {
          padding: var(--space-2);
        }
        .no-sessions {
          padding: var(--space-6);
          text-align: center;
          color: var(--on-surface-variant);
          font-size: var(--text-sm);
        }
        .session-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          margin-bottom: var(--space-1);
          transition: background-color 0.2s ease;
        }
        .session-row:hover {
          background-color: var(--surface-container-low);
        }
        .session-row.marked {
          background-color: rgba(0, 106, 97, 0.05);
        }
        .session-time {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        .time {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--on-surface);
        }
        .duration {
          font-size: var(--text-xs);
          color: var(--on-surface-variant);
        }
        .session-status {
          flex: 1;
          text-align: center;
        }
        .status {
          display: inline-flex;
          align-items: center;
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
        }
        .status.completed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status.cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .status.scheduled {
          background-color: #dbeafe;
          color: #1e40af;
        }
        .attendance-button {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 500;
          border: 1px solid var(--outline-variant);
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .attendance-button:hover:not(:disabled) {
          background-color: var(--surface-container-low);
          border-color: var(--outline);
        }
        .attendance-button.marked {
          background-color: var(--secondary-container);
          border-color: var(--secondary);
          color: #005049;
        }
        .attendance-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .attendance-button .material-symbols-outlined {
          font-size: 1.25rem;
        }
      `}</style>
    </div>
  )
}
