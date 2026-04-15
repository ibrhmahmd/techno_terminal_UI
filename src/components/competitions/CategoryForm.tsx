import React, { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { CreateCategoryInput } from '../../api/competitions'

interface CategoryFormProps {
  onSubmit: (data: CreateCategoryInput) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: '',
    description: '',
    min_age: undefined,
    max_age: undefined,
    max_team_size: 3,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }
    if (formData.max_team_size < 1) {
      setError('Team size must be at least 1')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch {
      setError('Failed to add category')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Line Follower"
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the category..."
          rows={2}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Min Age</label>
          <input
            type="number"
            min={5}
            max={25}
            value={formData.min_age || ''}
            onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
            placeholder="Optional"
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">Max Age</label>
          <input
            type="number"
            min={5}
            max={25}
            value={formData.max_age || ''}
            onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? parseInt(e.target.value, 10) : undefined })}
            placeholder="Optional"
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-on-surface">
          Max Team Size <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={formData.max_team_size}
          onChange={(e) => setFormData({ ...formData, max_team_size: parseInt(e.target.value, 10) || 1 })}
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

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
          Add Category
        </button>
      </div>
    </form>
  )
}
