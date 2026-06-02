import { useEffect } from 'react'
import { useStudentEnrollments } from '../../../hooks/finance/useStudentEnrollments'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'

interface EnrollmentSelectionProps {
  studentId: number
  selectedEnrollment: StudentEnrollmentInfo | null
  onSelect: (enrollment: StudentEnrollmentInfo | null) => void
}

export function EnrollmentSelection({ studentId, selectedEnrollment, onSelect }: EnrollmentSelectionProps) {
  const { enrollments, loading, error } = useStudentEnrollments(studentId)

  // Auto-select if only one enrollment
  useEffect(() => {
    if (enrollments.length === 1 && !selectedEnrollment) {
      onSelect(enrollments[0])
    }
  }, [enrollments, selectedEnrollment, onSelect])

  if (loading) {
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="p-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-500">
          Loading enrollments...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {error}
        </div>
      </div>
    )
  }

  // Single enrollment (auto-selected by useEffect, show selected state)
  if (enrollments.length === 1) {
    const enrollment = selectedEnrollment || enrollments[0]
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-green-800">
          <span className="text-sm">
            {enrollment.group_name} (Level {enrollment.level_number})
          </span>
          <span className="text-xs text-green-600">
            Balance: {enrollment.remaining_balance.toFixed(2)} EGP
          </span>
        </div>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          No active enrollments found for this student
        </div>
      </div>
    )
  }

  // Multiple enrollments - show dropdown
  return (
    <div className="lg:col-span-2">
      <label htmlFor={`enrollment-${studentId}`} className="block text-xs font-medium text-slate-600 mb-1">Enrollment *</label>
      {selectedEnrollment ? (
        <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
          <span className="text-sm">
            {selectedEnrollment.group_name} (Level {selectedEnrollment.level_number})
            <span className="text-slate-500 ml-2">
              Balance: {selectedEnrollment.remaining_balance.toFixed(2)} EGP
            </span>
          </span>
          <button
            onClick={() => onSelect(null)}
            className="text-red-500 hover:text-red-700 text-xs font-medium"
          >
            Change
          </button>
        </div>
      ) : (
        <select
          id={`enrollment-${studentId}`}
          value=""
          onChange={(e) => {
            const enrollmentId = parseInt(e.target.value)
            const enrollment = enrollments.find(en => en.enrollment_id === enrollmentId)
            if (enrollment) onSelect(enrollment)
          }}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          <option value="">Select enrollment...</option>
          {enrollments.map(enrollment => (
            <option key={enrollment.enrollment_id} value={enrollment.enrollment_id}>
              {enrollment.group_name} (Level {enrollment.level_number}) - Balance: {enrollment.remaining_balance.toFixed(2)} EGP
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
