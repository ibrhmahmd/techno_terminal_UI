import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TeamRegistrationModal } from '../components/competitions/TeamRegistrationModal'

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('TeamRegistrationModal', () => {
  const defaultProps = {
    competitionId: 1,
    categoryName: 'Robotics',
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  }

  it('renders form fields', () => {
    renderWithQuery(<TeamRegistrationModal {...defaultProps} />)
    expect(screen.getByText('Team Name')).toBeDefined()
    expect(screen.getByRole('button', { name: 'Register Team' })).toBeDefined()
    expect(screen.getByText('Cancel')).toBeDefined()
  })

  it('shows validation error on empty team name submission', () => {
    renderWithQuery(<TeamRegistrationModal {...defaultProps} />)
    const form = screen.getByRole('dialog').querySelector('form')!
    fireEvent.submit(form)
    expect(screen.getByText('Team name is required')).toBeDefined()
  })

  it('calls onClose when cancel is clicked', () => {
    const onClose = vi.fn()
    renderWithQuery(<TeamRegistrationModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders subcategory as a free text input with datalist when category has subcategories', () => {
    const props = {
      ...defaultProps,
      categorySubcategories: { Robotics: ['Junior', 'Senior'] },
    }
    renderWithQuery(<TeamRegistrationModal {...props} />)

    const subcategoryInput = screen.getByPlaceholderText('Required subcategory...') as HTMLInputElement
    expect(subcategoryInput).toBeDefined()
    expect(subcategoryInput.tagName).toBe('INPUT')
    expect(subcategoryInput.type).toBe('text')

    // Verify subcategory input allows custom free text typing
    fireEvent.change(subcategoryInput, { target: { value: 'Master League' } })
    expect(subcategoryInput.value).toBe('Master League')
  })

  it('shows updated error message when required subcategory is omitted', () => {
    const props = {
      ...defaultProps,
      categorySubcategories: { Robotics: ['Junior', 'Senior'] },
    }
    renderWithQuery(<TeamRegistrationModal {...props} />)

    // Fill in team name
    const nameInput = screen.getByPlaceholderText('Enter team name...')
    fireEvent.change(nameInput, { target: { value: 'Alpha Team' } })

    const form = screen.getByRole('dialog').querySelector('form')!
    fireEvent.submit(form)

    expect(
      screen.getByText('Subcategory is required for "Robotics". Existing subcategories include: Junior, Senior')
    ).toBeDefined()
  })
})
