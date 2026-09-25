import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import type { AttendanceStatus } from '../../api/attendance'
import type {
  AttendanceRecordDTO,
  SessionWithAttendanceDTO,
  StudentRosterDTO,
} from '../../api/dashboard'
import type { StudentRowData } from '../../components/attendance/types'
import { AttendanceGrid } from '../../components/attendance/AttendanceGrid'
import { AttendanceMobileSheet } from '../../components/attendance/AttendanceMobileSheet'
import { AttendanceTableBody } from '../../components/attendance/AttendanceTableBody'

const roster: StudentRosterDTO[] = [
  {
    student_id: 101,
    student_name: 'No Record',
    gender: 'male',
    billing_status: 'paid',
    balance: 0,
  },
  {
    student_id: 102,
    student_name: 'Null Status',
    gender: 'female',
    billing_status: 'paid',
    balance: 0,
  },
  {
    student_id: 103,
    student_name: 'Cancelled Status',
    gender: 'male',
    billing_status: 'paid',
    balance: 0,
  },
  {
    student_id: 104,
    student_name: 'Present Status',
    gender: 'female',
    billing_status: 'paid',
    balance: 0,
  },
]

const attendance: AttendanceRecordDTO[] = [
  {
    student_id: 102,
    student_name: 'Null Status',
    gender: 'female',
    status: null,
  },
  {
    student_id: 103,
    student_name: 'Cancelled Status',
    gender: 'male',
    status: 'cancelled',
  },
  {
    student_id: 104,
    student_name: 'Present Status',
    gender: 'female',
    status: 'present',
  },
]

const session: SessionWithAttendanceDTO = {
  session_id: 10,
  id: 10,
  session_number: 1,
  date: '2026-09-25',
  session_date: '2026-09-25',
  time_start: '10:00',
  start_time: '10:00',
  time_end: '11:00',
  end_time: '11:00',
  status: 'scheduled',
  is_extra_session: false,
  group_id: 7,
  level_number: 2,
  actual_instructor_id: null,
  instructor_name: 'Test Instructor',
  is_substitute: false,
  notes: null,
  attendance,
}

function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

function makeDesktopStudent(student: StudentRosterDTO, status?: AttendanceStatus): StudentRowData {
  const studentAttendance = new Map<number, AttendanceStatus>()
  if (status) studentAttendance.set(session.session_id, status)

  return {
    student_id: String(student.student_id),
    full_name: student.student_name,
    gender: student.gender,
    billing_status: student.billing_status,
    balance: student.balance,
    attendance: studentAttendance,
  }
}

const desktopStudents = [
  makeDesktopStudent(roster[0]),
  makeDesktopStudent(roster[1], 'not_taken'),
  makeDesktopStudent(roster[2], 'not_taken'),
  makeDesktopStudent(roster[3], 'present'),
]

function expectDesktopStatus(studentName: string, status: 'not_taken' | 'present') {
  const nameNode = screen.getByText(studentName)
  const row = nameNode.closest('tr') as HTMLElement | null
  if (!row) throw new Error(`Could not find the desktop row for ${studentName}`)

  expect(
    within(row).getByRole('button', { name: `Toggle attendance: ${status}` }),
  ).toBeInTheDocument()
}

function getMobileStatusButton(studentName: string) {
  const dialog = screen.getByRole('dialog')
  const nameNode = within(dialog).getByText(studentName)
  const row = nameNode.closest('div.flex.items-center.justify-between') as HTMLElement | null
  if (!row) throw new Error(`Could not find the mobile row for ${studentName}`)

  return within(row).getByRole('button')
}

afterEach(cleanup)

describe('missing attendance rendering', () => {
  it('renders missing, null, cancelled, and present states in the desktop table', () => {
    renderWithProviders(
      <table>
        <AttendanceTableBody
          students={desktopStudents}
          sessions={[session]}
          onToggle={vi.fn()}
        />
      </table>,
    )

    expectDesktopStatus('No Record', 'not_taken')
    expectDesktopStatus('Null Status', 'not_taken')
    expectDesktopStatus('Cancelled Status', 'not_taken')
    expectDesktopStatus('Present Status', 'present')
  })

  it('normalizes raw null and cancelled records before rendering the desktop grid', () => {
    renderWithProviders(
      <AttendanceGrid
        sessions={[session]}
        roster={roster}
        groupId={7}
        level={2}
      />,
    )

    expectDesktopStatus('No Record', 'not_taken')
    expectDesktopStatus('Null Status', 'not_taken')
    expectDesktopStatus('Cancelled Status', 'not_taken')
    expectDesktopStatus('Present Status', 'present')
  })

  it('renders the same states in the mobile attendance sheet after selecting the session', () => {
    renderWithProviders(
      <AttendanceMobileSheet
        isOpen
        groupId={7}
        groupName="Test Group"
        instructorName="Test Instructor"
        sessions={[session]}
        roster={roster}
        selectedDate={session.date}
        onClose={vi.fn()}
      />,
    )

    const dialog = screen.getByRole('dialog')
    const sessionNode = within(dialog).getByText(session.date)
    const sessionButton = sessionNode.closest('button')
    if (!sessionButton) throw new Error('Could not find the session button')
    fireEvent.click(sessionButton)

    expect(getMobileStatusButton('No Record')).toHaveTextContent('Not Taken')
    expect(getMobileStatusButton('Null Status')).toHaveTextContent('Not Taken')
    expect(getMobileStatusButton('Cancelled Status')).toHaveTextContent('Not Taken')
    expect(getMobileStatusButton('Present Status')).toHaveTextContent('Present')
  })
})
