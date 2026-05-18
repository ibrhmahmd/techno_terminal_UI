import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'
import { CategoryTeamsModal } from '../components/competitions/CategoryTeamsModal'
import { CategoryList } from '../components/competitions/CategoryList'
import { useCompetition, useCompetitionCategories, useCompetitionSummary } from '../hooks/competitions'
import { useTeams } from '../hooks/teams'
import { registerTeam, type RegisterTeamInput } from '../api/teams'
import type { CategoryWithTeamsDTO } from '../api/competitions'
import { queryClient } from '../lib/queryClient'
import { queryKeys } from '../hooks/queryKeys'
import { extractErrorMessage, getErrorStatus } from '../utils/apiErrors'

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const competitionId = id || ''
  const numericId = parseInt(competitionId, 10)

  const {
    competition,
    isLoading: competitionLoading,
    error: competitionError,
    remove: deleteCompetition,
    isMutating: isDeletingCompetition,
  } = useCompetition(competitionId)

  const {
    categories,
    isLoading: categoriesLoading,
  } = useCompetitionCategories(competitionId)

  const { summary, isLoading: summaryLoading } = useCompetitionSummary(numericId)

  const { teams, isLoading: teamsLoading } = useTeams(numericId)

  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'teams' | 'summary'>('overview')

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isCategoryTeamsModalOpen, setIsCategoryTeamsModalOpen] = useState(false)
  const [selectedCategoryTeams, setSelectedCategoryTeams] = useState<CategoryWithTeamsDTO | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isLoading = competitionLoading || categoriesLoading || summaryLoading

  const handleRegisterTeam = async (data: RegisterTeamInput) => {
    try {
      await registerTeam(data)
      setIsRegistrationModalOpen(false)
      setSelectedCategory(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.competitionSummary(numericId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.competitionCategories(numericId) })
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams })
    } catch {
      // Error handled by hook
    }
  }

  const handleDeleteCompetition = async () => {
    setDeleteError(null)
    try {
      await deleteCompetition()
      setIsDeleteModalOpen(false)
      navigate('/competitions')
    } catch (err: unknown) {
      if (getErrorStatus(err) === 409) {
        setDeleteError(extractErrorMessage(err) || 'Cannot delete: this competition has registered teams.')
      }
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Competitions" />
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4" aria-hidden="true">error</span>
          <p className="text-slate-500">Competition not found</p>
          <button
            onClick={() => navigate('/competitions')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            Back to Competitions
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Competitions" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate('/competitions')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
            Back to Competitions
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{competition.name}</h1>
              {competition.edition && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {competition.edition}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/competitions/${competitionId}/edit`)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">edit</span>
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeletingCompetition}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeletingCompetition ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">delete</span>
                )}
                {isDeletingCompetition ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {competitionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {competitionError}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <nav role="tablist" aria-label="Competition details" className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: 'info' },
              { id: 'categories', label: 'Categories', icon: 'category' },
              { id: 'teams', label: 'Teams', icon: 'groups' },
              { id: 'summary', label: 'Summary', icon: 'dashboard' },
            ].map((tab) => (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-600 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load overview</p></div>}>
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* Competition Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">About This Competition</h2>
                {competition.notes && <p className="text-slate-600 mb-4">{competition.notes}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">location_on</span>
                    <span>{competition.location ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">payments</span>
                    <span>{competition.fee_per_student} EGP per student</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">event</span>
                    <span>{competition.competition_date ? formatDate(competition.competition_date) : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">schedule</span>
                    <span>Created {formatDate(competition.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {summary && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <span className="material-symbols-outlined" aria-hidden="true">groups</span>
                      Total Teams
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{summary.total_teams ?? 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <span className="material-symbols-outlined" aria-hidden="true">person</span>
                      Participants
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{summary.total_participants ?? 0}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-on-surface mb-4">Competition Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Location</span>
                    <span className="font-semibold text-on-surface">{competition.location ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Fee per Student</span>
                    <span className="font-semibold text-on-surface">{competition.fee_per_student} EGP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Competition Date</span>
                    <span className="font-semibold text-on-surface">
                      {competition.competition_date ? formatDate(competition.competition_date) : 'TBD'}
                    </span>
                  </div>
                  {competition.edition && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Edition</span>
                      <span className="font-semibold text-on-surface">{competition.edition}</span>
                    </div>
                  )}
                  {competition.edition_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Year</span>
                      <span className="font-semibold text-on-surface">{competition.edition_year}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Created</span>
                      <span className="font-semibold text-slate-500">{formatDate(competition.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </ErrorBoundary>
        )}

        {activeTab === 'categories' && (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load categories</p></div>}>
          <div role="tabpanel" id="panel-categories" aria-labelledby="tab-categories">
          <CategoryList
            categories={categories}
            onRegisterTeam={(categoryName) => {
              setSelectedCategory(categoryName)
              setIsRegistrationModalOpen(true)
            }}
            onViewTeams={(categoryName) => {
              const match = summary?.categories.find(c => c.category === categoryName)
              if (match) {
                setSelectedCategoryTeams(match)
                setIsCategoryTeamsModalOpen(true)
              }
            }}
            onRegisterFirstTeam={() => {
              setSelectedCategory(null)
              setIsRegistrationModalOpen(true)
            }}
          />
          </div>
          </ErrorBoundary>
        )}

        {activeTab === 'teams' && (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load teams</p></div>}>
          <div role="tabpanel" id="panel-teams" aria-labelledby="tab-teams" className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface">Registered Teams</h2>
              <span className="text-sm text-slate-500">{teams?.length ?? 0} teams</span>
            </div>

            {teamsLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : !Array.isArray(teams) || teams.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4" aria-hidden="true">groups</span>
                <p className="text-slate-500 mb-4">No teams registered yet</p>
                <button
                  onClick={() => setIsRegistrationModalOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Register First Team
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/teams/${team.id}`) } }}
                    role="button"
                    tabIndex={0}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary" aria-hidden="true">groups</span>
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{team.team_name}</p>
                        <p className="text-sm text-slate-500">
                          {team.category}{team.subcategory ? ` - ${team.subcategory}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-400" aria-hidden="true">chevron_right</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          </ErrorBoundary>
        )}

        {activeTab === 'summary' && summary && (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load summary</p></div>}>
          <div role="tabpanel" id="panel-summary" aria-labelledby="tab-summary" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Competition Summary</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-secondary">{summary.total_teams ?? 0}</p>
                  <p className="text-sm text-slate-600">Total Teams</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-3xl font-bold text-secondary">{summary.total_participants ?? 0}</p>
                  <p className="text-sm text-slate-600">Students</p>
                </div>
              </div>
            </div>

            {/* Categories breakdown */}
            <div className="space-y-4">
              {(summary.categories ?? []).map((cat, idx) => (
                <div key={`${cat.category}-${cat.subcategory ?? 'none'}-${idx}`} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-on-surface">
                      {cat.category}{cat.subcategory ? ` — ${cat.subcategory}` : ''}
                    </h3>
                    <span className="px-3 py-1 bg-secondary-container text-secondary text-xs rounded-full font-medium">
                      {(cat.teams ?? []).length} Teams
                    </span>
                  </div>
                  {(cat.teams ?? []).length === 0 ? (
                    <p className="text-sm text-slate-500">No teams registered yet</p>
                  ) : (
                    <div className="space-y-2">
                      {(cat.teams ?? []).map((team) => (
                        <div key={team.team.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="font-medium text-on-surface">{team.team.team_name}</p>
                            <p className="text-xs text-slate-500">{team.members.length} members</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </ErrorBoundary>
        )}
      </section>

      {/* Category Teams Modal */}
      <CategoryTeamsModal
        category={selectedCategoryTeams}
        isOpen={isCategoryTeamsModalOpen}
        onClose={() => {
          setIsCategoryTeamsModalOpen(false)
          setSelectedCategoryTeams(null)
        }}
      />

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        competitionId={numericId || 0}
        categoryName={selectedCategory || ''}
        categorySubcategories={Object.fromEntries(categories.map(c => [c.category, c.subcategories]))}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false)
          setSelectedCategory(null)
        }}
        onSubmit={handleRegisterTeam}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteError(null) }}
        title="Delete Competition"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsDeleteModalOpen(false); setDeleteError(null) }}
              disabled={isDeletingCompetition}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCompetition}
              disabled={isDeletingCompetition}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeletingCompetition && <LoadingSpinner size="sm" />}
              Delete
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete <strong>{competition?.name}</strong>?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone. All associated data will be lost.
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
