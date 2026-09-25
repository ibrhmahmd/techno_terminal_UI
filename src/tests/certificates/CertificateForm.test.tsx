import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CertificateForm } from '../../components/certificates/CertificateForm'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { getStudentWithDetails } from '../../api/crm/students/core'
import type { StudentListItem } from '../../api/crm'

vi.mock('../../hooks/useCertificates', () => ({
  useCreateCertificate: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock('../../hooks/useDirectory', () => ({
  useStudentsSearch: vi.fn(),
}))

vi.mock('../../api/crm/students/core', () => ({
  getStudentWithDetails: vi.fn(),
}))

// stable array reference across renders: the effect under test keys on this identity
const students: StudentListItem[] = [
  { id: 1, full_name: 'Ahmed Mohamed', status: 'active', current_group_name: 'Group A' },
  { id: 2, full_name: 'Mona Sami', status: 'active', current_group_name: null },
]

function details(studentId: number, courseName: string, levelNumber: number) {
  return {
    current_enrollment: {
      enrollment_id: 900 + studentId,
      group_id: 10 + studentId,
      group_name: `Group ${studentId}`,
      course_id: 5,
      course_name: courseName,
      level_number: levelNumber,
    },
  }
}

function renderForm() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <CertificateForm onSuccess={vi.fn()} onCancel={vi.fn()} />
    </QueryClientProvider>,
  )
}

function studentInput() {
  return screen.getByLabelText(/student name/i) as HTMLInputElement
}

function trackInput() {
  return screen.getByLabelText(/course track/i) as HTMLInputElement
}

function levelInput() {
  return screen.getByLabelText(/^level/i) as HTMLInputElement
}

function suggestionList() {
  return screen.queryByRole('list')
}

function highlightedIndex(): number {
  const items = suggestionList()?.querySelectorAll('li') ?? []
  return Array.from(items).findIndex((li) => li.className.includes('bg-cyan-50'))
}

async function waitForSuggestions() {
  await waitFor(() => expect(suggestionList()).not.toBeNull(), { timeout: 3000 })
  const items = suggestionList()!.querySelectorAll('li')
  return items
}

beforeEach(() => {
  vi.mocked(useStudentsSearch).mockReset().mockReturnValue({
    data: students,
    isLoading: false,
  } as never)
  vi.mocked(getStudentWithDetails).mockReset().mockResolvedValue(details(1, 'JavaScript — Interactivity', 1) as never)
})

describe('CertificateForm student combobox (selection state)', () => {
  it('fills the name in and closes the list when a student is picked', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed' } })
    const items = await waitForSuggestions()

    fireEvent.mouseDown(items[0])

    expect(studentInput()).toHaveValue('Ahmed Mohamed')
    expect(suggestionList()).toBeNull()
  })

  it('re-opens the list and searches again when the user edits after selecting', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed' } })
    const items = await waitForSuggestions()
    fireEvent.mouseDown(items[0])
    expect(suggestionList()).toBeNull()

    // A selection suppresses further searching; typing starts a fresh search
    expect(useStudentsSearch).toHaveBeenLastCalledWith('')

    fireEvent.change(studentInput(), { target: { value: 'Mona' } })
    await waitFor(() => expect(suggestionList()).not.toBeNull(), { timeout: 3000 })
    expect(within(suggestionList()!).getByText('Mona Sami')).toBeInTheDocument()
  })

  it('closes the list when a click lands outside the combobox', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed' } })
    await waitForSuggestions()

    fireEvent.mouseDown(document.body)
    await waitFor(() => expect(suggestionList()).toBeNull())
  })
})

describe('CertificateForm student combobox (highlight reset)', () => {
  it('resets the keyboard highlight when the query text changes', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'mo' } })
    const items = await waitForSuggestions()
    expect(items.length).toBeGreaterThan(1)

    fireEvent.keyDown(studentInput(), { key: 'ArrowDown' })
    expect(highlightedIndex()).toBe(0)

    fireEvent.change(studentInput(), { target: { value: 'mon' } })
    expect(highlightedIndex()).toBe(-1)
  })

  it('clears the highlight after a suggestion is chosen', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'mo' } })
    const items = await waitForSuggestions()

    fireEvent.mouseEnter(items[1])
    expect(highlightedIndex()).toBe(1)

    fireEvent.mouseDown(items[1])
    expect(studentInput()).toHaveValue('Mona Sami')

    // Re-opening the list must not come back with a stale highlight
    fireEvent.change(studentInput(), { target: { value: 'mo' } })
    await waitFor(() => expect(suggestionList()).not.toBeNull(), { timeout: 3000 })
    expect(highlightedIndex()).toBe(-1)
  })
})

