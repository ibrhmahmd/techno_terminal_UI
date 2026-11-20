import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AddSessionDialog } from '../components/groups/detail/AddSessionDialog'
import { CoursesPage } from '../pages/CoursesPage'
import { addExtraSession } from '../api/academics/sessions/core'
import { getEmployees } from '../api/hr'
import { deleteCourse, getCoursesPaginated } from '../api/academics'
import { extractErrorMessage } from '../utils/apiErrors'

vi.mock('../api/academics', () => ({
  getCoursesPaginated: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
}))

vi.mock('../api/academics/sessions/core', () => ({
  addExtraSession: vi.fn(),
  updateSession: vi.fn(),
}))

vi.mock('../api/hr', () => ({
  getEmployees: vi.fn(),
}))

function normalizedAxiosError(status: number, data: unknown): AxiosError {
  const config = {} as InternalAxiosRequestConfig
  const response: AxiosResponse = { data, status, statusText: '', headers: {}, config }
  const error = new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response)
  error.message = extractErrorMessage(error)
  return error
}

function newQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: 0 } } })
}

function renderCoursesPage() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={newQueryClient()}>
        <CoursesPage />
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe('server messages reach the user instead of axios status text', () => {
  it('AddSessionDialog shows the backend message in its error banner', async () => {
    vi.mocked(getEmployees).mockResolvedValue({ data: [], total: 0, skip: 0, limit: 100 } as never)
    vi.mocked(addExtraSession).mockRejectedValue(
      normalizedAxiosError(409, {
        success: false,
        error: 'Conflict',
        message: 'A session already exists on this date',
      })
    )

    render(
      <QueryClientProvider client={newQueryClient()}>
        <AddSessionDialog isOpen groupId={1} levelNumber={1} onClose={vi.fn()} />
      </QueryClientProvider>
    )

    const dialog = await screen.findByRole('dialog')
    const dateInput = dialog.querySelector('#session-date') as HTMLInputElement
    const form = dialog.querySelector('form') as HTMLFormElement

    fireEvent.change(dateInput, { target: { value: '2026-09-05' } })
    fireEvent.submit(form)

    expect(await screen.findByText('A session already exists on this date')).toBeInTheDocument()
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument()
  })

  it('CoursesPage renders the normalized server message in its error state', async () => {
    vi.mocked(getCoursesPaginated).mockRejectedValue(
      normalizedAxiosError(422, {
        success: false,
        error: 'RequestValidationError',
        message: "('body', 'limit'): Field required",
        details: [{ type: 'missing', loc: ['body', 'limit'], msg: 'Field required' }],
      })
    )

    renderCoursesPage()

    expect(await screen.findByText('Limit: Field required')).toBeInTheDocument()
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/\('body', 'limit'\)/)).not.toBeInTheDocument()
  })

  it('CoursesPage shows the backend message in the toast when a delete fails', async () => {
    vi.mocked(getCoursesPaginated).mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'Robotics EV3',
          category: 'Robotics',
          price_per_level: 500,
          sessions_per_level: 12,
          is_active: true,
        },
      ],
      total: 1,
      skip: 0,
      limit: 50,
    } as never)
    vi.mocked(deleteCourse).mockRejectedValue(
      normalizedAxiosError(403, {
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to delete this course',
      })
    )

    renderCoursesPage()

    const rowDeleteButton = await screen.findByTitle('Delete')
    fireEvent.click(rowDeleteButton)

    const confirmDialog = await screen.findByRole('alertdialog')
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Delete' }))

    const matches = await screen.findAllByText('You do not have permission to delete this course')
    expect(matches.length).toBeGreaterThan(0)
    expect(screen.queryByText(/status code/i)).not.toBeInTheDocument()

    await waitFor(() => expect(deleteCourse).toHaveBeenCalledWith(1))
  })
})
