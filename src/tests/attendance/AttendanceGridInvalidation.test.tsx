import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { AttendanceGrid } from '../../components/attendance/AttendanceGrid'
import type { SessionWithAttendanceDTO } from '../../api/dashboard'
import { queryKeys } from '../../hooks/queryKeys'

const GROUP_ID = 41
const LEVEL = 3
const SESSION_ID = 501
const STUDENT_ID = 900
const SESSION_DATE = '2026-09-20'
const SELECTED_DATE = '2026-09-25'
const START_TIME = '16:00'
const END_TIME = '18:00'
const INSTRUCTOR_ID = 88
const GROUP_ATTENDANCE_KEY = queryKeys.groupAttendance(GROUP_ID, LEVEL)
const GROUP_LEVELS_KEY = queryKeys.groupLevels(GROUP_ID)
const DASHBOARD_OVERVIEW_KEY = queryKeys.dashboard.overview(SELECTED_DATE)

const mockCancelSession = vi.fn()
const mockDeleteSession = vi.fn()
const mockReactivateSession = vi.fn()
const mockUpdateSession = vi.fn()
const mockMarkAttendance = vi.fn()

vi.mock('../../api/academics', () => ({
  cancelSession: (...args: unknown[]) => mockCancelSession(...args),
  deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
  reactivateSession: (...args: unknown[]) => mockReactivateSession(...args),
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
}))

vi.mock('../../api/attendance', () => ({
  markAttendance: (...args: unknown[]) => mockMarkAttendance(...args),
}))

vi.mock('../../hooks/useEmployees', () => ({
  useEmployees: () => ({ employees: [], isLoading: false }),
}))

const roster = [
  {
    student_id: STUDENT_ID,
    student_name: 'Test Student',
    gender: 'male' as const,
    billing_status: 'paid' as const,
    balance: 0,
  },
]

function makeSession(status: 'scheduled' | 'cancelled'): SessionWithAttendanceDTO {
  return {
    session_id: SESSION_ID,
    id: SESSION_ID,
    session_number: 1,
    date: SESSION_DATE,
    session_date: SESSION_DATE,
    time_start: START_TIME,
    start_time: START_TIME,
    time_end: END_TIME,
    end_time: END_TIME,
    status,
    is_extra_session: false,
    group_id: GROUP_ID,
    level_number: LEVEL,
    actual_instructor_id: INSTRUCTOR_ID,
    instructor_name: 'Test Instructor',
    is_substitute: false,
    notes: null,
    attendance: [
      {
        student_id: STUDENT_ID,
        student_name: roster[0].student_name,
        gender: 'male',
        status: null,
      },
    ],
  }
}

async function triggerSaveAll() {
  fireEvent.click(screen.getByRole('button', { name: 'Toggle attendance: not_taken' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }))
}

interface ActionCase {
  name: string
  status: 'scheduled' | 'cancelled'
  trigger: (invalidateSpy: Mock) => Promise<void>
  apiMock: Mock
  expectedApiArgs: unknown[]
  expectedApiCalls?: number
}

