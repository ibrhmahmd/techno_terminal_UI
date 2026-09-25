import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AttendanceGrid } from '../../components/attendance/AttendanceGrid'
import { addExtraSession, updateSession } from '../../api/academics/sessions/core'
import { getEmployees } from '../../api/hr'
import type { SessionWithAttendanceDTO, StudentRosterDTO } from '../../api/dashboard'

vi.mock('../../api/academics', () => ({
  cancelSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: vi.fn(),
  reactivateSession: vi.fn(),
}))

vi.mock('../../api/academics/sessions/core', () => ({
  addExtraSession: vi.fn(),
  updateSession: vi.fn(),
}))

vi.mock('../../api/attendance', () => ({
  markAttendance: vi.fn(),
}))

vi.mock('../../api/hr', () => ({
  getEmployees: vi.fn(),
}))

const groupId = 41
const level = 3
const selectedDate = '2026-08-29'

const sessions: SessionWithAttendanceDTO[] = [
  {
    session_id: 101,
    id: 101,
    session_number: 1,
    date: '2026-08-29',
    session_date: '2026-08-29',
    time_start: '18:00',
    start_time: '18:00',
    time_end: '20:00',
    end_time: '20:00',
    status: 'scheduled',
    is_extra_session: false,
    group_id: groupId,
    level_number: level,
    actual_instructor_id: null,
    instructor_name: null,
    is_substitute: false,
    notes: null,
    attendance: [],
  },
]

const roster: StudentRosterDTO[] = [
  {
    student_id: 1,
    student_name: 'Student One',
    gender: 'male',
    billing_status: 'paid',
    balance: 0,
  },
]

function renderGrid() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidateSpy = vi
    .spyOn(queryClient, 'invalidateQueries')
    .mockResolvedValue(undefined as never)

  render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AttendanceGrid
          sessions={sessions}
          roster={roster}
          groupId={groupId}
          level={level}
          groupName='Test Group'
          courseName='Test Course'
          selectedDate={selectedDate}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  )

  return invalidateSpy
}

function openAddSessionDialog() {
  fireEvent.click(screen.getByRole('button', { name: /add session/i }))
  return screen.getByRole('dialog')
}

beforeEach(() => {
  vi.mocked(addExtraSession).mockReset().mockResolvedValue({ id: 999 } as never)
  vi.mocked(updateSession).mockReset().mockResolvedValue(undefined as never)
  vi.mocked(getEmployees).mockReset().mockResolvedValue({
    data: [],
    total: 0,
    skip: 0,
    limit: 100,
  } as never)
})

describe('AttendanceGrid AddSessionDialog refresh', () => {
  it('invalidates group attendance and dashboard overview after a successful add', async () => {
    const invalidateSpy = renderGrid()
    const dialog = openAddSessionDialog()
    const dateInput = dialog.querySelector('#session-date') as HTMLInputElement
    const form = dialog.querySelector('form')

    expect(dateInput).not.toBeNull()
    expect(form).not.toBeNull()

    fireEvent.change(dateInput, { target: { value: '2026-09-05' } })
    fireEvent.submit(form as HTMLFormElement)

    await waitFor(() => expect(addExtraSession).toHaveBeenCalledTimes(1))
    await waitFor(() => {
      const queryKeys = invalidateSpy.mock.calls.map(([filters]) => filters.queryKey)
      expect(queryKeys).toContainEqual(['groups', groupId, 'attendance', level])
      expect(queryKeys).toContainEqual(['dashboard', 'overview', selectedDate])
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not invalidate attendance caches when the dialog is cancelled', async () => {
    const invalidateSpy = renderGrid()
    const dialog = openAddSessionDialog()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(addExtraSession).not.toHaveBeenCalled()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
