import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { CertificateDetailModal } from '../components/certificates/CertificateDetailModal'
import type { CertificateDTO } from '../api/certificates/types'

const baseCert: CertificateDTO = {
  id: 1,
  cert_id: 'TKTF-HTM-20260728-ABCD',
  student_name: 'Ahmed Ali',
  course_name: 'HTML — Web Structure',
  course_track: 'html',
  level: 'Level 1 — Junior',
  issue_date: '2026-07-28',
  branch: 'KFS',
  instructor: 'Dr. Smith',
  director: 'Dr. Jones',
  custom_color: null,
  revoked_at: null,
  revoked_reason: null,
  created_at: '2026-07-28T10:00:00Z',
}

describe('CertificateDetailModal', () => {
  it('renders nothing when certificate is null', () => {
    const { container } = render(
      <CertificateDetailModal isOpen onClose={vi.fn()} certificate={null} />,
    )
    expect(container.innerHTML).toBe('')
  })

  it('renders certificate ID and student name', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} />)
    expect(screen.getByText('TKTF-HTM-20260728-ABCD')).toBeInTheDocument()
    expect(screen.getByText('Ahmed Ali')).toBeInTheDocument()
  })

  it('renders Active status when not revoked', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText('Revoked')).not.toBeInTheDocument()
  })

  it('renders Revoked status when revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={revoked} />)
    expect(screen.getByText('Revoked')).toBeInTheDocument()
    expect(screen.getByText('Issued in error')).toBeInTheDocument()
  })

  it('shows instructor and director when present', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} />)
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument()
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument()
  })

  it('hides instructor and director rows when null', () => {
    const noInstructor = { ...baseCert, instructor: null, director: null }
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={noInstructor} />)
    expect(screen.queryByText('Instructor')).not.toBeInTheDocument()
    expect(screen.queryByText('Director')).not.toBeInTheDocument()
  })

  it('shows Download PDF button when onDownloadPdf is provided', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} onDownloadPdf={vi.fn()} />)
    expect(screen.getByText('Download PDF')).toBeInTheDocument()
  })

  it('hides Download PDF when certificate is revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(
      <CertificateDetailModal isOpen onClose={vi.fn()} certificate={revoked} onDownloadPdf={vi.fn()} />,
    )
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument()
  })

  it('calls onDownloadPdf when PDF button is clicked', async () => {
    const onDownloadPdf = vi.fn()
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} onDownloadPdf={onDownloadPdf} />)
    await userEvent.click(screen.getByText('Download PDF'))
    expect(onDownloadPdf).toHaveBeenCalledWith('TKTF-HTM-20260728-ABCD')
  })

  it('shows Revoke button when onRevoke is provided', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} onRevoke={vi.fn()} />)
    expect(screen.getByText('Revoke')).toBeInTheDocument()
  })

  it('hides Revoke button when certificate is revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={revoked} onRevoke={vi.fn()} />)
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
  })

  it('hides Revoke button when onRevoke is not provided', () => {
    render(<CertificateDetailModal isOpen onClose={vi.fn()} certificate={baseCert} />)
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
  })
})
