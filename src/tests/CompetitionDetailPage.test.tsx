import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CompetitionDetailPage } from '../pages/CompetitionDetailPage'

vi.mock('../hooks/competitions', () => ({
  useCompetition: vi.fn(() => ({
    competition: { id: 1, name: 'Test Comp', location: 'Cairo', fee_per_student: 100, competition_date: '2026-06-15', created_at: '2026-01-01', notes: null, edition: '2026', edition_year: null },
    isLoading: false,
    error: null,
    remove: vi.fn(),
    isMutating: false,
  })),
  useCompetitionCategories: vi.fn(() => ({
    categories: [
      { category: 'Robotics', subcategories: ['Advanced', 'Beginner'] },
      { category: 'Programming', subcategories: ['Python'] },
    ],
    isLoading: false,
  })),
  useCompetitionSummary: vi.fn(() => ({
    summary: { total_teams: 5, total_participants: 12, categories: [] },
    isLoading: false,
  })),
}))

vi.mock('../hooks/teams', () => ({
  useTeams: vi.fn(() => ({
    teams: [],
    isLoading: false,
    error: null,
    refresh: vi.fn(),
  })),
}))

vi.mock('../api/teams', () => ({
  registerTeam: vi.fn(),
}))

function renderPage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/competitions/1']}>
        <Routes>
          <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
          <Route path="/competitions" element={<div>Competitions List</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('CompetitionDetailPage', () => {
  it('renders competition name in header', () => {
    renderPage()
    expect(screen.getByText('Test Comp')).toBeInTheDocument()
  })

  it('shows two tabs: Overview and Teams', () => {
    renderPage()
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Teams' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Categories' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Summary' })).not.toBeInTheDocument()
  })

  it('shows categories grid in Overview', () => {
    renderPage()
    expect(screen.getByText('Categories (2)')).toBeInTheDocument()
    expect(screen.getByText('Robotics')).toBeInTheDocument()
    expect(screen.getByText('Programming')).toBeInTheDocument()
  })

  it('shows stats row with total teams and participants', () => {
    renderPage()
    expect(screen.getByText('Total Teams')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Participants')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('shows Back to Competitions button', () => {
    renderPage()
    expect(screen.getByText('Back to Competitions')).toBeInTheDocument()
  })

  it('shows Edit and Delete buttons', () => {
    renderPage()
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })
})
