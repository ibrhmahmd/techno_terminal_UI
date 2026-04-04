import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { searchStudents } from '../../api/crm'
import { getGroupsPaginated } from '../../api/academics'
import { createEnrollment } from '../../api/enrollments'
import type { Student } from '../../api/crm'
import type { Group } from '../../api/academics'

interface EnrollPanelProps {
  useMockData: boolean
  isLoading: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

export function EnrollPanel({ useMockData, isLoading, onSuccess, onError, setIsLoading }: EnrollPanelProps) {
  const [studentSearch, setStudentSearch] = useState('')
  const [groupSearch, setGroupSearch] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [level, setLevel] = useState(1)
  const [amount, setAmount] = useState(150)
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')

  // Search students
  useEffect(() => {
    async function search() {
      if (studentSearch.length < 2) {
        setStudents([])
        return
      }
      try {
        const data = await searchStudents(studentSearch)
        setStudents(data || [])
      } catch {
        setStudents([])
      }
    }
    const timeout = setTimeout(search, 300)
    return () => clearTimeout(timeout)
  }, [studentSearch])

  // Load groups
  useEffect(() => {
    async function load() {
      try {
        const result = await getGroupsPaginated({ skip: 0, limit: 100 })
        setGroups(result.items || [])
      } catch {
        setGroups([])
      }
    }
    load()
  }, [])

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
        onSuccess(`Enrolled ${selectedStudent.full_name} in ${selectedGroup.name}`)
      } else {
        await createEnrollment({
          student_id: selectedStudent.id,
          group_id: selectedGroup.id,
          level,
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
      setLevel(1)
      setAmount(150)
      setDiscount(0)
      setNotes('')
    } catch {
      onError('Failed to create enrollment')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredGroups = groups.filter(g => 
    !groupSearch || 
    g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
    (g.course_name || '').toLowerCase().includes(groupSearch.toLowerCase())
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">New Enrollment</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Student Selection */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Student</label>
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
              </div>
              {students.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
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
            </>
          )}
        </div>

        {/* Group Selection */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Group</label>
          {selectedGroup ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <span className="font-medium">{selectedGroup.name}</span>
                <p className="text-xs text-slate-500">{selectedGroup.course_name} • {selectedGroup.schedule_time}</p>
              </div>
              <button 
                onClick={() => { setSelectedGroup(null); setGroupSearch('') }}
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
                  placeholder="Filter groups..."
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-on-surface flex-1"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGroup(g)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <p className="font-medium text-sm">{g.name}</p>
                    <p className="text-xs text-slate-500">{g.course_name} • {g.instructor_name} • {g.schedule_time}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enrollment Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Level</label>
          <input
            type="number"
            min={1}
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Amount Due (EGP)</label>
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
          <div className="px-3 py-2 bg-slate-100 rounded-lg text-sm font-medium">
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
