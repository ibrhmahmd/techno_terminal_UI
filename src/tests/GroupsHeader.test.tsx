import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GroupsHeader } from '../components/groups/GroupsHeader'

// Mocking the component for testing purposes
describe('GroupsHeader', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnCreateClick = vi.fn()

  it('renders correctly with total groups', () => {
    render(
      <GroupsHeader 
        totalGroups={10} 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        onCreateClick={mockOnCreateClick} 
      />
    )
    expect(screen.getByText('Groups (10)')).toBeDefined()
    expect(screen.getByPlaceholderText('Search groups...')).toBeDefined()
  })

  it('calls onSearchChange when typing in search input', () => {
    render(
      <GroupsHeader 
        totalGroups={10} 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        onCreateClick={mockOnCreateClick} 
      />
    )
    const input = screen.getByPlaceholderText('Search groups...')
    fireEvent.change(input, { target: { value: 'Robotics' } })
    expect(mockOnSearchChange).toHaveBeenCalledWith('Robotics')
  })

  it('calls onCreateClick when clicking create button', () => {
    render(
      <GroupsHeader 
        totalGroups={10} 
        searchTerm="" 
        onSearchChange={mockOnSearchChange} 
        onCreateClick={mockOnCreateClick} 
      />
    )
    const button = screen.getByText('Create Group')
    fireEvent.click(button)
    expect(mockOnCreateClick).toHaveBeenCalled()
  })
})
