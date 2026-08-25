import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { CreateCompetitionInput, UpdateCompetitionInput } from '../../api/competitions'

interface CompetitionFormProps {
  initialData?: Partial<CreateCompetitionInput>
  onSubmit: (data: CreateCompetitionInput | UpdateCompetitionInput) => Promise<void>
  onCancel: () => void
  mode: 'create' | 'edit'
}

export function CompetitionForm({ initialData, onSubmit, onCancel, mode }: CompetitionFormProps) {
  const { t } = useTranslation('competitions')
  const [formData, setFormData] = useState<CreateCompetitionInput>({
    name: initialData?.name || '',
    edition: initialData?.edition || '',
    competition_date: initialData?.competition_date || '',
    location: initialData?.location || '',
    notes: initialData?.notes || '',
    fee_per_student: initialData?.fee_per_student ?? 0,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof CreateCompetitionInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setError(t('form.error_name_required'))
      return
    }
    if (!formData.location?.trim()) {
      setError(t('form.error_location_required'))
      return
    }
    if ((formData.fee_per_student ?? 0) < 0) {
      setError(t('form.error_fee_negative'))
      return
    }

    setIsLoading(true)
    try {
      // Clean up empty strings - convert to null for optional fields
      const cleanedData = {
        ...formData,
        competition_date: formData.competition_date || null,
        edition: formData.edition || null,
        notes: formData.notes || null,
      }
      await onSubmit(cleanedData)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : mode === 'create' ? t('form.error_create_failed') : t('form.error_update_failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-medium text-on-surface">
            {t('form.name_label')} <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={t('form.name_placeholder')}
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="notes" className="text-sm font-medium text-on-surface">
          {t('form.notes_label')}
        </label>
        <textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder={t('form.notes_placeholder')}
          rows={3}
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
          <label htmlFor="location" className="text-sm font-medium text-on-surface">
            {t('form.location_label')} <span className="text-red-500">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder={t('form.location_placeholder')}
          required
          disabled={isLoading}
          className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="competition_date" className="text-sm font-medium text-on-surface">
            {t('form.date_label')}
          </label>
          <input
            id="competition_date"
            type="date"
            value={formData.competition_date || ''}
            onChange={(e) => handleChange('competition_date', e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="edition" className="text-sm font-medium text-on-surface">
            {t('form.edition_label')}
          </label>
          <input
            id="edition"
            type="text"
            value={formData.edition || ''}
            onChange={(e) => handleChange('edition', e.target.value)}
            placeholder={t('form.edition_placeholder')}
            disabled={isLoading}
            className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
          <label htmlFor="fee_per_student" className="text-sm font-medium text-on-surface">
            {t('form.fee_label')} <span className="text-red-500">*</span>
        </label>
        <input
          id="fee_per_student"
          type="number"
          min={0}
          value={formData.fee_per_student}
          onChange={(e) => handleChange('fee_per_student', parseInt(e.target.value, 10) || 0)}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
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
          {t('form.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
        >
          {isLoading && <LoadingSpinner size="sm" />}
          {mode === 'create' ? t('form.create') : t('form.update')}
        </button>
      </div>
    </form>
  )
}