const actionCases: ActionCase[] = [
  {
    name: 'cancel',
    status: 'scheduled',
    trigger: async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Cancel session' }))
      const dialog = screen.getByRole('alertdialog')
      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel Session' }))
    },
    apiMock: mockCancelSession,
    expectedApiArgs: [SESSION_ID],
  },
  {
    name: 'delete',
    status: 'scheduled',
    trigger: async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Delete session' }))
      const dialog = screen.getByRole('alertdialog')
      fireEvent.click(within(dialog).getByRole('button', { name: 'Delete Session' }))
    },
    apiMock: mockDeleteSession,
    expectedApiArgs: [SESSION_ID],
  },
  {
    name: 'reactivate',
    status: 'cancelled',
    trigger: async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Reactivate session' }))
    },
    apiMock: mockReactivateSession,
    expectedApiArgs: [SESSION_ID],
  },
  {
    name: 'complete',
    status: 'scheduled',
    trigger: async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Mark session as completed' }))
    },
    apiMock: mockUpdateSession,
    expectedApiArgs: [SESSION_ID, { status: 'completed' }],
  },
  {
    name: 'edit-save',
    status: 'scheduled',
    trigger: async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Edit session details' }))
      const dialog = screen.getByRole('dialog', { name: 'Edit Session' })
      fireEvent.click(within(dialog).getByRole('button', { name: 'Save Changes' }))
    },
    apiMock: mockUpdateSession,
    expectedApiArgs: [
      SESSION_ID,
      {
        session_date: SESSION_DATE,
        start_time: START_TIME,
        end_time: END_TIME,
        actual_instructor_id: INSTRUCTOR_ID,
        is_substitute: false,
        status: 'scheduled',
        notes: '',
      },
    ],
  },
  {
    name: 'save-all',
    status: 'scheduled',
    trigger: async () => {
      await triggerSaveAll()
    },
    apiMock: mockMarkAttendance,
    expectedApiArgs: [
      SESSION_ID,
      [{ student_id: String(STUDENT_ID), status: 'present' }],
    ],
  },
  {
    name: 'retry',
    status: 'scheduled',
    trigger: async (invalidateSpy) => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockMarkAttendance.mockRejectedValueOnce(new Error('Initial save failed'))

      try {
        await triggerSaveAll()
        await screen.findByRole('button', { name: `Session ${SESSION_ID}` })
        await waitFor(() => {
          expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: GROUP_ATTENDANCE_KEY,
          })
        })
        invalidateSpy.mockClear()
        fireEvent.click(screen.getByRole('button', { name: `Session ${SESSION_ID}` }))
      } finally {
        consoleErrorSpy.mockRestore()
      }
    },
    apiMock: mockMarkAttendance,
    expectedApiArgs: [
      SESSION_ID,
      [{ student_id: String(STUDENT_ID), status: 'present' }],
    ],
    expectedApiCalls: 2,
  },
]

const contextCases = [
  { name: 'group-detail', selectedDate: undefined },
  { name: 'dashboard', selectedDate: SELECTED_DATE },
]

describe('AttendanceGrid session cache invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCancelSession.mockResolvedValue(undefined)
    mockDeleteSession.mockResolvedValue(undefined)
    mockReactivateSession.mockResolvedValue(undefined)
    mockUpdateSession.mockResolvedValue(undefined)
    mockMarkAttendance.mockResolvedValue(undefined)
  })

  describe.each(contextCases)('$name context', ({ selectedDate }) => {
    it.each(actionCases)('$name invalidates every attendance-grid cache', async ({
      status,
      trigger,
      apiMock,
      expectedApiArgs,
      expectedApiCalls = 1,
    }) => {
      const sessions = [makeSession(status)]
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      })
      const invalidateSpy = vi
        .spyOn(queryClient, 'invalidateQueries')
        .mockResolvedValue(undefined as never)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <AttendanceGrid
              sessions={sessions}
              roster={roster}
              groupId={GROUP_ID}
              level={LEVEL}
              selectedDate={selectedDate}
            />
          </MemoryRouter>
        </QueryClientProvider>
      )

      invalidateSpy.mockClear()
      await trigger(invalidateSpy as Mock)

      const requiredKeys: QueryKey[] = [GROUP_ATTENDANCE_KEY, GROUP_LEVELS_KEY]
      if (selectedDate) {
        requiredKeys.push(DASHBOARD_OVERVIEW_KEY)
      }

      await waitFor(() => {
        requiredKeys.forEach((queryKey) => {
          expect(invalidateSpy).toHaveBeenCalledWith({ queryKey })
        })
        expect(apiMock).toHaveBeenCalledTimes(expectedApiCalls)
      })
      expect(apiMock).toHaveBeenLastCalledWith(...expectedApiArgs)
    })
  })
})
