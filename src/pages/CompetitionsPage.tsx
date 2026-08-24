import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { CompetitionForm } from '../components/competitions/CompetitionForm'
import { CompetitionsTable } from '../components/competitions'
import { CardGrid } from '../components/directory/CardGrid'
import { ViewToggle } from '../components/groups/ViewToggle'
import { useCompetitions } from '../hooks/competitions'
import { queryClient } from '../lib/queryClient'
import { queryKeys } from '../hooks/queryKeys'
import { createCompetition, deleteCompetition } from '../api/competitions'
import type { CreateCompetitionInput, UpdateCompetitionInput } from '../api/competitions'

export function CompetitionsPage() {
  const { t } = useTranslation('competitions')
  const navigate = useNavigate()
  const {
    competitions,
    isLoading,
    error: hookError,
  } = useCompetitions()

  // View states
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingCompetition, setDeletingCompetition] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleCreateCompetition = async (data: CreateCompetitionInput | UpdateCompetitionInput) => {
    setIsProcessing(true)
    setActionError(null)
    try {
      await createCompetition(data as CreateCompetitionInput)
      queryClient.invalidateQueries({ queryKey: queryKeys.competitions })
      setIsCreateModalOpen(false)
    } catch {
      setActionError(t('toast.create_failed'))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteCompetition = async (id: number) => {
    setIsProcessing(true)
    setDeleteError(null)
    try {
      await deleteCompetition(id)
      queryClient.invalidateQueries({ queryKey: queryKeys.competitions })
      setDeletingCompetition(null)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      if (axiosErr.response?.status === 409) {
        setDeleteError(axiosErr.response.data?.message || t('toast.delete_conflict'))
      } else {
        setActionError(t('toast.delete_failed'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const error = hookError || actionError

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
              {t('page_title')}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle value={viewMode} onChange={setViewMode} />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
              {t('actions.create')}
            </button>
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12" role="status" aria-live="polite" aria-busy="true">
            <LoadingSpinner />
            <span className="sr-only">{t('loading')}</span>
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4" aria-hidden="true">emoji_events</span>
            <p className="text-slate-500 mb-4">{t('empty.no_competitions')}</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              {t('actions.create_first')}
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <CompetitionsTable
            data={competitions}
            onView={(row) => navigate(`/competitions/${row.id}`)}
            onDelete={(row) => setDeletingCompetition(row.id)}
          />
        ) : (
          <CardGrid>
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onClick={() => navigate(`/competitions/${competition.id}`)}
              />
            ))}
          </CardGrid>
        )}
      </section>

      {/* Create Competition Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={t('actions.create')}
      >
        <CompetitionForm
          onSubmit={handleCreateCompetition}
          onCancel={() => setIsCreateModalOpen(false)}
          mode="create"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCompetition}
        onClose={() => { setDeletingCompetition(null); setDeleteError(null) }}
        title={t('dialogs.delete_title')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setDeletingCompetition(null); setDeleteError(null) }}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {t('dialogs.cancel')}
            </button>
            <button
              onClick={() => deletingCompetition && handleDeleteCompetition(deletingCompetition)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              {t('dialogs.delete')}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t('dialogs.delete_message')}
          </p>
          <p className="text-sm text-red-600">
            {t('dialogs.delete_warning')}
          </p>
          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
              {deleteError}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
