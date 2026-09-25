import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditEnrollmentModal } from '../../components/enrollments/EditEnrollmentModal'
import { useStudentEnrollments } from '../../hooks/finance/useStudentEnrollments'
import { useUpdateEnrollment } from '../../hooks/useEnrollmentMutations'
import type { StudentEnrollmentInfo } from '../../hooks/finance/useStudentEnrollments'

vi.mock('../../hooks/finance/useStudentEnrollments', () => ({
  useStudentEnrollments: vi.fn(),
}))

vi.mock('../../hooks/useEnrollmentMutations', () => ({
  useUpdateEnrollment: vi.fn(),
}))

function enrollment(overrides: Partial<StudentEnrollmentInfo> = {}): StudentEnrollmentInfo {
  return {
    enrollment_id: 77,
    group_id: 3,
    group_name: 'Robotics A',
    course_name: 'Robotics EV3',
    instructor_name: 'Ahmed',
    level_number: 2,
    amount_due: 1500,
    discount_applied: 200,
    amount_paid: 0,
    remaining_balance: 1300,
    notes: 'original note',
    status: 'active',
    enrolled_at: '2026-01-01',
    ...overrides,
  }
}

let mutateAsync: ReturnType<typeof vi.fn>

function renderModal(props: { isOpen: boolean; enrollmentId: number | null }) {
  return render(
    <EditEnrollmentModal
      isOpen={props.isOpen}
      onClose={vi.fn()}
      enrollmentId={props.enrollmentId}
      studentId={9}
    />,
  )
}

function amountDueInput(container: HTMLElement) {
  return container.querySelectorAll('input[type="number"]')[0] as HTMLInputElement
}

function discountInput(container: HTMLElement) {
  return container.querySelectorAll('input[type="number"]')[1] as HTMLInputElement
}

function notesInput() {
  return screen.getByPlaceholderText(/administrative notes/i) as HTMLTextAreaElement
}

beforeEach(() => {
  mutateAsync = vi.fn().mockResolvedValue(undefined)
  vi.mocked(useUpdateEnrollment).mockReturnValue({
    mutateAsync,
    isPending: false,
  } as never)
  vi.mocked(useStudentEnrollments).mockReturnValue({
    enrollments: [enrollment()],
    loading: false,
    error: null,
    studentBalance: null,
    refresh: vi.fn(),
  } as never)
})

describe('EditEnrollmentModal form initialisation', () => {
  it('renders nothing while closed', () => {
    renderModal({ isOpen: false, enrollmentId: 77 })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('fills the fields from the enrollment when opened', () => {
    const { container } = renderModal({ isOpen: true, enrollmentId: 77 })

    expect(amountDueInput(container)).toHaveValue(1500)
    expect(discountInput(container)).toHaveValue(200)
    expect(notesInput()).toHaveValue('original note')
  })

  it('renders an empty amount when amount_due is null and 0 for a falsy discount', () => {
    vi.mocked(useStudentEnrollments).mockReturnValue({
      enrollments: [enrollment({ amount_due: null, discount_applied: 0 })],
      loading: false,
      error: null,
      studentBalance: null,
      refresh: vi.fn(),
    } as never)

    const { container } = renderModal({ isOpen: true, enrollmentId: 77 })

    expect(amountDueInput(container)).toHaveValue(null)
    expect(discountInput(container)).toHaveValue(0)
  })

  it('falls back to an empty note when notes is null', () => {
    vi.mocked(useStudentEnrollments).mockReturnValue({
      enrollments: [enrollment({ notes: null })],
      loading: false,
      error: null,
      studentBalance: null,
      refresh: vi.fn(),
    } as never)

    renderModal({ isOpen: true, enrollmentId: 77 })

    expect(notesInput()).toHaveValue('')
  })

  it('shows a not-found message when the enrollment id is unknown', () => {
    renderModal({ isOpen: true, enrollmentId: 999 })
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })

  it('keeps user edits across an unrelated re-render with the same enrollment', () => {
    const { container, rerender } = renderModal({ isOpen: true, enrollmentId: 77 })

    fireEvent.change(amountDueInput(container), { target: { value: '999' } })
    fireEvent.change(notesInput(), { target: { value: 'my edit' } })

    rerender(
      <EditEnrollmentModal isOpen onClose={vi.fn()} enrollmentId={77} studentId={9} />,
    )

    expect(amountDueInput(container)).toHaveValue(999)
    expect(notesInput()).toHaveValue('my edit')
  })

  it('re-initialises when the enrollment object identity changes while open (background refetch)', () => {
    const { container, rerender } = renderModal({ isOpen: true, enrollmentId: 77 })

    fireEvent.change(notesInput(), { target: { value: 'my edit' } })
    expect(notesInput()).toHaveValue('my edit')

    // Same enrollment id, new object identity: a refetch replaces the fields
    vi.mocked(useStudentEnrollments).mockReturnValue({
      enrollments: [enrollment({ notes: 'refetched note', amount_due: 1800 })],
      loading: false,
      error: null,
      studentBalance: null,
      refresh: vi.fn(),
    } as never)

    rerender(
      <EditEnrollmentModal isOpen onClose={vi.fn()} enrollmentId={77} studentId={9} />,
    )

    expect(notesInput()).toHaveValue('refetched note')
    expect(amountDueInput(container)).toHaveValue(1800)
  })

  it('re-initialises and clears the error when the modal is closed and reopened', async () => {
    const { rerender } = renderModal({ isOpen: true, enrollmentId: 77 })

    fireEvent.change(notesInput(), { target: { value: 'my edit' } })
    mutateAsync.mockRejectedValueOnce(new Error('save failed'))
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('save failed')).toBeInTheDocument()

    rerender(
      <EditEnrollmentModal isOpen={false} onClose={vi.fn()} enrollmentId={77} studentId={9} />,
    )
    rerender(
      <EditEnrollmentModal isOpen onClose={vi.fn()} enrollmentId={77} studentId={9} />,
    )

    expect(screen.queryByText('save failed')).toBeNull()
    expect(notesInput()).toHaveValue('original note')
  })
})
