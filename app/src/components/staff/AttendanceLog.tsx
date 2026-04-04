import { useState } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { formatDate } from '../../utils/formatting'
import type { Employee, AttendanceRecord, LogAttendanceInput } from '../../api/hr'

interface AttendanceLogProps {
  employees: Employee[]
  selectedDate: string
  onLogAttendance: (data: LogAttendanceInput) => Promise<void>
  onClose: () => void
  isOpen: boolean
}

export function AttendanceLog({ employees, selectedDate, onLogAttendance, onClose, isOpen }: AttendanceLogProps) {
  const [attendanceData, setAttendanceData] = useState<Record<number, {
    status: 'present' | 'absent' | 'late' | 'early_departure'
    check_in?: string
    check_out?: string
    notes?: string
  }>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStatusChange = (employeeId: number, status: 'present' | 'absent' | 'late' | 'early_departure') => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], status }
    }))
  }

  const handleTimeChange = (employeeId: number, field: 'check_in' | 'check_out', value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], [field]: value }
    }))
  }

  const handleNotesChange = (employeeId: number, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [employeeId]: { ...prev[employeeId], notes }
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const promises = Object.entries(attendanceData).map(([id, data]) => {
        const employeeId = Number(id)
        if (!data.status) return Promise.resolve()
        return onLogAttendance({
          employee_id: employeeId,
          status: data.status,
          check_in: data.check_in ? `${selectedDate}T${data.check_in}:00` : undefined,
          check_out: data.check_out ? `${selectedDate}T${data.check_out}:00` : undefined,
          notes: data.notes,
        })
      })

      await Promise.all(promises)
      onClose()
      setAttendanceData({})
    } catch {
      setError('Failed to log attendance')
    } finally {
      setIsLoading(false)
    }
  }

  const statusColors = {
    present: 'bg-green-100 text-green-700 border-green-300',
    absent: 'bg-red-100 text-red-700 border-red-300',
    late: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    early_departure: 'bg-orange-100 text-orange-700 border-orange-300',
  }

  const activeEmployees = employees.filter(e => e.status === 'active')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Attendance - ${formatDate(selectedDate)}`}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(attendanceData).length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Log Attendance
          </button>
        </div>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        {activeEmployees.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No active employees found</p>
        ) : (
          <div className="space-y-3">
            {activeEmployees.map((employee) => {
              const data = attendanceData[employee.id] || { status: 'present' }
              
              return (
                <div key={employee.id} className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-on-surface">{employee.full_name}</h4>
                      <p className="text-sm text-slate-500">{employee.job_title} • {employee.department}</p>
                    </div>
                    <div className="flex gap-2">
                      {(['present', 'absent', 'late', 'early_departure'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(employee.id, status)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            data.status === status
                              ? statusColors[status]
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {status.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(data.status === 'present' || data.status === 'late' || data.status === 'early_departure') && (
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Check In:</span>
                        <input
                          type="time"
                          value={data.check_in || ''}
                          onChange={(e) => handleTimeChange(employee.id, 'check_in', e.target.value)}
                          disabled={isLoading}
                          className="px-2 py-1 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Check Out:</span>
                        <input
                          type="time"
                          value={data.check_out || ''}
                          onChange={(e) => handleTimeChange(employee.id, 'check_out', e.target.value)}
                          disabled={isLoading}
                          className="px-2 py-1 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-secondary"
                        />
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={data.notes || ''}
                    onChange={(e) => handleNotesChange(employee.id, e.target.value)}
                    placeholder="Notes (optional)"
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
