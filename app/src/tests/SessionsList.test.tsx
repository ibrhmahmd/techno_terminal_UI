import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SessionsList } from '../components/groups/SessionsList'
import { Session } from '../api/academics'

const mockSessions: Session[] = [
  {
    id: 1,
    group_id: 1,
    level_number: 1,
    session_number: 1,
    session_date: '2026-04-03',
    start_time: '14:00:00',
    end_time: '16:00:00',
    status: 'scheduled',
    is_extra_session: false,
    actual_instructor_id: 1,
    notes: ''
  }
]

describe('SessionsList', () => {
  const mockOnEdit = vi.fn()
  const mockOnCancel = vi.fn()
  const mockOnDeleteRequest = vi.fn()
  const mockOnDeleteConfirm = vi.fn()
  const mockOnDeleteCancel = vi.fn()

  it('renders a list of sessions', () => {
    render(
      <SessionsList 
        sessions={mockSessions}
        deletingSessionId={null}
        isProcessing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onDeleteRequest={mockOnDeleteRequest}
        onDeleteConfirm={mockOnDeleteConfirm}
        onDeleteCancel={mockOnDeleteCancel}
      />
    )
    expect(screen.getByText('Sessions (1)')).toBeDefined()
    expect(screen.getByText('14:00:00 - 16:00:00')).toBeDefined()
  })

  it('shows confirmation when deletingSessionId matches', () => {
    render(
      <SessionsList 
        sessions={mockSessions}
        deletingSessionId={1}
        isProcessing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onDeleteRequest={mockOnDeleteRequest}
        onDeleteConfirm={mockOnDeleteConfirm}
        onDeleteCancel={mockOnDeleteCancel}
      />
    )
    expect(screen.getByText('Delete?')).toBeDefined()
    expect(screen.getByText('Confirm')).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('calls onDeleteConfirm when clicking confirm', () => {
    render(
      <SessionsList 
        sessions={mockSessions}
        deletingSessionId={1}
        isProcessing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onDeleteRequest={mockOnDeleteRequest}
        onDeleteConfirm={mockOnDeleteConfirm}
        onDeleteCancel={mockOnDeleteCancel}
      />
    )
    const button = screen.getByText('Confirm')
    fireEvent.click(button)
    expect(mockOnDeleteConfirm).toHaveBeenCalledWith(1)
  })
})
