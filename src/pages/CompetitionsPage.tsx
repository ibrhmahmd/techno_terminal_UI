import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { CompetitionForm } from '../components/competitions/CompetitionForm'
import { DataTable } from '../components/common/DataTable'
import { useCompetitions, useDeletedCompetitions } from '../hooks/competitions'
import { createCompetition, deleteCompetition, restoreCompetition, isCompetitionDeleted } from '../api/competitions'
import type { Competition, CreateCompetitionInput, UpdateCompetitionInput } from '../api/competitions'

export function CompetitionsPage() {
  const navigate = useNavigate()
  const {
    competitions,
    totalCount,
    isLoading,
    error: hookError,
    setStatusFilter,
    refresh,
  } = useCompetitions()

  // Deleted competitions hook
  const {
    competitions: deletedCompetitions,
    isLoading: isDeletedLoading,
    error: deletedError,
    refresh: refreshDeleted,
  } = useDeletedCompetitions()

  // View states
  const [showDeleted, setShowDeleted] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingCompetition, setDeletingCompetition] = useState<number | null>(null)
  const [restoringCompetition, setRestoringCompetition] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleCreateCompetition = async (data: CreateCompetitionInput | UpdateCompetitionInput) => {
    setIsProcessing(true)
    setActionError(null)
    try {
      await createCompetition(data as CreateCompetitionInput)
      await refresh()
      setIsCreateModalOpen(false)
    } catch {
      setActionError('Failed to create competition')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteCompetition = async (id: number) => {
    setIsProcessing(true)
    setActionError(null)
    try {
      await deleteCompetition(id)
      await refresh()
      setDeletingCompetition(null)
    } catch {
      setActionError('Failed to delete competition')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreCompetition = async (id: number) => {
    setIsProcessing(true)
    setActionError(null)
    try {
      await restoreCompetition(id)
      await refreshDeleted()
      setRestoringCompetition(null)
    } catch {
      setActionError('Failed to restore competition')
    } finally {
      setIsProcessing(false)
    }
  }

  const error = hookError || deletedError || actionError

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Competitions" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
              {showDeleted ? 'Deleted Competitions' : 'Competitions'}
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">
              {showDeleted ? 'Restore or permanently delete competitions' : 'Manage competitions and team registrations'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Trash toggle button */}
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showDeleted
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={showDeleted ? 'Show active competitions' : 'Show deleted competitions'}
            >
              <Trash2 className="w-4 h-4" />
              {showDeleted ? 'Back to Active' : 'Trash'}
            </button>

            {!showDeleted && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create Competition
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {showDeleted ? (
          // Deleted competitions DataTable view
          <DataTable
            data={deletedCompetitions}
            columns={[
              {
                key: 'name',
                header: 'Name',
                cell: (row: Competition) => (
                  <div>
                    <p className="font-medium text-on-surface">{row.name}</p>
                    {row.edition && (
                      <p className="text-xs text-slate-500">{row.edition}</p>
                    )}
                  </div>
                ),
              },
              {
                key: 'location',
                header: 'Location',
                cell: (row: Competition) => row.location,
              },
              {
                key: 'date',
                header: 'Date',
                cell: (row: Competition) =>
                  row.competition_date
                    ? new Date(row.competition_date).toLocaleDateString()
                    : 'TBD',
              },
              {
                key: 'deleted_at',
                header: 'Deleted',
                cell: (row: Competition) =>
                  row.deleted_at
                    ? new Date(row.deleted_at).toLocaleDateString()
                    : '-',
              },
            ]}
            keyExtractor={(row) => row.id.toString()}
            isLoading={isDeletedLoading}
            emptyMessage="No deleted competitions found"
            emptyIcon="trash"
            actions={{
              view: (row) => navigate(`/competitions/${row.id}`),
              restore: (row) => setRestoringCompetition(row.id),
            }}
            actionLabels={{
              view: 'View Details',
              restore: 'Restore',
            }}
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">emoji_events</span>
            <p className="text-slate-500 mb-4">No competitions found</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Create First Competition
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onClick={() => navigate(`/competitions/${competition.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Competition Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Competition"
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
        onClose={() => setDeletingCompetition(null)}
        title="Delete Competition"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingCompetition(null)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deletingCompetition && handleDeleteCompetition(deletingCompetition)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this competition? This will also delete all associated categories and team registrations.
        </p>
      </Modal>

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={!!restoringCompetition}
        onClose={() => setRestoringCompetition(null)}
        title="Restore Competition"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setRestoringCompetition(null)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => restoringCompetition && handleRestoreCompetition(restoringCompetition)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Restore
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to restore this competition? It will become active again.
        </p>
      </Modal>
    </div>
  )
}
