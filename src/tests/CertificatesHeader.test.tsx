import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CertificatesHeader } from '../components/certificates/CertificatesHeader'

describe('CertificatesHeader', () => {
  it('renders title with total count', () => {
    render(<CertificatesHeader totalCount={42} onSearchChange={vi.fn()} />)
    expect(screen.getByText('Certificates')).toBeInTheDocument()
    expect(screen.getByText(/42/)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<CertificatesHeader totalCount={0} onSearchChange={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search by student or cert ID...')).toBeInTheDocument()
  })

  it('calls onSearchChange when typing', async () => {
    const onSearchChange = vi.fn()
    render(<CertificatesHeader totalCount={0} onSearchChange={onSearchChange} />)
    const searchBar = screen.getByPlaceholderText('Search by student or cert ID...')
    const input = searchBar.querySelector('input') ?? searchBar
    await userEvent.type(input, 'Ahmed')
    await waitFor(() => expect(onSearchChange).toHaveBeenCalled())
  })

  it('shows Generate button when onGenerateClick is provided', () => {
    render(<CertificatesHeader totalCount={0} onSearchChange={vi.fn()} onGenerateClick={vi.fn()} />)
    expect(screen.getByText('Generate')).toBeInTheDocument()
  })

  it('hides Generate button when onGenerateClick is not provided', () => {
    render(<CertificatesHeader totalCount={0} onSearchChange={vi.fn()} />)
    expect(screen.queryByText('Generate')).not.toBeInTheDocument()
  })

  it('calls onGenerateClick when Generate button is clicked', async () => {
    const onGenerateClick = vi.fn()
    render(<CertificatesHeader totalCount={0} onSearchChange={vi.fn()} onGenerateClick={onGenerateClick} />)
    await userEvent.click(screen.getByText('Generate'))
    expect(onGenerateClick).toHaveBeenCalled()
  })
})
