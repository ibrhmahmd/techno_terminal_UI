import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'
import { CategoryList } from '../components/competitions/CategoryList'
import { useCompetition, useCompetitionCategories } from '../hooks/competitions'
import { getCategoryTeams, registerTeam, type CreateCategoryInput, type RegisterTeamInput, type TeamRegistration } from '../api/competitions'
import { paymentStatusColors } from '../utils/colors'

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const competitionId = id || ''

  // Use custom hooks for data management
  const {
    competition,
    isLoading: competitionLoading,
    error: competitionError,
  } = useCompetition(competitionId)

  const {
    categories,
    isLoading: categoriesLoading,
    add: addCategory,
    remove: deleteCategory,
  } = useCompetitionCategories(competitionId)

  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(categories.find(c => c.id === '') || null)
  const [selectedCategoryName, setSelectedCategoryName] = useState('')

  // Teams state for viewing modal
  const [teams, setTeams] = useState<TeamRegistration[]>([])
  const [, setTeamsLoading] = useState(false)

  const isLoading = competitionLoading || categoriesLoading

  const handleAddCategory = async (data: CreateCategoryInput) => {
    try {
      await addCategory(data)
      setIsAddCategoryModalOpen(false)
    } catch {
      // Error handled by hook
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
    } catch {
      // Error handled by hook
    }
  }

  const handleRegisterTeam = async (data: RegisterTeamInput) => {
    try {
      await registerTeam(data)
      setIsRegistrationModalOpen(false)
      setSelectedCategory(null)
    } catch {
      // Error handled by modal
    }
  }

  const handleViewTeams = async (categoryId: string, categoryName: string) => {
    setSelectedCategoryName(categoryName)
    setIsTeamsModalOpen(true)
    setTeamsLoading(true)
    try {
      const numericCompetitionId = parseInt(competitionId, 10)
      const teamsData = await getCategoryTeams(numericCompetitionId, categoryId)
      setTeams(teamsData)
    } catch {
      setTeams([])
    } finally {
      setTeamsLoading(false)
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
            </div>
            {/* Registration status removed - not supported by current API */}
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {competitionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {competitionError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
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

            {/* Categories */}
            <CategoryList
              categories={categories}
              competitionId={competitionId}
              onAddCategory={() => setIsAddCategoryModalOpen(true)}
              onDeleteCategory={handleDeleteCategory}
              onRegisterTeam={(categoryId) => {
                const category = categories.find(c => c.id === categoryId)
                setSelectedCategory(category || null)
                setIsRegistrationModalOpen(true)
              }}
              onViewTeams={handleViewTeams}
              canManage={true}
            />
          </div>

          {/* Sidebar - Basic Info */}
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
      </section>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add Competition Category"
      >
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setIsAddCategoryModalOpen(false)}
        />
      </Modal>

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        category={selectedCategory}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false)
          setSelectedCategory(null)
        }}
        onSubmit={handleRegisterTeam}
      />

      {/* View Teams Modal */}
      <Modal
        isOpen={isTeamsModalOpen}
        onClose={() => setIsTeamsModalOpen(false)}
        title={`Registered Teams - ${selectedCategoryName}`}
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {teams.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No teams registered yet</p>
          ) : (
            teams.map(team => (
              <div key={team.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-on-surface">{team.team_name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusColors[team.payment_status] || 'bg-slate-100 text-slate-600'}`}>
                    {team.payment_status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">Registered {formatDate(team.registration_date)}</p>
                <div className="flex flex-wrap gap-2">
                  {team.members.map(member => (
                    <span key={member.id} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                      {member.student_name} ({member.role})
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  )
}

// Category Form Component
interface CategoryFormProps {
  onSubmit: (data: CreateCategoryInput) => Promise<void>
  onCancel: () => void
}

function CategoryForm({ onSubmit, onCancel }: CategoryFormProps) {
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
