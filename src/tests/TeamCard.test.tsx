import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TeamCard } from '../components/competitions/TeamCard'
import type { TeamCardData } from '../api/teams/types'

const baseTeam: TeamCardData = {
  id: 1,
  team_name: 'Robo Warriors',
  category: 'Robotics',
  subcategory: 'Advanced',
  project_name: 'Mars Rover',
  coach_id: null,
  placement_rank: null,
  placement_label: null,
  members: [],
  memberCount: 0,
  paidCount: 0,
}

function renderWithRouter(element: React.ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

describe('TeamCard', () => {
  it('renders team name and category', () => {
    renderWithRouter(<TeamCard team={baseTeam} />)
    expect(screen.getByText('Robo Warriors')).toBeInTheDocument()
    expect(screen.getByText('Robotics — Advanced')).toBeInTheDocument()
  })

  it('renders project name when available', () => {
    renderWithRouter(<TeamCard team={baseTeam} />)
    expect(screen.getByText('Mars Rover')).toBeInTheDocument()
  })

  it('shows placement badge when ranked', () => {
    const ranked = { ...baseTeam, placement_rank: 3, placement_label: 'Bronze' }
    renderWithRouter(<TeamCard team={ranked} />)
    expect(screen.getByText('#3 · Bronze')).toBeInTheDocument()
  })

  it('shows paid count with members', () => {
    const withMembers = {
      ...baseTeam,
      memberCount: 4,
      paidCount: 2,
    }
    renderWithRouter(<TeamCard team={withMembers} />)
    expect(screen.getByText('2 of 4 paid')).toBeInTheDocument()
  })

  it('shows all paid in green when fully paid', () => {
    const fullyPaid = {
      ...baseTeam,
      memberCount: 3,
      paidCount: 3,
    }
    renderWithRouter(<TeamCard team={fullyPaid} />)
    const paidEl = screen.getByText('3 of 3 paid')
    expect(paidEl).toBeInTheDocument()
    expect(paidEl.className).toContain('text-green-600')
  })

  it('renders without project name', () => {
    const noProject = { ...baseTeam, project_name: null }
    renderWithRouter(<TeamCard team={noProject} />)
    expect(screen.getByText('Robo Warriors')).toBeInTheDocument()
    expect(screen.queryByText('Mars Rover')).not.toBeInTheDocument()
  })
})
