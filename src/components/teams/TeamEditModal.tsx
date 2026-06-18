import { useState, type FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { InstructorCombobox } from '../staff/InstructorCombobox'
import type { UpdateTeamInput, TeamDTO } from '../../api/teams'
import type { EmployeeListItem } from '../../api/hr'
import { extractErrorMessage } from '../../utils/apiErrors'

interface TeamEditModalProps {
  team: TeamDTO
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UpdateTeamInput) => Promise<void>
}

export function TeamEditModal({ team, isOpen, onClose, onSubmit }: TeamEditModalProps) {
  const [teamName, setTeamName] = useState(team.team_name)
  const [category, setCategory] = useState(team.category)
  const [subcategory, setSubcategory] = useState(team.subcategory ?? '')
  const [projectName, setProjectName] = useState(team.project_name ?? '')
  const [projectDescription, setProjectDescription] = useState(team.project_description ?? '')
  const [notes, setNotes] = useState(team.notes ?? '')
  const [selectedInstructor, setSelectedInstructor] = useState<EmployeeListItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    if (!category.trim()) {
      setError('Category is required')
      return
    }

    setIsLoading(true)
    try {
      const payload: UpdateTeamInput = {
        team_name: teamName,
        category: category.trim(),
        subcategory: subcategory.trim() || undefined,
        project_name: projectName.trim() || undefined,
        project_description: projectDescription.trim() || undefined,
        notes: notes.trim() || undefined,
      }
      if (selectedInstructor) {
        payload.coach_id = selectedInstructor.id
      }
      await onSubmit(payload)
      onClose()
    } catch (err: unknown) {
      setError(extractErrorMessage(err) || 'Failed to update team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit_name" className="text-sm font-medium text-on-surface">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit_name"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit_category" className="text-sm font-medium text-on-surface">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              id="edit_category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit_subcategory" className="text-sm font-medium text-on-surface">
            Subcategory
          </label>
          <input
            id="edit_subcategory"
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Optional subcategory..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit_project_name" className="text-sm font-medium text-on-surface">
            Project Name
          </label>
          <input
            id="edit_project_name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Optional project name..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit_project_description" className="text-sm font-medium text-on-surface">
            Project Description
          </label>
          <textarea
            id="edit_project_description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Optional project description..."
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="edit_notes" className="text-sm font-medium text-on-surface">
            Notes
          </label>
          <textarea
            id="edit_notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            rows={2}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            Instructor <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <InstructorCombobox
            value={selectedInstructor}
            onChange={setSelectedInstructor}
          />
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
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  )
}
