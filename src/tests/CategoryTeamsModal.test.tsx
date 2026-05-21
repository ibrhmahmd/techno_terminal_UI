import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryTeamsModal } from '../components/competitions/CategoryTeamsModal'
import type { CategoryWithTeamsDTO } from '../api/competitions'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('CategoryTeamsModal', () => {
  const baseCategory: CategoryWithTeamsDTO = {
    category: 'Robotics',
    subcategory: null,
    teams: [
      {
        team: {
          id: 1,
          competition_id: 10,
          team_name: 'Team Alpha',
          category: 'Robotics',
          subcategory: null,
          group_id: null,
          coach_id: null,
          project_name: null,
          project_description: null,
          placement_rank: 1,
          placement_label: 'Gold',
          notes: null,
          created_at: null,
        },
        members: [
          { id: 1, team_id: 1, student_id: 101, amount_due: 500, amount_paid: 500 },
          { id: 2, team_id: 1, student_id: 102, amount_due: 500, amount_paid: 0 },
        ],
      },
      {
        team: {
          id: 2,
          competition_id: 10,
          team_name: 'Team Beta',
          category: 'Robotics',
          subcategory: null,
          group_id: null,
          coach_id: null,
          project_name: null,
          project_description: null,
          placement_rank: null,
          placement_label: null,
          notes: null,
          created_at: null,
        },
        members: [
          { id: 3, team_id: 2, student_id: 103, amount_due: 500, amount_paid: 0 },
        ],
      },
    ],
  }

  it('renders team names and member counts', () => {
    renderWithRouter(
      <CategoryTeamsModal category={baseCategory} isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText('Team Alpha')).toBeDefined()
    expect(screen.getByText('Team Beta')).toBeDefined()
    expect(screen.getByText((content) => content.startsWith('2') && content.includes('member'))).toBeDefined()
    expect(screen.getByText((content) => content.startsWith('1') && content.includes('member'))).toBeDefined()
  })

  it('displays placement rank when present', () => {
    renderWithRouter(
      <CategoryTeamsModal category={baseCategory} isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText((content) => content.includes('Rank #1'))).toBeDefined()
  })

  it('shows fee summary with mixed payment statuses', () => {
    renderWithRouter(
      <CategoryTeamsModal category={baseCategory} isOpen={true} onClose={vi.fn()} />
    )
    expect(screen.getByText((content) => content === '1 of 2 paid')).toBeDefined()
    expect(screen.getByText((content) => content === '0 of 1 paid')).toBeDefined()
  })

  it('returns null when category is null', () => {
    const { container } = renderWithRouter(
      <CategoryTeamsModal category={null} isOpen={true} onClose={vi.fn()} />
    )
    expect(container.innerHTML).toBe('')
  })
})
