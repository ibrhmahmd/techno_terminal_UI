import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { CompetitionCard } from '../components/competitions/CompetitionCard'
import { CompetitionForm } from '../components/competitions/CompetitionForm'
import { 
  getCompetitions, 
  createCompetition,
  deleteCompetition,
  type Competition,
  type CreateCompetitionInput
} from '../api/competitions'

// Mock data for fallback
const MOCK_COMPETITIONS: Competition[] = [
  {
    id: '1',
    name: 'Robotics Championship 2026',
    description: 'Annual robotics competition featuring line following, maze solving, and sumo wrestling challenges.',
    location: 'Cairo STEM Center',
    start_date: '2026-05-15',
    end_date: '2026-05-17',
    registration_deadline: '2026-04-30',
    status: 'upcoming',
    max_teams: 50,
    registered_teams: 32,
    total_participants: 96,
    fee_per_participant: 200,
  },
  {
    id: '2',
    name: 'AI Innovation Hackathon',
    description: '48-hour hackathon focused on AI and machine learning solutions for real-world problems.',
    location: 'Alexandria Tech Hub',
    start_date: '2026-03-20',
    end_date: '2026-03-22',
    registration_deadline: '2026-03-15',
    status: 'upcoming',
    max_teams: 30,
    registered_teams: 24,
    total_participants: 72,
    fee_per_participant: 150,
  },
  {
    id: '3',
    name: 'Coding Olympiad Finals',
    description: 'National coding competition finals with algorithmic challenges and problem-solving tasks.',
    location: 'Giza Innovation Center',
    start_date: '2025-12-10',
    end_date: '2025-12-12',
    registration_deadline: '2025-11-30',
    status: 'completed',
    max_teams: 40,
    registered_teams: 38,
    total_participants: 114,
    fee_per_participant: 100,
  },
]

export function CompetitionsPage() {
  const navigate = useNavigate()
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deletingCompetition, setDeletingCompetition] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function loadCompetitions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getCompetitions()
        setCompetitions(data)
      } catch {
        setCompetitions(MOCK_COMPETITIONS)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadCompetitions()
  }, [])

  const handleCreateCompetition = async (data: CreateCompetitionInput) => {
    setIsProcessing(true)
    try {
      const newCompetition = await createCompetition(data)
      setCompetitions(prev => [newCompetition, ...prev])
      setIsCreateModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to create competition')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteCompetition = async (id: string) => {
    setIsProcessing(true)
    try {
      await deleteCompetition(id)
      setCompetitions(prev => prev.filter(c => c.id !== id))
      setDeletingCompetition(null)
      setError(null)
    } catch {
      setError('Failed to delete competition')
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusFilter = (status: string) => {
    switch (status) {
      case 'upcoming': return competitions.filter(c => c.status === 'upcoming')
      case 'active': return competitions.filter(c => c.status === 'active')
      case 'completed': return competitions.filter(c => c.status === 'completed')
      default: return competitions
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Competitions" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Competitions</h1>
            <p className="text-sm text-on-surface-variant mt-2">Manage competitions and team registrations</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create Competition
          </button>
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

        {isLoading ? (
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
          <div className="space-y-8">
            {/* Upcoming Competitions */}
            {getStatusFilter('upcoming').length > 0 && (
              <div>
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Upcoming Competitions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getStatusFilter('upcoming').map(competition => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      onClick={() => navigate(`/competitions/${competition.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Active Competitions */}
            {getStatusFilter('active').length > 0 && (
              <div>
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Active Competitions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getStatusFilter('active').map(competition => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      onClick={() => navigate(`/competitions/${competition.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Competitions */}
            {getStatusFilter('completed').length > 0 && (
              <div>
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Past Competitions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getStatusFilter('completed').map(competition => (
                    <CompetitionCard
                      key={competition.id}
                      competition={competition}
                      onClick={() => navigate(`/competitions/${competition.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
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
    </div>
  )
}
