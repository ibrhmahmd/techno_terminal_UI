import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('courses')
  const [name, setName] = useState(initialData?.name || '')
  const [category, setCategory] = useState(initialData?.category || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [pricePerLevel, setPricePerLevel] = useState(initialData?.price_per_level || 0)
  const [sessionsPerLevel, setSessionsPerLevel] = useState(initialData?.sessions_per_level || 0)
  const [maxLevels, setMaxLevels] = useState(initialData?.max_levels || 0)
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!name.trim()) {
      setError(t('courseForm.error_name_required'))
      setIsLoading(false)
      return
    }
    if (pricePerLevel <= 0) {
      setError(t('courseForm.error_price_zero'))
      setIsLoading(false)
      return
    }
    if (sessionsPerLevel <= 0) {
      setError(t('courseForm.error_sessions_zero'))
      setIsLoading(false)
      return
    }
    if (sessionsPerLevel > 100) {
      setError(t('courseForm.error_sessions_max'))
      setIsLoading(false)
      return
    }
    if (mode === 'create') {
      if (maxLevels <= 0) {
        setError(t('courseForm.error_levels_zero'))
        setIsLoading(false)
        return
      }
      if (maxLevels > 30) {
        setError(t('courseForm.error_levels_max'))
        setIsLoading(false)
        return
      }
      const totalSessions = maxLevels * sessionsPerLevel
      if (totalSessions > 300) {
        setError(t('courseForm.error_total_sessions_max', { total: totalSessions, levels: maxLevels, sessions: sessionsPerLevel }))
        setIsLoading(false)
        return
      }
    }

    try {
      const payload: AddNewCourseInput | UpdateCourseDTO = {
        name: name.trim(),
        category: category || undefined,
        description: description.trim() || undefined,
        price_per_level: Number(pricePerLevel),
        sessions_per_level: Number(sessionsPerLevel),
        max_levels: Number(maxLevels),
        ...(mode === 'edit' && { is_active: isActive }),
      }
      await onSubmit(payload)
    } catch (err: unknown) {
      console.error('[CourseForm] onSubmit threw:', err)
      const errorMessage = err instanceof Error ? err.message : mode === 'create' ? t('courseForm.error_create_failed') : t('courseForm.error_update_failed')
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
          {t('courseForm.name_label')} <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isLoading}
          placeholder={t('courseForm.name_placeholder')}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-on-surface">
          {t('courseForm.category_label')}
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        >
          <option value="">{t('courseForm.category_placeholder')}</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-on-surface">
          {t('courseForm.description_label')}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder={t('courseForm.description_placeholder')}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      {/* Price and Sessions - Side by Side */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="price_per_level" className="text-sm font-medium text-on-surface">
            {t('courseForm.price_per_level')} <span className="text-red-500">*</span>
          </label>
          <input
            id="price_per_level"
            type="number"
            min={1}
            step="0.01"
            value={pricePerLevel}
            onChange={(e) => setPricePerLevel(parseFloat(e.target.value) || 0)}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
            required
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="sessions_per_level" className="text-sm font-medium text-on-surface">
            {t('courseForm.sessions_per_level')} <span className="text-red-500">*</span>
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

      {/* Max Levels and Total Sessions */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="max_levels" className="text-sm font-medium text-on-surface">
            {t('courseForm.max_levels')} <span className="text-red-500">*</span>
          </label>
          <input
            id="max_levels"
            type="number"
            min={1}
            max={30}
            value={maxLevels}
            onChange={(e) => setMaxLevels(parseInt(e.target.value, 10) || 0)}
            required={mode === 'create'}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-on-surface">
            {t('courseForm.total_sessions')}
          </label>
          <div className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600">
            {maxLevels * sessionsPerLevel || 0}
          </div>
        </div>
      </div>

      {/* Warning for high total sessions */}
      {maxLevels * sessionsPerLevel > 300 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
          <span className="material-symbols-outlined text-lg mt-0.5">warning</span>
          <span
            dangerouslySetInnerHTML={{ __html: t('courseForm.warning_total_sessions', { total: maxLevels * sessionsPerLevel, levels: maxLevels, sessions: sessionsPerLevel }) }}
          />
        </div>
      )}

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
            {t('courseForm.active_course')}
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
          {t('courseForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? t('courseForm.create') : t('courseForm.update')}
        </button>
      </div>
    </form>
  )
}
