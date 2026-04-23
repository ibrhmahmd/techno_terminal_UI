import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useToast } from '../common/Toast'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useGroupsFlat } from '../../hooks/useGroupQueries'
import { useRecentGroups } from '../../hooks/useRecentGroups'
import { useStudentSiblings } from '../../hooks/students/useStudentSiblings'
import { createEnrollment } from '../../api/enrollments'
import { StudentCombobox, GroupCombobox } from '../common/combobox'
import { Users, X, MapPin, Calendar, Info } from 'lucide-react'
import type { StudentListItem } from '../../api/crm'
import type { EnrichedGroupPublic } from '../../api/academics'

interface EnrollPanelProps {
  useMockData: boolean
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  preSelectedStudent?: StudentListItem | null
  onEnrollmentSuccess?: () => void
}


export function EnrollPanel({ useMockData, isLoading, setIsLoading, preSelectedStudent, onEnrollmentSuccess }: EnrollPanelProps) {
  const [studentSearch, setStudentSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(preSelectedStudent ?? null)
  
  // Update selectedStudent when preSelectedStudent changes
  useEffect(() => {
    if (preSelectedStudent) {
      setSelectedStudent(preSelectedStudent)
    }
  }, [preSelectedStudent])
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [amount, setAmount] = useState(150)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [isAutoDiscount, setIsAutoDiscount] = useState(false)
  const { showToast, ToastComponent } = useToast()

  // Fetch siblings when student is selected
  const { siblings } = useStudentSiblings(selectedStudent?.id || null, !!selectedStudent)

  // Auto-apply sibling discount (50 EGP) when student has siblings
  useEffect(() => {
    if (selectedStudent && siblings.length > 0) {
      setDiscount(50)
      setIsAutoDiscount(true)
    } else {
      setDiscount(0)
      setIsAutoDiscount(false)
    }
  }, [selectedStudent, siblings.length])

  // Auto-populate pricing when group is selected
  useEffect(() => {
    if (selectedGroup) {
      // Default price - API doesn't provide course price on group type
      setAmount(150)
    }
  }, [selectedGroup])

  // Debounce the student search for React Query
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStudentSearch(studentSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [studentSearch])

  // Hook into caches
  const { data: studentsData, isLoading: isSearchingStudents } = useStudentsSearch(debouncedStudentSearch)
  const { data: groupsData, isLoading: isLoadingGroups } = useGroupsFlat(true)
  const { recentGroupIds, addRecentGroup } = useRecentGroups()

  const students = studentsData || []
  const groups = groupsData || []

  const handleStudentChange = (student: StudentListItem | null) => {
    setSelectedStudent(student)
    // Reset group selection when student changes
    setSelectedGroup(null)
    setGroupSearch('')
    setAmount(150)
    setDiscount(0)
    setIsAutoDiscount(false)
  }

  const handleGroupChange = (group: EnrichedGroupPublic | null) => {
    setSelectedGroup(group)
  }

  const clearGroupSelection = () => {
    setSelectedGroup(null)
    setGroupSearch('')
    setAmount(150)
  }

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedGroup) {
      showToast('Please select both student and group', 'error')
      return
    }
    
    setIsLoading(true)
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        showToast(`Enrolled ${selectedStudent.full_name} in ${selectedGroup.group_name}`, 'success')
      } else {
        await createEnrollment({
          student_id: selectedStudent.id,
          group_id: selectedGroup.id,
          amount_due: amount,
          discount,
          notes
        })
        showToast(`Successfully enrolled ${selectedStudent.full_name}`, 'success')
        // Cache the group selection for quick reuse
        addRecentGroup(selectedGroup.id)
        // Callback for parent component
        onEnrollmentSuccess?.()
      }
      // Reset
      setSelectedStudent(null)
      setSelectedGroup(null)
      setStudentSearch('')
      setGroupSearch('')
      setAmount(150)
      setDiscount(0)
      setIsAutoDiscount(false)
      setNotes('')
    } catch {
      showToast('Failed to create enrollment', 'error')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Main Grid: 1:2 ratio (student:group) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Selection - 1/3 width */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold text-on-surface">1. Select Student</h3>
          
          {!selectedStudent ? (
            <StudentCombobox
              value={selectedStudent}
              onChange={handleStudentChange}
              search={studentSearch}
              setSearch={setStudentSearch}
              students={students}
              isLoading={isSearchingStudents}
            />
          ) : (
            <div className="p-4 bg-surface-container-low border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-base">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-sm truncate">{selectedStudent.full_name}</p>
                  <p className="text-xs text-on-surface-variant">{`ID #${selectedStudent.id}`}</p>
                </div>
                <button
                  onClick={() => handleStudentChange(null)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Change student"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Sibling discount badge */}
              {siblings.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                  <Info className="w-3 h-3" />
                  <span>{siblings.length} sibling(s) found - 50 EGP discount auto-applied</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Group Selection - 2/3 width */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-lg font-semibold text-on-surface">2. Select Group</h3>
          
          {!selectedGroup ? (
            <GroupCombobox
              value={selectedGroup}
              onChange={handleGroupChange}
              search={groupSearch}
              setSearch={setGroupSearch}
              groups={groups}
              isLoading={isLoadingGroups}
              recentGroupIds={recentGroupIds}
            />
          ) : (
            <div className="p-4 bg-surface-container-low border border-slate-200 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-on-surface text-sm truncate">{selectedGroup.group_name}</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedGroup.course_name}
                    </p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Level {selectedGroup.level_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearGroupSelection}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Change group"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Price info */}
              <p className="mt-3 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
                Default course fee: 150 EGP
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Section */}
      <h3 className="text-lg font-semibold text-on-surface mb-4">3. Payment Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Course Fee (EGP)</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Discount (EGP)
            {isAutoDiscount && (
              <span className="ml-2 text-xs text-green-600 font-normal">(Sibling discount auto-applied)</span>
            )}
          </label>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => {
              setDiscount(parseFloat(e.target.value) || 0)
              setIsAutoDiscount(false)
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Net Amount</label>
          <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold text-secondary">
            {amount - discount} EGP
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-on-surface mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes about this enrollment..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
        />
      </div>

      <button
        onClick={handleEnroll}
        disabled={!selectedStudent || !selectedGroup || isLoading}
        className="px-6 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors flex items-center gap-2"
      >
        {isLoading ? <LoadingSpinner size="sm" /> : null}
        <span className="material-symbols-outlined">person_add</span>
        Enroll Student
      </button>

      {ToastComponent}
    </div>
  )
}
