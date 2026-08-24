import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'
import { CategoryTeamsModal } from '../components/competitions/CategoryTeamsModal'
import type { CategoryResponse } from '../api/competitions'
import { useCompetition, useCompetitionCategories, useCompetitionSummary } from '../hooks/competitions'
import { useTeams } from '../hooks/teams'
import { registerTeam, type RegisterTeamInput } from '../api/teams'
import type { CategoryWithTeamsDTO } from '../api/competitions'
import { TeamsTab } from '../components/competitions/TeamsTab'
import { queryClient } from '../lib/queryClient'
import { queryKeys } from '../hooks/queryKeys'
import { extractErrorMessage, getErrorStatus } from '../utils/apiErrors'

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('competitions')
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

  const [activeTab, setActiveTab] = useState<'overview' | 'teams'>('overview')

  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isCategoryTeamsModalOpen, setIsCategoryTeamsModalOpen] = useState(false)
  const [selectedCategoryTeams, setSelectedCategoryTeams] = useState<CategoryWithTeamsDTO | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const isLoading = competitionLoading || categoriesLoading || summaryLoading

  const handleRegisterTeam = async (data: RegisterTeamInput) => {
    await registerTeam(data)
    setIsRegistrationModalOpen(false)
    setSelectedCategory(null)
    queryClient.invalidateQueries({ queryKey: queryKeys.competitionSummary(numericId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.competitionCategories(numericId) })
    queryClient.invalidateQueries({ queryKey: queryKeys.teamsByCompetition(numericId) })
  }

  const handleDeleteCompetition = async () => {
    setDeleteError(null)
    try {
      await deleteCompetition()
      setIsDeleteModalOpen(false)
      navigate('/competitions')
    } catch (err: unknown) {
      if (getErrorStatus(err) === 409) {
        setDeleteError(extractErrorMessage(err) || t('competitionDetail.delete_conflict'))
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
          <p className="text-slate-500">{t('competitionDetail.not_found')}</p>
          <button
            onClick={() => navigate('/competitions')}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            {t('competitionDetail.back_to_competitions')}
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
            <span className="material-symbols-outlined text-sm icon-flip-rtl" aria-hidden="true">arrow_back</span>
            {t('competitionDetail.back_to_competitions')}
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
                {t('competitionDetail.edit')}
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
                {isDeletingCompetition ? t('competitionDetail.deleting') : t('competitionDetail.delete')}
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
              { id: 'overview', label: t('competitionDetail.tab_overview'), icon: 'info' },
              { id: 'teams', label: t('competitionDetail.tab_teams'), icon: 'groups' },
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
            <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">{t('competitionDetail.failed_overview')}</p></div>}>
          <div
            role="tabpanel"
            id="panel-overview"
            aria-labelledby="tab-overview"
            className="space-y-6"
          >
            {/* Competition Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">{t('competitionDetail.about')}</h2>
              {competition.notes && <p className="text-slate-600 mb-4">{competition.notes}</p>}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">location_on</span>
                  <span>{competition.location ?? t('competitionDetail.na')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">payments</span>
                  <span>{competition.fee_per_student != null ? t('competitionDetail.egp_per_student', { fee: competition.fee_per_student }) : t('competitionDetail.no_fee_set')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">event</span>
                  <span>{competition.competition_date ? formatDate(competition.competition_date) : t('competitionDetail.date_tbd')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400" aria-hidden="true">schedule</span>
                  <span>{t('competitionDetail.created', { date: formatDate(competition.created_at) })}</span>
                </div>
              </div>
              {competition.edition && (
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <span className="font-semibold">{t('competitionDetail.edition_label')}</span> {competition.edition}
                  {competition.edition_year && <span>({competition.edition_year})</span>}
                </div>
              )}
            </div>

            {/* Stats Row */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                    <span className="material-symbols-outlined" aria-hidden="true">groups</span>
                    {t('competitionDetail.total_teams')}
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{summary.total_teams ?? 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
                    <span className="material-symbols-outlined" aria-hidden="true">person</span>
                    {t('competitionDetail.participants')}
                  </div>
                  <p className="text-2xl font-bold text-on-surface">{summary.total_participants ?? 0}</p>
                </div>
              </div>
            )}

            {/* Categories Grid */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-headline text-lg font-semibold text-on-surface mb-4">
                {t('competitionDetail.categories_title', { count: categories.length })}
              </h3>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-slate-300 mb-2" aria-hidden="true">category</span>
                  <p className="text-slate-500 mb-4">{t('competitionDetail.categories_empty')}</p>
                  <button
                    onClick={() => { setSelectedCategory(null); setIsRegistrationModalOpen(true) }}
                    className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    {t('competitionDetail.register_first_team')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat: CategoryResponse) => (
                    <div
                      key={cat.category}
                      className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-on-surface">{cat.category}</h4>
                        </div>
                      </div>

                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {cat.subcategories.map((sub) => (
                            <span key={sub} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                              {sub}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const match = summary?.categories?.find(c => c.category === cat.category)
                            if (match) { setSelectedCategoryTeams(match); setIsCategoryTeamsModalOpen(true) }
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
                        >
                          {t('competitionDetail.view_teams')}
                        </button>
                        <button
                          onClick={() => { setSelectedCategory(cat.category); setIsRegistrationModalOpen(true) }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                        >
                          {t('competitionDetail.register_team')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </ErrorBoundary>
        )}

        {activeTab === 'teams' && (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">{t('competitionDetail.failed_teams')}</p></div>}>
          <div role="tabpanel" id="panel-teams" aria-labelledby="tab-teams">
            <TeamsTab
              teams={teams}
              categories={categories.map(c => c.category)}
              isLoading={teamsLoading}
              onRegisterTeam={() => { setSelectedCategory(null); setIsRegistrationModalOpen(true) }}
            />
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
        title={t('competitionDetail.delete_title')}
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setIsDeleteModalOpen(false); setDeleteError(null) }}
              disabled={isDeletingCompetition}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {t('common:buttons.cancel')}
            </button>
            <button
              onClick={handleDeleteCompetition}
              disabled={isDeletingCompetition}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isDeletingCompetition && <LoadingSpinner size="sm" />}
              {t('competitionDetail.delete')}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            {t('competitionDetail.delete_confirm', { name: competition?.name })}
          </p>
          <p className="text-sm text-red-600">
            {t('competitionDetail.delete_warning')}
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
