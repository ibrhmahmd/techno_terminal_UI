import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { StudentCombobox, GroupCombobox } from '../common/combobox'
import { transferEnrollment, deleteEnrollment } from '../../api/enrollments'
import { useStudentEnrollments } from '../../hooks/finance/useStudentEnrollments'
import { useStudentsSearch } from '../../hooks/useDirectory'
import type { StudentListItem } from '../../api/crm'
import type { EnrichedGroupPublic } from '../../api/academics'
import type { StudentEnrollmentInfo } from '../../hooks/finance/useStudentEnrollments'
import { getEnrichedGroups } from '../../api/academics'

interface ManageEnrollmentPanelProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export function ManageEnrollmentPanel({ isLoading, setIsLoading }: ManageEnrollmentPanelProps) {
  const { showToast, ToastComponent } = useToast()

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

  // Step 3: Action Setup
  const [mode, setMode] = useState<'transfer' | 'drop' | null>(null)

  // Transfer state
  const [groupSearch, setGroupSearch] = useState('')
  const [destinationGroup, setDestinationGroup] = useState<EnrichedGroupPublic | null>(null)
  const [allGroups, setAllGroups] = useState<EnrichedGroupPublic[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  // Drop state
  const [dropNotes, setDropNotes] = useState('')

  useEffect(() => {
    async function fetchGroups() {
      setGroupsLoading(true)
      try {
        const data = await getEnrichedGroups()
        setAllGroups(data || [])
      } catch {
        setAllGroups([])
      } finally {
        setGroupsLoading(false)
      }
    }
    fetchGroups()
  }, [])

  // Auto-select if only one enrollment
  useEffect(() => {
    if (selectedStudent && enrollments.length === 1 && !selectedEnrollment) {
      setSelectedEnrollment(enrollments[0])
    }
  }, [enrollments, selectedStudent, selectedEnrollment])

  const handleExecute = async () => {
    if (!selectedEnrollment) return
    setIsLoading(true)

    try {
      if (mode === 'transfer') {
        if (!destinationGroup) {
          showToast('Please select a target group for the transfer.', 'error')
          setIsLoading(false)
          return
        }
        await transferEnrollment({
          from_enrollment_id: selectedEnrollment.enrollment_id,
          to_group_id: destinationGroup.id
        })
        showToast(`Successfully transferred student to ${destinationGroup.name}`, 'success')
      } else {
        await deleteEnrollment(selectedEnrollment.enrollment_id)
        showToast('Successfully dropped student enrollment', 'success')
      }

      setSelectedStudent(null)
      setStudentSearch('')
      setSelectedEnrollment(null)
      setMode(null)
      setDestinationGroup(null)
      setDropNotes('')
    } catch {
      showToast('The operation failed. Please verify the student state and try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const hasDebt = selectedEnrollment && selectedEnrollment.remaining_balance > 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-[20px]">settings_suggest</span>
        </div>
        <div>
          <h2 className="font-headline text-xl font-semibold text-on-surface">Manage Enrollment</h2>
          <p className="text-sm text-on-surface-variant mt-0.5">Transfer or drop a student from their active courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: STUDENT SELECTION (1/3) ── */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 self-start">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-on-surface">1. Select Student</h3>
            <StudentCombobox
              value={selectedStudent}
              onChange={(s) => {
                setSelectedStudent(s)
                setSelectedEnrollment(null)
                setMode(null)
              }}
              search={studentSearch}
              setSearch={setStudentSearch}
              students={students}
              isLoading={isSearchingStudents}
            />
          </div>

          {/* Student Identity Card */}
          {selectedStudent && (
            <div className="p-4 bg-surface-container-low border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-base">
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

        {/* ── RIGHT: ENROLLMENTS & ACTIONS (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 2: ENROLLMENT LIST */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-on-surface">2. Choose Enrollment</h3>

            <div className="flex flex-row gap-4 items-start">
              {/* Enrollment Cards */}
              <div className="flex-1 min-w-0">
                {selectedStudent ? (
                  enrollmentsLoading ? (
                    <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
                  ) : enrollments.length === 0 ? (
                    <div className="p-6 bg-surface-container-low border border-slate-200 rounded-xl text-center text-sm text-on-surface-variant">
                      This student has no active enrollments to manage.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {enrollments.map(e => (
                        <button
                          key={e.enrollment_id}
                          onClick={() => { setSelectedEnrollment(e); setMode(null) }}
                          className={`p-4 text-left border-2 rounded-xl transition-all ${
                            selectedEnrollment?.enrollment_id === e.enrollment_id
                              ? 'border-secondary bg-secondary-container/20'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-on-surface truncate" title={e.group_name}>
                                📚 {e.group_name}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-0.5">
                                Level {e.level_number}
                              </p>
                            </div>
                            {e.remaining_balance > 0 && (
                              <span className="shrink-0 px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-semibold rounded-full">
                                ⚠️ {e.remaining_balance.toFixed(0)} EGP
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">Balance</span>
                            <span className={`text-sm font-bold ${e.remaining_balance > 0 ? 'text-error' : 'text-secondary'}`}>
                              {e.remaining_balance.toFixed(2)} EGP
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="p-8 bg-surface-container-low border border-dashed border-slate-200 rounded-xl text-center text-sm text-on-surface-variant">
                    Select a student on the left to view their active courses.
                  </div>
                )}
              </div>

              {/* FINANCIAL ALERT — beside enrollments */}
              {hasDebt && (
                <div className="w-64 shrink-0 p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-2">
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

          {/* STEP 3: ACTION HUB */}
          {selectedEnrollment && (
            <div className="space-y-4 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-on-surface">3. Choose Action</h3>

              {/* Full-width Transfer/Drop Toggle */}
              <div className="flex gap-3 p-1 bg-surface-container-low border border-slate-200 rounded-xl w-full">
                <button
                  onClick={() => { setMode('transfer') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'transfer'
                      ? 'bg-white text-secondary shadow-sm border border-slate-200'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                  Transfer
                </button>
                <button
                  onClick={() => { setMode('drop') }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    mode === 'drop'
                      ? 'bg-white text-error shadow-sm border border-slate-200'
                      : 'text-on-surface-variant hover:text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">person_remove</span>
                  Drop
                </button>
              </div>

              {/* TRANSFER FORM */}
              {mode === 'transfer' && (
                <div className="space-y-3 p-4 bg-surface-container-low border border-slate-200 rounded-xl">
                  <label className="block text-sm font-medium text-on-surface">Destination Group</label>
                  <GroupCombobox
                    value={destinationGroup}
                    onChange={setDestinationGroup}
                    search={groupSearch}
                    setSearch={setGroupSearch}
                    isLoading={groupsLoading}
                    recentGroupIds={[]}
                    groups={allGroups.filter(g => g.id !== selectedEnrollment.group_id)}
                  />
                  <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Moving from: <strong className="text-on-surface">{selectedEnrollment.group_name}</strong>
                  </p>
                </div>
              )}

              {/* DROP FORM */}
              {mode === 'drop' && (
                <div className="space-y-3 p-4 bg-error-container/20 border border-red-200 rounded-xl">
                  <label className="block text-sm font-medium text-on-surface">Notes</label>
                  <textarea
                    value={dropNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDropNotes(e.target.value)}
                    placeholder="Optional notes about this withdrawal..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all resize-none"
                  />
                </div>
              )}

              {/* EXECUTE BUTTON */}
              <button
                onClick={handleExecute}
                disabled={!mode || (mode === 'transfer' && !destinationGroup) || isLoading}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                  mode === 'drop'
                    ? 'bg-error text-on-error hover:bg-error/90 shadow-md'
                    : 'bg-secondary text-on-secondary hover:bg-secondary/90 shadow-md shadow-secondary/20'
                }`}
              >
                {isLoading
                  ? <LoadingSpinner size="sm" />
                  : <span className="material-symbols-outlined text-[20px]">{mode === 'drop' ? 'delete_forever' : 'swap_horiz'}</span>
                }
                {mode === 'drop' ? 'Confirm Drop' : 'Execute Transfer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {ToastComponent}
    </div>
  )
}
