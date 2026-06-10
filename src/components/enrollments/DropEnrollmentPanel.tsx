import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { StudentCombobox, GroupCombobox } from '../common/combobox'
import { transferEnrollment, deleteEnrollment } from '../../api/enrollments'
import { useStudentEnrollments } from '../../hooks/finance/useStudentEnrollments'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useGroupsFlat } from '../../hooks/useGroupQueries'
import type { StudentListItem } from '../../api/crm'
import type { EnrichedGroupPublic } from '../../api/academics'
import type { StudentEnrollmentInfo } from '../../hooks/finance/useStudentEnrollments'

interface DropEnrollmentPanelProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function DropEnrollmentPanel({ isLoading, setIsLoading }: DropEnrollmentPanelProps) {
  const { showToast } = useToast()

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

  // Transfer state
  const [groupSearch, setGroupSearch] = useState('')
  const [destinationGroup, setDestinationGroup] = useState<EnrichedGroupPublic | null>(null)
  const { data: allGroupsData, isLoading: groupsLoading } = useGroupsFlat(undefined, true)

  // Drop state
  const [dropNotes, setDropNotes] = useState('')

  // Auto-select if only one enrollment
  useEffect(() => {
    if (selectedStudent && enrollments.length === 1 && !selectedEnrollment) {
      setSelectedEnrollment(enrollments[0])
    }
  }, [enrollments, selectedStudent, selectedEnrollment])

  const handleTransfer = async () => {
    if (!selectedEnrollment) return
    if (!destinationGroup) {
      showToast('Please select a target group for the transfer.', 'error')
      return
    }

    setIsLoading(true)
    try {
      await transferEnrollment({
        from_enrollment_id: selectedEnrollment.enrollment_id,
        to_group_id: destinationGroup.id
      })
      showToast(`Successfully transferred student to ${destinationGroup.name}`, 'success')
      resetState()
    } catch {
      showToast('Transfer failed. Please verify the student state and try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = async () => {
    if (!selectedEnrollment) return

    setIsLoading(true)
    try {
      await deleteEnrollment(selectedEnrollment.enrollment_id)
      showToast('Successfully dropped student enrollment', 'success')
      resetState()
    } catch {
      showToast('Drop failed. Please verify the student state and try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const resetState = () => {
    setSelectedStudent(null)
    setStudentSearch('')
    setSelectedEnrollment(null)
    setDestinationGroup(null)
    setDropNotes('')
  }

  const hasDebt = selectedEnrollment && selectedEnrollment.remaining_balance > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
          <span className="material-symbols-outlined text-[20px]">person_remove</span>
        </div>
        <div>
          <h2 className="font-headline text-xl font-semibold text-on-surface">Drop or Transfer</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Withdraw a student or transfer them to another group</p>
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
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-base">
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

            <div className="flex flex-col xl:flex-row gap-6 items-start">
              <div className="flex-1 w-full">
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
                            ? 'border-amber-500 bg-amber-50'
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
                            <span className={`text-sm font-bold ${e.remaining_balance > 0 ? 'text-error' : 'text-amber-600'}`}>
                              {e.remaining_balance.toFixed(2)} EGP
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* FINANCIAL ALERT */}
              {hasDebt && (
                <div className="w-full xl:w-72 shrink-0 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="material-symbols-outlined text-[20px]">warning</span>
                    <p className="text-sm font-semibold">Unpaid Balance</p>
                  </div>
                  <p className="text-xs text-red-700 leading-relaxed">
                    This enrollment has an outstanding <strong>{selectedEnrollment!.remaining_balance.toFixed(2)} EGP</strong>. Financial reconciliation may be required before passing to target.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: ACTION SPLIT ── */}
        {selectedEnrollment && (
          <div className="space-y-4 border-t border-slate-200 pt-6 animate-fadeIn">
            <h3 className="text-sm font-semibold text-on-surface">3. Choose Action</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {/* Transfer Card */}
              <div className="p-6 border border-slate-200 rounded-xl flex flex-col gap-4 bg-surface-container-low shadow-sm">
                <div>
                  <h4 className="font-semibold text-base flex items-center gap-2 text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
                    Transfer Group
                  </h4>
                  <p className="text-sm text-on-surface-variant mt-1">Move this student to a different active group.</p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Destination Group</label>
                    <GroupCombobox
                      value={destinationGroup}
                      onChange={setDestinationGroup}
                      search={groupSearch}
                      setSearch={setGroupSearch}
                      isLoading={groupsLoading}
                      recentGroupIds={[]}
                      groups={(allGroupsData?.items ?? []).filter(g => g.id !== selectedEnrollment.group_id)}
                    />
                  </div>
                  <button
                    onClick={handleTransfer}
                    disabled={!destinationGroup || isLoading}
                    className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800 text-white hover:bg-slate-700 shadow-md"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Execute Transfer'}
                  </button>
                </div>
              </div>

              {/* Drop Card */}
              <div className="p-6 border border-red-200 rounded-xl flex flex-col gap-4 bg-error-container/10 shadow-sm">
                <div>
                  <h4 className="font-semibold text-base flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-[20px]">person_remove</span>
                    Drop Enrollment
                  </h4>
                  <p className="text-sm text-error/80 mt-1">Permanently withdraw this student from the group.</p>
                </div>

                <div className="space-y-4 mt-auto">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-error">Notes (Optional)</label>
                    <textarea
                      value={dropNotes}
                      onChange={(e) => setDropNotes(e.target.value)}
                      placeholder="Reason for dropping..."
                      rows={2}
                      className="w-full px-3 py-2 text-sm bg-white border border-red-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={handleDrop}
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-error text-on-error hover:bg-error/90 shadow-md shadow-error/20"
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : 'Confirm Drop'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
