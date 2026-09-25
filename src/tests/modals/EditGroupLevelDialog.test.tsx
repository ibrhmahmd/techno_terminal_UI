import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditGroupLevelDialog } from '../../components/groups/detail/EditGroupLevelDialog'
import { getCoursesPaginated } from '../../api/academics'
import { getEmployees } from '../../api/hr'

vi.mock('../../api/academics', () => ({
  getCoursesPaginated: vi.fn(),
}))

vi.mock('../../api/hr', () => ({
  getEmployees: vi.fn(),
}))

const courses = [
  { id: 1, name: 'Robotics EV3', category: 'Robotics' },
  { id: 2, name: 'Python', category: 'Programming' },
]

const employees = [
  { id: 10, full_name: 'Ahmed Ali', job_title: 'Instructor' },
  { id: 11, full_name: 'Mona Sami', job_title: 'Instructor' },
]

interface Props {
  isOpen: boolean
  currentInstructorId?: number | null
  currentCourseId?: number | null
  currentPriceOverride?: number | null
  currentNotes?: string | null
}

function renderDialog(props: Props, onConfirm = vi.fn().mockResolvedValue(undefined)) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  function tree(next: Props) {
    return (
      <QueryClientProvider client={queryClient}>
        <EditGroupLevelDialog
          isOpen={next.isOpen}
          levelNumber={2}
          currentInstructorId={next.currentInstructorId}
          currentCourseId={next.currentCourseId}
          currentPriceOverride={next.currentPriceOverride}
          currentNotes={next.currentNotes}
          onClose={vi.fn()}
          onConfirm={onConfirm}
          isLoading={false}
        />
      </QueryClientProvider>
    )
  }

  const utils = render(tree(props))

  return { ...utils, onConfirm, rerenderDialog: (next: Props) => utils.rerender(tree(next)) }
}

function priceInput() {
  return screen.getByLabelText(/price override/i) as HTMLInputElement
}

function notesInput() {
  return screen.getByLabelText(/internal notes/i) as HTMLTextAreaElement
}

beforeEach(() => {
  vi.mocked(getCoursesPaginated).mockReset().mockResolvedValue({
    items: courses,
    total: courses.length,
    skip: 0,
    limit: 100,
  } as never)
  vi.mocked(getEmployees).mockReset().mockResolvedValue({
    data: employees,
    total: employees.length,
    skip: 0,
    limit: 100,
  } as never)
})

describe('EditGroupLevelDialog form initialisation', () => {
  it('renders nothing while closed', () => {
    renderDialog({ isOpen: false, currentPriceOverride: 500 })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('fills the fields from the current level props when opened', async () => {
    renderDialog({
      isOpen: true,
      currentInstructorId: 10,
      currentCourseId: 1,
      currentPriceOverride: 750,
      currentNotes: 'level note',
    })

    await waitFor(() => expect(screen.getByText('Robotics EV3')).toBeInTheDocument())
    expect(screen.getByText('Ahmed Ali')).toBeInTheDocument()
    expect(priceInput()).toHaveValue(750)
    expect(notesInput()).toHaveValue('level note')
  })

  it('fills the fields when the dialog is mounted already open', async () => {
    renderDialog({
      isOpen: true,
      currentInstructorId: 11,
      currentCourseId: 2,
      currentPriceOverride: 300,
      currentNotes: 'mounted open',
    })

    await waitFor(() => expect(screen.getByText('Mona Sami')).toBeInTheDocument())
    expect(priceInput()).toHaveValue(300)
    expect(notesInput()).toHaveValue('mounted open')
  })

  it('leaves the fields empty when the current level has no values', async () => {
    renderDialog({
      isOpen: true,
      currentInstructorId: null,
      currentCourseId: null,
      currentPriceOverride: null,
      currentNotes: null,
    })

    await waitFor(() => expect(getEmployees).toHaveBeenCalled())
    expect(priceInput()).toHaveValue(null)
    expect(notesInput()).toHaveValue('')
  })

  it('keeps user edits across an unrelated re-render with unchanged props', async () => {
    const props: Props = {
      isOpen: true,
      currentInstructorId: 10,
      currentCourseId: 1,
      currentPriceOverride: 750,
      currentNotes: 'level note',
    }
    const { rerenderDialog } = renderDialog(props)

    await waitFor(() => expect(screen.getByText('Ahmed Ali')).toBeInTheDocument())

    fireEvent.change(priceInput(), { target: { value: '999' } })
    fireEvent.change(notesInput(), { target: { value: 'my edit' } })

    rerenderDialog(props)

    expect(priceInput()).toHaveValue(999)
    expect(notesInput()).toHaveValue('my edit')
  })

  it('re-initialises when the current level props change while open', async () => {
    const { rerenderDialog } = renderDialog({
      isOpen: true,
      currentInstructorId: 10,
      currentCourseId: 1,
      currentPriceOverride: 750,
      currentNotes: 'level note',
    })

    await waitFor(() => expect(priceInput()).toHaveValue(750))
    fireEvent.change(priceInput(), { target: { value: '999' } })
    expect(priceInput()).toHaveValue(999)

    rerenderDialog({
      isOpen: true,
      currentInstructorId: 11,
      currentCourseId: 2,
      currentPriceOverride: 100,
      currentNotes: 'after save',
    })

    expect(priceInput()).toHaveValue(100)
    expect(notesInput()).toHaveValue('after save')
  })

  it('discards edits and re-initialises when the dialog is reopened', async () => {
    const props: Props = {
      isOpen: true,
      currentPriceOverride: 750,
      currentNotes: 'level note',
    }
    const { rerenderDialog } = renderDialog(props)

    await waitFor(() => expect(priceInput()).toHaveValue(750))
    fireEvent.change(priceInput(), { target: { value: '999' } })
    fireEvent.change(notesInput(), { target: { value: 'my edit' } })

    rerenderDialog({ ...props, isOpen: false })
    rerenderDialog(props)

    expect(priceInput()).toHaveValue(750)
    expect(notesInput()).toHaveValue('level note')
  })
})

describe('EditGroupLevelDialog submission', () => {
  it('submits the edited values', async () => {
    const { onConfirm } = renderDialog({
      isOpen: true,
      currentInstructorId: 10,
      currentCourseId: 1,
      currentPriceOverride: 750,
      currentNotes: 'level note',
    })

    await waitFor(() => expect(priceInput()).toHaveValue(750))

    fireEvent.change(priceInput(), { target: { value: '1200' } })
    fireEvent.change(notesInput(), { target: { value: '  updated  ' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        instructor_id: 10,
        course_id: 1,
        price_override: 1200,
        notes: 'updated',
      }),
    )
  })

  it('sends null notes when the field is cleared', async () => {
    const { onConfirm } = renderDialog({ isOpen: true, currentNotes: 'level note' })

    await waitFor(() => expect(notesInput()).toHaveValue('level note'))

    fireEvent.change(notesInput(), { target: { value: '   ' } })
    fireEvent.submit(document.querySelector('form') as HTMLFormElement)

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        instructor_id: null,
        course_id: null,
        price_override: null,
        notes: null,
      }),
    )
  })
})
