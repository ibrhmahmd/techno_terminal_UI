import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { searchStudents } from '../../api/crm'
import { getEnrichedGroups } from '../../api/academics'
import { createEnrollment } from '../../api/enrollments'
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
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<EnrichedGroupPublic[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [selectedDay, setSelectedDay] = useState<string>('All')
  const [isSearchingStudents, setIsSearchingStudents] = useState(false)
  const [isLoadingGroups, setIsLoadingGroups] = useState(false)
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

  // Search students with loading state
  useEffect(() => {
    async function search() {
      if (studentSearch.trim().length < 2) {
        setStudents([])
        return
      }
      setIsSearchingStudents(true)
      try {
        const data = await searchStudents(studentSearch.trim())
        setStudents(data || [])
      } catch (err) {
        console.error('Student search failed:', err)
        setStudents([])
      } finally {
        setIsSearchingStudents(false)
      }
    }
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [studentSearch])

  // Load groups with day filter
  useEffect(() => {
    async function load() {
      console.log('🔍 [Groups] Loading triggered. selectedDay:', selectedDay, 'groupSearch:', groupSearch)
      
      // Only load groups when a specific day is selected (not 'All')
      if (selectedDay === 'All' && !groupSearch.trim()) {
        console.log('⚠️ [Groups] Blocked: selectedDay is All and no search term')
        setGroups([])
        return
      }
      
      setIsLoadingGroups(true)
      try {
        console.log('📡 [Groups] Calling getEnrichedGroups()...')
        const result = await getEnrichedGroups()
        console.log('✅ [Groups] API returned', result?.length || 0, 'groups:', result)
        
        let filtered = result || []
        console.log('🔧 [Groups] Starting with', filtered.length, 'groups')
        
        // Filter by day if specific day selected
        if (selectedDay !== 'All') {
          console.log('📅 [Groups] Filtering by day:', selectedDay)
          // Map abbreviated day to full day name (API returns full names like "Monday")
          const dayMap: Record<string, string> = {
            'Mon': 'Monday',
            'Tue': 'Tuesday',
            'Wed': 'Wednesday',
            'Thu': 'Thursday',
            'Fri': 'Friday',
            'Sat': 'Saturday',
            'Sun': 'Sunday'
          }
          const fullDayName = dayMap[selectedDay] || selectedDay
          const beforeCount = filtered.length
          filtered = filtered.filter(g => {
            const groupDay = g.default_day || g.schedule_day
            const match = groupDay?.toLowerCase() === fullDayName.toLowerCase()
            console.log(`  Group "${g.group_name}" default_day: "${groupDay}" vs "${fullDayName}" = ${match}`)
            return match
          })
          console.log(`📅 [Groups] Day filter: ${beforeCount} → ${filtered.length} groups`)
        }
        
        // Filter by search term
        if (groupSearch.trim()) {
          const searchLower = groupSearch.toLowerCase()
          console.log('🔎 [Groups] Filtering by search:', searchLower)
          const beforeCount = filtered.length
          filtered = filtered.filter(g => 
            g.group_name?.toLowerCase().includes(searchLower) ||
            g.course_name?.toLowerCase().includes(searchLower) ||
            g.instructor_name?.toLowerCase().includes(searchLower)
          )
          console.log(`🔎 [Groups] Search filter: ${beforeCount} → ${filtered.length} groups`)
        }
        
        console.log('🎯 [Groups] Final result:', filtered.length, 'groups to display')
        setGroups(filtered)
      } catch (err) {
        console.error('❌ [Groups] Load failed:', err)
        setGroups([])
      } finally {
        setIsLoadingGroups(false)
      }
    }
    load()
  }, [selectedDay, groupSearch])

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
      }
      // Reset
      setSelectedStudent(null)
      setSelectedGroup(null)
      setStudentSearch('')
      setGroupSearch('')
      setSelectedDay('All')
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
          {selectedStudent ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="font-medium">{selectedStudent.full_name}</span>
              <button 
                onClick={() => { setSelectedStudent(null); setStudentSearch('') }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 mb-2">
                <span className="material-symbols-outlined text-slate-500">search</span>
                <input
                  type="text"
                  placeholder="Search student (min 2 chars)..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-on-surface flex-1"
                />
                {isSearchingStudents && <LoadingSpinner size="sm" />}
              </div>
              {studentSearch.trim().length > 0 && studentSearch.trim().length < 2 && (
                <p className="text-xs text-slate-400 mt-1">Type at least 2 characters to search</p>
              )}
              {students.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                  {students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <p className="font-medium text-sm">{s.full_name}</p>
                      <p className="text-xs text-slate-500">{s.phone || 'No phone'}</p>
                    </button>
                  ))}
                </div>
              )}
              {studentSearch.trim().length >= 2 && !isSearchingStudents && students.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">No students found</p>
              )}
            </>
          )}
        </div>

        {/* Group Selection - 2/3 width */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-on-surface mb-4">2. Select Group</h3>
          {selectedGroup ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="font-medium">{selectedGroup.group_name}</span>
                <p className="text-xs text-slate-500">{selectedGroup.course_name} • {selectedGroup.schedule_time}</p>
              </div>
              <button 
                onClick={() => { setSelectedGroup(null); setGroupSearch(''); setSelectedDay('All') }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              {/* Day Selector */}
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-1">Filter by day</p>
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      onClick={() => {
                        console.log('👆 [DaySelector] Clicked day:', day, 'Previous day:', selectedDay)
                        setSelectedDay(day)
                      }}
                      className={`px-2 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                        selectedDay === day
                          ? 'bg-secondary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Group Search */}
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200 mb-2">
                <span className="material-symbols-outlined text-slate-500">search</span>
                <input
                  type="text"
                  placeholder="Search groups by name, course, or instructor..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-on-surface flex-1"
                />
                {isLoadingGroups && <LoadingSpinner size="sm" />}
              </div>
              
              {/* Groups List */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                {groups.length > 0 ? (
                  groups.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGroup(g)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-on-surface">{g.group_name}</p>
                          <p className="text-xs text-slate-500">{g.course_name}</p>
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                          {g.default_day}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          {g.schedule_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">person</span>
                          {g.instructor_name}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-slate-400">
                    {isLoadingGroups ? (
                      <span>Loading groups...</span>
                    ) : selectedDay === 'All' && !groupSearch.trim() ? (
                      <span>Select a day or search to find groups</span>
                    ) : (
                      <span>No groups found. Try different filters.</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
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
