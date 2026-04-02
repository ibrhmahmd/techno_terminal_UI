import { useState, FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { CompetitionCategory, TeamRegistration, RegisterTeamInput } from '../../api/competitions'

interface TeamRegistrationModalProps {
  category: CompetitionCategory | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RegisterTeamInput) => Promise<void>
}

interface TeamMember {
  student_id: string
  student_name: string
  role: 'leader' | 'member'
}

export function TeamRegistrationModal({ category, isOpen, onClose, onSubmit }: TeamRegistrationModalProps) {
  const [teamName, setTeamName] = useState('')
  const [members, setMembers] = useState<TeamMember[]>([
    { student_id: '', student_name: '', role: 'leader' },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddMember = () => {
    if (category && members.length < category.max_team_size) {
      setMembers([...members, { student_id: '', student_name: '', role: 'member' }])
    }
  }

  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index))
    }
  }

  const handleMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!category) return

    // Validation
    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    const validMembers = members.filter(m => m.student_id.trim() && m.student_name.trim())
    if (validMembers.length === 0) {
      setError('At least one team member is required')
      return
    }

    // Check for leader
    const hasLeader = validMembers.some(m => m.role === 'leader')
    if (!hasLeader) {
      setError('At least one team member must be designated as leader')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit({
        competition_id: category.competition_id,
        category_id: category.id,
        team_name: teamName,
        members: validMembers.map(m => ({ student_id: m.student_id, role: m.role })),
      })
      // Reset form
      setTeamName('')
      setMembers([{ student_id: '', student_name: '', role: 'leader' }])
      onClose()
    } catch {
      setError('Failed to register team')
    } finally {
      setIsLoading(false)
    }
  }

  if (!category) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register Team - ${category.name}`}
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
            Team Members ({members.length}/{category.max_team_size})
          </h4>
          {members.length < category.max_team_size && (
            <button
              type="button"
              onClick={handleAddMember}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Add Member
            </button>
          )}
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {members.map((member, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-slate-500">Member {index + 1}</span>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    disabled={isLoading}
                    className="ml-auto p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={member.student_name}
                  onChange={(e) => handleMemberChange(index, 'student_name', e.target.value)}
                  placeholder="Student name"
                  disabled={isLoading}
                  className="col-span-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
                />
                <input
                  type="text"
                  value={member.student_id}
                  onChange={(e) => handleMemberChange(index, 'student_id', e.target.value)}
                  placeholder="Student ID"
                  disabled={isLoading}
                  className="col-span-1 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
                />
                <select
                  value={member.role}
                  onChange={(e) => handleMemberChange(index, 'role', e.target.value as 'leader' | 'member')}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
                >
                  <option value="leader">Leader</option>
                  <option value="member">Member</option>
                </select>
              </div>
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
