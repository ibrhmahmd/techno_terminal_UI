import { useState, useCallback } from 'react'
import type { AttendanceRecord, AttendanceUpdate } from '../../api/attendance'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | null

interface AttendanceGridProps {
  students: AttendanceRecord[]
  onSave: (attendance: AttendanceUpdate[]) => void
  isSaving?: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  present: { label: 'P', color: '#065f46', bg: '#d1fae5' },
  absent: { label: 'A', color: '#991b1b', bg: '#fee2e2' },
  late: { label: 'L', color: '#92400e', bg: '#fef3c7' },
  excused: { label: 'E', color: '#1e40af', bg: '#dbeafe' },
}

export function AttendanceGrid({ students, onSave, isSaving }: AttendanceGridProps) {
  const [localAttendance, setLocalAttendance] = useState<Record<number, AttendanceStatus>>(() => {
    return students.reduce((acc, student) => {
      acc[student.student_id] = student.status
      return acc
    }, {} as Record<number, AttendanceStatus>)
  })
  const [hasChanges, setHasChanges] = useState(false)

  const cycleStatus = useCallback((studentId: number) => {
    setLocalAttendance((prev) => {
      const current = prev[studentId]
      let next: AttendanceStatus
      if (current === null || current === undefined) next = 'present'
      else if (current === 'present') next = 'absent'
      else if (current === 'absent') next = null
      else next = null

      setHasChanges(true)
      return { ...prev, [studentId]: next }
    })
  }, [])

  const setStatus = useCallback((studentId: number, status: AttendanceStatus) => {
    setLocalAttendance((prev) => {
      setHasChanges(true)
      return { ...prev, [studentId]: status }
    })
  }, [])

  const handleSave = () => {
    const attendance: AttendanceUpdate[] = Object.entries(localAttendance).map(
      ([studentId, status]) => ({
        student_id: Number(studentId),
        status,
      })
    )
    onSave(attendance)
    setHasChanges(false)
  }

  const getStatusDisplay = (status: AttendanceStatus) => {
    if (!status) return { label: '-', color: '#9ca3af', bg: 'transparent' }
    return STATUS_CONFIG[status]
  }

  return (
    <div className="attendance-grid">
      <div className="grid-header">
        <span className="header-cell student-col">Student</span>
        <span className="header-cell status-col">Status</span>
        <span className="header-cell actions-col">Actions</span>
      </div>

      <div className="grid-body">
        {students.map((student) => {
          const status = localAttendance[student.student_id]
          const display = getStatusDisplay(status)

          return (
            <div key={student.id} className="grid-row">
              <div className="student-cell">
                <span className="student-name">{student.student_name}</span>
              </div>

              <div className="status-cell">
                <button
                  className="status-badge"
                  onClick={() => cycleStatus(student.student_id)}
                  style={{
                    color: display.color,
                    backgroundColor: display.bg,
                  }}
                  title="Click to cycle: Present → Absent → Clear"
                >
                  {display.label}
                </button>
              </div>

              <div className="actions-cell">
                <button
                  className={`action-btn ${status === 'late' ? 'active' : ''}`}
                  onClick={() => setStatus(student.student_id, 'late')}
                >
                  Late
                </button>
                <button
                  className={`action-btn ${status === 'excused' ? 'active' : ''}`}
                  onClick={() => setStatus(student.student_id, 'excused')}
                >
                  Excused
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {hasChanges && (
        <div className="save-bar">
          <span className="unsaved-indicator">You have unsaved changes</span>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}

      <style>{`
        .attendance-grid {
          background-color: var(--surface-container-lowest);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(198, 198, 205, 0.15);
          overflow: hidden;
        }
        .grid-header {
          display: grid;
          grid-template-columns: 1fr 100px 200px;
          padding: var(--space-3) var(--space-4);
          background-color: var(--surface-container-low);
          border-bottom: 1px solid rgba(198, 198, 205, 0.1);
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--on-surface-variant);
        }
        .grid-body {
          max-height: 400px;
          overflow-y: auto;
        }
        .grid-row {
          display: grid;
          grid-template-columns: 1fr 100px 200px;
          padding: var(--space-3) var(--space-4);
          border-bottom: 1px solid rgba(198, 198, 205, 0.05);
          align-items: center;
          transition: background-color 0.15s ease;
        }
        .grid-row:hover {
          background-color: var(--surface-container-low);
        }
        .student-name {
          font-size: var(--text-sm);
          font-weight: 500;
          color: var(--on-surface);
        }
        .status-badge {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          font-weight: 600;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .status-badge:hover {
          transform: scale(1.05);
        }
        .actions-cell {
          display: flex;
          gap: var(--space-2);
        }
        .action-btn {
          padding: var(--space-1) var(--space-3);
          font-size: var(--text-xs);
          font-weight: 500;
          border: 1px solid var(--outline-variant);
          background-color: transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .action-btn:hover {
          background-color: var(--surface-container-low);
        }
        .action-btn.active {
          background-color: var(--secondary-container);
          border-color: var(--secondary);
          color: #005049;
        }
        .save-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3) var(--space-4);
          background-color: var(--surface-container-low);
          border-top: 1px solid rgba(198, 198, 205, 0.1);
        }
        .unsaved-indicator {
          font-size: var(--text-sm);
          color: var(--on-surface-variant);
        }
        .save-button {
          padding: var(--space-2) var(--space-4);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--on-secondary);
          background-color: var(--secondary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .save-button:hover:not(:disabled) {
          background-color: #005049;
        }
        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
