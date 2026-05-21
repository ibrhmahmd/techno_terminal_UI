import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryList } from '../components/competitions/CategoryList'
import type { CategoryResponse } from '../api/competitions'

describe('CategoryList', () => {
  const mockCategories: CategoryResponse[] = [
    { category: 'Robotics', subcategories: ['Maze', 'Line Follower'] },
    { category: 'Programming', subcategories: [] },
  ]

  it('renders categories with subcategory badges', () => {
    render(
      <CategoryList
        categories={mockCategories}
        onViewTeams={vi.fn()}
        onRegisterTeam={vi.fn()}
        onRegisterFirstTeam={vi.fn()}
      />
    )
    expect(screen.getByText('Competition Categories (2)')).toBeDefined()
    expect(screen.getByText('Robotics')).toBeDefined()
    expect(screen.getByText('Programming')).toBeDefined()
    expect(screen.getByText('Maze')).toBeDefined()
    expect(screen.getByText('Line Follower')).toBeDefined()
  })

  it('displays empty state when no categories', () => {
    render(
      <CategoryList
        categories={[]}
        onViewTeams={vi.fn()}
        onRegisterTeam={vi.fn()}
        onRegisterFirstTeam={vi.fn()}
      />
    )
    expect(screen.getByText(/No categories yet/)).toBeDefined()
    expect(screen.getByText('Register First Team')).toBeDefined()
  })

  it('calls onRegisterTeam when clicking Register Team button', () => {
    const onRegisterTeam = vi.fn()
    render(
      <CategoryList
        categories={mockCategories}
        onViewTeams={vi.fn()}
        onRegisterTeam={onRegisterTeam}
        onRegisterFirstTeam={vi.fn()}
      />
    )
    const buttons = screen.getAllByText('Register Team')
    fireEvent.click(buttons[0])
    expect(onRegisterTeam).toHaveBeenCalledWith('Robotics')
  })

  it('calls onViewTeams when clicking View Teams button', () => {
    const onViewTeams = vi.fn()
    render(
      <CategoryList
        categories={mockCategories}
        onViewTeams={onViewTeams}
        onRegisterTeam={vi.fn()}
        onRegisterFirstTeam={vi.fn()}
      />
    )
    const buttons = screen.getAllByText('View Teams')
    fireEvent.click(buttons[0])
    expect(onViewTeams).toHaveBeenCalledWith('Robotics')
  })

  it('calls onRegisterFirstTeam in empty state', () => {
    const onRegisterFirstTeam = vi.fn()
    render(
      <CategoryList
        categories={[]}
        onViewTeams={vi.fn()}
        onRegisterTeam={vi.fn()}
        onRegisterFirstTeam={onRegisterFirstTeam}
      />
    )
    fireEvent.click(screen.getByText('Register First Team'))
    expect(onRegisterFirstTeam).toHaveBeenCalled()
  })
})
