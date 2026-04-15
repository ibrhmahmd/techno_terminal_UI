import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useGroupsFlat } from '../../hooks/useGroupQueries'
import { useRecentGroups } from '../../hooks/useRecentGroups'
import { createEnrollment } from '../../api/enrollments'
import { StudentCombobox } from './StudentCombobox'
import { GroupCombobox } from './GroupCombobox'
import type { Student } from '../../api/crm'
import type { EnrichedGroupPublic } from '../../api/academics'

interface EnrollPanelProps {
  useMockData: boolean
  isLoading: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

const DAYS = ['All', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const

export function EnrollPanel({ useMockData, isLoading, onSuccess, onError, setIsLoading }: EnrollPanelProps) {
  const [studentSearch, setStudentSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [amount, setAmount] = useState(150)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')

  // Auto-populate pricing when group is selected
  useEffect(() => {
    if (selectedGroup) {
      // Try to get pricing from various possible fields
      const groupWithPricing = selectedGroup as EnrichedGroupPublic & {
        pricing?: number
        price?: number
        course?: { price?: number }
        course_price?: number
      }
      const groupPrice = groupWithPricing.pricing || groupWithPricing.price
      const coursePrice = groupWithPricing.course?.price || groupWithPricing.course_price
      const defaultPrice = 150
      
      setAmount(groupPrice || coursePrice || defaultPrice)
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
  const { data: groupsData, isLoading: isLoadingGroups } = useGroupsFlat()
  const { recentGroupIds, addRecentGroup } = useRecentGroups()

  const students = studentsData || []
  const groups = groupsData || []

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedGroup) {
      onError('Please select both student and group')
      return
    }
    
    setIsLoading(true)
    onError('')
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        onSuccess(`Enrolled ${selectedStudent.full_name} in ${selectedGroup.group_name}`)
      } else {
        await createEnrollment({
          student_id: selectedStudent.id,
          group_id: selectedGroup.id,
          amount_due: amount,
          discount,
          notes
        })
        onSuccess(`Successfully enrolled ${selectedStudent.full_name}`)
        // Cache the group selection for quick reuse
        addRecentGroup(selectedGroup.id)
      }
      // Reset
      setSelectedStudent(null)
      setSelectedGroup(null)
      setStudentSearch('')
      setGroupSearch('')
      setAmount(150)
      setDiscount(0)
      setNotes('')
    } catch {
      onError('Failed to create enrollment')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      {/* Main Grid: 1:2 ratio (student:group) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Student Selection - 1/3 width */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-on-surface mb-4">1. Select Student</h3>
          <StudentCombobox
            value={selectedStudent}
            onChange={setSelectedStudent}
            search={studentSearch}
            setSearch={setStudentSearch}
            students={students}
            isLoading={isSearchingStudents}
          />
        </div>

        {/* Group Selection - 2/3 width */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-on-surface mb-4">2. Select Group</h3>
          <GroupCombobox
            value={selectedGroup}
            onChange={setSelectedGroup}
            search={groupSearch}
            setSearch={setGroupSearch}
            groups={groups}
            isLoading={isLoadingGroups}
            recentGroupIds={recentGroupIds}
          />
        </div>
      </div>

      {/* Payment Details Section */}
      <h3 className="text-lg font-semibold text-on-surface mb-4">3. Payment Details</h3>
      <p className="text-sm text-slate-500 mb-3">
        {selectedGroup ? `Auto-populated from ${selectedGroup.course_name} pricing` : 'Enter payment details'}
      </p>
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
          <label className="block text-sm font-medium text-on-surface mb-2">Discount (EGP)</label>
          <input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
    </div>
  )
}
