import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { StudentMultiSelector, type StudentSelection } from '../common/StudentMultiSelector'
import type { RegisterTeamInput } from '../../api/teams'
import { extractErrorMessage, getErrorStatus } from '../../utils/apiErrors'

interface TeamRegistrationModalProps {
  competitionId: number
  categoryName: string
  categorySubcategories?: Record<string, string[]>
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RegisterTeamInput) => Promise<void>
}

export function TeamRegistrationModal({ competitionId, categoryName, categorySubcategories, isOpen, onClose, onSubmit }: TeamRegistrationModalProps) {
  const [teamName, setTeamName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryName)
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<StudentSelection[]>([])
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(categoryName)
      setSelectedSubcategory('')
    }
  }, [isOpen, categoryName])

  const existingCategories = useMemo(() => Object.keys(categorySubcategories || {}), [categorySubcategories])
  const subcategoriesForCategory = useMemo(
    () => (selectedCategory ? categorySubcategories?.[selectedCategory] ?? [] : []),
    [categorySubcategories, selectedCategory]
  )
  const categoryHasSubcategories = subcategoriesForCategory.length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    if (!selectedCategory.trim()) {
      setError('Category is required')
      return
    }

    if (categoryHasSubcategories && !selectedSubcategory.trim()) {
      setError(`Subcategory is required for "${selectedCategory}". Choose from: ${subcategoriesForCategory.join(', ')}`)
      return
    }

    if (selectedStudents.length === 0) {
      setError('At least one student is required')
      return
    }

    const student_ids = selectedStudents.map(s => s.student.id)
    const student_fees: Record<string, number> = {}
    selectedStudents.forEach(s => {
      if (s.fee !== undefined) {
        student_fees[s.student.id.toString()] = s.fee
      }
    })

    setIsLoading(true)
    try {
      await onSubmit({
        competition_id: competitionId,
        team_name: teamName,
        category: selectedCategory.trim(),
        subcategory: selectedSubcategory.trim() || undefined,
        student_ids,
        student_fees: Object.keys(student_fees).length > 0 ? student_fees : undefined,
        project_name: projectName.trim() || undefined,
        project_description: projectDescription.trim() || undefined,
      })
      setTeamName('')
      setSelectedCategory('')
      setSelectedSubcategory('')
      setSelectedStudents([])
      setProjectName('')
      setProjectDescription('')
      onClose()
    } catch (err: unknown) {
      if (getErrorStatus(err) === 409) {
        setError(extractErrorMessage(err) || 'A selected student is already in another team for this competition.')
      } else {
        setError('Failed to register team')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register Team"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-on-surface">
              Category <span className="text-red-500">*</span>
            </label>
            {existingCategories.length > 0 ? (
              <input
                id="category"
                type="text"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubcategory('') }}
                placeholder="Type or pick a category..."
                list="category-list"
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
              />
            ) : (
              <input
                id="category"
                type="text"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="e.g. Robotics, Programming..."
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
              />
            )}
            {existingCategories.length > 0 && (
              <datalist id="category-list">
                {existingCategories.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="subcategory" className="text-sm font-medium text-on-surface">
              Subcategory{categoryHasSubcategories && <span className="text-red-500"> *</span>}
            </label>
            {categoryHasSubcategories ? (
              <select
                id="subcategory"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                required
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
              >
                <option value="">Select subcategory...</option>
                {subcategoriesForCategory.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            ) : (
              <input
                id="subcategory"
                type="text"
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                placeholder="Optional subcategory..."
                disabled={isLoading}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
              />
            )}
          </div>
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="project_name" className="text-sm font-medium text-on-surface">
            Project Name
          </label>
          <input
            id="project_name"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Optional project name..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="project_description" className="text-sm font-medium text-on-surface">
            Project Description
          </label>
          <textarea
            id="project_description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Optional project description..."
            rows={3}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-on-surface mb-2">Students</h4>
          <StudentMultiSelector
            selected={selectedStudents}
            onChange={setSelectedStudents}
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
            Register Team
          </button>
        </div>
      </form>
    </Modal>
  )
}
