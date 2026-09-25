import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DashboardPage } from '../../pages/DashboardPage'
import { useDashboard } from '../../hooks/dashboard'

vi.mock('../../hooks/dashboard', () => ({
  useDashboard: vi.fn(),
}))

const instructors = {
  1: { name: 'Ahmed Ali' },
  2: { name: 'Mona Sami' },
  3: { name: 'TBA' },
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

function dayTabs() {
  return screen.getAllByRole('tab').filter((el) => el.closest('[aria-label]')?.getAttribute('aria-label') !== 'Filter by instructor')
}

function instructorTab(name: string | RegExp) {
  return screen
    .getAllByRole('tab')
    .find((el) => el.textContent?.trim() === name || (name instanceof RegExp && name.test(el.textContent ?? '')))!
}

function otherDayTab() {
  return dayTabs().find((tab) => tab.getAttribute('aria-selected') === 'false')!
}

beforeEach(() => {
  vi.mocked(useDashboard).mockReset().mockReturnValue({
    scheduleItems: [],
    groups: {},
    instructors,
    summary: { unique_instructor_ids: [1, 2, 3] },
    isLoading: false,
    error: null,
  } as never)
})

describe('DashboardPage instructor filter reset', () => {
  it('renders one filter tab per instructor plus an all option', () => {
    renderPage()

    expect(instructorTab('All')).toBeInTheDocument()
    expect(instructorTab('Ahmed Ali')).toBeInTheDocument()
    expect(instructorTab('Mona Sami')).toBeInTheDocument()
    // TBA is filtered out
    expect(screen.queryByRole('tab', { name: 'TBA' })).toBeNull()
  })

  it('starts with the all option selected', () => {
    renderPage()
    expect(instructorTab('All')).toHaveAttribute('aria-selected', 'true')
  })

  it('marks the picked instructor as selected', () => {
    renderPage()

    fireEvent.click(instructorTab('Ahmed Ali'))

    expect(instructorTab('Ahmed Ali')).toHaveAttribute('aria-selected', 'true')
    expect(instructorTab('All')).toHaveAttribute('aria-selected', 'false')
  })

  it('resets the instructor filter when the day changes', () => {
    renderPage()

    fireEvent.click(instructorTab('Ahmed Ali'))
    expect(instructorTab('Ahmed Ali')).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(otherDayTab())

    expect(instructorTab('All')).toHaveAttribute('aria-selected', 'true')
    expect(instructorTab('Ahmed Ali')).toHaveAttribute('aria-selected', 'false')
  })

  it('keeps the instructor filter when the already selected day is clicked again', () => {
    renderPage()

    fireEvent.click(instructorTab('Ahmed Ali'))
    const today = dayTabs().find((tab) => tab.getAttribute('aria-selected') === 'true')!
    fireEvent.click(today)

    expect(instructorTab('Ahmed Ali')).toHaveAttribute('aria-selected', 'true')
  })

  it('requests the newly selected date', () => {
    renderPage()

    const firstDate = vi.mocked(useDashboard).mock.calls[0][0]
    fireEvent.click(otherDayTab())

    const secondDate = vi.mocked(useDashboard).mock.calls.at(-1)![0]
    expect(secondDate).not.toBe(firstDate)
  })
})
