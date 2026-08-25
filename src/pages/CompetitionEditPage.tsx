import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { CompetitionForm } from '../components/competitions/CompetitionForm'
import { useCompetition } from '../hooks/competitions'
import type { UpdateCompetitionInput, CreateCompetitionInput } from '../api/competitions'

export function CompetitionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('competitions')
  const competitionId = id || ''

  const { competition, isLoading, error, update } = useCompetition(competitionId)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleSubmit = async (data: UpdateCompetitionInput | CreateCompetitionInput) => {
    setSaveError(null)
    try {
      await update(data as UpdateCompetitionInput)
      navigate(`/competitions/${competitionId}`)
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : t('competitionEdit.save_failed'))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4" aria-hidden="true">error</span>
          <p className="text-slate-500">{t('competitionEdit.not_found')}</p>
          <button onClick={() => navigate('/competitions')} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors">
            {t('competitionEdit.back_to_competitions')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Competitions" />
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button onClick={() => navigate(`/competitions/${competitionId}`)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2">
            <span className="material-symbols-outlined text-sm icon-flip-rtl" aria-hidden="true">arrow_back</span>
            {t('competitionEdit.back_to_competition')}
          </button>
          <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{t('competitionEdit.title')}</h1>
        </div>
      </header>
      <section className="p-8 max-w-[700px] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">{error}</div>
        )}
        {saveError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">{saveError}</div>
        )}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <CompetitionForm
            initialData={{
              name: competition.name,
              edition: competition.edition ?? '',
              competition_date: competition.competition_date ?? '',
              location: competition.location ?? '',
              notes: competition.notes ?? '',
              fee_per_student: competition.fee_per_student,
            }}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/competitions/${competitionId}`)}
            mode="edit"
          />
        </div>
      </section>
    </div>
  )
}
