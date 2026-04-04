import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { deleteEnrollment, type Enrollment } from '../../api/enrollments'

interface DropPanelProps {
  isLoading: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

export function DropPanel({ isLoading, onSuccess, onError, setIsLoading }: DropPanelProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)

  const handleDrop = async () => {
    if (!selectedEnrollment) {
      onError('Please select enrollment to drop')
      return
    }
    
    if (!confirm(`Are you sure you want to drop ${selectedEnrollment.student_name || 'this student'} from ${selectedEnrollment.group_name || 'this group'}?`)) {
      return
    }
    
    setIsLoading(true)
    onError('')
    try {
      await deleteEnrollment(selectedEnrollment.id)
      onSuccess('Successfully dropped enrollment')
      setEnrollments(prev => prev.filter(e => e.id !== selectedEnrollment.id))
      setSelectedEnrollment(null)
    } catch {
      onError('Failed to drop enrollment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-2">Drop Enrollment</h2>
      <p className="text-sm text-red-600 mb-6">Warning: This action cannot be undone. The enrollment status will be changed to &quot;dropped&quot;.</p>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-on-surface mb-2">Select Enrollment to Drop</label>
        <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
          {enrollments.length === 0 ? (
            <p className="p-4 text-slate-500 text-sm text-center">No active enrollments to drop</p>
          ) : (
            enrollments.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEnrollment(e)}
                className={`w-full px-4 py-3 text-left border-b border-slate-100 last:border-0 ${
                  selectedEnrollment?.id === e.id ? 'bg-red-50 border-red-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{e.student_name || 'Unknown Student'}</p>
                    <p className="text-xs text-slate-500">{e.group_name || 'Unknown Group'} • Level {e.level}</p>
                    <p className="text-xs text-slate-400 mt-1">Enrolled: {e.enrolled_on}</p>
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

      {selectedEnrollment && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
          <p className="text-sm font-medium text-red-800">
            You are about to drop: {selectedEnrollment.student_name} from {selectedEnrollment.group_name}
          </p>
        </div>
      )}

      <button
        onClick={handleDrop}
        disabled={!selectedEnrollment || isLoading}
        className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors flex items-center gap-2"
      >
        {isLoading ? <LoadingSpinner size="sm" /> : null}
        <span className="material-symbols-outlined">person_remove</span>
        Drop Enrollment
      </button>
    </div>
  )
}
