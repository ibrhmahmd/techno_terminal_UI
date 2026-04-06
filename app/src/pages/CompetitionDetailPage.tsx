import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from "../components/dashboard/TopNavbar";
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'
import { CategoryList } from '../components/competitions/CategoryList'
import { 
  getCompetition, 
  getCompetitionCategories,
  getCategoryTeams,
  addCompetitionCategory,
  deleteCategory,
  registerTeam,
  type Competition,
  type CompetitionCategory,
  type TeamRegistration,
  type CreateCategoryInput,
  type RegisterTeamInput
} from '../api/competitions'
import { competitionStatusColors, paymentStatusColors } from '../utils/colors'

// Mock data for fallback
const MOCK_COMPETITION: Competition = {
  id: '1',
  name: 'Robotics Championship 2026',
  description: 'Annual robotics competition featuring line following, maze solving, and sumo wrestling challenges. Open to all students aged 10-18.',
  location: 'Cairo STEM Center',
  start_date: '2026-05-15',
  end_date: '2026-05-17',
  registration_deadline: '2026-04-30',
  status: 'upcoming',
  max_teams: 50,
  registered_teams: 32,
  total_participants: 96,
  fee_per_participant: 200,
}

const MOCK_CATEGORIES: CompetitionCategory[] = [
  { id: '1', competition_id: '1', name: 'Line Follower', description: 'Build a robot that follows a line track', min_age: 10, max_age: 14, max_team_size: 3, registered_teams: 12 },
  { id: '2', competition_id: '1', name: 'Maze Solver', description: 'Navigate through a complex maze autonomously', min_age: 12, max_age: 16, max_team_size: 3, registered_teams: 8 },
  { id: '3', competition_id: '1', name: 'Sumo Wrestling', description: 'Push opponent robot out of the ring', min_age: 14, max_age: 18, max_team_size: 2, registered_teams: 12 },
]

const MOCK_TEAMS: TeamRegistration[] = [
  {
    id: '1',
    category_id: '1',
    team_name: 'Robo Warriors',
    members: [
      { id: '1', student_id: 's1', student_name: 'Ahmed Ali', role: 'leader', fee_paid: true },
      { id: '2', student_id: 's2', student_name: 'Mohamed Hassan', role: 'member', fee_paid: true },
    ],
    registration_date: '2026-03-15',
    payment_status: 'paid',
    total_fee: 400,
  },
  {
    id: '2',
    category_id: '1',
    team_name: 'Tech Titans',
    members: [
      { id: '3', student_id: 's3', student_name: 'Sarah Ahmed', role: 'leader', fee_paid: false },
      { id: '4', student_id: 's4', student_name: 'Fatima Omar', role: 'member', fee_paid: false },
    ],
    registration_date: '2026-03-18',
    payment_status: 'pending',
    total_fee: 400,
  },
]

export function CompetitionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const competitionId = id || ''
  
  const [competition, setCompetition] = useState<Competition | null>(null)
  const [categories, setCategories] = useState<CompetitionCategory[]>([])
  const [teams, setTeams] = useState<TeamRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  // Modal states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CompetitionCategory | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [_isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadCompetitionData() {
      setIsLoading(true)
      setError(null)
      try {
        const [compData, catData] = await Promise.all([
          getCompetition(competitionId).catch(() => {
            setUseMockData(true)
            return MOCK_COMPETITION
          }),
          getCompetitionCategories(competitionId).catch(() => {
            setUseMockData(true)
            return MOCK_CATEGORIES
          }),
        ])
        setCompetition(compData)
        setCategories(catData)
      } catch {
        setCompetition(MOCK_COMPETITION)
        setCategories(MOCK_CATEGORIES)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompetitionData()
  }, [competitionId])

  const handleAddCategory = async (data: CreateCategoryInput) => {
    setIsProcessing(true)
    try {
      const newCategory = await addCompetitionCategory(competitionId, data)
      setCategories(prev => [...prev, newCategory])
      setIsAddCategoryModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to add category')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(competitionId, categoryId)
      setCategories(prev => prev.filter(c => c.id !== categoryId))
      setError(null)
    } catch {
      setError('Failed to delete category')
    }
  }

  const handleRegisterTeam = async (data: RegisterTeamInput) => {
    setIsProcessing(true)
    try {
      await registerTeam(data)
      setIsRegistrationModalOpen(false)
      setSelectedCategory(null)
      // Refresh categories to show updated team count
      const updatedCategories = await getCompetitionCategories(competitionId).catch(() => categories)
      setCategories(updatedCategories)
      setError(null)
    } catch {
      setError('Failed to register team')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewTeams = async (categoryId: string, categoryName: string) => {
    setSelectedCategoryName(categoryName)
    setIsTeamsModalOpen(true)
    try {
      const teamsData = await getCategoryTeams(competitionId, categoryId).catch(() => MOCK_TEAMS)
      setTeams(teamsData)
    } catch {
      setTeams(MOCK_TEAMS)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const isRegistrationOpen = () => {
    if (!competition) return false
    const now = new Date()
    const deadline = new Date(competition.registration_deadline)
    return now <= deadline && (competition.status === 'upcoming' || competition.status === 'active')
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
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${competitionStatusColors[competition.status]}`}>
                {competition.status}
              </span>
            </div>
            {isRegistrationOpen() && (
              <span className="px-4 py-2 bg-secondary-container text-secondary text-sm rounded-lg font-medium">
                Registration Open
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">
        {useMockData && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            API unavailable. Showing demo data.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Competition Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">About This Competition</h2>
              <p className="text-slate-600 mb-4">{competition.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <span>{competition.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">payments</span>
                  <span>{competition.fee_per_participant} EGP per participant</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">event</span>
                  <span>{formatDate(competition.start_date)} - {formatDate(competition.end_date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="material-symbols-outlined text-slate-400">schedule</span>
                  <span>Registration closes {formatDate(competition.registration_deadline)}</span>
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

          {/* Sidebar - Stats */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-on-surface mb-4">Registration Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Registered Teams</span>
                  <span className="font-semibold text-on-surface">{competition.registered_teams}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Participants</span>
                  <span className="font-semibold text-on-surface">{competition.total_participants}</span>
                </div>
                {competition.max_teams && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Available Slots</span>
                    <span className="font-semibold text-on-surface">
                      {competition.max_teams - competition.registered_teams}
                    </span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Total Revenue</span>
                    <span className="font-semibold text-green-600">
                      {(competition.total_participants * competition.fee_per_participant).toLocaleString()} EGP
                    </span>
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
