import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'
import { CategoryTeamsModal } from '../components/competitions/CategoryTeamsModal'
import { CategoryList } from '../components/competitions/CategoryList'
import { useCompetition, useCompetitionCategories, useCompetitionSummary } from '../hooks/competitions'
import { useTeams } from '../hooks/teams'
import { registerTeam, type RegisterTeamInput } from '../api/teams'
import { isCompetitionDeleted, type CompetitionSummaryCategory } from '../api/competitions'

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const competitionId = id || ''

  const {
    competition,
    isLoading: competitionLoading,
    error: competitionError,
    remove: deleteCompetition,
    restore: restoreCompetitionAction,
    isMutating: isDeletingCompetition,
  } = useCompetition(competitionId)

  const {
    categories,
    isLoading: categoriesLoading,
  } = useCompetitionCategories(competitionId)

  const { summary, isLoading: summaryLoading } = useCompetitionSummary(parseInt(competitionId, 10))

  const { teams, isLoading: teamsLoading } = useTeams({ competition_id: parseInt(competitionId, 10) })

  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'teams' | 'summary'>('overview')

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isCategoryTeamsModalOpen, setIsCategoryTeamsModalOpen] = useState(false)
  const [selectedCategoryTeams, setSelectedCategoryTeams] = useState<CompetitionSummaryCategory | null>(null)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const isLoading = competitionLoading || categoriesLoading || summaryLoading

  const isDeleted = competition ? isCompetitionDeleted(competition) : false

  const handleRegisterTeam = async (data: RegisterTeamInput) => {
    try {
      await registerTeam(data)
      setIsRegistrationModalOpen(false)
      setSelectedCategory(null)
    } catch {
      // Error handled by hook
    }
  }

  const handleDeleteCompetition = async () => {
    try {
      await deleteCompetition()
      setIsDeleteModalOpen(false)
      navigate('/competitions')
    } catch {
      // Error handled by hook
    }
  }

  const formatDate = (dateString: string) => {
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
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">error</span>
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
            <span className="material-symbols-outlined text-sm">arrow_back</span>
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
              {isDeleted && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  Deleted
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isDeleted ? (
                <button
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">restore</span>
                  Restore
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/competitions/${competitionId}/edit`)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
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
                      <span className="material-symbols-outlined text-sm">delete</span>
                    )}
                    {isDeletingCompetition ? 'Deleting...' : 'Delete'}
                  </button>
                </>
              )}
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

        {isDeleted && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-600">warning</span>
              <div>
                <h3 className="font-medium text-red-900">This competition has been deleted</h3>
                <p className="text-sm text-red-700 mt-1">
                  Deleted on {competition.deleted_at ? formatDate(competition.deleted_at) : 'N/A'}
                </p>
                <p className="text-sm text-red-600 mt-2">
                  You can restore this competition to make it active again, or it will be permanently removed after 30 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: 'info' },
              { id: 'categories', label: 'Categories', icon: 'category' },
              { id: 'teams', label: 'Teams', icon: 'groups' },
              { id: 'summary', label: 'Summary', icon: 'dashboard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-slate-600 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Competition Info */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">About This Competition</h2>
                {competition.notes && <p className="text-slate-600 mb-4">{competition.notes}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">location_on</span>
                    <span>{competition.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">payments</span>
                    <span>{competition.fee_per_student} EGP per student</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">event</span>
                    <span>{competition.competition_date ? formatDate(competition.competition_date) : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="material-symbols-outlined text-slate-400">schedule</span>
                    <span>Created {formatDate(competition.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              {summary && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <span className="material-symbols-outlined">groups</span>
                      Total Teams
                    </div>
                    <p className="text-2xl font-bold text-on-surface">{summary.total_teams ?? 0}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                      <span className="material-symbols-outlined">person</span>
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
                    <span className="font-semibold text-on-surface">{competition.location}</span>
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
                  {isDeleted && competition.deleted_at && (
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Deleted</span>
                        <span className="font-semibold text-red-600">{formatDate(competition.deleted_at)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoryList
            categories={categories}
            onRegisterTeam={(categoryName) => {
              setSelectedCategory(categoryName)
              setIsRegistrationModalOpen(true)
            }}
            onViewTeams={(categoryName) => {
              const match = summary?.categories.find(c => c.category_name === categoryName || c.category === categoryName)
              if (match) {
                setSelectedCategoryTeams(match)
                setIsCategoryTeamsModalOpen(true)
              }
            }}
          />
        )}

        {activeTab === 'teams' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
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
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">groups</span>
                <p className="text-slate-500">No teams registered yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => navigate(`/teams/${team.id}`)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-secondary">groups</span>
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{team.team_name}</p>
                        <p className="text-sm text-slate-500">
                          {team.category}{team.subcategory ? ` - ${team.subcategory}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-on-surface">{team.fee} EGP</p>
                        <p className="text-xs text-slate-500">Team fee</p>
                      </div>
                      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'summary' && summary && (
          <div className="space-y-6">
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
              {(summary.categories ?? []).map((cat) => (
                <div key={cat.category_id} className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-on-surface">{cat.category_name}</h3>
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
        competitionId={parseInt(competitionId, 10) || 0}
        categoryName={selectedCategory || ''}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false)
          setSelectedCategory(null)
        }}
        onSubmit={handleRegisterTeam}
      />

      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Competition"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await restoreCompetitionAction()
                setIsRestoreModalOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              Restore
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to restore this competition? It will become active again.
        </p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Competition"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
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
            Are you sure you want to delete <strong>{competition?.name}</strong>?
          </p>
          <p className="text-sm text-slate-500">
            This will soft-delete the competition. You can restore it later from the trash.
          </p>
        </div>
      </Modal>
    </div>
  )
}
