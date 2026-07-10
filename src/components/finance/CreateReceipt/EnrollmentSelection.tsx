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
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent" />
          Loading enrollments...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-600 mb-1">Enrollment</label>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          No active enrollments found for this student
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2">
      <label className="block text-xs font-medium text-slate-600 mb-2">
        {enrollments.length === 1 ? 'Enrollment (Auto-selected)' : 'Select Enrollment *'}
      </label>
      <div className="grid grid-cols-1 gap-2.5">
        {enrollments.map((enrollment) => {
          const isSelected = selectedEnrollment?.enrollment_id === enrollment.enrollment_id
          const hasOutstanding = enrollment.remaining_balance > 0
          const isZeroOrNegative = enrollment.remaining_balance <= 0

          // Style definitions
          let cardStyle = "w-full p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 cursor-pointer select-none"
          if (isSelected) {
            cardStyle += " border-secondary bg-secondary/5 ring-1 ring-secondary shadow-sm"
          } else {
            cardStyle += " border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            if (isZeroOrNegative) {
              cardStyle += " opacity-65 bg-slate-50/50"
            }
          }

          return (
            <button
              key={enrollment.enrollment_id}
              type="button"
              onClick={() => onSelect(enrollment)}
              className={cardStyle}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center justify-center mt-0.5 shrink-0">
                  <span className={`material-symbols-outlined text-xl ${isSelected ? 'text-secondary font-bold' : 'text-slate-300'}`}>
                    {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {enrollment.group_name}
                    </span>
                    {enrollment.course_name && enrollment.course_name !== enrollment.group_name && (
                      <span className="text-xs text-slate-500 font-medium">
                        ({enrollment.course_name})
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium">Level {enrollment.level_number}</span>
                    {enrollment.instructor_name && (
                      <>
                        <span className="text-slate-300 font-bold">•</span>
                        <span className="truncate">Instructor: {enrollment.instructor_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto gap-2 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 shrink-0">
                {hasOutstanding ? (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <span className="material-symbols-outlined text-xs font-bold">schedule</span>
                      Unpaid
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {enrollment.remaining_balance.toFixed(2)} EGP
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="material-symbols-outlined text-xs font-bold">check_circle</span>
                      Paid
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {enrollment.remaining_balance.toFixed(2)} EGP
                    </span>
                  </>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
