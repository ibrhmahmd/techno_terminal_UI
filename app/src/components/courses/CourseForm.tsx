import { useState, type FormEvent } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { AddNewCourseInput, UpdateCourseDTO, Course } from '../../api/academics'

interface CourseFormProps {
  initialData?: Partial<Course>
  onSubmit: (data: AddNewCourseInput | UpdateCourseDTO) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}

const CATEGORIES = [
'software',
'hardware',
'steam',
'other'
]

export function CourseForm({ initialData, onSubmit, onCancel, mode }: CourseFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [pricePerLevel, setPricePerLevel] = useState(initialData?.price_per_level || 0)
  const [sessionsPerLevel, setSessionsPerLevel] = useState(initialData?.sessions_per_level || 0)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!name.trim()) {
      setError('Course name is required')
      setIsLoading(false)
      return
    }
    if (pricePerLevel <= 0) {
      setError('Price per level must be greater than 0')
      setIsLoading(false)
      return
    }
    if (sessionsPerLevel <= 0) {
      setError('Sessions per level must be greater than 0')
      setIsLoading(false)
      return
    }

    try {
      const payload: AddNewCourseInput | UpdateCourseDTO = {
        name: name.trim(),
        category: category || undefined,
        description: description.trim() || undefined,
        price_per_level: Number(pricePerLevel),
        sessions_per_level: Number(sessionsPerLevel),
        ...(mode === 'edit' && { is_active: isActive }),
      }
      console.log('[CourseForm] Submitting payload:', JSON.stringify(payload, null, 2))
      await onSubmit(payload)
      console.log('[CourseForm] Submit succeeded')
    } catch (err: unknown) {
      console.error('[CourseForm] onSubmit threw:', err)
      const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} course`
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Course Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-on-surface">
          Course Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Enter course name..."
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-on-surface">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-on-surface">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder="Enter course description..."
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      {/* Price and Sessions - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price_per_level" className="text-sm font-medium text-on-surface">
            Price Per Level (EGP) <span className="text-red-500">*</span>
          </label>
          <input
            id="price_per_level"
            type="number"
            min={1}
            step="0.01"
            value={pricePerLevel}
            onChange={(e) => setPricePerLevel(parseFloat(e.target.value) || 0)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sessions_per_level" className="text-sm font-medium text-on-surface">
            Sessions Per Level <span className="text-red-500">*</span>
          </label>
          <input
            id="sessions_per_level"
            type="number"
            min={1}
            value={sessionsPerLevel}
            onChange={(e) => setSessionsPerLevel(parseInt(e.target.value, 10) || 0)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* Active Status - Edit Mode Only */}
      {mode === 'edit' && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <input
            id="is_active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 text-secondary border-slate-300 rounded focus:ring-secondary"
          />
          <label htmlFor="is_active" className="text-sm font-medium text-on-surface cursor-pointer">
            Active Course
          </label>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
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
          {mode === 'create' ? 'Create Course' : 'Update Course'}
        </button>
      </div>
    </form>
  )
}
