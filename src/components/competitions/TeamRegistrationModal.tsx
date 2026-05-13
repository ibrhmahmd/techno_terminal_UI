import { useState, type FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { RegisterTeamInput } from '../../api/teams'

interface TeamRegistrationModalProps {
  categoryName: string
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RegisterTeamInput) => Promise<void>
}

export function TeamRegistrationModal({ categoryName, isOpen, onClose, onSubmit }: TeamRegistrationModalProps) {
  const [teamName, setTeamName] = useState('')
  const [studentIds, setStudentIds] = useState<string[]>([''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddStudentId = () => {
    setStudentIds([...studentIds, ''])
  }

  const handleRemoveStudentId = (index: number) => {
    if (studentIds.length > 1) {
      setStudentIds(studentIds.filter((_, i) => i !== index))
    }
  }

  const handleStudentIdChange = (index: number, value: string) => {
    const updated = [...studentIds]
    updated[index] = value
    setStudentIds(updated)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    const validIds = studentIds.map(s => parseInt(s, 10)).filter(id => !isNaN(id) && id > 0)
    if (validIds.length === 0) {
      setError('At least one student ID is required')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        competition_id: 0,
        team_name: teamName,
        category: categoryName,
        student_ids: validIds,
      })
      setTeamName('')
      setStudentIds([''])
      onClose()
    } catch {
      setError('Failed to register team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register Team - ${categoryName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="team_name" className="text-sm font-medium text-on-surface">
            Team Name <span className="text-red-500">*</span>
          </label>
          <input
            id="team_name"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name..."
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        <div className="flex items-center justify-between">
          <h4 className="font-medium text-on-surface">
            Student IDs ({studentIds.length})
          </h4>
          <button
            type="button"
            onClick={handleAddStudentId}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Student
          </button>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {studentIds.map((sid, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="number"
                value={sid}
                onChange={(e) => handleStudentIdChange(index, e.target.value)}
                placeholder={`Student ID ${index + 1}`}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
              />
              {studentIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStudentId(index)}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            Register Team
          </button>
        </div>
      </form>
    </Modal>
  )
}
