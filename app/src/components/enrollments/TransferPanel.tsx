import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { transferEnrollment, getEnrollments, type Enrollment } from '../../api/enrollments'
import { getGroupsPaginated } from '../../api/academics'
import type { EnrichedGroupPublic } from '../../api/academics'

interface TransferPanelProps {
  useMockData?: boolean
  isLoading: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

export function TransferPanel({ useMockData, isLoading, onSuccess, onError, setIsLoading }: TransferPanelProps) {
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [groupSearch, setGroupSearch] = useState('')
  const [groups, setGroups] = useState<EnrichedGroupPublic[]>([])
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)

  // Load enrollments and groups
  useEffect(() => {
    async function load() {
      try {
        const [enrollmentsResult, groupsResult] = await Promise.all([
          getEnrollments(),
          getGroupsPaginated({ skip: 0, limit: 100 })
        ])
        setEnrollments(enrollmentsResult.filter(e => e.status === 'active'))
        setGroups((groupsResult.items || []) as EnrichedGroupPublic[])
      } catch {
        setEnrollments([])
        setGroups([])
      }
    }
    load()
  }, [])

  const filteredGroups = groupSearch.length >= 2 
    ? groups.filter(g => 
        g.name.toLowerCase().includes(groupSearch.toLowerCase()) ||
        (g.course_name || '').toLowerCase().includes(groupSearch.toLowerCase())
      )
    : []

  const handleTransfer = async () => {
    if (!selectedEnrollment || !selectedGroup) {
      onError('Please select enrollment and new group')
      return
    }
    
    setIsLoading(true)
    onError('')
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        onSuccess(`Transferred to ${selectedGroup.name}`)
      } else {
        await transferEnrollment({
          student_id: selectedEnrollment.student_id,
          from_group_id: selectedEnrollment.group_id,
          to_group_id: selectedGroup.id
        })
        onSuccess('Successfully transferred enrollment')
      }
      setSelectedEnrollment(null)
      setSelectedGroup(null)
      setGroupSearch('')
    } catch {
      onError('Failed to transfer enrollment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">Transfer Enrollment</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Select Enrollment */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Select Active Enrollment</label>
          <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
            {enrollments.length === 0 ? (
              <p className="p-4 text-slate-500 text-sm text-center">No active enrollments found</p>
            ) : (
              enrollments.map(e => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEnrollment(e)}
                  className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-0 ${
                    selectedEnrollment?.id === e.id ? 'bg-secondary-container border-secondary' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{e.student_name || 'Unknown Student'}</p>
                      <p className="text-xs text-slate-500">{e.group_name || 'Unknown Group'} • Level {e.level}</p>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      {e.status}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Select New Group */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">New Group</label>
          {selectedGroup ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div>
                <span className="font-medium">{selectedGroup.name}</span>
                <p className="text-xs text-slate-500">{selectedGroup.course_name}</p>
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
                  placeholder="Search groups (min 2 chars)..."
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
                    <p className="text-xs text-slate-500">{g.course_name} • {g.instructor_name}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleTransfer}
        disabled={!selectedEnrollment || !selectedGroup || isLoading}
        className="px-6 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors flex items-center gap-2"
      >
        {isLoading ? <LoadingSpinner size="sm" /> : null}
        <span className="material-symbols-outlined">swap_horiz</span>
        Transfer Enrollment
      </button>
    </div>
  )
}