describe('CertificateForm auto-fill from the matched student', () => {
  it('auto-fills the course track and level when the name matches a search result exactly', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })

    await waitFor(() => expect(levelInput()).toHaveValue('Level 1 — Junior'), { timeout: 3000 })
    expect(getStudentWithDetails).toHaveBeenCalledWith(1)
    await waitFor(() => expect(trackInput()).toHaveValue('JavaScript — Interactivity'))
  })

  it('matches the name case-insensitively', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'ahmed mohamed' } })

    await waitFor(() => expect(getStudentWithDetails).toHaveBeenCalledWith(1), { timeout: 3000 })
  })

  it('shows the details spinner while the matched student is being fetched', async () => {
    let resolveDetails: (value: unknown) => void = () => {}
    vi.mocked(getStudentWithDetails).mockReturnValue(
      new Promise((resolve) => {
        resolveDetails = resolve
      }) as never,
    )

    renderForm()

    const generateButton = screen.getByRole('button', { name: /generate certificate/i })
    expect(screen.queryAllByRole('status')).toHaveLength(0)
    expect(generateButton).toBeEnabled()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })

    await waitFor(() => expect(screen.getAllByRole('status').length).toBeGreaterThan(0), { timeout: 3000 })
    expect(generateButton).toBeDisabled()

    await act(async () => {
      resolveDetails(details(1, 'JavaScript — Interactivity', 1))
    })

    await waitFor(() => expect(screen.queryAllByRole('status')).toHaveLength(0))
    expect(generateButton).toBeEnabled()
  })

  it('does not fetch or fill anything for a name that is not an exact match', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Moham' } })

    await waitForSuggestions()
    expect(getStudentWithDetails).not.toHaveBeenCalled()
    expect(levelInput()).toHaveValue('')
    expect(trackInput()).toHaveValue('')
  })

  it('does not fetch anything for a single character query', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'A' } })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })
    expect(getStudentWithDetails).not.toHaveBeenCalled()
  })

  it('auto-fills again when a different student is matched', async () => {
    vi.mocked(getStudentWithDetails).mockImplementation(async (id: number) =>
      id === 1
        ? (details(1, 'JavaScript — Interactivity', 1) as never)
        : (details(2, 'Python — Programming', 3) as never),
    )

    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })
    await waitFor(() => expect(levelInput()).toHaveValue('Level 1 — Junior'), { timeout: 3000 })
    await waitFor(() => expect(trackInput()).toHaveValue('JavaScript — Interactivity'))

    fireEvent.change(studentInput(), { target: { value: 'Mona Sami' } })
    await waitFor(() => expect(levelInput()).toHaveValue('Level 3 — Advanced'), { timeout: 3000 })
    await waitFor(() => expect(trackInput()).toHaveValue('Python — Programming'))
  })

  it('leaves the level untouched when the matched student has no enrollment', async () => {
    vi.mocked(getStudentWithDetails).mockResolvedValue({ current_enrollment: null } as never)

    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Mona Sami' } })
    fireEvent.change(levelInput(), { target: { value: 'Level 2 — Intermediate' } })

    await waitFor(() => expect(getStudentWithDetails).toHaveBeenCalledWith(2), { timeout: 3000 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })
    expect(levelInput()).toHaveValue('Level 2 — Intermediate')
  })

  it('leaves the track untouched when the enrollment course is not a known track', async () => {
    vi.mocked(getStudentWithDetails).mockResolvedValue(details(1, 'Some Other Course', 2) as never)

    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })

    await waitFor(() => expect(levelInput()).toHaveValue('Level 2 — Intermediate'), { timeout: 3000 })
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 700))
    })
    expect(trackInput()).toHaveValue('')
  })

  it('does not clobber fields the user edits after the auto-fill for that student', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })
    await waitFor(() => expect(levelInput()).toHaveValue('Level 1 — Junior'), { timeout: 3000 })

    fireEvent.change(trackInput(), { target: { value: 'My own track' } })
    fireEvent.change(levelInput(), { target: { value: 'Level 3 — Advanced' } })

    // let any late async auto-fill / refocus land
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))
    })

    expect(trackInput()).toHaveValue('My own track')
    expect(levelInput()).toHaveValue('Level 3 — Advanced')
  })

  it('keeps the user edits when the same exact name is typed again', async () => {
    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })
    await waitFor(() => expect(levelInput()).toHaveValue('Level 1 — Junior'), { timeout: 3000 })

    fireEvent.change(trackInput(), { target: { value: 'edited by hand' } })

    // break the match, then restore it, faster than the search debounce
    fireEvent.change(studentInput(), { target: { value: 'Ahmed Moham' } })
    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 800))
    })
    expect(trackInput()).toHaveValue('edited by hand')
    expect(getStudentWithDetails).toHaveBeenCalledTimes(1)
  })

  it('does not crash when fetching the details fails', async () => {
    vi.mocked(getStudentWithDetails).mockRejectedValue(new Error('boom'))

    renderForm()

    fireEvent.change(studentInput(), { target: { value: 'Ahmed Mohamed' } })

    await waitFor(() => expect(screen.queryByRole('status')).toBeNull(), { timeout: 3000 })
    expect(levelInput()).toHaveValue('')
  })
})
