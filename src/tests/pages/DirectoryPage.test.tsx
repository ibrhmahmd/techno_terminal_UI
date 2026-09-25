import { fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DirectoryPage } from '../../pages/DirectoryPage'
import { useDirectoryData } from '../../hooks/directory/useDirectoryData'
import { useStudentActions } from '../../hooks/directory/useStudentActions'
import type { StudentListItem } from '../../api/crm/students/types/models'

vi.mock('../../hooks/directory/useDirectoryData', () => ({
  useDirectoryData: vi.fn(),
}))

vi.mock('../../hooks/directory/useStudentActions', () => ({
  useStudentActions: vi.fn(),
}))

const activeStudent: StudentListItem = {
  id: 1,
  full_name: 'Nina Active',
  status: 'active',
  gender: 'female',
  grade: 'Grade 3',
}

const deletedStudent: StudentListItem = {
  id: 2,
  full_name: 'Omar Deleted',
  status: 'inactive',
  gender: 'male',
}

const softDelete = vi.fn()
const hardDelete = vi.fn()

function directoryData(totalWaiting: number) {
  return {
    students: [activeStudent],
    parents: [],
    waitingStudents: [],
    deletedStudents: [],
    studentsGroupedData: undefined,
    waitingGroupedData: undefined,
    filteredStudents: undefined,
    filteredTotal: undefined,
    filteredGroupedData: undefined,
    isLoading: false,
    isLoadingStudentsGrouped: false,
    isLoadingWaitingGrouped: false,
    isLoadingFiltered: false,
    isLoadingFilteredGrouped: false,
    isError: false,
    error: null,
    totalStudents: 1,
    totalParents: 0,
    totalWaiting,
  }
}

function page() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DirectoryPage />
      </QueryClientProvider>
    </MemoryRouter>
  )
}

function renderPage(totalWaiting = 7) {
  vi.mocked(useDirectoryData).mockReturnValue(directoryData(totalWaiting))
  return render(page())
}

function metricTab(label: string) {
  return screen.getByRole('tab', { name: new RegExp(`^${label}`) })
}

function confirmButton() {
  const dialog = screen.getByRole('alertdialog')
  return within(dialog)
    .getAllByRole('button')
    .find((button) => button.textContent !== 'Cancel')!
}

beforeEach(() => {
  vi.mocked(useStudentActions).mockReturnValue({
    handleCreateStudent: vi.fn(),
    handleEditStudent: vi.fn(),
    handleSoftDeleteStudent: softDelete,
    handleRestoreStudent: vi.fn(),
    handleHardDeleteStudent: hardDelete,
    isLoading: false,
  })
  softDelete.mockClear()
  hardDelete.mockClear()
})

describe('DirectoryPage delete confirmations', () => {
  it('confirms a soft delete before calling the soft delete action', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('Move to Trash')).toBeInTheDocument()
    expect(within(dialog).getByText(/move "Nina Active" to the trash/)).toBeInTheDocument()
    expect(softDelete).not.toHaveBeenCalled()

    fireEvent.click(confirmButton())

    expect(softDelete).toHaveBeenCalledWith(activeStudent)
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })

  it('cancels a soft delete without calling the soft delete action', () => {
    renderPage()

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(softDelete).not.toHaveBeenCalled()
  })

  it('confirms a hard delete from the deleted-students view', () => {
    vi.mocked(useDirectoryData).mockReturnValue({
      ...directoryData(7),
      students: [deletedStudent],
    })
    render(page())

    fireEvent.click(screen.getByRole('button', { name: 'Deleted' }))
    fireEvent.click(screen.getByRole('button', { name: 'Permanently Delete' }))

    const dialog = screen.getByRole('alertdialog')
    expect(within(dialog).getByText('Permanently Delete')).toBeInTheDocument()
    expect(within(dialog).getByText(/permanently delete "Omar Deleted"/)).toBeInTheDocument()
    expect(hardDelete).not.toHaveBeenCalled()

    fireEvent.click(confirmButton())

    expect(hardDelete).toHaveBeenCalledWith(deletedStudent)
    expect(softDelete).not.toHaveBeenCalled()
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})

describe('DirectoryPage metrics strip', () => {
  it('shows the mocked totals', () => {
    renderPage(7)

    expect(metricTab('Students')).toHaveTextContent('1')
    expect(metricTab('Waiting List')).toHaveTextContent('7')
  })

  it('picks up a changed waiting-list total', () => {
    const { rerender } = renderPage(7)

    expect(metricTab('Waiting List')).toHaveTextContent('7')

    vi.mocked(useDirectoryData).mockReturnValue(directoryData(12))
    rerender(page())

    expect(metricTab('Waiting List')).toHaveTextContent('12')
  })
})
