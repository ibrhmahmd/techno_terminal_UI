import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { StudentCombobox } from '../common/combobox'
import { useStudentEnrollments } from '../../hooks/finance/useStudentEnrollments'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useUpdateEnrollment } from '../../hooks/useEnrollmentMutations'
import type { StudentListItem } from '../../api/crm'
import type { StudentEnrollmentInfo } from '../../hooks/finance/useStudentEnrollments'
import type { AxiosError } from 'axios'

interface ModifyEnrollmentPanelProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ModifyEnrollmentPanel({ isLoading, setIsLoading }: ModifyEnrollmentPanelProps) {
  const { showToast } = useToast()
  const updateMutation = useUpdateEnrollment()

  // Step 1: Student Selection
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
  const [studentSearch, setStudentSearch] = useState('')

  // Debounce student search
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedStudentSearch(studentSearch), 300)
    return () => clearTimeout(timer)
  }, [studentSearch])

  const { data: studentsData, isLoading: isSearchingStudents } = useStudentsSearch(debouncedStudentSearch)
  const students = studentsData || []

  // Step 2: Enrollment Selection
  const [selectedEnrollment, setSelectedEnrollment] = useState<StudentEnrollmentInfo | null>(null)
  const { enrollments, loading: enrollmentsLoading } = useStudentEnrollments(selectedStudent?.id || null)

  // Step 3: Form State
  const [amountDue, setAmountDue] = useState<string>('')
  const [discountApplied, setDiscountApplied] = useState<string>('0')
  const [notes, setNotes] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auto-select if only one enrollment
  useEffect(() => {
    if (selectedStudent && enrollments.length === 1 && !selectedEnrollment) {
      setSelectedEnrollment(enrollments[0])
    }
  }, [enrollments, selectedStudent, selectedEnrollment])

  // Sync form state when enrollment selected
  useEffect(() => {
    if (selectedEnrollment) {
      setAmountDue(selectedEnrollment.amount_due !== null && selectedEnrollment.amount_due !== undefined ? selectedEnrollment.amount_due.toString() : '')
      setDiscountApplied(selectedEnrollment.discount_applied !== undefined ? selectedEnrollment.discount_applied.toString() : '0')
      setNotes(selectedEnrollment.notes || '')
      setErrorMsg(null)
    }
  }, [selectedEnrollment])

  const handleSave = async () => {
    if (!selectedEnrollment) return
    
    setErrorMsg(null)
    const amountDueVal = amountDue.trim() === '' ? null : parseFloat(amountDue)
    const discountVal = parseFloat(discountApplied)

    if (amountDueVal !== null && amountDueVal < 0) {
      setErrorMsg("Amount due cannot be negative.")
      return
    }
    if (isNaN(discountVal) || discountVal < 0) {
      setErrorMsg("Discount applied must be a valid non-negative number.")
      return
    }

    setIsLoading(true)
    try {
      await updateMutation.mutateAsync({
        enrollmentId: selectedEnrollment.enrollment_id,
        data: {
          amount_due: amountDueVal,
          discount_applied: discountVal,
          notes: notes.trim() === '' ? null : notes
        }
      })
      
      showToast('Enrollment updated successfully', 'success')
      setSelectedStudent(null)
      setStudentSearch('')
      setSelectedEnrollment(null)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      setErrorMsg(axiosError.response?.data?.message || 'Failed to update enrollment.')
      showToast('Failed to update enrollment.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
          <span className="material-symbols-outlined text-[20px]">edit_document</span>
        </div>
        <div>
          <h2 className="font-headline text-xl font-semibold text-on-surface">Modify Enrollment</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Edit financial details and administrative notes</p>
        </div>
      </div>

      <div className="space-y-8">

        {/* ── STEP 1: STUDENT SELECTION ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-on-surface">1. Select Student</h3>
          <StudentCombobox
            value={selectedStudent}
            onChange={(s) => {
              setSelectedStudent(s)
              setSelectedEnrollment(null)
            }}
            search={studentSearch}
            setSearch={setStudentSearch}
            students={students}
            isLoading={isSearchingStudents}
          />

          {/* Student Identity Card */}
          {selectedStudent && (
            <div className="p-4 bg-surface-container-low border border-slate-200 rounded-xl max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{selectedStudent.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{`ID #${selectedStudent.id}`}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── STEP 2: ENROLLMENT LIST ── */}
        {selectedStudent && (
          <div className="space-y-4 border-t border-slate-200 pt-6 animate-fadeIn">
            <h3 className="text-sm font-semibold text-on-surface">2. Choose Enrollment</h3>

            {enrollmentsLoading ? (
              <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
            ) : enrollments.length === 0 ? (
              <div className="p-6 bg-surface-container-low border border-slate-200 rounded-xl text-center text-sm text-on-surface-variant">
                This student has no active enrollments to manage.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.map(e => (
                  <button
                    key={e.enrollment_id}
                    onClick={() => setSelectedEnrollment(e)}
                    className={`p-5 text-left border-2 rounded-xl transition-all ${
                      selectedEnrollment?.enrollment_id === e.enrollment_id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-base text-on-surface truncate" title={e.course_name || e.group_name}>
                          📚 {e.course_name || 'Course Default'}
                        </p>
                      </div>
                      {e.remaining_balance > 0 && (
                        <span className="shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                          ⚠️ {e.remaining_balance.toFixed(0)} EGP
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-sm text-on-surface-variant truncate">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">group</span>
                        {e.group_name} (Level {e.level_number})
                      </p>
                      <p className="text-sm text-on-surface-variant truncate">
                        <span className="material-symbols-outlined text-[14px] align-middle mr-1">person</span>
                        {e.instructor_name || 'Unknown Instructor'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Due / Disc</p>
                        <p className="text-xs text-on-surface-variant">
                          {e.amount_due ?? 'Default'} / {e.discount_applied > 0 ? `-${e.discount_applied}` : '0'} EGP
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Balance</p>
                        <span className={`text-sm font-bold ${e.remaining_balance > 0 ? 'text-error' : 'text-blue-600'}`}>
                          {e.remaining_balance.toFixed(2)} EGP
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: ACTION FORM ── */}
        {selectedEnrollment && (
          <div className="space-y-4 border-t border-slate-200 pt-6 animate-fadeIn">
            <h3 className="text-sm font-semibold text-on-surface">3. Edit Details</h3>

            <div className="bg-surface-container-low border border-slate-200 rounded-xl p-5 space-y-4 max-w-4xl">
              {errorMsg && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Amount Due</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amountDue}
                      onChange={e => setAmountDue(e.target.value)}
                      placeholder="Group Default"
                      min="0"
                      step="0.01"
                      className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">EGP</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Leave blank to use the group's default price.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Discount Applied</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={discountApplied}
                      onChange={e => setDiscountApplied(e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">EGP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  placeholder="Add administrative notes..."
                />
              </div>
            </div>

            {/* EXECUTE BUTTON */}
            <div className="max-w-4xl pt-2">
              <button
                onClick={handleSave}
                disabled={isLoading || updateMutation.isPending}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                {isLoading || updateMutation.isPending
                  ? <LoadingSpinner size="sm" />
                  : <span className="material-symbols-outlined text-[20px]">save</span>
                }
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
