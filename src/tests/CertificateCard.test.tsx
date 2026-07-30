import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CertificateCard } from '../components/certificates/CertificateCard'
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

describe('CertificateCard', () => {
  const onDownloadPdf = vi.fn()
  const onRevoke = vi.fn()
  const onClick = vi.fn()

  it('renders student name and cert ID', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.getByText('Ahmed Ali')).toBeInTheDocument()
    expect(screen.getByText('TKTF-HTM-20260728-ABCD')).toBeInTheDocument()
  })

  it('renders course name, level, issue date, and branch', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.getByText('HTML — Web Structure')).toBeInTheDocument()
    expect(screen.getByText('Level 1 — Junior')).toBeInTheDocument()
    expect(screen.getByText('Jul 28, 2026')).toBeInTheDocument()
    expect(screen.getByText('KFS')).toBeInTheDocument()
  })

  it('shows Active badge when not revoked', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText('Revoked')).not.toBeInTheDocument()
  })

  it('shows Revoked badge when revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(<CertificateCard certificate={revoked} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.getByText('Revoked')).toBeInTheDocument()
    expect(screen.queryByText('Active')).not.toBeInTheDocument()
  })

  it('calls onDownloadPdf when PDF button is clicked', async () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    await userEvent.click(screen.getByText('PDF'))
    expect(onDownloadPdf).toHaveBeenCalledWith('TKTF-HTM-20260728-ABCD')
  })

  it('calls onClick when card body is clicked', async () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    await userEvent.click(screen.getByText('Ahmed Ali'))
    expect(onClick).toHaveBeenCalledWith(baseCert)
  })

  it('shows Revoke button when onRevoke is provided and not revoked', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onRevoke={onRevoke} onClick={onClick} />)
    expect(screen.getByText('Revoke')).toBeInTheDocument()
  })

  it('hides Revoke button when revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(<CertificateCard certificate={revoked} onDownloadPdf={onDownloadPdf} onRevoke={onRevoke} onClick={onClick} />)
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
  })

  it('hides Revoke button when onRevoke is not provided', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.queryByText('Revoke')).not.toBeInTheDocument()
  })

  it('disables PDF button when isDownloadingPdf is true', () => {
    render(<CertificateCard certificate={baseCert} onDownloadPdf={onDownloadPdf} onClick={onClick} isDownloadingPdf />)
    expect(screen.getByText('PDF').closest('button')).toBeDisabled()
  })

  it('disables PDF button when revoked', () => {
    const revoked = { ...baseCert, revoked_at: '2026-07-29T10:00:00Z', revoked_reason: 'Issued in error' }
    render(<CertificateCard certificate={revoked} onDownloadPdf={onDownloadPdf} onClick={onClick} />)
    expect(screen.getByText('PDF').closest('button')).toBeDisabled()
  })
})
